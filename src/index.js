/**
 * DSH plugin: trust-platform tools with an in-memory sandbox and an
 * optional authoritative control-plane backend.
 *
 * The default mode registers a deterministic in-memory sandbox so tools exist
 * without any service. `mode: control-plane` replaces those sandbox tools with
 * authoritative tools backed by the legacy FastAPI control plane and provides a
 * `trustPlatformClient` service for other plugins.
 *
 * @module @00ccf/dsh-trust-platform
 */

import Schema from '@deepseek-ai/schemastery'

import { createControlPlaneClient, validateBaseUrl } from './control-plane-client.js'
import { createControlPlaneTools } from './control-plane-tools.js'
import { createInMemoryTools } from './in-memory-tools.js'
import { createRemoteTools } from './remote-tools.js'

/** Plugin name registered with Cordis. */
export const name = 'dsh-trust-platform'

/** The plugin contributes tools only. */
export const inject = ['tools']

const MODES = ['in-memory', 'control-plane']

/**
 * Plugin configuration.
 *
 * Cordis validates this schema before `apply` runs and fills every default, so
 * deployments only need to set the fields they change.
 */
export const Config = Schema.object({
  mode: Schema.union(MODES)
    .default('in-memory')
    .description(
      'Backend mode: "in-memory" is a deterministic non-authoritative sandbox; ' +
        '"control-plane" calls the real FastAPI trust control plane.',
    ),
  baseUrl: Schema.string()
    .default('')
    .description('Required in control-plane mode: absolute base URL, e.g. http://127.0.0.1:8080.'),
  token: Schema.string()
    .role('secret')
    .default('')
    .description('Optional bearer token. The development server ignores it; production requires a JWT.'),
  actorDid: Schema.string()
    .default('')
    .description('Optional X-Actor-DID sent on control-plane requests. Leave empty to use the service default actor.'),
  timeoutMs: Schema.number()
    .default(30000)
    .description('Per-request timeout in milliseconds.'),
  allowInterventionExecution: Schema.boolean()
    .default(false)
    .description(
      'Control-plane mode only: register execute_intervention, which executes intervention decisions ' +
        'and may reserve quota. Disabled by default.',
    ),
})

/**
 * Register the configured tool set.
 *
 * @param ctx - Cordis context with the `tools` service.
 * @param config - validated configuration (defaults are filled by Cordis).
 */
export function apply(ctx, config) {
  const settings = normalizeConfig(config)

  if (settings.mode === 'control-plane') {
    const client = createControlPlaneClient({
      baseUrl: settings.baseUrl,
      token: settings.token,
      actorDid: settings.actorDid,
      timeoutMs: settings.timeoutMs,
    })
    ctx.provide('trustPlatformClient', client)
    // Resolve lazily on every call: reloads can replace the service, and tools
    // must never hold a stale client from apply time.
    const resolveClient = () => ctx.get('trustPlatformClient')
    for (const definition of createControlPlaneTools({
      resolveClient,
      config: settings,
      allowInterventionExecution: settings.allowInterventionExecution,
    })) {
      ctx.tools.register(definition)
    }
    for (const definition of createRemoteTools({ resolveClient, config: settings })) {
      ctx.tools.register(definition)
    }
    return
  }

  if (settings.mode !== 'in-memory') {
    throw new Error(`[dsh-trust-platform] unknown mode "${settings.mode}"; expected one of: ${MODES.join(', ')}`)
  }
  if (settings.allowInterventionExecution) {
    throw new Error(
      '[dsh-trust-platform] allowInterventionExecution requires mode "control-plane"; ' +
        'the in-memory sandbox has no intervention execution endpoint',
    )
  }
  for (const definition of createInMemoryTools()) ctx.tools.register(definition)
}

/**
 * Apply schema defaults defensively when `apply` is called directly (tests,
 * embedders) instead of through Cordis' schema validation.
 */
function normalizeConfig(config) {
  const raw = config !== null && typeof config === 'object' ? config : {}
  const withDefaults = {
    mode: raw.mode ?? 'in-memory',
    baseUrl: raw.baseUrl ?? '',
    token: raw.token ?? '',
    actorDid: raw.actorDid ?? '',
    timeoutMs: raw.timeoutMs ?? 30000,
    allowInterventionExecution: raw.allowInterventionExecution ?? false,
  }
  if (withDefaults.mode === 'control-plane') {
    // Throws the actionable baseUrl error before any client is constructed.
    withDefaults.baseUrl = validateBaseUrl(withDefaults.baseUrl)
  }
  return withDefaults
}
