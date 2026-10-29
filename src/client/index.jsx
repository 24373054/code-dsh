/**
 * Browser-half entry for `@sealwax/dsh-trust-platform`.
 *
 * The DSH client module system serves this bundle lazily: the script registers a
 * factory, and the factory body below runs only when the shell materializes the
 * plugin. `apply` then joins the client context and publishes:
 *
 * - the `trust-platform` locale namespace (zh/en),
 * - the product console: a docked right-Sidebar tab (`trust-console`) that
 *   opens beside the conversation from a Session-header control, so the chat
 *   stays on screen and DSH's own column controls close it again,
 * - eight keyed `tool.call.toolview` renderers,
 * - a `plugins.detail.badge` tag and a `plugins.detail.section` overview panel,
 * - a read-only `settings.section` page for the DSH Settings dialog.
 *
 * The browser half injects the slot/locale registries and the right-Sidebar
 * tab registry and navigation face; its network access is limited to the
 * same-origin overview GET mounted with the panels.
 */
import { translate } from './format.js'
import { NS, en, zh } from './locales.js'
import { TOOL_KEYS, ToolCard } from './toolviews.jsx'
import { OverviewBadge, OverviewSection } from './overview.jsx'
import { SettingsPanel } from './settings.jsx'
import { TrustPlatformPanel } from './product/app/panel.jsx'
import { TrustConsoleLauncher } from './product/app/launcher.jsx'
import { TRUST_CONSOLE_ID, TRUST_CONSOLE_KIND, trustConsoleDefinition } from './product/app/tab-type.js'

/** Id shared by the console tab type and the Session-header launcher. */
export const PANEL_ID = 'trust-platform'

/**
 * Cordis services this browser plugin injects: the slot registry it registers
 * into, the locale registry its copy lives in, and the right-Sidebar tab
 * registry and navigation face the console docks into.
 */
export const inject = ['slots', 'locale', 'sidebarRightTabs', 'sidebarRight']

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

  // The product console: one docked right-Sidebar tab type, its body in the
  // keyed seat, and a Session-header control that opens it beside the chat.
  // The conversation is never replaced — the operator keeps both surfaces on
  // screen, and the right column's own collapse/close controls dismiss it.
  ctx.effect(
    () => ctx.sidebarRightTabs.register(trustConsoleDefinition(t)),
    'trust-platform: console tab type'
  )

  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
    name: 'sidebar.right.pane.tab',
    key: TRUST_CONSOLE_ID,
    locale: NS,
    inject: () => ({})
  }, TrustPlatformPanel)), 'trust-platform: console tab body')

  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'trust-platform-console',
    order: 20,
    locale: NS,
    inject: () => ({
      openConsole: () => ctx.sidebarRight.openTab(TRUST_CONSOLE_KIND)
    })
  }, TrustConsoleLauncher))
}
