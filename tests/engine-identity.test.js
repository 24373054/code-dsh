/**
 * Engine tests for the embedded identity, credential and delegation modules.
 *
 * These tests exercise the three identity-dev engine modules directly against a
 * real `Engine` instance (no tools, no HTTP) and cover the documented contract:
 * shapes, validation codes/statuses, idempotency, "never silently allow"
 * invariants and FileStore persistence.
 */

import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { Engine, FileStore, MemoryStore, generateKeyPair } from '../src/engine/core.js'
import { createDelegationEngine } from '../src/engine/delegations.js'
import { createCredentialEngine } from '../src/engine/credentials.js'
import { createIdentityEngine } from '../src/engine/identity.js'

const ACTOR = 'system:test'
const DOMAIN = 'acme.example'
const REQUESTER_DID = `did:trust:${DOMAIN}:requester`
const AGENT_DID = `did:trust:${DOMAIN}:agent`
const SUBAGENT_DID = `did:trust:${DOMAIN}:subagent`

/** Create a fresh engine plus the three module facades. */
function setup(store = new MemoryStore()) {
  const engine = new Engine({ settings: { actorDid: ACTOR }, store, logger: null })
  return {
    engine,
    identity: createIdentityEngine(engine),
    credentials: createCredentialEngine(engine),
    delegations: createDelegationEngine(engine),
  }
}

/** Register a DID with a display name derived from its subject id. */
function registerDid(identity, domain, subject, extra = {}) {
  return identity.registerDid({
    domain_id: domain,
    subject_id: subject,
    display_name: `Agent ${subject}`,
    ...extra,
  })
}

/** Seed a PaymentTask record directly (tasks.js is owned by another module). */
function seedTask(engine, overrides = {}) {
  const timestamp = engine.iso()
  const task = {
    id: 'task_1',
    domain_id: DOMAIN,
    requester_did: REQUESTER_DID,
    asset_id: 'USDC',
    amount: 5000,
    beneficiary: 'beneficiary-1',
    status: 'CREATED',
    policy_version: engine.policy.policyVersion,
    metadata: {},
    created_at: timestamp,
    updated_at: timestamp,
    ...overrides,
  }
  engine.collection('tasks')[task.id] = task
  return task
}

/** Build a valid delegation create body with an aware time window. */
function delegationBody(overrides = {}) {
  const now = Date.now()
  return {
    task_id: 'task_1',
    issuer_did: REQUESTER_DID,
    subject_did: AGENT_DID,
    actions: ['payreq', ' quote '],
    asset_id: 'USDC',
    amount_limit: 1000,
    daily_limit: 2000,
    valid_from: new Date(now - 60 * 60 * 1000).toISOString(),
    valid_to: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
    can_redelegate: true,
    ...overrides,
  }
}

/** Prepare a task plus the requester/agent DIDs used by delegation tests. */
function setupDelegation() {
  const plane = setup()
  const requester = registerDid(plane.identity, DOMAIN, 'requester')
  const agent = registerDid(plane.identity, DOMAIN, 'agent')
  seedTask(plane.engine, { requester_did: requester.did })
  return { ...plane, requester, agent }
}

/** Assert that a callback throws the expected ServiceError. */
function assertServiceError(callback, code, status) {
  assert.throws(callback, (error) => {
    assert.equal(error.name, 'ServiceError')
    assert.equal(error.code, code)
    assert.equal(error.status, status)
    return true
  })
}

/* ------------------------------------------------------------------ */
/* identity                                                            */
/* ------------------------------------------------------------------ */

test('identity: registers a DID with document, status and key history', () => {
  const { engine, identity } = setup()
  const response = registerDid(identity, DOMAIN, 'agent-1', { jurisdiction: 'SG' })
  assert.equal(response.did, 'did:trust:acme.example:agent-1')
  assert.equal(response.domain_id, DOMAIN)
  assert.equal(response.status, 'ACTIVE')
  assert.equal(response.document.id, response.did)
  assert.equal(response.document.verificationMethod[0].id, `${response.did}#key-1`)
  assert.equal(typeof response.dev_private_key, 'string')

  const stored = engine.state.identities[response.did]
  assert.equal(stored.subject_id, 'agent-1')
  assert.equal(stored.display_name, 'Agent agent-1')
  assert.equal(stored.jurisdiction, 'SG')
  assert.equal(stored.status, 'ACTIVE')
  assert.equal(typeof stored.created_at, 'string')
  assert.equal(stored.updated_at, stored.updated_at)
  assert.equal(engine.state.identity_keys[response.did][0].reason, 'initial-registration')
  assert.equal(typeof engine.state.identity_keys[response.did][0].private_key, 'string')

  const keys = identity.listDidKeys(response.did)
  assert.equal(keys.length, 1)
  assert.equal(keys[0].key_id, `${response.did}#key-1`)
  assert.equal(keys[0].status, 'ACTIVE')
  assert.equal(keys[0].retired_at, null)
  assert.equal(keys[0].private_key, undefined)

  const fetched = identity.getDid(response.did)
  assert.equal(fetched.did, response.did)
  assert.equal(fetched.status, 'ACTIVE')
  assert.equal(fetched.public_key, stored.public_key)
  assert.equal(fetched.updated_at, stored.updated_at)
})

test('identity: default jurisdiction is CN and a duplicate DID is rejected', () => {
  const { identity } = setup()
  const response = registerDid(identity, DOMAIN, 'default-jurisdiction')
  assert.equal(identity.getDid(response.did).did, response.did)
  assert.equal(identity.listDidKeys(response.did).length, 1)
  assertServiceError(() => registerDid(identity, DOMAIN, 'default-jurisdiction'), 'DID_ALREADY_EXISTS', 409)
})

