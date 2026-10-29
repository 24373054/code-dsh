/**
 * Docked root of the trust-platform console.
 *
 * DSH opens this inside its right column, next to the conversation. The column
 * is resizable and expandable through the shell's own controls, so the console
 * only has to fill whatever width it is given: the stylesheet's container
 * queries compact the chrome and page grids below ~560px. All product state is
 * still the phase-1 demo world in `product/mock`; the shell owns navigation and
 * the toast layer.
 */
import { ToastProvider } from '../ui/primitives.jsx'
import { ensureProductStyles } from '../ui/styles.js'
import { NavigationProvider } from './navigation.jsx'
import { Shell } from './shell.jsx'

/** Console root rendered by the `sidebar.right.pane.tab` slot. */
export function TrustPlatformPanel() {
  ensureProductStyles()
  return (
    <div className="tp-panel-root">
      <ToastProvider>
        <NavigationProvider>
          <Shell />
        </NavigationProvider>
      </ToastProvider>
    </div>
  )
}
