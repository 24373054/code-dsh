/**
 * Trace cases, snapshots and generated reports.
 *
 * A case is the investigation envelope around one payment task. Tracing the
 * task records the event graph at a point in time as an immutable snapshot;
 * reports are prose generated from the latest snapshot. Nothing here invents
 * facts: the snapshot is derived from stored events and the report mirrors the
 * snapshot's paths and residuals verbatim.
 */
import { clone, fail, sha256Hex } from './core.js'

const FINAL_TASK_STATUSES = new Set(['CONFIRMED', 'AUDITED', 'CLOSED'])
const FINAL_EVENT_FINALITIES = new Set(['CONFIRMED', 'FINAL'])
const TRACE_MODEL_VERSION = 'trace-rules-2026-10-25-001'

function assertText(value, field, min, max) {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    fail('VALIDATION_ERROR', `${field} must be a string of ${min}-${max} characters`, { status: 422 })
  }
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

function taskOf(engine, taskId) {
  if (!taskId) return null
  const tasks = engine.state.tasks || {}
  return tasks[taskId] || null
}

function eventsForTask(engine, taskId) {
  const events = engine.state.events || {}
  return Object.values(events)
    .filter((event) => event.task_id === taskId || event.taskId === taskId)
    .sort((left, right) => String(left.observed_at || left.created_at || '').localeCompare(String(right.observed_at || right.created_at || '')))
}

function requireTaskAccess(engine, task, actor) {
  const domain = actorDomain(engine, actor)
  if (domain !== null && (task.domain_id || task.domainId) !== domain) {
    fail('ACCESS_DENIED', 'the actor may not access this task', { status: 403 })
  }
}

function requireCaseAccess(engine, record, actor) {
  const domain = actorDomain(engine, actor)
  if (domain === null) return
  if (!record.task_id) fail('ACCESS_DENIED', 'the case has no task and cannot be accessed', { status: 403 })
  const task = taskOf(engine, record.task_id)
  if (!task) fail('ACCESS_DENIED', 'the case task does not exist', { status: 403 })
  if ((task.domain_id || task.domainId) !== domain) {
    fail('ACCESS_DENIED', 'the actor may not access this case', { status: 403 })
  }
}

function finalityOf(event) {
  return event.finality || event.finality_state || 'OBSERVED'
}

function eventPayload(event) {
  const payload = event.payload
  return payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {}
}

/** Deterministic coverage: full only when the task or every event is final. */
function coverageFor(task, events) {
  if (events.length === 0) return 0
  if (FINAL_TASK_STATUSES.has(task.status)) return 1
  return events.every((event) => FINAL_EVENT_FINALITIES.has(finalityOf(event))) ? 1 : 0.5
}

function snapshotResponse(engine, record) {
  return clone({
    id: record.id,
    graph_version: record.graph_version,
    evidence_ids: record.evidence_ids,
    paths: record.paths,
    residuals: record.residuals,
    coverage: record.coverage,
    filters: record.filters,
    created_at: record.created_at,
  })
}

function reportResponse(record) {
  // SPEC names the generated body `report`; the Python schema called it
  // `content`. Expose both aliases so either reader works.
  return clone({
    id: record.id,
    case_id: record.case_id,
    case_snapshot_id: record.case_snapshot_id,
    report: record.report,
    content: record.report,
    evidence_refs: record.evidence_refs,
    policy_version: record.policy_version,
    model_version: record.model_version,
    generated_by: record.generated_by,
    created_at: record.created_at,
  })
}

