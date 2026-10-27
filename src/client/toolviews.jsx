/**
 * Tool-call renderers for the trust-platform tools.
 *
 * The conversation surface renders each tool call through a keyed
 * `tool.call.toolview` entry. The host half always renders its result as one
 * text block holding the pretty-printed canonical JSON, so every card is a
 * compact status line plus an opt-in raw view; parsing is delegated to
 * `format.js`, which degrades to the raw text instead of throwing.
 */
import { useState } from 'react'
import { Badge } from './badge.jsx'
import {
  decisionTone,
  hasCopy,
  hasRawPayload,
  rawPayload,
  resultSummary,
  toolDecision,
  toolState,
  translate
} from './format.js'
import * as styles from './styles.js'

/**
 * The eight canonical tools this package renders. Control-plane-only adapter
 * tools keep the shell's default renderer; these eight are the shared
 * identity, authorization, payment-intent and receipt vocabulary.
 */
export const TOOL_KEYS = Object.freeze([
  'register_identity',
  'get_identity_status',
  'verify_credential',
  'check_authorization',
  'create_payment_task',
  'get_risk_decision',
  'verify_operation_event',
  'get_execution_receipt'
])

/** Status pill tone for a card state. */
function stateTone(state) {
  if (state === 'ok') return 'ok'
  if (state === 'failed') return 'failed'
  return 'neutral'
}

/**
 * One compact tool-call card.
 *
 * @param {{
 *   t?: (key: string, params?: Record<string, unknown>) => string,
 *   phase?: 'preparing' | 'start' | 'result' | string,
 *   block?: Record<string, unknown> | null,
 *   toolName?: string,
 * }} props
 */
export function ToolCard(props) {
  const { t, phase, block, toolName } = props || {}
  const [open, setOpen] = useState(false)
  const name = typeof toolName === 'string' && toolName
    ? toolName
    : block && typeof block.name === 'string' && block.name
      ? block.name
      : ''
  const titleKey = `tool.${name}`
  const title = hasCopy(titleKey) ? translate(t, titleKey) : translate(t, 'tool.unknown')
  const state = toolState(phase, block)
  const summary = phase === 'result' ? resultSummary(block, t) : translate(t, 'result.waiting')
  const decision = phase === 'result' ? toolDecision(block) : null
  const expandable = phase === 'result' && hasRawPayload(block)
  const raw = open && expandable ? rawPayload(block) : null

  return (
    <div style={styles.card} data-trust-tool={name || undefined}>
      <div style={styles.cardHead}>
        <span style={styles.cardTitle}>{title}</span>
        <Badge tone={stateTone(state)}>{translate(t, `status.${state}`)}</Badge>
        {decision ? <Badge tone={decisionTone(decision)}>{decision}</Badge> : null}
      </div>
      <div style={styles.cardSummary}>{summary}</div>
      {expandable ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          style={styles.linkButton}
        >
          {translate(t, open ? 'card.raw.hide' : 'card.raw.show')}
        </button>
      ) : null}
      {raw ? <pre style={styles.raw}>{raw}</pre> : null}
    </div>
  )
}
