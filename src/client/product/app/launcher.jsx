/**
 * One compact control in the conversation header that opens (or reveals) the
 * trust console in DSH's right column.
 *
 * The console used to be a global main panel, which replaced the conversation
 * area; the header control is the way in now, and DSH's own right-column
 * controls are the way out. The button borrows the shell's theme tokens so it
 * sits next to the other header utilities without a seam.
 */
import { translate } from '../../format.js'
import { ensureProductStyles } from '../ui/styles.js'
import { TrustPlatformPanelIcon } from './panel-icon.jsx'

/**
 * Session-header launcher for the docked console.
 * @param {{t: (key: string) => string, openConsole?: () => void}} props
 *   locale-bound translate plus the injected opener.
 * @returns the header button.
 */
export function TrustConsoleLauncher({ t, openConsole }) {
  ensureProductStyles()
  const label = translate(t, 'panel.open')
  return (
    <button
      type="button"
      className="tp-launcher"
      title={label}
      aria-label={label}
      onClick={() => { if (typeof openConsole === 'function') openConsole() }}
    >
      <TrustPlatformPanelIcon size={16} />
    </button>
  )
}