export function createCaseEngine(engine) {
  function caseCollection() {
    return engine.collection('cases')
  }

  function snapshotCollection() {
    return engine.collection('case_snapshots')
  }

  function reportCollection() {
    return engine.collection('reports')
  }

  function latestSnapshot(caseId) {
    return (
      Object.values(snapshotCollection())
        .filter((snapshot) => snapshot.case_id === caseId)
        .sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)))[0] || null
    )
  }

  function caseResponse(record) {
    const snapshot = latestSnapshot(record.id)
    return clone({
      id: record.id,
      task_id: record.task_id,
      status: record.status,
      scope: record.scope,
      policy_version: record.policy_version,
      model_version: record.model_version,
      created_at: record.created_at,
      snapshot: snapshot ? snapshotResponse(engine, snapshot) : null,
    })
  }

  function buildSnapshot(task, events) {
    const coverage = coverageFor(task, events)
    const paths = events.map((event) => {
      const payload = eventPayload(event)
      return {
        event_id: event.id,
        from: event.actor_did || event.actorDid || null,
        to: payload.beneficiary !== undefined && payload.beneficiary !== null ? payload.beneficiary : task.beneficiary,
        asset_id: task.asset_id || task.assetId || null,
        amount: String(payload.amount !== undefined && payload.amount !== null ? payload.amount : task.amount),
        confidence: finalityOf(event) === 'FINAL' ? 1 : 0.6,
        evidence_refs: [event.id],
      }
    })
    const residuals =
      coverage === 1
        ? []
        : [{ asset_id: task.asset_id || task.assetId || null, reason: '未达到最终性' }]
    return {
      evidence_ids: events.map((event) => event.id),
      paths,
      residuals,
      coverage,
    }
  }

  /** Trace a task: create or reuse its open case, then snapshot the events. */
  function trace(taskId, options = {}) {
    const createdBy = options.created_by || options.actor || engine.defaultActor()
    const key = `cases.trace:${options.idempotencyKey || `legacy-trace-${taskId}`}`
    return engine.idempotent(key, { task_id: taskId, created_by: createdBy }, () => {
      const task = taskOf(engine, taskId)
      if (!task) fail('TASK_NOT_FOUND', 'payment task not found', { status: 404 })
      actorOf(engine, options)
      requireTaskAccess(engine, task, createdBy)
      let record =
        Object.values(caseCollection())
          .filter((item) => item.task_id === taskId && item.status === 'OPEN')
          .sort((left, right) => String(left.created_at).localeCompare(String(right.created_at)))[0] || null
      if (!record) {
        record = {
          id: engine.id('case'),
          task_id: taskId,
          status: 'OPEN',
          scope: { task_id: taskId, asset_id: task.asset_id || task.assetId || null },
          policy_version: task.policy_version || engine.policy.policyVersion,
          model_version: TRACE_MODEL_VERSION,
          created_at: engine.iso(),
        }
        caseCollection()[record.id] = record
      }
      const events = eventsForTask(engine, taskId)
      const material = buildSnapshot(task, events)
      const snapshot = {
        id: engine.id('snapshot'),
        case_id: record.id,
        graph_version: `graph-${sha256Hex({ case_id: record.id, evidence_ids: material.evidence_ids }).slice(0, 12)}`,
        evidence_ids: material.evidence_ids,
        paths: material.paths,
        residuals: material.residuals,
        coverage: material.coverage,
        filters: {},
        created_at: engine.iso(),
      }
      snapshotCollection()[snapshot.id] = snapshot
      engine.audit('case.trace', createdBy, 'case', record.id, {
        task_id: taskId,
        snapshot_id: snapshot.id,
        coverage: snapshot.coverage,
      })
      engine.save()
      return { case: clone(record), snapshot: snapshotResponse(engine, snapshot) }
    })
  }

  function list(options = {}) {
    const actor = actorOf(engine, options)
    const domain = actorDomain(engine, actor)
    const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 200)
    return Object.values(caseCollection())
      .filter((record) => {
        if (domain === null) return true
        const task = taskOf(engine, record.task_id)
        return Boolean(task) && (task.domain_id || task.domainId) === domain
      })
      .sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)))
      .slice(0, limit)
      .map(caseResponse)
  }

  function get(caseId, options = {}) {
    const record = caseCollection()[caseId]
    if (!record) fail('CASE_NOT_FOUND', 'case not found', { status: 404 })
    requireCaseAccess(engine, record, actorOf(engine, options))
    const snapshot = latestSnapshot(caseId)
    return { case: clone(record), snapshot: snapshot ? snapshotResponse(engine, snapshot) : null }
  }

  /** Old-API shaped response: case fields with the snapshot nested. */
  function traceGet(caseId, options = {}) {
    const record = caseCollection()[caseId]
    if (!record) fail('CASE_NOT_FOUND', 'case not found', { status: 404 })
    requireCaseAccess(engine, record, actorOf(engine, options))
    return caseResponse(record)
  }

  /** Event graph of the latest snapshot, computed on the fly. */
  function graph(caseId, options = {}) {
    const record = caseCollection()[caseId]
    if (!record) fail('CASE_NOT_FOUND', 'case not found', { status: 404 })
    requireCaseAccess(engine, record, actorOf(engine, options))
    const snapshot = latestSnapshot(caseId)
    if (!snapshot) fail('CASE_SNAPSHOT_NOT_FOUND', 'the case has no trace snapshot', { status: 409 })
    const task = taskOf(engine, record.task_id)
    const wanted = new Set(snapshot.evidence_ids || [])
    const events = eventsForTask(engine, record.task_id).filter((event) => wanted.has(event.id))
    const nodes = new Map()
    const edges = new Map()
    function entity(entityType, canonicalRef) {
      const id = `entity_${sha256Hex({ entity_type: entityType, canonical_ref: canonicalRef }).slice(0, 32)}`
      nodes.set(id, { id, entity_type: entityType, canonical_ref: canonicalRef, attributes: {} })
      return id
    }
    for (const event of events) {
      const payload = eventPayload(event)
      const actorRef = event.actor_did || event.actorDid || 'unknown'
      const counterparty = event.counterparty_did || event.counterpartyDid || payload.beneficiary || 'unknown'
      const source = entity(actorRef.startsWith('did:') ? 'DID' : 'ACCOUNT', actorRef)
      const target = entity(String(counterparty).startsWith('did:') ? 'DID' : 'ACCOUNT', String(counterparty))
      const relation = event.event_type || event.eventType || 'EVENT'
      const edgeId = `edge_${sha256Hex({ source, target, relation }).slice(0, 32)}`
      edges.set(edgeId, {
        id: edgeId,
        source_entity_id: source,
        target_entity_id: target,
        relation,
        certainty: finalityOf(event) === 'FINAL' ? 'VERIFIED' : 'CANDIDATE',
        confidence: finalityOf(event) === 'FINAL' ? 1 : 0.6,
        evidence_refs: [event.id],
        valid_from: event.observed_at || event.created_at || (task ? task.created_at : null) || engine.iso(),
        valid_to: null,
        model_version: null,
      })
    }
    return {
      case_id: record.id,
      snapshot_id: snapshot.id,
      nodes: [...nodes.values()],
      edges: [...edges.values()],
    }
  }

  function createReport(caseId, options = {}) {
    const idempotencyKey = requireIdempotency(options)
    const generatedBy = options.generated_by || options.actor || engine.defaultActor()
    return engine.idempotent(`reports.generate:${idempotencyKey}`, { case_id: caseId, generated_by: generatedBy }, () => {
      const record = caseCollection()[caseId]
      if (!record) fail('CASE_NOT_FOUND', 'case not found', { status: 404 })
      requireCaseAccess(engine, record, generatedBy)
      const snapshot = latestSnapshot(caseId)
      if (!snapshot) fail('CASE_SNAPSHOT_NOT_FOUND', 'trace the case before generating a report', { status: 409 })
      const report = {
        verified_facts: (snapshot.evidence_ids || []).map((eventId) => ({
          event_id: eventId,
          statement: '事件已登记并进入追踪快照',
          evidence_refs: [eventId],
        })),
        algorithmic_candidates: clone(snapshot.paths || []),
        unresolved_items: clone(snapshot.residuals || []),
        human_findings: [],
        coverage: snapshot.coverage,
      }
      const response = {
        id: engine.id('report'),
        case_id: caseId,
        case_snapshot_id: snapshot.id,
        report,
        evidence_refs: clone(snapshot.evidence_ids || []),
        policy_version: record.policy_version || engine.policy.policyVersion,
        model_version: record.model_version || TRACE_MODEL_VERSION,
        generated_by: generatedBy,
        created_at: engine.iso(),
      }
      reportCollection()[response.id] = response
      engine.audit('report.generate', generatedBy, 'report', response.id, { case_id: caseId, snapshot_id: snapshot.id })
      engine.save()
      return reportResponse(response)
    })
  }

  function getReport(reportId, options = {}) {
    const record = reportCollection()[reportId]
    if (!record) fail('REPORT_NOT_FOUND', 'report not found', { status: 404 })
    const caseRecord = caseCollection()[record.case_id]
    if (caseRecord) requireCaseAccess(engine, caseRecord, actorOf(engine, options))
    return reportResponse(record)
  }

  function listReports(caseId, options = {}) {
    const record = caseCollection()[caseId]
    if (!record) fail('CASE_NOT_FOUND', 'case not found', { status: 404 })
    requireCaseAccess(engine, record, actorOf(engine, options))
    return Object.values(reportCollection())
      .filter((report) => report.case_id === caseId)
      .sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)))
      .map(reportResponse)
  }

  return { trace, list, get, traceGet, graph, createReport, getReport, listReports }
}
