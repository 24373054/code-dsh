import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-trust-platform'
export const inject = ['tools']

const output = { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }] }
const text = (value) => typeof value === 'string' ? value.trim() : ''
const id = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

function result(ok, data, message) {
  return ok ? { ok: true, ...data } : { ok: false, code: 'TRUST_VALIDATION_FAILED', message, decision: 'DEFER' }
}

export function apply(ctx) {
  const identities = new Map()
  const credentials = new Map()
  const authorizations = new Map()
  const tasks = new Map()
  const events = []
  const cases = new Map()
  const receipts = new Map()

  const register = (definition) => ctx.tools.register(defineTool({ ...definition, output }))

  register({ name: 'register_identity', description: 'Register a cross-domain agent identity. This records intent only; it never grants payment authority.', parameters: { did: { type: 'string', required: true }, domain: { type: 'string', required: true }, display_name: { type: 'string' } }, execute(args) { const did = text(args.did); const domain = text(args.domain); if (!did || !domain) return result(false, {}, 'did and domain are required'); const record = { did, domain, display_name: text(args.display_name) || did, status: 'PENDING_VERIFICATION', created_at: new Date().toISOString() }; identities.set(did, record); return result(true, { identity: record }, '') } })
  register({ name: 'get_identity_status', description: 'Read the current verification status of an agent identity.', parameters: { did: { type: 'string', required: true } }, execute(args) { const identity = identities.get(text(args.did)); return identity ? result(true, { identity }, '') : result(false, {}, 'identity not found') } })
  register({ name: 'verify_credential', description: 'Verify a credential reference and return an auditable decision. Do not treat model claims as credentials.', parameters: { did: { type: 'string', required: true }, credential_type: { type: 'string', required: true }, credential_ref: { type: 'string', required: true } }, execute(args) { const did = text(args.did); const ref = text(args.credential_ref); if (!identities.has(did)) return result(false, {}, 'identity must be registered first'); const record = { id: id('cred'), did, credential_type: text(args.credential_type), credential_ref: ref, status: ref ? 'VERIFIED' : 'NOT_EVALUABLE', verified_at: new Date().toISOString() }; credentials.set(record.id, record); return result(record.status === 'VERIFIED', { credential: record }, 'credential reference is empty') } })
  register({ name: 'check_authorization', description: 'Evaluate delegated authority for a payment intent. A model cannot approve its own authority.', parameters: { did: { type: 'string', required: true }, beneficiary: { type: 'string', required: true }, amount: { type: 'number', required: true }, currency: { type: 'string', required: true } }, execute(args) { const amount = Number(args.amount); const allowed = identities.has(text(args.did)) && amount > 0 && amount <= 10000 && text(args.currency).length === 3; const record = { id: id('auth'), did: text(args.did), beneficiary: text(args.beneficiary), amount, currency: text(args.currency).toUpperCase(), decision: allowed ? 'ALLOW' : 'DEFER', policy_version: 'policy-demo-001' }; authorizations.set(record.id, record); return result(allowed, { authorization: record }, 'identity, amount, or currency failed deterministic policy') } })
  register({ name: 'create_payment_task', description: 'Create a payment task for downstream execution review. This tool never moves funds.', parameters: { authorization_id: { type: 'string', required: true }, purpose: { type: 'string', required: true } }, execute(args) { const authorization = authorizations.get(text(args.authorization_id)); if (!authorization || authorization.decision !== 'ALLOW') return result(false, {}, 'an ALLOW authorization is required'); const task = { id: id('task'), authorization_id: authorization.id, purpose: text(args.purpose), status: 'PENDING_EXECUTION_GATEWAY', created_at: new Date().toISOString() }; tasks.set(task.id, task); return result(true, { task }, '') } })
  register({ name: 'submit_operation_event', description: 'Append a signed-operation evidence record for replay and traceability.', parameters: { task_id: { type: 'string', required: true }, event_type: { type: 'string', required: true }, event_ref: { type: 'string', required: true } }, execute(args) { const task = tasks.get(text(args.task_id)); if (!task) return result(false, {}, 'task not found'); const event = { id: id('evt'), task_id: task.id, event_type: text(args.event_type), event_ref: text(args.event_ref), observed_at: new Date().toISOString() }; events.push(event); return result(true, { event }, '') } })
  register({ name: 'get_risk_decision', description: 'Return a deterministic risk decision with evidence references; risk never replaces authorization.', parameters: { task_id: { type: 'string', required: true } }, execute(args) { const task = tasks.get(text(args.task_id)); if (!task) return result(false, {}, 'task not found'); const evidence = events.filter((event) => event.task_id === task.id).map((event) => event.id); return result(true, { decision: { task_id: task.id, decision: evidence.length ? 'REVIEW' : 'DEFER', evidence_refs: evidence, model_version: 'rules-0.1' } }, '') } })
  register({ name: 'request_step_up', description: 'Request stronger human or credential verification before continuing a sensitive operation.', parameters: { task_id: { type: 'string', required: true }, reason: { type: 'string', required: true } }, execute(args) { const task = tasks.get(text(args.task_id)); if (!task) return result(false, {}, 'task not found'); return result(true, { task_id: task.id, challenge_id: id('stepup'), status: 'REQUIRED', reason: text(args.reason) }, '') } })
  register({ name: 'get_execution_receipt', description: 'Read the execution gateway receipt. Absence is not proof of settlement.', parameters: { task_id: { type: 'string', required: true } }, execute(args) { const receipt = receipts.get(text(args.task_id)); return receipt ? result(true, { receipt }, '') : result(true, { receipt: null, status: 'NOT_SETTLED' }, '') } })
  const remote = ctx.get?.('trustPlatformClient')
  const remoteTool = (name, description, operation, parameters, map = (args) => [args, {}]) => register({ name, description, parameters, async execute(args) { if (!remote) return result(false, {}, 'control-plane adapter is not configured'); const [payload, options] = map(args); try { return result(true, { data: await remote.request(operation, payload, options) }, '') } catch (error) { return result(false, { error_code: error.code, retryable: error.retryable }, error.message) } } })
  remoteTool('check_service_health', 'Read control-plane health and readiness.', 'health', {})
  remoteTool('resolve_identity_admission', 'Evaluate DID admission without mutating identity state.', 'identityAdmission', { did: { type: 'string', required: true }, required_actions: { type: 'array' }, jurisdiction: { type: 'string' } })
  remoteTool('verify_remote_credential', 'Verify a W3C credential and preserve UNKNOWN or NOT_EVALUABLE outcomes.', 'verifyCredential', { credential: { type: 'object', additionalProperties: true, required: true }, required_claims: { type: 'array' } })
  remoteTool('read_payment_task', 'Read an actor-scoped payment task.', 'task', { task_id: { type: 'string', required: true } }, (args) => [{}, { id: args.task_id }])
  remoteTool('list_payment_tasks', 'List actor/domain-scoped payment tasks.', 'tasks', { task_id: { type: 'string' } })
  remoteTool('read_delegation', 'Read an actor-scoped delegation.', 'delegation', { delegation_id: { type: 'string', required: true } }, (args) => [{}, { id: args.delegation_id }])
  remoteTool('list_delegations', 'List actor/domain-scoped delegations.', 'delegations', { task_id: { type: 'string' } })
  remoteTool('verify_operation_event', 'Verify identity, authorization, ledger and overall event status.', 'eventVerify', { event_id: { type: 'string', required: true } }, (args) => [{}, { id: args.event_id }])
  remoteTool('evaluate_remote_risk', 'Evaluate risk evidence; this cannot authorize payment.', 'riskEvaluate', { task_id: { type: 'string', required: true }, event_id: { type: 'string' }, features: { type: 'object', additionalProperties: true } })
  remoteTool('read_risk_evidence', 'Read risk evidence for an actor-scoped task.', 'riskEvidence', { task_id: { type: 'string' } })
  remoteTool('propose_intervention', 'Propose ALLOW/WARN/THROTTLE/STEP_UP/DEFER/BLOCK/FREEZE policy outcome without execution.', 'interventionDecide', { task_id: { type: 'string', required: true }, action: { type: 'string', required: true }, rationale: { type: 'string', required: true } })
  remoteTool('read_interventions', 'Read actor-scoped intervention decisions.', 'interventions', { task_id: { type: 'string' } })
  remoteTool('read_trace_context', 'Read a case trace graph for post-operation accountability.', 'traceCase', { case_id: { type: 'string', required: true } }, (args) => [{}, { id: args.case_id }])
  remoteTool('search_trust_knowledge', 'Search domain-filtered knowledge used for audit context.', 'knowledgeSearch', { query: { type: 'string', required: true }, limit: { type: 'number' } })
  remoteTool('read_evidence', 'Read redacted evidence metadata and hashes.', 'evidence', { evidence_id: { type: 'string', required: true } }, (args) => [{}, { id: args.evidence_id }])
  remoteTool('ingest_evidence', 'Ingest hashed evidence for audit; anchoring remains a separate controlled process.', 'evidenceIngest', { case_id: { type: 'string', required: true }, source_type: { type: 'string', required: true }, source_ref: { type: 'string', required: true }, content_hash: { type: 'string', required: true } })
  remoteTool('create_trace_case', 'Create a trace case for a task.', 'caseCreate', { task_id: { type: 'string', required: true } }, (args) => [{}, { id: args.task_id }])
  remoteTool('read_report', 'Read a generated accountability report.', 'reportRead', { report_id: { type: 'string', required: true } }, (args) => [{}, { id: args.report_id }])
  remoteTool('submit_governance_feedback', 'Submit post-case feedback for governance iteration.', 'feedback', { case_id: { type: 'string', required: true }, label: { type: 'string', required: true }, reason: { type: 'string', required: true } })
  remoteTool('read_dashboard_summary', 'Read aggregate operational trust metrics.', 'dashboard', {})
  remoteTool('query_audit_assistant', 'Run a bounded audit query using the control-plane assistant allowlist.', 'assistantQuery', { tool: { type: 'string', required: true }, arguments: { type: 'object', additionalProperties: true } })
}

