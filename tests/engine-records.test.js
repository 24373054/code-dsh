import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { Engine, MemoryStore, FileStore, POLICY_VERSION, sha256Hex, sm3Hex } from '../src/engine/core.js'
import { createEvidenceEngine } from '../src/engine/evidence.js'
import { createCaseEngine } from '../src/engine/cases.js'
import { createKnowledgeEngine } from '../src/engine/knowledge.js'
import { createGovernanceEngine } from '../src/engine/governance.js'
import { createAssistantEngine } from '../src/engine/assistant.js'
import { createDashboardEngine } from '../src/engine/dashboard.js'

function createHarness(options = {}) {
  const engine = new Engine({
    settings: { actorDid: 'system:dsh-web', ...(options.settings || {}) },
    store: options.store || new MemoryStore(),
    logger: null,
  })
  return {
    engine,
    evidence: createEvidenceEngine(engine),
    cases: createCaseEngine(engine),
    knowledge: createKnowledgeEngine(engine),
    governance: createGovernanceEngine(engine),
    assistant: createAssistantEngine(engine),
    dashboard: createDashboardEngine(engine),
  }
}

function makeTask(engine, overrides = {}) {
  const seq = engine.nextSeq('test_task')
  const id = overrides.id || `task_${String(seq).padStart(4, '0')}`
  const record = {
    id,
    domain_id: 'demo',
    requester_did: 'did:trust:demo:agent',
    asset_id: 'USDC',
    amount: 100,
    beneficiary: 'acct-alice',
    status: 'CREATED',
    policy_version: POLICY_VERSION,
    metadata: {},
    created_at: engine.iso(),
    updated_at: engine.iso(),
    ...overrides,
  }
  engine.collection('tasks')[id] = record
  return record
}

function makeEvent(engine, task, overrides = {}) {
  const seq = engine.nextSeq('test_event')
  const id = overrides.id || `event_${String(seq).padStart(4, '0')}`
  const record = {
    id,
    task_id: task.id,
    event_type: 'PAYREQ',
    actor_did: task.requester_did,
    payload: { beneficiary: task.beneficiary, amount: task.amount },
    source_ref: `src-${id}`,
    finality: 'OBSERVED',
    observed_at: new Date(Date.UTC(2026, 0, 1, 0, 0, seq)).toISOString(),
    created_at: engine.iso(),
    ...overrides,
  }
  engine.collection('events')[id] = record
  return record
}

function makeCase(engine, task, overrides = {}) {
  const seq = engine.nextSeq('test_case')
  const record = {
    id: overrides.id || `case_${String(seq).padStart(4, '0')}`,
    task_id: task.id,
    status: 'OPEN',
    scope: { task_id: task.id, asset_id: task.asset_id },
    policy_version: POLICY_VERSION,
    model_version: 'trace-rules-2026-10-25-001',
    created_at: engine.iso(),
    ...overrides,
  }
  engine.collection('cases')[record.id] = record
  return record
}

function throwsCode(fn, code, status) {
  assert.throws(fn, (error) => {
    assert.equal(error.name, 'ServiceError')
    assert.equal(error.code, code)
    if (status !== undefined) assert.equal(error.status, status)
    return true
  })
}

/* ------------------------------------------------------------------ */
/* evidence                                                            */
/* ------------------------------------------------------------------ */

test('evidence.create derives hashes from content and get returns the record', () => {
  const { engine, evidence } = createHarness()
  const created = evidence.create(
    { source_type: 'invoice', source_ref: 'invoice-001', content: 'invoice-001-bytes' },
    { idempotencyKey: 'ev-1' },
  )
  assert.equal(created.evidence_type, 'invoice')
  assert.equal(created.status, 'REGISTERED')
  assert.equal(created.content_hash, sha256Hex(Buffer.from('invoice-001-bytes')))
  assert.equal(created.details.sm3_hash, sm3Hex(Buffer.from('invoice-001-bytes')))
  assert.match(created.id, /^evidence_/)
  assert.equal(Object.keys(engine.state.evidence).length, 1)
  assert.deepEqual(evidence.get(created.id), created)
})

test('evidence.create rejects a mismatching content hash', () => {
  const { evidence } = createHarness()
  throwsCode(
    () => evidence.create({ source_type: 'invoice', source_ref: 'ref-1', content: 'abc', content_hash: 'f'.repeat(64) }, { idempotencyKey: 'ev-1' }),
    'CONTENT_HASH_MISMATCH',
    422,
  )
  throwsCode(
    () => evidence.create({ source_type: 'invoice', source_ref: 'ref-1', content: 'abc', sm3_hash: 'f'.repeat(64) }, { idempotencyKey: 'ev-1' }),
    'CONTENT_SM3_MISMATCH',
    422,
  )
})

