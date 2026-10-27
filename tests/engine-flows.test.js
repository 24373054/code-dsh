import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  Engine,
  FileStore,
  POLICY_VERSION,
  createDid,
  generateKeyPair,
  newId,
  signPayload,
} from '../src/engine/core.js'
import { createTaskEngine } from '../src/engine/tasks.js'
import { EVENT_TYPES, EVENT_SCHEMA_VERSION, eventSigningPayload, createEventEngine } from '../src/engine/events.js'
import { createRiskEngine } from '../src/engine/risk.js'
import { APPLIED_STATES, createInterventionEngine } from '../src/engine/interventions.js'

const DOMAIN_A = 'alpha'
const DOMAIN_B = 'beta'
const ASSET = 'USDC'
const BENEFICIARY = 'acct:beneficiary-001'
const OBSERVED_AT = '2026-10-27T10:00:00.000Z'

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function plane({ settings = {}, store = null } = {}) {
  const engine = new Engine({ settings, store, logger: null })
  return {
    engine,
    tasks: createTaskEngine(engine),
    events: createEventEngine(engine),
    risk: createRiskEngine(engine),
    interventions: createInterventionEngine(engine),
  }
}

function seedIdentity(engine, { domain = DOMAIN_A, subject = 'requester', status = 'ACTIVE' } = {}) {
  const did = createDid(domain, subject)
  const keys = generateKeyPair()
  const now = engine.iso()
  engine.state.identities[did] = {
    did,
    domain_id: domain,
    subject_id: subject,
    display_name: subject,
    jurisdiction: 'SG',
    status,
    public_key: keys.publicKey,
    document: {},
    created_at: now,
    updated_at: now,
  }
  engine.state.identity_keys[did] = [
    {
      key_id: `${did}#key-1`,
      public_key: keys.publicKey,
      status: 'ACTIVE',
      effective_at: now,
      created_at: now,
      reason: 'genesis',
    },
  ]
  return { did, keys, keyId: `${did}#key-1`, privateKey: keys.privateKey, publicKey: keys.publicKey }
}

function createTask(p, requester, overrides = {}, key = newId('taskkey')) {
  return p.tasks.create(
    {
      domain_id: DOMAIN_A,
      requester_did: requester.did,
      asset_id: ASSET,
      amount: '1250.5',
      beneficiary: BENEFICIARY,
      metadata: { memo: 'test-task' },
      ...overrides,
    },
    { idempotencyKey: key },
  )
}

function createUnsignedEvent(p, taskId, actorDid, overrides = {}, key = newId('evtkey')) {
  return p.events.create(
    {
      task_id: taskId,
      event_type: 'QUOTE',
      actor_did: actorDid,
      payload: { amount: '100', asset_id: ASSET },
      source_ref: `ledger:quote:${newId('src')}`,
      finality: 'OBSERVED',
      observed_at: OBSERVED_AT,
      event_time: OBSERVED_AT,
      ...overrides,
    },
    { idempotencyKey: key },
  )
}

function signedEventBody(actor, taskId, overrides = {}) {
  const body = {
    task_id: taskId,
    event_type: 'QUOTE',
    actor_did: actor.did,
    payload: { amount: '100', asset_id: ASSET },
    source_ref: `ledger:quote:${newId('src')}`,
    finality: 'CONFIRMED',
    observed_at: OBSERVED_AT,
    event_time: OBSERVED_AT,
    ...overrides,
    event_id: newId('evt'),
  }
  const signingPayload = eventSigningPayload(body)
  return {
    ...body,
    signature: {
      key_id: actor.keyId,
      algorithm: 'Ed25519',
      value: signPayload(actor.privateKey, signingPayload),
    },
  }
}

function createSignedEvent(p, actor, taskId, overrides = {}) {
  return p.events.create(signedEventBody(actor, taskId, overrides), { idempotencyKey: newId('evtkey') })
}

function seedDelegation(
  engine,
  {
    taskId,
    issuer,
    subject,
    actions = ['QUOTE'],
    assetId = ASSET,
    amountLimit = 500,
    dailyLimit = 5000,
    validFrom = '2026-01-01T00:00:00Z',
    validTo = '2027-01-01T00:00:00Z',
    status = 'ACTIVE',
    parentId = null,
  } = {},
) {
  const id = newId('del')
  engine.state.delegations[id] = {
    id,
    task_id: taskId,
    issuer_did: issuer.did,
    subject_did: subject.did,
    actions,
    asset_id: assetId,
    amount_limit: amountLimit,
    daily_limit: dailyLimit,
    valid_from: validFrom,
    valid_to: validTo,
    parent_id: parentId,
    can_redelegate: false,
    status,
    created_at: engine.iso(),
  }
  return id
}

