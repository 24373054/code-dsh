/**
 * Operation event ingestion and verification for the embedded trust plane.
 *
 * Ported from the control-plane `OperationEvent` service. The module keeps the
 * old signing payload (so Ed25519 proofs produced for the Python service stay
 * verifiable), the same enums/finality rules and the same invariant checks.
 *
 * Verification never silently allows an event: an unsigned dev event, an
 * unknown DID or a missing delegation always produces UNKNOWN/INVALID statuses.
 */
import { POLICY_VERSION, domainFromDid, fail, newId, nowIso, sha256Hex, sm3Hex, verifySignature } from './core.js'

export const EVENT_TYPES = Object.freeze(['DELEGATE', 'QUOTE', 'SELECT', 'PAYREQ', 'RESULT', 'BRIDGE', 'SETTLE'])
export const EVENT_FINALITIES = Object.freeze(['OBSERVED', 'CONFIRMED', 'FINAL'])
export const EVENT_SCHEMA_VERSION = 'operation-event.v1'

const FINALITY_RANK = { OBSERVED: 0, CONFIRMED: 1, FINAL: 2 }
const SIGNATURE_ALGORITHMS = new Set(['ED25519', 'ED25519SIGNATURE2020'])
const AMOUNT_EVENT_TYPES = new Set(['QUOTE', 'SELECT', 'PAYREQ', 'RESULT', 'SETTLE'])
const AMOUNT_FORMAT_TYPES = new Set(['PAYREQ', 'RESULT', 'SETTLE'])
// The embedded trust plane is a development sandbox: unsigned events are
// accepted but can only ever verify as UNKNOWN, never VALID.
const DEV_ALLOW_UNSIGNED_EVENTS = true
const LIMIT_DEFAULT = 100
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
/* time helpers                                                        */
/* ------------------------------------------------------------------ */

