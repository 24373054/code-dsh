/**
 * Deterministic analyst assistant over the records the engine already holds.
 * Each tool is a read-only projection except `draft_report`, which generates a
 * report from the case snapshot through the case engine. No tool calls out and
 * nothing is inferred beyond what the stored records prove.
 */
import { fail, sha256Hex } from './core.js'
import { createCaseEngine } from './cases.js'
import { createKnowledgeEngine } from './knowledge.js'

const TOOLS = new Set(['resolve_entity', 'get_timeline', 'trace_asset', 'replay_rule', 'rank_nodes', 'match_pattern', 'draft_report'])
const RISK_MODEL_VERSION = 'rules-2026-10-25-001'
const RISK_WEIGHTS = {
  velocity: 0.25,
  amount_deviation: 0.25,
  new_counterparty: 0.2,
  cross_chain_hops: 0.15,
  identity_unknown: 0.15,
}
const DEFAULT_RISK_WEIGHT = 0.05

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

function assertArguments(payload) {
  if (payload === undefined || payload === null) return {}
  if (typeof payload !== 'object' || Array.isArray(payload)) {
    fail('VALIDATION_ERROR', 'arguments must be an object', { status: 422 })
  }
  return payload
}

function taskOf(engine, taskId) {
  const tasks = engine.state.tasks || {}
  return taskId ? tasks[taskId] || null : null
}

function eventsForTask(engine, taskId) {
  const events = engine.state.events || {}
  return Object.values(events)
    .filter((event) => event.task_id === taskId || event.taskId === taskId)
    .sort((left, right) => String(left.observed_at || left.created_at || '').localeCompare(String(right.observed_at || right.created_at || '')))
}

function caseOf(engine, caseId) {
  const cases = engine.state.cases || {}
  return caseId ? cases[caseId] || null : null
}

function requireTaskAccess(engine, task, actor) {
  const domain = actorDomain(engine, actor)
  if (domain !== null && (task.domain_id || task.domainId) !== domain) {
    fail('ACCESS_DENIED', 'the actor may not access this task', { status: 403 })
  }
}

function requireTask(engine, taskId) {
  if (!taskId) fail('VALIDATION_ERROR', 'task_id is required', { status: 422 })
  const task = taskOf(engine, taskId)
  if (!task) fail('TASK_NOT_FOUND', 'payment task not found', { status: 404 })
  return task
}

function latestCaseForTask(engine, taskId) {
  return (
    Object.values(engine.state.cases || {})
      .filter((record) => record.task_id === taskId)
      .sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)))[0] || null
  )
}

function latestSnapshotForCase(engine, caseId) {
  return (
    Object.values(engine.state.case_snapshots || {})
      .filter((snapshot) => snapshot.case_id === caseId)
      .sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)))[0] || null
  )
}

function riskDecision(engine, score) {
  const policy = engine.policy
  if (score >= policy.riskBlockThreshold) return 'BLOCK'
  if (score >= policy.riskDeferThreshold) return 'DEFER'
  if (score >= policy.riskThrottleThreshold) return 'THROTTLE'
  return 'ALLOW'
}

function replay(engine, features) {
  if (!features || typeof features !== 'object' || Array.isArray(features)) {
    return { status: 'NOT_EVALUABLE', reason: '缺少可重放的特征快照' }
  }
  let score = 0
  for (const [name, weight] of Object.entries(RISK_WEIGHTS)) {
    const value = features[name]
    const normalised = typeof value === 'boolean' ? (value ? 1 : 0) : Number(value)
    if (!Number.isFinite(normalised)) continue
    score += weight * Math.min(Math.max(normalised, 0), 1)
  }
  for (const [name, value] of Object.entries(features)) {
    if (name in RISK_WEIGHTS) continue
    const normalised = typeof value === 'boolean' ? (value ? 1 : 0) : Number(value)
    if (!Number.isFinite(normalised)) continue
    score += DEFAULT_RISK_WEIGHT * Math.min(Math.max(normalised, 0), 1)
  }
  score = Math.min(score, 1)
  score = Math.round(score * 1e6) / 1e6
  return {
    status: 'VALID',
    policy_version: engine.policy.policyVersion,
    model_version: RISK_MODEL_VERSION,
    score,
    trust_score: Math.round((1 - score) * 1e6) / 1e6,
    decision: riskDecision(engine, score),
    deterministic: true,
  }
}

