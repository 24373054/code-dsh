/**
 * Quality hardening for the embedded trust engine: idempotency replay across
 * restarts, concurrency of independent stores, deterministic identifiers,
 * settings consistency and the reset/settings matrix.
 */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { after, test } from 'node:test'

import { Engine, FileStore, MemoryStore, isUuid7, newId } from '../src/engine/core.js'
import { createTrustPlane } from '../src/engine/index.js'

const TMP_BASE = fileURLToPath(new URL('../../tmp', import.meta.url))
const DIRS = []

function tempDir() {
  mkdirSync(TMP_BASE, { recursive: true })
  const dir = mkdtempSync(join(TMP_BASE, 'hardening-'))
  DIRS.push(dir)
  return dir
}

function newPlane(store, settings = {}) {
  return createTrustPlane({ settings, store: store ?? new MemoryStore(), logger: null })
}

function isServiceError(code, status) {
  return (error) => error && error.code === code && error.status === status
}

after(() => {
  for (const dir of DIRS) rmSync(dir, { recursive: true, force: true })
})

test('idempotent writes replay the recorded response across an Engine restart', () => {
  const dir = tempDir()
  const first = new Engine({ store: new FileStore(dir), logger: null })
  const created = first.idempotent('hardening:replay', { task_id: 'task-1', amount: 42 }, () => ({ id: 'resource-1', amount: 42 }))
  assert.deepEqual(created, { id: 'resource-1', amount: 42 })
  first.save()
  assert.equal(first.flush(), true)

  const second = new Engine({ store: new FileStore(dir), logger: null })
  let computed = false
  const replayed = second.idempotent('hardening:replay', { task_id: 'task-1', amount: 42 }, () => {
    computed = true
    return { id: 'resource-2', amount: 0 }
  })
  assert.equal(computed, false, 'a replay must not run the operation again')
  assert.deepEqual(replayed, created)

  assert.throws(
    () => second.idempotent('hardening:replay', { task_id: 'task-1', amount: 43 }, () => ({ id: 'resource-3' })),
    isServiceError('IDEMPOTENCY_CONFLICT', 409),
  )
  assert.equal(Object.keys(second.state.idempotency).length, 1)
})

test('identity registration replays after restart, conflicts on changed body and reads do not grow records', () => {
  const dir = tempDir()
  const body = {
    domain_id: 'alpha',
    subject_id: 'restart-agent',
    display_name: 'Restart Agent',
    idempotency_key: 'idem-restart-agent',
  }

  const firstPlane = newPlane(new FileStore(dir))
  const original = firstPlane.identity.registerDid(body)
  firstPlane.engine.flush()

  const secondPlane = newPlane(new FileStore(dir))
  const replay = secondPlane.identity.registerDid(body)
  assert.deepEqual(replay, original)
  assert.equal(Object.keys(secondPlane.engine.state.identities).length, 1)
  assert.equal(Object.keys(secondPlane.engine.state.identity_keys).length, 1)
  assert.equal(secondPlane.engine.state.identities[original.did].status, 'ACTIVE')

  assert.throws(
    () => secondPlane.identity.registerDid({ ...body, display_name: 'Restart Agent Changed' }),
    isServiceError('IDEMPOTENCY_CONFLICT', 409),
  )
  assert.equal(Object.keys(secondPlane.engine.state.identities).length, 1)

  const beforeReads = Object.keys(secondPlane.engine.state.idempotency).length
  assert.ok(beforeReads >= 1)
  secondPlane.identity.listDids({})
  secondPlane.tasks.list({})
  secondPlane.events.list({})
  secondPlane.risk.evidence({})
  secondPlane.interventions.list({})
  secondPlane.counts()
  secondPlane.health()
  secondPlane.settingsSnapshot()
  const afterReads = Object.keys(secondPlane.engine.state.idempotency).length
  assert.equal(afterReads, beforeReads, 'read routes must never create idempotency records')
})

