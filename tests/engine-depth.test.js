/**
 * Depth contracts for the embedded trust plane (task-12):
 *
 * 1. delegation chains expose every link and the effective scopes; a broken or
 *    revoked parent makes the chain untrustworthy instead of silently allowing;
 * 2. settlement is cryptographic: a tool-signed FINAL SETTLE event must verify
 *    before the task can move CONFIRMED -> AUDITED -> CLOSED, and closing
 *    without that proof fails closed;
 * 3. risk evaluation binds to published policy/model versions and never turns an
 *    unpublished version into an ALLOW.
 */
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const PLUGIN_URL = new URL('../src/index.js', import.meta.url).href

function createHost() {
  const tools = new Map()
  const services = new Map()
  const disposers = []
  const host = {
    logger: { info() {}, warn() {}, error() {}, debug() {} },
    tools: {
      register(definition) {
        if (tools.has(definition.name)) throw new Error(`duplicate tool ${definition.name}`)
        tools.set(definition.name, definition)
        return () => tools.delete(definition.name)
      },
    },
    provide(name, value) {
      services.set(name, value)
      return () => services.delete(name)
    },
    get(name) {
      return services.get(name)
    },
    effect(fn) {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
      return dispose
    },
  }
  return { host, tools, services, disposers }
}

let callSequence = 0

async function call(tools, name, rawArgs = {}) {
  const tool = tools.get(name)
  assert.ok(tool, `tool ${name} is not registered`)
  const args = JSON.parse(JSON.stringify(rawArgs))
  return tool.execute(args, { callId: `depth-${++callSequence}`, signal: new AbortController().signal })
}

function requireOk(value, label) {
  assert.equal(value?.ok, true, `${label}: ${JSON.stringify(value).slice(0, 500)}`)
  return value
}

const iso = (offsetMs) => new Date(Date.now() + offsetMs).toISOString()

async function boot() {
  const dataDir = mkdtempSync(join(tmpdir(), 'trust-depth-'))
  const { host, tools } = createHost()
  const { apply } = await import(PLUGIN_URL)
  apply(host, { mode: 'embedded', dataDir, actorDid: 'system:depth-runner', allowInterventionExecution: false })
  return { dataDir, host, tools }
}

async function registerAgent(tools, domain, subject, displayName) {
  const value = requireOk(
    await call(tools, 'register_identity', { domain_id: domain, subject_id: subject, display_name: displayName }),
    `register ${subject}`,
  )
  return value.identity?.did
}

async function openDraftTask(tools, requesterDid, amount) {
  const draft = requireOk(
    await call(tools, 'create_payment_task', {
      requester_did: requesterDid,
      amount,
      asset_id: 'USD',
      beneficiary: 'merchant-depth',
      purpose: 'depth contract',
    }),
    'draft task',
  )
  assert.equal(draft.task?.status, 'CREATED')
  return draft.task.id
}

async function walkToSubmitted(tools, taskId) {
  const path = ['AUTHORIZED', 'DELEGATING', 'QUOTING', 'SELECTED', 'PAYREQ_PENDING', 'SUBMITTED']
  for (const status of path) {
    const transition = requireOk(
      await call(tools, 'transition_payment_task', { task_id: taskId, status, reason: `depth walk ${status}` }),
      `transition ${status}`,
    )
    assert.equal(transition.task?.status, status)
  }
  return path
}

