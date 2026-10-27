/**
 * Browser-facing snapshots built from the embedded trust plane.
 *
 * The client bundle polls one read-only JSON document. Everything in it is
 * derived from the engine state owned by this plugin process: no sidecar
 * service, no network, no optimistic counters.
 *
 * @module dsh-trust-platform/state
 */

/** Public package id shown in the browser half. */
export const PLUGIN_ID = '@sealwax/dsh-trust-platform'

/** Where the records came from: the in-process embedded engine. */
export const EMBEDDED_SOURCE = 'embedded-engine'

/** How many recent audit entries are exposed to the browser. */
export const RECENT_EVENT_LIMIT = 10

/**
 * Build the overview document served at `GET /trust-platform/api/overview`.
 *
 * @param options.plane - embedded trust plane (`createTrustPlane` result).
 * @param options.version - plugin package version.
 * @param options.mode - `embedded` or `sandbox`.
 * @param options.startedAt - ISO timestamp of plugin start.
 * @param options.health - health snapshot; defaults to the engine health.
 * @param options.config - public (non-secret) configuration summary.
 * @param options.now - current time (injectable for tests).
 */
export function buildOverview({ plane, version, mode, startedAt, health, config, authoritative, now = new Date() } = {}) {
  const engine = plane?.engine
  const resolvedMode = normalizeMode(mode)
  const resolvedHealth = normalizeHealth(health ?? plane?.health?.())
  const counts = typeof plane?.counts === 'function' ? plane.counts() : emptyCounts()
  return {
    plugin: {
      name: PLUGIN_ID,
      version: normalizeVersion(version),
      mode: resolvedMode,
      engine: 'embedded',
      source: resolvedMode === 'sandbox' ? 'in-memory-sandbox' : EMBEDDED_SOURCE,
      authoritative: authoritative === undefined ? resolvedMode === 'embedded' : Boolean(authoritative),
      started_at: normalizeIso(startedAt) ?? resolvedHealth.checked_at ?? null,
      data_dir: normalizeText(engine?.store?.dataDir) || null,
    },
    health: resolvedHealth,
    config: normalizeConfig(config),
    counts: normalizeCounts(counts),
    recent_events: recentEvents(plane),
    now: toIsoString(now),
  }
}

/** Latest audit entries shaped for the browser timeline. */
function recentEvents(plane) {
  let entries = []
  try {
    entries = typeof plane?.activity === 'function' ? plane.activity(RECENT_EVENT_LIMIT) : []
  } catch {
    entries = []
  }
  if (!Array.isArray(entries)) return []
  return entries.slice(0, RECENT_EVENT_LIMIT).map((entry) => {
    const details = entry?.details && typeof entry.details === 'object' ? entry.details : {}
    return {
      event_type: normalizeText(entry?.action) || 'activity',
      actor_did: normalizeText(entry?.actor) || null,
      task_id: normalizeText(entry?.resource_type) === 'task' ? normalizeText(entry?.resource_id) || null : null,
      occurred_at: normalizeIso(entry?.created_at),
      decision: normalizeText(details.decision) || null,
    }
  })
}

/** Health document restricted to the fields the browser half understands. */
function normalizeHealth(health) {
  const value = health !== null && typeof health === 'object' ? health : {}
  const normalized = {
    status: normalizeText(value.status) || 'ok',
    service: normalizeText(value.service) || 'dsh-embedded-trust-plane',
    engine: normalizeText(value.engine) || 'embedded',
    mode: normalizeText(value.mode) || null,
    schema_revision: normalizeText(value.schema_revision) || null,
    started_at: normalizeIso(value.started_at),
    checked_at: normalizeIso(value.checked_at) ?? toIsoString(new Date()),
  }
  if (typeof value.error_code === 'string' && value.error_code !== '') normalized.error_code = value.error_code
  return normalized
}

/** Public configuration summary; never contains secrets. */
function normalizeConfig(config) {
  const value = config !== null && typeof config === 'object' ? config : {}
  return {
    mode: normalizeMode(value.mode),
    data_dir: normalizeText(value.data_dir) || normalizeText(value.dataDir) || null,
    actor_did: normalizeText(value.actor_did) || normalizeText(value.actorDid) || null,
    allow_intervention_execution: value.allow_intervention_execution === true || value.allowInterventionExecution === true,
    policy: normalizePolicy(value.policy),
  }
}

/** Policy block of the public configuration. */
export function normalizePolicy(policy) {
  const value = policy !== null && typeof policy === 'object' ? policy : {}
  return {
    policy_version: normalizeText(value.policyVersion) || normalizeText(value.policy_version) || null,
    single_amount_limit: numberOrNull(value.singleAmountLimit ?? value.single_amount_limit),
    daily_amount_limit: numberOrNull(value.dailyAmountLimit ?? value.daily_amount_limit),
    risk_block_threshold: numberOrNull(value.riskBlockThreshold ?? value.risk_block_threshold),
    risk_defer_threshold: numberOrNull(value.riskDeferThreshold ?? value.risk_defer_threshold),
    risk_throttle_threshold: numberOrNull(value.riskThrottleThreshold ?? value.risk_throttle_threshold),
    default_trust_score: numberOrNull(value.defaultTrustScore ?? value.default_trust_score),
  }
}

/** Six record counters shown by the browser. */
function normalizeCounts(counts) {
  const value = counts !== null && typeof counts === 'object' ? counts : {}
  return {
    identities: countOf(value.identities),
    credentials: countOf(value.credentials),
    authorizations: countOf(value.authorizations),
    tasks: countOf(value.tasks),
    events: countOf(value.events),
    receipts: countOf(value.receipts),
  }
}

function emptyCounts() {
  return { identities: 0, credentials: 0, authorizations: 0, tasks: 0, events: 0, receipts: 0 }
}

function countOf(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : 0
}

function numberOrNull(value) {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : null
}

function normalizeVersion(version) {
  return normalizeText(version) || '0.0.0'
}

function normalizeMode(mode) {
  return normalizeText(mode) || 'embedded'
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeIso(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString()
  const text = normalizeText(value)
  return text === '' ? null : text
}

function toIsoString(value) {
  return normalizeIso(value) ?? new Date().toISOString()
}