function parseTimeValue(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'number') {
    const fromNumber = new Date(value)
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const text = value.trim()
    const normalized = /Z$/i.test(text) || /[+-]\d{2}:?\d{2}$/.test(text) ? text : `${text}Z`
    const parsed = new Date(normalized)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

function hasTimezone(value) {
  if (value instanceof Date) return true
  if (typeof value !== 'string') return false
  const text = value.trim()
  return /Z$/i.test(text) || /[+-]\d{2}:?\d{2}$/.test(text)
}

/** Python `datetime.isoformat()` style aware UTC string (`+00:00`). */
function awareIso(value) {
  const parsed = parseTimeValue(value)
  if (!parsed) return value === undefined ? null : value
  return parsed.toISOString().replace(/\.000Z$/, 'Z').replace('Z', '+00:00')
}

function storedObservedAt(value) {
  const parsed = parseTimeValue(value)
  return parsed ? parsed.toISOString() : null
}

function storedNaiveTime(value) {
  const parsed = parseTimeValue(value)
  if (!parsed) return null
  const iso = parsed.toISOString()
  // Keep the stored instant precise to the millisecond so a signature built
  // over the request body reproduces the exact same signing payload later.
  return /\.000Z$/.test(iso) ? iso.slice(0, 19) : iso.slice(0, 23)
}

function utcDayKey(value) {
  const parsed = parseTimeValue(value)
  return parsed ? parsed.toISOString().slice(0, 10) : null
}

/* ------------------------------------------------------------------ */
/* signing payload (exported helper)                                   */
/* ------------------------------------------------------------------ */

/**
 * The exact object that is signed for an operation event. Mirrors the Python
 * `event_signing_payload` helper, including the aware UTC timestamps.
 *
 * @param {object} event stored event record or create request body
 */
export function eventSigningPayload(event = {}) {
  const finality = String(event.finality || 'OBSERVED').toUpperCase()
  const status = event.status ? String(event.status).toUpperCase() : finality
  const observedAt = event.observed_at ?? event.observedAt
  const eventTime = event.event_time ?? event.eventTime
  return {
    event_id: event.event_id ?? event.id ?? null,
    task_id: event.task_id,
    event_type: event.event_type,
    actor_did: event.actor_did,
    payload: event.payload && typeof event.payload === 'object' && !Array.isArray(event.payload) ? event.payload : {},
    source_ref: event.source_ref,
    observed_at: awareIso(observedAt ?? new Date()),
    event_time: awareIso(eventTime ?? observedAt ?? new Date()),
    finality,
    status,
    schema_version: event.schema_version || EVENT_SCHEMA_VERSION,
    trace_id: event.trace_id ?? null,
    counterparty_did: event.counterparty_did ?? null,
    predecessors: Array.isArray(event.predecessors) ? event.predecessors : [],
    evidence_refs: Array.isArray(event.evidence_refs) ? event.evidence_refs : [],
    source_ledger: event.source_ledger && typeof event.source_ledger === 'object' && !Array.isArray(event.source_ledger) ? event.source_ledger : {},
    policy_version: event.policy_version || POLICY_VERSION,
  }
}

/** Legacy signing payload accepted by the Python dev setting. */
function legacySigningPayload(event) {
  const full = eventSigningPayload(event)
  return {
    event_id: full.event_id,
    task_id: full.task_id,
    event_type: full.event_type,
    actor_did: full.actor_did,
    payload: full.payload,
    source_ref: full.source_ref,
    observed_at: full.observed_at,
  }
}

function currentPublicKey(engine, event) {
  const did = String(event.actor_did)
  const keys = engine.state.identity_keys ? engine.state.identity_keys[did] : null
  const list = Array.isArray(keys) ? keys : keys && typeof keys === 'object' ? Object.values(keys) : []
  const usable = list.filter((key) => key && typeof key.public_key === 'string' && key.public_key)
  const active = usable.filter((key) => !key.retired_at && String(key.status || 'ACTIVE').toUpperCase() === 'ACTIVE')
  const candidates = (active.length > 0 ? active : usable).slice().sort((left, right) => String(left.created_at || '').localeCompare(String(right.created_at || '')))
  const keyId = event.signature_key_id ?? null
  if (keyId) {
    const byId = candidates.find((key) => String(key.key_id) === String(keyId))
    if (byId) return byId.public_key
  }
  if (candidates.length > 0) return candidates[candidates.length - 1].public_key
  const identity = engine.state.identities ? engine.state.identities[did] : null
  if (identity && typeof identity.public_key === 'string' && identity.public_key) return identity.public_key
  const document = identity && identity.document
  const method = document && Array.isArray(document.verificationMethod) ? document.verificationMethod[0] : null
  if (method && typeof method.publicKeyBase64url === 'string') return method.publicKeyBase64url
  if (method && typeof method.publicKeyMultibase === 'string') {
    const value = method.publicKeyMultibase
    return value.startsWith('z') ? value.slice(1) : value
  }
  if (method && typeof method.publicKeyJwk === 'object' && method.publicKeyJwk && method.publicKeyJwk.x) return method.publicKeyJwk.x
  return null
}

/* ------------------------------------------------------------------ */
/* request normalization                                               */
/* ------------------------------------------------------------------ */

function normalizeSignature(value) {
  if (value === undefined || value === null) return { signature: null, keyId: null, algorithm: null }
  if (typeof value === 'string') {
    const text = value.trim()
    if (text === '') return { signature: null, keyId: null, algorithm: null }
    if (text.length > 8000) failValidation('signature must be at most 8000 characters')
    return { signature: text, keyId: null, algorithm: null }
  }
  if (typeof value !== 'object' || Array.isArray(value)) failValidation('signature must be a string or an EventSignature object')
  const signatureValue = value.value
  if (typeof signatureValue !== 'string' || signatureValue.trim() === '') failValidation('signature.value must be a non-empty string')
  const keyId = value.key_id ?? value.keyId
  if (keyId !== undefined && keyId !== null && (typeof keyId !== 'string' || keyId.trim() === '' || keyId.length > 250)) {
    failValidation('signature.key_id must be a string of 1-250 characters')
  }
  const algorithm = String(value.algorithm ?? 'Ed25519')
  if (algorithm.length < 2 || algorithm.length > 80) failValidation('signature.algorithm must be a string of 2-80 characters')
  if (!SIGNATURE_ALGORITHMS.has(algorithm.toUpperCase())) {
    fail('SIGNATURE_ALGORITHM_UNSUPPORTED', `unsupported signature algorithm: ${algorithm}`, { status: 422 })
  }
  return {
    signature: signatureValue.trim(),
    keyId: keyId === undefined || keyId === null ? null : String(keyId).trim(),
    algorithm,
  }
}

function normalizeTimezoneInput(value, field, fallback) {
  if (value === undefined || value === null) return fallback
  if (!hasTimezone(value)) fail('TIMEZONE_REQUIRED', `事件 ${field} 必须带时区`, { status: 422 })
  const parsed = parseTimeValue(value)
  if (!parsed) failValidation(`${field} must be a valid ISO-8601 timestamp`)
  return parsed
}

function normalizeStringArray(value, field) {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) failValidation(`${field} must be an array of strings`)
  return value.map((item) => {
    if (typeof item !== 'string' || item.trim() === '') failValidation(`${field} must be an array of non-empty strings`)
    return item.trim()
  })
}

