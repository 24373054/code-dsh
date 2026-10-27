import assert from 'node:assert/strict'
import test from 'node:test'

import { createControlPlaneClient } from '../src/control-plane-client.js'
import { createControlPlaneTools, evaluateDelegationAuthorization } from '../src/control-plane-tools.js'
import { createRemoteTools } from '../src/remote-tools.js'

const CONFIG = {
  mode: 'control-plane',
  baseUrl: 'http://127.0.0.1:8080',
  token: '',
  actorDid: '',
  timeoutMs: 5000,
  allowInterventionExecution: false,
}

/** JSON response helper. */
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

/** Flat service error response. */
function serviceError(status, errorCode, message) {
  return json(
    {
      error_code: errorCode,
      message,
      request_id: 'req-stub',
      retryable: status >= 500,
      evidence_refs: [],
      policy_version: 'policy-2026-10-25-001',
    },
    status,
  )
}

/**
 * Build a harness that registers both tool groups against a stubbed fetch.
 *
 * `handle(request)` receives `{ method, path, search, headers, body }` and must
 * return a `Response`; every request is recorded in `calls`.
 */
function createHarness({ handle, config = CONFIG, allowInterventionExecution = false }) {
  const calls = []
  const fetchImpl = async (url, init) => {
    const request = {
      method: init.method,
      url,
      path: new URL(url).pathname,
      search: new URL(url).search,
      headers: init.headers,
      body: typeof init.body === 'string' ? JSON.parse(init.body) : undefined,
    }
    calls.push(request)
    return handle(request)
  }
  const client = createControlPlaneClient({
    baseUrl: config.baseUrl,
    fetchImpl,
    actorDid: config.actorDid,
    timeoutMs: config.timeoutMs,
  })
  const tools = new Map()
  for (const definition of createControlPlaneTools({
    resolveClient: () => client,
    config,
    allowInterventionExecution,
  })) {
    tools.set(definition.name, definition)
  }
  for (const definition of createRemoteTools({ resolveClient: () => client, config })) {
    tools.set(definition.name, definition)
  }
  const run = async (toolName, args = {}) => {
    const definition = tools.get(toolName)
    assert.ok(definition, `tool ${toolName} should be registered`)
    return definition.execute(args, {})
  }
  return { calls, run, client, tools }
}

/** Delegation fixture with overridable fields. */
function delegation(overrides = {}) {
  return {
    id: 'del-1',
    task_id: 'task-1',
    issuer_did: 'did:trust:demo:issuer',
    subject_did: 'did:trust:demo:agent',
    actions: ['PAYREQ', 'RESULT'],
    asset_id: 'USDC',
    amount_limit: '1000.00',
    daily_limit: '2000.00',
    valid_from: '2026-01-01T00:00:00+00:00',
    valid_to: '2027-01-01T00:00:00+00:00',
    parent_id: null,
    can_redelegate: false,
    status: 'ACTIVE',
    ...overrides,
  }
}

test('pure delegation evaluator approves only a fully valid delegation', () => {
  const now = new Date('2026-06-01T00:00:00Z')
  const request = { did: 'did:trust:demo:agent', amount: 250, currency: 'USDC', action: 'PAYREQ' }
  const allowed = evaluateDelegationAuthorization({ delegation: delegation(), request, now })
  assert.equal(allowed.decision, 'ALLOW')
  assert.equal(allowed.checks.amount, 250)
  assert.equal(allowed.checks.amount_limit, 1000)

  const withRequester = evaluateDelegationAuthorization({
    delegation: delegation(),
    request,
    now,
    task_requester: 'did:trust:demo:issuer',
  })
  assert.equal(withRequester.decision, 'ALLOW')
  assert.equal(withRequester.checks.issuer_did, 'did:trust:demo:issuer')
  assert.equal(
    evaluateDelegationAuthorization({ delegation: delegation(), request, now, task_requester: 'did:trust:demo:other' }).decision,
    'DENY',
  )
  assert.equal(
    evaluateDelegationAuthorization({
      delegation: delegation({ task_id: 'task-2' }),
      request: { ...request, task_id: 'task-1' },
      now,
    }).decision,
    'DENY',
  )

  assert.equal(evaluateDelegationAuthorization({ delegation: delegation({ status: 'REVOKED' }), request, now }).decision, 'DENY')
  assert.equal(
    evaluateDelegationAuthorization({ delegation: delegation({ valid_to: '2026-02-01T00:00:00+00:00' }), request, now }).decision,
    'DENY',
  )
  assert.equal(evaluateDelegationAuthorization({ delegation: delegation({ actions: ['RESULT'] }), request, now }).decision, 'DENY')
  assert.equal(evaluateDelegationAuthorization({ delegation: delegation({ subject_did: 'did:trust:demo:other' }), request, now }).decision, 'DENY')
  assert.equal(evaluateDelegationAuthorization({ delegation: delegation(), request: { ...request, amount: 1500 }, now }).decision, 'DENY')
  assert.equal(
    evaluateDelegationAuthorization({ delegation: delegation({ daily_limit: '100.00' }), request: { ...request, amount: 200 }, now }).decision,
    'DENY',
  )
  assert.equal(
    evaluateDelegationAuthorization({ delegation: delegation(), request: { ...request, currency: 'USDT' }, now }).decision,
    'DENY',
  )
  assert.equal(evaluateDelegationAuthorization({ delegation: delegation(), request: { ...request, amount: undefined }, now }).decision, 'DEFER')
  assert.equal(
    evaluateDelegationAuthorization({ delegation: delegation({ amount_limit: undefined }), request, now }).decision,
    'DEFER',
  )
  assert.equal(evaluateDelegationAuthorization({ delegation: null, request, now }).decision, 'DEFER')
})

