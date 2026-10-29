/**
 * Formatting helpers and status vocabularies for the trust-platform console.
 *
 * All copy here is Chinese-first; phase-1 of the product works against a demo
 * world whose values are already user-facing. The backend phase will swap the
 * data source, not the vocabulary.
 */

/** Currency codes the demo world uses. */
export const CURRENCY_SYMBOL = { USD: '$', CNY: '¥', EUR: '€', HKD: 'HK$', GBP: '£' }

/**
 * Format an amount as money.
 * @param {number} amount
 * @param {string} [currency]
 * @returns {string}
 */
export function fmtMoney(amount, currency = 'USD') {
  const value = Number(amount) || 0
  const digits = Math.abs(value) >= 1000 ? 0 : 2
  const symbol = CURRENCY_SYMBOL[currency]
  const body = value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  if (symbol) return `${symbol}${body}`
  return `${body} ${currency}`
}

/**
 * Format a plain number with grouping.
 * @param {number} value
 * @param {number} [digits]
 * @returns {string}
 */
export function fmtNum(value, digits = 0) {
  return (Number(value) || 0).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}

/**
 * Format a 0..1 ratio as a percentage.
 * @param {number} ratio
 * @param {number} [digits]
 * @returns {string}
 */
export function fmtPct(ratio, digits = 1) {
  return `${((Number(ratio) || 0) * 100).toFixed(digits)}%`
}

/**
 * Format an ISO timestamp as local date and time.
 * @param {string} iso
 * @returns {string}
 */
