/**
 * Pure formatting helpers for the trust-platform browser half.
 *
 * The host half renders every tool result as one text block holding the
 * pretty-printed JSON of the canonical value (`{ ok, code, message, decision,
 * ... }`), so card rendering is a parse plus a few defensive projections. Every
 * helper here is side-effect free and never throws on malformed input: the
 * browser half must keep rendering when a host or a future toolkit changes the
 * payload shape.
 */
import { en } from './locales.js'

/** Full package name the plugin manager's `subject` must name. */
export const PLUGIN_ID = '@sealwax/dsh-trust-platform'

/** Count cells rendered by the overview panel, in display order. */
export const COUNT_KEYS = Object.freeze([
  'identities',
  'credentials',
  'authorizations',
  'tasks',
  'events',
  'receipts'
])

/** Upper bound for the one-line summary so a card never grows a wall of text. */
const SUMMARY_LIMIT = 160

/** @param {unknown} value */
function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** @param {unknown} value */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0
}

/** Truncate one line to the summary budget. */
function truncate(text) {
  const line = String(text).split('\n').find((entry) => entry.trim().length > 0) || ''
  const trimmed = line.trim()
  return trimmed.length > SUMMARY_LIMIT ? `${trimmed.slice(0, SUMMARY_LIMIT - 1)}…` : trimmed
}

/** Replace `{name}` placeholders with stringified parameters. */
function interpolate(template, params) {
  if (!params || typeof params !== 'object') return template
  return template.replace(/\{(\w+)\}/g, (match, name) => (
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
  ))
}

/**
 * Translate a dictionary key, falling back to the bundled English copy when the
 * locale seat is missing, throws, or reports the key as untranslated.
 *
 * @param {((key: string, params?: Record<string, unknown>) => string) | undefined} t
 * @param {string} key
 * @param {Record<string, unknown>} [params]
 */
export function translate(t, key, params) {
  let value
  if (typeof t === 'function') {
    try {
      value = t(key, params)
    } catch {
      value = undefined
    }
  }
  if (typeof value !== 'string' || value === '' || value === key) {
    value = typeof en[key] === 'string' ? en[key] : key
  }
  return interpolate(value, params)
}

/** True when the bundled dictionaries know the key. */
export function hasCopy(key) {
  return typeof en[key] === 'string'
}

/**
 * Concatenate the text blocks of a tool result.
 *
 * @param {{ content?: unknown } | null | undefined} block
 * @returns {string}
 */
export function resultText(block) {
  if (!block || !Array.isArray(block.content)) return ''
  const parts = []
  for (const entry of block.content) {
    if (entry && entry.type === 'text' && isNonEmptyString(entry.text)) parts.push(entry.text)
  }
  return parts.join('\n').trim()
}

/**
 * Parse the JSON payload of a result block. `parsed` is false when the host
 * returned plain text instead of the canonical JSON envelope.
 *
 * @param {{ content?: unknown } | null | undefined} block
 * @returns {{ text: string, parsed: boolean, value: unknown }}
 */
export function parsePayload(block) {
  const text = resultText(block)
  if (!text) return { text: '', parsed: false, value: undefined }
  try {
    return { text, parsed: true, value: JSON.parse(text) }
  } catch {
    return { text, parsed: false, value: undefined }
  }
}

/**
 * Card status: `running` until the result arrives, then the payload's own
 * `ok` flag or the transport error flag decides between `ok` and `failed`.
 *
 * @param {'preparing' | 'start' | 'result' | string} phase
 * @param {Record<string, unknown> | null | undefined} block
 * @returns {'running' | 'ok' | 'failed'}
 */
export function toolState(phase, block) {
  if (phase !== 'result' || !block) return 'running'
  const { parsed, value } = parsePayload(block)
  if (parsed && isObject(value) && value.ok === false) return 'failed'
  if (block.isError === true) return 'failed'
  return 'ok'
}

/**
 * One-line summary: protocol code and/or message when present, the raw text
 * when the payload is not JSON, and a localized placeholder otherwise.
 *
 * @param {Record<string, unknown> | null | undefined} block
 * @param {((key: string, params?: Record<string, unknown>) => string) | undefined} t
 */