test('canonical control-plane flow maps every step onto real service calls', async () => {
  const harness = createHarness({
    handle(request) {
      if (request.method === 'POST' && request.path === '/v1/dids/register') {
        return json(
          {
            did: 'did:trust:demo:payer',
            domain_id: 'demo',
            document: { id: 'did:trust:demo:payer' },
            status: 'ACTIVE',
            dev_private_key: 'dev-key',
          },
          201,
        )
      }
      if (request.method === 'GET' && request.path.startsWith('/v1/dids/')) {
        return json({ did: 'did:trust:demo:payer', domain_id: 'demo', status: 'ACTIVE', document: {}, public_key: 'pk' })
      }
      if (request.method === 'GET' && request.path === '/v1/delegations/del-1') {
        return json(delegation())
      }
      if (request.method === 'POST' && request.path === '/v1/tasks') {
        return json(
          {
            id: 'task-9',
            domain_id: request.body.domain_id,
            requester_did: request.body.requester_did,
            asset_id: request.body.asset_id,
            amount: request.body.amount,
            beneficiary: request.body.beneficiary,
            status: 'CREATED',
            policy_version: 'policy-2026-10-25-001',
            metadata: request.body.metadata,
          },
          201,
        )
      }
      if (request.method === 'POST' && request.path === '/v1/events') {
        return json({ id: 'evt-1', ...request.body, finality: 'OBSERVED' }, 201)
      }
      if (request.method === 'POST' && request.path === '/v1/risk/evaluate') {
        return json({
          evidence_id: 'risk-1',
          score: 0.42,
          trust_score: 0.58,
          decision: 'THROTTLE',
          reasons: ['velocity above baseline'],
          evaluation_status: 'VALID',
          model_version: 'rules-1',
        })
      }
      if (request.method === 'POST' && request.path === '/v1/interventions/decide') {
        return json(
          {
            id: 'dec-1',
            task_id: request.body.task_id,
            action: 'STEP_UP',
            rationale: request.body.rationale,
            policy_version: 'policy-2026-10-25-001',
            status: 'DECIDED',
            created_at: '2026-10-27T00:00:00+00:00',
          },
          201,
        )
      }
      return serviceError(404, 'NOT_FOUND', `no stub for ${request.method} ${request.path}`)
    },
  })

  const registration = await harness.run('register_identity', {
    domain_id: 'demo',
    subject_id: 'payer',
    display_name: 'Payer agent',
  })
  assert.equal(registration.ok, true)
  assert.equal(harness.calls[0].body.domain_id, 'demo')
  assert.equal(harness.calls[0].body.subject_id, 'payer')
  assert.match(harness.calls[0].headers['Idempotency-Key'], /^dsh-/)

  const identity = await harness.run('get_identity_status', { did: 'did:trust:demo:payer' })
  assert.equal(identity.ok, true)
  assert.equal(harness.calls[1].path, '/v1/dids/did%3Atrust%3Ademo%3Apayer')

  const authorization = await harness.run('check_authorization', {
    delegation_id: 'del-1',
    did: 'did:trust:demo:agent',
    beneficiary: 'shop.example',
    amount: 400,
    currency: 'USDC',
  })
  assert.equal(authorization.ok, true)
  assert.equal(authorization.authorization.decision, 'ALLOW')
  assert.equal(authorization.authorization.authoritative, true)

  const task = await harness.run('create_payment_task', {
    authorization_id: authorization.authorization.id,
    purpose: 'supplier invoice',
  })
  assert.equal(task.ok, true)
  const taskCall = harness.calls.at(-1)
  assert.equal(taskCall.path, '/v1/tasks')
  assert.deepEqual(
    {
      domain_id: taskCall.body.domain_id,
      requester_did: taskCall.body.requester_did,
      asset_id: taskCall.body.asset_id,
      amount: taskCall.body.amount,
      beneficiary: taskCall.body.beneficiary,
    },
    {
      domain_id: 'demo',
      requester_did: 'did:trust:demo:agent',
      asset_id: 'USDC',
      amount: 400,
      beneficiary: 'shop.example',
    },
  )
  assert.equal(taskCall.body.metadata.purpose, 'supplier invoice')
  assert.equal(taskCall.body.metadata.delegation_id, 'del-1')

  const event = await harness.run('submit_operation_event', {
    task_id: 'task-9',
    event_type: 'payreq',
    source_ref: 'ledger-1',
    payload: { instrument: 'USDC' },
  })
  assert.equal(event.ok, true)
  const eventCall = harness.calls.at(-1)
  assert.equal(eventCall.path, '/v1/events')
  assert.equal(eventCall.body.event_type, 'PAYREQ')
  assert.equal(eventCall.body.actor_did, 'did:trust:demo:agent')
  assert.equal(eventCall.body.source_ref, 'ledger-1')
  assert.deepEqual(eventCall.body.payload, { instrument: 'USDC' })
  assert.equal(eventCall.body.finality, undefined)

  const risk = await harness.run('get_risk_decision', { task_id: 'task-9' })
  assert.equal(risk.ok, true)
  assert.equal(risk.authorization_effect, 'NONE')
  assert.equal(risk.decision, 'THROTTLE')
  assert.equal(harness.calls.at(-1).body.subject_did, 'did:trust:demo:agent')

  const stepUp = await harness.run('request_step_up', { task_id: 'task-9', reason: 'amount above threshold' })
  assert.equal(stepUp.ok, true)
  assert.equal(stepUp.status, 'REQUIRED')
  assert.equal(harness.calls.at(-1).body.action, 'STEP_UP')
  assert.deepEqual(harness.calls.at(-1).body.rationale, { reason: 'amount above threshold' })

  const receipt = await harness.run('get_execution_receipt', { task_id: 'task-9' })
  assert.equal(receipt.ok, true)
  assert.equal(receipt.status, 'NOT_SUPPORTED')
  assert.equal(receipt.receipt, null)
})

