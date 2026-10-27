/**
 * Facade for the embedded trust plane.
 *
 * Every tool and every browser API route goes through this object. All state
 * lives in `engine.state` and is persisted by the plugin's store; there is no
 * sidecar service, no port and no Python dependency.
 */
import { Engine, ServiceError, clone, newId, nowIso, publicSettings, validateSettingsPatch } from './core.js'
import { createIdentityEngine } from './identity.js'
import { createCredentialEngine } from './credentials.js'
import { createDelegationEngine } from './delegations.js'
import { createTaskEngine } from './tasks.js'
import { createEventEngine } from './events.js'
import { createRiskEngine } from './risk.js'
import { createInterventionEngine } from './interventions.js'
import { createEvidenceEngine } from './evidence.js'
import { createCaseEngine } from './cases.js'
import { createKnowledgeEngine } from './knowledge.js'
import { createGovernanceEngine } from './governance.js'
import { createAssistantEngine } from './assistant.js'
import { createDashboardEngine } from './dashboard.js'

export const EMBEDDED_SCHEMA_REVISION = 'embedded-1'

const ACTOR = Symbol('trust-plane-actor')

/**
 * @param {{ settings?: object, store?: import('./core.js').FileStore|import('./core.js').MemoryStore, logger?: object, mode?: string, startedAt?: string }} options
 */
export function createTrustPlane({ settings = {}, store = null, logger = null, mode = 'embedded', startedAt = nowIso() } = {}) {
  const engine = new Engine({ settings, store, logger, startedAt })
  const plane = {
    engine,
    mode,
    logger,
    identity: createIdentityEngine(engine),
    credentials: createCredentialEngine(engine),
    delegations: createDelegationEngine(engine),
    tasks: createTaskEngine(engine),
    events: createEventEngine(engine),
    risk: createRiskEngine(engine),
    interventions: createInterventionEngine(engine),
    evidence: createEvidenceEngine(engine),
    cases: createCaseEngine(engine),
    knowledge: createKnowledgeEngine(engine),
    governance: createGovernanceEngine(engine),
    assistant: createAssistantEngine(engine),
    dashboard: createDashboardEngine(engine),
  }

  /**
   * Authorize a delegated action. The result is cached in the session state so
   * `create_payment_task` can require a fresh ALLOW from this process.
   */
  plane.authorize = (input = {}) => {
    const result = plane.delegations.authorize({
      delegation_id: input.delegation_id,
      subject_did: input.subject_did || input.did,
      action: input.action || 'PAYREQ',
      asset_id: input.asset_id || input.currency,
      amount: input.amount,
      at: input.at,
    })
    const authorization = {
      id: newId('authorization'),
      decision: result.decision,
      reasons: result.reasons || [],
      delegation_id: input.delegation_id || null,
      subject_did: input.subject_did || input.did || null,
      action: (input.action || 'PAYREQ').toUpperCase(),
      asset_id: input.asset_id || input.currency || null,
      amount: input.amount,
      currency: input.currency || null,
      beneficiary: input.beneficiary || null,
      requester_did: result.requester_did || null,
      domain_id: result.domain_id || null,
      task_id: input.task_id || null,
      policy_version: engine.policy.policyVersion,
      created_at: nowIso(),
    }
    if (result.decision !== 'ALLOW') {
      return { authorization, decision: result.decision, reasons: result.reasons || [] }
    }
    const authorizations = engine.collection('authorizations')
    authorizations[authorization.id] = authorization
    engine.audit('authorize_delegation', engine.defaultActor(), 'authorization', authorization.id, { decision: authorization.decision })
    engine.save()
    return { authorization, decision: result.decision, reasons: result.reasons || [] }
  }

  plane.requireAuthorization = (authorizationId) => {
    const authorizations = engine.collection('authorizations')
    const authorization = authorizations[authorizationId]
    if (!authorization) {
      throw new ServiceError('TRUST_AUTHORIZATION_REQUIRED', 'run check_authorization before creating a payment task', { status: 409 })
    }
    if (authorization.decision !== 'ALLOW') {
      throw new ServiceError('TRUST_AUTHORIZATION_REQUIRED', `authorization is ${authorization.decision}`, { status: 409 })
    }
    return clone(authorization)
  }

  plane.receipt = ({ receipt_id, decision_id, task_id } = {}) => {
    const receipts = engine.collection('receipts')
    if (receipt_id && receipts[receipt_id]) return clone(receipts[receipt_id])
    const all = Object.values(receipts)
    const match =
      (decision_id && all.find((item) => item.decision_id === decision_id)) ||
      (task_id && all.find((item) => item.task_id === task_id)) ||
      null
    return match ? clone(match) : null
  }

  plane.health = () => ({
    status: 'ok',
    engine: 'embedded',
    mode: plane.mode,
    service: 'dsh-embedded-trust-plane',
    schema_revision: EMBEDDED_SCHEMA_REVISION,
    started_at: engine.startedAt,
  })

  plane.settingsSnapshot = () => ({
    mode: plane.mode,
    settings: publicSettings(engine),
    defaults: {
      actorDid: engine.startupSettings.actorDid,
      allowInterventionExecution: engine.startupSettings.allowInterventionExecution,
      policy: engine.startupSettings.policy,
    },
  })

  plane.updateSettings = (patch) => {
    validateSettingsPatch(patch)
    const updated = engine.updateSettings(patch)
    engine.audit('update_settings', engine.defaultActor(), 'settings', 'trust-platform', { fields: Object.keys(patch || {}) })
    return { settings: publicSettings(engine), saved_at: nowIso(), updated }
  }

  plane.reset = () => {
    const counts = engine.resetData()
    engine.audit('reset_data', engine.defaultActor(), 'settings', 'trust-platform', counts)
    return counts
  }

  plane.activity = (limit) => engine.activity(limit)
  plane.counts = () => engine.counts()
  plane.flush = () => engine.flush()

  return plane
}

export { ServiceError }