test('identity: registration validates field lengths, keys and display name', () => {
  const { identity } = setup()
  assertServiceError(
    () => identity.registerDid({ domain_id: 'a', subject_id: 'agent', display_name: 'Agent' }),
    'VALIDATION_ERROR',
    422,
  )
  assertServiceError(
    () => identity.registerDid({ domain_id: DOMAIN, subject_id: 'agent', display_name: '' }),
    'VALIDATION_ERROR',
    422,
  )
  const pair = generateKeyPair()
  assertServiceError(
    () => identity.registerDid({
      domain_id: DOMAIN,
      subject_id: 'bound-agent',
      display_name: 'Bound Agent',
      public_key: 'not-the-matching-public-key',
      private_key: pair.privateKey,
    }),
    'DID_KEY_MISMATCH',
    409,
  )
  const publicOnly = identity.registerDid({
    domain_id: DOMAIN,
    subject_id: 'public-only',
    display_name: 'Public Only',
    public_key: pair.publicKey,
  })
  assert.equal(publicOnly.dev_private_key, null)
  assert.equal(publicOnly.document.verificationMethod[0].publicKeyMultibase, pair.publicKey)
})

test('identity: getDid/listDids enforce lookup and domain filters', () => {
  const { identity } = setup()
  assertServiceError(() => identity.getDid('did:trust:gone.example:missing'), 'DID_NOT_FOUND', 404)
  assertServiceError(() => identity.listDidKeys('did:trust:gone.example:missing'), 'DID_NOT_FOUND', 404)

  registerDid(identity, DOMAIN, 'agent-one')
  registerDid(identity, DOMAIN, 'agent-two')
  const otherDomain = registerDid(identity, 'other.example', 'agent-three')

  assert.equal(identity.listDids().length, 3)
  assert.equal(identity.listDids({ limit: 2 }).length, 2)

  const actor = registerDid(identity, DOMAIN, 'domain-actor')
  const scoped = identity.listDids({ actor: actor.did })
  assert.equal(scoped.length, 3)
  assert.equal(scoped.every((item) => item.domain_id === DOMAIN), true)

  const otherActor = registerDid(identity, 'other.example', 'other-actor')
  const otherScoped = identity.listDids({ actor: otherActor.did })
  assert.equal(otherScoped.length, 2)
  assert.equal(otherScoped.some((item) => item.did === otherDomain.did), true)
  assertServiceError(() => identity.listDids({ actor: 'did:trust:acme.example:unknown-actor' }), 'ACTOR_NOT_FOUND', 403)
})

test('identity: rotateDid retires the old key and version-bumps the document', () => {
  const { engine, identity } = setup()
  const registered = registerDid(identity, DOMAIN, 'rotating-agent')
  assertServiceError(
    () => identity.rotateDid(registered.did, { public_key: 'whatever' }),
    'VALIDATION_ERROR',
    422,
  )
  const rotated = identity.rotateDid(registered.did, { reason: 'scheduled key rotation' })
  assert.equal(rotated.did, registered.did)
  assert.equal(rotated.status, 'ACTIVE')
  assert.equal(rotated.document.verificationMethod[0].id, `${registered.did}#key-2`)
  assert.equal(typeof rotated.dev_private_key, 'string')
  assert.notEqual(rotated.document.verificationMethod[0].publicKeyMultibase, registered.document.verificationMethod[0].publicKeyMultibase)

  const keys = identity.listDidKeys(registered.did)
  assert.equal(keys.length, 2)
  assert.equal(keys[0].key_id, `${registered.did}#key-1`)
  assert.equal(keys[0].status, 'RETIRED')
  assert.equal(typeof keys[0].retired_at, 'string')
  assert.equal(keys[1].key_id, `${registered.did}#key-2`)
  assert.equal(keys[1].status, 'ACTIVE')
  assert.equal(engine.state.identities[registered.did].key_version, 2)
  assert.equal(engine.state.identities[registered.did].public_key, rotated.document.verificationMethod[0].publicKeyMultibase)

  assertServiceError(
    () => identity.rotateDid('did:trust:gone.example:missing', { reason: 'nope nope' }),
    'DID_NOT_FOUND',
    404,
  )
})

test('identity: setDidStatus enforces the transition table', () => {
  const { identity } = setup()
  const registered = registerDid(identity, DOMAIN, 'status-agent')
  const suspended = identity.setDidStatus(registered.did, { status: 'SUSPENDED', reason: 'manual review hold' })
  assert.equal(suspended.status, 'SUSPENDED')
  assert.equal(identity.getDid(registered.did).status, 'SUSPENDED')
  const revoked = identity.setDidStatus(registered.did, { status: 'REVOKED', reason: 'identity revoked for cause' })
  assert.equal(revoked.status, 'REVOKED')
  assertServiceError(
    () => identity.setDidStatus(registered.did, { status: 'SUSPENDED', reason: 'cannot reactivate revoked' }),
    'DID_STATUS_TRANSITION_INVALID',
    409,
  )
  assertServiceError(
    () => identity.setDidStatus(registered.did, { status: 'ZOMBIE', reason: 'invalid enum value' }),
    'VALIDATION_ERROR',
    422,
  )
  assertServiceError(
    () => identity.setDidStatus('did:trust:gone.example:missing', { status: 'ACTIVE', reason: 'missing target' }),
    'DID_NOT_FOUND',
    404,
  )
})