test('evidence.create validates required fields and case existence', () => {
  const { engine, evidence } = createHarness()
  throwsCode(() => evidence.create({ source_type: 'x', source_ref: 'ref-1', content: 'abc' }, { idempotencyKey: 'ev-1' }), 'VALIDATION_ERROR', 422)
  throwsCode(
    () => evidence.create({ source_type: 'invoice', source_ref: 'ref-1' }, { idempotencyKey: 'ev-1' }),
    'VALIDATION_ERROR',
    422,
  )
  throwsCode(
    () => evidence.create({ source_type: 'invoice', source_ref: 'ref-1', content: 'abc', case_id: 'case_missing' }, { idempotencyKey: 'ev-1' }),
    'CASE_NOT_FOUND',
    404,
  )
  assert.equal(Object.keys(engine.state.evidence).length, 0)
})

test('evidence.create requires an idempotency key and replays it', () => {
  const { evidence } = createHarness()
  throwsCode(() => evidence.create({ source_type: 'invoice', source_ref: 'ref-1', content: 'abc' }, {}), 'IDEMPOTENCY_KEY_REQUIRED', 400)
  const first = evidence.create({ source_type: 'invoice', source_ref: 'ref-1', content: 'abc' }, { idempotencyKey: 'ev-1' })
  const replay = evidence.create({ source_type: 'invoice', source_ref: 'ref-1', content: 'abc' }, { idempotencyKey: 'ev-1' })
  assert.equal(replay.id, first.id)
  throwsCode(
    () => evidence.create({ source_type: 'invoice', source_ref: 'ref-2', content: 'abc' }, { idempotencyKey: 'ev-1' }),
    'IDEMPOTENCY_CONFLICT',
    409,
  )
})

test('evidence.create is idempotent by source_ref and conflicts on different content', () => {
  const { evidence } = createHarness()
  const first = evidence.create({ source_type: 'invoice', source_ref: 'same-ref', content: 'abc' }, { idempotencyKey: 'ev-1' })
  const second = evidence.create({ source_type: 'invoice', source_ref: 'same-ref', content: 'abc' }, { idempotencyKey: 'ev-2' })
  assert.equal(second.id, first.id)
  throwsCode(
    () => evidence.create({ source_type: 'invoice', source_ref: 'same-ref', content: 'different' }, { idempotencyKey: 'ev-3' }),
    'EVIDENCE_CONTENT_CONFLICT',
    409,
  )
})

test('evidence.get enforces owner-domain access and unknown ids 404', () => {
  const { evidence } = createHarness()
  const created = evidence.create(
    { source_type: 'invoice', source_ref: 'ref-1', content: 'abc' },
    { idempotencyKey: 'ev-1', actor: 'did:trust:demo:agent' },
  )
  assert.equal(evidence.get(created.id, { actor: 'did:trust:demo:agent' }).id, created.id)
  throwsCode(() => evidence.get(created.id, { actor: 'did:trust:other:user' }), 'EVIDENCE_ACCESS_DENIED', 403)
  assert.equal(evidence.get(created.id).id, created.id)
  throwsCode(() => evidence.get('evidence_missing'), 'EVIDENCE_NOT_FOUND', 404)
})

test('evidence.anchor is deterministic, confirmed and deduplicated', () => {
  const { evidence } = createHarness()
  const created = evidence.create({ source_type: 'invoice', source_ref: 'ref-1', content: 'abc' }, { idempotencyKey: 'ev-1' })
  const anchor = evidence.anchor(created.id, { idempotencyKey: 'anchor-1' })
  assert.equal(anchor.status, 'CONFIRMED')
  assert.equal(anchor.chain_id, 'local-chain')
  assert.match(anchor.tx_id, /^local:[0-9a-f]{32}$/)
  assert.equal(anchor.anchor_hash, sha256Hex({ evidence_id: created.id, sha256: created.content_hash, sm3: created.details.sm3_hash }))
  assert.equal(anchor.attempts, 0)
  const replay = evidence.anchor(created.id, { idempotencyKey: 'anchor-1' })
  assert.equal(replay.id, anchor.id)
  const second = evidence.anchor(created.id, { idempotencyKey: 'anchor-2' })
  assert.equal(second.id, anchor.id)
  assert.equal(evidence.anchors(created.id).length, 1)
  throwsCode(() => evidence.anchor('evidence_missing', { idempotencyKey: 'anchor-3' }), 'EVIDENCE_NOT_FOUND', 404)
})

/* ------------------------------------------------------------------ */
/* cases, snapshots, reports                                           */
/* ------------------------------------------------------------------ */

test('cases.trace requires an existing task', () => {
  const { cases } = createHarness()
  throwsCode(() => cases.trace('task_missing'), 'TASK_NOT_FOUND', 404)
})