export function createAssistantEngine(engine) {
  const cases = createCaseEngine(engine)
  const knowledge = createKnowledgeEngine(engine)

  function deriveEntities() {
    const refs = new Map()
    function add(canonicalRef) {
      if (typeof canonicalRef !== 'string' || canonicalRef.length === 0) return
      const entityType = canonicalRef.startsWith('did:') ? 'DID' : 'ACCOUNT'
      const key = `${entityType}:${canonicalRef}`
      if (!refs.has(key)) {
        refs.set(key, {
          id: `entity_${sha256Hex({ entity_type: entityType, canonical_ref: canonicalRef }).slice(0, 32)}`,
          entity_type: entityType,
          canonical_ref: canonicalRef,
          attributes: {},
        })
      }
    }
    for (const task of Object.values(engine.state.tasks || {})) {
      add(task.requester_did || task.requesterDid)
      add(task.beneficiary)
    }
    for (const event of Object.values(engine.state.events || {})) {
      add(event.actor_did || event.actorDid)
      add(event.counterparty_did || event.counterpartyDid)
      const payload = event.payload && typeof event.payload === 'object' ? event.payload : {}
      add(payload.beneficiary)
    }
    return [...refs.values()]
  }

  function resolveEntity(args) {
    const query = typeof args.query === 'string' ? args.query.trim() : ''
    if (!query) fail('ENTITY_NOT_FOUND', 'entity not found', { status: 404 })
    const entities = deriveEntities()
      .filter((entity) => entity.canonical_ref.includes(query))
      .slice(0, 20)
    if (entities.length === 0) fail('ENTITY_NOT_FOUND', 'entity not found', { status: 404 })
    return { entities }
  }

  function getTimeline(args, actor) {
    const task = requireTask(engine, args.task_id)
    requireTaskAccess(engine, task, actor)
    const events = eventsForTask(engine, task.id)
    if (args.case_id) {
      const record = caseOf(engine, args.case_id)
      if (!record) fail('CASE_NOT_FOUND', 'case not found', { status: 404 })
      if (record.task_id !== task.id) fail('CASE_TASK_MISMATCH', 'the case does not belong to this task', { status: 409 })
    }
    if (args.event_id && !events.some((event) => event.id === args.event_id)) {
      fail('EVENT_NOT_FOUND', 'event not found for this task', { status: 404 })
    }
    return {
      events: events.map((event) => ({
        id: event.id,
        event_type: event.event_type || event.eventType || null,
        actor_did: event.actor_did || event.actorDid || null,
        observed_at: event.observed_at || null,
        finality: event.finality || 'OBSERVED',
      })),
    }
  }

  function traceAsset(args, actor) {
    const task = requireTask(engine, args.task_id)
    requireTaskAccess(engine, task, actor)
    let record = args.case_id ? caseOf(engine, args.case_id) : latestCaseForTask(engine, task.id)
    if (!record) fail('CASE_NOT_FOUND', 'trace the task before tracing its asset', { status: 404 })
    if (record.task_id !== task.id) fail('CASE_TASK_MISMATCH', 'the case does not belong to this task', { status: 409 })
    const snapshot = latestSnapshotForCase(engine, record.id)
    if (!snapshot) fail('CASE_SNAPSHOT_NOT_FOUND', 'the case has no trace snapshot', { status: 409 })
    const assetId = task.asset_id || task.assetId || null
    if (args.asset_id && args.asset_id !== assetId) fail('ASSET_NOT_FOUND', 'asset not found for this task', { status: 404 })
    return { case_id: record.id, snapshot: snapshot.paths, coverage: snapshot.coverage }
  }

  function rankNodes(args, actor) {
    const task = requireTask(engine, args.task_id)
    requireTaskAccess(engine, task, actor)
    const limit = Math.min(Math.max(Number(args.limit) || 20, 1), 100)
    const risks = Object.values(engine.state.risk_evidence || {})
      .filter((item) => item.task_id === task.id)
      .sort((left, right) => Number(right.score || 0) - Number(left.score || 0))
      .slice(0, Math.min(limit, 20))
      .map((item) => ({ id: item.id, score: item.score, reasons: item.reasons || [] }))
    return { risk_evidence: risks, status: risks.length > 0 ? 'VALID' : 'UNKNOWN' }
  }

  function matchPattern(args, actor) {
    const query = typeof args.query === 'string' ? args.query.trim() : ''
    if (!query) fail('VALIDATION_ERROR', 'query is required', { status: 422 })
    const found = knowledge.search(
      { query, jurisdiction: args.jurisdiction, effective_at: args.effective_at, limit: args.limit },
      { actor },
    )
    return {
      matches: found.results.map((chunk) => ({
        id: chunk.id,
        document_id: chunk.document_id,
        text: chunk.text,
        metadata: chunk.metadata,
      })),
    }
  }

  function draftReport(args, options, actor) {
    if (!options.idempotencyKey) {
      fail('IDEMPOTENCY_KEY_REQUIRED', 'draft_report requires an idempotency key', { status: 400 })
    }
    if (!args.case_id) fail('VALIDATION_ERROR', 'case_id is required', { status: 422 })
    const report = cases.createReport(args.case_id, { generated_by: actor, idempotencyKey: options.idempotencyKey })
    return { report_id: report.id, report: report.report, content: report.report, evidence_refs: report.evidence_refs }
  }

  function query(payload = {}, options = {}) {
    const actor = actorOf(engine, options)
    const tool = payload.tool
    if (!TOOLS.has(tool)) {
      fail('VALIDATION_ERROR', 'tool must be one of the supported assistant tools', { status: 422 })
    }
    const args = assertArguments(payload.arguments)
    let result
    switch (tool) {
      case 'resolve_entity':
        result = resolveEntity(args)
        break
      case 'get_timeline':
        result = getTimeline(args, actor)
        break
      case 'trace_asset':
        result = traceAsset(args, actor)
        break
      case 'replay_rule':
        result = replay(engine, args.features)
        break
      case 'rank_nodes':
        result = rankNodes(args, actor)
        break
      case 'match_pattern':
        result = matchPattern(args, actor)
        break
      case 'draft_report':
        result = draftReport(args, options, actor)
        break
      default:
        fail('VALIDATION_ERROR', 'unsupported assistant tool', { status: 422 })
    }
    engine.audit('assistant.tool', actor, 'assistant', tool, {})
    engine.save()
    return result
  }

  return { query }
}