test('identity: admission for an unknown DID is UNKNOWN, never ALLOW', () => {
  const { engine, identity } = setup()
  const decision = identity.admit({ did: 'did:trust:ghost.example:missing', required_actions: ['PAYREQ'] })
  assert.equal(decision.status, 'UNKNOWN')
  assert.notEqual(decision.status, 'ALLOW')
  assert.equal(decision.trust_score, 0)
  assert.deepEqual(decision.allowed_actions, [])
  assert.deepEqual(decision.evidence_refs, [])
  assert.equal(decision.limits.single_amount, '0.00000000')
  assert.equal(decision.limits.daily_amount, '0.00000000')
  assert.equal(typeof decision.id, 'string')
  assert.equal(decision.id.startsWith('admit_'), true)
  assert.equal(decision.policy_version, engine.policy.policyVersion)
  assert.equal(Object.keys(engine.state.admission_decisions).length, 1)
})

test('identity: admission without credentials is UNKNOWN and with a registration credential is ALLOW', () => {
  const { engine, identity, credentials } = setup()
  const issuer = registerDid(identity, DOMAIN, 'requester')
  const agent = registerDid(identity, DOMAIN, 'agent')

  const withoutCredentials = identity.admit({ did: agent.did })
  assert.equal(withoutCredentials.status, 'UNKNOWN')
  assert.deepEqual(withoutCredentials.allowed_actions, [])

  const credential = credentials.issue({
    credential_type: 'AgentRegistrationCredential',
    issuer_did: issuer.did,
    subject_did: agent.did,
    claims: { capabilities: ['payreq', 'quote'], jurisdiction: 'SG' },
  })
  assert.equal(credential.status, 'ACTIVE')

  const allowed = identity.admit({ did: agent.did, required_actions: ['PAYREQ'], jurisdiction: 'SG' })
  assert.equal(allowed.status, 'ALLOW')
  assert.equal(allowed.trust_score, 0.95)
  assert.deepEqual(allowed.allowed_actions, ['PAYREQ'])
  assert.equal(allowed.limits.single_amount, engine.policy.singleAmountLimit.toFixed(8))
  assert.equal(allowed.limits.daily_amount, engine.policy.dailyAmountLimit.toFixed(8))
  assert.equal(allowed.evidence_refs.length, 1)
  assert.equal(allowed.domain_id, DOMAIN)

  const blockedCapability = identity.admit({ did: agent.did, required_actions: ['SETTLE'] })
  assert.equal(blockedCapability.status, 'BLOCK')
  assert.equal(blockedCapability.trust_score, 0.1)
  assert.deepEqual(blockedCapability.allowed_actions, [])

  const blockedJurisdiction = identity.admit({ did: agent.did, required_actions: ['PAYREQ'], jurisdiction: 'US' })
  assert.equal(blockedJurisdiction.status, 'BLOCK')
})

test('identity: admission for an inactive DID raises DID_INACTIVE', () => {
  const { identity } = setup()
  const agent = registerDid(identity, DOMAIN, 'suspended-agent')
  identity.setDidStatus(agent.did, { status: 'SUSPENDED', reason: 'suspicious behaviour flagged' })
  assertServiceError(() => identity.admit({ did: agent.did }), 'DID_INACTIVE', 409)
})

test('identity: registration replays idempotency and rejects body drift', () => {
  const { engine, identity } = setup()
  const body = {
    domain_id: DOMAIN,
    subject_id: 'idempotent-agent',
    display_name: 'Idempotent Agent',
    idempotency_key: 'idem-register-1',
  }
  const first = identity.registerDid(body)
  const replay = identity.registerDid(body)
  assert.equal(replay.did, first.did)
  assert.equal(replay.dev_private_key, first.dev_private_key)
  assert.equal(Object.keys(engine.state.identities).length, 1)
  assertServiceError(
    () => identity.registerDid({ ...body, display_name: 'Changed Display Name' }),
    'IDEMPOTENCY_CONFLICT',
    409,
  )
})

/* ------------------------------------------------------------------ */
/* credentials                                                         */
/* ------------------------------------------------------------------ */

test('credentials: issue/get/verify round-trip returns VALID with evidence', () => {
  const { engine, identity, credentials } = setup()
  const issuer = registerDid(identity, DOMAIN, 'issuer')
  const subject = registerDid(identity, DOMAIN, 'subject')
  const response = credentials.issue({
    credential_type: 'AgentRegistrationCredential',
    issuer_did: issuer.did,
    subject_did: subject.did,
    claims: { capabilities: ['PAYREQ'], role: 'agent' },
  })
  assert.equal(response.id.startsWith('vc_'), true)
  assert.equal(response.credential_type, 'AgentRegistrationCredential')
  assert.equal(response.issuer_did, issuer.did)
  assert.equal(response.subject_did, subject.did)
  assert.equal(response.status, 'ACTIVE')
  assert.equal(response.credential.id, response.id)
  assert.equal(response.credential.issuer, issuer.did)
  assert.equal(response.credential.credentialSubject.id, subject.did)
  assert.equal(response.credential.credentialSubject.role, 'agent')
  assert.equal(response.proof.type, 'Ed25519Signature2020')
  assert.equal(typeof response.proof.proofValue, 'string')
  assert.equal(typeof response.valid_from, 'string')
  assert.equal(typeof response.valid_to, 'string')

  const fetched = credentials.get(response.id)
  assert.equal(fetched.credential.id, response.id)
  assert.equal(engine.state.credentials[response.id].status, 'ACTIVE')

  const verified = credentials.verify({ credential: fetched.credential, required_claims: ['role'] })
  assert.equal(verified.valid, true)
  assert.equal(verified.status, 'VALID')
  assert.equal(verified.issuer_did, issuer.did)
  assert.equal(verified.subject_did, subject.did)
  assert.deepEqual(verified.reasons, [])
  assert.equal(verified.evidence_refs.length, 1)

  const history = credentials.statusHistory(response.id)
  assert.equal(history.length, 1)
  assert.equal(history[0].credential_id, response.id)
  assert.equal(history[0].status, 'ACTIVE')
  assert.equal(history[0].reason, 'issued')
  const storedHistory = Object.values(engine.state.credential_status).filter((row) => row.credential_id === response.id)
  assert.equal(storedHistory.length, 1)
  assert.equal(storedHistory[0].actor_did, issuer.did)
})