function insertRawEvent(engine, taskId, actorDid, overrides = {}) {
  const id = newId('evt')
  const event = {
    id,
    task_id: taskId,
    event_type: 'QUOTE',
    actor_did: actorDid,
    payload: { amount: '100', asset_id: ASSET },
    signature: null,
    signature_key_id: null,
    signature_algorithm: null,
    source_ref: `ledger:raw:${id}`,
    finality: 'OBSERVED',
    status: 'OBSERVED',
    event_time: '2026-10-27T10:00:00',
    observed_at: OBSERVED_AT,
    idempotency_key: null,
    message_id: null,
    schema_version: EVENT_SCHEMA_VERSION,
    trace_id: null,
    counterparty_did: null,
    predecessors: [],
    evidence_refs: [],
    source_ledger: {},
    policy_version: POLICY_VERSION,
    created_at: engine.iso(),
    ...overrides,
  }
  engine.state.events[id] = event
  return event
}

function expectError(fn, code, status) {
  let caught = null
  try {
    fn()
  } catch (error) {
    caught = error
  }
  assert.ok(caught, `expected ${code} to be thrown`)
  assert.equal(caught.code, code)
  if (status !== undefined) assert.equal(caught.status, status)
  return caught
}

/* ------------------------------------------------------------------ */
/* tasks                                                               */
/* ------------------------------------------------------------------ */

test('task create returns a payment task response with 8dp amount', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const created = createTask(p, requester)

  assert.match(created.id, /^task_/)
  assert.equal(created.domain_id, DOMAIN_A)
  assert.equal(created.requester_did, requester.did)
  assert.equal(created.asset_id, ASSET)
  assert.equal(created.amount, '1250.50000000')
  assert.equal(created.beneficiary, BENEFICIARY)
  assert.equal(created.status, 'CREATED')
  assert.equal(created.policy_version, POLICY_VERSION)
  assert.deepEqual(created.metadata, { memo: 'test-task' })
  assert.equal(p.engine.state.tasks[created.id].amount, 1250.5)
  assert.equal(p.tasks.get(created.id).id, created.id)
})

test('task create is idempotent and rejects key reuse with another body', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const first = createTask(p, requester, {}, 'task-idem-1')
  const replay = createTask(p, requester, {}, 'task-idem-1')
  assert.equal(replay.id, first.id)

  expectError(() => createTask(p, requester, { amount: '42' }, 'task-idem-1'), 'IDEMPOTENCY_CONFLICT', 409)
})

test('task create rejects a requester DID from another domain', () => {
  const p = plane()
  seedIdentity(p.engine, { domain: DOMAIN_B, subject: 'outsider' })
  const outsider = seedIdentity(p.engine, { domain: DOMAIN_B, subject: 'outsider-2' })

  expectError(
    () => createTask(p, outsider, { domain_id: DOMAIN_A }),
    'REQUESTER_DOMAIN_MISMATCH',
    403,
  )
})

test('task create validates its request body', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)

  expectError(() => createTask(p, requester, { amount: '0' }), 'VALIDATION_ERROR', 422)
  expectError(() => createTask(p, requester, { beneficiary: 'x' }), 'VALIDATION_ERROR', 422)
  expectError(() => createTask(p, requester, { asset_id: '' }), 'VALIDATION_ERROR', 422)
  expectError(() => createTask(p, requester, { metadata: [] }), 'VALIDATION_ERROR', 422)
  expectError(
    () => p.tasks.create({ domain_id: DOMAIN_A, requester_did: requester.did, asset_id: ASSET, amount: '1', beneficiary: BENEFICIARY }, { idempotencyKey: newId('k'), actor: 'did:trust:alpha:other' }),
    'ACTOR_MISMATCH',
    403,
  )
})

test('task create rejects inactive requesters', () => {
  const p = plane()
  const requester = seedIdentity(p.engine, { status: 'SUSPENDED' })
  expectError(() => createTask(p, requester), 'DID_INACTIVE', 409)
})

test('task get and list enforce domain access and not-found', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const first = createTask(p, requester)
  createTask(p, requester, { amount: '2' })

  expectError(() => p.tasks.get('task_missing'), 'TASK_NOT_FOUND', 404)
  assert.equal(p.tasks.list().length, 2)
  assert.equal(p.tasks.list({ limit: 1 }).length, 1)

  const outsider = seedIdentity(p.engine, { domain: DOMAIN_B, subject: 'outsider' })
  expectError(() => p.tasks.get(first.id, { actor: outsider.did }), 'ACCESS_DENIED', 403)
  assert.equal(p.tasks.list({ actor: outsider.did }).length, 0)
})

