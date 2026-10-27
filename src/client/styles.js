/**
 * Shared inline-style constants for the browser half.
 *
 * The plugin renders inside the shell's plugin manager and conversation
 * surfaces, so it must follow the shell's theme instead of assuming one. Every
 * colour therefore reads a `--dsw-*` custom property with a neutral fallback;
 * the shell may redefine those properties per theme and the cards follow.
 */

/** Muted text colour fallback shared by several deprecated readers. */
const MUTED = 'var(--dsw-color-text-secondary, #6b7280)'

export const card = {
  border: '1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.25))',
  borderRadius: '8px',
  padding: '8px 10px',
  margin: '6px 0',
  background: 'var(--dsw-color-surface, transparent)'
}

export const cardHead = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  flexWrap: 'wrap'
}

export const cardTitle = {
  fontWeight: 600,
  color: 'var(--dsw-color-text-primary, inherit)'
}

export const cardSummary = {
  color: MUTED,
  fontSize: '12px',
  marginTop: '4px',
  wordBreak: 'break-word'
}

export const raw = {
  margin: '8px 0 0',
  padding: '8px',
  maxHeight: '240px',
  overflow: 'auto',
  fontSize: '11px',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  borderRadius: '6px',
  background: 'var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.08))',
  fontFamily: 'var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
  color: 'var(--dsw-color-text-primary, inherit)'
}

export const linkButton = {
  marginTop: '6px',
  padding: '0',
  border: 'none',
  background: 'transparent',
  color: 'var(--dsw-color-accent, #2563eb)',
  cursor: 'pointer',
  fontSize: '12px'
}

export const actionButton = {
  padding: '2px 8px',
  borderRadius: '6px',
  border: '1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.25))',
  background: 'var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.08))',
  color: 'var(--dsw-color-text-primary, inherit)',
  cursor: 'pointer',
  fontSize: '12px'
}

export const section = {
  marginTop: '16px',
  padding: '12px 14px',
  border: '1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.25))',
  borderRadius: '10px',
  background: 'var(--dsw-color-surface, transparent)',
  color: 'var(--dsw-color-text-primary, inherit)',
  fontSize: '13px'
}

export const sectionHead = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap'
}

export const sectionTitle = {
  fontWeight: 600,
  fontSize: '14px'
}

export const actions = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginLeft: 'auto',
  flexWrap: 'wrap'
}

export const meta = {
  color: MUTED,
  fontSize: '11px',
  marginTop: '4px'
}

export const metaRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  color: MUTED,
  fontSize: '12px',
  marginTop: '8px'
}

export const mono = {
  fontFamily: 'var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
  fontSize: '11px'
}

export const counts = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(112px, 1fr))',
  gap: '8px',
  marginTop: '10px'
}

export const countCell = {
  padding: '8px 10px',
  borderRadius: '8px',
  background: 'var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.08))'
}

export const countValue = {
  fontSize: '18px',
  fontWeight: 600,
  lineHeight: 1.2
}

export const countLabel = {
  color: MUTED,
  fontSize: '11px',
  marginTop: '2px'
}

export const subTitle = {
  fontWeight: 600,
  fontSize: '12px',
  marginTop: '14px'
}

export const list = {
  margin: '6px 0 0',
  padding: 0,
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
}

export const eventRow = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
  flexWrap: 'wrap',
  paddingTop: '4px',
  borderTop: '1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.18))',
  fontSize: '12px'
}

export const eventType = {
  fontFamily: 'var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
  fontSize: '11px',
  color: 'var(--dsw-color-text-primary, inherit)'
}

export const eventActor = {
  color: MUTED,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '240px'
}

export const eventTime = {
  color: MUTED,
  marginLeft: 'auto',
  fontSize: '11px'
}

export const muted = {
  color: MUTED,
  fontSize: '12px',
  marginTop: '8px'
}

export const errorBox = {
  marginTop: '8px',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid var(--dsw-color-danger-border, rgba(198, 40, 40, 0.35))',
  background: 'var(--dsw-color-danger-bg, rgba(198, 40, 40, 0.08))',
  color: 'var(--dsw-color-danger, #c62828)',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap'
}

export const staleBox = {
  marginTop: '8px',
  padding: '6px 10px',
  borderRadius: '8px',
  border: '1px solid var(--dsw-color-warning-border, rgba(154, 103, 0, 0.35))',
  background: 'var(--dsw-color-warning-bg, rgba(154, 103, 0, 0.08))',
  color: 'var(--dsw-color-warning, #9a6700)',
  fontSize: '12px'
}

export const pluginBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0 8px',
  height: '20px',
  borderRadius: '10px',
  border: '1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.3))',
  background: 'var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.1))',
  color: MUTED,
  fontSize: '11px',
  fontWeight: 600,
  whiteSpace: 'nowrap'
}