function validateSchemaVersion(value) {
  if (value === undefined || value === null) return EVENT_SCHEMA_VERSION
  if (typeof value !== 'string' || value.length < 2 || value.length > 80 || !/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value) || !value.includes('.')) {
    failValidation('schema_version must look like "operation-event.v1" (2-80 characters)')
  }
  return value
}

function normalizeEventCreate(engine, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) failValidation('event create request must be an object')
  let eventId = null
  if (payload.event_id !== undefined && payload.event_id !== null) {
    if (typeof payload.event_id !== 'string' || !payload.event_id.startsWith('evt_') || payload.event_id.length < 6) {
      failValidation('event_id must start with "evt_" and be at least 6 characters')
    }
    eventId = payload.event_id
  }
  const taskId = payload.task_id
  if (typeof taskId !== 'string' || taskId.trim() === '') failValidation('task_id is required')
  const eventType = String(payload.event_type ?? '').trim().toUpperCase()
  if (!EVENT_TYPES.includes(eventType)) failValidation(`event_type must be one of ${EVENT_TYPES.join(', ')}`)
  const actorDid = payload.actor_did
  if (typeof actorDid !== 'string' || actorDid.trim() === '') failValidation('actor_did is required')
  const eventPayload = payload.payload === undefined || payload.payload === null ? {} : payload.payload
  if (typeof eventPayload !== 'object' || Array.isArray(eventPayload)) failValidation('payload must be an object')
  const sourceRef = payload.source_ref
  if (typeof sourceRef !== 'string' || sourceRef.trim().length < 2 || sourceRef.length > 250) failValidation('source_ref must be a string of 2-250 characters')
  const finalityInput = payload.finality === undefined || payload.finality === null ? 'OBSERVED' : String(payload.finality).trim().toUpperCase()
  if (!EVENT_FINALITIES.includes(finalityInput)) failValidation(`finality must be one of ${EVENT_FINALITIES.join(', ')}`)
  const statusInput = payload.status === undefined || payload.status === null ? null : String(payload.status).trim().toUpperCase()
  if (statusInput !== null && !EVENT_FINALITIES.includes(statusInput)) failValidation(`status must be one of ${EVENT_FINALITIES.join(', ')}`)
  if (statusInput !== null && finalityInput !== 'OBSERVED' && statusInput !== finalityInput) {
    fail('FINALITY_CONFLICT', `finality ${finalityInput} conflicts with status ${statusInput}`, { status: 422 })
  }
  const finality = statusInput || finalityInput
  const observedAt = normalizeTimezoneInput(payload.observed_at ?? payload.observedAt, 'observed_at', new Date())
  const eventTime = normalizeTimezoneInput(payload.event_time ?? payload.eventTime, 'event_time', observedAt)
  const signature = normalizeSignature(payload.signature)
  const schemaVersion = validateSchemaVersion(payload.schema_version)
  const traceId = payload.trace_id === undefined || payload.trace_id === null ? null : String(payload.trace_id)
  if (traceId !== null && (traceId.length === 0 || traceId.length > 250)) failValidation('trace_id must be a string of 1-250 characters')
  const counterpartyDid = payload.counterparty_did === undefined || payload.counterparty_did === null ? null : String(payload.counterparty_did)
  if (counterpartyDid !== null && (counterpartyDid.length === 0 || counterpartyDid.length > 300)) failValidation('counterparty_did must be a string of 1-300 characters')
  const messageId = payload.payload && typeof payload.payload === 'object' && !Array.isArray(payload.payload) ? payload.payload.message_id ?? payload.payload.messageId ?? null : null
  const requestedPolicy = payload.policy_version ?? payload.policyVersion
  const policyVersion = requestedPolicy === undefined || requestedPolicy === null ? engine.policy.policyVersion : String(requestedPolicy)
  if (policyVersion.length < 3 || policyVersion.length > 120) failValidation('policy_version must be a string of 3-120 characters')
  return {
    event_id: eventId,
    task_id: taskId.trim(),
    event_type: eventType,
    actor_did: actorDid.trim(),
    payload: eventPayload,
    source_ref: sourceRef.trim(),
    finality,
    status: finality,
    observed_at: observedAt.toISOString(),
    event_time: storedNaiveTime(eventTime),
    signature: signature.signature,
    signature_key_id: signature.keyId,
    signature_algorithm: signature.algorithm,
    schema_version: schemaVersion,
    trace_id: traceId,
    counterparty_did: counterpartyDid,
    predecessors: normalizeStringArray(payload.predecessors, 'predecessors'),
    evidence_refs: normalizeStringArray(payload.evidence_refs, 'evidence_refs'),
    source_ledger: normalizeObject(payload.source_ledger, 'source_ledger'),
    message_id: messageId === null ? null : String(messageId),
    policy_version: policyVersion,
  }
}

