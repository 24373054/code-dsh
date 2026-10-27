/**
 * Knowledge documents: ingested evidence-backed policy text, chunked for
 * lexical retrieval. Documents are draft until published; search only ever
 * returns published chunks and never exposes restricted material to actors
 * outside the owning domain (system actors see PUBLIC documents only).
 */
import { clone, fail, sha256Hex } from './core.js'

const ACCESS_LEVELS = new Set(['PUBLIC', 'INTERNAL', 'RESTRICTED'])
const CHUNK_SIZE = 500

function assertText(value, field, min, max) {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    fail('VALIDATION_ERROR', `${field} must be a string of ${min}-${max} characters`, { status: 422 })
  }
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

function toMillis(value) {
  if (value === undefined || value === null || value === '') return null
  if (value instanceof Date) {
    const time = value.getTime()
    return Number.isFinite(time) ? time : null
  }
  const text = String(value)
  const normalised = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(text) ? `${text}Z` : text
  const time = Date.parse(normalised)
  return Number.isFinite(time) ? time : null
}

function assertTime(value, field) {
  if (value === undefined || value === null || value === '') return null
  const time = toMillis(value)
  if (time === null) fail('VALIDATION_ERROR', `${field} must be an ISO-8601 timestamp`, { status: 422 })
  return time
}

function timeIso(engine, value) {
  return value === null ? null : engine.iso(new Date(value))
}

/** Paragraph-aware chunking: never a chunk over CHUNK_SIZE characters. */
function chunkContent(content) {
  const chunks = []
  const paragraphBreak = /\n\s*\n/g
  let index = 0
  while (index < content.length) {
    while (index < content.length && /\s/.test(content[index])) index += 1
    if (index >= content.length) break
    const start = index
    paragraphBreak.lastIndex = index
    const match = paragraphBreak.exec(content)
    let end = match ? match.index : content.length
    while (end > start && /\s/.test(content[end - 1])) end -= 1
    const paragraph = content.slice(start, end)
    if (paragraph.length > 0) {
      for (let cursor = 0; cursor < paragraph.length; cursor += CHUNK_SIZE) {
        chunks.push({ text: paragraph.slice(cursor, cursor + CHUNK_SIZE), source_offset: start + cursor })
      }
    }
    index = match ? paragraphBreak.lastIndex : content.length
  }
  if (chunks.length === 0) chunks.push({ text: content.slice(0, CHUNK_SIZE), source_offset: 0 })
  return chunks
}

