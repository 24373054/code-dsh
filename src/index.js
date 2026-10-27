/**
 * DSH plugin: an embedded cross-border identity and payment-trust plane.
 *
 * The whole trust plane runs inside the plugin process. Tools and the browser
 * settings panel talk to the same in-process engine, which owns identity,
 * credential, delegation, payment-task, operation-event, risk, evidence and
 * governance records and persists them under `$DSH_HOME/plugin-data`.
 *
 * There is no sidecar service, no HTTP control plane and no listening port.
 * The plugin never moves funds and never settles value.
 *
 * @module @sealwax/dsh-trust-platform
 */

import Schema from '@deepseek-ai/schemastery'

import { createRequire } from 'node:module'

import { createTrustPlane } from './engine/index.js'
import { DEFAULT_POLICY, FileStore, MemoryStore, defaultDataDir, nowIso } from './engine/core.js'
import { createEngineTools } from './engine-tools.js'
import { buildOverview } from './state.js'
import { TRUST_PLANE_SERVICE } from './toolkit.js'
import { registerUiRoute } from './ui-route.js'

/** Plugin version surfaced by the browser half; read once when the module loads. */
const PLUGIN_VERSION = readPluginVersion()

/** Plugin name registered with Cordis. */
export const name = 'dsh-trust-platform'

/** The plugin contributes tools; the browser half is injected optionally. */
export const inject = ['tools']

/** Supported persistence modes. */
const MODES = ['embedded', 'sandbox']

/**
 * Plugin configuration.
 *
 * Cordis validates this schema before `apply` runs and fills every default, so
 * deployments only need to set the fields they change. Runtime-editable values
 * (actor DID, intervention gate, policy thresholds) can also be changed from the
 * DSH Settings panel and are persisted with the engine state.
 */
export const Config = Schema.object({
  mode: Schema.union(MODES)
    .default('embedded')
    .description(
      'Persistence mode: "embedded" keeps the trust plane state on disk under ' +
        '$DSH_HOME/plugin-data/dsh-trust-platform; "sandbox" keeps it in memory only.',
    ),
  dataDir: Schema.string()
    .default('')
    .description(
      'Optional state directory for embedded mode. Empty uses $DSH_HOME/plugin-data/dsh-trust-platform.',
    ),
  actorDid: Schema.string()
    .default('system:dsh-web')
    .description('Default actor DID recorded on writes. Editable in the settings panel.'),
  allowInterventionExecution: Schema.boolean()
    .default(false)
    .description(
      'Allow execute_intervention to record an execution receipt. Records only; never transfers funds.',
    ),
  policy: Schema.object({
    policyVersion: Schema.string()
      .default(DEFAULT_POLICY.policyVersion)
      .description('Policy version stamped on decisions and evidence.'),
    singleAmountLimit: Schema.number()
      .default(DEFAULT_POLICY.singleAmountLimit)
      .description('Single-payment amount ceiling used by admission and authorization checks.'),
    dailyAmountLimit: Schema.number()
      .default(DEFAULT_POLICY.dailyAmountLimit)
      .description('Daily amount ceiling used by admission and authorization checks.'),
    riskBlockThreshold: Schema.number().default(DEFAULT_POLICY.riskBlockThreshold).description('BLOCK at or above this risk score.'),
    riskDeferThreshold: Schema.number().default(DEFAULT_POLICY.riskDeferThreshold).description('DEFER at or above this risk score.'),
    riskThrottleThreshold: Schema.number()
      .default(DEFAULT_POLICY.riskThrottleThreshold)
      .description('THROTTLE at or above this risk score.'),
    defaultTrustScore: Schema.number()
      .default(DEFAULT_POLICY.defaultTrustScore)
      .description('Trust score assigned to a freshly registered identity.'),
  })
    .default({})
    .description('Deterministic policy thresholds. Editable in the settings panel.'),
})

/**
 * Start the embedded trust plane and register its tools and browser API.
 *
 * @param ctx - Cordis context with the `tools` service.
 * @param config - validated configuration (defaults are filled by Cordis).
 */