function normalizeObject(value, field) {
  if (value === undefined || value === null) return {}
  if (typeof value !== 'object' || Array.isArray(value)) failValidation(`${field} must be an object`)
  return value
}

/* ------------------------------------------------------------------ */
/* verification                                                        */
/* ------------------------------------------------------------------ */

function verifiedAtCurrentKey(engine, event) {
  if (!event.signature) return false
  const publicKey = currentPublicKey(engine, event)
  if (!publicKey) return false
  const full = eventSigningPayload({ ...event, event_id: event.id })
  if (verifySignature(publicKey, event.signature, full)) return true
  if (DEV_ALLOW_UNSIGNED_EVENTS && verifySignature(publicKey, event.signature, legacySigningPayload({ ...event, event_id: event.id }))) return true
  return false
}

function identityStatusFor(engine, event, signatureOk) {
  const identity = engine.state.identities ? engine.state.identities[event.actor_did] : null
  if (!identity || String(identity.status || '').toUpperCase() !== 'ACTIVE') return 'UNKNOWN'
  if (signatureOk) return 'VALID'
  if (!event.signature && DEV_ALLOW_UNSIGNED_EVENTS) return 'UNKNOWN'
  return 'INVALID'
}

function amountOf(payload) {
  return toNumber(payload && typeof payload === 'object' ? payload.amount : undefined)
}

