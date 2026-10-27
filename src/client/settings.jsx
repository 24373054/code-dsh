/**
 * `settings.section` page for the trust platform.
 *
 * One read-only page under DSH Settings: the plugin's live status (mode,
 * authority, data source, health, record counts) plus the display-safe
 * configuration the Host reports. Nothing here writes configuration — the
 * values live in the DSH profile's `cordis.patch.yml`, and the page names the
 * exact keys instead of offering an editor.
 *
 * The snapshot comes from the same same-origin route as the plugin-manager
 * panel, polled every ten seconds while the page is mounted. A 403, a 500, a
 * missing route, or a transport failure renders a localized error strip and
 * keeps the last good snapshot on screen.
 */
import { Badge } from './badge.jsx'
import { COUNT_KEYS, formatTime, readConfig, translate } from './format.js'
import { describeError, useOverview } from './overview-data.js'
import * as styles from './styles.js'

/** The settings page is read-mostly; ten seconds is fresh enough. */
const SETTINGS_POLL_INTERVAL_MS = 10000

/**
 * Read one finite counter, tolerating a partially shaped payload.
 *
 * @param {unknown} counts
 * @param {string} key
 */
function countText(counts, key) {
  if (!counts || typeof counts !== 'object') return '—'
  const value = counts[key]
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '—'
}

/**
 * Localized mode name for the status row; unknown protocol values stay raw.
 *
 * @param {string | null} mode
 * @param {((key: string) => string) | undefined} t
 */
function modeText(mode, t) {
  if (mode === 'control-plane') return translate(t, 'overview.mode.control-plane')
  if (mode === 'in-memory') return translate(t, 'overview.mode.in-memory')
  return translate(t, 'overview.mode.unknown')
}

/**
 * Host health status. The in-memory sandbox reports `sandbox`; the
 * control-plane snapshot reports the service's own status when reachable and
 * `unknown` when it is not.
 *
 * @param {{ status?: unknown } | null} health
 * @param {string | null} mode
 * @param {((key: string) => string) | undefined} t
 */
function healthText(health, mode, t) {
  if (health && typeof health.status === 'string' && health.status) return health.status
  if (mode === 'in-memory') return translate(t, 'settings.health.sandbox')
  return translate(t, 'settings.health.unknown')
}

/**
 * Localized yes/no for a boolean configuration flag; unknown stays a dash.
 *
 * @param {boolean | null} value
 * @param {((key: string) => string) | undefined} t
 */
function flagText(value, t) {
  if (value === true) return translate(t, 'settings.value.yes')
  if (value === false) return translate(t, 'settings.value.no')
  return translate(t, 'settings.value.none')
}

/**
 * Read-only configuration rows. Only documented fields are projected; the
 * token itself is never part of the snapshot.
 *
 * @param {Record<string, unknown> | null} plugin
 * @param {((key: string, params?: Record<string, unknown>) => string) | undefined} t
 */
function configRows(plugin, t) {
  const config = readConfig(plugin)
  if (!config) return null
  return [
    {
      key: 'settings.config.baseUrl',
      value: config.baseUrl || translate(t, 'settings.value.none')
    },
    {
      key: 'settings.config.actorDid',
      value: config.actorDid || translate(t, 'settings.value.default')
    },
    {
      key: 'settings.config.timeoutMs',
      value: config.timeoutMs === null
        ? translate(t, 'settings.value.none')
        : translate(t, 'settings.value.timeout', { ms: config.timeoutMs })
    },
    {
      key: 'settings.config.allowInterventionExecution',
      value: flagText(config.allowInterventionExecution, t)
    },
    {
      key: 'settings.config.tokenConfigured',
      value: flagText(config.tokenConfigured, t)
    }
  ]
}

/**
 * `settings.section` entry: the trust-platform settings page.
 *
 * The shell passes the shell-owned `close` affordance and this entry's
 * locale-bound `t`; neither is required for the read-only page.
 *
 * @param {{
 *   t?: (key: string, params?: Record<string, unknown>) => string,
 *   close?: () => void,
 * }} props
 */
