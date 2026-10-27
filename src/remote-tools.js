/**
 * Control-plane adapter tools.
 *
 * These expose the remaining control-plane operations (health, admission,
 * governance, knowledge, reporting) plus the lifecycle helpers needed for a
 * real end-to-end flow. They are registered only in `control-plane` mode and
 * every call is resolved against the fixed route table in
 * `control-plane-client.js` - no tool accepts a URL.
 *
 * @module dsh-trust-platform/remote-tools
 */

import {
  CONTROL_PLANE_SOURCE,
  controlPlaneTool,
  failed,
  optionalText,
  plainObject,
  succeeded,
  text,
} from './toolkit.js'

/** Intervention actions accepted by the service. */
const INTERVENTION_ACTIONS = ['ALLOW', 'WARN', 'THROTTLE', 'STEP_UP', 'DEFER', 'BLOCK', 'FREEZE']

/** Payment task states accepted by the transition endpoint. */
const TASK_STATUSES = [
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
]

/** Feedback labels accepted by the service. */
const FEEDBACK_LABELS = ['CONFIRMED', 'FALSE_POSITIVE', 'WITHDRAWN', 'NEEDS_MORE_EVIDENCE']

/** Assistant tools accepted by the service. */
const ASSISTANT_TOOLS = [
  'resolve_entity',
  'get_timeline',
  'trace_asset',
  'replay_rule',
  'rank_nodes',
  'match_pattern',
  'draft_report',
]

/**
 * Create the control-plane adapter tools.
 *
 * @param options.resolveClient - lazy lookup of the `trustPlatformClient` service.
 * @param options.config - normalized plugin configuration.
 * @returns tool definitions to register on `ctx.tools`.
 */