test('task transition follows the state machine and records reasons', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)

  const authorized = p.tasks.transition(task.id, { status: 'AUTHORIZED', reason: 'manual approval' }, { idempotencyKey: 'tr-1' })
  assert.equal(authorized.status, 'AUTHORIZED')

  expectError(
    () => p.tasks.transition(task.id, { status: 'CLOSED', reason: 'skip states' }, { idempotencyKey: 'tr-2' }),
    'INVALID_TASK_TRANSITION',
    409,
  )
  expectError(
    () => p.tasks.transition(task.id, { status: 'DELEGATING', reason: 'no' }, { idempotencyKey: 'tr-3' }),
    'VALIDATION_ERROR',
    422,
  )

  const replay = p.tasks.transition(task.id, { status: 'AUTHORIZED', reason: 'manual approval' }, { idempotencyKey: 'tr-1' })
  assert.equal(replay.status, 'AUTHORIZED')
  assert.equal(p.engine.state.tasks[task.id].updated_at !== undefined, true)
})

/* ------------------------------------------------------------------ */
/* events                                                              */
/* ------------------------------------------------------------------ */

test('event signing payload mirrors the control-plane contract', () => {
  const payload = eventSigningPayload({
    id: 'evt_abc123',
    task_id: 'task_1',
    event_type: 'QUOTE',
    actor_did: 'did:trust:alpha:requester',
    payload: { amount: '5' },
    source_ref: 'ledger:1',
    finality: 'CONFIRMED',
    observed_at: '2026-10-27T10:00:00.000Z',
    event_time: '2026-10-27T10:00:00.000Z',
    policy_version: POLICY_VERSION,
  })
  assert.deepEqual(payload, {
    event_id: 'evt_abc123',
    task_id: 'task_1',
    event_type: 'QUOTE',
    actor_did: 'did:trust:alpha:requester',
    payload: { amount: '5' },
    source_ref: 'ledger:1',
    observed_at: '2026-10-27T10:00:00+00:00',
    event_time: '2026-10-27T10:00:00+00:00',
    finality: 'CONFIRMED',
    status: 'CONFIRMED',
    schema_version: EVENT_SCHEMA_VERSION,
    trace_id: null,
    counterparty_did: null,
    predecessors: [],
    evidence_refs: [],
    source_ledger: {},
    policy_version: POLICY_VERSION,
  })
})

test('event create validates ids, enums, timestamps and signatures', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const base = { task_id: task.id, event_type: 'QUOTE', actor_did: requester.did, source_ref: 'ledger:quote:1' }

  expectError(() => p.events.create({ ...base, event_id: 'not-an-event' }, { idempotencyKey: newId('k') }), 'VALIDATION_ERROR', 422)
  expectError(() => p.events.create({ ...base, event_type: 'BOGUS' }, { idempotencyKey: newId('k') }), 'VALIDATION_ERROR', 422)
  expectError(() => p.events.create({ ...base, finality: 'BOGUS' }, { idempotencyKey: newId('k') }), 'VALIDATION_ERROR', 422)
  expectError(
    () => p.events.create({ ...base, observed_at: '2026-10-27T10:00:00' }, { idempotencyKey: newId('k') }),
    'TIMEZONE_REQUIRED',
    422,
  )
  expectError(
    () => p.events.create({ ...base, source_ref: 'x' }, { idempotencyKey: newId('k') }),
    'VALIDATION_ERROR',
    422,
  )
  expectError(
    () => p.events.create({ ...base, schema_version: 'nope' }, { idempotencyKey: newId('k') }),
    'VALIDATION_ERROR',
    422,
  )
  expectError(
    () =>
      p.events.create(
        { ...base, signature: { key_id: `${requester.did}#key-1`, algorithm: 'RSA-PSS', value: 'abc' } },
        { idempotencyKey: newId('k') },
      ),
    'SIGNATURE_ALGORITHM_UNSUPPORTED',
    422,
  )
})

test('event create rejects finality and status conflicts only when status is present', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const base = { task_id: task.id, event_type: 'QUOTE', actor_did: requester.did, source_ref: 'ledger:quote:1' }

  expectError(
    () => p.events.create({ ...base, finality: 'CONFIRMED', status: 'OBSERVED' }, { idempotencyKey: newId('k') }),
    'FINALITY_CONFLICT',
    422,
  )

  const finalEvent = p.events.create(
    { ...base, finality: 'OBSERVED', status: 'FINAL', observed_at: OBSERVED_AT },
    { idempotencyKey: newId('k') },
  )
  assert.equal(finalEvent.finality, 'FINAL')
  assert.equal(finalEvent.status, 'FINAL')
})

