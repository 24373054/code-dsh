/**
 * Intervention decisions and execution receipts for the embedded trust plane.
 *
 * Ported from the control-plane `decide_intervention` / `execute_intervention`
 * services. Execution is gated by `engine.settings.allowInterventionExecution`;
 * the embedded target never reserves or moves real funds, so `amount_reserved`
 * is always zero and no quota store is involved.
 */
import { domainFromDid, fail, newId, sha256Hex } from './core.js'

export const INTERVENTION_ACTIONS = Object.freeze(['ALLOW', 'WARN', 'THROTTLE', 'STEP_UP', 'DEFER', 'BLOCK', 'FREEZE'])

/** Action -> task status applied by the execution boundary. */
export const APPLIED_STATES = Object.freeze({
  ALLOW: 'AUTHORIZED',
  WARN: 'AUTHORIZED',
  THROTTLE: 'THROTTLED',
  STEP_UP: 'PENDING_STEP_UP',
  DEFER: 'DEFERRED',
  BLOCK: 'BLOCKED',
  FREEZE: 'BLOCKED',
})

/** Execution boundaries are wider than the operator task transitions. */
export const EXECUTION_TRANSITIONS = Object.freeze({
  CREATED: Object.freeze(['AUTHORIZED', 'DELEGATING', 'QUOTING', 'BLOCKED', 'DEFERRED', 'FAILED', 'CANCELLED', 'THROTTLED', 'PENDING_STEP_UP']),
  AUTHORIZED: Object.freeze(['DELEGATING', 'QUOTING', 'BLOCKED', 'DEFERRED', 'FAILED', 'CANCELLED', 'THROTTLED', 'PENDING_STEP_UP']),
  DELEGATING: Object.freeze(['QUOTING', 'BLOCKED', 'DEFERRED', 'FAILED', 'CANCELLED', 'THROTTLED', 'PENDING_STEP_UP', 'AUTHORIZED']),
  QUOTING: Object.freeze(['SELECTED', 'BLOCKED', 'DEFERRED', 'FAILED', 'CANCELLED', 'THROTTLED', 'PENDING_STEP_UP', 'AUTHORIZED']),
  SELECTED: Object.freeze(['PAYREQ_PENDING', 'BLOCKED', 'DEFERRED', 'FAILED', 'CANCELLED', 'THROTTLED', 'PENDING_STEP_UP', 'AUTHORIZED']),
  PAYREQ_PENDING: Object.freeze(['SUBMITTED', 'BLOCKED', 'DEFERRED', 'FAILED', 'THROTTLED', 'PENDING_STEP_UP', 'AUTHORIZED']),
  SUBMITTED: Object.freeze(['CONFIRMED', 'FAILED', 'DEFERRED', 'BLOCKED']),
  CONFIRMED: Object.freeze(['AUDITED', 'FAILED']),
  AUDITED: Object.freeze(['CLOSED', 'FAILED']),
  DEFERRED: Object.freeze(['AUTHORIZED', 'PAYREQ_PENDING', 'CANCELLED', 'FAILED', 'BLOCKED', 'THROTTLED', 'PENDING_STEP_UP']),
  THROTTLED: Object.freeze(['AUTHORIZED', 'PAYREQ_PENDING', 'DEFERRED', 'BLOCKED', 'FAILED', 'CANCELLED']),
  PENDING_STEP_UP: Object.freeze(['AUTHORIZED', 'DEFERRED', 'BLOCKED', 'FAILED', 'CANCELLED']),
  BLOCKED: Object.freeze(['AUTHORIZED', 'CANCELLED', 'FAILED']),
  FAILED: Object.freeze([]),
  CANCELLED: Object.freeze([]),
  CLOSED: Object.freeze([]),
})

const TARGET_SYSTEM = 'embedded-engine'
const LIMIT_DEFAULT = 100
const LIMIT_MAX = 200
const LOW_ACTIONS = new Set(['ALLOW', 'WARN', 'THROTTLE'])

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
  return null
}

function amountString(value) {
  const number = toNumber(value)
  return (number === null ? 0 : number).toFixed(8)
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
/* normalization / responses                                           */
/* ------------------------------------------------------------------ */

function rationaleHasReasons(rationale) {
  const reasons = rationale.reasons ?? rationale.decision_reasons
  if (Array.isArray(reasons) && reasons.some((item) => typeof item === 'string' && item.trim() !== '')) return true
  if (typeof rationale.reason === 'string' && rationale.reason.trim() !== '') return true
  return false
}

function normalizeDecide(engine, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) failValidation('intervention decide request must be an object')
  if (typeof payload.task_id !== 'string' || payload.task_id.trim() === '') failValidation('task_id is required')
  const action = String(payload.action ?? '').trim().toUpperCase()
  if (!INTERVENTION_ACTIONS.includes(action)) failValidation(`action must be one of ${INTERVENTION_ACTIONS.join(', ')}`)
  const rationale = payload.rationale === undefined || payload.rationale === null ? {} : payload.rationale
  if (typeof rationale !== 'object' || Array.isArray(rationale)) failValidation('rationale must be an object')
  if ((action === 'DEFER' || action === 'BLOCK') && !rationaleHasReasons(rationale)) {
    failValidation('DEFER and BLOCK decisions require reasons (rationale.reasons or rationale.reason)')
  }
  const eventId = payload.event_id === undefined || payload.event_id === null ? null : String(payload.event_id)
  const requestedPolicy = payload.policy_version ?? payload.policyVersion
  const policyVersion = requestedPolicy === undefined || requestedPolicy === null ? engine.policy.policyVersion : String(requestedPolicy)
  if (policyVersion.length < 3 || policyVersion.length > 120) failValidation('policy_version must be a string of 3-120 characters')
  return {
    task_id: payload.task_id.trim(),
    event_id: eventId,
    action,
    rationale,
    policy_version: policyVersion,
  }
}

