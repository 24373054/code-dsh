/**
 * Full-surface control-plane tools.
 *
 * The canonical and adapter tool sets cover the agent payment workflow. This
 * module mirrors the remaining control-plane read/administration endpoints so a
 * DSH session can perform every operation the HTTP service exposes. Calls are
 * still resolved through the fixed route table in `control-plane-client.js`;
 * no tool accepts a URL.
 *
 * @module dsh-trust-platform/coverage-tools
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

/** Identity lifecycle states accepted by the service. */
const IDENTITY_STATUSES = ['ACTIVE', 'SUSPENDED', 'REVOKED']

/** Credential lifecycle states accepted by the service. */
const CREDENTIAL_STATUSES = ['ACTIVE', 'SUSPENDED', 'REVOKED']

/** Knowledge document visibility levels. */
const ACCESS_LEVELS = ['PUBLIC', 'INTERNAL', 'RESTRICTED']

/** Max characters of `/metrics` text returned to the model. */
const METRICS_TEXT_LIMIT = 20000

/**
 * Build an optional-value helper that only includes non-empty values.
 *
 * @param entries - `[key, value]` pairs where `value` may be `undefined`.
 * @returns the object without undefined entries.
 */
function compact(entries) {
  const output = {}
  for (const [key, value] of entries) {
    if (value !== undefined) output[key] = value
  }
  return output
}

/**
 * Create the full-surface control-plane tools.
 *
 * @param options.resolveClient - lazy lookup of the `trustPlatformClient` service.
 * @returns tool definitions to register on `ctx.tools`.
 */
