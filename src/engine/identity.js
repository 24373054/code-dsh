/**
 * Embedded identity engine.
 *
 * Ports the DID registry and admission semantics of the Python control plane
 * into the plugin process: registration, key rotation, identity status, key
 * history, actor guards and deterministic admission decisions. Every write is
 * wrapped in `engine.idempotent` so repeated tool calls replay the recorded
 * response instead of mutating state twice.
 *
 * @module dsh-trust-platform/engine/identity
 */

import {
  createDid,
  didDocument,
  fail,
  generateKeyPair,
  publicFromPrivate,
  sha256Hex,
} from './core.js'

/** Actions an admission decision grants when the caller does not request a subset. */
const DEFAULT_ALLOWED_ACTIONS = Object.freeze(['DELEGATE', 'QUOTE', 'SELECT', 'PAYREQ', 'RESULT', 'BRIDGE', 'SETTLE'])

/** DID lifecycle states accepted by status updates. */
const DID_STATUSES = Object.freeze(['ACTIVE', 'SUSPENDED', 'REVOKED'])

/** DID status transition table copied from the Python service. */
const DID_TRANSITIONS = Object.freeze({
  ACTIVE: Object.freeze(['ACTIVE', 'SUSPENDED', 'REVOKED']),
  SUSPENDED: Object.freeze(['ACTIVE', 'SUSPENDED', 'REVOKED']),
  REVOKED: Object.freeze(['REVOKED']),
})

/**
 * Embedded mode is development mode: registrations hand the generated private
 * key back to the caller so offline demos can sign credentials.
 */
const DEV_MODE = true

/** Maximum rows returned by a single list call. */
const MAX_LIST_LIMIT = 200