function invariantErrorsFor(engine, event, task) {
  const errors = []
  const events = engine.state.events || {}
  const eventType = String(event.event_type || '').toUpperCase()
  const payload = event.payload && typeof event.payload === 'object' && !Array.isArray(event.payload) ? event.payload : {}
  const parsedAmount = amountOf(payload)
  const eventAmount = parsedAmount === null ? 0 : parsedAmount
  if (parsedAmount === null && AMOUNT_FORMAT_TYPES.has(eventType)) errors.push('金额格式无效')
  if (AMOUNT_EVENT_TYPES.has(eventType) && eventAmount <= 0) errors.push('金额必须为正数')

  if (eventType === 'QUOTE') {
    const quoteAsset = payload.asset_id ?? payload.assetId
    if (quoteAsset !== undefined && quoteAsset !== null && String(quoteAsset) !== String(task.asset_id)) errors.push('报价资产与任务资产不一致')
    const quoteBeneficiary = payload.beneficiary
    if (quoteBeneficiary !== undefined && quoteBeneficiary !== null && String(quoteBeneficiary) !== String(task.beneficiary)) {
      errors.push('报价收款方与任务收款方不一致')
    }
    const expiresAt = payload.expires_at ?? payload.expiresAt
    if (expiresAt !== undefined && expiresAt !== null) {
      const expiry = parseTimeValue(expiresAt)
      if (!expiry) {
        errors.push('报价有效期格式无效')
      } else {
        const eventTime = parseTimeValue(event.event_time || event.observed_at)
        if (eventTime && eventTime.getTime() > expiry.getTime()) errors.push('报价已过期')
      }
    }
  }

  if (eventType === 'SELECT' || eventType === 'PAYREQ') {
    const quoteRef = payload.quote_event_id ?? payload.quote_id ?? payload.quoteEventId
    if (quoteRef !== undefined && quoteRef !== null) {
      const quote = events[String(quoteRef)]
      if (!quote || quote.task_id !== task.id || String(quote.event_type).toUpperCase() !== 'QUOTE') {
        errors.push('引用的报价不存在或不属于当前任务')
      } else {
        if (!['CONFIRMED', 'FINAL'].includes(String(quote.finality).toUpperCase())) errors.push('引用的报价尚未达到最终性')
        const quoteAmount = amountOf(quote.payload)
        if (quoteAmount !== null && eventAmount > quoteAmount) errors.push('操作金额超过报价覆盖金额')
        const quoteAsset = quote.payload && typeof quote.payload === 'object' ? quote.payload.asset_id ?? quote.payload.assetId : undefined
        if (quoteAsset !== undefined && quoteAsset !== null && String(quoteAsset) !== String(task.asset_id)) errors.push('报价资产与任务资产不一致')
      }
    }
  }

  if (eventType === 'PAYREQ') {
    const asset = payload.asset_id ?? payload.assetId
    if (asset !== undefined && asset !== null && String(asset) !== String(task.asset_id)) errors.push('支付资产与任务资产不一致')
    const beneficiary = payload.beneficiary
    if (beneficiary !== undefined && beneficiary !== null && String(beneficiary) !== String(task.beneficiary)) errors.push('收款方与任务收款方不一致')
    const taskAmount = toNumber(task.amount)
    if (taskAmount !== null && eventAmount > taskAmount) errors.push('支付金额超过任务金额')
  }

  if (eventType === 'RESULT') {
    const payreqRef = payload.payreq_event_id ?? payload.payreqEventId
    const payreq = payreqRef === undefined || payreqRef === null ? null : events[String(payreqRef)]
    if (!payreq || payreq.task_id !== task.id || String(payreq.event_type).toUpperCase() !== 'PAYREQ') {
      errors.push('RESULT 引用的 PAYREQ 不存在或不属于当前任务')
    }
  }

  if (eventType === 'BRIDGE' && !(payload.message_id ?? payload.messageId)) errors.push('BRIDGE 缺少唯一 message_id')

  const predecessors = Array.isArray(event.predecessors) ? event.predecessors : []
  if (new Set(predecessors).size !== predecessors.length) errors.push('前序事件存在重复引用')
  for (const predecessorId of predecessors) {
    const predecessor = events[String(predecessorId)]
    if (!predecessor) {
      errors.push(`前序事件不存在: ${predecessorId}`)
      continue
    }
    const predecessorObserved = parseTimeValue(predecessor.observed_at)
    const currentTime = parseTimeValue(event.event_time || event.observed_at)
    if (predecessor.task_id !== event.task_id || (predecessorObserved && currentTime && predecessorObserved.getTime() > currentTime.getTime())) {
      errors.push(`前序事件不属于当前任务或晚于当前事件: ${predecessorId}`)
    }
  }
  return errors
}

function withinWindow(value, from, to) {
  const time = parseTimeValue(value)
  if (!time) return false
  const start = from === undefined || from === null ? null : parseTimeValue(from)
  const end = to === undefined || to === null ? null : parseTimeValue(to)
  if (from !== undefined && from !== null && !start) return false
  if (to !== undefined && to !== null && !end) return false
  if (start && time.getTime() < start.getTime()) return false
  if (end && time.getTime() > end.getTime()) return false
  return true
}

function windowWithin(child, parent) {
  const childStart = child.valid_from === undefined || child.valid_from === null ? null : parseTimeValue(child.valid_from)
  const childEnd = child.valid_to === undefined || child.valid_to === null ? null : parseTimeValue(child.valid_to)
  const parentStart = parent.valid_from === undefined || parent.valid_from === null ? null : parseTimeValue(parent.valid_from)
  const parentEnd = parent.valid_to === undefined || parent.valid_to === null ? null : parseTimeValue(parent.valid_to)
  if (childStart && parentStart && childStart.getTime() < parentStart.getTime()) return false
  if (childEnd && parentEnd && childEnd.getTime() > parentEnd.getTime()) return false
  return true
}