test('event create is idempotent and rejects conflicting identifiers', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)

  const eventId = newId('evt')
  const body = {
    event_id: eventId,
    task_id: task.id,
    event_type: 'QUOTE',
    actor_did: requester.did,
    payload: { amount: '100', asset_id: ASSET, message_id: 'msg-1' },
    source_ref: 'ledger:quote:uniq-1',
    observed_at: OBSERVED_AT,
  }
  const first = p.events.create(body, { idempotencyKey: 'evt-idem-1' })
  const replay = p.events.create(body, { idempotencyKey: 'evt-idem-1' })
  assert.equal(replay.id, first.id)

  expectError(
    () => p.events.create({ ...body }, { idempotencyKey: 'evt-idem-2' }),
    'EVENT_ID_CONFLICT',
    409,
  )
  expectError(
    () => p.events.create({ ...body, event_id: null, source_ref: 'ledger:quote:uniq-1' }, { idempotencyKey: 'evt-idem-3' }),
    'SOURCE_REF_CONFLICT',
    409,
  )
  expectError(
    () => p.events.create({ ...body, event_id: null, source_ref: 'ledger:quote:uniq-2' }, { idempotencyKey: 'evt-idem-4' }),
    'DUPLICATE_MESSAGE',
    409,
  )

  expectError(
    () =>
      p.events.create({ ...body, event_id: null, source_ref: 'ledger:quote:uniq-3' }, { idempotencyKey: 'evt-idem-5', bodyIdempotencyKey: 'x' }),
    'DUPLICATE_MESSAGE',
    409,
  )
})

test('event create rejects mismatched header and body idempotency keys', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)

  expectError(
    () =>
      p.events.create(
        {
          task_id: task.id,
          event_type: 'QUOTE',
          actor_did: requester.did,
          source_ref: 'ledger:quote:mismatch',
          idempotency_key: 'body-key',
        },
        { idempotencyKey: 'header-key' },
      ),
    'IDEMPOTENCY_KEY_CONFLICT',
    409,
  )
})

test('event create advances a fresh task to DELEGATING or QUOTING', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)

  createUnsignedEvent(p, task.id, requester.did, { event_type: 'DELEGATE', finality: 'OBSERVED' })
  assert.equal(p.tasks.get(task.id).status, 'DELEGATING')

  const otherTask = createTask(p, requester, { amount: '7' })
  createUnsignedEvent(p, otherTask.id, requester.did, { event_type: 'QUOTE' })
  assert.equal(p.tasks.get(otherTask.id).status, 'QUOTING')
})

test('event get and list filter by task', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const firstTask = createTask(p, requester)
  const secondTask = createTask(p, requester, { amount: '2' })
  const first = createUnsignedEvent(p, firstTask.id, requester.did)
  createUnsignedEvent(p, secondTask.id, requester.did)

  assert.equal(p.events.get(first.id).id, first.id)
  expectError(() => p.events.get('evt_missing'), 'EVENT_NOT_FOUND', 404)
  assert.equal(p.events.list({ task_id: firstTask.id }).length, 1)
  assert.equal(p.events.list().length, 2)
})

test('unsigned dev event verification is UNKNOWN, never VALID', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const event = createUnsignedEvent(p, task.id, requester.did)

  const verification = p.events.verify(event.id)
  assert.equal(verification.overall_status, 'UNKNOWN')
  assert.notEqual(verification.overall_status, 'VALID')
  assert.equal(verification.identity_status, 'UNKNOWN')
  assert.equal(verification.authorization_status, 'VALID')
  assert.equal(verification.ledger_status, 'UNKNOWN')
  assert.equal(verification.details.signature_ok, false)
  assert.equal(verification.evidence_refs.length, 2)
  assert.match(verification.evidence_refs[0], /^[0-9a-f]{64}$/)

  assert.equal(p.events.get(event.id).verification.overall_status, 'UNKNOWN')
})

test('signed confirmed event verifies as VALID end to end', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const event = createSignedEvent(p, requester, task.id, { source_ledger: { finality: 'CONFIRMED', ledger_ref: 'ledger:1' } })

  const verification = p.events.verify(event.id)
  assert.equal(verification.identity_status, 'VALID')
  assert.equal(verification.authorization_status, 'VALID')
  assert.equal(verification.ledger_status, 'VALID')
  assert.equal(verification.overall_status, 'VALID')
  assert.equal(verification.details.signature_ok, true)
})