export function resultSummary(block, t) {
  const { text, parsed, value } = parsePayload(block)
  if (parsed && isObject(value)) {
    const code = isNonEmptyString(value.code) ? value.code : null
    const message = isNonEmptyString(value.message) ? value.message : null
    if (code && message) return truncate(`${code} · ${message}`)
    if (code) return truncate(code)
    if (message) return truncate(message)
    if (isNonEmptyString(value.decision)) return truncate(value.decision)
    if (value.ok === true) return translate(t, 'status.ok')
    return translate(t, 'result.empty')
  }
  if (parsed) return truncate(JSON.stringify(value))
  if (text) return truncate(text)
  if (block && block.isError === true && isObject(block.error)) {
    const name = isNonEmptyString(block.error.name) ? block.error.name : 'Error'
    const code = isNonEmptyString(block.error.code) ? block.error.code : 'UNKNOWN'
    return translate(t, 'card.errorDetail', { message: `${name}: ${code}` })
  }
  return translate(t, 'result.empty')
}

/**
 * Decision carried by the canonical payload, when the host reported one.
 *
 * @param {Record<string, unknown> | null | undefined} block
 * @returns {string | null}
 */
export function toolDecision(block) {
  const { parsed, value } = parsePayload(block)
  if (!parsed || !isObject(value) || !isNonEmptyString(value.decision)) return null
  return value.decision
}

/** Tone for a decision badge; unknown protocol values stay neutral. */
export function decisionTone(decision) {
  const normalized = String(decision || '').toUpperCase()
  if (normalized === 'ALLOW' || normalized === 'APPROVED' || normalized === 'VERIFIED' || normalized === 'VALID') return 'ok'
  if (normalized === 'DENY' || normalized === 'DENIED' || normalized === 'REJECTED' || normalized === 'BLOCKED') return 'failed'
  if (normalized === 'DEFER' || normalized === 'REVIEW' || normalized === 'STEP_UP'
    || normalized === 'REQUIRE_STEP_UP' || normalized === 'PENDING' || normalized === 'WARNING') return 'warn'
  return 'neutral'
}

/**
 * Pretty-printed raw payload for the expandable card section, or null when the
 * block carries nothing worth showing.
 *
 * @param {Record<string, unknown> | null | undefined} block
 * @returns {string | null}
 */
export function rawPayload(block) {
  const { text, parsed, value } = parsePayload(block)
  if (parsed) {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return text || null
    }
  }
  const parts = []
  if (text) parts.push(text)
  if (block && block.isError === true && isObject(block.error)) {
    try {
      parts.push(JSON.stringify(block.error, null, 2))
    } catch {
      // The transport error detail is optional; the raw text still renders.
    }
  }
  return parts.length > 0 ? parts.join('\n\n') : null
}

/** True when the result card has a raw payload worth expanding. */
export function hasRawPayload(block) {
  return resultText(block).length > 0 || Boolean(block && block.isError === true && block.error)
}

/**
 * Localized time for event rows and the panel's freshness line.
 *
 * @param {unknown} value ISO-8601 timestamp from the host, or epoch milliseconds.
 * @returns {string | null}
 */
export function formatTime(value) {
  let input = value
  if (typeof input === 'number' && Number.isFinite(input)) input = new Date(input)
  else if (isNonEmptyString(input)) input = new Date(input)
  else return null
  const date = input instanceof Date ? input : null
  if (!date || Number.isNaN(date.getTime())) return isNonEmptyString(value) ? value : null
  try {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return isNonEmptyString(value) ? value : null
  }
}

/**
 * True when a plugin-manager `subject` names this package. `kind` selects the
 * ref, but every candidate field is checked so a contract addition cannot hide
 * the panel.
 *
 * @param {unknown} subject
 */
export function matchesPlugin(subject) {
  if (!subject || typeof subject !== 'object') return false
  const candidates = []
  if (isObject(subject.pkg) && isNonEmptyString(subject.pkg.name)) candidates.push(subject.pkg.name)
  if (isObject(subject.row) && isNonEmptyString(subject.row.name)) candidates.push(subject.row.name)
  if (isNonEmptyString(subject.name)) candidates.push(subject.name)
  if (isNonEmptyString(subject.id)) candidates.push(subject.id)
  return candidates.includes(PLUGIN_ID)
}

/**
 * Unwrap one overview response body.
 *
 * The documented Host contract returns the snapshot flattened at the top level
 * (`{ ok, plugin, counts, … }`), while some Host builds wrap it as
 * `{ ok, overview: { … } }`. Both shapes are accepted so the browser half and
 * the Host half can be updated independently; anything that is not an object
 * becomes null and is reported as an invalid response.
 *
 * @param {unknown} body Parsed JSON body.
 * @returns {Record<string, unknown> | null}
 */
export function normalizeOverviewBody(body) {
  if (!isObject(body)) return null
  const nested = body.overview
  return isObject(nested) ? nested : body
}
