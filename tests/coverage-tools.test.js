import assert from 'node:assert/strict'
import test from 'node:test'

import { ROUTES } from '../src/control-plane-client.js'
import { createCoverageTools } from '../src/coverage-tools.js'

/** Every tool this module is expected to contribute. */
const TOOL_NAMES = [
  'list_identities',
  'get_identity_keys',
  'rotate_identity_keys',
  'set_identity_status',
  'read_credential_status',
  'set_credential_status',
  'query_operation_events',
  'read_operation_event',
  'anchor_evidence',
  'read_evidence_anchors',
  'list_trace_cases',
  'read_trace_case',
  'read_case_trace',
  'list_case_reports',
  'list_governance_policies',
  'publish_governance_policy',
  'list_governance_models',
  'publish_governance_model',
  'ingest_knowledge_document',
  'publish_knowledge_document',
  'read_knowledge_document',
  'read_metrics',
]

/** Read-only tools: they must be safe to call without side effects. */
const READ_ONLY_TOOLS = [
  'list_identities',
  'get_identity_keys',
  'read_credential_status',
  'query_operation_events',
  'read_operation_event',
  'read_evidence_anchors',
  'list_trace_cases',
  'read_trace_case',
  'read_case_trace',
  'list_case_reports',
  'list_governance_policies',
  'list_governance_models',
  'read_knowledge_document',
  'read_metrics',
]

/** Minimal required arguments per tool (dsh-tools validates before execute). */
const SAMPLE_ARGS = {
  get_identity_keys: { did: 'did:trust:example.com:agent-1' },
  rotate_identity_keys: { did: 'did:trust:example.com:agent-1', reason: 'routine' },
  set_identity_status: { did: 'did:trust:example.com:agent-1', status: 'ACTIVE', reason: 'restore' },
  read_credential_status: { credential_id: 'cred-1' },
  set_credential_status: { credential_id: 'cred-1', status: 'SUSPENDED', reason: 'review' },
  read_operation_event: { event_id: 'evt-1' },
  anchor_evidence: { evidence_id: 'evd-1' },
  read_evidence_anchors: { evidence_id: 'evd-1' },
  read_trace_case: { case_id: 'case-1' },
  read_case_trace: { case_id: 'case-1' },
  list_case_reports: { case_id: 'case-1' },
  publish_governance_policy: {
    policy_id: 'policy-1',
    domain_id: 'example.com',
    version: '1.0.0',
    package: {},
    signed_by: 'did:trust:example.com:issuer',
  },
  publish_governance_model: {
    model_id: 'model-1',
    model_name: 'rules',
    digest: 'digest-0123456789abcdef',
    artifact_uri: 'inline://model',
    signed_by: 'did:trust:example.com:issuer',
  },
  ingest_knowledge_document: { title: 'runbook', content: 'body' },
  publish_knowledge_document: { document_id: 'knw-1' },
  read_knowledge_document: { document_id: 'knw-1' },
}

/** Required arguments for a tool, empty when it has none. */
function argsFor(name) {
  return SAMPLE_ARGS[name] ?? {}
}

/** Fake control-plane client recording each request. */
function createFakeClient() {
  const calls = []
  return {
    calls,
    async request(operation, payload, options = {}) {
      const entry = ROUTES[operation]
      assert.ok(entry, `unknown fake operation ${operation}`)
      calls.push({ operation, payload, options })
      if (operation === 'metrics') {
        return { data: '# HELP trust_platform_info\n trust_platform_info 1\n', status: 200, requestId: 'req-1' }
      }
      return { data: { operation, echo: payload ?? null }, status: 200, requestId: 'req-1' }
    },
  }
}

/** Build the tool map for one fake client. */
function buildTools() {
  const client = createFakeClient()
  const tools = createCoverageTools({ resolveClient: () => client })
  return { client, tools, byName: new Map(tools.map((tool) => [tool.name, tool])) }
}

/** Execute one tool through the dsh-tools execute contract. */
function run(byName, name, args = {}) {
  const tool = byName.get(name)
  assert.ok(tool, `tool ${name} must exist`)
  return tool.execute(args, {})
}

test('coverage tools register the full read/administration surface', () => {
  const { tools, byName } = buildTools()
  assert.deepEqual(
    tools.map((tool) => tool.name),
    TOOL_NAMES,
  )
  for (const tool of tools) {
    assert.equal(typeof tool.description, 'string')
    assert.ok(tool.description.length > 20, `${tool.name} needs a useful description`)
    assert.equal(typeof tool.parameters, 'object')
    assert.equal(typeof tool.execute, 'function')
  }
})