test('cases.trace snapshots the event graph with 0.5 coverage until finality', () => {
  const { engine, cases } = createHarness()
  const task = makeTask(engine)
  const first = makeEvent(engine, task)
  const second = makeEvent(engine, task, { event_type: 'RESULT' })
  const result = cases.trace(task.id, { created_by: 'system:dsh-web' })
  assert.match(result.case.id, /^case_/)
  assert.equal(result.case.status, 'OPEN')
  assert.equal(result.case.task_id, task.id)
  assert.equal(result.snapshot.coverage, 0.5)
  assert.deepEqual(result.snapshot.residuals, [{ asset_id: 'USDC', reason: '未达到最终性' }])
  assert.equal(result.snapshot.evidence_ids.length, 2)
  assert.deepEqual(result.snapshot.evidence_ids, [first.id, second.id])
  assert.equal(result.snapshot.paths.length, 2)
  assert.equal(result.snapshot.paths[0].from, task.requester_did)
  assert.equal(result.snapshot.paths[0].to, task.beneficiary)
  assert.equal(result.snapshot.paths[0].amount, String(task.amount))
  assert.equal(result.snapshot.paths[0].confidence, 0.6)
  assert.match(result.snapshot.graph_version, /^graph-[0-9a-f]{12}$/)
  assert.equal(Object.keys(engine.state.case_snapshots).length, 1)
})

test('cases.trace reaches full coverage when the task or every event is final', () => {
  const { engine, cases } = createHarness()
  const finalTask = makeTask(engine)
  makeEvent(engine, finalTask, { finality: 'FINAL' })
  makeEvent(engine, finalTask, { finality: 'CONFIRMED' })
  const finalEvents = cases.trace(finalTask.id, { created_by: 'system:dsh-web', idempotencyKey: 'trace-1' })
  assert.equal(finalEvents.snapshot.coverage, 1)
  assert.deepEqual(finalEvents.snapshot.residuals, [])
  assert.equal(finalEvents.snapshot.paths[0].confidence, 1)

  const closedTask = makeTask(engine, { status: 'CLOSED' })
  makeEvent(engine, closedTask)
  const closed = cases.trace(closedTask.id, { created_by: 'system:dsh-web', idempotencyKey: 'trace-2' })
  assert.equal(closed.snapshot.coverage, 1)
  assert.deepEqual(closed.snapshot.residuals, [])
})

test('cases.trace replays the default trace key and honours explicit keys', () => {
  const { engine, cases } = createHarness()
  const task = makeTask(engine)
  const first = cases.trace(task.id)
  const replay = cases.trace(task.id)
  assert.equal(replay.case.id, first.case.id)
  assert.equal(replay.snapshot.id, first.snapshot.id)
})

test('cases list/get/traceGet expose the case with its latest snapshot', () => {
  const { engine, cases } = createHarness()
  const task = makeTask(engine)
  makeEvent(engine, task)
  const traced = cases.trace(task.id)
  const list = cases.list()
  assert.equal(list.length, 1)
  assert.equal(list[0].id, traced.case.id)
  assert.equal(list[0].snapshot.id, traced.snapshot.id)
  const fetched = cases.get(traced.case.id)
  assert.equal(fetched.case.id, traced.case.id)
  assert.equal(fetched.snapshot.id, traced.snapshot.id)
  const shaped = cases.traceGet(traced.case.id)
  assert.equal(shaped.snapshot.coverage, 0.5)
  throwsCode(() => cases.get('case_missing'), 'CASE_NOT_FOUND', 404)
  throwsCode(() => cases.traceGet('case_missing'), 'CASE_NOT_FOUND', 404)
})

test('cases.graph returns deterministic DID/ACCOUNT nodes and candidate edges', () => {
  const { engine, cases } = createHarness()
  const task = makeTask(engine)
  makeEvent(engine, task)
  const traced = cases.trace(task.id)
  const graph = cases.graph(traced.case.id)
  assert.equal(graph.case_id, traced.case.id)
  assert.equal(graph.snapshot_id, traced.snapshot.id)
  assert.equal(graph.nodes.length, 2)
  assert.deepEqual(
    graph.nodes.map((node) => node.entity_type).sort(),
    ['ACCOUNT', 'DID'],
  )
  assert.equal(graph.edges.length, 1)
  assert.equal(graph.edges[0].relation, 'PAYREQ')
  assert.equal(graph.edges[0].certainty, 'CANDIDATE')
  assert.equal(graph.edges[0].confidence, 0.6)
  const again = cases.graph(traced.case.id)
  assert.deepEqual(again, graph)
})

test('cases.createReport mirrors the snapshot and requires a snapshot + key', () => {
  const { engine, cases } = createHarness()
  const task = makeTask(engine)
  makeEvent(engine, task)
  makeEvent(engine, task)
  const traced = cases.trace(task.id)
  const report = cases.createReport(traced.case.id, { generated_by: 'system:dsh-web', idempotencyKey: 'report-1' })
  assert.match(report.id, /^report_/)
  assert.equal(report.case_id, traced.case.id)
  assert.equal(report.report.verified_facts.length, 2)
  assert.equal(report.report.algorithmic_candidates.length, 2)
  assert.equal(report.report.unresolved_items.length, 1)
  assert.equal(report.report.unresolved_items[0].reason, '未达到最终性')
  assert.deepEqual(report.report.human_findings, [])
  assert.equal(report.report.coverage, 0.5)
  assert.deepEqual(report.content, report.report)
  assert.deepEqual(report.evidence_refs, traced.snapshot.evidence_ids)
  assert.deepEqual(cases.getReport(report.id), report)
  assert.equal(cases.listReports(traced.case.id).length, 1)

  throwsCode(() => cases.createReport(traced.case.id, {}), 'IDEMPOTENCY_KEY_REQUIRED', 400)
  const snapshotless = makeCase(engine, task, { status: 'OPEN' })
  throwsCode(() => cases.createReport(snapshotless.id, { idempotencyKey: 'report-2' }), 'CASE_SNAPSHOT_NOT_FOUND', 409)
  throwsCode(() => cases.createReport('case_missing', { idempotencyKey: 'report-3' }), 'CASE_NOT_FOUND', 404)
})