export function createCoverageTools({ resolveClient }) {
  /** Build a tool that resolves the control-plane client at execution time. */
  const tool = (name, description, parameters, execute) =>
    controlPlaneTool(resolveClient, {
      name,
      description,
      parameters,
      execute: async (client, args, exec) => execute(client, args, { signal: exec?.signal }),
    })

  /**
   * Request one operation and wrap its response in the canonical tool result.
   *
   * @param client - control-plane client.
   * @param operation - route-table operation name.
   * @param field - result field that carries the response payload.
   * @param options - request options.
   * @param payload - optional JSON body for writes.
   */
  const read = async (client, operation, field, options = {}) => {
    const response = await client.request(operation, undefined, options)
    return succeeded({ [field]: response.data, source: CONTROL_PLANE_SOURCE, authoritative: true })
  }

  return [
    tool(
      'list_identities',
      'List every identity registered on the control plane. Read-only mirror of GET /v1/dids.',
      {},
      async (client, _args, options) => read(client, 'didList', 'identities', options),
    ),

    tool(
      'get_identity_keys',
      'Read the key history for one identity. Read-only mirror of GET /v1/dids/{did}/keys.',
      { did: { type: 'string', required: true, description: 'Agent DID.' } },
      async (client, args, options) =>
        read(client, 'didKeys', 'keys', { ...options, path: { did: text(args.did) } }),
    ),

    tool(
      'rotate_identity_keys',
      'Rotate the signing keys of an identity. Administrative write; needs an active DID and a reason.',
      {
        did: { type: 'string', required: true, description: 'Agent DID.' },
        public_key: { type: 'string', description: 'Optional new public key (service generates one when omitted).' },
        private_key: { type: 'string', description: 'Optional new private key (development only).' },
        reason: { type: 'string', required: true, description: 'Why the keys are rotated (3-1000 characters).' },
      },
      async (client, args, options) => {
        const payload = compact([
          ['public_key', optionalText(args.public_key)],
          ['private_key', optionalText(args.private_key)],
          ['reason', text(args.reason)],
        ])
        const response = await client.request('didRotate', payload, {
          ...options,
          path: { did: text(args.did) },
        })
        return succeeded({ identity: response.data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'set_identity_status',
      'Suspend, revoke or reactivate an identity. Administrative write; never grants payment authority by itself.',
      {
        did: { type: 'string', required: true, description: 'Agent DID.' },
        status: {
          type: 'string',
          required: true,
          description: `Target identity status: ${IDENTITY_STATUSES.join(', ')}.`,
        },
        reason: { type: 'string', required: true, description: 'Why the status changes (3-1000 characters).' },
      },
      async (client, args, options) => {
        const status = text(args.status)
        if (!IDENTITY_STATUSES.includes(status)) {
          return failed({
            code: 'TRUST_INVALID_ARGUMENT',
            message: `status must be one of ${IDENTITY_STATUSES.join(', ')}`,
          })
        }
        const response = await client.request(
          'didStatus',
          { status, reason: text(args.reason) },
          { ...options, path: { did: text(args.did) } },
        )
        return succeeded({ identity: response.data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'read_credential_status',
      'Read the lifecycle status of one credential. Read-only mirror of GET /v1/credentials/{id}/status.',
      { credential_id: { type: 'string', required: true, description: 'Credential identifier.' } },
      async (client, args, options) =>
        read(client, 'credentialStatusGet', 'credential_status', {
          ...options,
          path: { credential_id: text(args.credential_id) },
        }),
    ),

    tool(
      'set_credential_status',
      'Suspend, revoke or reactivate a credential. Administrative write; revocation is irreversible for payments.',
      {
        credential_id: { type: 'string', required: true, description: 'Credential identifier.' },
        status: {
          type: 'string',
          required: true,
          description: `Target credential status: ${CREDENTIAL_STATUSES.join(', ')}.`,
        },
        reason: { type: 'string', required: true, description: 'Why the status changes (3-1000 characters).' },
        actor_did: { type: 'string', description: 'Optional acting DID recorded in the audit trail.' },
      },
      async (client, args, options) => {
        const status = text(args.status)
        if (!CREDENTIAL_STATUSES.includes(status)) {
          return failed({
            code: 'TRUST_INVALID_ARGUMENT',
            message: `status must be one of ${CREDENTIAL_STATUSES.join(', ')}`,
          })
        }
        const payload = compact([
          ['status', status],
          ['reason', text(args.reason)],
          ['actor_did', optionalText(args.actor_did)],
        ])
        const response = await client.request('credentialStatusSet', payload, {
          ...options,
          path: { credential_id: text(args.credential_id) },
        })
        return succeeded({ credential: response.data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'query_operation_events',
      'List operation events, optionally filtered to one payment task. Read-only mirror of GET /v1/events.',
      { task_id: { type: 'string', description: 'Optional payment-task identifier.' } },
      async (client, args, options) =>
        read(client, 'eventList', 'events', { ...options, query: { task_id: optionalText(args.task_id) } }),
    ),

    tool(
      'read_operation_event',
      'Read one operation event by identifier. Read-only mirror of GET /v1/events/{id}.',
      { event_id: { type: 'string', required: true, description: 'Operation event identifier.' } },
      async (client, args, options) =>
        read(client, 'eventGet', 'event', { ...options, path: { event_id: text(args.event_id) } }),
    ),

    tool(
      'anchor_evidence',
      'Anchor an evidence record to the ledger trust anchor (development anchor is local). Administrative write.',
      { evidence_id: { type: 'string', required: true, description: 'Evidence record identifier.' } },
      async (client, args, options) => {
        const response = await client.request('evidenceAnchor', undefined, {
          ...options,
          path: { evidence_id: text(args.evidence_id) },
        })
        return succeeded({ anchor: response.data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'read_evidence_anchors',
      'List the trust anchors for one evidence record. Read-only mirror of GET /v1/evidence/{id}/anchors.',
      { evidence_id: { type: 'string', required: true, description: 'Evidence record identifier.' } },
      async (client, args, options) =>
        read(client, 'evidenceAnchors', 'anchors', { ...options, path: { evidence_id: text(args.evidence_id) } }),
    ),

    tool(
      'list_trace_cases',
      'List trace cases opened for audits. Read-only mirror of GET /v1/cases.',
      {},
      async (client, _args, options) => read(client, 'caseList', 'cases', options),
    ),

    tool(
      'read_trace_case',
      'Read one trace case by identifier. Read-only mirror of GET /v1/cases/{id}.',
      { case_id: { type: 'string', required: true, description: 'Trace case identifier.' } },
      async (client, args, options) =>
        read(client, 'caseGet', 'case', { ...options, path: { case_id: text(args.case_id) } }),
    ),

    tool(
      'read_case_trace',
      'Read the saved trace snapshot of a case. Read-only mirror of GET /v1/cases/{id}/trace.',
      { case_id: { type: 'string', required: true, description: 'Trace case identifier.' } },
      async (client, args, options) =>
        read(client, 'caseTraceGet', 'trace', { ...options, path: { case_id: text(args.case_id) } }),
    ),

    tool(
      'list_case_reports',
      'List the reports produced for one case. Read-only mirror of GET /v1/cases/{id}/reports.',
      { case_id: { type: 'string', required: true, description: 'Trace case identifier.' } },
      async (client, args, options) =>
        read(client, 'reportList', 'reports', { ...options, path: { case_id: text(args.case_id) } }),
    ),

    tool(
      'list_governance_policies',
      'List published governance policies, optionally for one domain. Read-only mirror of GET /v1/feedback/policies.',
      { domain_id: { type: 'string', description: 'Optional domain filter.' } },
      async (client, args, options) =>
        read(client, 'governancePolicies', 'policies', {
          ...options,
          query: { domain_id: optionalText(args.domain_id) },
        }),
    ),

    tool(
      'publish_governance_policy',
      'Publish a signed governance policy package. Administrative write; affects future admissions for the domain.',
      {
        policy_id: { type: 'string', required: true, description: 'Policy identifier (2-120 characters).' },
        domain_id: { type: 'string', required: true, description: 'Domain the policy applies to.' },
        version: { type: 'string', required: true, description: 'Policy version (1-80 characters).' },
        package: { type: 'json', required: true, description: 'Policy package object (validated by the service).' },
        package_uri: { type: 'string', description: 'Optional package URI; defaults to inline://policy.' },
        signed_by: { type: 'string', required: true, description: 'DID that signed the package.' },
        signature: { type: 'string', description: 'Optional detached signature.' },
        rollback_version: { type: 'string', description: 'Optional version to roll back to.' },
      },
      async (client, args, options) => {
        const payload = compact([
          ['policy_id', text(args.policy_id)],
          ['domain_id', text(args.domain_id)],
          ['version', text(args.version)],
          ['package', plainObject(args.package)],
          ['package_uri', optionalText(args.package_uri)],
          ['signed_by', text(args.signed_by)],
          ['signature', optionalText(args.signature)],
          ['rollback_version', optionalText(args.rollback_version)],
        ])
        const response = await client.request('governancePolicyPublish', payload, options)
        return succeeded({ policy: response.data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'list_governance_models',
      'List registered risk-model artifacts. Read-only mirror of GET /v1/feedback/models.',
      { model_name: { type: 'string', description: 'Optional model-name filter.' } },
      async (client, args, options) =>
        read(client, 'governanceModels', 'models', {
          ...options,
          query: { model_name: optionalText(args.model_name) },
        }),
    ),

    tool(
      'publish_governance_model',
      'Register a risk-model artifact digest. Administrative write; the model itself is not executed here.',
      {
        model_id: { type: 'string', required: true, description: 'Model identifier (2-120 characters).' },
        model_name: { type: 'string', required: true, description: 'Human-readable model name.' },
        digest: { type: 'string', required: true, description: 'Artifact digest (16-128 characters).' },
        artifact_uri: { type: 'string', required: true, description: 'Where the artifact lives.' },
        metrics: { type: 'json', description: 'Optional evaluation metrics object.' },
        signed_by: { type: 'string', required: true, description: 'DID that signed the artifact.' },
      },
      async (client, args, options) => {
        const payload = compact([
          ['model_id', text(args.model_id)],
          ['model_name', text(args.model_name)],
          ['digest', text(args.digest)],
          ['artifact_uri', text(args.artifact_uri)],
          ['metrics', plainObject(args.metrics)],
          ['signed_by', text(args.signed_by)],
        ])
        const response = await client.request('governanceModelPublish', payload, options)
        return succeeded({ model: response.data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'ingest_knowledge_document',
      'Ingest an internal knowledge document used by the audit assistant and knowledge search. Administrative write.',
      {
        title: { type: 'string', required: true, description: 'Document title (2-300 characters).' },
        content: { type: 'string', required: true, description: 'Document body (1-2,000,000 characters).' },
        evidence_id: { type: 'string', description: 'Optional evidence record the document derives from.' },
        content_hash: { type: 'string', description: 'Optional content hash supplied by the caller.' },
        jurisdiction: { type: 'string', description: 'Jurisdiction scope; defaults to GLOBAL.' },
        effective_from: { type: 'string', description: 'Optional ISO-8601 effective-from time.' },
        effective_to: { type: 'string', description: 'Optional ISO-8601 effective-to time.' },
        access_level: { type: 'string', description: `Visibility: ${ACCESS_LEVELS.join(', ')}; defaults to INTERNAL.` },
        metadata: { type: 'json', description: 'Optional metadata object.' },
      },
      async (client, args, options) => {
        const accessLevel = optionalText(args.access_level)
        if (accessLevel !== undefined && !ACCESS_LEVELS.includes(accessLevel)) {
          return failed({
            code: 'TRUST_INVALID_ARGUMENT',
            message: `access_level must be one of ${ACCESS_LEVELS.join(', ')}`,
          })
        }
        const payload = compact([
          ['title', text(args.title)],
          ['content', text(args.content)],
          ['evidence_id', optionalText(args.evidence_id)],
          ['content_hash', optionalText(args.content_hash)],
          ['jurisdiction', optionalText(args.jurisdiction)],
          ['effective_from', optionalText(args.effective_from)],
          ['effective_to', optionalText(args.effective_to)],
          ['access_level', accessLevel],
          ['metadata', plainObject(args.metadata)],
        ])
        const response = await client.request('knowledgeIngest', payload, options)
        return succeeded({ document: response.data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'publish_knowledge_document',
      'Publish a knowledge document so search and the assistant can use it. Administrative write.',
      {
        document_id: { type: 'string', required: true, description: 'Knowledge document identifier.' },
        review_note: { type: 'string', description: 'Optional review note (max 2000 characters).' },
      },
      async (client, args, options) => {
        const response = await client.request(
          'knowledgePublish',
          { review_note: text(args.review_note) },
          { ...options, path: { document_id: text(args.document_id) } },
        )
        return succeeded({ document: response.data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'read_knowledge_document',
      'Read one knowledge document by identifier. Read-only mirror of GET /v1/knowledge/{id}.',
      { document_id: { type: 'string', required: true, description: 'Knowledge document identifier.' } },
      async (client, args, options) =>
        read(client, 'knowledgeGet', 'document', {
          ...options,
          path: { document_id: text(args.document_id) },
        }),
    ),

    tool(
      'read_metrics',
      'Read Prometheus metrics from the control plane as text. Read-only diagnostic; the text may be truncated.',
      {},
      async (client, _args, options) => {
        const response = await client.request('metrics', undefined, options)
        const raw = typeof response.data === 'string' ? response.data : ''
        return succeeded({
          metrics: raw.length > METRICS_TEXT_LIMIT ? `${raw.slice(0, METRICS_TEXT_LIMIT)}\n# truncated` : raw,
          length: raw.length,
          truncated: raw.length > METRICS_TEXT_LIMIT,
          source: CONTROL_PLANE_SOURCE,
          authoritative: true,
        })
      },
    ),
  ]
}