test('concurrent registrations across isolated stores stay unique and survive a restart', async () => {
  const dirA = tempDir()
  const dirB = tempDir()
  const planeA = newPlane(new FileStore(dirA))
  const planeB = newPlane(new FileStore(dirB))

  const calls = []
  for (let index = 0; index < 50; index += 1) {
    const plane = index % 2 === 0 ? planeA : planeB
    calls.push(
      (async () => {
        await Promise.resolve()
        return plane.identity.registerDid({
          domain_id: 'concurrency',
          subject_id: `agent-${index}`,
          display_name: `Agent ${index}`,
        })
      })(),
    )
  }
  const settled = await Promise.allSettled(calls)
  const failures = settled.filter((item) => item.status === 'rejected').map((item) => item.reason)
  assert.deepEqual(failures, [])
  const registered = settled.map((item) => item.value)
  assert.equal(registered.length, 50)

  const dids = registered.map((item) => item.did)
  assert.equal(new Set(dids).size, 50, 'every registered DID must be unique')
  for (let index = 0; index < dids.length; index += 1) {
    assert.match(dids[index], new RegExp(`^did:trust:concurrency:agent-${index}$`))
  }
  assert.equal(Object.keys(planeA.engine.state.identities).length, 25)
  assert.equal(Object.keys(planeB.engine.state.identities).length, 25)
  assert.equal(planeA.engine.state.audit_seq, 25)
  assert.equal(planeB.engine.state.audit_seq, 25)

  const sequences = Array.from({ length: 20 }, () => planeA.engine.nextSeq('hardening'))
  assert.deepEqual(sequences, Array.from({ length: 20 }, (_, index) => index + 1), 'counters must be monotonic')
  planeA.engine.flush()
  planeB.engine.flush()

  const reloadedA = newPlane(new FileStore(dirA))
  const reloadedB = newPlane(new FileStore(dirB))
  registered.forEach((record, index) => {
    const reloaded = index % 2 === 0 ? reloadedA : reloadedB
    const persisted = reloaded.engine.state.identities[record.did]
    assert.ok(persisted, `missing persisted identity ${record.did}`)
    assert.equal(persisted.status, 'ACTIVE')
  })
  assert.equal(reloadedA.engine.state.counters.hardening, 20)
  assert.equal(JSON.parse(readFileSync(join(dirA, 'state.json'), 'utf8')).schema_version, 1)
})

test('uuid7 identifiers are unique and keep their time component ordered within a burst', () => {
  const ids = Array.from({ length: 300 }, () => newId('hardening'))
  assert.equal(new Set(ids).size, 300)
  const timestamps = ids.map((id) => {
    const uuid = id.slice(id.indexOf('_') + 1)
    assert.equal(isUuid7(uuid), true)
    const parts = uuid.split('-')
    return parseInt(`${parts[0]}${parts[1]}`, 16)
  })
  for (let index = 1; index < timestamps.length; index += 1) {
    assert.ok(timestamps[index] >= timestamps[index - 1], 'uuid7 timestamp component must not go backwards')
  }
})

test('concurrent settings updates converge, validate atomically and persist', async () => {
  const dir = tempDir()
  const plane = newPlane(new FileStore(dir))
  const patches = [
    { policy: { riskBlockThreshold: 0.9 } },
    { policy: { riskDeferThreshold: 0.7 } },
    { policy: { riskThrottleThreshold: 0.5 } },
    { policy: { defaultTrustScore: 0.9 } },
    { policy: { singleAmountLimit: 123456 } },
    { policy: { policyVersion: 'policy-hardening-001' } },
    { allowInterventionExecution: true },
    { actorDid: 'system:hardening' },
  ]
  const settled = await Promise.allSettled(patches.map((patch) => Promise.resolve().then(() => plane.updateSettings(patch))))
  assert.deepEqual(settled.filter((item) => item.status === 'rejected').map((item) => item.reason), [])

  const settings = plane.engine.settings
  assert.equal(settings.actorDid, 'system:hardening')
  assert.equal(settings.allowInterventionExecution, true)
  assert.equal(settings.policy.riskBlockThreshold, 0.9)
  assert.equal(settings.policy.riskDeferThreshold, 0.7)
  assert.equal(settings.policy.riskThrottleThreshold, 0.5)
  assert.equal(settings.policy.defaultTrustScore, 0.9)
  assert.equal(settings.policy.singleAmountLimit, 123456)
  assert.equal(settings.policy.policyVersion, 'policy-hardening-001')
  assert.ok(settings.policy.riskBlockThreshold >= settings.policy.riskDeferThreshold)
  assert.ok(settings.policy.riskDeferThreshold >= settings.policy.riskThrottleThreshold)

  const beforeInvalid = JSON.parse(JSON.stringify(plane.engine.settings))
  const invalidPatches = [
    [{ policy: { riskBlockThreshold: 0.1, riskDeferThreshold: 0.2 } }, 'block below defer'],
    [{ policy: { riskThrottleThreshold: 1.5 } }, 'threshold above one'],
    [{ policy: { unknownField: 0.5 } }, 'unknown policy field'],
    [{ unknown_field: true }, 'unknown settings field'],
    [{ actorDid: 123 }, 'wrong actorDid type'],
    [{ allowInterventionExecution: 'yes' }, 'wrong boolean type'],
    [{ policy: [] }, 'policy is not an object'],
  ]
  for (const [patch, label] of invalidPatches) {
    assert.throws(() => plane.updateSettings(patch), isServiceError('VALIDATION_ERROR', 422), label)
    assert.deepEqual(plane.engine.settings, beforeInvalid, `invalid patch must not partially mutate settings: ${label}`)
  }

  plane.updateSettings({ policy: { riskBlockThreshold: 1, riskDeferThreshold: 1, riskThrottleThreshold: 0, defaultTrustScore: 0 } })
  assert.equal(plane.engine.settings.policy.riskBlockThreshold, 1)
  assert.equal(plane.engine.settings.policy.riskDeferThreshold, 1)
  assert.equal(plane.engine.settings.policy.riskThrottleThreshold, 0)
  assert.equal(plane.engine.settings.policy.defaultTrustScore, 0)

  plane.engine.flush()
  const reloaded = newPlane(new FileStore(dir))
  assert.deepEqual(reloaded.engine.settings, plane.engine.settings)
})