test('cases.createReport replays its idempotency key and rejects a changed body', () => {
  const { engine, cases } = createHarness()
  const task = makeTask(engine)
  makeEvent(engine, task)
  const traced = cases.trace(task.id)
  const first = cases.createReport(traced.case.id, { generated_by: 'system:dsh-web', idempotencyKey: 'report-1' })
  const replay = cases.createReport(traced.case.id, { generated_by: 'system:dsh-web', idempotencyKey: 'report-1' })
  assert.equal(replay.id, first.id)
  throwsCode(
    () => cases.createReport(traced.case.id, { generated_by: 'did:trust:demo:agent', idempotencyKey: 'report-1' }),
    'IDEMPOTENCY_CONFLICT',
    409,
  )
})

/* ------------------------------------------------------------------ */
/* knowledge                                                           */
/* ------------------------------------------------------------------ */

test('knowledge.ingest chunks by paragraph within 500 characters', () => {
  const { knowledge } = createHarness()
  const content = `${'A'.repeat(700)}\n\n${'B'.repeat(100)}`
  const document = knowledge.ingest({ title: 'KYC Policy', content }, { idempotencyKey: 'kn-1' })
  assert.match(document.id, /^knowledge_/)
  assert.equal(document.review_status, 'DRAFT')
  assert.equal(document.access_level, 'INTERNAL')
  assert.equal(document.jurisdiction, 'GLOBAL')
  assert.equal(document.content_hash, sha256Hex(Buffer.from(content)))
  assert.equal(document.chunks.length, 3)
  for (const chunk of document.chunks) {
    assert.ok(chunk.text.length <= 500)
    assert.equal(chunk.review_status, 'DRAFT')
    assert.equal(chunk.embedding_status, 'NOT_CONFIGURED')
  }
  assert.deepEqual(
    document.chunks.map((chunk) => chunk.chunk_index),
    [0, 1, 2],
  )
  assert.equal(document.chunks[0].source_offset, 0)
  assert.equal(document.chunks[1].source_offset, 500)
  assert.equal(document.chunks[2].source_offset, 702)
})

test('knowledge.ingest validates content, windows and evidence links', () => {
  const { knowledge } = createHarness()
  throwsCode(
    () => knowledge.ingest({ title: 'KYC Policy', content: 'x'.repeat(500), content_hash: 'f'.repeat(64) }, { idempotencyKey: 'kn-1' }),
    'CONTENT_HASH_MISMATCH',
    422,
  )
  throwsCode(() => knowledge.ingest({ title: 'K', content: 'abc' }, { idempotencyKey: 'kn-2' }), 'VALIDATION_ERROR', 422)
  throwsCode(() => knowledge.ingest({ title: 'KYC Policy', content: 'abc', access_level: 'SECRET' }, { idempotencyKey: 'kn-3' }), 'VALIDATION_ERROR', 422)
  throwsCode(
    () => knowledge.ingest({ title: 'KYC Policy', content: 'abc', effective_from: '2027-01-01T00:00:00Z', effective_to: '2026-01-01T00:00:00Z' }, { idempotencyKey: 'kn-4' }),
    'KNOWLEDGE_WINDOW_INVALID',
    422,
  )
  throwsCode(
    () => knowledge.ingest({ title: 'KYC Policy', content: 'abc', evidence_id: 'evidence_missing' }, { idempotencyKey: 'kn-5' }),
    'EVIDENCE_NOT_FOUND',
    404,
  )
  throwsCode(() => knowledge.ingest({ title: 'KYC Policy', content: 'abc' }, {}), 'IDEMPOTENCY_KEY_REQUIRED', 400)
})

test('knowledge.ingest is deterministic for the same title and content', () => {
  const { knowledge } = createHarness()
  const first = knowledge.ingest({ title: 'KYC Policy', content: 'same bytes' }, { idempotencyKey: 'kn-1' })
  const second = knowledge.ingest({ title: 'KYC Policy', content: 'same bytes' }, { idempotencyKey: 'kn-2' })
  assert.equal(second.id, first.id)
  assert.equal(second.chunks.length, first.chunks.length)
})