function validDelegationChain(delegation, task, delegationsById) {
  let current = delegation
  const seen = new Set()
  while (current) {
    if (!current.id || seen.has(current.id)) return false
    seen.add(current.id)
    if (String(current.status || '').toUpperCase() !== 'ACTIVE') return false
    if (current.task_id !== task.id) return false
    if (!current.parent_id) return String(current.issuer_did) === String(task.requester_did)
    const parent = delegationsById[current.parent_id]
    if (!parent) return false
    if (String(parent.subject_did) !== String(current.issuer_did)) return false
    const parentActions = new Set((Array.isArray(parent.actions) ? parent.actions : []).map((action) => String(action).toUpperCase()))
    for (const action of Array.isArray(current.actions) ? current.actions : []) {
      if (!parentActions.has(String(action).toUpperCase())) return false
    }
    const limit = toNumber(current.amount_limit)
    const parentLimit = toNumber(parent.amount_limit)
    if (limit !== null && parentLimit !== null && limit > parentLimit) return false
    const daily = toNumber(current.daily_limit)
    const parentDaily = toNumber(parent.daily_limit)
    if (daily !== null && parentDaily !== null && daily > parentDaily) return false
    if (!windowWithin(current, parent)) return false
    current = parent
  }
  return true
}

function authorizationStatusFor(engine, event, task) {
  const eventAmount = amountOf(event.payload) === null ? 0 : amountOf(event.payload)
  if (String(event.actor_did) === String(task.requester_did)) return 'VALID'
  const delegations = valuesOf(engine.state.delegations).filter((item) => String(item.status || '').toUpperCase() === 'ACTIVE')
  const delegationsById = {}
  for (const item of delegations) delegationsById[item.id] = item
  const eventType = String(event.event_type || '').toUpperCase()
  const eventTime = event.event_time || event.observed_at
  const valid = delegations.filter((delegation) => {
    if (String(delegation.subject_did) !== String(event.actor_did)) return false
    const actions = (Array.isArray(delegation.actions) ? delegation.actions : []).map((action) => String(action).toUpperCase())
    if (!actions.includes(eventType)) return false
    if (delegation.asset_id !== undefined && delegation.asset_id !== null && String(delegation.asset_id) !== String(task.asset_id)) return false
    if (!withinWindow(eventTime, delegation.valid_from, delegation.valid_to)) return false
    const limit = toNumber(delegation.amount_limit)
    if (limit !== null && eventAmount > limit) return false
    return validDelegationChain(delegation, task, delegationsById)
  })
  if (valid.length === 0) return 'INVALID'
  if (eventAmount > 0) {
    const dayKey = utcDayKey(event.observed_at || event.event_time)
    let usedToday = 0
    for (const other of valuesOf(engine.state.events)) {
      if (other.id === event.id) continue
      if (other.task_id !== task.id) continue
      if (String(other.actor_did) !== String(event.actor_did)) continue
      if (utcDayKey(other.observed_at || other.event_time) !== dayKey) continue
      usedToday += amountOf(other.payload) === null ? 0 : amountOf(other.payload)
    }
    const covered = valid.some((delegation) => {
      const dailyLimit = toNumber(delegation.daily_limit)
      return dailyLimit === null || usedToday + eventAmount <= dailyLimit
    })
    return covered ? 'VALID' : 'INVALID'
  }
  return 'VALID'
}

function ledgerStatusFor(event) {
  const ledger = event.source_ledger && typeof event.source_ledger === 'object' && !Array.isArray(event.source_ledger) ? event.source_ledger : {}
  const finality = String(event.finality || 'OBSERVED').toUpperCase()
  if (!event.source_ref || !['CONFIRMED', 'FINAL'].includes(finality)) return 'UNKNOWN'
  const ledgerFinality = String(ledger.finality || finality).toUpperCase()
  const ledgerRank = FINALITY_RANK[ledgerFinality]
  if (ledgerRank === undefined || ledgerRank < FINALITY_RANK[finality]) return 'INVALID'
  if (Object.keys(ledger).length === 0 && !DEV_ALLOW_UNSIGNED_EVENTS) return 'UNKNOWN'
  return 'VALID'
}

function overallStatusFor(statuses) {
  if (statuses.includes('INVALID')) return 'INVALID'
  if (statuses.includes('UNKNOWN')) return 'UNKNOWN'
  return 'VALID'
}

function verificationResponse(record) {
  return {
    id: record.id,
    event_id: record.event_id,
    identity_status: record.identity_status,
    authorization_status: record.authorization_status,
    ledger_status: record.ledger_status,
    overall_status: record.overall_status,
    evidence_refs: record.evidence_refs,
    policy_version: record.policy_version,
    details: record.details,
  }
}