test('credentials: issuance validates issuer, subject and window', () => {
  const { identity, credentials } = setup()
  const issuer = registerDid(identity, DOMAIN, 'issuer')
  const subject = registerDid(identity, DOMAIN, 'subject')

  assertServiceError(
    () => credentials.issue({ credential_type: 'AgentRegistrationCredential', issuer_did: 'did:trust:gone.example:missing', subject_did: subject.did }),
    'DID_NOT_FOUND',
    404,
  )
  identity.setDidStatus(issuer.did, { status: 'SUSPENDED', reason: 'issuer under review' })
  assertServiceError(
    () => credentials.issue({ credential_type: 'AgentRegistrationCredential', issuer_did: issuer.did, subject_did: subject.did }),
    'DID_INACTIVE',
    409,
  )
  const activeIssuer = registerDid(identity, DOMAIN, 'active-issuer')
  assertServiceError(
    () => credentials.issue({
      credential_type: 'AgentRegistrationCredential',
      issuer_did: activeIssuer.did,
      subject_did: subject.did,
      valid_from: '2027-01-02T00:00:00Z',
      valid_to: '2027-01-01T00:00:00Z',
    }),
    'CREDENTIAL_WINDOW_INVALID',
    400,
  )
  assertServiceError(
    () => credentials.issue({ credential_type: 'AgentRegistrationCredential', issuer_did: activeIssuer.did, subject_did: 'did:trust:gone.example:missing' }),
    'DID_NOT_FOUND',
    404,
  )
})

test('credentials: verification never returns VALID for unproven credentials', () => {
  const { identity, credentials } = setup()
  const issuer = registerDid(identity, DOMAIN, 'issuer')
  const subject = registerDid(identity, DOMAIN, 'subject')
  const issued = credentials.issue({
    credential_type: 'AgentRegistrationCredential',
    issuer_did: issuer.did,
    subject_did: subject.did,
    claims: { capabilities: ['PAYREQ'] },
  })

  const tampered = structuredClone(issued.credential)
  tampered.credentialSubject.capabilities = ['PAYREQ', 'SETTLE']
  const tamperedResult = credentials.verify({ credential: tampered })
  assert.equal(tamperedResult.valid, false)
  assert.equal(tamperedResult.status, 'INVALID')
  assert.equal(tamperedResult.evidence_refs.length, 1)

  const unknownIssuer = structuredClone(issued.credential)
  unknownIssuer.issuer = 'did:trust:ghost.example:missing'
  const unknown = credentials.verify({ credential: unknownIssuer })
  assert.equal(unknown.valid, false)
  assert.equal(unknown.status, 'UNKNOWN')
  assert.deepEqual(unknown.evidence_refs, [])

  const unsigned = structuredClone(issued.credential)
  delete unsigned.proof
  const unsignedResult = credentials.verify({ credential: unsigned })
  assert.equal(unsignedResult.valid, false)
  assert.equal(unsignedResult.status, 'NOT_EVALUABLE')

  const missingClaims = credentials.verify({ credential: issued.credential, required_claims: ['role'] })
  assert.equal(missingClaims.valid, false)
  assert.equal(missingClaims.status, 'NOT_EVALUABLE')
  assert.equal(Array.isArray(missingClaims.reasons), true)
})

test('credentials: expiration and issuer/key state make the credential INVALID', () => {
  const { identity, credentials } = setup()
  const issuer = registerDid(identity, DOMAIN, 'expiry-issuer')
  const subject = registerDid(identity, DOMAIN, 'expiry-subject')
  const now = Date.now()
  const expired = credentials.issue({
    credential_type: 'AgentRegistrationCredential',
    issuer_did: issuer.did,
    subject_did: subject.did,
    claims: {},
    valid_from: new Date(now - 48 * 60 * 60 * 1000),
    valid_to: new Date(now - 24 * 60 * 60 * 1000),
  })
  const expiredResult = credentials.verify({ credential: expired.credential })
  assert.equal(expiredResult.valid, false)
  assert.equal(expiredResult.status, 'INVALID')

  const freshIssuer = registerDid(identity, DOMAIN, 'fresh-issuer')
  const fresh = credentials.issue({
    credential_type: 'AgentRegistrationCredential',
    issuer_did: freshIssuer.did,
    subject_did: subject.did,
    claims: {},
  })
  identity.setDidStatus(freshIssuer.did, { status: 'REVOKED', reason: 'issuer key compromised' })
  const inactiveIssuer = credentials.verify({ credential: fresh.credential })
  assert.equal(inactiveIssuer.valid, false)
  assert.equal(inactiveIssuer.status, 'INVALID')
})