test('signing payload round-trips fractional-second timestamps', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const observedAt = '2026-10-27T10:00:00.123Z'
  const event = createSignedEvent(p, requester, task.id, {
    observed_at: observedAt,
    event_time: observedAt,
    source_ledger: { finality: 'CONFIRMED', ledger_ref: 'ledger:frac' },
  })

  const verification = p.events.verify(event.id)
  assert.equal(verification.identity_status, 'VALID')
  assert.equal(verification.overall_status, 'VALID')
  assert.equal(verification.details.signature_ok, true)
})

test('tampered signatures verify as INVALID', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const impostor = seedIdentity(p.engine, { subject: 'impostor' })

  const body = signedEventBody(requester, task.id)
  body.signature.value = signPayload(impostor.privateKey, eventSigningPayload(body))
  const event = p.events.create(body, { idempotencyKey: newId('evtkey') })

  const verification = p.events.verify(event.id)
  assert.equal(verification.identity_status, 'INVALID')
  assert.equal(verification.overall_status, 'INVALID')
})

test('unknown identity verifies as UNKNOWN and never VALID', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const event = insertRawEvent(p.engine, task.id, requester.did)
  delete p.engine.state.identities[requester.did]

  const verification = p.events.verify(event.id)
  assert.equal(verification.identity_status, 'UNKNOWN')
  assert.equal(verification.details.identity_present, false)
  assert.notEqual(verification.overall_status, 'VALID')
})

test('delegation missing, expired or over limit denies authorization', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const agent = seedIdentity(p.engine, { subject: 'agent' })
  const task = createTask(p, requester)
  const event = createSignedEvent(p, agent, task.id)

  const withoutDelegation = p.events.verify(event.id, { idempotencyKey: 'verify-1' })
  assert.equal(withoutDelegation.authorization_status, 'INVALID')
  assert.notEqual(withoutDelegation.overall_status, 'VALID')

  const delegationId = seedDelegation(p.engine, {
    taskId: task.id,
    issuer: requester,
    subject: agent,
    validFrom: '2025-01-01T00:00:00Z',
    validTo: '2025-06-01T00:00:00Z',
  })
  const expired = p.events.verify(event.id, { idempotencyKey: 'verify-2' })
  assert.equal(expired.authorization_status, 'INVALID')

  p.engine.state.delegations[delegationId].valid_from = '2026-01-01T00:00:00Z'
  p.engine.state.delegations[delegationId].valid_to = '2027-01-01T00:00:00Z'
  const active = p.events.verify(event.id, { idempotencyKey: 'verify-3' })
  assert.equal(active.authorization_status, 'VALID')
  assert.equal(active.overall_status, 'VALID')

  p.engine.state.delegations[delegationId].amount_limit = 50
  const overLimit = p.events.verify(event.id, { idempotencyKey: 'verify-4' })
  assert.equal(overLimit.authorization_status, 'INVALID')
})

test('event verify is idempotent and rejects key reuse for another event', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const first = createUnsignedEvent(p, task.id, requester.did)
  const second = createUnsignedEvent(p, task.id, requester.did, { source_ref: 'ledger:quote:other' })

  const verification = p.events.verify(first.id, { idempotencyKey: 'verify-A' })
  const replay = p.events.verify(first.id, { idempotencyKey: 'verify-A' })
  assert.equal(replay.id, verification.id)
  assert.equal(replay.event_id, first.id)

  expectError(() => p.events.verify(second.id, { idempotencyKey: 'verify-A' }), 'IDEMPOTENCY_CONFLICT', 409)
})

/* ------------------------------------------------------------------ */
/* risk                                                                */
/* ------------------------------------------------------------------ */

function assertRisk(p, task, features, options = {}) {
  return p.risk.evaluate(
    { task_id: task.id, subject_did: task.requester_did, features },
    { idempotencyKey: options.idempotencyKey ?? newId('riskkey') },
  )
}

test('risk evaluation without usable features is NOT_EVALUABLE and DEFERs', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const result = p.risk.evaluate(
    { task_id: task.id, subject_did: requester.did },
    { idempotencyKey: 'risk-empty' },
  )

  assert.match(result.evidence_id, /^risk_/)
  assert.match(result.trust_snapshot_id, /^trust_/)
  assert.equal(result.evaluation_status, 'NOT_EVALUABLE')
  assert.equal(result.decision, 'DEFER')
  assert.equal(result.score, 0)
  assert.deepEqual(result.reasons, ['缺少可比较的风险特征'])
  assert.equal(result.feature._evaluation_status, 'NOT_EVALUABLE')
  assert.equal(result.feature._decision, 'DEFER')
  assert.equal(p.engine.state.risk_evidence[result.evidence_id].trust_snapshot.id, result.trust_snapshot_id)

  const evidence = p.risk.getEvidence(result.evidence_id)
  assert.equal(evidence.decision, 'DEFER')
  assert.equal(evidence.evaluation_status, 'NOT_EVALUABLE')
})

