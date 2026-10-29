/**
 * Product primitives for the trust-platform console.
 *
 * These are presentation-only components: they know nothing about the demo
 * world or the browser API. Pages compose them with plain HTML where a layout
 * is one-off, and with these when the same shape repeats (cards, tables,
 * drawers, status tags, charts).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './icons.jsx'
import { avatarColor, initials } from './format.js'

/**
 * Primary action button.
 * @param {{children?: any, variant?: 'default'|'primary'|'danger'|'ghost', size?: 'sm'|'md'|'lg',
 *   icon?: string, onClick?: Function, disabled?: boolean, type?: string, title?: string, style?: object}} props
 */
export function Button({ children, variant = 'default', size = 'md', icon, onClick, disabled, type = 'button', title, style }) {
  const classes = ['tp-btn']
  if (variant === 'primary') classes.push('tp-btn-primary')
  else if (variant === 'danger') classes.push('tp-btn-danger')
  else if (variant === 'ghost') classes.push('tp-btn-ghost')
  if (size === 'sm') classes.push('tp-btn-sm')
  if (size === 'lg') classes.push('tp-btn-lg')
  return (
    <button type={type} className={classes.join(' ')} onClick={onClick} disabled={disabled} title={title} style={style}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 13 : 15} /> : null}
      {children}
    </button>
  )
}

/**
 * Square icon-only button.
 * @param {{name: string, label: string, onClick?: Function, disabled?: boolean}} props
 */
export function IconButton({ name, label, onClick, disabled }) {
  return (
    <button type="button" className="tp-icon-btn" aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      <Icon name={name} size={16} />
    </button>
  )
}

/**
 * Surface card with an optional header row.
 * @param {{children?: any, title?: any, desc?: any, actions?: any, className?: string, flat?: boolean, style?: object}} props
 */
