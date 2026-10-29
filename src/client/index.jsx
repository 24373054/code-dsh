/**
 * Browser-half entry for `@sealwax/dsh-trust-platform`.
 *
 * The DSH client module system serves this bundle lazily: the script registers a
 * factory, and the factory body below runs only when the shell materializes the
 * plugin. `apply` then joins the client context and publishes:
 *
 * - the `trust-platform` locale namespace (zh/en),
 * - the product console: a global `main` panel (id `trust-platform`) opened
 *   from its own `sidebar.panellist` entry,
 * - eight keyed `tool.call.toolview` renderers,
 * - a `plugins.detail.badge` tag and a `plugins.detail.section` overview panel,
 * - a read-only `settings.section` page for the DSH Settings dialog.
 *
 * No other service is injected: the browser half only reads the two client
 * services declared here, and its network access is limited to the same-origin
 * overview GET mounted with the panels.
 */
import { translate } from './format.js'
import { NS, en, zh } from './locales.js'
import { TOOL_KEYS, ToolCard } from './toolviews.jsx'
import { OverviewBadge, OverviewSection } from './overview.jsx'
import { SettingsPanel } from './settings.jsx'
import { TrustPlatformMain } from './product/app/main.jsx'
import { TrustPlatformPanelIcon } from './product/app/panel-icon.jsx'

/** Id shared by the sidebar entry and the main panel it opens. */
export const PANEL_ID = 'trust-platform'

/**
 * Cordis services this browser plugin injects: the slot registry it registers
 * into and the locale registry its copy lives in.
 */
export const inject = ['slots', 'locale']

/**
 * Client plugin body.
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'trust-platform: dictionaries')

  // Locale-bound translate for the one label the settings nav needs while the
  // shell renders it: the settings section list stores a label thunk, not text.
  const t = ctx.locale.bind(NS)

  for (const key of TOOL_KEYS) {
    ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
      name: 'tool.call.toolview',
      key,
      locale: NS
    }, ToolCard))
  }

  ctx.slots.inject('plugins.detail.badge', () => ctx.slots.register({
    name: 'plugins.detail.badge',
    id: 'trust-platform-badge',
    locale: NS,
    order: 10
  }, OverviewBadge))

  ctx.slots.inject('plugins.detail.section', () => ctx.slots.register({
    name: 'plugins.detail.section',
    id: 'trust-platform-overview',
    locale: NS,
    order: 10
  }, OverviewSection))

  // One read-only page in the Settings dialog. The list label is a thunk so the
  // shell can resolve it against the active locale; the page itself receives the
  // framework-bound `t` from the `locale` option.
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'trust-platform',
    order: 55,
    label: () => translate(t, 'settings.nav'),
    locale: NS,
    inject: () => ({})
  }, SettingsPanel))

  // The product console itself: one global main panel, opened from its own
  // sidebar entry. This is a DSH surface, not a standalone page — the rail
  // selects it like the built-in panels, and DSH owns the surrounding frame.
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: PANEL_ID,
    locale: NS,
    inject: () => ({})
  }, TrustPlatformMain))

  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 20,
    label: () => translate(t, 'panel.label'),
    locale: NS
  }, TrustPlatformPanelIcon))
}