export function SettingsPanel(props) {
  const { t } = props || {}
  const [state, reload] = useOverview(SETTINGS_POLL_INTERVAL_MS)
  const { data, error, loading, refreshedAt } = state

  const plugin = data && data.plugin && typeof data.plugin === 'object' ? data.plugin : null
  const counts = data && data.counts && typeof data.counts === 'object' ? data.counts : null
  const health = data && data.health && typeof data.health === 'object' ? data.health : null

  const mode = plugin && (plugin.mode === 'control-plane' || plugin.mode === 'in-memory') ? plugin.mode : null
  const authoritative = Boolean(plugin && plugin.authoritative === true)
  const source = plugin && typeof plugin.source === 'string' && plugin.source ? plugin.source : null
  const version = plugin && typeof plugin.version === 'string' && plugin.version ? plugin.version : null

  const transportError = error ? describeError(error, t, 'settings') : null
  const malformed = Boolean(data && !plugin)
  const errorText = transportError || (malformed ? translate(t, 'settings.error.invalid') : null)
  const refreshedText = refreshedAt ? formatTime(refreshedAt) : null
  const rows = plugin ? configRows(plugin, t) : null

  return (
    <section style={styles.section} data-trust-settings="trust-platform">
      <div style={styles.sectionHead}>
        <span style={styles.sectionTitle}>{translate(t, 'settings.title')}</span>
        {mode ? <Badge tone={mode === 'control-plane' ? 'ok' : 'info'}>{modeText(mode, t)}</Badge> : null}
        {plugin ? (
          authoritative
            ? <Badge tone="ok">{translate(t, 'overview.authoritative')}</Badge>
            : <Badge tone="warn">{translate(t, 'overview.nonAuthoritative')}</Badge>
        ) : null}
        {version ? <span style={styles.mono}>{`v${version}`}</span> : null}
        {refreshedText ? (
          <span style={styles.meta}>{translate(t, 'settings.updated', { time: refreshedText })}</span>
        ) : null}
        <span style={styles.actions}>
          <button type="button" onClick={reload} disabled={loading} style={styles.actionButton}>
            {translate(t, errorText ? 'settings.retry' : 'settings.refresh')}
          </button>
        </span>
      </div>

      {errorText && (!data || malformed) ? (
        <div style={styles.errorBox}>
          <span>{errorText}</span>
          <button type="button" onClick={reload} disabled={loading} style={styles.actionButton}>
            {translate(t, 'settings.retry')}
          </button>
        </div>
      ) : null}
      {!data && !errorText ? <div style={styles.muted}>{translate(t, 'settings.loading')}</div> : null}

      {data && plugin ? (
        <div style={styles.metaRow}>
          <span>{translate(t, 'settings.mode')}: {modeText(mode, t)}</span>
          {source ? <span>{translate(t, 'settings.source')}: {source}</span> : null}
          <span>{translate(t, 'settings.health')}: {healthText(health, mode, t)}</span>
        </div>
      ) : null}
      {data && transportError ? (
        <div style={styles.staleBox}>{translate(t, 'settings.error.stale', { message: transportError })}</div>
      ) : null}

      {data && plugin ? <div style={styles.subTitle}>{translate(t, 'settings.config')}</div> : null}
      {data && plugin && rows ? (
        <div style={styles.configTable}>
          {rows.map((row) => (
            <div key={row.key} style={styles.configRow}>
              <span style={styles.configKey}>{translate(t, row.key)}</span>
              <span style={styles.configValue}>{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}
      {data && plugin && !rows ? (
        <div style={styles.muted}>{translate(t, 'settings.config.notReported')}</div>
      ) : null}

      {data && plugin ? (
        <>
          <div style={styles.subTitle}>{translate(t, 'settings.counts')}</div>
          <div style={styles.counts}>
            {COUNT_KEYS.map((key) => (
              <div key={key} style={styles.countCell}>
                <div style={styles.countValue}>{countText(counts, key)}</div>
                <div style={styles.countLabel}>{translate(t, `overview.count.${key}`)}</div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div style={styles.note}>{translate(t, 'settings.config.note')}</div>
    </section>
  )
}
