/**
 * Payment task lifecycle for the embedded trust plane.
 *
 * Port of the control-plane `PaymentTask` service: creation validates the
 * requester DID and its business domain, transitions follow the Python state
 * machine and every write is guarded by an idempotency key. Amounts are stored
 * as numbers and serialized with eight decimal places, matching the Decimal
 * columns of the old database.
 */
import { domainFromDid, fail, newId } from './core.js'

export const TASK_STATUSES = Object.freeze([
  'CREATED',
  'AUTHORIZED',
  'DELEGATING',
  'QUOTING',
  'SELECTED',
  'PAYREQ_PENDING',
  'SUBMITTED',
  'CONFIRMED',
  'AUDITED',
  'CLOSED',
  'FAILED',
  'BLOCKED',
  'DEFERRED',
  'THROTTLED',
  'PENDING_STEP_UP',
  'CANCELLED',
])

/** Allowed target statuses per current status (service.transition_task). */
export const TASK_TRANSITIONS = Object.freeze({
  CREATED: Object.freeze(['AUTHORIZED', 'CANCELLED', 'FAILED']),
  AUTHORIZED: Object.freeze(['DELEGATING', 'QUOTING', 'CANCELLED', 'FAILED']),
  DELEGATING: Object.freeze(['QUOTING', 'CANCELLED', 'FAILED']),
  QUOTING: Object.freeze(['SELECTED', 'CANCELLED', 'FAILED', 'DEFERRED']),
  SELECTED: Object.freeze(['PAYREQ_PENDING', 'CANCELLED', 'FAILED', 'DEFERRED']),
  PAYREQ_PENDING: Object.freeze(['SUBMITTED', 'BLOCKED', 'DEFERRED', 'FAILED']),
  SUBMITTED: Object.freeze(['CONFIRMED', 'FAILED', 'DEFERRED']),
  CONFIRMED: Object.freeze(['AUDITED', 'FAILED']),
  AUDITED: Object.freeze(['CLOSED', 'FAILED']),
  DEFERRED: Object.freeze(['AUTHORIZED', 'PAYREQ_PENDING', 'CANCELLED', 'FAILED']),
  BLOCKED: Object.freeze(['AUTHORIZED', 'CANCELLED', 'FAILED']),
  THROTTLED: Object.freeze([]),
  PENDING_STEP_UP: Object.freeze([]),
  FAILED: Object.freeze([]),
  CANCELLED: Object.freeze([]),
  CLOSED: Object.freeze([]),
})

const LIMIT_DEFAULT = 50
const LIMIT_MAX = 200

/* ------------------------------------------------------------------ */
/* local primitives (core.js only; no engine module imports)           */
/* ------------------------------------------------------------------ */

function valuesOf(collection) {
  return collection && typeof collection === 'object' ? Object.values(collection) : []
}

function normalizeOptions(options) {
  if (!options) return {}
  return typeof options === 'string' ? { idempotencyKey: options } : options
}

function actorOf(engine, options) {
  const opts = normalizeOptions(options)
  const actor = opts.actor ?? opts.actor_did ?? opts.actorDid
  return actor ? String(actor) : engine.defaultActor()
}

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.trim())
    return Number.isFinite(parsed) ? parsed : null
  }
  if (value && typeof value === 'object' && typeof value.toString === 'function') {
    const text = value.toString()
    if (text && text !== '[object Object]') {
      const parsed = Number(text)
      return Number.isFinite(parsed) ? parsed : null
    }
  }
  return null
}

export function amountString(value) {
  const number = toNumber(value)
  return (number === null ? 0 : number).toFixed(8)
}

/**
 * Find a verified FINAL settlement proof for one task.
 *
 * CLOSED is a claim that value has moved, so closing is guarded: a FINAL SETTLE
 * event must exist and its verification must have reached VALID. Missing
 * events, unverified events and UNKNOWN/INVALID verifications all fail closed.
 */
function settlementProof(engine, taskId) {
  const events = valuesOf(engine.state.events).filter((event) => {
    return (
      String(event.task_id) === String(taskId) &&
      String(event.event_type || '').toUpperCase() === 'SETTLE' &&
      String(event.finality || '').toUpperCase() === 'FINAL'
    )
  })
  const verifications =
    engine.state.verifications && typeof engine.state.verifications === 'object' ? engine.state.verifications : {}
  for (const event of events) {
    const verification = verifications[event.id]
    if (verification && String(verification.overall_status || '').toUpperCase() === 'VALID') {
      return {
        event_id: event.id,
        ledger_status: verification.ledger_status,
        verified_at: verification.updated_at ?? verification.created_at ?? null,
      }
    }
  }
  return null
}

function clampLimit(value, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(1, Math.min(Math.trunc(number), LIMIT_MAX))
}

function failValidation(message) {
  fail('VALIDATION_ERROR', message, { status: 422 })
}

function requestHashPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload
  const next = { ...payload }
  delete next.idempotency_key
  delete next.idempotencyKey
  return next
}

function idempotencyKey(engine, scope, body, options, actor, fallback) {
  const opts = normalizeOptions(options)
  const header = opts.idempotencyKey ?? opts.idempotency_key ?? opts.key
  const bodyKey = body && typeof body === 'object' ? body.idempotency_key ?? body.idempotencyKey : undefined
  if (header !== undefined && header !== null && bodyKey !== undefined && bodyKey !== null && String(header) !== String(bodyKey)) {
    fail('IDEMPOTENCY_KEY_CONFLICT', 'Idempotency-Key does not match the request body idempotency_key', { status: 409 })
  }
  const explicit = header || bodyKey
  if (explicit) return `${scope}:${String(explicit)}`
  if (fallback) return `${scope}:${fallback}`
  return `${scope}:auto:${engine.hash(requestHashPayload(body), { actor })}`
}

function requireActiveDid(engine, did) {
  const identity = engine.state.identities ? engine.state.identities[did] : null
  if (!identity) fail('DID_NOT_FOUND', `DID not found: ${did}`, { status: 404 })
  if (String(identity.status || '').toUpperCase() !== 'ACTIVE') {
    fail('DID_INACTIVE', `DID is not active: ${did}`, { status: 409 })
  }
  return identity
}

function requireClaimedActor(engine, actor, claimed, message) {
  if (String(actor || '').startsWith('system:')) return null
  if (claimed !== undefined && claimed !== null && claimed !== '' && String(claimed) !== String(actor)) {
    fail('ACTOR_MISMATCH', message, { status: 403 })
  }
  return requireActiveDid(engine, String(actor))
}

function actorDomain(engine, actor) {
  const did = String(actor || '')
  if (did.startsWith('system:')) return null
  const identity = engine.state.identities ? engine.state.identities[did] : null
  if (!identity || String(identity.status || '').toUpperCase() !== 'ACTIVE') {
    fail('ACTOR_NOT_FOUND', `actor ${did} is missing or inactive`, { status: 403 })
  }
  return identity.domain_id || domainFromDid(did)
}

function requireTaskAccess(engine, task, actor) {
  const domain = actorDomain(engine, actor)
  if (domain !== null && String(domain) !== String(task.domain_id)) {
    fail('ACCESS_DENIED', 'task belongs to a different domain', { status: 403 })
  }
}

/* ------------------------------------------------------------------ */
/* request normalization                                               */
/* ------------------------------------------------------------------ */

function normalizeTaskCreate(engine, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) failValidation('task create request must be an object')
  const domainId = payload.domain_id ?? payload.domainId
  if (typeof domainId !== 'string' || domainId.trim() === '' || domainId.length > 120) failValidation('domain_id is required (1-120 characters)')
  const requesterDid = payload.requester_did ?? payload.requesterDid
  if (typeof requesterDid !== 'string' || requesterDid.trim() === '' || requesterDid.length > 300) failValidation('requester_did is required')
  const assetId = payload.asset_id ?? payload.assetId
  if (typeof assetId !== 'string' || assetId.trim() === '' || assetId.length > 120) failValidation('asset_id is required (1-120 characters)')
  const amount = toNumber(payload.amount)
  if (amount === null || amount <= 0) failValidation('amount must be a positive decimal')
  const beneficiary = payload.beneficiary
  if (typeof beneficiary !== 'string' || beneficiary.trim().length < 2 || beneficiary.length > 250) failValidation('beneficiary must be a string of 2-250 characters')
  const requestedPolicy = payload.policy_version ?? payload.policyVersion
  const policyVersion = requestedPolicy === undefined || requestedPolicy === null ? engine.policy.policyVersion : String(requestedPolicy)
  if (policyVersion.length < 3 || policyVersion.length > 120) failValidation('policy_version must be a string of 3-120 characters')
  const metadata = payload.metadata === undefined || payload.metadata === null ? {} : payload.metadata
  if (typeof metadata !== 'object' || Array.isArray(metadata)) failValidation('metadata must be an object')
  return {
    domain_id: domainId.trim(),
    requester_did: requesterDid.trim(),
    asset_id: assetId.trim(),
    amount,
    beneficiary: beneficiary.trim(),
    policy_version: policyVersion,
    metadata,
  }
}

function normalizeTransition(engine, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) failValidation('task transition request must be an object')
  const status = String(payload.status ?? '').trim().toUpperCase()
  if (!TASK_STATUSES.includes(status)) failValidation(`status must be one of ${TASK_STATUSES.join(', ')}`)
  const reason = payload.reason
  if (typeof reason !== 'string' || reason.trim().length < 3 || reason.length > 1000) failValidation('reason must be a string of 3-1000 characters')
  return { status, reason: reason.trim() }
}

