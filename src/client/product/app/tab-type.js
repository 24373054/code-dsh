/**
 * Right-Sidebar tab type for the trust console.
 *
 * The console is a docked workspace, not a global panel: it opens in DSH's
 * right column next to the conversation, so the operator keeps the chat in
 * view and can close/collapse the panel with the column's own controls. The
 * type is registered in two stages (this definition, then the keyed body in
 * `sidebar.right.pane.tab`), exactly as every other right-Sidebar type does.
 */

import { translate } from '../../format.js'

/** Implementation identity: unique across right-tab types, and the body's slot key. */
export const TRUST_CONSOLE_ID = '@sealwax/dsh-trust-platform'

/** Type discriminator: what `ctx.sidebarRight.openTab` names. */
export const TRUST_CONSOLE_KIND = 'trust-console'

/**
 * The tab type's registry definition.
 * @param {(key: string) => string} t - namespace-bound translator, re-read on every title call.
 * @returns the definition to register.
 */
export function trustConsoleDefinition(t) {
  return {
    id: TRUST_CONSOLE_ID,
    kind: TRUST_CONSOLE_KIND,
    priority: 'builtin',
    title: () => translate(t, 'panel.tab'),
    guide: [{
      id: 'trust-console',
      order: 20,
      title: () => translate(t, 'panel.tab'),
      description: () => translate(t, 'panel.guide')
    }]
  }
}
