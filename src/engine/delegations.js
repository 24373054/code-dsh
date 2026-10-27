/**
 * Embedded delegation engine.
 *
 * Ports the Python delegation lifecycle: scoped authorization of an event actor
 * by a task issuer, parent/child re-delegation limits, revocation and the
 * deterministic `authorize` check used by event verification. Amounts are stored
 * as numbers and serialized as legacy 8-decimal strings; all writes replay
 * through `engine.idempotent`.
 *
 * @module dsh-trust-platform/engine/delegations
 */

import { fail } from './core.js'

/** Event types a delegation may authorize. */
const EVENT_TYPES = Object.freeze(['DELEGATE', 'QUOTE', 'SELECT', 'PAYREQ', 'RESULT', 'BRIDGE', 'SETTLE'])

/** Task statuses accepted by the revoke body (validated then ignored, as in Python). */
const TASK_STATUSES = Object.freeze([
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

/** Maximum rows returned by a single list call. */
const MAX_LIST_LIMIT = 200

/** Coerce a number or numeric string to a finite number. */
function numeric(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/** Render an amount/limit as the legacy 8-decimal string form. */
function amountString(value) {
  const number = numeric(value)
  return (number === null ? 0 : number).toFixed(8)
}

/** Parse an ISO timestamp and report whether it carried an explicit zone. */
function parseInstant(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : { date: value, aware: true }
  if (typeof value !== 'string' || value.trim() === '') return null
  const text = value.trim()
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)
  const date = new Date(hasZone ? text : `${text}Z`)
  return Number.isNaN(date.getTime()) ? null : { date, aware: hasZone }
}

/** Parse an ISO timestamp, treating zone-less strings as UTC. */
function parseIso(value) {
  const instant = parseInstant(value)
  return instant === null ? null : instant.date
}

/** True when the value is a plain JSON object. */
function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** Validate and normalize a bounded string field. */
function textField(value, field, { min = 1, max = Number.MAX_SAFE_INTEGER, fallback = undefined } = {}) {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback
    fail('VALIDATION_ERROR', `${field} is required`, { status: 422 })
  }
  if (typeof value !== 'string') fail('VALIDATION_ERROR', `${field} must be a string`, { status: 422 })
  const trimmed = value.trim()
  if (trimmed.length < min || trimmed.length > max) {
    fail('VALIDATION_ERROR', `${field} length must be between ${min} and ${max}`, { status: 422 })
  }
  return trimmed
}

/** Validate a positive decimal limit. */
function positiveAmount(value, field) {
  const number = numeric(value)
  if (number === null) fail('VALIDATION_ERROR', `${field} must be a number`, { status: 422 })
  if (number <= 0) fail('VALIDATION_ERROR', `${field} must be greater than zero`, { status: 422 })
  return number
}

/** Resolve the idempotency key from an explicit argument or a request body. */
function idempotencyKeyOf(body = {}, explicit = undefined) {
  const key = explicit ?? body.idempotency_key ?? body.idempotencyKey
  return typeof key === 'string' && key.trim() !== '' ? key.trim() : null
}

/** Copy a request body without its idempotency key fields. */
function stripIdempotency(body = {}) {
  const copy = { ...body }
  delete copy.idempotency_key
  delete copy.idempotencyKey
  return copy
}

/**
 * Create the delegation engine.
 *
 * @param engine - shared {@link import('./core.js').Engine} instance.
 * @returns delegation methods backed by `state.delegations` (tasks and
 *   identities are read-only guards).
 */
export function createDelegationEngine(engine) {
  const delegations = engine.collection('delegations')
  const tasks = engine.collection('tasks')
  const identities = engine.collection('identities')

  /** Resolve an actor from a request body, defaulting to the engine actor. */
  function actorOf(body = {}) {
    const value = body.actor
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : engine.defaultActor()
  }

  /** Resolve an actor DID to its domain, mirroring the Python `_actor_domain` guard. */
  function actorDomain(actor) {
    const value = typeof actor === 'string' && actor.trim() !== '' ? actor.trim() : engine.defaultActor()
    if (value.startsWith('system:')) return { actor: value, domain: null }
    const identity = identities[value]
    if (!identity || identity.status !== 'ACTIVE') {
      fail('ACTOR_NOT_FOUND', 'actor DID is unknown or inactive', { status: 403 })
    }
    return { actor: value, domain: identity.domain_id }
  }

  /** Reject cross-domain task access for non-system actors. */
  function requireTaskAccess(task, actor) {
    const { domain } = actorDomain(actor)
    if (domain !== null && domain !== task.domain_id) {
      fail('ACCESS_DENIED', 'actor cannot access another domain task', { status: 403 })
    }
  }

  /** Reject non-system actors that do not match the claimed issuer. */
  function requireClaimedActor(actor, claimed) {
    const value = typeof actor === 'string' && actor.trim() !== '' ? actor.trim() : engine.defaultActor()
    if (value.startsWith('system:')) return value
    if (value !== claimed) fail('ACTOR_MISMATCH', 'actor does not match the delegation issuer', { status: 403 })
    activeIdentityOrThrow(value)
    return value
  }

  /** Return a stored identity or throw DID_NOT_FOUND. */
  function identityOrThrow(did) {
    const identity = identities[did]
    if (!identity) fail('DID_NOT_FOUND', `DID ${did} is not registered`, { status: 404 })
    return identity
  }

  /** Return a stored identity, requiring ACTIVE status. */
  function activeIdentityOrThrow(did) {
    const identity = identityOrThrow(did)
    if (identity.status !== 'ACTIVE') {
      fail('DID_INACTIVE', `DID ${did} status is ${identity.status}`, { status: 409 })
    }
    return identity
  }

  /** Clamp a list limit to a sane range. */
  function clampLimit(value, fallback = 100) {
    const parsed = numeric(value)
    if (parsed === null) return fallback
    return Math.min(Math.max(Math.trunc(parsed), 1), MAX_LIST_LIMIT)
  }

  /** Map a stored delegation to the DelegationResponse contract. */
  function delegationResponse(record) {
    return {
      id: record.id,
      task_id: record.task_id,
      issuer_did: record.issuer_did,
      subject_did: record.subject_did,
      actions: Array.isArray(record.actions) ? [...record.actions] : [],
      asset_id: record.asset_id,
      amount_limit: amountString(record.amount_limit),
      daily_limit: amountString(record.daily_limit),
      valid_from: record.valid_from,
      valid_to: record.valid_to,
      parent_id: record.parent_id ?? null,
      can_redelegate: Boolean(record.can_redelegate),
      status: record.status,
    }
  }

  /** Decide whether the parent chain of a delegation is still trustworthy. */
  function chainValid(record, task) {
    let current = record
    const seen = new Set()
    while (current.parent_id) {
      if (seen.has(current.id)) return false
      seen.add(current.id)
      const parent = delegations[current.parent_id]
      if (!parent || parent.status !== 'ACTIVE') return false
      if (parent.task_id !== task.id) return false
      if (parent.subject_did !== current.issuer_did) return false
      const parentActions = Array.isArray(parent.actions) ? parent.actions : []
      if (!(Array.isArray(current.actions) ? current.actions : []).every((action) => parentActions.includes(action))) return false
      if ((numeric(current.amount_limit) ?? 0) > (numeric(parent.amount_limit) ?? 0)) return false
      if ((numeric(current.daily_limit) ?? 0) > (numeric(parent.daily_limit) ?? 0)) return false
      const childFrom = parseIso(current.valid_from)
      const childTo = parseIso(current.valid_to)
      const parentFrom = parseIso(parent.valid_from)
      const parentTo = parseIso(parent.valid_to)
      if (childFrom && parentFrom && childFrom.getTime() < parentFrom.getTime()) return false
      if (childTo && parentTo && childTo.getTime() > parentTo.getTime()) return false
      current = parent
    }
    return current.issuer_did === task.requester_did
  }

  /** Build an authorize reason entry. */
  function reason(code, message) {
    return { code, message }
  }

  /** Build the authorize response. */
  function authorizeResult(record, task, payload, decision, reasons) {
    return {
      decision,
      reasons,
      delegation_id: record?.id ?? null,
      task_id: record?.task_id ?? task?.id ?? null,
      requester_did: task?.requester_did ?? null,
      domain_id: record?.domain_id ?? task?.domain_id ?? null,
      subject_did: payload?.subject_did ?? payload?.did ?? null,
      action: typeof payload?.action === 'string' ? payload.action.trim().toUpperCase() : null,
      asset_id: payload?.asset_id ?? payload?.currency ?? null,
      amount: numeric(payload?.amount),
      evaluated_at: engine.iso(),
    }
  }

  /**
   * Create a delegation for a task event actor.
   *
   * Validation order mirrors the Python service: schema checks first, then the
   * claimed-actor guard, identity guards, task/asset/action/window/quota checks,
   * parent-chain scope checks (or root-issuer equality) and finally the
   * timezone-aware window requirement.
   */
  function create(payload = {}) {
    if (!plainObject(payload)) fail('VALIDATION_ERROR', 'delegation body must be an object', { status: 422 })
    const body = stripIdempotency(payload)
    const key = idempotencyKeyOf(payload)
    const taskId = textField(body.task_id, 'task_id', { min: 1, max: 250 })
    const issuerDid = textField(body.issuer_did, 'issuer_did', { min: 1, max: 250 })
    const subjectDid = textField(body.subject_did, 'subject_did', { min: 1, max: 250 })
    const assetId = textField(body.asset_id, 'asset_id', { min: 1, max: 120 })
    const rawActions = Array.isArray(body.actions) ? body.actions : null
    if (!rawActions || rawActions.length === 0) {
      fail('VALIDATION_ERROR', 'actions must contain at least one event type', { status: 422 })
    }
    const actions = [...new Set(rawActions.map((action) => String(action).trim().toUpperCase()).filter((action) => action !== ''))].sort()
    if (actions.length === 0) fail('VALIDATION_ERROR', 'actions must contain at least one event type', { status: 422 })
    const amountLimit = positiveAmount(body.amount_limit, 'amount_limit')
    const dailyLimit = positiveAmount(body.daily_limit, 'daily_limit')
    const validFromInstant = parseInstant(body.valid_from)
    const validToInstant = parseInstant(body.valid_to)
    if (validFromInstant === null) fail('VALIDATION_ERROR', 'valid_from is not a valid datetime', { status: 422 })
    if (validToInstant === null) fail('VALIDATION_ERROR', 'valid_to is not a valid datetime', { status: 422 })
    if (validToInstant.date.getTime() <= validFromInstant.date.getTime()) {
      fail('VALIDATION_ERROR', 'valid_to must be after valid_from', { status: 422 })
    }
    if (body.parent_id !== undefined && body.parent_id !== null && typeof body.parent_id !== 'string') {
      fail('VALIDATION_ERROR', 'parent_id must be a string', { status: 422 })
    }
    const parentId = typeof body.parent_id === 'string' && body.parent_id.trim() !== '' ? body.parent_id.trim() : null
    const canRedelegate = Boolean(body.can_redelegate)
    const claims = body.claims === undefined ? {} : body.claims
    if (!plainObject(claims)) fail('VALIDATION_ERROR', 'claims must be an object', { status: 422 })
    const actor = actorOf(body)
    const requestBody = { actor, ...body }
    return engine.idempotent(key, requestBody, () => {
      requireClaimedActor(actor, issuerDid)
      const issuer = activeIdentityOrThrow(issuerDid)
      const subject = activeIdentityOrThrow(subjectDid)
      const task = tasks[taskId]
      if (!task) fail('TASK_NOT_FOUND', 'payment task not found', { status: 404 })
      if (assetId !== task.asset_id) fail('ASSET_SCOPE_MISMATCH', 'delegation asset does not match the task asset', { status: 400 })
      const unsupported = actions.filter((action) => !EVENT_TYPES.includes(action))
      if (unsupported.length > 0) {
        fail('ACTION_NOT_SUPPORTED', `delegation contains unknown actions: ${unsupported.join(',')}`, { status: 422 })
      }
      const now = engine.now()
      if (validToInstant.date.getTime() <= now.getTime()) {
        fail('DELEGATION_EXPIRED', 'delegation valid_to is not in the future', { status: 409 })
      }
      const taskAmount = numeric(task.amount) ?? 0
      if (amountLimit > taskAmount) {
        fail('QUOTA_SCOPE_EXCEEDED', 'amount_limit cannot exceed the task amount', { status: 409 })
      }
      if (parentId) {
        const parent = delegations[parentId]
        if (!parent) fail('PARENT_DELEGATION_NOT_FOUND', 'parent delegation not found', { status: 404 })
        if (parent.status !== 'ACTIVE' || !parent.can_redelegate) {
          fail('REDELEGATION_FORBIDDEN', 'parent delegation does not allow re-delegation', { status: 409 })
        }
        if (parent.task_id !== task.id || parent.subject_did !== issuer.did) {
          fail('DELEGATION_ISSUER_MISMATCH', 'parent delegation is not issued to this issuer', { status: 409 })
        }
        const parentActions = Array.isArray(parent.actions) ? parent.actions : []
        if (!actions.every((action) => parentActions.includes(action))) {
          fail('ACTION_SCOPE_EXCEEDED', 'delegation actions exceed the parent scope', { status: 409 })
        }
        if (amountLimit > (numeric(parent.amount_limit) ?? 0) || dailyLimit > (numeric(parent.daily_limit) ?? 0)) {
          fail('QUOTA_SCOPE_EXCEEDED', 'delegation limits exceed the parent scope', { status: 409 })
        }
        const parentFrom = parseIso(parent.valid_from)
        const parentTo = parseIso(parent.valid_to)
        if (
          (parentFrom && validFromInstant.date.getTime() < parentFrom.getTime()) ||
          (parentTo && validToInstant.date.getTime() > parentTo.getTime())
        ) {
          fail('TIME_SCOPE_EXCEEDED', 'delegation window exceeds the parent scope', { status: 409 })
        }
      } else if (issuer.did !== task.requester_did) {
        fail('ROOT_DELEGATION_ISSUER_INVALID', 'the root issuer must be the task requester', { status: 403 })
      }
      if (!validFromInstant.aware || !validToInstant.aware) {
        fail('TIMEZONE_REQUIRED', 'valid_from and valid_to must be timezone-aware', { status: 400 })
      }
      const id = engine.id('del')
      const createdAt = engine.iso()
      const record = {
        id,
        task_id: task.id,
        domain_id: task.domain_id ?? issuer.domain_id,
        issuer_did: issuer.did,
        subject_did: subject.did,
        actions,
        asset_id: assetId,
        amount_limit: amountLimit,
        daily_limit: dailyLimit,
        valid_from: engine.iso(validFromInstant.date),
        valid_to: engine.iso(validToInstant.date),
        parent_id: parentId,
        can_redelegate: canRedelegate,
        claims,
        status: 'ACTIVE',
        idempotency_key: key,
        created_at: createdAt,
        updated_at: createdAt,
      }
      delegations[id] = record
      engine.audit('delegation.create', issuer.did, 'delegation', id, { task_id: task.id, idempotency_key: key })
      engine.save()
      return delegationResponse(record)
    })
  }

  /** Read a delegation by id, enforcing task-domain access for non-system actors. */
  function get(id, payload = {}) {
    const target = textField(id, 'delegation_id', { min: 1, max: 250 })
    const body = plainObject(payload) ? payload : {}
    const record = delegations[target]
    if (!record) fail('DELEGATION_NOT_FOUND', 'delegation not found', { status: 404 })
    const task = tasks[record.task_id]
    if (!task) fail('TASK_NOT_FOUND', 'payment task not found', { status: 404 })
    requireTaskAccess(task, actorOf(body))
    return delegationResponse(record)
  }

  /** List delegations visible to the actor's domain, newest first. */
  function list(payload = {}) {
    const body = plainObject(payload) ? payload : {}
    const { domain } = actorDomain(body.actor ?? engine.defaultActor())
    const limit = clampLimit(body.limit)
    const taskId = typeof body.task_id === 'string' && body.task_id.trim() !== '' ? body.task_id.trim() : null
    return Object.values(delegations)
      .filter((record) => (taskId === null ? true : record.task_id === taskId))
      .filter((record) => {
        if (domain === null) return true
        const task = tasks[record.task_id]
        return Boolean(task) && task.domain_id === domain
      })
      .sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)))
      .slice(0, limit)
      .map(delegationResponse)
  }

  /**
   * Revoke a delegation.
   *
   * The body keeps the Python task-transition shape: a valid task status string
   * is required but ignored, and the reason (3-1000 chars) is recorded.
   */
  function revoke(id, payload = {}, explicitKey = undefined) {
    const target = textField(id, 'delegation_id', { min: 1, max: 250 })
    const body = plainObject(payload) ? payload : {}
    const taskStatus = textField(body.status, 'status', { min: 1, max: 40 }).toUpperCase()
    if (!TASK_STATUSES.includes(taskStatus)) {
      fail('VALIDATION_ERROR', `status must be one of ${TASK_STATUSES.join(', ')}`, { status: 422 })
    }
    const revocationReason = textField(body.reason, 'reason', { min: 3, max: 1000 })
    const actor = actorOf(body)
    const key = idempotencyKeyOf(body, explicitKey)
    const requestBody = { delegation_id: target, actor, ...stripIdempotency(body) }
    return engine.idempotent(key, requestBody, () => {
      const record = delegations[target]
      if (!record) fail('DELEGATION_NOT_FOUND', 'delegation not found', { status: 404 })
      const task = tasks[record.task_id]
      if (!task) fail('TASK_NOT_FOUND', 'payment task not found', { status: 404 })
      requireTaskAccess(task, actor)
      record.status = 'REVOKED'
      record.revocation_reason = revocationReason
      record.updated_at = engine.iso()
      engine.audit('delegation.revoke', actor, 'delegation', target, { reason: revocationReason, idempotency_key: key })
      engine.save()
      return delegationResponse(record)
    })
  }

  /**
   * Deterministically authorize an event actor/action/amount against a delegation.
   *
   * Returns ALLOW only when every scope is satisfied; unknown delegation/task
   * records return DEFER (explicitly, never ALLOW) so event verification can
   * treat them as not-evaluable. Known scope violations return DENY.
   */
  function authorize(payload = {}) {
    const body = plainObject(payload) ? payload : {}
    const delegationId = typeof body.delegation_id === 'string'
      ? body.delegation_id.trim()
      : typeof body.id === 'string' ? body.id.trim() : ''
    const subjectDid = typeof (body.subject_did ?? body.did) === 'string' ? String(body.subject_did ?? body.did).trim() : ''
    const action = typeof body.action === 'string' ? body.action.trim().toUpperCase() : ''
    const assetId = typeof (body.asset_id ?? body.currency) === 'string' ? String(body.asset_id ?? body.currency).trim() : ''
    const amount = numeric(body.amount)
    const at = body.at === undefined || body.at === null ? engine.now() : parseIso(body.at)
    const record = delegationId ? delegations[delegationId] : undefined
    const task = record ? tasks[record.task_id] : undefined
    if (!delegationId) {
      return authorizeResult(null, null, body, 'DEFER', [reason('DELEGATION_ID_REQUIRED', 'delegation_id is required')])
    }
    if (!record) {
      return authorizeResult(null, null, body, 'DEFER', [reason('DELEGATION_NOT_FOUND', 'delegation is not available')])
    }
    if (!task) {
      return authorizeResult(record, null, body, 'DEFER', [reason('TASK_NOT_FOUND', 'payment task is not available')])
    }
    if (!subjectDid) {
      return authorizeResult(record, task, body, 'DEFER', [reason('SUBJECT_REQUIRED', 'subject_did is required')])
    }
    if (!action) {
      return authorizeResult(record, task, body, 'DEFER', [reason('ACTION_REQUIRED', 'action is required')])
    }
    if (!assetId) {
      return authorizeResult(record, task, body, 'DEFER', [reason('ASSET_REQUIRED', 'asset_id is required')])
    }
    if (amount === null || amount < 0) {
      return authorizeResult(record, task, body, 'DEFER', [reason('AMOUNT_INVALID', 'amount must be a non-negative number')])
    }
    if (at === null) {
      return authorizeResult(record, task, body, 'DEFER', [reason('EVALUATION_TIME_INVALID', 'at is not a valid datetime')])
    }
    if (!EVENT_TYPES.includes(action)) {
      return authorizeResult(record, task, body, 'DENY', [reason('ACTION_NOT_SUPPORTED', `action ${action} is not a known event type`)])
    }
    if (subjectDid === task.requester_did) {
      return authorizeResult(record, task, body, 'ALLOW', [reason('REQUESTER_AUTHORITY', 'task requester may act without a delegation')])
    }
    if (record.status !== 'ACTIVE') {
      return authorizeResult(record, task, body, 'DENY', [reason('DELEGATION_INACTIVE', `delegation status is ${record.status}`)])
    }
    if (subjectDid !== record.subject_did) {
      return authorizeResult(record, task, body, 'DENY', [reason('SUBJECT_MISMATCH', 'delegation is not issued to this subject')])
    }
    const from = parseIso(record.valid_from)
    const to = parseIso(record.valid_to)
    if (from === null || to === null) {
      return authorizeResult(record, task, body, 'DEFER', [reason('DELEGATION_WINDOW_INVALID', 'delegation window cannot be parsed')])
    }
    if (at.getTime() < from.getTime()) {
      return authorizeResult(record, task, body, 'DEFER', [reason('DELEGATION_NOT_YET_VALID', 'delegation is not valid yet')])
    }
    if (at.getTime() > to.getTime()) {
      return authorizeResult(record, task, body, 'DENY', [reason('DELEGATION_EXPIRED', 'delegation has expired')])
    }
    const actions = Array.isArray(record.actions) ? record.actions : []
    if (!actions.includes(action)) {
      return authorizeResult(record, task, body, 'DENY', [reason('ACTION_SCOPE_EXCEEDED', `action ${action} is outside the delegation scope`)])
    }
    if (assetId !== record.asset_id || assetId !== task.asset_id) {
      return authorizeResult(record, task, body, 'DENY', [reason('ASSET_SCOPE_MISMATCH', 'asset_id does not match the delegation scope')])
    }
    if (amount > (numeric(record.amount_limit) ?? 0)) {
      return authorizeResult(record, task, body, 'DENY', [reason('QUOTA_EXCEEDED', 'amount exceeds the delegation amount_limit')])
    }
    if (amount > (numeric(record.daily_limit) ?? 0)) {
      return authorizeResult(record, task, body, 'DENY', [reason('DAILY_QUOTA_EXCEEDED', 'amount exceeds the delegation daily_limit')])
    }
    if (!chainValid(record, task)) {
      return authorizeResult(record, task, body, 'DENY', [reason('DELEGATION_CHAIN_INVALID', 'delegation parent chain is not trustworthy')])
    }
    return authorizeResult(record, task, body, 'ALLOW', [reason('AUTHORIZED', 'all delegation scopes are satisfied')])
  }

  return {
    create,
    list,
    get,
    revoke,
    authorize,
  }
}
