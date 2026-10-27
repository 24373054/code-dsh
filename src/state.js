/**
 * Shared plugin state for the Host half.
 *
 * Tools previously kept their caches inside factory closures, which made it
 * impossible to show a consolidated view in the browser. The state objects are
 * created once by `apply` and passed to every tool factory, so the UI route can
 * read the same records the tools write.
 *
 * The caches are never authoritative: in control-plane mode they only remember
 * identifiers and decisions returned by the service so the browser can render a
 * recent-activity overview.
 *
 * @module dsh-trust-platform/state
 */

/** How many recent operation events the overview exposes. */
const RECENT_EVENT_LIMIT = 10

/** How many operation events the in-memory cache keeps. */
const EVENT_CACHE_LIMIT = 50

/**
 * Create the state container used by the in-memory sandbox.
 *
 * @returns state with Maps for identities, credentials, authorizations, tasks
 *   and execution receipts plus an array of operation events.
 */
export function createSandboxState() {
  return {
    identities: new Map(),
    credentials: new Map(),
    authorizations: new Map(),
    tasks: new Map(),
    events: [],
    executions: new Map(),
  }
}

/**
 * Create the state container used in control-plane mode.
 *
 * Only server-returned identifiers are cached here; the caches never substitute
 * for control-plane reads.
 *
 * @returns state with Maps for identities, credentials, authorizations, tasks
 *   and execution receipts plus an array of observed operation events.
 */
export function createControlPlaneState() {
  return {
    identities: new Map(),
    credentials: new Map(),
    authorizations: new Map(),
    tasks: new Map(),
    events: [],
    executions: new Map(),
  }
}

/**
 * Append an operation event to the bounded cache used by the overview.
 *
 * @param state - state container created by either factory above.
 * @param event - raw event record from a tool result.
 */
export function cacheEvent(state, event) {
  if (!state || !Array.isArray(state.events) || event === null || typeof event !== 'object') return
  state.events.push({
    event_type: typeof event.event_type === 'string' ? event.event_type : 'UNKNOWN',
    actor_did: typeof event.actor_did === 'string' ? event.actor_did : null,
    task_id: typeof event.task_id === 'string' ? event.task_id : null,
    occurred_at:
      typeof event.occurred_at === 'string'
        ? event.occurred_at
        : typeof event.observed_at === 'string'
          ? event.observed_at
          : typeof event.created_at === 'string'
            ? event.created_at
            : null,
    decision: typeof event.decision === 'string' ? event.decision : null,
  })
  if (state.events.length > EVENT_CACHE_LIMIT) state.events.splice(0, state.events.length - EVENT_CACHE_LIMIT)
}

/**
 * Build the JSON-safe overview rendered by the browser half.
 *
 * @param options.mode - active plugin mode.
 * @param options.version - plugin package version.
 * @param options.state - state container.
 * @param options.startedAt - ISO timestamp captured when the plugin applied.
 * @param options.health - health snapshot; control-plane mode probes the service.
 * @param options.config - non-secret plugin configuration for display.
 * @param options.now - clock override for tests.
 * @returns a plain object matching the browser overview contract.
 */
export function buildOverview({ mode, version, state, startedAt, health, config, now = new Date() }) {
  const container = state ?? createSandboxState()
  const events = Array.isArray(container.events) ? container.events : []
  const authoritative = mode === 'control-plane'
  const recent = events.slice(-RECENT_EVENT_LIMIT).reverse()
  return {
    plugin: {
      name: '@sealwax/dsh-trust-platform',
      version: typeof version === 'string' && version !== '' ? version : '0.0.0',
      mode,
      source: authoritative ? 'control-plane' : 'in-memory-sandbox',
      authoritative,
      started_at: typeof startedAt === 'string' ? startedAt : null,
      config: publicConfig(config),
    },
    health: normalizeHealth(health),
    counts: {
      identities: sizeOf(container.identities),
      credentials: sizeOf(container.credentials),
      authorizations: sizeOf(container.authorizations),
      tasks: sizeOf(container.tasks),
      events: events.length,
      receipts: sizeOf(container.executions),
    },
    recent_events: recent.map((event) => ({
      event_type: event.event_type ?? 'UNKNOWN',
      actor_did: event.actor_did ?? null,
      task_id: event.task_id ?? null,
      occurred_at: event.occurred_at ?? event.observed_at ?? null,
      decision: event.decision ?? null,
    })),
    now: now instanceof Date ? now.toISOString() : String(now),
  }
}

/**
 * Reduce plugin configuration to display-safe fields.
 *
 * The bearer token is never included: the overview only reports whether one is
 * configured, so the browser can render settings without holding a secret.
 *
 * @param config - non-secret settings supplied by `apply`.
 * @returns display-safe configuration block.
 */
function publicConfig(config) {
  const source = config !== null && typeof config === 'object' ? config : {}
  return {
    base_url: typeof source.baseUrl === 'string' ? source.baseUrl : '',
    actor_did: typeof source.actorDid === 'string' ? source.actorDid : '',
    timeout_ms: Number.isFinite(source.timeoutMs) ? source.timeoutMs : 0,
    allow_intervention_execution: source.allowInterventionExecution === true,
    token_configured: source.tokenConfigured === true,
  }
}

/** Keep only shape-stable health fields so the browser never renders raw errors. */
function normalizeHealth(health) {
  if (health === null || typeof health !== 'object') return { status: 'unknown' }
  const status = typeof health.status === 'string' ? health.status : 'unknown'
  const snapshot = { status }
  if (typeof health.service === 'string') snapshot.service = health.service
  if (typeof health.environment === 'string') snapshot.environment = health.environment
  if (typeof health.schema_revision === 'string') snapshot.schema_revision = health.schema_revision
  if (typeof health.error_code === 'string') snapshot.error_code = health.error_code
  if (typeof health.checked_at === 'string') snapshot.checked_at = health.checked_at
  return snapshot
}

/** Read Map or Array sizes without trusting the container shape. */
function sizeOf(collection) {
  if (collection instanceof Map) return collection.size
  if (Array.isArray(collection)) return collection.length
  return 0
}