test('reset keeps settings and collection identity while clearing data', () => {
  const dir = tempDir()
  const plane = newPlane(new FileStore(dir), { settings: { policy: { riskDeferThreshold: 0.55 } } })
  plane.updateSettings({ allowInterventionExecution: true, policy: { riskDeferThreshold: 0.55 } })

  const requester = plane.identity.registerDid({ domain_id: 'alpha', subject_id: 'reset-requester', display_name: 'Reset Requester' })
  const agent = plane.identity.registerDid({ domain_id: 'alpha', subject_id: 'reset-agent', display_name: 'Reset Agent' })
  const task = plane.tasks.create({
    domain_id: 'alpha',
    requester_did: requester.did,
    asset_id: 'USDC',
    amount: 1000,
    beneficiary: 'acct:reset-beneficiary',
  })
  const nowMs = Date.now()
  const delegation = plane.delegations.create({
    task_id: task.id,
    issuer_did: requester.did,
    subject_did: agent.did,
    actions: ['PAYREQ'],
    asset_id: 'USDC',
    amount_limit: 500,
    daily_limit: 1000,
    valid_from: new Date(nowMs - 3600000).toISOString(),
    valid_to: new Date(nowMs + 86400000).toISOString(),
  })
  const authorization = plane.authorize({ delegation_id: delegation.id, subject_did: agent.did, action: 'PAYREQ', asset_id: 'USDC', amount: 100 })
  assert.equal(authorization.decision, 'ALLOW')

  const before = {
    settings: plane.engine.settings,
    settingsObject: plane.engine.state.settings,
    identities: plane.engine.state.identities,
    tasks: plane.engine.state.tasks,
    delegations: plane.engine.state.delegations,
    activity: plane.engine.state.activity,
  }
  assert.deepEqual(plane.counts(), { identities: 2, credentials: 0, authorizations: 1, tasks: 1, events: 0, receipts: 0 })

  assert.deepEqual(plane.reset(), { identities: 0, credentials: 0, authorizations: 0, tasks: 0, events: 0, receipts: 0 })
  assert.equal(plane.engine.state.identities, before.identities, 'collection identity must survive reset')
  assert.equal(plane.engine.state.tasks, before.tasks)
  assert.equal(plane.engine.state.delegations, before.delegations)
  assert.equal(plane.engine.state.activity, before.activity)
  assert.equal(plane.engine.state.settings, before.settingsObject)
  assert.equal(Object.keys(plane.engine.state.identities).length, 0)
  assert.equal(Object.keys(plane.engine.state.tasks).length, 0)
  assert.equal(Object.keys(plane.engine.state.identity_keys).length, 0)
  assert.equal(Object.keys(plane.engine.collection('authorizations')).length, 0)
  assert.deepEqual(plane.engine.settings, before.settings)
  assert.equal(plane.engine.settings.allowInterventionExecution, true)
  assert.equal(plane.engine.settings.policy.riskDeferThreshold, 0.55)

  // Post-reset writes must be visible to the sub-engines that cached collections.
  const fresh = plane.identity.registerDid({ domain_id: 'alpha', subject_id: 'post-reset', display_name: 'Post Reset' })
  const freshTask = plane.tasks.create({
    domain_id: 'alpha',
    requester_did: fresh.did,
    asset_id: 'USDC',
    amount: 250,
    beneficiary: 'acct:post-reset',
  })
  assert.equal(plane.counts().identities, 1)
  assert.equal(plane.counts().tasks, 1)
  assert.equal(plane.identity.getDid(fresh.did).did, fresh.did)
  assert.equal(plane.tasks.get(freshTask.id).id, freshTask.id)
  assert.equal(plane.tasks.list({}).length, 1)

  plane.engine.flush()
  const reloaded = newPlane(new FileStore(dir))
  assert.equal(reloaded.engine.settings.allowInterventionExecution, true)
  assert.equal(reloaded.engine.settings.policy.riskDeferThreshold, 0.55)
  assert.equal(reloaded.engine.state.identities[fresh.did].status, 'ACTIVE')
  assert.equal(reloaded.engine.state.tasks[freshTask.id].status, 'CREATED')
  assert.equal(reloaded.counts().identities, 1)
})
