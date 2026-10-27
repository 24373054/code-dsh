import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { Config, apply, inject, name } from '../src/index.js'
import { DEFAULT_POLICY } from '../src/engine/core.js'

/** Minimal Cordis-like context capturing registrations and services. */
function createContext() {
  const tools = new Map()
  const services = new Map()
  const effects = []
  return {
    tools: {
      register(definition) {
        assert.equal(tools.has(definition.name), false, `tool ${definition.name} must be registered once`)
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
    effect(create) {
      effects.push(create)
      const dispose = create()
      return () => {
        try {
          dispose?.()
        } catch {
          // disposal is best effort in this fake context too
        }
      }
    },
    registeredTools: tools,
    services,
    effects,
  }
}

/** Execute one registered tool directly, bypassing the host tool registry. */
function run(context, toolName, args = {}, exec = {}) {
  const definition = context.registeredTools.get(toolName)
  assert.ok(definition, `tool ${toolName} should be registered`)
  return definition.execute(args, exec)
}

/** Resolve the embedded trust plane provided by the plugin. */
function planeOf(context) {
  const plane = context.services.get('trustPlane')
  assert.ok(plane, 'the plugin must provide the trustPlane service')
  return plane
}

/** Every money-moving tool name must stay absent forever. */
const FORBIDDEN_TOOL_NAMES = ['send_money', 'transfer_funds', 'payout', 'settle_payment']

test('plugin metadata declares the Cordis contract', () => {
  assert.equal(name, 'dsh-trust-platform')
  assert.deepEqual(inject, ['tools'])
})

test('Config fills embedded defaults and validates values', () => {
  const defaults = Config({})
  assert.equal(defaults.mode, 'embedded')
  assert.equal(defaults.dataDir, '')
  assert.equal(defaults.actorDid, 'system:dsh-web')
  assert.equal(defaults.allowInterventionExecution, false)
  assert.deepEqual(defaults.policy, DEFAULT_POLICY)
  assert.throws(() => Config({ mode: 'nonsense' }), /mode/)
  assert.throws(() => Config({ allowInterventionExecution: 'yes' }), /boolean/)
  assert.throws(() => Config({ policy: { riskBlockThreshold: 'high' } }), /riskBlockThreshold/)
  const configured = Config({ mode: 'sandbox', actorDid: 'system:tests', allowInterventionExecution: true })
  assert.equal(configured.mode, 'sandbox')
  assert.equal(configured.allowInterventionExecution, true)
})

test('sandbox mode registers the full tool surface and gates execution', async () => {
  const sandbox = createContext()
  apply(sandbox, Config({ mode: 'sandbox' }))
  assert.equal(sandbox.registeredTools.size, 58)
  assert.equal(sandbox.registeredTools.has('execute_intervention'), false)
  assert.equal(sandbox.services.has('trustPlane'), true)
  assert.equal(sandbox.services.has('trustPlatformClient'), false)

  const gated = createContext()
  apply(gated, Config({ mode: 'sandbox', allowInterventionExecution: true }))
  assert.equal(gated.registeredTools.size, 59)
  assert.equal(gated.registeredTools.has('execute_intervention'), true)

  for (const toolName of FORBIDDEN_TOOL_NAMES) {
    assert.equal(sandbox.registeredTools.has(toolName), false, `${toolName} must never exist`)
    assert.equal(gated.registeredTools.has(toolName), false, `${toolName} must never exist`)
  }
})

test('embedded mode registers the same tool surface and never needs a client', () => {
  const dataDir = join(tmpdir(), 'trust-platform-never-written')
  const ctx = createContext()
  apply(ctx, Config({ mode: 'embedded', dataDir }))
  assert.equal(ctx.registeredTools.size, 58)
  assert.equal(ctx.services.has('trustPlatformClient'), false)
  assert.equal(ctx.registeredTools.get('check_service_health').description.includes('embedded'), true)
})

test('tool calls produce authoritative embedded results', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'trust-platform-tools-'))
  try {
    const ctx = createContext()
    apply(ctx, Config({ mode: 'embedded', dataDir, actorDid: 'system:tests' }))
    const registered = await run(ctx, 'register_identity', {
      domain_id: 'bank.example',
      subject_id: 'agent-1',
      display_name: 'Agent One',
    })
    assert.equal(registered.ok, true)
    assert.equal(registered.source, 'embedded-engine')
    assert.equal(registered.authoritative, true)
    assert.equal(registered.identity.did, 'did:trust:bank.example:agent-1')

    const status = await run(ctx, 'get_identity_status', { did: registered.identity.did })
    assert.equal(status.ok, true)
    assert.equal(status.identity.did, registered.identity.did)
    assert.equal(status.identity.status, 'ACTIVE')
    assert.equal(planeOf(ctx).counts().identities, 1)
  } finally {
    await rm(dataDir, { recursive: true, force: true })
  }
})

test('tool failures fail closed with a stable error code', async () => {
  const ctx = createContext()
  apply(ctx, Config({ mode: 'sandbox' }))
  const failure = await run(ctx, 'register_identity', { domain_id: 'bank.example' })
  assert.equal(failure.ok, false)
  assert.equal(typeof failure.code, 'string')
  assert.notEqual(failure.decision, 'ALLOW')
  assert.equal(failure.source, undefined)
})

test('embedded state and runtime settings survive a plugin restart', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'trust-platform-state-'))
  try {
    const first = createContext()
    apply(first, Config({ mode: 'embedded', dataDir, actorDid: 'system:tests' }))
    await run(first, 'register_identity', {
      domain_id: 'bank.example',
      subject_id: 'agent-1',
      display_name: 'Agent One',
    })
    planeOf(first).updateSettings({ actorDid: 'system:owner', policy: { riskDeferThreshold: 0.55 } })
    planeOf(first).flush()

    const persisted = JSON.parse(await readFile(join(dataDir, 'state.json'), 'utf8'))
    assert.equal(typeof persisted.identities, 'object')
    assert.equal(persisted.settings.actorDid, 'system:owner')

    const second = createContext()
    apply(second, Config({ mode: 'embedded', dataDir, actorDid: 'system:tests' }))
    const plane = planeOf(second)
    assert.equal(plane.counts().identities, 1)
    const snapshot = plane.settingsSnapshot()
    assert.equal(snapshot.settings.actorDid, 'system:owner')
    assert.equal(snapshot.settings.policy.riskDeferThreshold, 0.55)
    assert.equal(snapshot.defaults.actorDid, 'system:tests')
  } finally {
    await rm(dataDir, { recursive: true, force: true })
  }
})

test('browser API is skipped when the host has no inject surface', () => {
  const ctx = createContext()
  assert.equal(typeof ctx.inject, 'undefined')
  assert.doesNotThrow(() => apply(ctx, Config({ mode: 'sandbox' })))
  assert.equal(ctx.effects.length, 1)
})
