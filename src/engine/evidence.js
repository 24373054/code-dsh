/**
 * Raw evidence records and local ledger anchors.
 *
 * Evidence is the immutable "this bytes blob existed" record: a content hash
 * (SHA-256 by default, SM3 when supplied), a source reference and optional
 * metadata. Anchors are the dev stand-in for a chain anchor: the old control
 * plane could submit to ChainMaker, the embedded engine confirms locally.
 */
import { clone, fail, sm3Hex, sha256Hex } from './core.js'

function assertText(value, field, min, max, options = {}) {
  const { required = true } = options
  if (value === undefined || value === null) {
    if (!required) return undefined
    fail('VALIDATION_ERROR', `${field} is required`, { status: 422 })
  }
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    fail('VALIDATION_ERROR', `${field} must be a string of ${min}-${max} characters`, { status: 422 })
  }
  return value
}

function assertObject(value, field) {
  if (value === undefined || value === null) return {}
  if (typeof value !== 'object' || Array.isArray(value)) {
    fail('VALIDATION_ERROR', `${field} must be an object`, { status: 422 })
  }
  return value
}

function requireIdempotency(options) {
  if (!options.idempotencyKey) {
    fail('IDEMPOTENCY_KEY_REQUIRED', 'write calls require an idempotency key', { status: 400 })
  }
  return options.idempotencyKey
}

function actorOf(engine, options) {
  return options.actor || engine.defaultActor()
}

function actorDomain(engine, actor) {
  if (!actor || actor.startsWith('system:')) return null
  const [type, namespace, domain] = String(actor).split(':')
  if (type !== 'did' || namespace !== 'trust' || !domain) {
    fail('ACTOR_NOT_FOUND', `actor ${actor} is not a known DID`, { status: 403 })
  }
  return domain
}

function evidenceResponse(record) {
  return {
    id: record.id,
    evidence_type: record.evidence_type,
    source_ref: record.source_ref,
    content_hash: record.content_hash,
    status: record.status,
    details: clone(record.details),
    created_at: record.created_at,
  }
}

function anchorResponse(record) {
  return clone({
    id: record.id,
    evidence_id: record.evidence_id,
    chain_id: record.chain_id,
    tx_id: record.tx_id,
    anchor_hash: record.anchor_hash,
    sha256_hash: record.sha256_hash,
    sm3_hash: record.sm3_hash,
    source_ref: record.source_ref,
    captured_at: record.captured_at,
    status: record.status,
    attempts: record.attempts,
    last_error: record.last_error,
    created_at: record.created_at,
  })
}

