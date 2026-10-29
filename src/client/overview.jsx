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
import { Badge } from './badge.jsx'
import { COUNT_KEYS, decisionTone, formatTime, hasCopy, matchesPlugin, translate } from './format.js'
import { describeError, useOverview } from './overview-data.js'
import * as styles from './styles.js'

/** Poll cadence while the panel is mounted. */
const POLL_INTERVAL_MS = 5000

/** The host caps recent events itself; the client keeps the panel compact. */
const MAX_RECENT_EVENTS = 10

/** Read a finite counter, tolerating a partially shaped payload. */
function counterValue(counts, key) {
  if (!counts || typeof counts !== 'object') return '—'
  const value = counts[key]
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '—'
}

/** Render a protocol decision pill, if the payload carries one. */
function DecisionPill({ decision, t }) {
  if (typeof decision !== 'string' || !decision) return null
  const key = `overview.decision.${decision.toLowerCase()}`
  return (
    <Badge tone={decisionTone(decision)}>
      {hasCopy(key) ? translate(t, key) : decision}
    </Badge>
  )
}

/** Map a raw operation event type to product language, with a safe fallback. */
function eventLabel(t, eventType) {
  if (typeof eventType !== 'string' || !eventType) return translate(t, 'overview.event.other')
  const key = `overview.event.${eventType}`
  return hasCopy(key) ? translate(t, key) : translate(t, 'overview.event.other')
}

/** Show the readable name of a DID, keeping the full identifier in the tooltip. */
function actorName(actor) {
  if (typeof actor !== 'string' || !actor) return '—'
  if (!actor.startsWith('did:')) return actor
  const parts = actor.split(':')
  return parts[parts.length - 1] || actor
}

/** The panel body; only mounted for this package's subject. */
function OverviewBody({ t }) {
  const [state, reload] = useOverview(POLL_INTERVAL_MS)
  const { data, error, loading, refreshedAt } = state

  const plugin = data && data.plugin && typeof data.plugin === 'object' ? data.plugin : null
  const counts = data && data.counts && typeof data.counts === 'object' ? data.counts : null
  const health = data && data.health && typeof data.health === 'object' ? data.health : null
  const events = data && Array.isArray(data.recent_events) ? data.recent_events.slice(0, MAX_RECENT_EVENTS) : []

  const mode = plugin && typeof plugin.mode === 'string' && plugin.mode ? plugin.mode : null
  const authoritative = Boolean(plugin && plugin.authoritative === true)
  const version = plugin && typeof plugin.version === 'string' && plugin.version ? plugin.version : null
  const healthText = health && typeof health.status === 'string' && health.status
    ? (hasCopy(`overview.health.${health.status}`)
      ? translate(t, `overview.health.${health.status}`)
      : translate(t, 'overview.health.unknown'))
    : translate(t, 'overview.health.unknown')

  const errorText = error ? describeError(error, t) : null
  const refreshedText = refreshedAt ? formatTime(refreshedAt) : null

  return (
    <section style={styles.section} data-trust-overview="">
      <div style={styles.sectionHead}>
        <span style={styles.sectionTitle}>{translate(t, 'overview.title')}</span>
        {mode && hasCopy(`overview.mode.${mode}`) ? (
          <Badge tone={mode === 'embedded' ? 'ok' : 'info'}>
            {translate(t, `overview.mode.${mode}`)}
          </Badge>
        ) : plugin ? (
          <Badge tone="neutral">{translate(t, 'overview.mode.unknown')}</Badge>
        ) : null}
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
                const eventType = typeof item.event_type === 'string' && item.event_type ? item.event_type : ''
                const actor = typeof item.actor_did === 'string' && item.actor_did ? item.actor_did : ''
                const occurred = formatTime(item.occurred_at) || '—'
                return (
                  <li key={index} style={styles.eventRow}>
                    <span style={styles.eventType}>{eventLabel(t, eventType)}</span>
                    <DecisionPill decision={item.decision} t={t} />
                    <span style={styles.eventActor} title={actor}>{actorName(actor)}</span>
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
