/**
 * Embedded trust-engine tools.
 *
 * Every handler maps its arguments onto one method of the in-process trust
 * plane and returns a canonical JSON value. There is no network hop: the tools
 * and the browser API share the same engine and the same persisted state.
 */
import { TOOL_DEFS } from './engine/tool-defs.js'
import { ServiceError, domainFromDid, fail, subjectFromDid } from './engine/core.js'
import {
  EMBEDDED_SOURCE,
  engineTool,
  failureFromServiceError,
  finiteNumber,
  optionalText,
  plainObject,
  succeeded,
  text,
} from './toolkit.js'

const DEFAULT_LIST_LIMIT = 50

/** Canonical success value for every embedded tool. */
function result(payload = {}) {
  return succeeded({ ...payload, source: EMBEDDED_SOURCE, authoritative: true })
}

function limitOf(args, fallback = DEFAULT_LIST_LIMIT) {
  const value = finiteNumber(args.limit)
  if (value === null || value <= 0) return fallback
  return Math.min(Math.trunc(value), 500)
}

function actorOf(plane, args) {
  return optionalText(args.actor_did) ?? plane.engine.defaultActor()
}

/** Default an event actor to the task requester recorded on the task. */
function requesterOf(plane, taskId) {
  const id = optionalText(taskId)
  if (id === undefined) return undefined
  try {
    return plane.tasks.get(id)?.requester_did
  } catch {
    return undefined
  }
}

function objectOf(value) {
  return plainObject(value) ?? {}
}

/**
 * Idempotency options for one tool dispatch.
 *
 * A Harness call id stays stable for every retry of the same call, so the
 * engine can safely replay an already-applied write instead of duplicating it.
 * Direct callers without a call id get a fresh key, which preserves the
 * engine's "one write per request" semantics.
 */
function writeOptions(exec, plane) {
  const callId = optionalText(exec?.callId)
  if (callId) return { idempotencyKey: callId }
  try {
    return { idempotencyKey: plane.engine.id('tool') }
  } catch {
    return {}
  }
}

/**
 * Options for handlers that pass their own options object to the engine.
 * Merges the dispatch idempotency key with handler-specific fields.
 */
function callOptions(exec, plane, extra = {}) {
  return { ...writeOptions(exec, plane), ...extra }
}

/** Engine surfaces whose methods take `options` as their last argument. */
const OPTION_SURFACES = [
  'identity',
  'credentials',
  'delegations',
  'tasks',
  'events',
  'risk',
  'interventions',
  'evidence',
  'cases',
  'knowledge',
  'governance',
  'assistant',
  'dashboard',
]

/**
 * Present the trust plane with per-dispatch options appended to every engine
 * call, so handlers do not repeat idempotency plumbing on every write.
 */
function withWriteOptions(plane, options) {
  if (plane === null || typeof plane !== 'object') return plane
  const view = { ...plane }
  for (const surface of OPTION_SURFACES) {
    const module = plane[surface]
    if (module === null || typeof module !== 'object') continue
    const wrapped = {}
    for (const [key, value] of Object.entries(module)) {
      wrapped[key] = typeof value === 'function' ? (...args) => value(...args, options) : value
    }
    view[surface] = wrapped
  }
  for (const key of ['authorize', 'receipt']) {
    if (typeof plane[key] === 'function') view[key] = (...args) => plane[key](...args, options)
  }
  return view
}

/**
 * Open a task draft that a delegation can reference.
 *
 * Legacy trust-plane flows created the payment task first and then delegated
 * payment rights to an operator agent. The embedded tools keep that bootstrap
 * path explicit: a draft task is a plain record in CREATED state and carries no
 * authorization, so it can never be read as an ALLOW.
 */