export function createRemoteTools({ resolveClient, config }) {
  /** Build a tool that resolves the control-plane client at execution time. */
  const tool = (name, description, parameters, execute) =>
    controlPlaneTool(resolveClient, {
      name,
      description,
      parameters,
      execute: async (client, args, exec) => execute(client, args, { signal: exec?.signal }),
    })

  return [
    tool(
      'check_service_health',
      'Check control-plane liveness and readiness. Read-only diagnostic; readiness may be false while the service still serves reads.',
      {},
      async (client, _args, options) => {
        const health = await client.request('health', undefined, options)
        let readiness
        try {
          const ready = await client.request('ready', undefined, options)
          readiness = { ready: true, status: ready.data?.status ?? 'ready', checks: ready.data?.checks ?? {}, status_code: ready.status }
        } catch (error) {
          readiness = {
            ready: false,
            status: error?.code ?? 'TRUST_READINESS_UNAVAILABLE',
            message: error?.message ?? 'readiness probe failed',
            retryable: error?.retryable === true,
            status_code: error?.status ?? 0,
          }
        }
        return succeeded({ health: health.data, readiness, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'resolve_identity_admission',
      'Evaluate admission for an agent identity. Admission is advisory: it returns ALLOW, DEFER, BLOCK or UNKNOWN and never authorizes a payment.',
      {
        did: { type: 'string', required: true, description: 'Agent DID to evaluate.' },
        policy_version: { type: 'string', required: true, description: 'Policy version to evaluate against.' },
        required_actions: {
          type: 'array',
          required: true,
          items: { type: 'string' },
          description: 'Actions the identity must be admitted for.',
        },
        jurisdiction: { type: 'string', description: 'Optional jurisdiction scope.' },
      },
      async (client, args, options) => {
        const payload = {
          did: text(args.did),
          policy_version: text(args.policy_version),
          required_actions: Array.isArray(args.required_actions)
            ? args.required_actions.map((action) => text(action)).filter((action) => action !== '')
            : [],
        }
        const jurisdiction = optionalText(args.jurisdiction)
        if (jurisdiction !== undefined) payload.jurisdiction = jurisdiction
        const { data } = await client.request('admission', payload, options)
        return succeeded({ admission: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'verify_remote_credential',
      'Verify a verifiable credential against the real control plane. Authoritative: VALID is required for success.',
      {
        credential: {
          type: 'object',
          required: true,
          additionalProperties: true,
          description: 'Verifiable credential JSON document.',
        },
        required_claims: {
          type: 'array',
          items: { type: 'string' },
          description: 'Claims that must be present for the credential to stay valid.',
        },
      },
      async (client, args, options) => {
        const payload = { credential: plainObject(args.credential) ?? {} }
        const requiredClaims = Array.isArray(args.required_claims)
          ? args.required_claims.map((claim) => text(claim)).filter((claim) => claim !== '')
          : []
        if (requiredClaims.length > 0) payload.required_claims = requiredClaims
        const { data } = await client.request('credentialVerify', payload, options)
        return succeeded({ verification: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'read_payment_task',
      'Read one payment task from the control plane. Read-only.',
      {
        task_id: { type: 'string', required: true, description: 'Payment task identifier.' },
      },
      async (client, args, options) => {
        const { data } = await client.request('taskGet', undefined, { ...options, path: { task_id: text(args.task_id) } })
        return succeeded({ task: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool('list_payment_tasks', 'List payment tasks known to the control plane. Read-only.', {}, async (client, _args, options) => {
      const { data } = await client.request('taskList', undefined, options)
      return succeeded({ tasks: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
    }),

    tool(
      'read_delegation',
      'Read one delegation from the control plane. Read-only; reading a delegation never authorizes a payment.',
      {
        delegation_id: { type: 'string', required: true, description: 'Delegation identifier.' },
      },
      async (client, args, options) => {
        const { data } = await client.request('delegationGet', undefined, {
          ...options,
          path: { delegation_id: text(args.delegation_id) },
        })
        return succeeded({ delegation: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'list_delegations',
      'List delegations, optionally filtered by payment task. Read-only.',
      {
        task_id: { type: 'string', description: 'Optional payment task identifier filter.' },
      },
      async (client, args, options) => {
        const taskId = optionalText(args.task_id)
        const query = taskId !== undefined ? { task_id: taskId } : undefined
        const { data } = await client.request('delegationList', undefined, { ...options, query })
        return succeeded({ delegations: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'verify_operation_event',
      'Verify an operation event signature and identity context. Authoritative: success means the service verified it.',
      {
        event_id: { type: 'string', required: true, description: 'Operation event identifier.' },
      },
      async (client, args, options) => {
        const { data } = await client.request('eventVerify', {}, {
          ...options,
          path: { event_id: text(args.event_id) },
        })
        return succeeded({ verification: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'evaluate_remote_risk',
      'Evaluate risk for a payment task on the control plane. Risk informs but never authorizes payment.',
      {
        task_id: { type: 'string', required: true, description: 'Payment task identifier.' },
        subject_did: { type: 'string', description: 'Subject DID to score; defaults to the configured actor DID.' },
        event_id: { type: 'string', description: 'Optional operation event belonging to the task.' },
        features: {
          type: 'object',
          additionalProperties: true,
          description: 'Risk features: velocity, amount_deviation, new_counterparty, cross_chain_hops, identity_unknown.',
        },
        policy_version: { type: 'string', description: 'Optional policy version override.' },
        model_version: { type: 'string', description: 'Optional model version override.' },
      },
      async (client, args, options) => {
        const subjectDid = optionalText(args.subject_did) ?? optionalText(config.actorDid)
        if (subjectDid === undefined) {
          return failed({ code: 'TRUST_SUBJECT_REQUIRED', message: 'subject_did is required (or configure actorDid)' })
        }
        const payload = { task_id: text(args.task_id), subject_did: subjectDid }
        const eventId = optionalText(args.event_id)
        if (eventId !== undefined) payload.event_id = eventId
        payload.features = plainObject(args.features) ?? {}
        const policyVersion = optionalText(args.policy_version)
        if (policyVersion !== undefined) payload.policy_version = policyVersion
        const modelVersion = optionalText(args.model_version)
        if (modelVersion !== undefined) payload.model_version = modelVersion
        const { data } = await client.request('riskEvaluate', payload, options)
        return succeeded({ risk: data, authorization_effect: 'NONE', source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'read_risk_evidence',
      'Read risk evidence recorded for a payment task. Read-only.',
      {
        task_id: { type: 'string', required: true, description: 'Payment task identifier.' },
      },
      async (client, args, options) => {
        const { data } = await client.request('riskEvidence', undefined, {
          ...options,
          query: { task_id: text(args.task_id) },
        })
        return succeeded({ evidence: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'propose_intervention',
      'Create an intervention decision on the control plane. This records a decision only; ' +
        'execution requires the separately gated execute_intervention tool.',
      {
        task_id: { type: 'string', required: true, description: 'Payment task identifier.' },
        action: {
          type: 'string',
          required: true,
          description: `Intervention action: ${INTERVENTION_ACTIONS.join(', ')}.`,
        },
        event_id: { type: 'string', description: 'Optional operation event that triggered the decision.' },
        rationale: {
          type: 'object',
          additionalProperties: true,
          description: 'Rationale object; the service expects a JSON object, not a string.',
        },
        policy_version: { type: 'string', description: 'Optional policy version override.' },
      },
      async (client, args, options) => {
        const action = text(args.action).toUpperCase()
        if (!INTERVENTION_ACTIONS.includes(action)) {
          return failed({ code: 'TRUST_INVALID_ARGUMENT', message: `action must be one of ${INTERVENTION_ACTIONS.join(', ')}` })
        }
        const payload = { task_id: text(args.task_id), action, rationale: plainObject(args.rationale) ?? {} }
        const eventId = optionalText(args.event_id)
        if (eventId !== undefined) payload.event_id = eventId
        const policyVersion = optionalText(args.policy_version)
        if (policyVersion !== undefined) payload.policy_version = policyVersion
        const { data } = await client.request('interventionDecide', payload, options)
        return succeeded({ intervention: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool('read_interventions', 'List intervention decisions recorded by the control plane. Read-only.', {}, async (client, _args, options) => {
      const { data } = await client.request('interventionList', undefined, options)
      return succeeded({ interventions: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
    }),

    tool(
      'read_trace_context',
      'Read the evidence graph of a trace case. Read-only; create the case with create_trace_case first.',
      {
        case_id: { type: 'string', required: true, description: 'Trace case identifier.' },
      },
      async (client, args, options) => {
        const { data } = await client.request('caseGraph', undefined, { ...options, path: { case_id: text(args.case_id) } })
        return succeeded({ graph: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'search_trust_knowledge',
      'Search the trust knowledge base. Read-only.',
      {
        query: { type: 'string', required: true, description: 'Search query (1-1000 characters).' },
        jurisdiction: { type: 'string', description: 'Optional jurisdiction filter.' },
        effective_at: { type: 'string', description: 'Optional effective-at timestamp filter.' },
        limit: { type: 'number', description: 'Result limit, 1-20; the service defaults to 5.' },
      },
      async (client, args, options) => {
        const payload = { query: text(args.query) }
        const jurisdiction = optionalText(args.jurisdiction)
        if (jurisdiction !== undefined) payload.jurisdiction = jurisdiction
        const effectiveAt = optionalText(args.effective_at)
        if (effectiveAt !== undefined) payload.effective_at = effectiveAt
        if (typeof args.limit === 'number') payload.limit = args.limit
        const { data } = await client.request('knowledgeSearch', payload, options)
        return succeeded({ search: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'read_evidence',
      'Read one evidence record. Read-only.',
      {
        evidence_id: { type: 'string', required: true, description: 'Evidence identifier.' },
      },
      async (client, args, options) => {
        const { data } = await client.request('evidenceGet', undefined, {
          ...options,
          path: { evidence_id: text(args.evidence_id) },
        })
        return succeeded({ evidence: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'ingest_evidence',
      'Register evidence with the control plane. Content hash must be 16-128 characters; ' +
        'anchoring and settlement are separate and never guaranteed.',
      {
        source_type: { type: 'string', required: true, description: 'Evidence source type (2-80 characters).' },
        source_ref: { type: 'string', required: true, description: 'Evidence source reference (2-250 characters).' },
        content_hash: { type: 'string', required: true, description: 'Content hash, 16-128 characters.' },
        case_id: { type: 'string', description: 'Optional trace case to attach the evidence to.' },
        sm3_hash: { type: 'string', description: 'Optional SM3 hash.' },
        content: { type: 'string', description: 'Optional raw content; its SHA-256 must equal content_hash.' },
        storage_uri: { type: 'string', description: 'Optional storage URI.' },
        metadata: {
          type: 'object',
          additionalProperties: true,
          description: 'Optional evidence metadata object.',
        },
      },
      async (client, args, options) => {
        const payload = {
          source_type: text(args.source_type),
          source_ref: text(args.source_ref),
          content_hash: text(args.content_hash),
        }
        const caseId = optionalText(args.case_id)
        if (caseId !== undefined) payload.case_id = caseId
        const sm3Hash = optionalText(args.sm3_hash)
        if (sm3Hash !== undefined) payload.sm3_hash = sm3Hash
        const content = optionalText(args.content)
        if (content !== undefined) payload.content = content
        const storageUri = optionalText(args.storage_uri)
        if (storageUri !== undefined) payload.storage_uri = storageUri
        const metadata = plainObject(args.metadata)
        if (metadata !== undefined) payload.metadata = metadata
        const { data } = await client.request('evidenceCreate', payload, options)
        return succeeded({ evidence: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'create_trace_case',
      'Create a trace case from the recorded evidence of a payment task. Read-only with respect to funds.',
      {
        task_id: { type: 'string', required: true, description: 'Payment task identifier to trace.' },
      },
      async (client, args, options) => {
        const { data } = await client.request('caseTrace', undefined, {
          ...options,
          path: { task_id: text(args.task_id) },
        })
        return succeeded({ case: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'read_report',
      'Read a generated trust report by identifier. Read-only.',
      {
        report_id: { type: 'string', required: true, description: 'Report identifier.' },
      },
      async (client, args, options) => {
        const { data } = await client.request('reportGet', undefined, { ...options, path: { report_id: text(args.report_id) } })
        return succeeded({ report: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'submit_governance_feedback',
      'Record governance feedback for a case or subject. Requires submitted_by and a reason of 3-4000 characters.',
      {
        label: {
          type: 'string',
          required: true,
          description: `Feedback label: ${FEEDBACK_LABELS.join(', ')}.`,
        },
        reason: { type: 'string', required: true, description: 'Feedback reason, 3-4000 characters.' },
        submitted_by: { type: 'string', description: 'Submitter DID or name; defaults to the configured actor DID.' },
        case_id: { type: 'string', description: 'Optional trace case identifier.' },
        subject_did: { type: 'string', description: 'Optional subject DID.' },
        evidence_refs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional evidence identifiers supporting the feedback.',
        },
      },
      async (client, args, options) => {
        const label = text(args.label).toUpperCase()
        if (!FEEDBACK_LABELS.includes(label)) {
          return failed({ code: 'TRUST_INVALID_ARGUMENT', message: `label must be one of ${FEEDBACK_LABELS.join(', ')}` })
        }
        const submittedBy = optionalText(args.submitted_by) ?? optionalText(config.actorDid)
        if (submittedBy === undefined) {
          return failed({ code: 'TRUST_SUBMITTER_REQUIRED', message: 'submitted_by is required (or configure actorDid)' })
        }
        const payload = { label, reason: text(args.reason), submitted_by: submittedBy }
        const caseId = optionalText(args.case_id)
        if (caseId !== undefined) payload.case_id = caseId
        const subjectDid = optionalText(args.subject_did)
        if (subjectDid !== undefined) payload.subject_did = subjectDid
        if (Array.isArray(args.evidence_refs) && args.evidence_refs.length > 0) {
          payload.evidence_refs = args.evidence_refs.map((reference) => text(reference)).filter((reference) => reference !== '')
        }
        const { data } = await client.request('feedbackCreate', payload, options)
        return succeeded({ feedback: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool('read_dashboard_summary', 'Read the control-plane governance dashboard summary. Read-only.', {}, async (client, _args, options) => {
      const { data } = await client.request('dashboardSummary', undefined, options)
      return succeeded({ summary: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
    }),

    tool(
      'query_audit_assistant',
      'Ask the audit assistant a read-only question. draft_report queries require an idempotency key, which the client sends.',
      {
        tool: {
          type: 'string',
          required: true,
          description: `Assistant tool: ${ASSISTANT_TOOLS.join(', ')}.`,
        },
        arguments: {
          type: 'object',
          additionalProperties: true,
          description:
            'Tool arguments object passed to the assistant. Most tools require {task_id, case_id?}; ' +
            'for example get_timeline takes {task_id} and optionally case_id.',
        },
      },
      async (client, args, options) => {
        const assistantTool = text(args.tool)
        if (!ASSISTANT_TOOLS.includes(assistantTool)) {
          return failed({ code: 'TRUST_INVALID_ARGUMENT', message: `tool must be one of ${ASSISTANT_TOOLS.join(', ')}` })
        }
        const payload = { tool: assistantTool, arguments: plainObject(args.arguments) ?? {} }
        const { data } = await client.request('assistantQuery', payload, options)
        return succeeded({ result: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'create_delegation',
      'Create a delegation that lets a subject act for the task requester. ' +
        'The service enforces issuer authority, task/asset scope, limit and timezone rules; a delegation never moves funds.',
      {
        task_id: { type: 'string', required: true, description: 'Payment task the delegation is scoped to.' },
        issuer_did: { type: 'string', required: true, description: 'Issuer DID; must be the task requester for a root delegation.' },
        subject_did: { type: 'string', required: true, description: 'Subject DID receiving the authority.' },
        actions: {
          type: 'array',
          required: true,
          items: { type: 'string' },
          description:
            'Delegated event actions (uppercased by the service): DELEGATE, QUOTE, SELECT, PAYREQ, RESULT, BRIDGE, SETTLE. ' +
            'Business verbs such as PAY are rejected with 422 ACTION_NOT_SUPPORTED.',
        },
        asset_id: { type: 'string', required: true, description: 'Asset scope; must equal the task asset.' },
        amount_limit: { type: 'number', required: true, description: 'Maximum amount per operation; must not exceed the task amount.' },
        daily_limit: { type: 'number', required: true, description: 'Maximum amount per day.' },
        valid_from: { type: 'string', required: true, description: 'ISO timestamp with timezone (naive timestamps are rejected).' },
        valid_to: { type: 'string', required: true, description: 'ISO timestamp with timezone, in the future.' },
        parent_id: { type: 'string', description: 'Optional parent delegation for redelegation.' },
        can_redelegate: { type: 'boolean', description: 'Whether the subject may redelegate; defaults to false.' },
        claims: {
          type: 'object',
          additionalProperties: true,
          description: 'Optional delegation claims object.',
        },
      },
      async (client, args, options) => {
        const payload = {
          task_id: text(args.task_id),
          issuer_did: text(args.issuer_did),
          subject_did: text(args.subject_did),
          actions: Array.isArray(args.actions) ? args.actions.map((action) => text(action)).filter((action) => action !== '') : [],
          asset_id: text(args.asset_id),
          amount_limit: args.amount_limit,
          daily_limit: args.daily_limit,
          valid_from: text(args.valid_from),
          valid_to: text(args.valid_to),
        }
        const parentId = optionalText(args.parent_id)
        if (parentId !== undefined) payload.parent_id = parentId
        if (typeof args.can_redelegate === 'boolean') payload.can_redelegate = args.can_redelegate
        const claims = plainObject(args.claims)
        if (claims !== undefined) payload.claims = claims
        const { data } = await client.request('delegationCreate', payload, options)
        return succeeded({ delegation: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'revoke_delegation',
      'Revoke a delegation. The service requires the transition body shape even though the status is ignored.',
      {
        delegation_id: { type: 'string', required: true, description: 'Delegation identifier.' },
        reason: { type: 'string', required: true, description: 'Revocation reason, 3-1000 characters.' },
      },
      async (client, args, options) => {
        const { data } = await client.request(
          'delegationRevoke',
          { status: 'CANCELLED', reason: text(args.reason) },
          { ...options, path: { delegation_id: text(args.delegation_id) } },
        )
        return succeeded({ delegation: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'issue_credential',
      'Issue a verifiable credential. The service enforces issuer authority and DID status; issuing never grants payment authority by itself.',
      {
        credential_type: { type: 'string', required: true, description: 'Credential type, e.g. AgentRegistrationCredential.' },
        issuer_did: { type: 'string', required: true, description: 'Active issuer DID.' },
        subject_did: { type: 'string', required: true, description: 'Active subject DID.' },
        claims: {
          type: 'object',
          additionalProperties: true,
          description: 'Optional credential claims object.',
        },
        valid_from: { type: 'string', description: 'Optional validity start; defaults to now.' },
        valid_to: { type: 'string', description: 'Optional validity end; defaults to now + 365 days.' },
      },
      async (client, args, options) => {
        const payload = {
          credential_type: text(args.credential_type),
          issuer_did: text(args.issuer_did),
          subject_did: text(args.subject_did),
        }
        const claims = plainObject(args.claims)
        if (claims !== undefined) payload.claims = claims
        const validFrom = optionalText(args.valid_from)
        if (validFrom !== undefined) payload.valid_from = validFrom
        const validTo = optionalText(args.valid_to)
        if (validTo !== undefined) payload.valid_to = validTo
        const { data } = await client.request('credentialIssue', payload, options)
        return succeeded({ credential: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'read_credential',
      'Read one credential record and its verifiable credential document. Read-only.',
      {
        credential_id: { type: 'string', required: true, description: 'Credential identifier.' },
      },
      async (client, args, options) => {
        const { data } = await client.request('credentialGet', undefined, {
          ...options,
          path: { credential_id: text(args.credential_id) },
        })
        return succeeded({ credential: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'transition_payment_task',
      'Transition a payment task to a new lifecycle state. The service validates the allowed transition.',
      {
        task_id: { type: 'string', required: true, description: 'Payment task identifier.' },
        status: { type: 'string', required: true, description: `Target task status: ${TASK_STATUSES.join(', ')}.` },
        reason: { type: 'string', required: true, description: 'Transition reason, 3-1000 characters.' },
      },
      async (client, args, options) => {
        const status = text(args.status).toUpperCase()
        if (!TASK_STATUSES.includes(status)) {
          return failed({ code: 'TRUST_INVALID_ARGUMENT', message: `status must be one of ${TASK_STATUSES.join(', ')}` })
        }
        const { data } = await client.request(
          'taskTransition',
          { status, reason: text(args.reason) },
          { ...options, path: { task_id: text(args.task_id) } },
        )
        return succeeded({ task: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'create_trace_report',
      'Generate a trust report for a traced case. Requires an existing case snapshot (create the case first).',
      {
        case_id: { type: 'string', required: true, description: 'Trace case identifier.' },
      },
      async (client, args, options) => {
        const { data } = await client.request('reportCreate', {}, { ...options, path: { case_id: text(args.case_id) } })
        return succeeded({ report: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),
  ]
}