test('delegation chains expose effective scopes and distrust revoked links', async () => {
  const { dataDir, tools } = await boot()
  try {
    const domain = `depth-chain-${Date.now()}.example`
    const payerDid = await registerAgent(tools, domain, 'payer', 'Payer')
    const operatorDid = await registerAgent(tools, domain, 'operator', 'Operator')
    const subagentDid = await registerAgent(tools, domain, 'subagent', 'Subagent')

    const taskId = await openDraftTask(tools, payerDid, 800)
    const root = requireOk(
      await call(tools, 'create_delegation', {
        task_id: taskId,
        issuer_did: payerDid,
        subject_did: operatorDid,
        actions: ['PAYREQ'],
        asset_id: 'USD',
        amount_limit: 600,
        daily_limit: 700,
        valid_from: iso(-60_000),
        valid_to: iso(86_400_000),
        can_redelegate: true,
        claims: { purpose: 'depth chain' },
      }),
      'root delegation',
    )
    const child = requireOk(
      await call(tools, 'create_delegation', {
        task_id: taskId,
        issuer_did: operatorDid,
        subject_did: subagentDid,
        actions: ['PAYREQ'],
        asset_id: 'USD',
        amount_limit: 400,
        daily_limit: 450,
        valid_from: iso(-30_000),
        valid_to: iso(80_000_000),
        parent_id: root.delegation?.id,
        can_redelegate: false,
        claims: { purpose: 'depth chain child' },
      }),
      'child delegation',
    )

    const chain = requireOk(
      await call(tools, 'read_delegation_chain', { delegation_id: child.delegation?.id }),
      'read chain',
    )
    assert.equal(chain.chain_length, 2)
    assert.equal(chain.chain?.length, 2, 'both links are returned')
    assert.equal(chain.chain[0].id, root.delegation?.id, 'chain is ordered root to leaf')
    assert.equal(chain.chain[1].id, child.delegation?.id)
    assert.equal(chain.root_issuer_did, payerDid)
    assert.equal(chain.chain_trustworthy, true)
    assert.equal(chain.effective?.amount_limit, '400.00000000', 'effective limit is the chain minimum')
    assert.equal(chain.effective?.daily_limit, '450.00000000')
    assert.deepEqual(chain.effective?.actions, ['PAYREQ'])

    const overLimit = requireOk(
      await call(tools, 'check_authorization', {
        delegation_id: child.delegation?.id,
        did: subagentDid,
        amount: 500,
        currency: 'USD',
      }),
      'child over limit',
    )
    assert.equal(overLimit.decision, 'DENY', 'amount above the child limit never authorizes')

    const allowed = requireOk(
      await call(tools, 'check_authorization', {
        delegation_id: child.delegation?.id,
        did: subagentDid,
        amount: 300,
        currency: 'USD',
      }),
      'child within limit',
    )
    assert.equal(allowed.decision, 'ALLOW')

    requireOk(
      await call(tools, 'revoke_delegation', { delegation_id: root.delegation?.id, status: 'CLOSED', reason: 'depth revocation test' }),
      'revoke root',
    )
    const broken = requireOk(
      await call(tools, 'read_delegation_chain', { delegation_id: child.delegation?.id }),
      'read chain after revoke',
    )
    assert.equal(broken.chain_trustworthy, false, 'a revoked ancestor makes the chain untrustworthy')
  } finally {
    rmSync(dataDir, { recursive: true, force: true })
  }
})