test('risk score maps to ALLOW, THROTTLE, DEFER and BLOCK', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)

  const low = assertRisk(p, task, { velocity: 0.1 }, { idempotencyKey: 'risk-low' })
  assert.equal(low.score, 0.025)
  assert.equal(low.decision, 'ALLOW')

  const throttle = assertRisk(p, task, { velocity: 0.8, amount_deviation: 0.8 }, { idempotencyKey: 'risk-throttle' })
  assert.equal(throttle.score, 0.4)
  assert.equal(throttle.decision, 'THROTTLE')

  const defer = assertRisk(
    p,
    task,
    { velocity: 1, amount_deviation: 1, new_counterparty: 0.9 },
    { idempotencyKey: 'risk-defer' },
  )
  assert.equal(defer.score, 0.68)
  assert.equal(defer.decision, 'DEFER')
  assert.ok(defer.reasons.length >= 2)

  const block = assertRisk(
    p,
    task,
    { velocity: 1, amount_deviation: 1, new_counterparty: 1, cross_chain_hops: 1, identity_unknown: 1 },
    { idempotencyKey: 'risk-block' },
  )
  assert.equal(block.score, 1)
  assert.equal(block.decision, 'BLOCK')
  assert.equal(block.trust_score, 0)
})

test('risk thresholds are configurable from engine.policy', () => {
  const p = plane({ settings: { policy: { riskBlockThreshold: 0.95, riskDeferThreshold: 0.9, riskThrottleThreshold: 0.85 } } })
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)

  const result = assertRisk(p, task, { velocity: 1, amount_deviation: 1, new_counterparty: 0.9 })
  assert.equal(result.score, 0.68)
  assert.equal(result.decision, 'ALLOW')
  assert.equal(result.evaluation.thresholds.block, 0.95)
})

test('risk evaluation honours verification status', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)

  const unsigned = createUnsignedEvent(p, task.id, requester.did)
  p.events.verify(unsigned.id)
  const unknown = p.risk.evaluate(
    { task_id: task.id, event_id: unsigned.id, subject_did: requester.did, features: { velocity: 0.1 } },
    { idempotencyKey: 'risk-unknown' },
  )
  assert.equal(unknown.evaluation_status, 'UNKNOWN')
  assert.equal(unknown.decision, 'DEFER')
  assert.equal(unknown.evaluation.factors.identity_unknown, 1)

  const impostor = seedIdentity(p.engine, { subject: 'impostor' })
  const body = signedEventBody(requester, task.id)
  body.signature.value = signPayload(impostor.privateKey, eventSigningPayload(body))
  const invalidEvent = p.events.create(body, { idempotencyKey: newId('evtkey') })
  p.events.verify(invalidEvent.id)
  const blocked = p.risk.evaluate(
    { task_id: task.id, event_id: invalidEvent.id, subject_did: requester.did, features: { velocity: 0.1 } },
    { idempotencyKey: 'risk-invalid' },
  )
  assert.equal(blocked.decision, 'BLOCK')
})

test('risk evaluation validates task, subject, event and features', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)

  expectError(
    () => p.risk.evaluate({ task_id: 'task_missing', subject_did: requester.did }, { idempotencyKey: 'r-1' }),
    'TASK_NOT_FOUND',
    404,
  )
  expectError(
    () => p.risk.evaluate({ task_id: task.id, subject_did: 'did:trust:alpha:ghost' }, { idempotencyKey: 'r-2' }),
    'DID_NOT_FOUND',
    404,
  )
  expectError(
    () => p.risk.evaluate({ task_id: task.id, subject_did: requester.did, features: [] }, { idempotencyKey: 'r-3' }),
    'VALIDATION_ERROR',
    422,
  )

  const otherTask = createTask(p, requester, { amount: '3' })
  const otherEvent = createUnsignedEvent(p, otherTask.id, requester.did)
  expectError(
    () =>
      p.risk.evaluate(
        { task_id: task.id, event_id: otherEvent.id, subject_did: requester.did },
        { idempotencyKey: 'r-4' },
      ),
    'EVENT_TASK_MISMATCH',
    409,
  )
})

test('risk evidence list and lookup are scoped and ordered', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const first = assertRisk(p, task, { velocity: 0.1 }, { idempotencyKey: 'ev-1' })
  const second = assertRisk(p, task, { velocity: 0.2 }, { idempotencyKey: 'ev-2' })

  const listed = p.risk.evidence({ task_id: task.id })
  assert.equal(listed.length, 2)
  assert.deepEqual(new Set(listed.map((item) => item.id)), new Set([first.evidence_id, second.evidence_id]))
  expectError(() => p.risk.getEvidence('risk_missing'), 'RISK_EVIDENCE_NOT_FOUND', 404)
})