test('check_authorization reaches every deny and defer path without network data', async () => {
  const scenarios = [
    { name: 'revoked', body: delegation({ status: 'REVOKED' }), decision: 'DENY' },
    { name: 'expired', body: delegation({ valid_to: '2026-02-01T00:00:00+00:00' }), decision: 'DENY' },
    { name: 'over amount limit', body: delegation(), args: { amount: 5000 }, decision: 'DENY' },
    { name: 'over daily limit', body: delegation({ daily_limit: '100.00' }), args: { amount: 200 }, decision: 'DENY' },
    { name: 'action not delegated', body: delegation(), args: { action: 'SETTLE' }, decision: 'DENY' },
    { name: 'subject mismatch', body: delegation(), args: { did: 'did:trust:demo:other' }, decision: 'DENY' },
    { name: 'missing amount', body: delegation(), omit: ['amount'], decision: 'DEFER' },
  ]
  for (const scenario of scenarios) {
    const harness = createHarness({
      handle: (request) => {
        if (request.method === 'GET' && request.path === '/v1/delegations/del-1') return json(scenario.body)
        return serviceError(404, 'NOT_FOUND', 'unexpected')
      },
    })
    const args = {
      delegation_id: 'del-1',
      did: 'did:trust:demo:agent',
      beneficiary: 'shop.example',
      amount: 400,
      currency: 'USDC',
      ...scenario.args,
    }
    for (const key of scenario.omit ?? []) delete args[key]
    const result = await harness.run('check_authorization', args)
    assert.equal(result.ok, false, scenario.name)
    assert.equal(result.decision, scenario.decision, scenario.name)
    assert.equal(result.authorization.decision, scenario.decision, scenario.name)
  }

  const missing = createHarness({
    handle: () => serviceError(404, 'DELEGATION_NOT_FOUND', 'delegation not found'),
  })
  const unknown = await missing.run('check_authorization', { delegation_id: 'del-missing', amount: 10 })
  assert.equal(unknown.ok, false)
  assert.equal(unknown.code, 'DELEGATION_NOT_FOUND')
  assert.equal(unknown.decision, 'UNKNOWN')
})