test('settlement needs a verified signed FINAL proof and closes the task', async () => {
  const { dataDir, tools } = await boot()
  try {
    const domain = `depth-settle-${Date.now()}.example`
    const payerDid = await registerAgent(tools, domain, 'payer', 'Payer')
    const operatorDid = await registerAgent(tools, domain, 'operator', 'Operator')

    const draftTaskId = await openDraftTask(tools, payerDid, 600)
    const delegation = requireOk(
      await call(tools, 'create_delegation', {
        task_id: draftTaskId,
        issuer_did: payerDid,
        subject_did: operatorDid,
        actions: ['PAYREQ'],
        asset_id: 'USD',
        amount_limit: 600,
        daily_limit: 700,
        valid_from: iso(-60_000),
        valid_to: iso(86_400_000),
        can_redelegate: false,
        claims: { purpose: 'settlement depth' },
      }),
      'settle delegation',
    )
    const authorization = requireOk(
      await call(tools, 'check_authorization', {
        delegation_id: delegation.delegation?.id,
        did: operatorDid,
        amount: 500,
        currency: 'USD',
      }),
      'settle authorization',
    )
    assert.equal(authorization.decision, 'ALLOW')
    const created = requireOk(
      await call(tools, 'create_payment_task', {
        authorization_id: authorization.authorization?.id,
        beneficiary: 'merchant-depth',
        purpose: 'settlement depth',
      }),
      'create authorized task',
    )
    const taskId = created.task?.id
    await walkToSubmitted(tools, taskId)

    const settled = requireOk(
      await call(tools, 'settle_payment_task', { task_id: taskId, settlement_ref: 'depth-settle-1' }),
      'settle task',
    )
    assert.equal(settled.verification?.overall_status, 'VALID', 'signed FINAL settlement verifies')
    assert.equal(settled.settlement?.proof, 'signed-final-settlement')
    assert.equal(settled.event?.event_type, 'SETTLE')
    assert.equal(settled.event?.finality, 'FINAL')
    assert.equal(settled.task?.status, 'CLOSED')
    assert.deepEqual(
      settled.settlement?.transitions?.map((step) => step.status),
      ['CONFIRMED', 'AUDITED', 'CLOSED'],
    )

    // Second task: walk the lifecycle manually and prove CLOSED cannot be claimed
    // without the signed settlement proof.
    const secondAuth = requireOk(
      await call(tools, 'check_authorization', {
        delegation_id: delegation.delegation?.id,
        did: operatorDid,
        amount: 100,
        currency: 'USD',
      }),
      'second authorization',
    )
    assert.equal(secondAuth.decision, 'ALLOW')
    const secondCreated = requireOk(
      await call(tools, 'create_payment_task', {
        authorization_id: secondAuth.authorization?.id,
        beneficiary: 'merchant-depth',
        purpose: 'unsigned close attempt',
      }),
      'second authorized task',
    )
    const secondTaskId = secondCreated.task?.id
    await walkToSubmitted(tools, secondTaskId)
    for (const status of ['CONFIRMED', 'AUDITED']) {
      requireOk(
        await call(tools, 'transition_payment_task', { task_id: secondTaskId, status, reason: `manual ${status}` }),
        `second transition ${status}`,
      )
    }
    const refused = await call(tools, 'transition_payment_task', {
      task_id: secondTaskId,
      status: 'CLOSED',
      reason: 'attempt close without settlement proof',
    })
    assert.equal(refused.ok, false, 'closing without a verified settlement is refused')
    assert.equal(refused.code, 'SETTLEMENT_NOT_PROVEN')
    const stillAudited = requireOk(await call(tools, 'read_payment_task', { task_id: secondTaskId }), 'read second task')
    assert.equal(stillAudited.task?.status, 'AUDITED')
  } finally {
    rmSync(dataDir, { recursive: true, force: true })
  }
})

test('risk evaluation binds to published policy and model versions', async () => {
  const { dataDir, tools } = await boot()
  try {
    const domain = `depth-risk-${Date.now()}.example`
    const payerDid = await registerAgent(tools, domain, 'payer', 'Payer')
    const taskId = await openDraftTask(tools, payerDid, 300)
    const features = { velocity: 0.1, new_counterparty: 0.1 }

    const unknownPolicy = requireOk(
      await call(tools, 'get_risk_decision', {
        task_id: taskId,
        subject_did: payerDid,
        features,
        policy_version: 'policy-missing-999',
      }),
      'unknown policy',
    )
    assert.equal(unknownPolicy.evaluation_status, 'NOT_EVALUABLE', 'unknown policy version is not evaluable')
    assert.equal(unknownPolicy.decision, 'DEFER')

    requireOk(
      await call(tools, 'publish_governance_policy', {
        policy_id: 'policy-depth',
        domain_id: domain,
        version: 'policy-depth-002',
        package: { risk_thresholds: { block: 0.95, defer: 0.75, throttle: 0.5 } },
        signed_by: 'system:depth-runner',
      }),
      'publish policy',
    )
    const published = requireOk(
      await call(tools, 'get_risk_decision', {
        task_id: taskId,
        subject_did: payerDid,
        features,
        policy_version: 'policy-depth-002',
      }),
      'published policy',
    )
    assert.equal(published.evaluation_status, 'VALID')
    assert.equal(published.risk?.evaluation?.thresholds?.block, 0.95, 'published thresholds are applied')

    requireOk(
      await call(tools, 'publish_governance_model', {
        model_id: 'model-depth-1',
        model_name: 'depth-rules',
        digest: 'a'.repeat(64),
        artifact_uri: 'inline://model',
        metrics: { auc: 0.91 },
        signed_by: 'system:depth-runner',
      }),
      'publish model',
    )
    const withModel = requireOk(
      await call(tools, 'get_risk_decision', {
        task_id: taskId,
        subject_did: payerDid,
        features,
        policy_version: 'policy-depth-002',
        model_version: 'depth-rules',
      }),
      'published model',
    )
    assert.equal(withModel.evaluation_status, 'VALID')
    assert.equal(withModel.risk?.model_version, 'depth-rules')
  } finally {
    rmSync(dataDir, { recursive: true, force: true })
  }
})