test('risk evaluation is idempotent per key', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const payload = { task_id: task.id, subject_did: requester.did, features: { velocity: 0.3 } }

  const first = p.risk.evaluate(payload, { idempotencyKey: 'risk-idem' })
  const replay = p.risk.evaluate(payload, { idempotencyKey: 'risk-idem' })
  assert.equal(replay.evidence_id, first.evidence_id)

  expectError(
    () => p.risk.evaluate({ ...payload, features: { velocity: 0.9 } }, { idempotencyKey: 'risk-idem' }),
    'IDEMPOTENCY_CONFLICT',
    409,
  )
})

/* ------------------------------------------------------------------ */
/* interventions                                                       */
/* ------------------------------------------------------------------ */

function decideAllow(p, task, extra = {}, key = newId('dkey')) {
  return p.interventions.decide(
    { task_id: task.id, action: 'ALLOW', rationale: { reasons: ['policy check passed'], ...extra } },
    { idempotencyKey: key },
  )
}

test('intervention decide validates actions and rationale', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)

  expectError(
    () => p.interventions.decide({ task_id: task.id, action: 'NUKE' }, { idempotencyKey: newId('k') }),
    'VALIDATION_ERROR',
    422,
  )
  expectError(
    () => p.interventions.decide({ task_id: task.id, action: 'DEFER', rationale: {} }, { idempotencyKey: newId('k') }),
    'VALIDATION_ERROR',
    422,
  )
  expectError(
    () => p.interventions.decide({ task_id: task.id, action: 'BLOCK', rationale: { reasons: [] } }, { idempotencyKey: newId('k') }),
    'VALIDATION_ERROR',
    422,
  )
  expectError(
    () => p.interventions.decide({ task_id: task.id, action: 'ALLOW', rationale: [] }, { idempotencyKey: newId('k') }),
    'VALIDATION_ERROR',
    422,
  )
  expectError(
    () => p.interventions.decide({ task_id: 'task_missing', action: 'ALLOW' }, { idempotencyKey: newId('k') }),
    'TASK_NOT_FOUND',
    404,
  )
})

test('intervention decide persists a DECIDED record', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)

  const decision = decideAllow(p, task, {}, 'decide-1')
  assert.match(decision.id, /^dec_/)
  assert.equal(decision.task_id, task.id)
  assert.equal(decision.action, 'ALLOW')
  assert.equal(decision.status, 'DECIDED')
  assert.equal(decision.rationale.requested_action, 'ALLOW')
  assert.equal(decision.rationale.effective_action, 'ALLOW')
  assert.deepEqual(decision.rationale.opa, {})
  assert.equal(p.engine.state.interventions[decision.id].action, 'ALLOW')
  assert.equal(p.interventions.list().length, 1)

  const replay = decideAllow(p, task, {}, 'decide-1')
  assert.equal(replay.id, decision.id)
})

test('intervention decide escalates unknown verification to DEFER and invalid to BLOCK', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)

  const unsigned = createUnsignedEvent(p, task.id, requester.did)
  p.events.verify(unsigned.id)
  const deferred = p.interventions.decide(
    { task_id: task.id, event_id: unsigned.id, action: 'ALLOW', rationale: {} },
    { idempotencyKey: 'dec-unknown' },
  )
  assert.equal(deferred.action, 'DEFER')
  assert.ok(deferred.rationale.decision_reasons.includes('必要证明暂不可达'))

  const impostor = seedIdentity(p.engine, { subject: 'impostor' })
  const body = signedEventBody(requester, task.id)
  body.signature.value = signPayload(impostor.privateKey, eventSigningPayload(body))
  const invalidEvent = p.events.create(body, { idempotencyKey: newId('evtkey') })
  p.events.verify(invalidEvent.id)
  const blocked = p.interventions.decide(
    { task_id: task.id, event_id: invalidEvent.id, action: 'ALLOW', rationale: {} },
    { idempotencyKey: 'dec-invalid' },
  )
  assert.equal(blocked.action, 'BLOCK')
  assert.ok(blocked.rationale.decision_reasons.includes('身份、授权或账本校验确定无效'))
})

test('intervention decide defers when risk evidence is NOT_EVALUABLE', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const risk = p.risk.evaluate(
    { task_id: task.id, subject_did: requester.did },
    { idempotencyKey: 'risk-for-decision' },
  )
  const decision = p.interventions.decide(
    { task_id: task.id, action: 'ALLOW', rationale: { evidence_id: risk.evidence_id } },
    { idempotencyKey: 'dec-risk' },
  )
  assert.equal(decision.action, 'DEFER')
  assert.ok(decision.rationale.decision_reasons.includes('风险证据不足以完成当前判断'))
})

