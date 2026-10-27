/**
 * Deterministic risk scoring for the embedded trust plane.
 *
 * Ported from the control-plane `evaluate_risk` service. The scoring rules are
 * the same weighted feature model; only the decision thresholds are read from
 * `engine.policy` instead of being hard coded. A missing/unknown verification
 * never produces an ALLOW decision: it defers with an explicit status.
 */
import { domainFromDid, fail, newId } from './core.js'

export const RISK_WEIGHTS = Object.freeze({
  velocity: 0.25,
  amount_deviation: 0.25,
  new_counterparty: 0.2,
  cross_chain_hops: 0.15,
  identity_unknown: 0.15,
})

export const RISK_FEATURE_LABELS = Object.freeze({
  velocity: '短时频次升高',
  amount_deviation: '金额偏离基线',
  new_counterparty: '新对手方比例升高',
  cross_chain_hops: '跨链跳转增多',
  identity_unknown: '身份或授权证明未知',
})

export const DEFAULT_MODEL_VERSION = 'rules-2026-10-25-001'
export const RISK_DECISIONS = Object.freeze(['ALLOW', 'WARN', 'THROTTLE', 'STEP_UP', 'DEFER', 'BLOCK', 'FREEZE'])

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

function clampLimit(value, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(1, Math.min(Math.trunc(number), LIMIT_MAX))
}

function failValidation(message) {
  fail('VALIDATION_ERROR', message, { status: 422 })
}

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.trim())
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function round6(value) {
  return Math.round(value * 1e6) / 1e6
}

function idempotencyKey(engine, scope, body, options, actor, fallback) {
  const opts = normalizeOptions(options)
  const explicit = opts.idempotencyKey ?? opts.idempotency_key ?? opts.key
  if (explicit) return `${scope}:${String(explicit)}`
  if (fallback) return `${scope}:${fallback}`
  return `${scope}:auto:${engine.hash(body, { actor })}`
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

function normalizeFeatures(value) {
  if (value === undefined || value === null) return {}
  if (typeof value !== 'object' || Array.isArray(value)) failValidation('features must be an object')
  return value
}

function normalizeEvaluate(engine, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) failValidation('risk evaluate request must be an object')
  if (typeof payload.task_id !== 'string' || payload.task_id.trim() === '') failValidation('task_id is required')
  if (typeof payload.subject_did !== 'string' || payload.subject_did.trim() === '') failValidation('subject_did is required')
  const eventId = payload.event_id === undefined || payload.event_id === null ? null : String(payload.event_id)
  const requestedPolicy = payload.policy_version ?? payload.policyVersion
  const policyVersion = requestedPolicy === undefined || requestedPolicy === null ? engine.policy.policyVersion : String(requestedPolicy)
  if (policyVersion.length < 3 || policyVersion.length > 120) failValidation('policy_version must be a string of 3-120 characters')
  const modelVersion = payload.model_version ?? payload.modelVersion ?? DEFAULT_MODEL_VERSION
  if (typeof modelVersion !== 'string' || modelVersion.length < 2 || modelVersion.length > 120) failValidation('model_version must be a string of 2-120 characters')
  return {
    task_id: payload.task_id.trim(),
    event_id: eventId,
    subject_did: payload.subject_did.trim(),
    features: normalizeFeatures(payload.features),
    policy_version: policyVersion,
    model_version: modelVersion,
  }
}

function storedFeatures(features, evaluationStatus, decision) {
  return { ...features, _evaluation_status: evaluationStatus, _decision: decision }
}

function riskEvidenceResponse(record) {
  const feature = record.feature && typeof record.feature === 'object' ? record.feature : {}
  return {
    id: record.id,
    task_id: record.task_id,
    event_id: record.event_id ?? null,
    score: record.score,
    decision: feature._decision ?? record.decision,
    reasons: Array.isArray(record.reasons) ? record.reasons : [],
    feature,
    evaluation_status: feature._evaluation_status ?? record.evaluation_status,
    policy_version: record.policy_version,
    model_version: record.model_version,
    created_at: record.created_at,
  }
}

/* ------------------------------------------------------------------ */
/* engine                                                              */
/* ------------------------------------------------------------------ */

/**
 * @param {import('./core.js').Engine} engine
 */