/** Settings form: one column of label/control rows. */
export const form = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginTop: '10px'
}

export const formRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  paddingTop: '6px',
  borderTop: '1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.18))'
}

export const formLabel = {
  flex: '0 0 220px',
  color: MUTED,
  fontSize: '12px'
}

export const formControl = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: '1 1 240px',
  minWidth: '160px'
}

export const input = {
  flex: '1 1 240px',
  minWidth: '160px',
  padding: '4px 8px',
  borderRadius: '6px',
  border: '1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.3))',
  background: 'var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.08))',
  color: 'var(--dsw-color-text-primary, inherit)',
  fontSize: '12px'
}

export const inputNumber = {
  flex: '0 0 180px',
  minWidth: '150px',
  padding: '4px 8px',
  borderRadius: '6px',
  border: '1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.3))',
  background: 'var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.08))',
  color: 'var(--dsw-color-text-primary, inherit)',
  fontSize: '12px'
}

export const checkbox = {
  width: '14px',
  height: '14px',
  accentColor: 'var(--dsw-color-accent, #2563eb)'
}

export const inputDisabled = {
  opacity: 0.55,
  cursor: 'not-allowed'
}

export const hint = {
  color: MUTED,
  fontSize: '11px'
}

export const formActions = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  marginTop: '10px'
}

/** Save/apply button; the shell accent marks the primary action. */
export const primaryButton = {
  ...actionButton,
  borderColor: 'var(--dsw-color-accent-border, rgba(37, 99, 235, 0.35))',
  color: 'var(--dsw-color-accent, #2563eb)',
  fontWeight: 600
}

/** Destructive button for the reset action. */
export const dangerButton = {
  ...actionButton,
  borderColor: 'var(--dsw-color-danger-border, rgba(198, 40, 40, 0.35))',
  color: 'var(--dsw-color-danger, #c62828)'
}

export const buttonDisabled = {
  opacity: 0.55,
  cursor: 'not-allowed'
}

/** Confirmation strip shown before a destructive reset. */
export const confirmBox = {
  marginTop: '8px',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid var(--dsw-color-warning-border, rgba(154, 103, 0, 0.35))',
  background: 'var(--dsw-color-warning-bg, rgba(154, 103, 0, 0.08))',
  color: 'var(--dsw-color-warning, #9a6700)',
  fontSize: '12px'
}

/** Success strip after saving or resetting. */
export const feedbackOk = {
  marginTop: '8px',
  padding: '6px 10px',
  borderRadius: '8px',
  border: '1px solid var(--dsw-color-success-border, rgba(26, 127, 55, 0.35))',
  background: 'var(--dsw-color-success-bg, rgba(26, 127, 55, 0.08))',
  color: 'var(--dsw-color-success, #1a7f37)',
  fontSize: '12px'
}

/** Footnote under a settings block (hints, persistence notes). */
export const note = {
  marginTop: '10px',
  color: MUTED,
  fontSize: '11px',
  lineHeight: 1.5
}

/** Shared shape of a status/decision pill; tone styles only recolour it. */
export const pill = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0 6px',
  height: '18px',
  borderRadius: '9px',
  border: '1px solid transparent',
  fontSize: '11px',
  fontWeight: 600,
  lineHeight: '18px',
  whiteSpace: 'nowrap'
}

/** @type {Record<string, { color: string, background: string, borderColor: string }>} */
const TONES = {
  neutral: {
    color: 'var(--dsw-color-text-secondary, #6b7280)',
    background: 'var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.1))',
    borderColor: 'var(--dsw-color-border, rgba(127, 127, 127, 0.3))'
  },
  ok: {
    color: 'var(--dsw-color-success, #1a7f37)',
    background: 'var(--dsw-color-success-bg, rgba(26, 127, 55, 0.12))',
    borderColor: 'var(--dsw-color-success-border, rgba(26, 127, 55, 0.35))'
  },
  failed: {
    color: 'var(--dsw-color-danger, #c62828)',
    background: 'var(--dsw-color-danger-bg, rgba(198, 40, 40, 0.12))',
    borderColor: 'var(--dsw-color-danger-border, rgba(198, 40, 40, 0.35))'
  },
  warn: {
    color: 'var(--dsw-color-warning, #9a6700)',
    background: 'var(--dsw-color-warning-bg, rgba(154, 103, 0, 0.12))',
    borderColor: 'var(--dsw-color-warning-border, rgba(154, 103, 0, 0.35))'
  },
  info: {
    color: 'var(--dsw-color-accent, #2563eb)',
    background: 'var(--dsw-color-accent-bg, rgba(37, 99, 235, 0.12))',
    borderColor: 'var(--dsw-color-accent-border, rgba(37, 99, 235, 0.35))'
  }
}

/** Colour overrides for a pill tone, falling back to neutral. */
export function toneStyle(tone) {
  return TONES[tone] || TONES.neutral
}