test('intervention decide rejects reused idempotency keys with another body', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  decideAllow(p, task, {}, 'dec-idem')
  expectError(() => decideAllow(p, task, { note: 'different' }, 'dec-idem'), 'IDEMPOTENCY_CONFLICT', 409)
})

test('intervention execution is disabled unless the gate setting is on', () => {
  const p = plane()
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const decision = decideAllow(p, task)

  expectError(() => p.interventions.execute(decision.id), 'EXECUTION_GATE_DISABLED', 403)
  assert.equal(Object.keys(p.engine.state.receipts).length, 0)
  expectError(() => p.interventions.execute('dec_missing'), 'EXECUTION_GATE_DISABLED', 403)
})

test('intervention execution emits a receipt and applies the task state', () => {
  const p = plane({ settings: { allowInterventionExecution: true } })
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  const decision = decideAllow(p, task)

  const receipt = p.interventions.execute(decision.id)
  assert.match(receipt.id, /^rcpt_/)
  assert.equal(receipt.decision_id, decision.id)
  assert.equal(receipt.task_id, task.id)
  assert.equal(receipt.action, 'ALLOW')
  assert.equal(receipt.status, 'APPLIED')
  assert.equal(receipt.amount_reserved, '0.00000000')
  assert.equal(receipt.target_system, 'embedded-engine')
  assert.equal(receipt.applied_state, APPLIED_STATES.ALLOW)
  assert.equal(receipt.applied_state, 'AUTHORIZED')
  assert.equal(receipt.error_code, null)
  assert.match(receipt.external_ref, /^embedded:[0-9a-f]{64}$/)
  assert.match(receipt.signature, /^sha256:[0-9a-f]{64}$/)
  assert.equal(receipt.quota_key, null)
  assert.equal(receipt.details.deterministic, true)

  const stored = p.engine.state.receipts[decision.id]
  assert.equal(stored.amount_reserved, 0)
  assert.equal(p.tasks.get(task.id).status, 'AUTHORIZED')
  assert.equal(p.engine.state.interventions[decision.id].status, 'EXECUTED')
  assert.equal(p.engine.counts().receipts, 1)

  const replay = p.interventions.execute(decision.id)
  assert.equal(replay.id, receipt.id)
  assert.equal(p.interventions.receipts().length, 1)
})

test('intervention execution rejects invalid task transitions', () => {
  const p = plane({ settings: { allowInterventionExecution: true } })
  const requester = seedIdentity(p.engine)
  const task = createTask(p, requester)
  p.engine.state.tasks[task.id].status = 'CONFIRMED'

  const decision = p.interventions.decide(
    { task_id: task.id, action: 'BLOCK', rationale: { reasons: ['fraud confirmed'] } },
    { idempotencyKey: 'dec-block' },
  )
  expectError(() => p.interventions.execute(decision.id), 'TASK_STATE_TRANSITION_INVALID', 409)
  assert.equal(p.tasks.get(task.id).status, 'CONFIRMED')
})

/* ------------------------------------------------------------------ */
/* persistence                                                         */
/* ------------------------------------------------------------------ */

test('FileStore persistence round-trips engine flows', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dsh-engine-flows-'))
  try {
    const p = plane({ store: new FileStore(directory) })
    const requester = seedIdentity(p.engine)
    const task = createTask(p, requester)
    const event = createUnsignedEvent(p, task.id, requester.did)
    p.events.verify(event.id)
    const risk = p.risk.evaluate(
      { task_id: task.id, subject_did: requester.did, features: { velocity: 0.5 } },
      { idempotencyKey: 'persist-risk' },
    )
    const decision = decideAllow(p, task)
    p.engine.flush()

    const reloaded = plane({ store: new FileStore(directory) })
    assert.equal(reloaded.tasks.get(task.id).id, task.id)
    assert.equal(reloaded.tasks.get(task.id).status, 'QUOTING')
    assert.equal(reloaded.events.get(event.id).id, event.id)
    assert.equal(reloaded.events.get(event.id).verification.overall_status, 'UNKNOWN')
    assert.equal(reloaded.risk.getEvidence(risk.evidence_id).id, risk.evidence_id)
    assert.equal(reloaded.interventions.get(decision.id).id, decision.id)
    assert.deepEqual(Object.keys(reloaded.engine.state.tasks), [task.id])
    assert.equal(reloaded.engine.state.settings !== undefined, true)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
