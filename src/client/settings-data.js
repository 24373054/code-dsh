/**
 * Trust-platform settings transport and form model.
 *
 * The settings page edits the embedded engine's runtime settings through three
 * same-origin routes served by the Host half:
 *
 * - `GET /trust-platform/api/settings` returns the current settings, the
 *   startup defaults and which fields the Host allows to edit;
 * - `PUT /trust-platform/api/settings` applies a JSON patch;
 * - `POST /trust-platform/api/reset` deletes engine records, keeping settings.
 *
 * Everything here is pure JavaScript: normalizers tolerate a partially shaped
 * payload, requests turn every transport failure into a typed error, and the
 * draft helpers decide what to send without touching React. The polling hook
 * lives in `settings-store.js` so this module stays importable by the offline
 * tests without the React baseline.
 */
import { COUNT_KEYS } from './format.js'

/** Same-origin route returning the editable runtime settings. */
export const SETTINGS_URL = '/trust-platform/api/settings'

/** Same-origin route returning the embedded engine health snapshot. */
export const HEALTH_URL = '/trust-platform/api/health'

/** Same-origin route deleting engine records after explicit confirmation. */
export const RESET_URL = '/trust-platform/api/reset'

/** Upper bound the engine accepts for a single amount field. */
export const MAX_AMOUNT = 1000000000000

/** Six policy numbers plus the text fields; order drives the form layout. */
export const POLICY_NUMBER_FIELDS = Object.freeze([
  'singleAmountLimit',
  'dailyAmountLimit',
  'riskBlockThreshold',
  'riskDeferThreshold',
  'riskThrottleThreshold',
  'defaultTrustScore'
])

/** Amount fields accept arbitrary positive integers; the rest are ratios. */
const AMOUNT_FIELDS = Object.freeze(['singleAmountLimit', 'dailyAmountLimit'])
const RATIO_FIELDS = Object.freeze([
  'riskBlockThreshold',
  'riskDeferThreshold',
  'riskThrottleThreshold',
  'defaultTrustScore'
])

/** True for a plain non-array object. */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** True for a non-empty string. */
function isNonEmptyString(value) {
  return typeof value === 'string' && value !== ''
}

/** Describe an unreachable transport without assuming an Error instance. */
function errorMessage(error) {
  if (error && typeof error === 'object') {
    if (typeof error.message === 'string' && error.message) return error.message
    return String(error)
  }
  return String(error)
}

/**
 * Fetch one JSON envelope with the shared request semantics.
 *
 * @param {string} url same-origin route.
 * @param {{ method?: string, body?: string }} options request extras.
 * @param {AbortSignal | undefined} signal
 * @returns {Promise<
 *   { data: Record<string, unknown> } |
 *   { aborted: true } |
 *   { error: {
 *     kind: 'unavailable' | 'forbidden' | 'invalid' | 'validation' | 'http' | 'network' | 'host',
 *     status?: number, code?: string, message?: string, details?: unknown
 *   } }
 * >}
 */
async function requestJson(url, options, signal) {
  if (typeof fetch !== 'function') return { error: { kind: 'unavailable' } }

  const headers = { accept: 'application/json' }
  if (options && options.body) headers['content-type'] = 'application/json'

  let response
  try {
    response = await fetch(url, {
      method: options && options.method ? options.method : 'GET',
      credentials: 'same-origin',
      headers,
      body: options && options.body ? options.body : undefined,
      signal: signal || undefined
    })
  } catch (error) {
    if (error && (error.name === 'AbortError' || error.code === 'ABORT_ERR')) return { aborted: true }
    return { error: { kind: 'network', message: errorMessage(error) } }
  }

  if (response.status === 401 || response.status === 403) return { error: { kind: 'forbidden' } }
  if (response.status === 404) return { error: { kind: 'unavailable' } }

  let body = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (response.status === 422) {
    const envelope = isObject(body) ? body : {}
    return {
      error: {
        kind: 'validation',
        message: typeof envelope.message === 'string' ? envelope.message : '',
        details: envelope.details === undefined ? null : envelope.details
      }
    }
  }
  if (!response.ok) return { error: { kind: 'http', status: response.status } }
  if (!isObject(body) || body.ok !== true) {
    return {
      error: {
        kind: 'host',
        code: isObject(body) && typeof body.error_code === 'string' ? body.error_code : 'UNKNOWN',
        message: isObject(body) && typeof body.message === 'string' ? body.message : ''
      }
    }
  }
  return { data: body }
}