export function createRiskEngine(engine) {
  if (!engine) throw new TypeError('createRiskEngine requires an Engine instance')

  function evaluate(payload = {}, options = {}) {
    const actor = actorOf(engine, options)
    const body = normalizeEvaluate(engine, payload)
    const fallback = `legacy-risk-${body.task_id}-${body.event_id || 'task'}`
    const key = idempotencyKey(engine, 'risk.evaluate', body, options, actor, fallback)
    return engine.idempotent(key, { ...body, features: body.features }, () => evaluateNow(body, actor))
  }

  function evaluateNow(body, actor) {
    const task = engine.state.tasks ? engine.state.tasks[body.task_id] : null
    if (!task) fail('TASK_NOT_FOUND', `task not found: ${body.task_id}`, { status: 404 })
    requireTaskAccess(engine, task, actor)
    requireActiveDid(engine, body.subject_did)
    let verificationStatus = null
    if (body.event_id) {
      const event = engine.state.events ? engine.state.events[body.event_id] : null
      if (!event || event.task_id !== task.id) {
        fail('EVENT_TASK_MISMATCH', '风险评估事件不属于当前任务', { status: 409 })
      }
      const verification = engine.state.verifications ? engine.state.verifications[body.event_id] : null
      if (verification) verificationStatus = String(verification.overall_status || '').toUpperCase()
    }

    // Weighted feature model: booleans become 0/1, finite numbers are clamped
    // to [0, 1]; unknown features are not part of the score.
    const factors = {}
    for (const key of Object.keys(body.features)) {
      if (!Object.prototype.hasOwnProperty.call(RISK_WEIGHTS, key)) continue
      const value = body.features[key]
      if (typeof value === 'boolean') {
        factors[key] = value ? 1 : 0
      } else if (typeof value === 'number' && Number.isFinite(value)) {
        factors[key] = Math.min(1, Math.max(0, value))
      }
    }
    let evaluationStatus = Object.keys(factors).length > 0 ? 'VALID' : 'NOT_EVALUABLE'
    let hardInvalid = false
    if (verificationStatus && verificationStatus !== 'VALID') {
      factors.identity_unknown = 1
      if (verificationStatus === 'UNKNOWN') evaluationStatus = 'UNKNOWN'
      else {
        evaluationStatus = 'VALID'
        hardInvalid = true
      }
    }
    let score = 0
    for (const key of Object.keys(factors)) score += RISK_WEIGHTS[key] * factors[key]
    score = round6(Math.min(1, score))
    const reasons = Object.keys(RISK_FEATURE_LABELS)
      .filter((key) => typeof factors[key] === 'number' && factors[key] >= 0.6)
      .map((key) => RISK_FEATURE_LABELS[key])
    if (reasons.length === 0) reasons.push(evaluationStatus === 'VALID' ? '未发现超过当前策略阈值的风险特征' : '缺少可比较的风险特征')

    const policy = engine.policy
    let decision
    if (hardInvalid) {
      decision = 'BLOCK'
    } else if (evaluationStatus === 'NOT_EVALUABLE' || evaluationStatus === 'UNKNOWN') {
      decision = 'DEFER'
    } else if (score >= policy.riskBlockThreshold) {
      decision = 'BLOCK'
    } else if (score >= policy.riskDeferThreshold) {
      decision = 'DEFER'
    } else if (score >= policy.riskThrottleThreshold) {
      decision = 'THROTTLE'
    } else {
      decision = 'ALLOW'
    }
    const evaluation = {
      verification_status: verificationStatus,
      factors,
      weights: RISK_WEIGHTS,
      thresholds: {
        block: policy.riskBlockThreshold,
        defer: policy.riskDeferThreshold,
        throttle: policy.riskThrottleThreshold,
      },
      decision,
    }
    const stored = storedFeatures(body.features, evaluationStatus, decision)
    const evidenceId = newId('risk')
    const trustSnapshotId = newId('trust')
    const now = engine.iso()
    const trustScore = round6(1 - score)
    const trustSnapshot = {
      id: trustSnapshotId,
      subject_did: body.subject_did,
      task_id: task.id,
      event_id: body.event_id,
      score: trustScore,
      decision,
      evidence_refs: [evidenceId],
      policy_version: body.policy_version,
      model_version: body.model_version,
      created_at: now,
    }
    const record = {
      id: evidenceId,
      task_id: task.id,
      event_id: body.event_id,
      score,
      reasons,
      feature: stored,
      evaluation_status: evaluationStatus,
      decision,
      trust_score: trustScore,
      trust_snapshot: trustSnapshot,
      policy_version: body.policy_version,
      model_version: body.model_version,
      created_at: now,
    }
    engine.collection('risk_evidence')[evidenceId] = record
    engine.audit('risk.evaluate', actor, 'risk_evidence', evidenceId, {
      task_id: task.id,
      event_id: body.event_id,
      score,
      decision,
      evaluation_status: evaluationStatus,
      policy_version: body.policy_version,
      evidence_refs: [evidenceId],
    })
    engine.save()
    return {
      evidence_id: evidenceId,
      trust_snapshot_id: trustSnapshotId,
      score,
      trust_score: trustScore,
      decision,
      reasons,
      feature: stored,
      evaluation_status: evaluationStatus,
      policy_version: body.policy_version,
      model_version: body.model_version,
      evaluation,
    }
  }

  function evidence(query = {}) {
    const actor = actorOf(engine, query)
    const limit = clampLimit(query.limit, LIMIT_DEFAULT)
    const domain = actorDomain(engine, actor)
    const taskId = query.task_id ?? query.taskId
    if (taskId !== undefined && taskId !== null && typeof taskId !== 'string') failValidation('task_id must be a string')
    let records = valuesOf(engine.state.risk_evidence)
    if (taskId) records = records.filter((record) => record.task_id === taskId)
    if (domain !== null) {
      records = records.filter((record) => {
        const task = engine.state.tasks ? engine.state.tasks[record.task_id] : null
        return task && String(task.domain_id) === String(domain)
      })
    }
    records.sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || '')))
    return records.slice(0, limit).map(riskEvidenceResponse)
  }

  function getEvidence(evidenceId, options = {}) {
    const record = engine.state.risk_evidence ? engine.state.risk_evidence[evidenceId] : null
    if (!record) fail('RISK_EVIDENCE_NOT_FOUND', `risk evidence not found: ${evidenceId}`, { status: 404 })
    const task = engine.state.tasks ? engine.state.tasks[record.task_id] : null
    if (task) requireTaskAccess(engine, task, actorOf(engine, options))
    return riskEvidenceResponse(record)
  }

  return { evaluate, evidence, getEvidence }
}