/** Coerce a number or numeric string to a finite number. */
function numeric(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/** Render an amount/limit as the legacy 8-decimal string form. */
function amountString(value) {
  const number = numeric(value)
  return (number === null ? 0 : number).toFixed(8)
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

/** True when the value is a plain JSON object. */
function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
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
 * Create the identity engine.
 *
 * @param engine - shared {@link import('./core.js').Engine} instance.
 * @returns identity methods backed by `state.identities`, `state.identity_keys`
 *   and the lazily created `state.admission_decisions` collection.
 */
export function createIdentityEngine(engine) {
  const identities = engine.collection('identities')
  const identityKeys = engine.collection('identity_keys')
  const admissionDecisions = engine.collection('admission_decisions')

  /** Resolve an actor from a request body, defaulting to the engine actor. */
  function actorOf(body = {}) {
    const value = body.actor
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : engine.defaultActor()
  }

  /** Resolve an actor DID to its domain, mirroring the Python `_actor_domain` guard. */
  function actorDomain(actor) {
    const value = typeof actor === 'string' && actor.trim() !== '' ? actor.trim() : engine.defaultActor()
    if (value.startsWith('system:')) return { actor: value, domain: null }
    const identity = identities[value]
    if (!identity || identity.status !== 'ACTIVE') {
      fail('ACTOR_NOT_FOUND', 'actor DID is unknown or inactive', { status: 403 })
    }
    return { actor: value, domain: identity.domain_id }
  }

  /** Reject non-system actors that do not own the target DID. */
  function requireIdentityControl(did, actor) {
    const value = typeof actor === 'string' && actor.trim() !== '' ? actor.trim() : engine.defaultActor()
    if (value.startsWith('system:')) return value
    if (value !== did) fail('ACCESS_DENIED', 'actor cannot manage another identity', { status: 403 })
    return value
  }

  /** Return a stored DID record or throw DID_NOT_FOUND. */
  function identityOrThrow(did) {
    const identity = identities[did]
    if (!identity) fail('DID_NOT_FOUND', `DID ${did} is not registered`, { status: 404 })
    return identity
  }

  /** Return a stored DID record, requiring ACTIVE status. */
  function activeIdentityOrThrow(did) {
    const identity = identityOrThrow(did)
    if (identity.status !== 'ACTIVE') {
      fail('DID_INACTIVE', `DID ${did} status is ${identity.status}`, { status: 409 })
    }
    return identity
  }

  /** Return the current active key record of a DID, with a document fallback. */
  function currentKey(did) {
    const history = Array.isArray(identityKeys[did]) ? identityKeys[did] : []
    const active = history.filter((item) => item && item.status === 'ACTIVE')
    if (active.length > 0) return active[active.length - 1]
    const identity = identities[did]
    const method = identity?.document?.verificationMethod?.[0]
    return {
      key_id: method?.id ?? `${did}#key-1`,
      public_key: identity?.public_key ?? method?.publicKeyMultibase ?? '',
      private_key: null,
    }
  }

  /** Return the current public key of a DID. */
  function currentPublicKey(identity) {
    const key = currentKey(identity.did)
    return key.public_key || identity.public_key || identity.document?.verificationMethod?.[0]?.publicKeyMultibase || ''
  }

  /**
   * Normalize registration/rotation key material.
   *
   * When only a private key is supplied the public key is derived from it; when
   * neither is supplied a fresh Ed25519 pair is generated. A mismatched pair is
   * a DID_KEY_MISMATCH, matching the Python registry guard.
   */
  function keyMaterial(publicKey, privateKey) {
    const publicValue = typeof publicKey === 'string' && publicKey.trim() !== '' ? publicKey.trim() : null
    const privateValue = typeof privateKey === 'string' && privateKey.trim() !== '' ? privateKey.trim() : null
    if (privateValue) {
      let derived
      try {
        derived = publicFromPrivate(privateValue)
      } catch {
        fail('KEY_PROVISIONING_FAILED', 'private key material is invalid', { status: 503, retryable: true })
      }
      if (publicValue && publicValue !== derived) {
        fail('DID_KEY_MISMATCH', 'public key does not match the supplied private key', { status: 409 })
      }
      return { publicKey: derived, privateKey: privateValue }
    }
    if (publicValue) return { publicKey: publicValue, privateKey: null }
    const pair = generateKeyPair()
    return { publicKey: pair.publicKey, privateKey: pair.privateKey }
  }

  /** Map a stored identity to the DIDResponse contract. */
  function didResponse(identity) {
    return {
      did: identity.did,
      domain_id: identity.domain_id,
      document: identity.document,
      public_key: currentPublicKey(identity),
      status: identity.status,
      updated_at: identity.updated_at,
    }
  }

  /** Map a stored identity to the DIDRegisterResponse contract. */
  function didRegisterResponse(identity, devPrivateKey) {
    return {
      did: identity.did,
      domain_id: identity.domain_id,
      document: identity.document,
      status: identity.status,
      dev_private_key: DEV_MODE && devPrivateKey ? devPrivateKey : null,
    }
  }

  /** Map a stored key history row to the DIDKeyResponse contract (never exposes private keys). */
  function keyResponse(record) {
    return {
      id: record.id,
      did: record.did,
      key_id: record.key_id,
      public_key: record.public_key,
      status: record.status,
      effective_at: record.effective_at,
      retired_at: record.retired_at ?? null,
      reason: record.reason ?? null,
      evidence_refs: Array.isArray(record.evidence_refs) ? record.evidence_refs : [],
    }
  }

  /** Clamp a list limit to a sane range. */
  function clampLimit(value, fallback = 100) {
    const parsed = numeric(value)
    if (parsed === null) return fallback
    return Math.min(Math.max(Math.trunc(parsed), 1), MAX_LIST_LIMIT)
  }

  /**
   * Register a DID with an initial Ed25519 key pair.
   *
   * A duplicate DID is rejected with DID_ALREADY_EXISTS; replaying the same
   * idempotency key returns the first response.
   */
  function registerDid(payload = {}) {
    if (!plainObject(payload)) fail('VALIDATION_ERROR', 'registration body must be an object', { status: 422 })
    const key = idempotencyKeyOf(payload)
    const body = stripIdempotency(payload)
    return engine.idempotent(key, body, () => {
      const domainId = textField(body.domain_id, 'domain_id', { min: 2, max: 120 })
      const subjectId = textField(body.subject_id, 'subject_id', { min: 2, max: 120 })
      const displayName = textField(body.display_name, 'display_name', { min: 1, max: 200 })
      const jurisdiction = textField(body.jurisdiction, 'jurisdiction', { min: 2, max: 40, fallback: 'CN' })
      const did = createDid(domainId, subjectId)
      if (identities[did]) fail('DID_ALREADY_EXISTS', `DID ${did} is already registered`, { status: 409 })
      const material = keyMaterial(body.public_key, body.private_key)
      const document = didDocument(did, material.publicKey, domainId)
      const now = engine.iso()
      identities[did] = {
        did,
        domain_id: domainId,
        subject_id: subjectId,
        display_name: displayName,
        jurisdiction,
        status: 'ACTIVE',
        document,
        public_key: material.publicKey,
        key_version: 1,
        created_at: now,
        updated_at: now,
      }
      identityKeys[did] = [
        {
          id: engine.id('keyhist'),
          did,
          key_id: `${did}#key-1`,
          public_key: material.publicKey,
          private_key: material.privateKey,
          status: 'ACTIVE',
          effective_at: now,
          retired_at: null,
          reason: 'initial-registration',
          evidence_refs: [sha256Hex(document)],
          created_at: now,
        },
      ]
      engine.audit('did.register', did, 'did', did, { domain_id: domainId, idempotency_key: key })
      engine.save()
      return didRegisterResponse(identities[did], material.privateKey)
    })
  }

  /** Read a DID document by id. */
  function getDid(did) {
    const value = textField(did, 'did', { min: 1, max: 250 })
    return didResponse(identityOrThrow(value))
  }

  /** List DID documents visible to the actor's domain, newest first. */
  function listDids(payload = {}) {
    const body = plainObject(payload) ? payload : {}
    const { domain } = actorDomain(body.actor ?? engine.defaultActor())
    const limit = clampLimit(body.limit)
    return Object.values(identities)
      .filter((identity) => domain === null || identity.domain_id === domain)
      .sort((left, right) => String(right.updated_at).localeCompare(String(left.updated_at)))
      .slice(0, limit)
      .map(didResponse)
  }

  /** Rotate the signing key of an ACTIVE DID and retire the previous key. */
  function rotateDid(did, payload = {}, explicitKey = undefined) {
    const target = textField(did, 'did', { min: 1, max: 250 })
    const body = plainObject(payload) ? payload : {}
    const actor = requireIdentityControl(target, actorOf(body))
    const key = idempotencyKeyOf(body, explicitKey)
    const requestBody = { did: target, actor, ...stripIdempotency(body) }
    return engine.idempotent(key, requestBody, () => {
      const reason = textField(body.reason, 'reason', { min: 3, max: 1000 })
      const identity = activeIdentityOrThrow(target)
      const now = engine.iso()
      const version = (numeric(identity.key_version) ?? 1) + 1
      const material = keyMaterial(body.public_key, body.private_key)
      const document = plainObject(identity.document) ? { ...identity.document } : {}
      const methods = Array.isArray(document.verificationMethod) ? document.verificationMethod : []
      const oldKeyId = methods[0]?.id || `${target}#key-${identity.key_version ?? 1}`
      const newKeyId = `${target}#key-${version}`
      const retiredEvidence = [sha256Hex({ did: target, old_key_id: oldKeyId, rotated_at: now })]
      const history = Array.isArray(identityKeys[target]) ? identityKeys[target] : (identityKeys[target] = [])
      let retired = history.find((record) => record && record.key_id === oldKeyId && record.status === 'ACTIVE')
      if (!retired) retired = history.find((record) => record && record.key_id === oldKeyId)
      if (!retired) {
        retired = {
          id: engine.id('keyhist'),
          did: target,
          key_id: oldKeyId,
          public_key: identity.public_key ?? currentKey(target).public_key,
          private_key: null,
          effective_at: identity.created_at,
          created_at: identity.created_at,
        }
        history.push(retired)
      }
      retired.status = 'RETIRED'
      retired.retired_at = now
      retired.reason = reason
      retired.evidence_refs = retiredEvidence
      history.push({
        id: engine.id('keyhist'),
        did: target,
        key_id: newKeyId,
        public_key: material.publicKey,
        private_key: material.privateKey,
        status: 'ACTIVE',
        effective_at: now,
        retired_at: null,
        reason,
        evidence_refs: retiredEvidence,
        created_at: now,
      })
      document.verificationMethod = [
        {
          id: newKeyId,
          type: 'Ed25519VerificationKey2020',
          controller: target,
          publicKeyMultibase: material.publicKey,
        },
      ]
      document.authentication = [newKeyId]
      document.assertionMethod = [newKeyId]
      document.updated_at = now
      identity.document = document
      identity.public_key = material.publicKey
      identity.key_version = version
      identity.updated_at = now
      engine.audit('did.rotate', target, 'did', target, { key_version: version, reason, idempotency_key: key })
      engine.save()
      return didRegisterResponse(identity, material.privateKey)
    })
  }

  /** Change the lifecycle status of a DID, enforcing the Python transition table. */
  function setDidStatus(did, payload = {}, explicitKey = undefined) {
    const target = textField(did, 'did', { min: 1, max: 250 })
    const body = plainObject(payload) ? payload : {}
    const actor = requireIdentityControl(target, actorOf(body))
    const key = idempotencyKeyOf(body, explicitKey)
    const requestBody = { did: target, actor, ...stripIdempotency(body) }
    return engine.idempotent(key, requestBody, () => {
      const status = textField(body.status, 'status', { min: 1, max: 40 }).toUpperCase()
      if (!DID_STATUSES.includes(status)) {
        fail('VALIDATION_ERROR', `status must be one of ${DID_STATUSES.join(', ')}`, { status: 422 })
      }
      const reason = textField(body.reason, 'reason', { min: 3, max: 1000 })
      const identity = identityOrThrow(target)
      const allowed = DID_TRANSITIONS[identity.status] ?? []
      if (!allowed.includes(status)) {
        fail('DID_STATUS_TRANSITION_INVALID', `DID cannot move from ${identity.status} to ${status}`, { status: 409 })
      }
      identity.status = status
      identity.updated_at = engine.iso()
      engine.audit('did.status', target, 'did', target, { status, reason, idempotency_key: key })
      engine.save()
      return didResponse(identity)
    })
  }

  /** List the key history of a DID, oldest first. */
  function listDidKeys(did) {
    const target = textField(did, 'did', { min: 1, max: 250 })
    identityOrThrow(target)
    const history = Array.isArray(identityKeys[target]) ? identityKeys[target] : []
    return [...history]
      .sort((left, right) => String(left.effective_at).localeCompare(String(right.effective_at)))
      .map(keyResponse)
  }

  /**
   * Evaluate an admission request.
   *
   * Unknown DIDs yield an explicit UNKNOWN decision (never ALLOW) so callers can
   * still see the evidence; inactive DIDs raise DID_INACTIVE like the Python
   * registry. Limits always come from the engine policy.
   */
  function admit(payload = {}) {
    if (!plainObject(payload)) fail('VALIDATION_ERROR', 'admission body must be an object', { status: 422 })
    const key = idempotencyKeyOf(payload)
    const body = stripIdempotency(payload)
    return engine.idempotent(key, body, () => {
      const did = textField(body.did, 'did', { min: 1, max: 250 })
      const actor = actorOf(body)
      const policyVersion = textField(body.policy_version, 'policy_version', { min: 1, max: 120, fallback: engine.policy.policyVersion })
      const requested = Array.isArray(body.required_actions)
        ? [...new Set(body.required_actions.map((action) => String(action).trim().toUpperCase()).filter((action) => action !== ''))]
        : []
      const jurisdiction = typeof body.jurisdiction === 'string' && body.jurisdiction.trim() !== '' ? body.jurisdiction.trim().toUpperCase() : null
      const identity = identities[did]
      const now = new Date()
      const limits = {
        single_amount: amountString(engine.policy.singleAmountLimit),
        daily_amount: amountString(engine.policy.dailyAmountLimit),
      }
      const zeroLimits = { single_amount: amountString(0), daily_amount: amountString(0) }
      let decision = { status: 'UNKNOWN', trust_score: 0, allowed_actions: [] }

      if (!identity) {
        decision = { status: 'UNKNOWN', trust_score: 0, allowed_actions: [], domain_id: '' }
      } else {
        if (!actor.startsWith('system:')) requireIdentityControl(identity.did, actor)
        if (identity.status !== 'ACTIVE') {
          fail('DID_INACTIVE', `DID ${did} status is ${identity.status}`, { status: 409 })
        }
        const credentials = Object.values(engine.collection('credentials')).filter((item) => item && item.subject_did === did)
        const active = credentials.filter((item) => {
          if (item.status !== 'ACTIVE') return false
          const from = parseIso(item.valid_from)
          const to = parseIso(item.valid_to)
          return from !== null && to !== null && from.getTime() <= now.getTime() && now.getTime() <= to.getTime()
        })
        const evidenceRefs = active.map((item) => sha256Hex({ credential_id: item.id, status: item.status }))
        const hasRegistration = active.some((item) => item.credential_type === 'AgentRegistrationCredential')
        const capabilities = new Set()
        for (const item of active) {
          const values = Array.isArray(item.claims?.capabilities) ? item.claims.capabilities : []
          for (const capability of values) capabilities.add(String(capability).toUpperCase())
        }
        const allowed = requested.length > 0 ? [...requested].sort() : [...DEFAULT_ALLOWED_ACTIONS]
        if (!hasRegistration) {
          decision = {
            status: credentials.length > 0 ? 'DEFER' : 'UNKNOWN',
            trust_score: credentials.length > 0 ? 0.35 : 0,
            allowed_actions: [],
            evidence_refs: evidenceRefs,
          }
        } else if (requested.length > 0 && !requested.every((action) => capabilities.has(action))) {
          decision = { status: 'BLOCK', trust_score: 0.1, allowed_actions: [], evidence_refs: evidenceRefs }
        } else if (jurisdiction && !active.some((item) => {
          const value = item.claims?.jurisdiction
          return value === jurisdiction || value === 'GLOBAL'
        })) {
          decision = { status: 'BLOCK', trust_score: 0.1, allowed_actions: [], evidence_refs: evidenceRefs }
        } else {
          decision = {
            status: 'ALLOW',
            trust_score: numeric(engine.policy.defaultTrustScore) ?? 0.95,
            allowed_actions: allowed,
            evidence_refs: evidenceRefs,
          }
        }
      }
      const record = {
        id: engine.id('admit'),
        did,
        domain_id: decision.domain_id ?? identity.domain_id,
        status: decision.status,
        trust_score: decision.trust_score,
        allowed_actions: decision.allowed_actions,
        limits: decision.allowed_actions.length > 0 ? limits : zeroLimits,
        evidence_refs: decision.evidence_refs ?? [],
        policy_version: policyVersion,
        created_at: engine.iso(),
      }
      admissionDecisions[record.id] = record
      engine.audit('admission.evaluate', actor, 'admission', record.id, { status: record.status, idempotency_key: key })
      engine.save()
      return record
    })
  }

  return {
    registerDid,
    getDid,
    listDids,
    rotateDid,
    setDidStatus,
    listDidKeys,
    admit,
  }
}