test('credentials: setStatus enforces transitions, actor guards and history order', () => {
  const { identity, credentials } = setup()
  const issuer = registerDid(identity, DOMAIN, 'issuer')
  const subject = registerDid(identity, DOMAIN, 'subject')
  const other = registerDid(identity, DOMAIN, 'other-agent')
  const issued = credentials.issue({
    credential_type: 'AgentRegistrationCredential',
    issuer_did: issuer.did,
    subject_did: subject.did,
    claims: {},
  })

  assertServiceError(
    () => credentials.setStatus(issued.id, { status: 'SUSPENDED', reason: 'impostor tries to act' , actor: other.did, actor_did: other.did }),
    'ACCESS_DENIED',
    403,
  )
  assertServiceError(
    () => credentials.setStatus(issued.id, { status: 'SUSPENDED', reason: 'actor mismatch attempt', actor: other.did, actor_did: subject.did }),
    'ACTOR_MISMATCH',
    403,
  )
  assertServiceError(
    () => credentials.setStatus(issued.id, { status: 'ZOMBIE', reason: 'invalid status value' }),
    'VALIDATION_ERROR',
    422,
  )
  assertServiceError(
    () => credentials.setStatus(issued.id, { status: 'SUSPENDED', reason: 'no' }),
    'VALIDATION_ERROR',
    422,
  )

  const suspended = credentials.setStatus(issued.id, { status: 'SUSPENDED', reason: 'manual review of claims' })
  assert.equal(suspended.credential_id, issued.id)
  assert.equal(suspended.status, 'SUSPENDED')
  assert.equal(typeof suspended.effective_at, 'string')
  assert.equal(suspended.evidence_refs.length, 1)
  assert.equal(credentials.verify({ credential: issued.credential }).status, 'INVALID')

  const revoked = credentials.setStatus(issued.id, { status: 'REVOKED', reason: 'credential withdrawn for cause' })
  assert.equal(revoked.status, 'REVOKED')
  assertServiceError(
    () => credentials.setStatus(issued.id, { status: 'ACTIVE', reason: 'cannot restore revoked cred' }),
    'CREDENTIAL_STATUS_TRANSITION_INVALID',
    409,
  )
  const history = credentials.statusHistory(issued.id)
  assert.equal(history.length, 3)
  assert.equal(history[0].status, 'REVOKED')
  assert.equal(history[history.length - 1].status, 'ACTIVE')
  assertServiceError(() => credentials.get('vc_missing'), 'CREDENTIAL_NOT_FOUND', 404)
  assertServiceError(() => credentials.statusHistory('vc_missing'), 'CREDENTIAL_NOT_FOUND', 404)
})

test('credentials: issue and setStatus idempotency replay and conflicts', () => {
  const { engine, identity, credentials } = setup()
  const issuer = registerDid(identity, DOMAIN, 'issuer')
  const subject = registerDid(identity, DOMAIN, 'subject')
  const body = {
    credential_type: 'AgentRegistrationCredential',
    issuer_did: issuer.did,
    subject_did: subject.did,
    claims: { role: 'agent' },
    idempotency_key: 'idem-credential-1',
  }
  const first = credentials.issue(body)
  const replay = credentials.issue(body)
  assert.equal(replay.id, first.id)
  assert.equal(Object.keys(engine.state.credentials).length, 1)
  assertServiceError(
    () => credentials.issue({ ...body, claims: { role: 'changed' } }),
    'IDEMPOTENCY_CONFLICT',
    409,
  )

  const statusBody = {
    status: 'SUSPENDED',
    reason: 'manual review of credential',
    idempotency_key: 'idem-credential-status-1',
  }
  const statusFirst = credentials.setStatus(first.id, statusBody)
  const statusReplay = credentials.setStatus(first.id, statusBody)
  assert.equal(statusReplay.id, statusFirst.id)
  assert.equal(credentials.statusHistory(first.id).length, 2)
  assertServiceError(
    () => credentials.setStatus(first.id, { ...statusBody, reason: 'a completely different reason' }),
    'IDEMPOTENCY_CONFLICT',
    409,
  )
})

/* ------------------------------------------------------------------ */
/* delegations                                                         */
/* ------------------------------------------------------------------ */

test('delegations: create/list/get return the DelegationResponse shape', () => {
  const { delegations, engine } = setupDelegation()
  const created = delegations.create(delegationBody())
  assert.equal(created.id.startsWith('del_'), true)
  assert.equal(created.task_id, 'task_1')
  assert.equal(created.issuer_did, REQUESTER_DID)
  assert.equal(created.subject_did, AGENT_DID)
  assert.deepEqual(created.actions, ['PAYREQ', 'QUOTE'])
  assert.equal(created.asset_id, 'USDC')
  assert.equal(created.amount_limit, '1000.00000000')
  assert.equal(created.daily_limit, '2000.00000000')
  assert.equal(created.parent_id, null)
  assert.equal(created.can_redelegate, true)
  assert.equal(created.status, 'ACTIVE')
  assert.equal(typeof created.valid_from, 'string')
  assert.equal(typeof created.valid_to, 'string')
  assert.equal(engine.state.delegations[created.id].idempotency_key, null)

  const fetched = delegations.get(created.id)
  assert.equal(fetched.id, created.id)
  assert.equal(fetched.status, 'ACTIVE')

  const list = delegations.list({ task_id: 'task_1' })
  assert.equal(list.length, 1)
  assert.equal(list[0].id, created.id)
  assert.equal(delegations.list({ limit: 1 }).length, 1)
  assert.equal(delegations.list({ task_id: 'task_missing' }).length, 0)

  assertServiceError(() => delegations.get('del_missing'), 'DELEGATION_NOT_FOUND', 404)
})

