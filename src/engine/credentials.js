/**
 * Embedded credential engine.
 *
 * Ports the verifiable-credential lifecycle of the Python control plane:
 * issuance signed with the issuer's current DID key, deterministic offline
 * verification, status transitions with history, and idempotent writes. A
 * credential is only ever reported VALID when the issuer, its key, the proof,
 * the validity window, the required claims and the stored status all agree.
 *
 * @module dsh-trust-platform/engine/credentials
 */

import {
  fail,
  issueCredential,
  sha256Hex,
  verifyCredentialProof,
} from './core.js'

/** Credential lifecycle states accepted by status updates. */
const CREDENTIAL_STATUSES = Object.freeze(['ACTIVE', 'SUSPENDED', 'REVOKED'])

/** Credential status transition table copied from the Python service. */
const CREDENTIAL_TRANSITIONS = Object.freeze({
  ACTIVE: Object.freeze(['ACTIVE', 'SUSPENDED', 'REVOKED']),
  SUSPENDED: Object.freeze(['ACTIVE', 'SUSPENDED', 'REVOKED']),
  REVOKED: Object.freeze(['REVOKED']),
})

/** Default credential lifetime in milliseconds (365 days). */
const DEFAULT_VALIDITY_MS = 365 * 24 * 60 * 60 * 1000

/** Verification status values exposed by the contract. */
const VERIFY_STATUS = Object.freeze({
  VALID: 'VALID',
  INVALID: 'INVALID',
  UNKNOWN: 'UNKNOWN',
  NOT_EVALUABLE: 'NOT_EVALUABLE',
})

