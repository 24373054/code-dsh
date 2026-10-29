/**
 * Sidebar glyph for the trust-platform global panel.
 *
 * The sidebar owns the button, label, selected state and tooltip; this
 * component only draws the bridge mark at the requested edge. It uses the
 * outline version so it sits naturally next to DSH's own line icons.
 */

/**
 * @param {{size?: number, active?: boolean}} props sidebar icon share
 */
export function TrustPlatformPanelIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.2 18.4h17.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8.4 18.4V8.6M15.6 18.4V8.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M3.2 18.4c2.9-.3 5-2.3 6.1-5.7.5-1.5.6-2.7.6-4.1M20.8 18.4c-2.9-.3-5-2.3-6.1-5.7-.5-1.5-.6-2.7-.6-4.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8.4 8.6c1.4 2.6 2.6 3.9 3.6 3.9s2.2-1.3 3.6-3.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}