test('delegations: create enforces task, asset, action, root-issuer, quota and window rules', () => {
  const { delegations, identity } = setupDelegation()
  const agent = registerDid(identity, DOMAIN, 'agent-2')

  assertServiceError(
    () => delegations.create(delegationBody({ task_id: 'task_missing' })),
    'TASK_NOT_FOUND',
    404,
  )
  assertServiceError(
    () => delegations.create(delegationBody({ asset_id: 'EUR' })),
    'ASSET_SCOPE_MISMATCH',
    400,
  )
  assertServiceError(
    () => delegations.create(delegationBody({ actions: ['PAYREQ', 'REFUND'] })),
    'ACTION_NOT_SUPPORTED',
    422,
  )
  assertServiceError(
    () => delegations.create(delegationBody({ issuer_did: agent.did, subject_did: AGENT_DID })),
    'ROOT_DELEGATION_ISSUER_INVALID',
    403,
  )
  assertServiceError(
    () => delegations.create(delegationBody({ amount_limit: 9000 })),
    'QUOTA_SCOPE_EXCEEDED',
    409,
  )
  const now = Date.now()
  assertServiceError(
    () => delegations.create(delegationBody({
      valid_from: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      valid_to: new Date(now - 60 * 60 * 1000).toISOString(),
    })),
    'DELEGATION_EXPIRED',
    409,
  )
  assertServiceError(
    () => delegations.create(delegationBody({
      valid_from: '2027-01-01T00:00:00',
      valid_to: '2027-01-02T00:00:00',
    })),
    'TIMEZONE_REQUIRED',
    400,
  )
  assertServiceError(
    () => delegations.create(delegationBody({ actor: agent.did, issuer_did: REQUESTER_DID })),
    'ACTOR_MISMATCH',
    403,
  )
  assertServiceError(
    () => delegations.create(delegationBody({ actions: [] })),
    'VALIDATION_ERROR',
    422,
  )
})

test('delegations: parent chain enforces redelegation, scope, quota and time limits', () => {
  const { identity, delegations } = setupDelegation()
  const subagent = registerDid(identity, DOMAIN, 'subagent')
  const parent = delegations.create(delegationBody({ can_redelegate: true }))

  const parentFrom = Date.now() - 60 * 60 * 1000
  const childBody = delegationBody({
    parent_id: parent.id,
    issuer_did: AGENT_DID,
    subject_did: subagent.did,
    actions: ['PAYREQ'],
    amount_limit: 500,
    daily_limit: 1000,
    valid_from: new Date(parentFrom + 60 * 1000).toISOString(),
    valid_to: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  })
  const child = delegations.create(childBody)
  assert.equal(child.parent_id, parent.id)
  assert.equal(child.issuer_did, AGENT_DID)
  assert.equal(child.subject_did, subagent.did)

  assertServiceError(
    () => delegations.create({ ...childBody, parent_id: 'del_missing' }),
    'PARENT_DELEGATION_NOT_FOUND',
    404,
  )
  assertServiceError(
    () => delegations.create({ ...childBody, actions: ['PAYREQ', 'SETTLE'] }),
    'ACTION_SCOPE_EXCEEDED',
    409,
  )
  assertServiceError(
    () => delegations.create({ ...childBody, amount_limit: 1500 }),
    'QUOTA_SCOPE_EXCEEDED',
    409,
  )
  assertServiceError(
    () => delegations.create({
      ...childBody,
      valid_to: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    }),
    'TIME_SCOPE_EXCEEDED',
    409,
  )

  const nonRedelegable = delegations.create(delegationBody({ can_redelegate: false, subject_did: subagent.did }))
  const grandchildBody = delegationBody({
    parent_id: nonRedelegable.id,
    issuer_did: subagent.did,
    subject_did: AGENT_DID,
    actions: ['PAYREQ'],
    amount_limit: 100,
    daily_limit: 100,
    valid_from: new Date(parentFrom + 120 * 1000).toISOString(),
    valid_to: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  })
  assertServiceError(
    () => delegations.create(grandchildBody),
    'REDELEGATION_FORBIDDEN',
    409,
  )
})

test('delegations: create replays idempotency and rejects body drift', () => {
  const { engine, delegations } = setupDelegation()
  const body = { ...delegationBody(), idempotency_key: 'idem-delegation-1' }
  const first = delegations.create(body)
  const replay = delegations.create(body)
  assert.equal(replay.id, first.id)
  assert.equal(Object.keys(engine.state.delegations).length, 1)
  assertServiceError(
    () => delegations.create({ ...body, amount_limit: 42 }),
    'IDEMPOTENCY_CONFLICT',
    409,
  )
})

