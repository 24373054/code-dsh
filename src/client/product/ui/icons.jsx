/**
 * Inline SVG icon set for the trust-platform console.
 *
 * The browser half deliberately carries its own glyphs instead of importing the
 * shell's icon package (a runtime dependency would couple the plugin to a host
 * package that may not be installed). Every glyph is a 24×24 stroke drawing
 * that inherits `currentColor`.
 */
import { createElement as h } from 'react'

const PATHS = {
  dashboard: ['M4 13h6V4H4v9Z', 'M14 20h6v-9h-6v9Z', 'M4 20h6v-4H4v4Z', 'M14 7h6V4h-6v3Z'],
  shield: ['M12 3 5 6v5c0 4.4 2.9 8.3 7 9.5 4.1-1.2 7-5.1 7-9.5V6l-7-3Z', 'm9 12 2 2 4-4'],
  check: ['M20 6 9 17l-5-5'],
  checkCircle: ['M21 11.1V12a9 9 0 1 1-5.3-8.2', 'M21 4 12 13l-3-3'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  xCircle: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm9 9 6 6', 'm15 9-6 6'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
  arrowRight: ['M4 12h16', 'm14 6 6 6-6 6'],
  arrowUpRight: ['M7 17 17 7', 'M8 7h9v9'],
  arrowLeft: ['M20 12H4', 'm10 6-6 6 6 6'],
  chevronRight: ['m9 6 6 6-6 6'],
  chevronDown: ['m6 9 6 6 6-6'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'm21 21-4.3-4.3'],
  refresh: ['M20 11a8 8 0 0 0-14.9-3M4 4v4h4', 'M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4'],
  download: ['M12 3v12', 'm7 10 5 5 5-5', 'M4 21h16'],
  plus: ['M12 5v14', 'M5 12h14'],
  bell: ['M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8', 'M10.3 21a2 2 0 0 0 3.4 0'],
  settings: ['M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c.2.6.7 1 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z'],
  lock: ['M6 11h12v10H6V11Z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  key: ['M21 3 11 13', 'm8 18 2 2', 'M11 13l-2-2', 'M7 14a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
  users: ['M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M22 21v-1a4 4 0 0 0-3-3.9', 'M16 3.1a4 4 0 0 1 0 7.8'],
  building: ['M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16', 'M16 9h2a2 2 0 0 1 2 2v10', 'M2 21h20', 'M8 7h4', 'M8 11h4', 'M8 15h4'],
  wallet: ['M20 7H5a2 2 0 0 1 0-4h13v4', 'M3 5v14a2 2 0 0 0 2 2h15V7', 'M17 14h.01'],
  card: ['M3 6h18v12H3V6Z', 'M3 10h18'],
  package: ['M21 8 12 3 3 8v8l9 5 9-5V8Z', 'm3 8 9 5 9-5', 'M12 13v8'],
  branch: ['M6 4v12a4 4 0 0 0 4 4h4', 'M18 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M6 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  activity: ['M3 12h4l3-8 4 16 3-8h4'],
  alert: ['M12 3 2 21h20L12 3Z', 'M12 10v5', 'M12 18.5h.01'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 11v6', 'M12 7h.01'],
  layers: ['m12 3 9 5-9 5-9-5 9-5Z', 'm3 13 9 5 9-5', 'm3 18 9 5 9-5'],
  fileText: ['M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z', 'M14 3v6h6', 'M9 13h6', 'M9 17h6'],
  book: ['M4 5a3 3 0 0 1 3-3h13v18H7a3 3 0 0 0-3 3V5Z', 'M4 19a3 3 0 0 0 3 3h13'],
  scale: ['M12 3v18', 'M3 7h18', 'm6 7-3 7h6L6 7Z', 'm18 7-3 7h6l-3-7Z', 'M8 21h8'],
  chart: ['M3 3v18h18', 'm7 15 4-5 3 3 5-7'],
  trendUp: ['m3 17 6-6 4 4 8-8', 'M17 7h4v4'],
  filter: ['M3 5h18l-7 8v6l-4 2v-8L3 5Z'],
  more: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
  trash: ['M4 7h16', 'M10 11v6', 'M14 11v6', 'M6 7l1 14h10l1-14', 'M9 7V4h6v3'],
  external: ['M14 4h6v6', 'M20 4 10 14', 'M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4'],
  sparkles: ['m12 3 1.8 4.8L18.5 9.5 14 11.6 12 16l-1.9-4.4L5.5 9.5l4.5-1.7L12 3Z', 'M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8L19 15Z'],
  sliders: ['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6'],
  globe: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M3 12h18', 'M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z'],
  send: ['m22 2-7 20-4-9-9-4 20-7Z', 'M22 2 11 13'],
  database: ['M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3Z', 'M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5', 'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'],
  play: ['M7 4v16l13-8L7 4Z'],
  pause: ['M6 4h4v16H6V4Z', 'M14 4h4v16h-4V4Z'],
  flag: ['M4 21V4', 'M4 4h12l-2 4 2 4H4'],
  circleDot: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
  link: ['M9 15 15 9', 'M11 6l1-1a4 4 0 0 1 6 6l-1 1', 'M13 18l-1 1a4 4 0 0 1-6-6l1-1'],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z']
}

/**
 * Render one glyph.
 * @param {{name: string, size?: number, strokeWidth?: number, style?: object}} props
 * @returns {import('react').ReactElement}
 */
export function Icon({ name, size = 16, strokeWidth = 1.8, style }) {
  const paths = PATHS[name] || PATHS.circleDot
  return h('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
    focusable: 'false',
    style: { display: 'block', flex: 'none', ...style }
  }, paths.map((d, index) => h('path', { key: index, d })))
}