function operationEventResponse(engine, event) {
  const verification = engine.state.verifications ? engine.state.verifications[event.id] : null
  return {
    id: event.id,
    task_id: event.task_id,
    event_type: event.event_type,
    actor_did: event.actor_did,
    payload: event.payload,
    signature: event.signature || null,
    signature_detail: event.signature
      ? {
          key_id: event.signature_key_id || null,
          algorithm: event.signature_algorithm || 'Ed25519',
          value: event.signature,
        }
      : null,
    source_ref: event.source_ref,
    finality: event.finality,
    status: event.status,
    event_time: event.event_time,
    observed_at: event.observed_at,
    idempotency_key: event.idempotency_key,
    verification: verification ? verificationResponse(verification) : null,
    schema_version: event.schema_version,
    trace_id: event.trace_id ?? null,
    counterparty_did: event.counterparty_did ?? null,
    predecessors: Array.isArray(event.predecessors) ? event.predecessors : [],
    evidence_refs: Array.isArray(event.evidence_refs) ? event.evidence_refs : [],
    source_ledger: event.source_ledger || {},
    message_id: event.message_id ?? null,
    policy_version: event.policy_version,
  }
}

/* ------------------------------------------------------------------ */
/* engine                                                              */
/* ------------------------------------------------------------------ */

/**
 * @param {import('./core.js').Engine} engine
 */