export function createKnowledgeEngine(engine) {
  function documentCollection() {
    return engine.collection('knowledge')
  }

  function chunkCollection() {
    return engine.collection('knowledge_chunks')
  }

  function chunksOf(documentId) {
    return Object.values(chunkCollection())
      .filter((chunk) => chunk.document_id === documentId)
      .sort((left, right) => left.chunk_index - right.chunk_index)
  }

  function chunkResponse(chunk) {
    return clone({
      id: chunk.id,
      document_id: chunk.document_id,
      chunk_index: chunk.chunk_index,
      text: chunk.text,
      source_offset: chunk.source_offset,
      review_status: chunk.review_status,
      embedding_status: chunk.embedding_status,
      metadata: chunk.metadata,
    })
  }

  function documentResponse(document) {
    return clone({
      id: document.id,
      evidence_id: document.evidence_id,
      owner_domain_id: document.owner_domain_id,
      title: document.title,
      content_hash: document.content_hash,
      jurisdiction: document.jurisdiction,
      effective_from: document.effective_from,
      effective_to: document.effective_to,
      access_level: document.access_level,
      review_status: document.review_status,
      metadata: document.metadata,
      chunks: chunksOf(document.id).map(chunkResponse),
    })
  }

  function requireDocumentAccess(document, actor) {
    const domain = actorDomain(engine, actor)
    if (domain === null) {
      if (document.access_level !== 'PUBLIC') {
        fail('ACCESS_DENIED', 'the actor may not access this knowledge document', { status: 403 })
      }
      return
    }
    if (document.access_level !== 'PUBLIC' && document.owner_domain_id !== null && document.owner_domain_id !== domain) {
      fail('ACCESS_DENIED', 'the actor may not access this knowledge document', { status: 403 })
    }
  }

  function ingest(payload = {}, options = {}) {
    const idempotencyKey = requireIdempotency(options)
    const actor = actorOf(engine, options)
    assertText(payload.title, 'title', 2, 300)
    assertText(payload.content, 'content', 1, 2_000_000)
    const jurisdiction = payload.jurisdiction === undefined ? 'GLOBAL' : payload.jurisdiction
    assertText(jurisdiction, 'jurisdiction', 2, 40)
    const accessLevel = payload.access_level === undefined ? 'INTERNAL' : payload.access_level
    if (!ACCESS_LEVELS.has(accessLevel)) {
      fail('VALIDATION_ERROR', 'access_level must be one of PUBLIC, INTERNAL, RESTRICTED', { status: 422 })
    }
    const effectiveFrom = assertTime(payload.effective_from, 'effective_from')
    const effectiveTo = assertTime(payload.effective_to, 'effective_to')
    if (effectiveFrom !== null && effectiveTo !== null && effectiveFrom > effectiveTo) {
      fail('KNOWLEDGE_WINDOW_INVALID', 'effective_from must not be after effective_to', { status: 422 })
    }
    const contentHash = sha256Hex(Buffer.from(payload.content, 'utf8'))
    if (payload.content_hash !== undefined && payload.content_hash !== null) {
      assertText(payload.content_hash, 'content_hash', 16, 128)
      if (payload.content_hash !== contentHash) {
        fail('CONTENT_HASH_MISMATCH', 'content does not match content_hash', { status: 422 })
      }
    }
    if (payload.evidence_id) engine.require('evidence', payload.evidence_id, 'EVIDENCE_NOT_FOUND', 'evidence not found')
    const metadata = assertObject(payload.metadata, 'metadata')
    const ownerDomain = actorDomain(engine, actor)
    const documentId = `knowledge_${sha256Hex({ content_hash: contentHash, title: payload.title }).slice(0, 32)}`

    return engine.idempotent(`knowledge.ingest:${idempotencyKey}`, payload, () => {
      const existing = documentCollection()[documentId]
      if (existing) return documentResponse(existing)
      const document = {
        id: documentId,
        evidence_id: payload.evidence_id || null,
        owner_domain_id: ownerDomain,
        title: payload.title,
        content_hash: contentHash,
        jurisdiction,
        effective_from: timeIso(engine, effectiveFrom),
        effective_to: timeIso(engine, effectiveTo),
        access_level: accessLevel,
        review_status: 'DRAFT',
        metadata,
        created_at: engine.iso(),
      }
      documentCollection()[document.id] = document
      for (const [chunkIndex, piece] of chunkContent(payload.content).entries()) {
        const chunkId = `chunk_${sha256Hex({ document_id: document.id, chunk_index: chunkIndex }).slice(0, 32)}`
        chunkCollection()[chunkId] = {
          id: chunkId,
          document_id: document.id,
          chunk_index: chunkIndex,
          text: piece.text,
          source_offset: piece.source_offset,
          review_status: 'DRAFT',
          embedding_status: 'NOT_CONFIGURED',
          metadata: { title: document.title, jurisdiction: document.jurisdiction, source_evidence_id: document.evidence_id },
          created_at: engine.iso(),
        }
      }
      engine.audit('knowledge.ingest', actor, 'knowledge_document', document.id, {
        title: document.title,
        access_level: document.access_level,
        chunks: chunksOf(document.id).length,
      })
      engine.save()
      return documentResponse(document)
    })
  }

  function publish(documentId, options = {}) {
    const idempotencyKey = requireIdempotency(options)
    const actor = actorOf(engine, options)
    return engine.idempotent(`knowledge.publish:${idempotencyKey}`, { document_id: documentId }, () => {
      const document = documentCollection()[documentId]
      if (!document) fail('KNOWLEDGE_DOCUMENT_NOT_FOUND', 'knowledge document not found', { status: 404 })
      const domain = actorDomain(engine, actor)
      if (domain !== null && document.owner_domain_id !== null && document.owner_domain_id !== domain) {
        fail('ACCESS_DENIED', 'the actor may not publish this knowledge document', { status: 403 })
      }
      document.review_status = 'PUBLISHED'
      document.metadata = {
        ...(document.metadata || {}),
        published_by: actor,
        review_note: options.review_note || '',
        published_at: engine.iso(),
      }
      for (const chunk of chunksOf(documentId)) chunk.review_status = 'PUBLISHED'
      engine.audit('knowledge.publish', actor, 'knowledge_document', documentId, { title: document.title })
      engine.save()
      return documentResponse(document)
    })
  }

  function get(documentId, options = {}) {
    const document = documentCollection()[documentId]
    if (!document) fail('KNOWLEDGE_DOCUMENT_NOT_FOUND', 'knowledge document not found', { status: 404 })
    requireDocumentAccess(document, actorOf(engine, options))
    return documentResponse(document)
  }

  function search(payload = {}, options = {}) {
    const actor = actorOf(engine, options)
    const query = typeof payload.query === 'string' ? payload.query.trim() : ''
    if (!query) return { query: '', results: [] }
    const limit = Math.min(Math.max(Number(payload.limit) || 5, 1), 20)
    const effectiveAt = assertTime(payload.effective_at, 'effective_at')
    const at = effectiveAt === null ? Date.now() : effectiveAt
    const domain = actorDomain(engine, actor)
    const needle = query.toLowerCase()
    const results = []
    for (const document of Object.values(documentCollection())) {
      if (document.review_status !== 'PUBLISHED') continue
      if (payload.jurisdiction && document.jurisdiction !== payload.jurisdiction) continue
      const from = toMillis(document.effective_from)
      const to = toMillis(document.effective_to)
      if (from !== null && at < from) continue
      if (to !== null && at > to) continue
      if (document.access_level !== 'PUBLIC') {
        if (domain === null) continue
        if (document.owner_domain_id !== null && document.owner_domain_id !== domain) continue
      }
      for (const chunk of chunksOf(document.id)) {
        if (chunk.review_status !== 'PUBLISHED') continue
        const score = countOccurrences(chunk.text.toLowerCase(), needle)
        if (score === 0) continue
        results.push({
          chunk,
          document,
          score,
          response: {
            ...chunkResponse(chunk),
            metadata: {
              ...(chunk.metadata || {}),
              document_id: document.id,
              evidence_id: document.evidence_id,
              access_level: document.access_level,
              retrieval_mode: 'lexical',
              match_score: score,
            },
          },
        })
      }
    }
    results.sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      const created = String(right.document.created_at).localeCompare(String(left.document.created_at))
      if (created !== 0) return created
      return left.chunk.chunk_index - right.chunk.chunk_index
    })
    return { query, results: results.slice(0, limit).map((item) => item.response) }
  }

  function countOccurrences(haystack, needle) {
    let count = 0
    let index = haystack.indexOf(needle)
    while (index !== -1) {
      count += 1
      index = haystack.indexOf(needle, index + needle.length)
    }
    return count
  }

  return { ingest, publish, get, search }
}
