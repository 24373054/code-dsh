/**
 * Brand marks for the trust platform.
 *
 * The mark is a filled suspension bridge: the bridge stands for 星桥 and the
 * two towers read as two parties meeting over a span. It is drawn as a solid
 * silhouette on a flat ink tile (no gradients, no second colour) so it stays
 * legible from the 44 px plugin card down to the 26 px console header, and it
 * keeps working as a single-colour glyph on light and dark surfaces.
 */

const INK = '#0D0F12'
const IVORY = '#F4F1EA'

/** Filled bridge geometry, drawn on the 64 × 64 canvas used by the plugin icon. */
function BridgeGeometry(props) {
  return (
    <g {...props}>
      <rect x="7" y="44" width="50" height="3.8" rx="1.9" />
      <rect x="18.9" y="21" width="3.8" height="23" rx="1.5" />
      <rect x="41.3" y="21" width="3.8" height="23" rx="1.5" />
      <path d="M7 44c4.8-1 9.4-5.8 11.8-12.2C20 28.6 21 24.6 21.2 21h2.2c-.2 3.9-1.2 7.9-2.4 11.4C18.6 39 13.4 44.2 7 44.6Z" />
      <path d="M18.4 21c3.6 5.3 7.4 8 11.6 8s8-2.7 11.6-8l1.8 1.2c-3.8 5.9-8.2 9-13.4 9s-9.6-3.1-13.4-9Z" />
      <path d="M57 44c-4.8-1-9.4-5.8-11.8-12.2C44 28.6 43 24.6 42.8 21h-2.2c.2 3.9 1.2 7.9 2.4 11.4C45.4 39 50.6 44.2 57 44.6Z" />
    </g>
  )
}

/**
 * Single-colour bridge glyph, for chrome that owns its own surface.
 * @param {{size?: number, color?: string, title?: string}} props
 *   requested edge in px, fill colour (defaults to currentColor) and optional title.
 */
export function BridgeGlyph({ size = 24, color = 'currentColor', title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill={color}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
      style={{ display: 'block' }}
    >
      {title ? <title>{title}</title> : null}
      <BridgeGeometry />
    </svg>
  )
}

/**
 * The app-icon mark: ivory bridge on a flat ink tile.
 * @param {{size?: number, rounding?: number}} props size in px and corner radius in px.
 */
export function BrandTile({ size = 30, rounding }) {
  const radius = Number.isFinite(rounding) ? Math.max(0, Math.min(rounding, size / 2)) : size * 0.22
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
    >
      <rect width="64" height="64" rx={(radius / size) * 64} fill={INK} />
      <BridgeGeometry fill={IVORY} />
    </svg>
  )
}