export function createEvidenceEngine(engine) {
  function evidenceCollection() {
    return engine.collection('evidence')
  }

  function anchorCollection() {
    return engine.collection('anchors')
  }

  function findEvidence(evidenceId) {
    return evidenceId ? evidenceCollection()[evidenceId] || null : null
  }

  /**
   * `create({content, ...})` derives the SHA-256 and SM3 digests from the
   * supplied bytes. A caller-supplied hash is accepted only when it matches.
   */
  function create(payload = {}, options = {}) {
    const idempotencyKey = requireIdempotency(options)
    const actor = actorOf(engine, options)
    const sourceType = assertText(payload.source_type, 'source_type', 2, 80)
    const sourceRef = assertText(payload.source_ref, 'source_ref', 2, 250)
    const metadata = assertObject(payload.metadata, 'metadata')
    const content = payload.content
    if (content !== undefined && content !== null && (typeof content !== 'string' || content.length > 10_000_000)) {
      fail('VALIDATION_ERROR', 'content must be a string of at most 10000000 characters', { status: 422 })
    }
    const contentHash = content === undefined || content === null ? assertText(payload.content_hash, 'content_hash', 16, 128) : contentHashFor(content, payload.content_hash)
    const sm3Hash = content === undefined || content === null ? optionalHash(payload.sm3_hash, 'sm3_hash') : sm3HashFor(content, payload.sm3_hash)
    if (payload.case_id) engine.require('cases', payload.case_id, 'CASE_NOT_FOUND', 'case not found')
    const ownerDomain = actorDomain(engine, actor)

    return engine.idempotent(`evidence.ingest:${idempotencyKey}`, payload, () => {
      const existing = Object.values(evidenceCollection()).find((item) => item.source_ref === sourceRef)
      if (existing) {
        if (existing.content_hash !== contentHash) {
          fail('EVIDENCE_CONTENT_CONFLICT', 'the same source_ref was registered with a different content hash', { status: 409 })
        }
        return evidenceResponse(existing)
      }
      const record = {
        id: engine.id('evidence'),
        evidence_type: sourceType,
        source_ref: sourceRef,
        content_hash: contentHash,
        sm3_hash: sm3Hash,
        status: 'REGISTERED',
        details: {
          case_id: payload.case_id || null,
          storage_uri: payload.storage_uri || null,
          sm3_hash: sm3Hash,
          metadata,
        },
        owner_domain_id: ownerDomain,
        created_at: engine.iso(),
      }
      evidenceCollection()[record.id] = record
      engine.audit('evidence.ingest', actor, 'evidence', record.id, { source_type: sourceType, content_hash: contentHash })
      engine.save()
      return evidenceResponse(record)
    })
  }

  function contentHashFor(content, supplied) {
    const calculated = sha256Hex(Buffer.from(content, 'utf8'))
    if (supplied !== undefined && supplied !== null) {
      assertText(supplied, 'content_hash', 16, 128)
      if (supplied !== calculated) fail('CONTENT_HASH_MISMATCH', 'content does not match content_hash', { status: 422 })
    }
    return calculated
  }

  function sm3HashFor(content, supplied) {
    const calculated = sm3Hex(Buffer.from(content, 'utf8'))
    if (supplied !== undefined && supplied !== null) {
      optionalHash(supplied, 'sm3_hash')
      if (supplied !== calculated) fail('CONTENT_SM3_MISMATCH', 'content does not match sm3_hash', { status: 422 })
    }
    return calculated
  }

  function optionalHash(value, field) {
    if (value === undefined || value === null || value === '') return null
    assertText(value, field, 16, 128)
    return value
  }

  function get(evidenceId, options = {}) {
    const actor = actorOf(engine, options)
    const record = findEvidence(evidenceId)
    if (!record) fail('EVIDENCE_NOT_FOUND', 'evidence not found', { status: 404 })
    const domain = actorDomain(engine, actor)
    if (domain !== null && record.owner_domain_id !== null && record.owner_domain_id !== domain) {
      fail('EVIDENCE_ACCESS_DENIED', 'the actor may not access this evidence', { status: 403 })
    }
    return evidenceResponse(record)
  }

  /**
   * Anchoring is deterministic in the embedded engine: the anchor hash binds
   * the evidence hash pair, the chain is `local-chain` and the transaction id
   * is derived from the anchor hash. Re-anchoring returns the same anchor.
   */
  function anchor(evidenceId, options = {}) {
    const idempotencyKey = requireIdempotency(options)
    const actor = actorOf(engine, options)
    const record = findEvidence(evidenceId)
    if (!record) fail('EVIDENCE_NOT_FOUND', 'evidence not found', { status: 404 })
    get(evidenceId, { actor })
    const anchorHash = sha256Hex({ evidence_id: evidenceId, sha256: record.content_hash, sm3: record.sm3_hash })

    return engine.idempotent(`evidence.anchor:${idempotencyKey}`, { evidence_id: evidenceId }, () => {
      const existing = Object.values(anchorCollection()).find((item) => item.anchor_hash === anchorHash)
      if (existing) return anchorResponse(existing)
      const anchorRecord = {
        id: engine.id('anchor'),
        evidence_id: evidenceId,
        chain_id: 'local-chain',
        tx_id: `local:${anchorHash.slice(0, 32)}`,
        anchor_hash: anchorHash,
        sha256_hash: record.content_hash,
        sm3_hash: record.sm3_hash,
        source_ref: record.source_ref,
        captured_at: record.created_at,
        status: 'CONFIRMED',
        attempts: 0,
        last_error: null,
        created_at: engine.iso(),
      }
      anchorCollection()[anchorRecord.id] = anchorRecord
      engine.audit('evidence.anchor', actor, 'ledger_anchor', anchorRecord.id, {
        evidence_id: evidenceId,
        status: anchorRecord.status,
      })
      engine.save()
      return anchorResponse(anchorRecord)
    })
  }

  function anchors(evidenceId, options = {}) {
    const actor = actorOf(engine, options)
    if (!findEvidence(evidenceId)) fail('EVIDENCE_NOT_FOUND', 'evidence not found', { status: 404 })
    get(evidenceId, { actor })
    return Object.values(anchorCollection())
      .filter((item) => item.evidence_id === evidenceId)
      .sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)))
      .map(anchorResponse)
  }

  return { create, get, anchor, anchors }
}