export function apply(ctx, config) {
  const settings = normalizeConfig(config)
  const startedAt = new Date().toISOString()
  const dataDir = settings.dataDir === '' ? defaultDataDir() : settings.dataDir
  const store = settings.mode === 'sandbox' ? new MemoryStore() : new FileStore(dataDir)
  const plane = createTrustPlane({
    settings: {
      actorDid: settings.actorDid,
      allowInterventionExecution: settings.allowInterventionExecution,
      policy: settings.policy,
    },
    store,
    logger: ctx?.logger ?? null,
    mode: settings.mode,
    startedAt,
  })
  ctx.provide(TRUST_PLANE_SERVICE, plane)
  // Persist pending state when the plugin is disposed or reloaded.
  if (typeof ctx.effect === 'function') {
    ctx.effect(
      () => () => {
        try {
          plane.flush()
        } catch {
          // Best effort: shutdown must never fail because of a write error.
        }
      },
      'trust-platform: flush embedded state',
    )
  }
  // Resolve the plane lazily on every call: a reload replaces the service and a
  // tool must never hold a stale engine captured at apply time.
  const resolvePlane = () => ctx.get(TRUST_PLANE_SERVICE)
  const toolOptions = { allowInterventionExecution: settings.allowInterventionExecution }
  for (const definition of createEngineTools(resolvePlane, toolOptions)) ctx.tools.register(definition)
  registerUiRoute(ctx, {
    getOverview: () => buildOverview({ plane, version: PLUGIN_VERSION, mode: settings.mode, startedAt, health: healthOf(plane, settings, startedAt), config: publicConfig(plane, store, settings) }),
    getHealth: () => ({ ...healthOf(plane, settings, startedAt) }),
    getSettings: () => ({
      ...plane.settingsSnapshot(),
      dataDir: store.dataDir ?? null,
      data_dir: store.dataDir ?? null,
      editable: true,
    }),
    updateSettings: (patch) => plane.updateSettings(patch),
    reset: () => plane.reset(),
    // Local data management for the settings page: describe where records live
    // and export a portable JSON snapshot (same content as the state file).
    storageInfo: () => store.describe(),
    exportState: () => ({
      exported_at: nowIso(),
      version: PLUGIN_VERSION,
      schema_version: plane.engine.state.schema_version,
      state: plane.engine.state,
    }),
  })
}

/** Health document including the current persistence mode and data directory. */
function healthOf(plane, settings, startedAt) {
  return {
    ...plane.health(),
    mode: settings.mode,
    started_at: startedAt,
    checked_at: new Date().toISOString(),
  }
}

/**
 * Reduce configuration to display-safe fields for the browser half.
 */
function publicConfig(plane, store, settings) {
  const live = plane.settingsSnapshot().settings
  return {
    mode: settings.mode,
    data_dir: store.dataDir ?? null,
    actor_did: live.actorDid,
    allow_intervention_execution: live.allowInterventionExecution,
    policy: live.policy,
  }
}

/**
 * Apply schema defaults defensively when `apply` is called directly (tests,
 * embedders) instead of through Cordis' schema validation.
 */
function normalizeConfig(config) {
  const raw = config !== null && typeof config === 'object' ? config : {}
  const mode = typeof raw.mode === 'string' && raw.mode !== '' ? raw.mode : 'embedded'
  if (!MODES.includes(mode)) {
    throw new Error(`[dsh-trust-platform] unknown mode "${mode}"; expected one of: ${MODES.join(', ')}`)
  }
  const policy = normalizePolicyConfig(raw.policy)
  return {
    mode,
    dataDir: typeof raw.dataDir === 'string' ? raw.dataDir.trim() : '',
    actorDid: nonEmptyString(raw.actorDid ?? raw.actor_did, 'system:dsh-web'),
    allowInterventionExecution: raw.allowInterventionExecution === true,
    policy,
  }
}

/** Merge the configured policy block over the deterministic defaults. */
function normalizePolicyConfig(policy) {
  const raw = policy !== null && typeof policy === 'object' ? policy : {}
  return {
    policyVersion: nonEmptyString(raw.policyVersion ?? raw.policy_version, DEFAULT_POLICY.policyVersion),
    singleAmountLimit: finiteOr(raw.singleAmountLimit ?? raw.single_amount_limit, DEFAULT_POLICY.singleAmountLimit),
    dailyAmountLimit: finiteOr(raw.dailyAmountLimit ?? raw.daily_amount_limit, DEFAULT_POLICY.dailyAmountLimit),
    riskBlockThreshold: finiteOr(raw.riskBlockThreshold ?? raw.risk_block_threshold, DEFAULT_POLICY.riskBlockThreshold),
    riskDeferThreshold: finiteOr(raw.riskDeferThreshold ?? raw.risk_defer_threshold, DEFAULT_POLICY.riskDeferThreshold),
    riskThrottleThreshold: finiteOr(
      raw.riskThrottleThreshold ?? raw.risk_throttle_threshold,
      DEFAULT_POLICY.riskThrottleThreshold,
    ),
    defaultTrustScore: finiteOr(raw.defaultTrustScore ?? raw.default_trust_score, DEFAULT_POLICY.defaultTrustScore),
  }
}

function nonEmptyString(value, fallback) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback
}

function finiteOr(value, fallback) {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : fallback
}

/**
 * Read this package's version without a JSON import assertion.
 *
 * @returns the version string, or "0.0.0" when the manifest cannot be read.
 */
function readPluginVersion() {
  try {
    const require = createRequire(import.meta.url)
    const manifest = require('../package.json')
    return typeof manifest?.version === 'string' ? manifest.version : '0.0.0'
  } catch {
    return '0.0.0'
  }
}