/**
 * Project one policy block; missing or malformed fields become `null` so the
 * form can show a placeholder instead of inventing a value.
 *
 * @param {unknown} raw
 * @returns {{
 *   policyVersion: string | null,
 *   singleAmountLimit: number | null,
 *   dailyAmountLimit: number | null,
 *   riskBlockThreshold: number | null,
 *   riskDeferThreshold: number | null,
 *   riskThrottleThreshold: number | null,
 *   defaultTrustScore: number | null,
 * }}
 */
export function normalizePolicy(raw) {
  const policy = isObject(raw) ? raw : {}
  const result = { policyVersion: isNonEmptyString(policy.policyVersion) ? policy.policyVersion : null }
  for (const field of POLICY_NUMBER_FIELDS) {
    result[field] = typeof policy[field] === 'number' && Number.isFinite(policy[field]) ? policy[field] : null
  }
  return result
}

/**
 * Project one settings block.
 *
 * @param {unknown} raw
 * @returns {{
 *   actorDid: string | null,
 *   allowInterventionExecution: boolean | null,
 *   policy: ReturnType<typeof normalizePolicy>,
 * }}
 */
export function normalizeSettings(raw) {
  const settings = isObject(raw) ? raw : {}
  return {
    actorDid: isNonEmptyString(settings.actorDid) ? settings.actorDid : null,
    allowInterventionExecution: typeof settings.allowInterventionExecution === 'boolean'
      ? settings.allowInterventionExecution
      : null,
    policy: normalizePolicy(settings.policy)
  }
}

/**
 * Project which fields the Host lets this session edit. A missing flag means
 * editable (the documented contract reports `true` explicitly), an explicit
 * `false` locks the control.
 *
 * @param {unknown} raw
 * @returns {{
 *   actorDid: boolean,
 *   allowInterventionExecution: boolean,
 *   policy: Record<string, boolean>,
 * }}
 */
export function normalizeEditable(raw) {
  const editable = isObject(raw) ? raw : {}
  const policy = isObject(editable.policy) ? editable.policy : {}
  const editablePolicy = {}
  for (const field of POLICY_NUMBER_FIELDS) {
    editablePolicy[field] = policy[field] !== false
  }
  editablePolicy.policyVersion = policy.policyVersion !== false
  return {
    actorDid: editable.actorDid !== false,
    allowInterventionExecution: editable.allowInterventionExecution !== false,
    policy: editablePolicy
  }
}

/**
 * Project one settings response body.
 *
 * @param {unknown} body parsed JSON envelope (`ok: true`).
 * @returns {{
 *   mode: string | null,
 *   dataDir: string | null,
 *   settings: ReturnType<typeof normalizeSettings>,
 *   defaults: ReturnType<typeof normalizeSettings>,
 *   editable: ReturnType<typeof normalizeEditable>,
 * } | null} null when the envelope is not an object.
 */
export function normalizeSettingsPayload(body) {
  if (!isObject(body)) return null
  return {
    mode: isNonEmptyString(body.mode) ? body.mode : null,
    dataDir: isNonEmptyString(body.dataDir) ? body.dataDir : null,
    settings: normalizeSettings(body.settings),
    defaults: normalizeSettings(body.defaults),
    editable: normalizeEditable(body.editable)
  }
}

/**
 * Project one health response body.
 *
 * @param {unknown} body parsed JSON envelope.
 * @returns {{
 *   status: string | null,
 *   mode: string | null,
 *   engine: string | null,
 *   schemaRevision: string | null,
 *   startedAt: string | null,
 * } | null}
 */
export function normalizeHealthPayload(body) {
  if (!isObject(body)) return null
  return {
    status: isNonEmptyString(body.status) ? body.status : null,
    mode: isNonEmptyString(body.mode) ? body.mode : null,
    engine: isNonEmptyString(body.engine) ? body.engine : null,
    schemaRevision: isNonEmptyString(body.schema_revision) ? body.schema_revision : null,
    startedAt: isNonEmptyString(body.started_at) ? body.started_at : null
  }
}

