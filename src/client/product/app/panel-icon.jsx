/**
 * Sidebar glyph for the trust-platform global panel.
 *
 * The sidebar owns the button, label, selected state and tooltip; this
 * component only draws the shield-check mark at the requested edge.
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
        d="M12 2.8 19 5.4v5.7c0 4.5-2.9 7.9-7 9.9-4.1-2-7-5.4-7-9.9V5.4L12 2.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m8.7 12 2.3 2.3 4.4-4.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
