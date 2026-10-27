import { defineTool } from '@deepseek-ai/dsh-tools'

/**
 * Canonical output declaration shared by every tool in this plugin.
 *
 * The canonical value is lossless JSON and is rendered as pretty-printed text
 * so the model can read nested trust-engine records without adaptation.
 */
export const OUTPUT = Object.freeze({
  schema: { type: 'json' },
  render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
})

/** Marker for results produced by the embedded, in-process trust engine. */
export const EMBEDDED_SOURCE = 'embedded-engine'

/**
 * Service name under which the plugin provides the embedded trust plane.
 *
 * Tools and browser routes resolve it lazily so a reloaded engine is picked up
 * by later calls.
 */
export const TRUST_PLANE_SERVICE = 'trustPlane'

/** Failure value returned when the embedded trust plane service is missing. */
export const PLANE_UNAVAILABLE = Object.freeze({
  ok: false,
  code: 'TRUST_PLANE_UNAVAILABLE',
  message: 'the embedded trust plane is not available; reload the plugin',
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
 * Map a trust-engine `ServiceError` (or an unexpected error) to a tool value.
 *
 * Codes and messages come from the engine unchanged; the decision is `UNKNOWN`
 * for missing resources and `DEFER` for everything else, so a failed call can
 * never be mistaken for an ALLOW.
 */
export function failureFromServiceError(error) {
  const details = {
    status: typeof error?.status === 'number' ? error.status : 500,
    retryable: error?.retryable === true,
    policy_version: optionalText(error?.policyVersion) ?? null,
    evidence_refs: Array.isArray(error?.evidenceRefs) ? error.evidenceRefs : [],
    decision: error?.status === 404 ? 'UNKNOWN' : 'DEFER',
  }
  if (error?.details !== undefined) details.details = error.details
  return failed({
    code: optionalText(error?.code) ?? 'TRUST_ENGINE_ERROR',
    message: optionalText(error?.message) ?? 'trust engine request failed',
    ...details,
  })
}

/**
 * Define a tool that resolves the embedded trust plane at execution time.
 *
 * The plane is looked up lazily through `resolvePlane` so a service provided
 * later in the same fiber (or replaced during a reload) is picked up by later
 * calls.
 *
 * @param resolvePlane - zero-argument lookup returning the plane, or `undefined`.
 * @param definition - tool metadata plus `execute(plane, args, exec)`.
 */
export function engineTool(resolvePlane, { name, description, parameters, execute }) {
  return definePluginTool({
    name,
    description,
    parameters,
    async execute(args, exec) {
      const plane = resolvePlane()
      if (!plane || typeof plane !== 'object') return PLANE_UNAVAILABLE
      try {
        return await execute(plane, args ?? {}, exec)
      } catch (error) {
        return failureFromServiceError(error)
      }
    },
  })
}