test('knowledge.publish flips the document and chunks, and search sees it only afterwards', () => {
  const { engine, knowledge } = createHarness()
  const document = knowledge.ingest(
    { title: 'Settlement Policy', content: 'USDC settlement policy text', access_level: 'PUBLIC' },
    { idempotencyKey: 'kn-1' },
  )
  assert.deepEqual(knowledge.search({ query: 'usdc' }).results, [])
  const published = knowledge.publish(document.id, { idempotencyKey: 'kn-pub', review_note: 'approved' })
  assert.equal(published.review_status, 'PUBLISHED')
  assert.equal(published.chunks[0].review_status, 'PUBLISHED')
  assert.equal(published.metadata.review_note, 'approved')
  const found = knowledge.search({ query: 'USDC' })
  assert.equal(found.results.length, 1)
  assert.equal(found.results[0].document_id, document.id)
  assert.equal(found.results[0].metadata.retrieval_mode, 'lexical')
  assert.ok(found.results[0].metadata.match_score >= 1)
  assert.equal(knowledge.get(document.id).review_status, 'PUBLISHED')
  throwsCode(() => knowledge.publish('knowledge_missing', { idempotencyKey: 'kn-pub-missing' }), 'KNOWLEDGE_DOCUMENT_NOT_FOUND', 404)
  assert.equal(Object.keys(engine.state.knowledge_chunks).length, 1)
})

test('knowledge.search keeps restricted documents inside the owning domain', () => {
  const { knowledge } = createHarness()
  const internal = knowledge.ingest(
    { title: 'Internal Policy', content: 'internal settlement guidance' },
    { idempotencyKey: 'kn-1', actor: 'did:trust:demo:agent' },
  )
  knowledge.publish(internal.id, { idempotencyKey: 'kn-pub-1' })
  assert.equal(knowledge.search({ query: 'internal' }, { actor: 'system:dsh-web' }).results.length, 0)
  assert.equal(knowledge.search({ query: 'internal' }, { actor: 'did:trust:demo:user' }).results.length, 1)
  assert.equal(knowledge.search({ query: 'internal' }, { actor: 'did:trust:other:user' }).results.length, 0)
  throwsCode(() => knowledge.get(internal.id, { actor: 'system:dsh-web' }), 'ACCESS_DENIED', 403)

  const publicDoc = knowledge.ingest(
    { title: 'Public Policy', content: 'public settlement guidance', access_level: 'PUBLIC' },
    { idempotencyKey: 'kn-2', actor: 'did:trust:demo:agent' },
  )
  knowledge.publish(publicDoc.id, { idempotencyKey: 'kn-pub-2' })
  assert.equal(knowledge.search({ query: 'public' }, { actor: 'system:dsh-web' }).results.length, 1)
})

test('knowledge.search respects jurisdiction, effective windows and limit', () => {
  const { knowledge } = createHarness()
  const document = knowledge.ingest(
    {
      title: 'CN Settlement Policy',
      content: 'alpha settlement rules',
      jurisdiction: 'CN',
      access_level: 'PUBLIC',
      effective_from: '2026-01-01T00:00:00Z',
      effective_to: '2027-01-01T00:00:00Z',
    },
    { idempotencyKey: 'kn-1' },
  )
  knowledge.publish(document.id, { idempotencyKey: 'kn-pub' })
  assert.equal(knowledge.search({ query: 'alpha', jurisdiction: 'CN', effective_at: '2026-06-01T00:00:00Z' }).results.length, 1)
  assert.equal(knowledge.search({ query: 'alpha', jurisdiction: 'US' }).results.length, 0)
  assert.equal(knowledge.search({ query: 'alpha', effective_at: '2025-06-01T00:00:00Z' }).results.length, 0)
  assert.equal(knowledge.search({ query: 'alpha', effective_at: '2026-06-01T00:00:00Z' }).results.length, 1)
  assert.equal(knowledge.search({ query: 'alpha', limit: 1 }).results.length, 1)
  assert.deepEqual(knowledge.search({ query: '   ' }).results, [])
})

/* ------------------------------------------------------------------ */
/* governance                                                          */
/* ------------------------------------------------------------------ */

test('governance.feedback records a label and resolves the case', () => {
  const { engine, cases, governance } = createHarness()
  const task = makeTask(engine)
  makeEvent(engine, task)
  const traced = cases.trace(task.id)
  const created = governance.feedback(
    { case_id: traced.case.id, label: 'CONFIRMED', reason: 'confirmed by analyst', submitted_by: 'system:dsh-web' },
    { idempotencyKey: 'fb-1' },
  )
  assert.match(created.feedback_id, /^feedback_/)
  assert.equal(created.status, 'RECORDED')
  assert.equal(engine.state.cases[traced.case.id].status, 'RESOLVED')
  assert.equal(Object.keys(engine.state.feedback).length, 1)
})