/**
 * Project the counter block returned after a reset.
 *
 * @param {unknown} counts
 * @returns {Record<string, number | null>}
 */
export function normalizeCounts(counts) {
  const source = isObject(counts) ? counts : {}
  const result = {}
  for (const key of COUNT_KEYS) {
    result[key] = typeof source[key] === 'number' && Number.isFinite(source[key]) ? source[key] : null
  }
  return result
}

/**
 * Fetch the editable runtime settings.
 *
 * @param {AbortSignal | undefined} signal
 */
export async function requestSettings(signal) {
  const outcome = await requestJson(SETTINGS_URL, { method: 'GET' }, signal)
  if (!outcome.data) return outcome
  const data = normalizeSettingsPayload(outcome.data)
  return data ? { data } : { error: { kind: 'invalid' } }
}

/**
 * Fetch the embedded engine health snapshot.
 *
 * @param {AbortSignal | undefined} signal
 */
export async function requestHealth(signal) {
  const outcome = await requestJson(HEALTH_URL, { method: 'GET' }, signal)
  if (!outcome.data) return outcome
  const data = normalizeHealthPayload(outcome.data)
  return data ? { data } : { error: { kind: 'invalid' } }
}

/**
 * Apply a settings patch. The payload only carries changed fields.
 *
 * @param {Record<string, unknown>} patch
 * @param {AbortSignal | undefined} signal
 * @returns {Promise<
 *   { data: { settings: ReturnType<typeof normalizeSettings>, savedAt: string | null } } |
 *   { aborted: true } |
 *   { error: object }
 * >}
 */
export async function saveSettings(patch, signal) {
  const outcome = await requestJson(
    SETTINGS_URL,
    { method: 'PUT', body: JSON.stringify(patch && typeof patch === 'object' ? patch : {}) },
    signal
  )
  if (!outcome.data) return outcome
  const body = outcome.data
  if (!isObject(body.settings)) return { error: { kind: 'invalid' } }
  return {
    data: {
      settings: normalizeSettings(body.settings),
      savedAt: isNonEmptyString(body.saved_at) ? body.saved_at : null
    }
  }
}

/**
 * Delete embedded engine records. The caller confirms first; the route still
 * requires the explicit `confirm: true` body.
 *
 * @param {AbortSignal | undefined} signal
 * @returns {Promise<
 *   { data: { counts: ReturnType<typeof normalizeCounts> } } |
 *   { aborted: true } |
 *   { error: object }
 * >}
 */
export async function resetEngineData(signal) {
  const outcome = await requestJson(
    RESET_URL,
    { method: 'POST', body: JSON.stringify({ confirm: true }) },
    signal
  )
  if (!outcome.data) return outcome
  return { data: { counts: normalizeCounts(outcome.data.counts) } }
}

/**
 * Build an editable draft from normalized settings. Numeric inputs keep raw
 * strings so partial typing (`1.`, `0.`) never gets rewritten mid-edit.
 *
 * @param {ReturnType<typeof normalizeSettings>} settings
 * @returns {Record<string, string | boolean> | null}
 */
export function createDraft(settings) {
  if (!isObject(settings)) return null
  const policy = isObject(settings.policy) ? settings.policy : {}
  const draft = {
    actorDid: isNonEmptyString(settings.actorDid) ? settings.actorDid : '',
    allowInterventionExecution: settings.allowInterventionExecution === true,
    policyVersion: isNonEmptyString(policy.policyVersion) ? policy.policyVersion : ''
  }
  for (const field of POLICY_NUMBER_FIELDS) {
    draft[field] = typeof policy[field] === 'number' && Number.isFinite(policy[field]) ? String(policy[field]) : ''
  }
  return draft
}

/**
 * Build the PUT patch containing only fields that differ from the saved
 * settings. Returns null when nothing changed or a numeric draft cannot be
 * interpreted as a finite number (the validator reports that case first).
 *
 * @param {Record<string, unknown> | null} draft
 * @param {ReturnType<typeof normalizeSettings>} saved
 * @returns {Record<string, unknown> | null}
 */