test('every coverage tool maps onto a fixed route-table operation', async () => {
  const { client, byName } = buildTools()
  for (const name of TOOL_NAMES) {
    const result = await run(byName, name, argsFor(name))
    assert.equal(result.ok, true, `${name} should succeed with no arguments`)
  }
  assert.ok(client.calls.length >= TOOL_NAMES.length)
  for (const call of client.calls) {
    assert.ok(ROUTES[call.operation], `${call.operation} must be a known operation`)
  }
})

test('read-only tools never send a request body', async () => {
  const { client, byName } = buildTools()
  for (const name of READ_ONLY_TOOLS) {
    await run(byName, name, argsFor(name))
  }
  const reads = client.calls.filter((call) => ROUTES[call.operation].method === 'GET')
  assert.equal(reads.length, READ_ONLY_TOOLS.length)
  for (const call of reads) assert.equal(call.payload, undefined)
})

test('identity key rotation passes path parameters and only defined body fields', async () => {
  const { client, byName } = buildTools()
  const result = await run(byName, 'rotate_identity_keys', { did: 'did:trust:example.com:agent-1', reason: 'routine' })
  assert.equal(result.ok, true)
  const call = client.calls.at(-1)
  assert.equal(call.operation, 'didRotate')
  assert.deepEqual(call.options.path, { did: 'did:trust:example.com:agent-1' })
  assert.deepEqual(call.payload, { reason: 'routine' })
})

test('identity status rejects unknown values before calling the service', async () => {
  const { client, byName } = buildTools()
  const result = await run(byName, 'set_identity_status', { did: 'did:trust:example.com:agent-1', status: 'BROKEN', reason: 'because' })
  assert.equal(result.ok, false)
  assert.equal(result.code, 'TRUST_INVALID_ARGUMENT')
  assert.equal(client.calls.length, 0)
})

test('credential status rejects unknown values before calling the service', async () => {
  const { client, byName } = buildTools()
  const result = await run(byName, 'set_credential_status', {
    credential_id: 'cred-1',
    status: 'GONE',
    reason: 'because',
  })
  assert.equal(result.ok, false)
  assert.equal(result.code, 'TRUST_INVALID_ARGUMENT')
  assert.equal(client.calls.length, 0)
})

test('governance publishing forwards package objects and rejects non-object packages', async () => {
  const { client, byName } = buildTools()
  const ok = await run(byName, 'publish_governance_policy', {
    policy_id: 'policy-1',
    domain_id: 'example.com',
    version: '1.0.0',
    package: { rules: [] },
    signed_by: 'did:trust:example.com:issuer',
  })
  assert.equal(ok.ok, true)
  assert.deepEqual(client.calls.at(-1).payload, {
    policy_id: 'policy-1',
    domain_id: 'example.com',
    version: '1.0.0',
    package: { rules: [] },
    signed_by: 'did:trust:example.com:issuer',
  })

  const rejected = await run(byName, 'publish_governance_policy', {
    policy_id: 'policy-2',
    domain_id: 'example.com',
    version: '1.0.1',
    package: [1, 2, 3],
    signed_by: 'did:trust:example.com:issuer',
  })
  assert.equal(rejected.ok, true, 'arrays are dropped rather than forwarded')
  assert.equal('package' in client.calls.at(-1).payload, false)
})

test('knowledge ingestion normalizes the access level and query filters stay optional', async () => {
  const { client, byName } = buildTools()
  const bad = await run(byName, 'ingest_knowledge_document', { title: 't', content: 'c', access_level: 'SECRET' })
  assert.equal(bad.ok, false)
  assert.equal(bad.code, 'TRUST_INVALID_ARGUMENT')

  const ok = await run(byName, 'ingest_knowledge_document', {
    title: 'Audit runbook',
    content: 'body',
    access_level: 'PUBLIC',
  })
  assert.equal(ok.ok, true)
  assert.equal(client.calls.at(-1).payload.access_level, 'PUBLIC')

  await run(byName, 'query_operation_events', {})
  const eventsCall = client.calls.at(-1)
  assert.equal(eventsCall.operation, 'eventList')
  assert.equal(eventsCall.options.query.task_id, undefined)
})

test('metrics returns text and reports truncation metadata', async () => {
  const { byName } = buildTools()
  const result = await run(byName, 'read_metrics', {})
  assert.equal(result.ok, true)
  assert.match(result.metrics, /trust_platform_info/)
  assert.equal(result.truncated, false)
})

test('tools degrade to a canonical failure when the service is missing', async () => {
  const tools = createCoverageTools({ resolveClient: () => undefined })
  const result = await tools[0].execute({}, {})
  assert.equal(result.ok, false)
  assert.equal(result.code, 'TRUST_CLIENT_UNAVAILABLE')
})