test('governance.feedback validates labels, reasons, cases and actors', () => {
  const { engine, cases, governance } = createHarness()
  const task = makeTask(engine)
  makeEvent(engine, task)
  const traced = cases.trace(task.id)
  throwsCode(
    () => governance.feedback({ label: 'MAYBE', reason: 'too short', submitted_by: 'system:dsh-web' }, { idempotencyKey: 'fb-1' }),
    'VALIDATION_ERROR',
    422,
  )
  throwsCode(
    () => governance.feedback({ label: 'CONFIRMED', reason: 'ok', submitted_by: 'system:dsh-web' }, { idempotencyKey: 'fb-1' }),
    'VALIDATION_ERROR',
    422,
  )
  throwsCode(
    () => governance.feedback({ case_id: 'case_missing', label: 'CONFIRMED', reason: 'confirmed by analyst', submitted_by: 'system:dsh-web' }, { idempotencyKey: 'fb-1' }),
    'CASE_NOT_FOUND',
    404,
  )
  throwsCode(
    () =>
      governance.feedback(
        { label: 'CONFIRMED', reason: 'confirmed by analyst', submitted_by: 'alice' },
        { idempotencyKey: 'fb-1', actor: 'did:trust:demo:user' },
      ),
    'ACTOR_MISMATCH',
    403,
  )
  throwsCode(() => governance.feedback({ label: 'NEEDS_MORE_EVIDENCE', reason: 'more evidence', submitted_by: 'system:dsh-web' }, {}), 'IDEMPOTENCY_KEY_REQUIRED', 400)
})

test('governance.publishPolicy digests packages and conflicts on republication', () => {
  const { governance } = createHarness()
  const policyPackage = { rules: [{ id: 'r1', limit: 10 }] }
  const published = governance.publishPolicy(
    { policy_id: 'POL-1', domain_id: 'demo', version: '1.0.0', package: policyPackage, signed_by: 'system:dsh-web' },
    { idempotencyKey: 'pol-1' },
  )
  assert.equal(published.id, 'POL-1:1.0.0')
  assert.equal(published.status, 'ACTIVE')
  assert.equal(published.digest, sha256Hex(policyPackage))
  assert.equal(governance.listPolicies({ domain_id: 'demo' }).length, 1)
  assert.equal(governance.listPolicies({ domain_id: 'other' }).length, 0)
  const replay = governance.publishPolicy(
    { policy_id: 'POL-1', domain_id: 'demo', version: '1.0.0', package: policyPackage, signed_by: 'system:dsh-web' },
    { idempotencyKey: 'pol-2' },
  )
  assert.equal(replay.digest, published.digest)
  throwsCode(
    () =>
      governance.publishPolicy(
        { policy_id: 'POL-1', domain_id: 'demo', version: '1.0.0', package: { rules: [] }, signed_by: 'system:dsh-web' },
        { idempotencyKey: 'pol-3' },
      ),
    'POLICY_VERSION_CONFLICT',
    409,
  )
})

test('governance.publishModel records metrics and conflicts on different digests', () => {
  const { governance } = createHarness()
  const published = governance.publishModel(
    {
      model_id: 'model-1',
      model_name: 'risk-rules',
      digest: 'a'.repeat(64),
      artifact_uri: 'embedded://rules',
      metrics: { auc: 0.9 },
      signed_by: 'system:dsh-web',
    },
    { idempotencyKey: 'model-1' },
  )
  assert.equal(published.status, 'ACTIVE')
  assert.deepEqual(published.metrics, { auc: 0.9 })
  assert.equal(governance.listModels({ model_name: 'risk-rules' }).length, 1)
  assert.equal(governance.listModels({ model_name: 'other' }).length, 0)
  throwsCode(
    () =>
      governance.publishModel(
        { model_id: 'model-1', model_name: 'risk-rules', digest: 'b'.repeat(64), artifact_uri: 'embedded://rules', signed_by: 'system:dsh-web' },
        { idempotencyKey: 'model-2' },
      ),
    'MODEL_VERSION_CONFLICT',
    409,
  )
})

/* ------------------------------------------------------------------ */
/* assistant                                                           */
/* ------------------------------------------------------------------ */

function seedAnalystState() {
  const harness = createHarness()
  const { engine } = harness
  const task = makeTask(engine)
  const first = makeEvent(engine, task)
  const second = makeEvent(engine, task, { event_type: 'RESULT' })
  const traced = harness.cases.trace(task.id)
  engine.collection('risk_evidence')['risk_1'] = { id: 'risk_1', task_id: task.id, score: 0.9, reasons: [{ code: 'HIGH_VELOCITY' }] }
  engine.collection('risk_evidence')['risk_2'] = { id: 'risk_2', task_id: task.id, score: 0.4, reasons: [] }
  const document = harness.knowledge.ingest(
    { title: 'Public Policy', content: 'usdc settlement rules for agents', access_level: 'PUBLIC' },
    { idempotencyKey: 'kn-1' },
  )
  harness.knowledge.publish(document.id, { idempotencyKey: 'kn-pub' })
  return { ...harness, task, first, second, traced, document }
}