export function Card({ children, title, desc, actions, className = '', flat = false, style }) {
  return (
    <section className={`tp-card${flat ? ' tp-card-flat' : ''} ${className}`.trim()} style={style}>
      {title || desc || actions ? (
        <header className="tp-card-head">
          <div style={{ minWidth: 0 }}>
            {title ? <div className="tp-card-title">{title}</div> : null}
            {desc ? <div className="tp-card-desc">{desc}</div> : null}
          </div>
          {actions ? <div className="tp-card-actions">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}

/**
 * Page header: title, one-line description, and action cluster.
 * @param {{title: any, desc?: any, actions?: any}} props
 */
export function PageHead({ title, desc, actions }) {
  return (
    <header className="tp-page-head">
      <div className="tp-page-head-text">
        <h1 className="tp-page-title">{title}</h1>
        {desc ? <p className="tp-page-desc">{desc}</p> : null}
      </div>
      {actions ? <div className="tp-page-actions">{actions}</div> : null}
    </header>
  )
}

/**
 * KPI tile.
 * @param {{label: string, value: any, unit?: string, delta?: string, deltaTone?: 'up'|'down', foot?: any,
 *   icon?: string, iconTone?: string}} props
 */
export function StatCard({ label, value, unit, delta, deltaTone = 'up', foot, icon, iconTone }) {
  return (
    <Card flat>
      <div className="tp-stat">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon ? (
            <span style={{
              width: 26, height: 26, borderRadius: 8, display: 'grid', placeItems: 'center',
              background: `color-mix(in srgb, ${iconTone || 'var(--tp-accent)'} 12%, transparent)`,
              color: iconTone || 'var(--tp-accent)'
            }}>
              <Icon name={icon} size={14} />
            </span>
          ) : null}
          <span className="tp-stat-label">{label}</span>
        </div>
        <div className="tp-stat-value">
          {value}
          {unit ? <span className="tp-stat-unit">{unit}</span> : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {delta ? <span className={`tp-stat-delta ${deltaTone}`}>{deltaTone === 'down' ? '▾' : '▴'} {delta}</span> : null}
          {foot ? <span className="tp-stat-foot">{foot}</span> : null}
        </div>
      </div>
    </Card>
  )
}

/**
 * Small pill label.
 * @param {{children?: any, tone?: 'neutral'|'success'|'warn'|'danger'|'info', dot?: boolean, style?: object}} props
 */
export function Tag({ children, tone = 'neutral', dot = false, style }) {
  return (
    <span className={`tp-tag ${tone}`} style={style}>
      {dot ? <span className="tp-tag-dot" /> : null}
      {children}
    </span>
  )
}

/**
 * Status pill resolved from one of the vocabulary maps in `format.js`.
 * @param {{map: Record<string, {label: string, tone: string}>, status: string}} props
 */
export function StatusTag({ map, status }) {
  const entry = map[status] || { label: status || '未知', tone: 'neutral' }
  return <Tag tone={entry.tone} dot>{entry.label}</Tag>
}

/**
 * Rounded square avatar with initials.
 * @param {{name: string, seed?: string, size?: 'sm'|'md'|'lg', style?: object}} props
 */
export function Avatar({ name, seed, size = 'md', style }) {
  const classes = ['tp-avatar']
  if (size === 'sm') classes.push('tp-avatar-sm')
  if (size === 'lg') classes.push('tp-avatar-lg')
  return (
    <span className={classes.join(' ')} style={{ background: avatarColor(seed || name), ...style }} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

/**
 * Search field bound to a query string.
 * @param {{value: string, onChange: (value: string) => void, placeholder?: string}} props
 */
export function SearchInput({ value, onChange, placeholder = '搜索' }) {
  return (
    <label className="tp-search">
      <Icon name="search" size={14} />
      <input
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

/**
 * Pill segmented control.
 * @param {{options: Array<{value: string, label: string, count?: number}>, value: string, onChange: (value: string) => void}} props
 */
export function Segmented({ options, value, onChange }) {
  return (
    <div className="tp-seg" role="group">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {typeof option.count === 'number' ? ` ${option.count}` : ''}
        </button>
      ))}
    </div>
  )
}

/**
 * Native select styled as a pill.
 * @param {{value: string, onChange: (value: string) => void, options: Array<{value: string, label: string}>, label?: string}} props
 */
export function Select({ value, onChange, options, label }) {
  return (
    <select className="tp-select" value={value} aria-label={label || '筛选'} onChange={(event) => onChange(event.target.value)}>
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  )
}

/**
 * Empty state block.
 * @param {{icon?: string, title: string, desc?: string, action?: any}} props
 */
export function EmptyState({ icon = 'layers', title, desc, action }) {
  return (
    <div className="tp-empty">
      <span className="tp-empty-icon"><Icon name={icon} size={22} /></span>
      <div className="tp-empty-title">{title}</div>
      {desc ? <div className="tp-empty-desc">{desc}</div> : null}
      {action}
    </div>
  )
}

/**
 * Right-side drawer.
 * @param {{open: boolean, onClose: () => void, title: any, subtitle?: any, children?: any,
 *   footer?: any, width?: number|string}} props
 */
export function Drawer({ open, onClose, title, subtitle, children, footer, width }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <>
      <div className="tp-drawer-mask" onClick={onClose} role="presentation" />
      <aside className="tp-drawer" style={width ? { width } : undefined} role="dialog" aria-modal="true">
        <header className="tp-drawer-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="tp-card-title">{title}</div>
            {subtitle ? <div className="tp-card-desc">{subtitle}</div> : null}
          </div>
          <IconButton name="x" label="关闭" onClick={onClose} />
        </header>
        <div className="tp-drawer-body">{children}</div>
        {footer ? <footer className="tp-drawer-foot">{footer}</footer> : null}
      </aside>
    </>
  )
}

/**
 * Centered modal.
 * @param {{open: boolean, onClose: () => void, title: any, children?: any, footer?: any}} props
 */
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="tp-modal-mask" onClick={onClose} role="presentation">
      <div className="tp-modal" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}>
        <header className="tp-modal-head">
          <div className="tp-card-title" style={{ flex: 1 }}>{title}</div>
          <IconButton name="x" label="关闭" onClick={onClose} />
        </header>
        <div className="tp-modal-body">{children}</div>
        {footer ? <footer className="tp-modal-foot">{footer}</footer> : null}
      </div>
    </div>
  )
}

/**
 * Lightweight definition list.
 * @param {{items: Array<{k: string, v: any}>}} props
 */
export function KV({ items }) {
  return (
    <dl className="tp-kv">
      {items.filter(item => item && item.v !== undefined && item.v !== null && item.v !== '').map(item => (
        <div key={item.k} style={{ display: 'contents' }}>
          <dt>{item.k}</dt>
          <dd>{item.v}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Vertical event timeline.
 * @param {{items: Array<{title: any, meta?: any, body?: any, tone?: string, icon?: string}>}} props
 */
export function Timeline({ items }) {
  return (
    <div className="tp-timeline">
      {items.map((item, index) => (
        <div className="tp-timeline-item" key={item.key || index}>
          <span className={`tp-timeline-node ${item.tone || ''}`}>
            <Icon name={item.icon || 'circleDot'} size={11} strokeWidth={2} />
          </span>
          <div className="tp-timeline-main">
            <div className="tp-timeline-title">{item.title}</div>
            {item.meta ? <div className="tp-timeline-meta">{item.meta}</div> : null}
            {item.body ? <div className="tp-timeline-body">{item.body}</div> : null}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Thin progress bar.
 * @param {{value: number, tone?: string}} props value is 0..1
 */
export function Progress({ value, tone = '' }) {
  const pct = Math.max(0, Math.min(1, Number(value) || 0)) * 100
  return (
    <div className="tp-progress"><div className={`tp-progress-fill ${tone}`} style={{ width: `${pct}%` }} /></div>
  )
}

/**
 * Vertical bar chart, CSS-only.
 * @param {{items: Array<{label: string, value: number, tone?: string}>, height?: number, format?: (v:number)=>string}} props
 */
export function Bars({ items, height = 84 }) {
  const max = Math.max(1, ...items.map(item => Number(item.value) || 0))
  return (
    <div className="tp-bars" style={{ height }}>
      {items.map(item => (
        <div className="tp-bars-col" key={item.label}>
          <div
            className={`tp-bars-bar ${item.tone || ''}`}
            title={`${item.label}: ${item.value}`}
            style={{ height: `${Math.max(4, (Number(item.value) / max) * (height - 26))}px` }}
          />
          <span className="tp-bars-label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Sparkline polyline.
 * @param {{points: number[], width?: number, height?: number, tone?: string}} props
 */
export function Sparkline({ points, width = 220, height = 48, tone = 'var(--tp-accent)' }) {
  const values = points.length > 1 ? points : [0, 0]
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const step = width / (values.length - 1)
  const path = values
    .map((value, index) => `${index === 0 ? 'M' : 'L'}${(index * step).toFixed(1)},${(height - 4 - ((value - min) / span) * (height - 8)).toFixed(1)}`)
    .join(' ')
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`${path} L${width},${height} L0,${height} Z`} fill="color-mix(in srgb, ${tone} 12%, transparent)" stroke="none" />
      <path d={path} fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Donut chart from weighted segments.
 * @param {{segments: Array<{label: string, value: number, color: string}>, size?: number, thickness?: number, center?: any}} props
 */
export function Donut({ segments, size = 108, thickness = 12, center }) {
  const total = segments.reduce((sum, segment) => sum + (Number(segment.value) || 0), 0) || 1
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--tp-surface-3)" strokeWidth={thickness} />
        {segments.map(segment => {
          const fraction = (Number(segment.value) || 0) / total
          const dash = fraction * circumference
          const element = (
            <circle
              key={segment.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )
          offset += dash
          return element
        })}
      </svg>
      {center ? (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          {center}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Legend row for charts.
 * @param {{items: Array<{label: string, color: string, value?: any}>}} props
 */
export function Legend({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: 3, background: item.color, flex: 'none' }} />
          <span className="tp-muted" style={{ flex: 1 }}>{item.label}</span>
          {item.value !== undefined ? <span className="tp-strong tp-num">{item.value}</span> : null}
        </div>
      ))}
    </div>
  )
}

/**
 * Labelled form control wrapper.
 * @param {{label: string, hint?: string, children?: any}} props
 */
export function Field({ label, hint, children }) {
  return (
    <label className="tp-field">
      <span className="tp-field-label">{label}</span>
      {children}
      {hint ? <span className="tp-field-hint">{hint}</span> : null}
    </label>
  )
}

/**
 * Inline copyable identifier.
 * @param {{children: string, label?: string}} props
 */
export function Copyable({ children, label }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)
  const copy = useCallback(() => {
    try {
      void navigator.clipboard?.writeText(String(children))
    } catch {
      /* clipboard unavailable inside a sandboxed frame */
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1400)
  }, [children])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  return (
    <button
      type="button"
      className="tp-btn tp-btn-ghost tp-btn-sm"
      onClick={copy}
      title={label || '复制'}
      style={{ marginLeft: 'auto', flex: 'none' }}
    >
      <span className="tp-mono">{copied ? '已复制' : children}</span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

const ToastContext = createContext(null)

/**
 * Provide a toast queue to the console tree.
 * @param {{children?: any}} props
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts(current => [...current, { id, message, tone }])
    setTimeout(() => setToasts(current => current.filter(item => item.id !== id)), 3200)
  }, [])
  const value = useMemo(() => ({ push }), [push])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="tp-toast-stack" aria-live="polite">
        {toasts.map(toast => (
          <div className={`tp-toast ${toast.tone}`} key={toast.id}>
            <span className="tp-toast-icon">
              <Icon name={toast.tone === 'error' ? 'alert' : toast.tone === 'info' ? 'info' : 'checkCircle'} size={15} />
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/**
 * Push user feedback through the console's toast queue.
 * @returns {{push: (message: string, tone?: 'success'|'error'|'info') => void}}
 */
export function useToast() {
  const context = useContext(ToastContext)
  return context || { push: () => {} }
}
