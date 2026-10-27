import assert from 'node:assert/strict'
import test from 'node:test'

import { Config, apply, inject, name } from '../src/index.js'

/** Minimal Cordis-like context capturing registrations and services. */
function createContext() {
  const tools = new Map()
  const services = new Map()
  return {
    tools: {
      register(definition) {
        tools.set(definition.name, definition)
        return definition
      },
    },
    provide(service, value) {
      services.set(service, value)
      return () => services.delete(service)
    },
    get(service) {
      return services.get(service)
    },
    registeredTools: tools,
    services,
  }
}

/** Execute one registered tool directly. */
function run(context, toolName, args = {}) {
  const definition = context.registeredTools.get(toolName)
  assert.ok(definition, `tool ${toolName} should be registered`)
  return definition.execute(args, {})
}

test('plugin metadata declares name and tool injection', () => {
  assert.equal(name, 'dsh-trust-platform')
  assert.deepEqual(inject, ['tools'])
})

test('Config fills defaults and validates values', () => {
  assert.deepEqual(Config({}), {
    mode: 'in-memory',
    baseUrl: '',
    token: '',
    actorDid: '',
    timeoutMs: 30000,
    allowInterventionExecution: false,
  })
  assert.throws(() => Config({ mode: 'nonsense' }), /mode/)
  assert.throws(() => Config({ timeoutMs: 'soon' }), /timeoutMs/)
  const configured = Config({ mode: 'control-plane', baseUrl: 'http://127.0.0.1:8080', timeoutMs: 5000 })
  assert.equal(configured.mode, 'control-plane')
  assert.equal(configured.timeoutMs, 5000)
})

test('in-memory mode registers exactly the nine canonical sandbox tools', () => {
  const ctx = createContext()
  apply(ctx, Config({}))
  assert.deepEqual([...ctx.registeredTools.keys()].sort(), [
    'check_authorization',
    'create_payment_task',
    'get_execution_receipt',
    'get_identity_status',
    'get_risk_decision',
    'register_identity',
    'request_step_up',
    'submit_operation_event',
    'verify_credential',
  ])
  assert.equal(ctx.services.size, 0, 'the sandbox does not provide a control-plane client')
  assert.equal(ctx.registeredTools.has('execute_intervention'), false)
})

test('in-memory sandbox never approves an unregistered identity', async () => {
  const ctx = createContext()
  apply(ctx, Config({}))
  const denied = await run(ctx, 'check_authorization', {
    did: 'did:trust:demo:stranger',
    beneficiary: 'shop',
    amount: 10,
    currency: 'USD',
  })
  assert.equal(denied.ok, false)
  assert.equal(denied.authorization.decision, 'DEFER')
  assert.equal(denied.authorization.authoritative, false)
})

test('in-memory sandbox models the full local flow', async () => {
  const ctx = createContext()
  apply(ctx, Config({}))

  const registered = await run(ctx, 'register_identity', {
    did: 'did:trust:demo:payer',
    domain: 'demo',
  })
  assert.equal(registered.ok, true)
  assert.equal(registered.identity.status, 'PENDING_VERIFICATION')
  assert.equal(registered.authoritative, false)

  const status = await run(ctx, 'get_identity_status', { did: 'did:trust:demo:payer' })
  assert.equal(status.ok, true)
  assert.equal(status.identity.did, 'did:trust:demo:payer')

  const missing = await run(ctx, 'get_identity_status', { did: 'did:trust:demo:ghost' })
  assert.equal(missing.ok, false)
  assert.equal(missing.code, 'DID_NOT_FOUND')
  assert.equal(missing.decision, 'UNKNOWN')

  const credential = await run(ctx, 'verify_credential', {
    did: 'did:trust:demo:payer',
    credential_type: 'AgentRegistrationCredential',
    credential_ref: 'vc-1',
  })
  assert.equal(credential.ok, true)
  assert.equal(credential.credential.status, 'VERIFIED')

  const unverifiable = await run(ctx, 'verify_credential', {
    did: 'did:trust:demo:payer',
    credential_type: 'AgentRegistrationCredential',
    credential_ref: '',
  })
  assert.equal(unverifiable.ok, false)
  assert.equal(unverifiable.status, 'NOT_EVALUABLE')

  const allowed = await run(ctx, 'check_authorization', {
    did: 'did:trust:demo:payer',
    beneficiary: 'shop.example',
    amount: 250,
    currency: 'usd',
  })
  assert.equal(allowed.ok, true)
  assert.equal(allowed.authorization.decision, 'ALLOW')
  assert.equal(allowed.authorization.currency, 'USD')
  assert.equal(allowed.authorization.authoritative, false)

  const overLimit = await run(ctx, 'check_authorization', {
    did: 'did:trust:demo:payer',
    beneficiary: 'shop.example',
    amount: 25000,
    currency: 'USD',
  })
  assert.equal(overLimit.ok, false)
  assert.equal(overLimit.authorization.decision, 'DEFER')

  const task = await run(ctx, 'create_payment_task', {
    authorization_id: allowed.authorization.id,
    purpose: 'supplier invoice',
  })
  assert.equal(task.ok, true)
  assert.equal(task.task.status, 'PENDING_EXECUTION_GATEWAY')

  const blockedTask = await run(ctx, 'create_payment_task', {
    authorization_id: 'auth-unknown',
    purpose: 'supplier invoice',
  })
  assert.equal(blockedTask.ok, false)
  assert.equal(blockedTask.code, 'TRUST_AUTHORIZATION_REQUIRED')
  assert.equal(blockedTask.decision, 'DENY')

  const beforeEvent = await run(ctx, 'get_risk_decision', { task_id: task.task.id })
  assert.equal(beforeEvent.decision.decision, 'DEFER')
  assert.equal(beforeEvent.decision.authorization_effect, 'NONE')

  const event = await run(ctx, 'submit_operation_event', {
    task_id: task.task.id,
    event_type: 'PAYREQ',
    event_ref: 'ledger-1',
  })
  assert.equal(event.ok, true)

  const afterEvent = await run(ctx, 'get_risk_decision', { task_id: task.task.id })
  assert.equal(afterEvent.decision.decision, 'REVIEW')

  const stepUp = await run(ctx, 'request_step_up', { task_id: task.task.id, reason: 'large amount' })
  assert.equal(stepUp.ok, true)
  assert.equal(stepUp.status, 'REQUIRED')

  const receipt = await run(ctx, 'get_execution_receipt', { task_id: task.task.id })
  assert.equal(receipt.ok, true)
  assert.equal(receipt.receipt, null)
  assert.equal(receipt.status, 'NOT_SETTLED')
})