export function fmtDateTime(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Format an ISO timestamp as a local date.
 * @param {string} iso
 * @returns {string}
 */
export function fmtDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Format an ISO timestamp relative to now.
 * @param {string} iso
 * @returns {string}
 */
export function fmtRelative(iso) {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const diff = Date.now() - then
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < 0) {
    const ahead = -diff
    if (ahead < hour) return `${Math.round(ahead / minute)} 分钟后`
    if (ahead < day) return `${Math.round(ahead / hour)} 小时后`
    return fmtDate(iso)
  }
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`
  return fmtDate(iso)
}

/**
 * Count down to an ISO timestamp, in coarse Chinese units.
 * @param {string} iso
 * @returns {string}
 */
export function fmtCountdown(iso) {
  const target = new Date(iso).getTime()
  if (Number.isNaN(target)) return '—'
  const diff = target - Date.now()
  if (diff <= 0) return '已超时'
  const minute = 60 * 1000
  const hour = 60 * minute
  if (diff < hour) return `${Math.max(1, Math.ceil(diff / minute))} 分钟`
  if (diff < 24 * hour) return `${Math.ceil(diff / hour)} 小时`
  return `${Math.ceil(diff / (24 * hour))} 天`
}

/**
 * First one or two glyphs of a display name, for avatars.
 * @param {string} name
 * @returns {string}
 */
export function initials(name) {
  const text = String(name || '').trim()
  if (!text) return '—'
  if (/^[\x00-\x7F]+$/.test(text)) {
    return text.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
  }
  return text.slice(0, 2)
}

const AVATAR_COLORS = ['#0a6cff', '#6a5cff', '#1f9d63', '#b36b00', '#d92d20', '#0b8f9a', '#8e44ad', '#c2560a']

/**
 * Deterministic avatar colour from a seed string.
 * @param {string} seed
 * @returns {string}
 */
export function avatarColor(seed) {
  let hash = 0
  const text = String(seed || '')
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) % 100000
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/** Task lifecycle labels plus tag tone. */
export const TASK_STATUS = {
  CREATED: { label: '已创建', tone: 'neutral' },
  AUTHORIZED: { label: '已授权', tone: 'info' },
  DELEGATING: { label: '委托中', tone: 'neutral' },
  QUOTING: { label: '询价中', tone: 'neutral' },
  SELECTED: { label: '已选供应商', tone: 'neutral' },
  PAYREQ_PENDING: { label: '待付款申请', tone: 'warn' },
  SUBMITTED: { label: '已提交', tone: 'warn' },
  CONFIRMED: { label: '已确认', tone: 'info' },
  AUDITED: { label: '已审计', tone: 'info' },
  CLOSED: { label: '已完成', tone: 'success' },
  FAILED: { label: '已失败', tone: 'danger' },
  CANCELLED: { label: '已取消', tone: 'neutral' }
}

/** Intervention (approval) lifecycle labels. */
export const INTERVENTION_STATUS = {
  PENDING: { label: '待处理', tone: 'warn' },
  APPROVED: { label: '已通过', tone: 'success' },
  DENIED: { label: '已拒绝', tone: 'danger' },
  EXPIRED: { label: '已超时', tone: 'neutral' }
}

/** Risk decisions. */
export const RISK_DECISION = {
  ALLOW: { label: '放行', tone: 'success' },
  THROTTLE: { label: '限流', tone: 'info' },
  DEFER: { label: '转人工', tone: 'warn' },
  BLOCK: { label: '拦截', tone: 'danger' }
}

/** Credential status. */
export const CREDENTIAL_STATUS = {
  ACTIVE: { label: '有效', tone: 'success' },
  SUSPENDED: { label: '已暂停', tone: 'warn' },
  REVOKED: { label: '已吊销', tone: 'danger' },
  EXPIRED: { label: '已过期', tone: 'neutral' }
}

/** DID / agent status. */
export const DID_STATUS = {
  ACTIVE: { label: '在册', tone: 'success' },
  SUSPENDED: { label: '已暂停', tone: 'warn' },
  REVOKED: { label: '已注销', tone: 'danger' }
}

/** Delegation status. */
export const DELEGATION_STATUS = {
  ACTIVE: { label: '生效中', tone: 'success' },
  REVOKED: { label: '已撤销', tone: 'danger' },
  EXPIRED: { label: '已过期', tone: 'neutral' }
}

/** Case status. */
export const CASE_STATUS = {
  OPEN: { label: '处理中', tone: 'warn' },
  RESOLVED: { label: '已结案', tone: 'success' },
  ESCALATED: { label: '已升级', tone: 'danger' }
}

/** Event finality. */
export const FINALITY = {
  PENDING: { label: '待结算', tone: 'warn' },
  CONFIRMED: { label: '已确认', tone: 'info' },
  FINAL: { label: '已终局', tone: 'success' }
}

/** Event verification outcome. */
export const VERIFICATION = {
  VALID: { label: '校验通过', tone: 'success' },
  INVALID: { label: '校验失败', tone: 'danger' },
  UNKNOWN: { label: '未校验', tone: 'neutral' }
}

/** Evidence kinds. */
export const EVIDENCE_KIND = {
  identity: '主体身份',
  credential: '凭证签发',
  delegation: '委托授权',
  authorization: '付款授权',
  risk: '风险决策',
  settlement: '结算凭证',
  audit: '审计事件'
}

/** Policy lifecycle. */
export const POLICY_STATUS = {
  PUBLISHED: { label: '已发布', tone: 'success' },
  DRAFT: { label: '草稿', tone: 'neutral' },
  RETIRED: { label: '已退役', tone: 'neutral' }
}

/** Report lifecycle. */
export const REPORT_STATUS = {
  READY: { label: '可下载', tone: 'success' },
  GENERATING: { label: '生成中', tone: 'info' },
  FAILED: { label: '生成失败', tone: 'danger' }
}

/**
 * Risk band from a 0..1 score.
 * @param {number} score
 * @returns {{label: string, tone: string}}
 */
export function riskBand(score) {
  const value = Number(score) || 0
  if (value >= 0.8) return { label: '高风险', tone: 'danger' }
  if (value >= 0.6) return { label: '中高风险', tone: 'warn' }
  if (value >= 0.4) return { label: '中等风险', tone: 'warn' }
  return { label: '低风险', tone: 'success' }
}

/**
 * Short, middle-truncated identifier for dense tables.
 * @param {string} value
 * @param {number} [head]
 * @param {number} [tail]
 * @returns {string}
 */
export function shortId(value, head = 10, tail = 4) {
  const text = String(value || '')
  if (text.length <= head + tail + 1) return text
  return `${text.slice(0, head)}…${text.slice(-tail)}`
}