test('check_authorization verifies the root delegation issuer against the task requester', async () => {
  const create = (requesterDid) =>
    createHarness({
      handle: (request) => {
        if (request.method === 'GET' && request.path === '/v1/delegations/del-1') return json(delegation())
        if (request.method === 'GET' && request.path === '/v1/tasks/task-1') {
          return json({ id: 'task-1', requester_did: requesterDid, status: 'CREATED' })
        }
        return serviceError(404, 'NOT_FOUND', 'unexpected')
      },
    })

  const matching = create('did:trust:demo:issuer')
  const allowed = await matching.run('check_authorization', {
    delegation_id: 'del-1',
    task_id: 'task-1',
    did: 'did:trust:demo:agent',
    amount: 100,
    currency: 'USDC',
  })
  assert.equal(allowed.ok, true)
  assert.equal(allowed.authorization.task_id, 'task-1')
  assert.deepEqual(
    matching.calls.map((call) => `${call.method} ${call.path}`),
    ['GET /v1/delegations/del-1', 'GET /v1/tasks/task-1'],
  )

  const mismatched = create('did:trust:demo:intruder')
  const denied = await mismatched.run('check_authorization', {
    delegation_id: 'del-1',
    task_id: 'task-1',
    did: 'did:trust:demo:agent',
    amount: 100,
    currency: 'USDC',
  })
  assert.equal(denied.ok, false)
  assert.equal(denied.decision, 'DENY')
  assert.match(denied.message, /not the task requester/)
})

test('create_payment_task refuses without an ALLOW authorization from this session', async () => {
  const harness = createHarness({ handle: () => serviceError(500, 'SHOULD_NOT_BE_CALLED', 'unexpected call') })
  const result = await harness.run('create_payment_task', { authorization_id: 'auth-forged', purpose: 'invoice' })
  assert.equal(result.ok, false)
  assert.equal(result.code, 'TRUST_AUTHORIZATION_REQUIRED')
  assert.equal(harness.calls.length, 0, 'no task may be created without a local ALLOW authorization')
})

test('verify_credential preserves UNKNOWN/NOT_EVALUABLE and never claims validity', async () => {
  const verify = (verification) =>
    createHarness({ handle: () => json(verification) }).run('verify_credential', {
      credential: { id: 'vc-1' },
      required_claims: ['capabilities'],
    })

  const valid = await verify({
    valid: true,
    status: 'VALID',
    evidence_refs: ['evidence-1'],
    reasons: [],
  })
  assert.equal(valid.ok, true)
  assert.equal(valid.verification.status, 'VALID')

  const invalid = await verify({ valid: false, status: 'INVALID', evidence_refs: [], reasons: ['expired'] })
  assert.equal(invalid.ok, false)
  assert.equal(invalid.code, 'TRUST_CREDENTIAL_NOT_VALID')
  assert.equal(invalid.decision, 'DEFER')

  const unknown = await verify({ valid: false, status: 'UNKNOWN', evidence_refs: [], reasons: ['unknown issuer'] })
  assert.equal(unknown.ok, false)
  assert.equal(unknown.decision, 'UNKNOWN')

  const unevaluable = createHarness({ handle: () => serviceError(500, 'UNEXPECTED', 'unexpected') })
  const missing = await unevaluable.run('verify_credential', {})
  assert.equal(missing.ok, false)
  assert.equal(missing.code, 'TRUST_CREDENTIAL_NOT_EVALUABLE')
  assert.equal(unevaluable.calls.length, 0, 'missing credential data never triggers a network call')
})

