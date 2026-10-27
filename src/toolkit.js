import { defineTool } from '@deepseek-ai/dsh-tools'

/**
 * Canonical output declaration shared by every tool in this plugin.
 *
 * The canonical value is lossless JSON and is rendered as pretty-printed text
 * so the model can read nested control-plane responses without adaptation.
 */
export const OUTPUT = Object.freeze({
  schema: { type: 'json' },
  render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
})

/** Marker for results that were produced by the local in-memory sandbox. */
export const SANDBOX_SOURCE = 'in-memory-sandbox'

/** Marker for results that were produced by a real control-plane call. */
export const CONTROL_PLANE_SOURCE = 'control-plane'

/**
 * Declaration for tools that cannot be answered without a control plane.
 *
 * Registered only in `control-plane` mode, where the plugin itself provides
 * the `trustPlatformClient` service.
 */
export const CLIENT_UNAVAILABLE = Object.freeze({
  ok: false,
  code: 'TRUST_CLIENT_UNAVAILABLE',
  message:
    'trustPlatformClient is not available; the plugin must be loaded with mode "control-plane"',
  decision: 'DEFER',
})

/** Wrap one tool definition with the shared output declaration. */
export function definePluginTool(definition) {
  return defineTool({ output: OUTPUT, ...definition })
}

/** Trimmed string value, or the empty string for non-strings. */
export function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/** Trimmed non-empty string value, or `undefined`. */
export function optionalText(value) {
  const trimmed = text(value)
  return trimmed === '' ? undefined : trimmed
}

/** Finite number value, or `null` when the value is not numeric. */
export function finiteNumber(value) {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : null
}

/** Lossless JSON object value, or `undefined`. Arrays are not accepted. */
export function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : undefined
}

/** Time-ordered unique identifier used for local sandbox records. */
export function uniqueId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`
}

/** Canonical success value: `{ ok: true, ...data }`. */
export function succeeded(data = {}) {
  return { ok: true, ...data }
}

/**
 * Canonical failure value.
 *
 * `decision` defaults to `DEFER` so a failed call can never be mistaken for an
 * authorization result. `details` may override `decision` explicitly.
 */
export function failed({ code, message, decision = 'DEFER', ...details }) {
  return { ok: false, code, message, decision, ...details }
}

/**
 * Map a client failure (HTTP, transport, timeout, validation) to a tool value.
 *
 * Codes and messages come from the control plane unchanged; the decision is
 * `UNKNOWN` for missing resources and `DEFER` for everything else.
 */
export function failureFromControlPlane(error) {
  const details = {
    status: typeof error?.status === 'number' ? error.status : 0,
    request_id: optionalText(error?.requestId) ?? null,
    retryable: error?.retryable === true,
    policy_version: optionalText(error?.policyVersion) ?? null,
    evidence_refs: Array.isArray(error?.evidenceRefs) ? error.evidenceRefs : [],
    decision: error?.status === 404 ? 'UNKNOWN' : 'DEFER',
  }
  if (Array.isArray(error?.details) && error.details.length > 0) {
    details.validation = error.details
  }
  return failed({
    code: optionalText(error?.code) ?? 'TRUST_CONTROL_PLANE_ERROR',
    message: optionalText(error?.message) ?? 'control plane request failed',
    ...details,
  })
}

/**
 * Define a tool that resolves the control-plane client at execution time.
 *
 * The client is looked up lazily through `resolveClient` so a service provided
 * after plugin load (or replaced during a reload) is picked up by later calls.
 *
 * @param resolveClient - zero-argument lookup returning the client, or `undefined`.
 * @param definition - tool metadata plus `execute(client, args, exec)`.
 */
export function controlPlaneTool(resolveClient, { name, description, parameters, execute }) {
  return definePluginTool({
    name,
    description,
    parameters,
    async execute(args, exec) {
      const client = resolveClient()
      if (!client || typeof client.request !== 'function') return CLIENT_UNAVAILABLE
      try {
        return await execute(client, args, exec)
      } catch (error) {
        return failureFromControlPlane(error)
      }
    },
  })
}