/* ------------------------------------------------------------------ */
/* responses                                                           */
/* ------------------------------------------------------------------ */

function paymentTaskResponse(task) {
  return {
    id: task.id,
    domain_id: task.domain_id,
    requester_did: task.requester_did,
    asset_id: task.asset_id,
    amount: amountString(task.amount),
    beneficiary: task.beneficiary,
    status: task.status,
    policy_version: task.policy_version,
    metadata: task.metadata ?? task.metadata_json ?? {},
    created_at: task.created_at,
    updated_at: task.updated_at,
  }
}

/* ------------------------------------------------------------------ */
/* engine                                                              */
/* ------------------------------------------------------------------ */

/**
 * @param {import('./core.js').Engine} engine
 */
export function createTaskEngine(engine) {
  if (!engine) throw new TypeError('createTaskEngine requires an Engine instance')

  function create(payload = {}, options = {}) {
    const actor = actorOf(engine, options)
    const body = normalizeTaskCreate(engine, payload)
    requireClaimedActor(engine, actor, body.requester_did, '任务请求方 DID 必须与调用方 DID 一致')
    const key = idempotencyKey(engine, 'tasks.create', payload, options, actor)
    const hashPayload = requestHashPayload(body)
    return engine.idempotent(key, hashPayload, () => {
      const requester = requireActiveDid(engine, body.requester_did)
      const requesterDomain = requester.domain_id || domainFromDid(body.requester_did)
      if (String(requesterDomain) !== body.domain_id) {
        fail('REQUESTER_DOMAIN_MISMATCH', '请求方 DID 不属于任务业务域', { status: 403 })
      }
      const now = engine.iso()
      const task = {
        id: newId('task'),
        domain_id: body.domain_id,
        requester_did: body.requester_did,
        asset_id: body.asset_id,
        amount: body.amount,
        beneficiary: body.beneficiary,
        status: 'CREATED',
        policy_version: body.policy_version,
        metadata: body.metadata,
        idempotency_key: key,
        created_at: now,
        updated_at: now,
      }
      engine.collection('tasks')[task.id] = task
      engine.audit('task.create', actor, 'task', task.id, {
        domain_id: task.domain_id,
        status: task.status,
        idempotency_key: key,
        request_hash: engine.hash(hashPayload, { actor }),
      })
      engine.save()
      return paymentTaskResponse(task)
    })
  }

  function get(id, options = {}) {
    const task = engine.state.tasks ? engine.state.tasks[id] : null
    if (!task) fail('TASK_NOT_FOUND', `task not found: ${id}`, { status: 404 })
    requireTaskAccess(engine, task, actorOf(engine, options))
    return paymentTaskResponse(task)
  }

  function list(query = {}) {
    const actor = actorOf(engine, query)
    const limit = clampLimit(query.limit, LIMIT_DEFAULT)
    const domain = actorDomain(engine, actor)
    let tasks = valuesOf(engine.state.tasks)
    if (domain !== null) tasks = tasks.filter((task) => String(task.domain_id) === String(domain))
    tasks.sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || '')))
    return tasks.slice(0, limit).map(paymentTaskResponse)
  }

  function transition(id, payload = {}, options = {}) {
    const actor = actorOf(engine, options)
    const task = engine.state.tasks ? engine.state.tasks[id] : null
    if (!task) fail('TASK_NOT_FOUND', `task not found: ${id}`, { status: 404 })
    requireTaskAccess(engine, task, actor)
    const body = normalizeTransition(engine, payload)
    const key = idempotencyKey(engine, 'tasks.transition', payload, options, actor)
    const hashPayload = { task_id: task.id, status: body.status, reason: body.reason }
    return engine.idempotent(key, hashPayload, () => {
      const current = engine.state.tasks[task.id]
      const fromStatus = String(current.status || '').toUpperCase()
      const allowed = TASK_TRANSITIONS[fromStatus] || []
      if (body.status !== fromStatus && !allowed.includes(body.status)) {
        fail('INVALID_TASK_TRANSITION', `任务不能从 ${fromStatus} 转为 ${body.status}`, { status: 409 })
      }
      if (body.status === 'CLOSED' && fromStatus !== 'CLOSED') {
        const proof = settlementProof(engine, current.id)
        if (!proof) {
          fail('SETTLEMENT_NOT_PROVEN', '任务只有在已签名的 FINAL 结算事件通过校验后才能关闭', { status: 409 })
        }
      }
      current.status = body.status
      current.updated_at = engine.iso()
      engine.audit('task.transition', actor, 'task', current.id, {
        from_status: fromStatus,
        to_status: body.status,
        reason: body.reason,
        idempotency_key: key,
      })
      engine.save()
      return paymentTaskResponse(current)
    })
  }

  return { create, get, list, transition }
}