/** True when the value is a plain JSON object. */
function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** Parse an ISO timestamp, treating zone-less strings as UTC. */
function parseIso(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value !== 'string' || value.trim() === '') return null
  const text = value.trim()
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)
  const date = new Date(hasZone ? text : `${text}Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Validate and normalize a bounded string field. */
function textField(value, field, { min = 1, max = Number.MAX_SAFE_INTEGER, fallback = undefined } = {}) {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback
    fail('VALIDATION_ERROR', `${field} is required`, { status: 422 })
  }
  if (typeof value !== 'string') fail('VALIDATION_ERROR', `${field} must be a string`, { status: 422 })
  const trimmed = value.trim()
  if (trimmed.length < min || trimmed.length > max) {
    fail('VALIDATION_ERROR', `${field} length must be between ${min} and ${max}`, { status: 422 })
  }
  return trimmed
}

/** Resolve the idempotency key from an explicit argument or a request body. */
function idempotencyKeyOf(body = {}, explicit = undefined) {
  const key = explicit ?? body.idempotency_key ?? body.idempotencyKey
  return typeof key === 'string' && key.trim() !== '' ? key.trim() : null
}

/** Copy a request body without its idempotency key fields. */
function stripIdempotency(body = {}) {
  const copy = { ...body }
  delete copy.idempotency_key
  delete copy.idempotencyKey
  return copy
}

/**
 * Create the credential engine.
 *
 * @param engine - shared {@link import('./core.js').Engine} instance.
 * @returns credential methods backed by `state.credentials` and
 *   `state.credential_status`.
 */
export function createCredentialEngine(engine) {
  const credentials = engine.collection('credentials')
  const statusHistory = engine.collection('credential_status')
  const identities = engine.collection('identities')
  const identityKeys = engine.collection('identity_keys')

  /** Resolve an actor from a request body, defaulting to the engine actor. */
  function actorOf(body = {}) {
    const value = body.actor
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : engine.defaultActor()
  }

  /** Return a stored identity or throw DID_NOT_FOUND. */
  function identityOrThrow(did) {
    const identity = identities[did]
    if (!identity) fail('DID_NOT_FOUND', `DID ${did} is not registered`, { status: 404 })
    return identity
  }

  /** Return a stored identity, requiring ACTIVE status. */
  function activeIdentityOrThrow(did) {
    const identity = identityOrThrow(did)
    if (identity.status !== 'ACTIVE') {
      fail('DID_INACTIVE', `DID ${did} status is ${identity.status}`, { status: 409 })
    }
    return identity
  }

  /** Return the current signing key record of a DID. */
  function signingKey(did) {
    const history = Array.isArray(identityKeys[did]) ? identityKeys[did] : []
    const active = history.filter((item) => item && item.status === 'ACTIVE')
    return active.length > 0 ? active[active.length - 1] : null
  }

  /** Map a stored credential to the CredentialResponse contract. */
  function credentialResponse(record) {
    return {
      id: record.id,
      credential_type: record.credential_type,
      issuer_did: record.issuer_did,
      subject_did: record.subject_did,
      claims: record.claims,
      proof: record.proof,
      valid_from: record.valid_from,
      valid_to: record.valid_to,
      status: record.status,
      credential: record.credential,
    }
  }

  /** Map a stored status row to the CredentialStatusResponse contract. */
  function statusResponse(record) {
    return {
      credential_id: record.credential_id,
      status: record.status,
      reason: record.reason,
      effective_at: record.effective_at,
      evidence_refs: Array.isArray(record.evidence_refs) ? record.evidence_refs : [],
    }
  }

  /**
   * Issue a credential signed by the issuer's current ACTIVE DID key.
   *
   * The issuer, subject and signing key must all be resolvable; a missing signing
   * key is reported as ISSUER_KEY_UNAVAILABLE (503) rather than silently issuing
   * an unsigned credential.
   */
  function issue(payload = {}) {
    if (!plainObject(payload)) fail('VALIDATION_ERROR', 'credential issue body must be an object', { status: 422 })
    const key = idempotencyKeyOf(payload)
    const body = stripIdempotency(payload)
    const credentialType = textField(body.credential_type, 'credential_type', { min: 2, max: 120 })
    const issuerDid = textField(body.issuer_did, 'issuer_did', { min: 1, max: 250 })
    const subjectDid = textField(body.subject_did, 'subject_did', { min: 1, max: 250 })
    const claims = body.claims === undefined ? {} : body.claims
    if (!plainObject(claims)) fail('VALIDATION_ERROR', 'claims must be an object', { status: 422 })
    const fromDate = body.valid_from === undefined ? null : parseIso(body.valid_from)
    const toDate = body.valid_to === undefined ? null : parseIso(body.valid_to)
    if (body.valid_from !== undefined && fromDate === null) fail('VALIDATION_ERROR', 'valid_from is not a valid datetime', { status: 422 })
    if (body.valid_to !== undefined && toDate === null) fail('VALIDATION_ERROR', 'valid_to is not a valid datetime', { status: 422 })
    const actor = actorOf(body)
    return engine.idempotent(key, body, () => {
      const issuer = activeIdentityOrThrow(issuerDid)
      if (!actor.startsWith('system:') && actor !== issuer.did) {
        fail('ACCESS_DENIED', 'only the issuer DID can issue credentials', { status: 403 })
      }
      const subject = activeIdentityOrThrow(subjectDid)
      const signing = signingKey(issuer.did)
      if (!signing || typeof signing.private_key !== 'string' || signing.private_key === '') {
        fail('ISSUER_KEY_UNAVAILABLE', 'issuer DID has no signing key material', { status: 503, retryable: true })
      }
      const now = engine.now()
      const validFrom = fromDate ?? now
      const validTo = toDate ?? new Date(validFrom.getTime() + DEFAULT_VALIDITY_MS)
      if (validTo.getTime() <= validFrom.getTime()) {
        fail('CREDENTIAL_WINDOW_INVALID', 'valid_to must be after valid_from', { status: 400 })
      }
      const id = engine.id('vc')
      const document = issueCredential({
        credentialId: id,
        credentialType,
        issuerDid: issuer.did,
        subjectDid: subject.did,
        claims,
        issuerPrivateKey: signing.private_key,
        validFrom,
        validTo,
      })
      const proof = document.proof ?? null
      const unsigned = { ...document }
      delete unsigned.proof
      const createdAt = engine.iso(now)
      const record = {
        id,
        credential_type: credentialType,
        issuer_did: issuer.did,
        subject_did: subject.did,
        status: 'ACTIVE',
        credential: document,
        claims,
        proof,
        valid_from: engine.iso(validFrom),
        valid_to: engine.iso(validTo),
        revocation_reason: null,
        created_at: createdAt,
        updated_at: createdAt,
      }
      credentials[id] = record
      const initial = {
        id: engine.id('credstatus'),
        credential_id: id,
        status: 'ACTIVE',
        reason: 'issued',
        actor_did: issuer.did,
        effective_at: engine.iso(validFrom),
        evidence_refs: [sha256Hex(unsigned)],
        sequence: engine.nextSeq('credential_status'),
        created_at: createdAt,
      }
      statusHistory[initial.id] = initial
      engine.audit('credential.issue', issuer.did, 'credential', id, { credential_type: credentialType, idempotency_key: key })
      engine.save()
      return credentialResponse(record)
    })
  }

  /** Read a stored credential. */
  function get(id) {
    const target = textField(id, 'credential_id', { min: 1, max: 250 })
    const record = credentials[target]
    if (!record) fail('CREDENTIAL_NOT_FOUND', 'credential not found', { status: 404 })
    return credentialResponse(record)
  }

  /**
   * Verify a credential without trusting its claims.
   *
   * Status precedence: UNKNOWN (issuer/key unreachable) → INVALID (inactive
   * issuer, bad proof, expired window, revoked history) → NOT_EVALUABLE (all
   * proofs sound but required claims are missing) → VALID.
   */
  function verify(payload = {}) {
    if (!plainObject(payload)) fail('VALIDATION_ERROR', 'verification body must be an object', { status: 422 })
    const credential = payload.credential
    if (!plainObject(credential)) fail('VALIDATION_ERROR', 'credential must be an object', { status: 422 })
    const requiredClaims = Array.isArray(payload.required_claims) ? payload.required_claims.map((claim) => String(claim)) : []
    const issuerDid = typeof credential.issuer === 'string' ? credential.issuer : ''
    const subject = plainObject(credential.credentialSubject) ? credential.credentialSubject : {}
    const subjectDid = typeof subject.id === 'string' ? subject.id : ''
    if (!issuerDid || !subjectDid || !plainObject(credential.proof)) {
      return {
        valid: false,
        status: VERIFY_STATUS.NOT_EVALUABLE,
        issuer_did: issuerDid || undefined,
        subject_did: subjectDid || undefined,
        evidence_refs: [],
        reasons: ['credential is missing issuer, subject or proof'],
      }
    }
    const issuer = identities[issuerDid]
    if (!issuer) {
      return {
        valid: false,
        status: VERIFY_STATUS.UNKNOWN,
        issuer_did: issuerDid,
        subject_did: subjectDid,
        evidence_refs: [],
        reasons: ['issuer DID is not reachable'],
      }
    }
    if (issuer.status !== 'ACTIVE') {
      return {
        valid: false,
        status: VERIFY_STATUS.INVALID,
        issuer_did: issuerDid,
        subject_did: subjectDid,
        evidence_refs: [],
        reasons: [`issuer DID status is ${issuer.status}`],
      }
    }
    const key = signingKey(issuerDid)
    const publicKey = key?.public_key || issuer.public_key || ''
    if (!publicKey) {
      return {
        valid: false,
        status: VERIFY_STATUS.UNKNOWN,
        issuer_did: issuerDid,
        subject_did: subjectDid,
        evidence_refs: [],
        reasons: ['issuer signing key is not available'],
      }
    }
    const unsigned = { ...credential }
    delete unsigned.proof
    let status = VERIFY_STATUS.VALID
    const reasons = []
    if (!verifyCredentialProof(credential, publicKey)) {
      status = VERIFY_STATUS.INVALID
      reasons.push('credential proof signature is invalid')
    }
    const expires = parseIso(credential.expirationDate)
    if (expires === null) {
      status = VERIFY_STATUS.INVALID
      reasons.push('expirationDate is missing or malformed')
    } else if (expires.getTime() <= engine.now().getTime()) {
      status = VERIFY_STATUS.INVALID
      reasons.push('credential has expired')
    }
    const missing = requiredClaims.filter((claim) => !Object.prototype.hasOwnProperty.call(subject, claim))
    if (missing.length > 0) {
      if (status === VERIFY_STATUS.VALID) status = VERIFY_STATUS.NOT_EVALUABLE
      reasons.push(`missing required claims: ${missing.join(',')}`)
    }
    const stored = typeof credential.id === 'string' ? credentials[credential.id] : undefined
    if (stored && stored.status !== 'ACTIVE') {
      status = VERIFY_STATUS.INVALID
      reasons.push(`credential status is ${stored.status}`)
    }
    return {
      valid: status === VERIFY_STATUS.VALID,
      status,
      issuer_did: issuerDid,
      subject_did: subjectDid,
      evidence_refs: [sha256Hex(unsigned)],
      reasons,
    }
  }

  /** Change the status of a credential, appending an immutable history row. */
  function setStatus(id, payload = {}, explicitKey = undefined) {
    const target = textField(id, 'credential_id', { min: 1, max: 250 })
    const body = plainObject(payload) ? payload : {}
    const status = textField(body.status, 'status', { min: 1, max: 40 }).toUpperCase()
    if (!CREDENTIAL_STATUSES.includes(status)) {
      fail('VALIDATION_ERROR', `status must be one of ${CREDENTIAL_STATUSES.join(', ')}`, { status: 422 })
    }
    const reason = textField(body.reason, 'reason', { min: 3, max: 1000 })
    const actor = actorOf(body)
    const payloadActor = typeof body.actor_did === 'string' && body.actor_did.trim() !== '' ? body.actor_did.trim() : actor
    const key = idempotencyKeyOf(body, explicitKey)
    const requestBody = { credential_id: target, actor, ...stripIdempotency(body) }
    return engine.idempotent(key, requestBody, () => {
      const record = credentials[target]
      if (!record) fail('CREDENTIAL_NOT_FOUND', 'credential not found', { status: 404 })
      if (!actor.startsWith('system:') && payloadActor !== actor) {
        fail('ACTOR_MISMATCH', 'status actor_did must match the calling actor', { status: 403 })
      }
      if (!payloadActor.startsWith('system:') && payloadActor !== record.issuer_did) {
        fail('ACCESS_DENIED', 'only the issuer or a governance service can update credential status', { status: 403 })
      }
      const allowed = CREDENTIAL_TRANSITIONS[record.status] ?? []
      if (!allowed.includes(status)) {
        fail('CREDENTIAL_STATUS_TRANSITION_INVALID', `credential cannot move from ${record.status} to ${status}`, { status: 409 })
      }
      record.status = status
      record.revocation_reason = status === 'ACTIVE' ? null : reason
      record.updated_at = engine.iso()
      const historyRow = {
        id: engine.id('credstatus'),
        credential_id: target,
        status,
        reason,
        actor_did: payloadActor,
        effective_at: engine.iso(),
        evidence_refs: [sha256Hex({ credential_id: target, status, reason })],
        sequence: engine.nextSeq('credential_status'),
        created_at: engine.iso(),
      }
      statusHistory[historyRow.id] = historyRow
      engine.audit('credential.status', payloadActor, 'credential', target, { status, reason, idempotency_key: key })
      engine.save()
      return statusResponse(historyRow)
    })
  }

  /** List credential status history rows, newest first. */
  function statusHistoryFor(id) {
    const target = textField(id, 'credential_id', { min: 1, max: 250 })
    if (!credentials[target]) fail('CREDENTIAL_NOT_FOUND', 'credential not found', { status: 404 })
    return Object.values(statusHistory)
      .filter((row) => row && row.credential_id === target)
      .sort((left, right) => {
        const byTime = String(right.effective_at).localeCompare(String(left.effective_at))
        if (byTime !== 0) return byTime
        return (right.sequence ?? 0) - (left.sequence ?? 0)
      })
      .map(statusResponse)
  }

  return {
    issue,
    get,
    verify,
    setStatus,
    statusHistory: statusHistoryFor,
  }
}