test('execute_intervention is opt-in and returns the service execution receipt', async () => {
  const handle = (request) => {
    if (request.method === 'POST' && request.path === '/v1/interventions/dec-1/execute') {
      return json(
        {
          id: 'receipt-1',
          decision_id: 'dec-1',
          task_id: 'task-9',
          action: 'STEP_UP',
          status: 'APPLIED',
          external_ref: 'x-1',
          amount_reserved: '400.00',
        },
        201,
      )
    }
    return serviceError(404, 'NOT_FOUND', 'unexpected')
  }
  const disabled = createHarness({ handle })
  assert.equal(disabled.tools.has('execute_intervention'), false)
  const forbidden = await disabled.run('execute_intervention', { decision_id: 'dec-1' }).catch((error) => error)
  assert.ok(forbidden instanceof Error, 'calling an unregistered tool fails')
  assert.equal(disabled.calls.length, 0)

  const enabled = createHarness({ handle, allowInterventionExecution: true })
  const receipt = await enabled.run('execute_intervention', { decision_id: 'dec-1' })
  assert.equal(receipt.ok, true)
  assert.equal(receipt.receipt.id, 'receipt-1')
  assert.equal(receipt.status, 'APPLIED')
  assert.equal(enabled.calls[0].path, '/v1/interventions/dec-1/execute')
})

test('adapter tools send the corrected payloads and query parameters', async () => {
  const calls = []
  const handler = (request) => {
    calls.push(request)
    if (request.method === 'GET' && request.path === '/health') {
      return json({ status: 'ok', service: 'control-plane', environment: 'development', schema_revision: 'rev-1' })
    }
    if (request.method === 'GET' && request.path === '/ready') {
      return serviceError(503, 'NOT_READY', 'database unavailable')
    }
    if (request.method === 'GET' && request.path === '/v1/delegations') return json([])
    if (request.method === 'POST' && request.path === '/v1/interventions/decide') return json({ id: 'dec-2' }, 201)
    if (request.method === 'POST' && request.path === '/v1/feedback') return json({ feedback_id: 'fb-1', status: 'RECORDED' }, 201)
    if (request.method === 'POST' && request.path === '/v1/knowledge/search') return json({ query: 'x', results: [] })
    if (request.method === 'GET' && request.path === '/v1/cases/case-1/graph') return json({ case_id: 'case-1', nodes: [], edges: [] })
    if (request.method === 'POST' && request.path === '/v1/assistant/query') return json({ answer: 'ok' })
    if (request.method === 'POST' && request.path === '/v1/evidence') return json({ id: 'ev-1' }, 201)
    return serviceError(404, 'NOT_FOUND', `no stub for ${request.method} ${request.path}`)
  }
  const harness = createHarness({ handle: handler, config: { ...CONFIG, actorDid: 'did:trust:demo:auditor' } })

  const health = await harness.run('check_service_health')
  assert.equal(health.ok, true)
  assert.equal(health.health.status, 'ok')
  assert.equal(health.readiness.ready, false)
  assert.equal(health.readiness.status, 'NOT_READY')

  await harness.run('list_delegations', { task_id: 'task-1' })
  assert.equal(new URL(calls.at(-1).url).searchParams.get('task_id'), 'task-1')

  const proposed = await harness.run('propose_intervention', {
    task_id: 'task-1',
    action: 'STEP_UP',
    rationale: { note: 'needs review' },
  })
  assert.equal(proposed.ok, true)
  assert.deepEqual(calls.at(-1).body.rationale, { note: 'needs review' })
  assert.equal(typeof calls.at(-1).body.rationale, 'object')

  const feedback = await harness.run('submit_governance_feedback', {
    label: 'FALSE_POSITIVE',
    reason: 'reviewed manually',
  })
  assert.equal(feedback.ok, true)
  assert.equal(calls.at(-1).body.submitted_by, 'did:trust:demo:auditor')

  const knowledge = await harness.run('search_trust_knowledge', { query: 'invoice', limit: 3 })
  assert.equal(knowledge.ok, true)
  assert.equal(calls.at(-1).body.query, 'invoice')
  assert.equal(calls.at(-1).body.limit, 3)

  const graph = await harness.run('read_trace_context', { case_id: 'case-1' })
  assert.equal(graph.ok, true)
  assert.equal(calls.at(-1).path, '/v1/cases/case-1/graph')

  const evidence = await harness.run('ingest_evidence', {
    source_type: 'ledger',
    source_ref: 'ledger-1',
    content_hash: 'a'.repeat(64),
    case_id: 'case-1',
  })
  assert.equal(evidence.ok, true)
  assert.equal(calls.at(-1).body.content_hash, 'a'.repeat(64))
  assert.equal(calls.at(-1).body.case_id, 'case-1')

  const assistant = await harness.run('query_audit_assistant', {
    tool: 'get_timeline',
    arguments: { task_id: 'task-1' },
  })
  assert.equal(assistant.ok, true)
  assert.deepEqual(calls.at(-1).body, { tool: 'get_timeline', arguments: { task_id: 'task-1' } })

  const invalidAssistant = await harness.run('query_audit_assistant', { tool: 'drop_tables' })
  assert.equal(invalidAssistant.ok, false)
  assert.equal(invalidAssistant.code, 'TRUST_INVALID_ARGUMENT')
})