test('assistant.get_timeline projects task events deterministically', () => {
  const state = seedAnalystState()
  const result = state.assistant.query({ tool: 'get_timeline', arguments: { task_id: state.task.id } })
  assert.equal(result.events.length, 2)
  assert.equal(result.events[0].id, state.first.id)
  assert.equal(result.events[0].event_type, 'PAYREQ')
  assert.equal(result.events[0].actor_did, state.task.requester_did)
  assert.equal(result.events[0].finality, 'OBSERVED')
  assert.match(result.events[0].observed_at, /Z$/)
  throwsCode(() => state.assistant.query({ tool: 'get_timeline', arguments: { task_id: 'task_missing' } }), 'TASK_NOT_FOUND', 404)
})

test('assistant.get_timeline rejects a case from another task', () => {
  const state = seedAnalystState()
  const otherTask = makeTask(state.engine, { id: 'task_other' })
  makeEvent(state.engine, otherTask)
  const otherCase = state.cases.trace(otherTask.id, { idempotencyKey: 'other-trace' })
  throwsCode(
    () => state.assistant.query({ tool: 'get_timeline', arguments: { task_id: state.task.id, case_id: otherCase.case.id } }),
    'CASE_TASK_MISMATCH',
    409,
  )
})

test('assistant.trace_asset returns snapshot paths and coverage', () => {
  const { assistant, task, traced } = seedAnalystState()
  const result = assistant.query({ tool: 'trace_asset', arguments: { task_id: task.id } })
  assert.equal(result.case_id, traced.case.id)
  assert.equal(result.snapshot.length, 2)
  assert.equal(result.coverage, 0.5)
  throwsCode(() => assistant.query({ tool: 'trace_asset', arguments: { task_id: task.id, asset_id: 'EUR' } }), 'ASSET_NOT_FOUND', 404)
})

test('assistant.rank_nodes orders risk evidence by score', () => {
  const { assistant, task } = seedAnalystState()
  const result = assistant.query({ tool: 'rank_nodes', arguments: { task_id: task.id } })
  assert.deepEqual(
    result.risk_evidence.map((item) => item.id),
    ['risk_1', 'risk_2'],
  )
  assert.equal(result.status, 'VALID')
  assert.equal(assistant.query({ tool: 'rank_nodes', arguments: { task_id: task.id, limit: 1 } }).risk_evidence.length, 1)
})

test('assistant.match_pattern queries published knowledge lexically', () => {
  const { assistant } = seedAnalystState()
  const result = assistant.query({ tool: 'match_pattern', arguments: { query: 'USDC' } })
  assert.equal(result.matches.length, 1)
  assert.match(result.matches[0].text, /usdc/i)
  assert.equal(result.matches[0].metadata.retrieval_mode, 'lexical')
})

test('assistant.replay_rule is deterministic and explicit about missing features', () => {
  const { assistant } = seedAnalystState()
  const result = assistant.query({
    tool: 'replay_rule',
    arguments: { features: { velocity: 1, amount_deviation: 1, new_counterparty: 1 } },
  })
  assert.equal(result.status, 'VALID')
  assert.equal(result.score, 0.7)
  assert.equal(result.trust_score, 0.3)
  assert.equal(result.decision, 'DEFER')
  assert.equal(result.deterministic, true)
  const low = assistant.query({ tool: 'replay_rule', arguments: { features: { velocity: 0.1 } } })
  assert.equal(low.decision, 'ALLOW')
  assert.equal(low.score, 0.025)
  assert.deepEqual(assistant.query({ tool: 'replay_rule', arguments: {} }), {
    status: 'NOT_EVALUABLE',
    reason: '缺少可重放的特征快照',
  })
})

test('assistant.resolve_entity derives entities from stored records', () => {
  const { assistant } = seedAnalystState()
  const result = assistant.query({ tool: 'resolve_entity', arguments: { query: 'demo:agent' } })
  assert.equal(result.entities.length, 1)
  assert.equal(result.entities[0].entity_type, 'DID')
  assert.equal(result.entities[0].canonical_ref, 'did:trust:demo:agent')
  assert.equal(assistant.query({ tool: 'resolve_entity', arguments: { query: 'acct-alice' } }).entities[0].entity_type, 'ACCOUNT')
  throwsCode(() => assistant.query({ tool: 'resolve_entity', arguments: { query: '' } }), 'ENTITY_NOT_FOUND', 404)
  throwsCode(() => assistant.query({ tool: 'resolve_entity', arguments: { query: 'nobody' } }), 'ENTITY_NOT_FOUND', 404)
})

test('assistant.draft_report generates a report through the case engine', () => {
  const { assistant, cases, traced } = seedAnalystState()
  const result = assistant.query({ tool: 'draft_report', arguments: { case_id: traced.case.id } }, { idempotencyKey: 'draft-1' })
  assert.match(result.report_id, /^report_/)
  assert.equal(result.report.verified_facts.length, 2)
  assert.deepEqual(result.content, result.report)
  assert.equal(cases.getReport(result.report_id).id, result.report_id)
  throwsCode(() => assistant.query({ tool: 'draft_report', arguments: { case_id: traced.case.id } }), 'IDEMPOTENCY_KEY_REQUIRED', 400)
})

test('assistant.query rejects unknown tools', () => {
  const { assistant } = seedAnalystState()
  throwsCode(() => assistant.query({ tool: 'drop_tables', arguments: {} }), 'VALIDATION_ERROR', 422)
})

