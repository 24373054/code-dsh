/**
 * Plugin-manager contributions for the trust-platform bundle.
 *
 * Two entries hang off the plugin detail page:
 *
 * - `plugins.detail.badge` adds a compact package tag beside the title.
 * - `plugins.detail.section` renders a live overview panel: mode, health, the
 *   six trust-domain counters and the most recent operation events, polled from
 *   the Host's same-origin `/trust-platform/api/overview` route every five
 *   seconds while the section is mounted.
 *
 * Both entries return null for every other package. The panel is deliberately
 * resilient: a 403, a 500, a missing route or a transport failure renders a
 * localized error strip (or a stale-data warning when an earlier snapshot is
 * still on screen) instead of unmounting the section.
 */
import { useCallback, useEffect, useState } from 'react'
import { Badge } from './badge.jsx'
import {
  COUNT_KEYS,
  decisionTone,
  formatTime,
  matchesPlugin,
  normalizeOverviewBody,
  translate
} from './format.js'
import * as styles from './styles.js'

/** Same-origin Host route that joins the configured mode and the live stores. */
const OVERVIEW_URL = '/trust-platform/api/overview'

/** Poll cadence while the panel is mounted. */
const POLL_INTERVAL_MS = 5000

/** The host caps recent events itself; the client keeps the panel compact. */
const MAX_RECENT_EVENTS = 10

/** Describe an unreachable transport without assuming an Error instance. */
function errorMessage(error) {
  if (error && typeof error === 'object') {
    if (typeof error.message === 'string' && error.message) return error.message
    return String(error)
  }
  return String(error)
}

/**
 * Fetch one overview snapshot.
 *
 * @param {AbortSignal | undefined} signal
 * @returns {Promise<
 *   { data: Record<string, unknown> } |
 *   { aborted: true } |
 *   { error: { kind: 'unavailable' | 'forbidden' | 'invalid' | 'http' | 'network' | 'host', status?: number, code?: string, message?: string } }
 * >}
 */
async function requestOverview(signal) {
  if (typeof fetch !== 'function') return { error: { kind: 'unavailable' } }

  let response
  try {
    response = await fetch(OVERVIEW_URL, {
      credentials: 'same-origin',
      headers: { accept: 'application/json' },
      signal: signal || undefined
    })
  } catch (error) {
    if (error && (error.name === 'AbortError' || error.code === 'ABORT_ERR')) return { aborted: true }
    return { error: { kind: 'network', message: errorMessage(error) } }
  }

  if (response.status === 401 || response.status === 403) return { error: { kind: 'forbidden' } }
  if (response.status === 404) return { error: { kind: 'unavailable' } }
  if (!response.ok) return { error: { kind: 'http', status: response.status } }

  let body
  try {
    body = await response.json()
  } catch {
    return { error: { kind: 'invalid' } }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body) || body.ok !== true) {
    return {
      error: {
        kind: 'host',
        code: body && typeof body.error_code === 'string' ? body.error_code : 'UNKNOWN',
        message: body && typeof body.message === 'string' ? body.message : ''
      }
    }
  }
  const overview = normalizeOverviewBody(body)
  if (overview === null) return { error: { kind: 'invalid' } }
  return { data: overview }
}

/** Localized one-line explanation for a failed request. */
function describeError(error, t) {
  switch (error.kind) {
    case 'forbidden':
      return translate(t, 'overview.error.forbidden')
    case 'http':
      return translate(t, 'overview.error.http', { status: error.status })
    case 'network':
      return translate(t, 'overview.error.network', { message: error.message })
    case 'host':
      return translate(t, 'overview.error.host', { code: error.code, message: error.message || '—' })
    case 'unavailable':
      return translate(t, 'overview.unavailable')
    default:
      return translate(t, 'overview.error.invalid')
  }
}

/**
 * Overview state machine: load on mount, then poll; overlapped polls are
 * skipped, unmount aborts the in-flight request, and a failed refresh keeps the
 * last good snapshot.
 */
function useOverview() {
  const [state, setState] = useState({ data: null, error: null, loading: false, refreshedAt: 0 })
  const [generation, setGeneration] = useState(0)
  const reload = useCallback(() => setGeneration((value) => value + 1), [])

  useEffect(() => {
    let disposed = false
    let inFlight = false
    let controller = null

    const load = () => {
      if (disposed || inFlight) return
      inFlight = true
      controller = typeof AbortController === 'function' ? new AbortController() : null
      setState((previous) => ({ ...previous, loading: true }))
      requestOverview(controller ? controller.signal : undefined).then((outcome) => {
        if (disposed) return
        inFlight = false
        if (outcome.data) {
          setState({ data: outcome.data, error: null, loading: false, refreshedAt: Date.now() })
        } else if (outcome.error) {
          setState((previous) => ({ ...previous, loading: false, error: outcome.error }))
        } else {
          setState((previous) => ({ ...previous, loading: false }))
        }
      })
    }

    load()
    const timer = setInterval(load, POLL_INTERVAL_MS)
    return () => {
      disposed = true
      clearInterval(timer)
      if (controller) controller.abort()
    }
  }, [generation])

  return [state, reload]
}

/** Read a finite counter, tolerating a partially shaped payload. */
function counterValue(counts, key) {
  if (!counts || typeof counts !== 'object') return '—'
  const value = counts[key]
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '—'
}

/** Render a protocol decision pill, if the payload carries one. */
function DecisionPill({ decision }) {
  if (typeof decision !== 'string' || !decision) return null
  return <Badge tone={decisionTone(decision)}>{decision}</Badge>
}