function createTaskDraft(plane, args) {
  const requesterDid = text(args.requester_did)
  if (requesterDid === '') {
    throw new ServiceError('VALIDATION_ERROR', 'requester_did is required to open a payment task draft', {
      status: 422,
    })
  }
  const amount = finiteNumber(args.amount)
  const domainId = text(args.domain_id) || domainFromDid(requesterDid)
  const metadata = { ...objectOf(args.metadata) }
  if (text(args.purpose) !== '') metadata.purpose = text(args.purpose)
  return plane.tasks.create({
    domain_id: domainId,
    requester_did: requesterDid,
    asset_id: text(args.asset_id) || text(args.currency),
    amount: amount === null ? undefined : amount,
    beneficiary: text(args.beneficiary),
    policy_version: optionalText(args.policy_version),
    metadata,
  })
}

/**
 * Map one tool name to the engine calls it performs.
 *
 * Handlers receive `(plane, args, exec)` and return the canonical success value.
 * They may throw `ServiceError`; `engineTool` converts that into a failure value
 * with a safe default decision.
 */
const HANDLERS = {
  register_identity: (plane, args) => {
    const domainId = text(args.domain_id) || text(args.domain) || domainFromDid(args.did)
    const subjectId = text(args.subject_id) || subjectFromDid(args.did)
    const identity = plane.identity.registerDid({
      domain_id: domainId,
      subject_id: subjectId,
      display_name: args.display_name,
      jurisdiction: args.jurisdiction,
      public_key: args.public_key,
      private_key: args.private_key,
    })
    return result({ identity })
  },

  get_identity_status: (plane, args) => {
    const identity = plane.identity.getDid(args.did)
    return result({ identity })
  },

  verify_credential: (plane, args) => {
    const verification = plane.credentials.verify({
      credential: args.credential ?? args.credential_id,
      required_claims: Array.isArray(args.required_claims) ? args.required_claims : [],
    })
    return result({ verification })
  },

  check_authorization: (plane, args) => {
    const amount = finiteNumber(args.amount)
    const authorization = plane.authorize({
      delegation_id: args.delegation_id,
      did: args.did,
      subject_did: args.did,
      action: args.action,
      asset_id: args.currency,
      currency: args.currency,
      amount,
      beneficiary: args.beneficiary,
      task_id: args.task_id,
    })
    return result({
      authorization: authorization.authorization,
      decision: authorization.decision,
      reasons: authorization.reasons,
    })
  },

  create_payment_task: (plane, args) => {
    const authorizationId = text(args.authorization_id)
    if (authorizationId === '') {
      // Bootstrap path: a CREATED draft task gives a delegation something to
      // reference; it carries no authorization and no execution state.
      return result({ task: createTaskDraft(plane, args), authorization_id: null })
    }
    const authorization = plane.requireAuthorization(authorizationId)
    const amount = authorization.amount
    const requesterDid = authorization.requester_did || authorization.subject_did
    const domainId = text(args.domain_id) || text(authorization.domain_id) || domainFromDid(requesterDid)
    const task = plane.tasks.create({
      domain_id: domainId,
      requester_did: requesterDid,
      asset_id: authorization.asset_id || authorization.currency,
      amount,
      beneficiary: text(args.beneficiary) || text(authorization.beneficiary),
      policy_version: args.policy_version,
      metadata: {
        ...objectOf(args.metadata),
        purpose: text(args.purpose) || objectOf(args.metadata).purpose,
        authorization_id: authorization.id,
        delegation_id: authorization.delegation_id,
      },
    })
    return result({ task, authorization_id: authorization.id })
  },

  submit_operation_event: (plane, args) => {
    const event = plane.events.create({
      event_id: args.event_id,
      task_id: args.task_id,
      event_type: args.event_type,
      actor_did: optionalText(args.actor_did) ?? requesterOf(plane, args.task_id) ?? actorOf(plane, args),
      payload: objectOf(args.payload),
      signature: args.signature,
      source_ref: args.source_ref,
      finality: args.finality,
      event_time: args.event_time,
      observed_at: args.observed_at,
      schema_version: args.schema_version,
      trace_id: args.trace_id,
      counterparty_did: args.counterparty_did,
      predecessors: args.predecessors,
      evidence_refs: args.evidence_refs,
      source_ledger: args.source_ledger,
      policy_version: args.policy_version,
    })
    return result({ event })
  },

  get_risk_decision: (plane, args) => {
    const risk = plane.risk.evaluate({
      task_id: args.task_id,
      event_id: args.event_id,
      subject_did: args.subject_did,
      features: objectOf(args.features),
      policy_version: args.policy_version,
      model_version: args.model_version,
    })
    return result({ risk, decision: risk.decision, evaluation_status: risk.evaluation_status })
  },

  request_step_up: (plane, args) => {
    const rationale = plainObject(args.rationale) ?? { reason: text(args.reason) || 'step-up requested' }
    const intervention = plane.interventions.decide({
      task_id: args.task_id,
      event_id: args.event_id,
      action: 'STEP_UP',
      rationale,
      policy_version: args.policy_version,
    })
    return result({ intervention })
  },

  get_execution_receipt: (plane, args) => {
    const receipt = plane.receipt({ task_id: args.task_id, receipt_id: args.receipt_id })
    return result({ receipt, status: receipt ? receipt.status : 'NOT_SETTLED' })
  },

  execute_intervention: (plane, args) => {
    const receipt = plane.interventions.execute(args.decision_id)
    return result({ receipt })
  },

  check_service_health: (plane) => {
    const health = { ...plane.health(), counts: plane.counts(), checked_at: plane.engine.iso(new Date()) }
    return result({ health })
  },

  resolve_identity_admission: (plane, args) => {
    const admission = plane.identity.admit({
      did: args.did,
      policy_version: args.policy_version,
      required_actions: args.required_actions,
      jurisdiction: args.jurisdiction,
    })
    return result({ admission })
  },

  verify_remote_credential: (plane, args) => {
    const verification = plane.credentials.verify({
      credential: args.credential,
      required_claims: Array.isArray(args.required_claims) ? args.required_claims : [],
    })
    return result({ verification })
  },

  read_payment_task: (plane, args) => {
    const task = plane.tasks.get(args.task_id)
    return result({ task })
  },

  list_payment_tasks: (plane, args) => {
    const tasks = plane.tasks.list({ limit: limitOf(args) })
    return result({ tasks })
  },

  read_delegation: (plane, args) => {
    const delegation = plane.delegations.get(args.delegation_id)
    return result({ delegation })
  },

  list_delegations: (plane, args) => {
    const delegations = plane.delegations.list({ task_id: args.task_id, limit: limitOf(args) })
    return result({ delegations })
  },

  read_delegation_chain: (plane, args) => {
    const read = plane.delegations.readChain(args.delegation_id, { actor: actorOf(plane, args) })
    return result({
      delegation: read.delegation,
      chain: read.chain,
      chain_length: read.chain_length,
      root_id: read.root_id,
      root_issuer_did: read.root_issuer_did,
      chain_trustworthy: read.chain_trustworthy,
      effective: read.effective,
    })
  },

  verify_operation_event: (plane, args) => {
    const verification = plane.events.verify(args.event_id)
    return result({ verification })
  },

  evaluate_remote_risk: (plane, args) => {
    const risk = plane.risk.evaluate({
      task_id: args.task_id,
      event_id: args.event_id,
      subject_did: args.subject_did,
      features: objectOf(args.features),
      policy_version: args.policy_version,
      model_version: args.model_version,
    })
    return result({ risk, decision: risk.decision, evaluation_status: risk.evaluation_status })
  },

  read_risk_evidence: (plane, args) => {
    const evidence = plane.risk.evidence({ task_id: args.task_id, limit: limitOf(args) })
    return result({ evidence })
  },

  propose_intervention: (plane, args) => {
    const intervention = plane.interventions.decide({
      task_id: args.task_id,
      event_id: args.event_id,
      action: args.action,
      rationale: objectOf(args.rationale),
      policy_version: args.policy_version,
    })
    return result({ intervention })
  },

  read_interventions: (plane, args) => {
    const interventions = plane.interventions.list({ limit: limitOf(args) })
    return result({ interventions })
  },

  read_trace_context: (plane, args) => {
    const { case: caseRecord, snapshot } = plane.cases.get(args.case_id)
    return result({ case: caseRecord, snapshot })
  },

  search_trust_knowledge: (plane, args) => {
    const search = plane.knowledge.search({
      query: args.query,
      jurisdiction: args.jurisdiction,
      effective_at: args.effective_at,
      limit: finiteNumber(args.limit) ?? 5,
    })
    return result({ query: search.query, results: search.results })
  },

  read_evidence: (plane, args) => {
    const evidence = plane.evidence.get(args.evidence_id)
    return result({ evidence })
  },

  ingest_evidence: (plane, args) => {
    const evidence = plane.evidence.create({
      case_id: args.case_id,
      source_type: args.source_type,
      source_ref: args.source_ref,
      content_hash: args.content_hash,
      sm3_hash: args.sm3_hash,
      content: args.content,
      storage_uri: args.storage_uri,
      metadata: objectOf(args.metadata),
    })
    return result({ evidence })
  },

  create_trace_case: (plane, args) => {
    const { case: caseRecord, snapshot } = plane.cases.trace(args.task_id, { created_by: actorOf(plane, args) })
    return result({ case: caseRecord, snapshot })
  },

  read_report: (plane, args) => {
    const report = plane.cases.getReport(args.report_id)
    return result({ report })
  },

  submit_governance_feedback: (plane, args) => {
    const feedback = plane.governance.feedback({
      case_id: args.case_id,
      subject_did: args.subject_did,
      label: args.label,
      reason: args.reason,
      evidence_refs: args.evidence_refs,
      submitted_by: args.submitted_by,
    })
    return result({ feedback })
  },

  read_dashboard_summary: (plane, args) => {
    const summary = plane.dashboard.summary({ actor: actorOf(plane, args) })
    return result({ summary })
  },

  query_audit_assistant: (plane, args) => {
    const answer = plane.assistant.query({ tool: args.tool, arguments: objectOf(args.arguments) })
    return result({ answer })
  },

  create_delegation: (plane, args) => {
    const delegation = plane.delegations.create({
      task_id: args.task_id,
      issuer_did: args.issuer_did,
      subject_did: args.subject_did,
      actions: args.actions,
      asset_id: args.asset_id,
      amount_limit: args.amount_limit,
      daily_limit: args.daily_limit,
      valid_from: args.valid_from,
      valid_to: args.valid_to,
      parent_id: args.parent_id,
      can_redelegate: args.can_redelegate,
      claims: objectOf(args.claims),
    })
    return result({ delegation })
  },

  revoke_delegation: (plane, args, exec) => {
    const delegation = plane.delegations.revoke(args.delegation_id, callOptions(exec, plane, {
      status: args.status,
      reason: args.reason,
    }))
    return result({ delegation })
  },

  issue_credential: (plane, args) => {
    const credential = plane.credentials.issue({
      credential_type: args.credential_type,
      issuer_did: args.issuer_did,
      subject_did: args.subject_did,
      claims: objectOf(args.claims),
      valid_from: args.valid_from,
      valid_to: args.valid_to,
    })
    return result({ credential })
  },

  read_credential: (plane, args) => {
    const credential = plane.credentials.get(args.credential_id)
    return result({ credential })
  },

  transition_payment_task: (plane, args) => {
    const task = plane.tasks.transition(args.task_id, { status: args.status, reason: args.reason })
    return result({ task })
  },

  /**
   * Close the settlement loop with cryptographic evidence.
   *
   * The tool signs a FINAL SETTLE event with the requester's embedded Ed25519
   * key, verifies it (signature + identity + authorization + ledger) and only
   * advances the task to CONFIRMED -> AUDITED -> CLOSED when verification is
   * VALID. Settlement is never claimed by bookkeeping alone.
   */
  settle_payment_task: (plane, args, exec) => {
    const task = plane.tasks.get(args.task_id)
    const status = String(task.status || '').toUpperCase()
    if (status !== 'SUBMITTED') {
      fail('TASK_NOT_SETTLEABLE', `task ${task.id} is ${status}; settlement requires SUBMITTED`, { status: 409 })
    }
    const actor = optionalText(args.actor_did) ?? task.requester_did
    const amount = finiteNumber(args.amount) ?? finiteNumber(task.amount)
    if (amount === null || amount <= 0) {
      fail('VALIDATION_ERROR', 'amount must be a positive number', { status: 422 })
    }
    const suffix = optionalText(args.settlement_ref) ?? plane.engine.id('settle')
    const sourceLedger = plainObject(args.source_ledger) ?? {
      scheme: 'embedded-ledger',
      finality: 'FINAL',
      reference: plane.engine.id('ledger'),
    }
    const draft = {
      task_id: task.id,
      event_type: 'SETTLE',
      actor_did: actor,
      payload: { amount, currency: task.asset_id, asset_id: task.asset_id, settlement_ref: suffix },
      source_ref: `settle-${task.id}-${suffix}`.slice(0, 250),
      finality: 'FINAL',
      event_time: args.event_time,
      observed_at: args.observed_at,
      trace_id: args.trace_id,
      source_ledger: sourceLedger,
      policy_version: args.policy_version,
    }
    const signed = plane.events.signDraft({ ...draft, event_id: optionalText(args.event_id) }, { ...callOptions(exec, plane), actor })
    const event = plane.events.create(
      { ...draft, event_id: signed.event_id, observed_at: signed.observed_at, signature: signed.signature },
      { ...callOptions(exec, plane), actor },
    )
    const verification = plane.events.verify(event.id, { ...callOptions(exec, plane), actor })
    const overall = String(verification.overall_status || '').toUpperCase()
    if (overall !== 'VALID') {
      fail('SETTLEMENT_NOT_PROVEN', `settlement verification is ${overall}, not VALID`, { status: 409 })
    }
    const transitions = []
    const baseKey = writeOptions(exec, plane).idempotencyKey ?? 'settle'
    for (const nextStatus of ['CONFIRMED', 'AUDITED', 'CLOSED']) {
      const updated = plane.tasks.transition(
        task.id,
        { status: nextStatus, reason: nextStatus === 'CLOSED' ? `signed FINAL settlement verified: ${event.id}` : 'settlement confirmed' },
        { ...callOptions(exec, plane), actor: task.requester_did, idempotencyKey: `${baseKey}:${nextStatus}` },
      )
      transitions.push({ status: updated.status, updated_at: updated.updated_at })
    }
    return result({
      event,
      verification,
      task: plane.tasks.get(task.id),
      settlement: { proof: 'signed-final-settlement', event_id: event.id, ledger: sourceLedger, transitions },
    })
  },

  create_trace_report: (plane, args) => {
    const report = plane.cases.createReport(args.case_id)
    return result({ report })
  },

  list_identities: (plane, args) => {
    const identities = plane.identity.listDids({ limit: limitOf(args), actor: actorOf(plane, args) })
    return result({ identities })
  },

  get_identity_keys: (plane, args) => {
    const keys = plane.identity.listDidKeys(args.did)
    return result({ did: args.did, keys })
  },

  rotate_identity_keys: (plane, args) => {
    const identity = plane.identity.rotateDid(args.did, {
      public_key: args.public_key,
      private_key: args.private_key,
      reason: args.reason,
    })
    return result({ identity })
  },

  set_identity_status: (plane, args) => {
    const identity = plane.identity.setDidStatus(args.did, { status: args.status, reason: args.reason })
    return result({ identity })
  },

  read_credential_status: (plane, args) => {
    const history = plane.credentials.statusHistory(args.credential_id)
    const credential = plane.credentials.get(args.credential_id)
    return result({ credential_id: args.credential_id, status: credential.status, history })
  },

  set_credential_status: (plane, args) => {
    const credential = plane.credentials.setStatus(args.credential_id, {
      status: args.status,
      reason: args.reason,
      actor_did: args.actor_did,
    })
    return result({ credential })
  },

  query_operation_events: (plane, args) => {
    const events = plane.events.list({ task_id: args.task_id, limit: limitOf(args) })
    return result({ events })
  },

  read_operation_event: (plane, args) => {
    const event = plane.events.get(args.event_id)
    return result({ event })
  },

  anchor_evidence: (plane, args) => {
    const anchor = plane.evidence.anchor(args.evidence_id)
    return result({ anchor })
  },

  read_evidence_anchors: (plane, args) => {
    const anchors = plane.evidence.anchors(args.evidence_id)
    return result({ evidence_id: args.evidence_id, anchors })
  },

  list_trace_cases: (plane, args) => {
    const cases = plane.cases.list({ limit: limitOf(args) })
    return result({ cases })
  },

  read_trace_case: (plane, args) => {
    const { case: caseRecord, snapshot } = plane.cases.get(args.case_id)
    return result({ case: caseRecord, snapshot })
  },

  read_case_trace: (plane, args) => {
    const trace = plane.cases.traceGet(args.case_id)
    return result({ trace })
  },

  list_case_reports: (plane, args) => {
    const reports = plane.cases.listReports(args.case_id)
    return result({ reports })
  },

  list_governance_policies: (plane, args) => {
    const policies = plane.governance.listPolicies({ domain_id: args.domain_id })
    return result({ policies })
  },

  publish_governance_policy: (plane, args) => {
    const policy = plane.governance.publishPolicy({
      policy_id: args.policy_id,
      domain_id: args.domain_id,
      version: args.version,
      package: objectOf(args.package),
      package_uri: args.package_uri,
      signed_by: args.signed_by,
      signature: args.signature,
      rollback_version: args.rollback_version,
    })
    return result({ policy })
  },

  list_governance_models: (plane, args) => {
    const models = plane.governance.listModels({ model_name: args.model_name })
    return result({ models })
  },

  publish_governance_model: (plane, args) => {
    const model = plane.governance.publishModel({
      model_id: args.model_id,
      model_name: args.model_name,
      digest: args.digest,
      artifact_uri: args.artifact_uri,
      metrics: plainObject(args.metrics),
      signed_by: args.signed_by,
    })
    return result({ model })
  },

  ingest_knowledge_document: (plane, args) => {
    const document = plane.knowledge.ingest({
      evidence_id: args.evidence_id,
      title: args.title,
      content: args.content,
      content_hash: args.content_hash,
      jurisdiction: args.jurisdiction,
      effective_from: args.effective_from,
      effective_to: args.effective_to,
      access_level: args.access_level,
      metadata: objectOf(args.metadata),
    })
    return result({ document })
  },

  publish_knowledge_document: (plane, args, exec) => {
    const document = plane.knowledge.publish(args.document_id, callOptions(exec, plane, { review_note: args.review_note }))
    return result({ document })
  },

  read_knowledge_document: (plane, args) => {
    const document = plane.knowledge.get(args.document_id)
    return result({ document })
  },

  read_metrics: (plane) => {
    const metrics = plane.dashboard.metricsText()
    const limit = 20000
    const truncated = metrics.length > limit
    return result({ metrics: truncated ? metrics.slice(0, limit) : metrics, length: metrics.length, truncated })
  },
}

/** Tool names in registration order, from the generated catalogue. */
export const TOOL_NAMES = TOOL_DEFS.map((definition) => definition.name)

/**
 * Build every embedded trust-engine tool definition.
 *
 * `execute_intervention` is only exposed when intervention execution is
 * explicitly enabled by configuration, because it records an execution receipt
 * that represents an action taken by a downstream system.
 *
 * @param resolvePlane - lazily resolves the provided `trustPlane` service.
 * @param options - `{ allowInterventionExecution }` (default `false`).
 */
export function createEngineTools(resolvePlane, { allowInterventionExecution = false } = {}) {
  return TOOL_DEFS.filter(
    ({ name }) => name !== 'execute_intervention' || allowInterventionExecution === true,
  ).map(({ name, description, parameters }) => {
    const handler = HANDLERS[name]
    if (typeof handler !== 'function') throw new Error(`missing handler for trust tool ${name}`)
    return engineTool(resolvePlane, {
      name,
      description,
      parameters,
      async execute(plane, args, exec) {
        try {
          const options = writeOptions(exec, plane)
          return await handler(withWriteOptions(plane, options), args ?? {}, exec)
        } catch (error) {
          return failureFromServiceError(error)
        }
      },
    })
  })
}