function interventionResponse(record) {
  return {
    id: record.id,
    task_id: record.task_id,
    event_id: record.event_id ?? null,
    action: record.action,
    rationale: record.rationale,
    policy_version: record.policy_version,
    status: record.status,
    created_at: record.created_at,
  }
}

function receiptResponse(receipt) {
  return {
    id: receipt.id,
    decision_id: receipt.decision_id,
    task_id: receipt.task_id,
    action: receipt.action,
    status: receipt.status,
    external_ref: receipt.external_ref,
    amount_reserved: amountString(receipt.amount_reserved),
    details: receipt.details,
    target_system: receipt.target_system ?? null,
    operation_id: receipt.operation_id ?? null,
    applied_at: receipt.applied_at ?? null,
    applied_state: receipt.applied_state ?? null,
    target_tx_hash: receipt.target_tx_hash ?? null,
    error_code: receipt.error_code ?? null,
    signature: receipt.signature ?? null,
    quota_key: receipt.quota_key ?? null,
    created_at: receipt.created_at,
  }
}

/* ------------------------------------------------------------------ */
/* engine                                                              */
/* ------------------------------------------------------------------ */

/**
 * @param {import('./core.js').Engine} engine
 */
export function createInterventionEngine(engine) {
  if (!engine) throw new TypeError('createInterventionEngine requires an Engine instance')

  function decide(payload = {}, options = {}) {
    const actor = actorOf(engine, options)
    const body = normalizeDecide(engine, payload)
    const key = idempotencyKey(engine, 'interventions.decide', payload, options, actor)
    const hashPayload = requestHashPayload(body)
    return engine.idempotent(key, hashPayload, () => {
      const task = engine.state.tasks ? engine.state.tasks[body.task_id] : null
      if (!task) fail('TASK_NOT_FOUND', `task not found: ${body.task_id}`, { status: 404 })
      requireTaskAccess(engine, task, actor)
      let verification = null
      if (body.event_id) {
        const event = engine.state.events ? engine.state.events[body.event_id] : null
        if (!event || event.task_id !== task.id) fail('EVENT_TASK_MISMATCH', '干预事件不属于当前任务', { status: 409 })
        verification = engine.state.verifications ? engine.state.verifications[body.event_id] : null
      }
      let effectiveAction = body.action
      const decisionReasons = []
      if (verification) {
        const overall = String(verification.overall_status || '').toUpperCase()
        if (overall === 'INVALID') {
          effectiveAction = 'BLOCK'
          decisionReasons.push('身份、授权或账本校验确定无效')
        } else if (overall === 'UNKNOWN' && LOW_ACTIONS.has(effectiveAction)) {
          effectiveAction = 'DEFER'
          decisionReasons.push('必要证明暂不可达')
        }
      }
      const riskReference = body.rationale.evidence_id ?? body.rationale.risk_evidence
      const riskRecord = riskReference && engine.state.risk_evidence ? engine.state.risk_evidence[riskReference] : null
      if (riskRecord && LOW_ACTIONS.has(effectiveAction)) {
        const feature = riskRecord.feature && typeof riskRecord.feature === 'object' ? riskRecord.feature : {}
        const evaluationStatus = feature._evaluation_status ?? riskRecord.evaluation_status
        if (String(evaluationStatus || '').toUpperCase() === 'NOT_EVALUABLE') {
          effectiveAction = 'DEFER'
          decisionReasons.push('风险证据不足以完成当前判断')
        }
      }
      const mergedRationale = {
        ...body.rationale,
        requested_action: body.action,
        effective_action: effectiveAction,
        decision_reasons: decisionReasons,
        opa: {},
      }
      const record = {
        id: newId('dec'),
        task_id: task.id,
        event_id: body.event_id,
        action: effectiveAction,
        rationale: mergedRationale,
        policy_version: body.policy_version,
        status: 'DECIDED',
        idempotency_key: key,
        created_at: engine.iso(),
      }
      engine.collection('interventions')[record.id] = record
      engine.audit('intervention.decide', actor, 'intervention', record.id, {
        task_id: task.id,
        requested_action: body.action,
        effective_action: effectiveAction,
        decision_reasons: decisionReasons,
        idempotency_key: key,
      })
      engine.save()
      return interventionResponse(record)
    })
  }

  function get(decisionId, options = {}) {
    const record = engine.state.interventions ? engine.state.interventions[decisionId] : null
    if (!record) fail('DECISION_NOT_FOUND', `intervention decision not found: ${decisionId}`, { status: 404 })
    const task = engine.state.tasks ? engine.state.tasks[record.task_id] : null
    if (task) requireTaskAccess(engine, task, actorOf(engine, options))
    return interventionResponse(record)
  }

  function list(query = {}) {
    const actor = actorOf(engine, query)
    const limit = clampLimit(query.limit, LIMIT_DEFAULT)
    const domain = actorDomain(engine, actor)
    let records = valuesOf(engine.state.interventions)
    if (domain !== null) {
      records = records.filter((record) => {
        const task = engine.state.tasks ? engine.state.tasks[record.task_id] : null
        return task && String(task.domain_id) === String(domain)
      })
    }
    records.sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || '')))
    return records.slice(0, limit).map(interventionResponse)
  }

  function execute(decisionId, options = {}) {
    if (!engine.settings.allowInterventionExecution) {
      fail('EXECUTION_GATE_DISABLED', 'intervention execution is disabled (settings.allowInterventionExecution=false)', { status: 403 })
    }
    const decision = engine.state.interventions ? engine.state.interventions[decisionId] : null
    if (!decision) fail('DECISION_NOT_FOUND', `intervention decision not found: ${decisionId}`, { status: 404 })
    const actor = actorOf(engine, options)
    const task = engine.state.tasks ? engine.state.tasks[decision.task_id] : null
    if (!task) fail('TASK_NOT_FOUND', `task not found: ${decision.task_id}`, { status: 404 })
    requireTaskAccess(engine, task, actor)
    const existing = engine.state.receipts ? engine.state.receipts[decisionId] : null
    if (existing) return receiptResponse(existing)
    const key = idempotencyKey(engine, 'interventions.execute', {}, options, actor, `legacy-execute-${decisionId}`)
    return engine.idempotent(key, { decision_id: decisionId }, () => executeNow(decisionId, actor))
  }

  function executeNow(decisionId, actor) {
    const decision = engine.state.interventions[decisionId]
    const task = engine.state.tasks[decision.task_id]
    const appliedState = APPLIED_STATES[String(decision.action || '').toUpperCase()] || 'DEFERRED'
    const currentStatus = String(task.status || '').toUpperCase()
    const allowed = EXECUTION_TRANSITIONS[currentStatus] || []
    if (appliedState !== currentStatus && !allowed.includes(appliedState)) {
      fail('TASK_STATE_TRANSITION_INVALID', `执行回执不能将任务从 ${currentStatus} 转为 ${appliedState}`, { status: 409 })
    }
    const appliedAt = engine.iso()
    const externalRef = `embedded:${sha256Hex({ decision_id: decision.id, task_id: task.id, action: decision.action })}`
    const amountReserved = '0.00000000'
    const signature = `sha256:${sha256Hex({
      decision_id: decision.id,
      task_id: task.id,
      action: decision.action,
      external_ref: externalRef,
      amount_reserved: amountReserved,
      applied_state: appliedState,
      applied_at: appliedAt,
    })}`
    const operationId = decision.event_id || decision.id
    const receipt = {
      id: newId('rcpt'),
      decision_id: decision.id,
      task_id: task.id,
      action: decision.action,
      status: 'APPLIED',
      external_ref: externalRef,
      amount_reserved: 0,
      details: {
        deterministic: true,
        policy_version: decision.policy_version,
        applied_state: appliedState,
        transfer_id: null,
        applied_at: appliedAt,
        target_system: TARGET_SYSTEM,
        operation_id: operationId,
        target_tx_hash: externalRef,
        signature_algorithm: 'SHA-256/Ed25519-boundary',
        quota_key: null,
        quota_reservation_id: null,
      },
      target_system: TARGET_SYSTEM,
      operation_id: operationId,
      applied_at: appliedAt,
      applied_state: appliedState,
      target_tx_hash: externalRef,
      error_code: null,
      signature,
      quota_key: null,
      quota_reservation_id: null,
      created_at: appliedAt,
    }
    task.status = appliedState
    task.updated_at = appliedAt
    decision.status = 'EXECUTED'
    decision.updated_at = appliedAt
    engine.state.receipts[decision.id] = receipt
    engine.audit('intervention.execute', actor, 'receipt', receipt.id, {
      decision_id: decision.id,
      status: receipt.status,
      applied_state: appliedState,
      idempotency_key: receipt.idempotency_key,
    })
    engine.save()
    return receiptResponse(receipt)
  }

  function receipts(query = {}) {
    const actor = actorOf(engine, query)
    const limit = clampLimit(query.limit, LIMIT_DEFAULT)
    const domain = actorDomain(engine, actor)
    let records = valuesOf(engine.state.receipts)
    if (domain !== null) {
      records = records.filter((receipt) => {
        const task = engine.state.tasks ? engine.state.tasks[receipt.task_id] : null
        return task && String(task.domain_id) === String(domain)
      })
    }
    records.sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || '')))
    return records.slice(0, limit).map(receiptResponse)
  }

  return { decide, get, list, execute, receipts }
}
