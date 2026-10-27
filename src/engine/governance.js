/**
 * Governance records: labels attached to cases, and the published policy /
 * model versions the deterministic engine runs under. Publishing is a signed
 * write: the caller must be the signer (system actors may publish on behalf of
 * the deployment), and re-publishing different bytes under an existing version
 * is a conflict rather than a silent overwrite.
 */
import { clone, fail, sha256Hex } from './core.js'

const LABELS = new Set(['CONFIRMED', 'FALSE_POSITIVE', 'WITHDRAWN', 'NEEDS_MORE_EVIDENCE'])
const RESOLVING_LABELS = new Set(['CONFIRMED', 'FALSE_POSITIVE', 'WITHDRAWN'])

function assertText(value, field, min, max) {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    fail('VALIDATION_ERROR', `${field} must be a string of ${min}-${max} characters`, { status: 422 })
  }
}

function assertObject(value, field) {
  if (value === undefined || value === null) return {}
  if (typeof value !== 'object' || Array.isArray(value)) {
    fail('VALIDATION_ERROR', `${field} must be an object`, { status: 422 })
  }
  return value
}

function requireIdempotency(options) {
  if (!options.idempotencyKey) {
    fail('IDEMPOTENCY_KEY_REQUIRED', 'write calls require an idempotency key', { status: 400 })
  }
  return options.idempotencyKey
}

function actorOf(engine, options) {
  return options.actor || engine.defaultActor()
}

function assertSigner(actor, signedBy) {
  if (!actor.startsWith('system:') && actor !== signedBy) {
    fail('ACTOR_MISMATCH', 'the actor must match the signer', { status: 403 })
  }
}