/** The panel body; only mounted for this package's subject. */
function OverviewBody({ t }) {
  const [state, reload] = useOverview()
  const { data, error, loading, refreshedAt } = state

  const plugin = data && data.plugin && typeof data.plugin === 'object' ? data.plugin : null
  const counts = data && data.counts && typeof data.counts === 'object' ? data.counts : null
  const health = data && data.health && typeof data.health === 'object' ? data.health : null
  const events = data && Array.isArray(data.recent_events) ? data.recent_events.slice(0, MAX_RECENT_EVENTS) : []

  const mode = plugin && (plugin.mode === 'control-plane' || plugin.mode === 'in-memory') ? plugin.mode : null
  const authoritative = Boolean(plugin && plugin.authoritative === true)
  const source = plugin && typeof plugin.source === 'string' && plugin.source ? plugin.source : null
  const version = plugin && typeof plugin.version === 'string' && plugin.version ? plugin.version : null
  const healthText = health && typeof health.status === 'string' && health.status
    ? health.status
    : translate(t, 'overview.health.unknown')

  const errorText = error ? describeError(error, t) : null
  const refreshedText = refreshedAt ? formatTime(refreshedAt) : null

  return (
    <section style={styles.section} data-trust-overview="">
      <div style={styles.sectionHead}>
        <span style={styles.sectionTitle}>{translate(t, 'overview.title')}</span>
        {mode === 'control-plane' ? <Badge tone="ok">{translate(t, 'overview.mode.control-plane')}</Badge> : null}
        {mode === 'in-memory' ? <Badge tone="info">{translate(t, 'overview.mode.in-memory')}</Badge> : null}
        {plugin && !mode ? <Badge tone="neutral">{translate(t, 'overview.mode.unknown')}</Badge> : null}
        {plugin ? (
          authoritative
            ? <Badge tone="ok">{translate(t, 'overview.authoritative')}</Badge>
            : <Badge tone="warn">{translate(t, 'overview.nonAuthoritative')}</Badge>
        ) : null}
        {refreshedText ? (
          <span style={styles.meta}>{translate(t, 'overview.updated', { time: refreshedText })}</span>
        ) : null}
        <span style={styles.actions}>
          <button type="button" onClick={reload} disabled={loading} style={styles.actionButton}>
            {translate(t, error ? 'overview.retry' : 'overview.refresh')}
          </button>
        </span>
      </div>

      {errorText && !data ? (
        <div style={styles.errorBox}>
          <span>{errorText}</span>
          <button type="button" onClick={reload} disabled={loading} style={styles.actionButton}>
            {translate(t, 'overview.retry')}
          </button>
        </div>
      ) : null}
      {!data && !errorText ? <div style={styles.muted}>{translate(t, 'overview.loading')}</div> : null}

      {data ? (
        <>
          <div style={styles.metaRow}>
            {source ? <span>{translate(t, 'overview.source', { source })}</span> : null}
            <span>{translate(t, 'overview.health')}: {healthText}</span>
            {version ? <span style={styles.mono}>{`v${version}`}</span> : null}
          </div>
          {errorText ? (
            <div style={styles.staleBox}>{translate(t, 'overview.error.stale', { message: errorText })}</div>
          ) : null}
          <div style={styles.counts}>
            {COUNT_KEYS.map((key) => (
              <div key={key} style={styles.countCell}>
                <div style={styles.countValue}>{counterValue(counts, key)}</div>
                <div style={styles.countLabel}>{translate(t, `overview.count.${key}`)}</div>
              </div>
            ))}
          </div>
          <div style={styles.subTitle}>{translate(t, 'overview.recentEvents')}</div>
          {events.length === 0 ? (
            <div style={styles.muted}>{translate(t, 'overview.noEvents')}</div>
          ) : (
            <ul style={styles.list}>
              {events.map((event, index) => {
                const item = event && typeof event === 'object' ? event : {}
                const eventType = typeof item.event_type === 'string' && item.event_type ? item.event_type : '—'
                const actor = typeof item.actor_did === 'string' && item.actor_did ? item.actor_did : '—'
                const occurred = formatTime(item.occurred_at) || '—'
                return (
                  <li key={index} style={styles.eventRow}>
                    <span style={styles.eventType}>{eventType}</span>
                    <DecisionPill decision={item.decision} />
                    <span style={styles.eventActor} title={actor}>{actor}</span>
                    <span style={styles.eventTime}>{occurred}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      ) : null}
    </section>
  )
}

/**
 * `plugins.detail.section` entry: live trust-platform overview on this
 * package's detail page only.
 *
 * @param {{
 *   t?: (key: string, params?: Record<string, unknown>) => string,
 *   subject?: unknown,
 * }} props
 */
export function OverviewSection(props) {
  const { t, subject } = props || {}
  if (!matchesPlugin(subject)) return null
  return <OverviewBody t={t} />
}

/**
 * `plugins.detail.badge` entry: compact package tag beside the detail title.
 * The version comes from the package ref the page already holds, so the badge
 * costs no request.
 *
 * @param {{
 *   t?: (key: string, params?: Record<string, unknown>) => string,
 *   subject?: { pkg?: { version?: unknown } },
 * }} props
 */
export function OverviewBadge(props) {
  const { t, subject } = props || {}
  if (!matchesPlugin(subject)) return null
  const pkg = subject && subject.pkg && typeof subject.pkg === 'object' ? subject.pkg : null
  const version = pkg && typeof pkg.version === 'string' && pkg.version ? pkg.version : ''
  const label = translate(t, 'overview.badge')
  return (
    <span style={styles.pluginBadge} title={label}>
      {version ? `${label} v${version}` : label}
    </span>
  )
}
