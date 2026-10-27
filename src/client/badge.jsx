/**
 * Tiny status pill shared by the tool cards and the overview panel.
 *
 * The shell's primitives package is an allowed baseline module, but a pill is
 * small enough to keep in-package: fewer external requests and no coupling to a
 * primitive's visual contract.
 */
import * as styles from './styles.js'

/**
 * @param {{
 *   tone?: 'neutral' | 'ok' | 'failed' | 'warn' | 'info',
 *   children?: import('react').ReactNode
 * }} props
 */
export function Badge({ tone, children }) {
  if (children === null || children === undefined || children === '') return null
  return <span style={{ ...styles.pill, ...styles.toneStyle(tone) }}>{children}</span>
}