/* ------------------------------------------------------------------ */
/* dashboard                                                           */
/* ------------------------------------------------------------------ */

test('dashboard.summary aggregates the engine state', () => {
  const { engine, dashboard } = createHarness()
  const task = makeTask(engine)
  makeEvent(engine, task)
  makeEvent(engine, task, { event_type: 'RESULT' })
  engine.collection('tasks')['task_second'] = { ...makeTask(engine, { id: 'task_second', domain_id: 'other' }), status: 'CLOSED' }
  engine.collection('risk_evidence')['risk_1'] = { id: 'risk_1', task_id: task.id, score: 0.5, reasons: [] }
  engine.collection('interventions')['dec_1'] = { id: 'dec_1', task_id: task.id, action: 'STEP_UP' }
  const summary = dashboard.summary()
  assert.equal(summary.tasks_total, 2)
  assert.deepEqual(summary.tasks_by_status, { CREATED: 1, CLOSED: 1 })
  assert.equal(summary.events_total, 2)
  assert.equal(summary.risks_total, 1)
  assert.equal(summary.interventions_total, 1)
  assert.equal(summary.cases_total, 0)
  assert.equal(summary.open_cases, 0)
  assert.deepEqual(summary.decisions_by_action, { STEP_UP: 1 })
  assert.equal(summary.recent_events.length, 2)
  assert.equal(summary.recent_events[0].event_type, 'RESULT')
  assert.match(summary.generated_at, /^\d{4}-\d{2}-\d{2}T/)
})

test('dashboard.summary is domain scoped for DID actors', () => {
  const { engine, dashboard } = createHarness()
  const task = makeTask(engine)
  makeEvent(engine, task)
  makeTask(engine, { id: 'task_other', domain_id: 'other' })
  const demo = dashboard.summary({ actor: 'did:trust:demo:user' })
  assert.equal(demo.tasks_total, 1)
  assert.equal(demo.events_total, 1)
  const other = dashboard.summary({ actor: 'did:trust:other:user' })
  assert.equal(other.tasks_total, 1)
  assert.equal(other.events_total, 0)
})

test('dashboard.metricsText is deterministic Prometheus exposition', () => {
  const { engine, dashboard } = createHarness()
  const task = makeTask(engine)
  makeEvent(engine, task)
  const text = dashboard.metricsText()
  assert.ok(text.includes('# HELP trust_tasks_total Payment tasks by status.'))
  assert.ok(text.includes('# TYPE trust_tasks_total gauge'))
  assert.ok(text.includes('trust_tasks_total{status="CREATED"} 1'))
  assert.ok(text.includes('trust_events_total 1'))
  assert.ok(text.includes('trust_risk_decisions_total 0'))
  assert.ok(text.includes('trust_plugin_info{name="@sealwax/dsh-trust-platform",schema_version="1"} 1'))
  assert.ok(text.endsWith('\n'))
  assert.equal(dashboard.metricsText(), text)
})

/* ------------------------------------------------------------------ */
/* persistence                                                         */
/* ------------------------------------------------------------------ */

test('records survive a FileStore flush and reload', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'engine-records-'))
  try {
    const first = createHarness({ store: new FileStore(dataDir) })
    const evidence = first.evidence.create({ source_type: 'invoice', source_ref: 'persisted-ref', content: 'persisted-bytes' }, { idempotencyKey: 'ev-1' })
    first.evidence.anchor(evidence.id, { idempotencyKey: 'anchor-1' })
    const document = first.knowledge.ingest(
      { title: 'Persisted Policy', content: 'persisted settlement policy', access_level: 'PUBLIC' },
      { idempotencyKey: 'kn-1' },
    )
    first.knowledge.publish(document.id, { idempotencyKey: 'kn-pub' })
    first.governance.feedback(
      { label: 'NEEDS_MORE_EVIDENCE', reason: 'need more evidence', submitted_by: 'system:dsh-web' },
      { idempotencyKey: 'fb-1' },
    )
    first.governance.publishPolicy(
      { policy_id: 'POL-9', domain_id: 'demo', version: '1.0.0', package: { ok: true }, signed_by: 'system:dsh-web' },
      { idempotencyKey: 'pol-1' },
    )
    first.engine.flush()

    const second = createHarness({ store: new FileStore(dataDir) })
    assert.equal(second.evidence.get(evidence.id).id, evidence.id)
    assert.equal(second.evidence.anchors(evidence.id).length, 1)
    assert.equal(second.knowledge.get(document.id).review_status, 'PUBLISHED')
    assert.equal(second.knowledge.search({ query: 'persisted' }).results.length, 1)
    assert.equal(second.governance.listPolicies({ domain_id: 'demo' }).length, 1)
    assert.equal(second.dashboard.summary().tasks_total, 0)
    assert.equal(Object.keys(second.engine.state.feedback).length, 1)
  } finally {
    rmSync(dataDir, { recursive: true, force: true })
  }
})