export function buildSettingsPatch(draft, saved) {
  if (!isObject(draft) || !isObject(saved)) return null
  const patch = {}

  const actorDid = typeof draft.actorDid === 'string' ? draft.actorDid.trim() : ''
  if (actorDid !== (isNonEmptyString(saved.actorDid) ? saved.actorDid : '')) {
    patch.actorDid = actorDid
  }
  const allow = draft.allowInterventionExecution === true
  if (allow !== (saved.allowInterventionExecution === true)) {
    patch.allowInterventionExecution = allow
  }

  const policy = {}
  const policyVersion = typeof draft.policyVersion === 'string' ? draft.policyVersion.trim() : ''
  if (policyVersion !== (isNonEmptyString(saved.policy.policyVersion) ? saved.policy.policyVersion : '')) {
    policy.policyVersion = policyVersion
  }
  for (const field of POLICY_NUMBER_FIELDS) {
    const value = Number(draft[field])
    if (!Number.isFinite(value)) return null
    if (value !== saved.policy[field]) policy[field] = value
  }
  if (Object.keys(policy).length > 0) patch.policy = policy

  return Object.keys(patch).length > 0 ? patch : null
}

/**
 * Validate a draft against the engine's documented ranges. Returns dictionary
 * keys (with the field name as a parameter), so the component localizes them
 * through `translate`; an empty array means the draft is safe to send.
 *
 * @param {Record<string, unknown> | null} draft
 * @returns {Array<{ key: string, params?: Record<string, unknown> }>}
 */
export function validateDraft(draft) {
  if (!isObject(draft)) return [{ key: 'settings.error.invalidDraft' }]
  const errors = []

  const actorDid = typeof draft.actorDid === 'string' ? draft.actorDid.trim() : ''
  if (actorDid.length < 3 || actorDid.length > 200) errors.push({ key: 'settings.error.actorDid' })

  const policyVersion = typeof draft.policyVersion === 'string' ? draft.policyVersion.trim() : ''
  if (policyVersion.length < 3 || policyVersion.length > 120) errors.push({ key: 'settings.error.policyVersion' })

  const values = {}
  for (const field of POLICY_NUMBER_FIELDS) {
    const raw = draft[field]
    const value = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN
    if (!Number.isFinite(value)) {
      errors.push({ key: 'settings.error.number', params: { field } })
      continue
    }
    values[field] = value
    if (AMOUNT_FIELDS.includes(field) && (value <= 0 || value > MAX_AMOUNT)) {
      errors.push({ key: 'settings.error.amount', params: { field } })
    } else if (RATIO_FIELDS.includes(field) && (value < 0 || value > 1)) {
      errors.push({ key: 'settings.error.ratio', params: { field } })
    }
  }

  const block = values.riskBlockThreshold
  const defer = values.riskDeferThreshold
  const throttle = values.riskThrottleThreshold
  if (
    Number.isFinite(block) && Number.isFinite(defer) && Number.isFinite(throttle)
    && !(block >= defer && defer >= throttle)
  ) {
    errors.push({ key: 'settings.error.thresholds' })
  }

  return errors
}

/**
 * Whether a draft differs from the saved settings, mirroring the patch logic
 * without exposing a partial patch.
 *
 * @param {Record<string, unknown> | null} draft
 * @param {ReturnType<typeof normalizeSettings>} saved
 */
export function isDraftDirty(draft, saved) {
  return buildSettingsPatch(draft, saved) !== null
}

/**
 * Total record count of a reset counts block, for the reset confirmation copy.
 *
 * @param {Record<string, number | null>} counts
 */
export function totalCount(counts) {
  let total = 0
  for (const key of COUNT_KEYS) {
    const value = counts && typeof counts[key] === 'number' ? counts[key] : 0
    total += value
  }
  return total
}

/**
 * Render server validation details as one short, localized-safe string.
 *
 * @param {unknown} details
 * @returns {string | null}
 */
export function describeDetails(details) {
  if (details === null || details === undefined) return null
  if (typeof details === 'string') return details
  try {
    const text = JSON.stringify(details)
    if (typeof text !== 'string') return null
    return text.length > 200 ? `${text.slice(0, 197)}…` : text
  } catch {
    return null
  }
}