test('lifecycle helper tools build valid request bodies', async () => {
  const calls = []
  const handler = (request) => {
    calls.push(request)
    if (request.method === 'POST' && request.path === '/v1/delegations') {
      return json({ id: 'del-2', status: 'ACTIVE', ...request.body }, 201)
    }
    if (request.method === 'POST' && request.path === '/v1/delegations/del-2/revoke') {
      return json({ id: 'del-2', status: 'REVOKED' })
    }
    if (request.method === 'POST' && request.path === '/v1/credentials/issue') {
      return json({ id: 'cred-1', status: 'ACTIVE', ...request.body }, 201)
    }
    if (request.method === 'GET' && request.path === '/v1/credentials/cred-1') {
      return json({ id: 'cred-1', credential: { id: 'vc-1' } })
    }
    if (request.method === 'POST' && request.path === '/v1/tasks/task-1/transition') {
      return json({ id: 'task-1', status: request.body.status })
    }
    if (request.method === 'POST' && request.path === '/v1/cases/case-1/report') {
      return json({ id: 'report-1', case_id: 'case-1' }, 201)
    }
    return serviceError(404, 'NOT_FOUND', `no stub for ${request.method} ${request.path}`)
  }
  const harness = createHarness({ handle: handler })

  const created = await harness.run('create_delegation', {
    task_id: 'task-1',
    issuer_did: 'did:trust:demo:issuer',
    subject_did: 'did:trust:demo:agent',
    actions: ['PAYREQ', 'RESULT'],
    asset_id: 'USDC',
    amount_limit: 1000,
    daily_limit: 2000,
    valid_from: '2026-01-01T00:00:00+00:00',
    valid_to: '2027-01-01T00:00:00+00:00',
  })
  assert.equal(created.ok, true)
  assert.equal(calls.at(-1).path, '/v1/delegations')
  assert.deepEqual(calls.at(-1).body.actions, ['PAYREQ', 'RESULT'])

  const revoked = await harness.run('revoke_delegation', { delegation_id: 'del-2', reason: 'task cancelled' })
  assert.equal(revoked.ok, true)
  assert.deepEqual(calls.at(-1).body, { status: 'CANCELLED', reason: 'task cancelled' })

  const issued = await harness.run('issue_credential', {
    credential_type: 'AgentRegistrationCredential',
    issuer_did: 'did:trust:demo:issuer',
    subject_did: 'did:trust:demo:agent',
    claims: { capabilities: ['PAYREQ'] },
  })
  assert.equal(issued.ok, true)
  assert.deepEqual(calls.at(-1).body.claims, { capabilities: ['PAYREQ'] })

  const credential = await harness.run('read_credential', { credential_id: 'cred-1' })
  assert.equal(credential.ok, true)
  assert.equal(calls.at(-1).path, '/v1/credentials/cred-1')

  const transitioned = await harness.run('transition_payment_task', {
    task_id: 'task-1',
    status: 'AUTHORIZED',
    reason: 'approved by policy',
  })
  assert.equal(transitioned.ok, true)
  assert.deepEqual(calls.at(-1).body, { status: 'AUTHORIZED', reason: 'approved by policy' })

  const report = await harness.run('create_trace_report', { case_id: 'case-1' })
  assert.equal(report.ok, true)
  assert.equal(calls.at(-1).path, '/v1/cases/case-1/report')
  assert.equal(calls.at(-1).headers['Idempotency-Key'].startsWith('dsh-'), true)
})