export function createGovernanceEngine(engine) {
  function feedbackCollection() {
    return engine.collection('feedback')
  }

  function policyCollection() {
    return engine.collection('policies')
  }

  function modelCollection() {
    return engine.collection('models')
  }

  function feedback(payload = {}, options = {}) {
    const idempotencyKey = requireIdempotency(options)
    const actor = actorOf(engine, options)
    if (!LABELS.has(payload.label)) {
      fail('VALIDATION_ERROR', 'label must be one of CONFIRMED, FALSE_POSITIVE, WITHDRAWN, NEEDS_MORE_EVIDENCE', { status: 422 })
    }
    assertText(payload.reason, 'reason', 3, 4000)
    assertText(payload.submitted_by, 'submitted_by', 2, 250)
    const evidenceRefs = payload.evidence_refs === undefined ? [] : payload.evidence_refs
    if (!Array.isArray(evidenceRefs)) fail('VALIDATION_ERROR', 'evidence_refs must be an array', { status: 422 })
    for (const evidenceId of evidenceRefs) {
      if (typeof evidenceId !== 'string') fail('VALIDATION_ERROR', 'evidence_refs must contain strings', { status: 422 })
      engine.require('evidence', evidenceId, 'EVIDENCE_NOT_FOUND', 'evidence not found')
    }
    if (actor !== payload.submitted_by && !actor.startsWith('system:')) {
      fail('ACTOR_MISMATCH', 'the caller must match submitted_by', { status: 403 })
    }
    if (payload.case_id) engine.require('cases', payload.case_id, 'CASE_NOT_FOUND', 'case not found')

    return engine.idempotent(`feedback.create:${idempotencyKey}`, payload, () => {
      const record = {
        id: engine.id('feedback'),
        case_id: payload.case_id || null,
        subject_did: payload.subject_did || null,
        label: payload.label,
        reason: payload.reason,
        evidence_refs: evidenceRefs.map(String),
        submitted_by: payload.submitted_by,
        created_at: engine.iso(),
      }
      feedbackCollection()[record.id] = record
      if (record.case_id && RESOLVING_LABELS.has(record.label)) {
        const caseRecord = engine.state.cases[record.case_id]
        if (caseRecord) caseRecord.status = 'RESOLVED'
      }
      engine.audit('feedback.record', actor, 'feedback', record.id, { case_id: record.case_id, label: record.label })
      engine.save()
      return { feedback_id: record.id, status: 'RECORDED' }
    })
  }

  function policyResponse(record) {
    return clone({
      id: record.id,
      domain_id: record.domain_id,
      digest: record.digest,
      package_uri: record.package_uri,
      status: record.status,
      signed_by: record.signed_by,
      created_at: record.created_at,
    })
  }

  function publishPolicy(payload = {}, options = {}) {
    const idempotencyKey = requireIdempotency(options)
    const actor = actorOf(engine, options)
    assertText(payload.policy_id, 'policy_id', 2, 120)
    assertText(payload.domain_id, 'domain_id', 2, 120)
    assertText(payload.version, 'version', 1, 80)
    assertText(payload.signed_by, 'signed_by', 2, 250)
    const policyPackage = assertObject(payload.package, 'package')
    const packageUri = payload.package_uri === undefined ? 'inline://policy' : payload.package_uri
    assertText(packageUri, 'package_uri', 2, 500)
    assertSigner(actor, payload.signed_by)
    const digest = sha256Hex(policyPackage)
    const id = `${payload.policy_id}:${payload.version}`

    return engine.idempotent(`governance.policy:${idempotencyKey}`, payload, () => {
      const existing = policyCollection()[id]
      if (existing) {
        if (existing.digest !== digest) {
          fail('POLICY_VERSION_CONFLICT', 'this policy version was already published with different content', { status: 409 })
        }
        return policyResponse(existing)
      }
      const record = {
        id,
        domain_id: payload.domain_id,
        digest,
        package_uri: packageUri,
        status: 'ACTIVE',
        signed_by: payload.signed_by,
        package: clone(policyPackage),
        created_at: engine.iso(),
      }
      policyCollection()[id] = record
      engine.audit('governance.policy.publish', actor, 'policy_version', id, { digest })
      engine.save()
      return policyResponse(record)
    })
  }

  function modelResponse(record) {
    return clone({
      id: record.id,
      model_name: record.model_name,
      digest: record.digest,
      artifact_uri: record.artifact_uri,
      status: record.status,
      metrics: record.metrics,
      created_at: record.created_at,
    })
  }

  function publishModel(payload = {}, options = {}) {
    const idempotencyKey = requireIdempotency(options)
    const actor = actorOf(engine, options)
    assertText(payload.model_id, 'model_id', 2, 120)
    assertText(payload.model_name, 'model_name', 2, 120)
    assertText(payload.digest, 'digest', 16, 128)
    assertText(payload.artifact_uri, 'artifact_uri', 2, 500)
    assertText(payload.signed_by, 'signed_by', 2, 250)
    const metrics = assertObject(payload.metrics, 'metrics')
    assertSigner(actor, payload.signed_by)
    const id = payload.model_id

    return engine.idempotent(`governance.model:${idempotencyKey}`, payload, () => {
      const existing = modelCollection()[id]
      if (existing) {
        if (existing.digest !== payload.digest) {
          fail('MODEL_VERSION_CONFLICT', 'this model was already published with a different digest', { status: 409 })
        }
        return modelResponse(existing)
      }
      const record = {
        id,
        model_name: payload.model_name,
        digest: payload.digest,
        artifact_uri: payload.artifact_uri,
        status: 'ACTIVE',
        metrics: clone(metrics),
        signed_by: payload.signed_by,
        created_at: engine.iso(),
      }
      modelCollection()[id] = record
      engine.audit('governance.model.publish', actor, 'model_version', id, { digest: record.digest })
      engine.save()
      return modelResponse(record)
    })
  }

  function listPolicies(options = {}) {
    const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 200)
    return Object.values(policyCollection())
      .filter((record) => !options.domain_id || record.domain_id === options.domain_id)
      .sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)))
      .slice(0, limit)
      .map(policyResponse)
  }

  function listModels(options = {}) {
    const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 200)
    return Object.values(modelCollection())
      .filter((record) => !options.model_name || record.model_name === options.model_name)
      .sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)))
      .slice(0, limit)
      .map(modelResponse)
  }

  return { feedback, publishPolicy, publishModel, listPolicies, listModels }
}