test('control-plane mode requires a valid baseUrl', () => {
  const ctx = createContext()
  assert.throws(() => apply(ctx, { mode: 'control-plane' }), /baseUrl/)
  assert.throws(() => apply(ctx, { mode: 'control-plane', baseUrl: '/relative' }), /baseUrl/)
  assert.throws(() => apply(ctx, { mode: 'control-plane', baseUrl: 'ftp://127.0.0.1' }), /baseUrl/)
  assert.throws(() => apply(ctx, { mode: 'control-plane', baseUrl: 'http://user:pass@127.0.0.1:8080' }), /baseUrl/)
})

test('unknown modes and misplaced execution flags are rejected', () => {
  const ctx = createContext()
  assert.throws(() => apply(ctx, { mode: 'bogus' }), /unknown mode/)
  assert.throws(() => apply(ctx, Config({ allowInterventionExecution: true })), /control-plane/)
})

test('control-plane mode provides the client and registers authoritative tools', () => {
  const ctx = createContext()
  apply(ctx, { mode: 'control-plane', baseUrl: 'http://127.0.0.1:8080/' })
  const client = ctx.get('trustPlatformClient')
  assert.equal(typeof client.request, 'function')
  assert.equal(client.baseUrl, 'http://127.0.0.1:8080')
  assert.equal(ctx.registeredTools.size, 58)
  assert.equal(ctx.registeredTools.has('execute_intervention'), false)
  for (const toolName of [
    'register_identity',
    'check_authorization',
    'create_delegation',
    'revoke_delegation',
    'issue_credential',
    'read_credential',
    'transition_payment_task',
    'create_trace_report',
  ]) {
    assert.ok(ctx.registeredTools.has(toolName), `${toolName} should be registered`)
  }
})

test('execute_intervention is registered only when explicitly allowed', () => {
  const ctx = createContext()
  apply(ctx, {
    mode: 'control-plane',
    baseUrl: 'http://127.0.0.1:8080',
    allowInterventionExecution: true,
  })
  assert.equal(ctx.registeredTools.size, 59)
  assert.ok(ctx.registeredTools.has('execute_intervention'))
})

test('control-plane tools resolve the client lazily on every call', async () => {
  const ctx = createContext()
  apply(ctx, { mode: 'control-plane', baseUrl: 'http://127.0.0.1:8080' })
  const calls = []
  ctx.services.set('trustPlatformClient', {
    async request(operation, payload, options) {
      calls.push({ operation, payload, options })
      return { data: { id: 'task-1', requester_did: 'did:trust:demo:payer' }, status: 200, requestId: 'req-1' }
    },
  })
  const result = await run(ctx, 'read_payment_task', { task_id: 'task-1' })
  assert.equal(result.ok, true)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].operation, 'taskGet')
  assert.deepEqual(calls[0].options.path, { task_id: 'task-1' })
})

test('no tool can send money or settle funds', () => {
  for (const config of [
    Config({}),
    { mode: 'control-plane', baseUrl: 'http://127.0.0.1:8080', allowInterventionExecution: true },
  ]) {
    const ctx = createContext()
    apply(ctx, config)
    for (const toolName of ctx.registeredTools.keys()) {
      assert.doesNotMatch(toolName, /send_money|settle|settlement|transfer|payout/i)
    }
  }
})