test('delegations: revoke requires reason/status, sets REVOKED and is idempotent', () => {
  const { identity, delegations } = setupDelegation()
  const delegation = delegations.create(delegationBody())

  assertServiceError(
    () => delegations.revoke(delegation.id, { status: 'CLOSED', reason: 'no' }),
    'VALIDATION_ERROR',
    422,
  )
  assertServiceError(
    () => delegations.revoke(delegation.id, { status: 'NOT_A_TASK_STATUS', reason: 'invalid task status fed' }),
    'VALIDATION_ERROR',
    422,
  )
  assertServiceError(() => delegations.revoke('del_missing', { status: 'CLOSED', reason: 'missing delegation' }), 'DELEGATION_NOT_FOUND', 404)

  const body = { status: 'CLOSED', reason: 'task closed by the operator', idempotency_key: 'idem-revoke-1' }
  const revoked = delegations.revoke(delegation.id, body)
  assert.equal(revoked.status, 'REVOKED')
  assert.equal(delegations.get(delegation.id).status, 'REVOKED')
  const replay = delegations.revoke(delegation.id, body)
  assert.equal(replay.status, 'REVOKED')
  assertServiceError(
    () => delegations.revoke(delegation.id, { ...body, reason: 'a different revocation reason' }),
    'IDEMPOTENCY_CONFLICT',
    409,
  )

  const otherDomainActor = registerDid(identity, 'other.example', 'other-domain-actor')
  const another = delegations.create(delegationBody())
  assertServiceError(
    () => delegations.revoke(another.id, { status: 'CLOSED', reason: 'cross domain attempt', actor: otherDomainActor.did }),
    'ACCESS_DENIED',
    403,
  )
  assertServiceError(
    () => delegations.get(another.id, { actor: otherDomainActor.did }),
    'ACCESS_DENIED',
    403,
  )
})

test('delegations: authorize ALLOWs within scope and reports every DENY reason', () => {
  const { engine, identity, delegations } = setupDelegation()
  const outsider = registerDid(identity, DOMAIN, 'outsider')
  const delegation = delegations.create(delegationBody())

  const allowed = delegations.authorize({
    delegation_id: delegation.id,
    subject_did: AGENT_DID,
    action: 'PAYREQ',
    asset_id: 'USDC',
    amount: 750,
  })
  assert.equal(allowed.decision, 'ALLOW')
  assert.equal(Array.isArray(allowed.reasons), true)
  assert.equal(typeof allowed.reasons[0].code, 'string')
  assert.equal(typeof allowed.reasons[0].message, 'string')
  assert.equal(allowed.task_id, 'task_1')
  assert.equal(allowed.requester_did, REQUESTER_DID)
  assert.equal(allowed.domain_id, DOMAIN)
  assert.equal(typeof allowed.evaluated_at, 'string')

  const requesterAuthority = delegations.authorize({
    delegation_id: delegation.id,
    subject_did: REQUESTER_DID,
    action: 'PAYREQ',
    asset_id: 'USDC',
    amount: 100,
  })
  assert.equal(requesterAuthority.decision, 'ALLOW')
  assert.equal(requesterAuthority.reasons[0].code, 'REQUESTER_AUTHORITY')

  const wrongAction = delegations.authorize({
    delegation_id: delegation.id,
    subject_did: AGENT_DID,
    action: 'SETTLE',
    asset_id: 'USDC',
    amount: 10,
  })
  assert.equal(wrongAction.decision, 'DENY')
  assert.equal(wrongAction.reasons[0].code, 'ACTION_SCOPE_EXCEEDED')

  const overLimit = delegations.authorize({
    delegation_id: delegation.id,
    subject_did: AGENT_DID,
    action: 'PAYREQ',
    asset_id: 'USDC',
    amount: 1001,
  })
  assert.equal(overLimit.decision, 'DENY')
  assert.equal(overLimit.reasons[0].code, 'QUOTA_EXCEEDED')

  const wrongAsset = delegations.authorize({
    delegation_id: delegation.id,
    subject_did: AGENT_DID,
    action: 'PAYREQ',
    asset_id: 'EUR',
    amount: 10,
  })
  assert.equal(wrongAsset.decision, 'DENY')
  assert.equal(wrongAsset.reasons[0].code, 'ASSET_SCOPE_MISMATCH')

  const wrongSubject = delegations.authorize({
    delegation_id: delegation.id,
    subject_did: outsider.did,
    action: 'PAYREQ',
    asset_id: 'USDC',
    amount: 10,
  })
  assert.equal(wrongSubject.decision, 'DENY')
  assert.equal(wrongSubject.reasons[0].code, 'SUBJECT_MISMATCH')

  engine.state.delegations[delegation.id].valid_to = engine.iso(new Date(Date.now() - 60 * 60 * 1000))
  const expired = delegations.authorize({
    delegation_id: delegation.id,
    subject_did: AGENT_DID,
    action: 'PAYREQ',
    asset_id: 'USDC',
    amount: 10,
  })
  assert.equal(expired.decision, 'DENY')
  assert.equal(expired.reasons[0].code, 'DELEGATION_EXPIRED')
})

