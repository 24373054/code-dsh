/**
 * Browser-half entry for `@00ccf/dsh-trust-platform`.
 *
 * The DSH client module system serves this bundle lazily: the script registers a
 * factory, and the factory body below runs only when the shell materializes the
 * plugin. `apply` then joins the client context and publishes:
 *
 * - the `trust-platform` locale namespace (zh/en),
 * - eight keyed `tool.call.toolview` renderers,
 * - a `plugins.detail.badge` tag and a `plugins.detail.section` overview panel.
 *
 * No other service is injected: the browser half only reads the two client
 * services declared here, and its single network access is the same-origin
 * overview GET mounted with the section.
 */
import { NS, en, zh } from './locales.js'
import { TOOL_KEYS, ToolCard } from './toolviews.jsx'
import { OverviewBadge, OverviewSection } from './overview.jsx'

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
}
