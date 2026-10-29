/**
 * Main-panel root of the trust-platform console.
 *
 * DSH renders one global `main` panel per sidebar entry; this component is the
 * whole product surface: the operator workspace, its client-side navigation and
 * toast layer. Phase 1 has no backend of its own — every screen reads the demo
 * world in `product/mock` — so the console boots synchronously.
 *
 * The component is deliberately thin: shell chrome lives in `shell.jsx`, pages
 * in `product/pages`, and the styling contract in `ui/styles.js`.
 */
import { ToastProvider } from '../ui/primitives.jsx'
import { ensureProductStyles } from '../ui/styles.js'
import { NavigationProvider } from './navigation.jsx'
import { Shell } from './shell.jsx'

/** Console root rendered by the `main` slot. */
export function TrustPlatformMain() {
  ensureProductStyles()
  return (
    <div className="tp-root">
      <ToastProvider>
        <NavigationProvider>
          <Shell />
        </NavigationProvider>
      </ToastProvider>
    </div>
  )
}