export function createEventEngine(engine) {
  if (!engine) throw new TypeError('createEventEngine requires an Engine instance')

  function create(payload = {}, options = {}) {
    const actor = actorOf(engine, options)
    const body = normalizeEventCreate(engine, payload)
    requireClaimedActor(engine, actor, body.actor_did, '事件 actor_did 必须与调用方 DID 一致')
    const key = idempotencyKey(engine, 'events.create', payload, options, actor)
    const hashPayload = requestHashPayload(body)
    return engine.idempotent(key, hashPayload, () => {
      const task = engine.state.tasks ? engine.state.tasks[body.task_id] : null
      if (!task) fail('TASK_NOT_FOUND', `task not found: ${body.task_id}`, { status: 404 })
      requireActiveDid(engine, body.actor_did)
      const events = engine.collection('events')
      if (body.event_id) {
        const existing = events[body.event_id]
        if (existing) {
          if (String(existing.idempotency_key || '') !== String(key)) {
            fail('EVENT_ID_CONFLICT', `event_id already used with another idempotency key: ${body.event_id}`, { status: 409 })
          }
          return operationEventResponse(engine, existing)
        }
      }
      const sourceRefConflict = valuesOf(events).some((item) => item.task_id === body.task_id && item.source_ref === body.source_ref)
      if (sourceRefConflict) fail('SOURCE_REF_CONFLICT', '同一任务的 source_ref 已被其他事件使用', { status: 409 })
      if (body.message_id) {
        const messageConflict = valuesOf(events).some((item) => item.message_id === body.message_id)
        if (messageConflict) fail('DUPLICATE_MESSAGE', `message_id already ingested: ${body.message_id}`, { status: 409 })
      }
      const event = {
        id: body.event_id || newId('evt'),
        task_id: body.task_id,
        event_type: body.event_type,
        actor_did: body.actor_did,
        payload: body.payload,
        signature: body.signature,
        signature_key_id: body.signature_key_id,
        signature_algorithm: body.signature_algorithm,
        source_ref: body.source_ref,
        finality: body.finality,
        status: body.status,
        event_time: body.event_time,
        observed_at: body.observed_at,
        idempotency_key: key,
        message_id: body.message_id,
        schema_version: body.schema_version,
        trace_id: body.trace_id,
        counterparty_did: body.counterparty_did,
        predecessors: body.predecessors,
        evidence_refs: body.evidence_refs,
        source_ledger: body.source_ledger,
        policy_version: body.policy_version,
        created_at: engine.iso(),
      }
      events[event.id] = event
      const currentTaskStatus = String(task.status || '').toUpperCase()
      if (currentTaskStatus === 'CREATED') {
        task.status = body.event_type === 'DELEGATE' ? 'DELEGATING' : 'QUOTING'
        task.updated_at = engine.iso()
      }
      engine.audit('event.ingest', actor, 'event', event.id, {
        task_id: event.task_id,
        event_type: event.event_type,
        finality: event.finality,
        idempotency_key: key,
      })
      engine.save()
      return operationEventResponse(engine, event)
    })
  }

  function get(id, options = {}) {
    const event = engine.state.events ? engine.state.events[id] : null
    if (!event) fail('EVENT_NOT_FOUND', `event not found: ${id}`, { status: 404 })
    const task = engine.state.tasks ? engine.state.tasks[event.task_id] : null
    if (!task) fail('TASK_NOT_FOUND', `task not found: ${event.task_id}`, { status: 404 })
    requireTaskAccess(engine, task, actorOf(engine, options))
    return operationEventResponse(engine, event)
  }

  function list(query = {}) {
    const actor = actorOf(engine, query)
    const limit = clampLimit(query.limit, LIMIT_DEFAULT)
    const domain = actorDomain(engine, actor)
    const taskId = query.task_id ?? query.taskId
    if (taskId !== undefined && taskId !== null && typeof taskId !== 'string') failValidation('task_id must be a string')
    let events = valuesOf(engine.state.events)
    if (taskId) events = events.filter((event) => event.task_id === taskId)
    if (domain !== null) {
      events = events.filter((event) => {
        const task = engine.state.tasks ? engine.state.tasks[event.task_id] : null
        return task && String(task.domain_id) === String(domain)
      })
    }
    events.sort((left, right) => String(right.observed_at || '').localeCompare(String(left.observed_at || '')))
    return events.slice(0, limit).map((event) => operationEventResponse(engine, event))
  }

  function verify(id, options = {}) {
    const actor = actorOf(engine, options)
    const key = idempotencyKey(engine, 'events.verify', {}, options, actor, `legacy-verify-${id}`)
    return engine.idempotent(key, { event_id: id }, () => verifyNow(id, actor))
  }

  function verifyNow(id, actor) {
    const event = engine.state.events ? engine.state.events[id] : null
    if (!event) fail('EVENT_NOT_FOUND', `event not found: ${id}`, { status: 404 })
    const task = engine.state.tasks ? engine.state.tasks[event.task_id] : null
    if (!task) fail('TASK_NOT_FOUND', `task not found: ${event.task_id}`, { status: 404 })
    requireTaskAccess(engine, task, actor)
    const identity = engine.state.identities ? engine.state.identities[event.actor_did] : null
    const signatureOk = verifiedAtCurrentKey(engine, event)
    const identityStatus = identityStatusFor(engine, event, signatureOk)
    const invariantErrors = invariantErrorsFor(engine, event, task)
    const authorizationStatus = invariantErrors.length > 0 ? 'INVALID' : authorizationStatusFor(engine, event, task)
    const ledgerStatus = ledgerStatusFor(event)
    const overallStatus = overallStatusFor([identityStatus, authorizationStatus, ledgerStatus])
    const signingPayload = eventSigningPayload({ ...event, event_id: event.id })
    const evidenceRefs = [sha256Hex(signingPayload), sm3Hex(signingPayload)]
    const policyVersion = event.policy_version || task.policy_version || engine.policy.policyVersion
    const details = {
      signature_ok: signatureOk,
      invariant_errors: invariantErrors,
      ledger: event.source_ledger && typeof event.source_ledger === 'object' ? event.source_ledger : {},
      identity_present: Boolean(identity),
    }
    const store = engine.collection('verifications')
    const existing = store[event.id]
    const recordId = existing ? existing.id : engine.nextSeq('verification')
    const record = {
      id: recordId,
      event_id: event.id,
      identity_status: identityStatus,
      authorization_status: authorizationStatus,
      ledger_status: ledgerStatus,
      overall_status: overallStatus,
      evidence_refs: evidenceRefs,
      policy_version: policyVersion,
      details,
      created_at: existing ? existing.created_at : engine.iso(),
      updated_at: engine.iso(),
    }
    store[event.id] = record
    engine.audit('event.verify', actor, 'event', event.id, {
      identity_status: identityStatus,
      authorization_status: authorizationStatus,
      ledger_status: ledgerStatus,
      overall_status: overallStatus,
      signature_ok: signatureOk,
    })
    engine.save()
    return verificationResponse(record)
  }

  return { create, get, list, verify }
}