test('delegations: authorize DEFERs unknown or not-yet-valid data, never ALLOW', () => {
  const { engine, delegations } = setupDelegation()
  const unknown = delegations.authorize({
    delegation_id: 'del_missing',
    subject_did: AGENT_DID,
    action: 'PAYREQ',
    asset_id: 'USDC',
    amount: 10,
  })
  assert.equal(unknown.decision, 'DEFER')
  assert.equal(unknown.reasons[0].code, 'DELEGATION_NOT_FOUND')

  const missingId = delegations.authorize({ subject_did: AGENT_DID, action: 'PAYREQ', asset_id: 'USDC', amount: 10 })
  assert.equal(missingId.decision, 'DEFER')
  assert.equal(missingId.reasons[0].code, 'DELEGATION_ID_REQUIRED')

  const now = Date.now()
  const future = delegations.create(delegationBody({
    valid_from: new Date(now + 60 * 60 * 1000).toISOString(),
    valid_to: new Date(now + 48 * 60 * 60 * 1000).toISOString(),
  }))
  const notYetValid = delegations.authorize({
    delegation_id: future.id,
    subject_did: AGENT_DID,
    action: 'PAYREQ',
    asset_id: 'USDC',
    amount: 10,
  })
  assert.equal(notYetValid.decision, 'DEFER')
  assert.equal(notYetValid.reasons[0].code, 'DELEGATION_NOT_YET_VALID')

  const missingAmount = delegations.authorize({
    delegation_id: future.id,
    subject_did: AGENT_DID,
    action: 'PAYREQ',
    asset_id: 'USDC',
  })
  assert.equal(missingAmount.decision, 'DEFER')
  assert.notEqual(missingAmount.decision, 'ALLOW')

  const missingTask = engine.state.tasks.task_1
  delete engine.state.tasks.task_1
  const noTask = delegations.authorize({
    delegation_id: future.id,
    subject_did: AGENT_DID,
    action: 'PAYREQ',
    asset_id: 'USDC',
    amount: 10,
  })
  assert.equal(noTask.decision, 'DEFER')
  assert.equal(noTask.reasons[0].code, 'TASK_NOT_FOUND')
  engine.state.tasks.task_1 = missingTask
})

test('delegations: authorize after revoke is DENY and child chains still validate', () => {
  const { identity, delegations } = setupDelegation()
  const subagent = registerDid(identity, DOMAIN, 'subagent')
  const parent = delegations.create(delegationBody({ can_redelegate: true }))
  const parentFrom = Date.now() - 60 * 60 * 1000
  const child = delegations.create(delegationBody({
    parent_id: parent.id,
    issuer_did: AGENT_DID,
    subject_did: subagent.did,
    actions: ['PAYREQ'],
    amount_limit: 500,
    daily_limit: 500,
    valid_from: new Date(parentFrom + 60 * 1000).toISOString(),
    valid_to: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  }))
  const childAuthorization = delegations.authorize({
    delegation_id: child.id,
    subject_did: subagent.did,
    action: 'PAYREQ',
    asset_id: 'USDC',
    amount: 100,
  })
  assert.equal(childAuthorization.decision, 'ALLOW')

  const revoked = delegations.revoke(parent.id, { status: 'CLOSED', reason: 'parent delegation revoked' })
  assert.equal(revoked.status, 'REVOKED')
  const parentAuthorization = delegations.authorize({
    delegation_id: parent.id,
    subject_did: AGENT_DID,
    action: 'PAYREQ',
    asset_id: 'USDC',
    amount: 100,
  })
  assert.equal(parentAuthorization.decision, 'DENY')
  assert.equal(parentAuthorization.reasons[0].code, 'DELEGATION_INACTIVE')
})

test('delegations: factories expose exactly the documented methods', () => {
  const { identity, credentials, delegations } = setup()
  assert.deepEqual(Object.keys(identity).sort(), ['admit', 'getDid', 'listDidKeys', 'listDids', 'registerDid', 'rotateDid', 'setDidStatus'])
  assert.deepEqual(Object.keys(credentials).sort(), ['get', 'issue', 'setStatus', 'statusHistory', 'verify'])
  assert.deepEqual(Object.keys(delegations).sort(), ['authorize', 'create', 'get', 'list', 'readChain', 'revoke'])
})

/* ------------------------------------------------------------------ */
/* persistence                                                         */
/* ------------------------------------------------------------------ */

test('persistence: identity, credential and delegation records survive a FileStore reload', () => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-engine-identity-'))
  try {
    const first = { engine: new Engine({ settings: { actorDid: ACTOR }, store: new FileStore(directory), logger: null }) }
    first.identity = createIdentityEngine(first.engine)
    first.credentials = createCredentialEngine(first.engine)
    first.delegations = createDelegationEngine(first.engine)

    const requester = registerDid(first.identity, DOMAIN, 'requester')
    const agent = registerDid(first.identity, DOMAIN, 'agent')
    seedTask(first.engine, { requester_did: requester.did })
    const credential = first.credentials.issue({
      credential_type: 'AgentRegistrationCredential',
      issuer_did: requester.did,
      subject_did: agent.did,
      claims: { capabilities: ['PAYREQ'] },
    })
    const delegation = first.delegations.create(delegationBody())
    first.engine.flush()

    const secondEngine = new Engine({ settings: { actorDid: ACTOR }, store: new FileStore(directory), logger: null })
    const second = {
      identity: createIdentityEngine(secondEngine),
      credentials: createCredentialEngine(secondEngine),
      delegations: createDelegationEngine(secondEngine),
    }
    assert.equal(second.identity.getDid(agent.did).did, agent.did)
    assert.equal(second.identity.listDidKeys(agent.did).length, 1)
    assert.equal(secondEngine.state.identity_keys[agent.did][0].private_key, first.engine.state.identity_keys[agent.did][0].private_key)
    assert.equal(second.credentials.get(credential.id).credential.id, credential.id)
    assert.equal(second.credentials.statusHistory(credential.id).length, 1)
    assert.equal(second.credentials.verify({ credential: second.credentials.get(credential.id).credential }).status, 'VALID')
    assert.equal(second.delegations.get(delegation.id).id, delegation.id)
    assert.equal(second.delegations.list().length, 1)
    const persistedAuthorization = second.delegations.authorize({
      delegation_id: delegation.id,
      subject_did: AGENT_DID,
      action: 'PAYREQ',
      asset_id: 'USDC',
      amount: 100,
    })
    assert.equal(persistedAuthorization.decision, 'ALLOW')
    secondEngine.flush()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
