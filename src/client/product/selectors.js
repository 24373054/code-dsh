/**
 * Derived data for the trust-platform console.
 *
 * Pages read the raw demo world through `useWorld()` and then call these pure
 * helpers; nothing here mutates state, so screens stay cheap and predictable.
 */
import { RISK_DECISION, TASK_STATUS } from './ui/format.js'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Canonical task progression used by progress bars. */
export const TASK_FLOW = ['CREATED', 'AUTHORIZED', 'PAYREQ_PENDING', 'SUBMITTED', 'CONFIRMED', 'AUDITED', 'CLOSED']

/**
 * @param {object} world
 * @param {string} id
 */
export function taskById(world, id) {
  return world.tasks.find(task => task.id === id) || null
}

/**
 * @param {object} world
 * @param {string} id
 */
export function agentById(world, id) {
  return world.agents.find(agent => agent.id === id) || null
}

/**
 * @param {object} world
 * @param {string} id
 */
export function delegationById(world, id) {
  return world.delegations.find(item => item.id === id) || null
}

/**
 * @param {object} world
 * @param {string} id
 */
export function caseById(world, id) {
  return world.cases.find(item => item.id === id) || null
}

/**
 * @param {object} world
 * @param {string} id
 */
export function agentByDid(world, did) {
  return world.agents.find(agent => agent.did === did) || null
}

/** Pending approvals, soonest deadline first. */
export function openInterventions(world) {
  return world.interventions
    .filter(item => item.status === 'PENDING')
    .sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime())
}

/** How many approvals are past their due time. */
export function overdueCount(world) {
  return world.interventions.filter(item => item.status === 'PENDING' && new Date(item.dueAt).getTime() < Date.now()).length
}

/**
 * Headline numbers for the dashboard and sidebar badges.
 * @param {object} world
 */
export function dashboardStats(world) {
  const totalTasks = world.tasks.length
  const closedTasks = world.tasks.filter(task => task.status === 'CLOSED').length
  const settledVolume = world.tasks
    .filter(task => ['SUBMITTED', 'CONFIRMED', 'AUDITED', 'CLOSED'].includes(task.status))
    .reduce((sum, task) => sum + task.amount, 0)
  const monthlyVolume = world.agents.reduce((sum, agent) => sum + agent.monthlyVolume, 0)
  const decided = world.interventions.filter(item => item.status === 'APPROVED' || item.status === 'DENIED')
  const avgDecisionMinutes = decided.length
    ? decided.reduce((sum, item) => sum + Math.max(1, (new Date(item.decidedAt).getTime() - new Date(item.requestedAt).getTime()) / MINUTE), 0) / decided.length
    : 0
  const blocked = world.tasks.filter(task => task.riskDecision === 'BLOCK').length
  const humanReview = world.tasks.filter(task => task.riskDecision === 'DEFER' || task.riskDecision === 'THROTTLE').length
  return {
    totalTasks,
    closedTasks,
    settledVolume,
    monthlyVolume,
    openApprovals: openInterventions(world).length,
    overdueApprovals: overdueCount(world),
    activeDelegations: world.delegations.filter(item => item.status === 'ACTIVE').length,
    activeAgents: world.agents.filter(agent => agent.status === 'ACTIVE').length,
    activeCredentials: world.credentials.filter(item => item.status === 'ACTIVE').length,
    blocked,
    humanReview,
    anchorRate: world.evidence.length ? world.evidence.filter(item => item.anchored).length / world.evidence.length : 0,
    avgDecisionMinutes,
    verificationRate: world.events.length ? world.events.filter(event => event.verification === 'VALID').length / world.events.length : 0,
    riskEvents7d: world.events.filter(event => event.type.startsWith('RISK_') && Date.now() - new Date(event.at).getTime() < 7 * DAY).length,
    openCases: world.cases.filter(item => item.status !== 'RESOLVED').length,
    successRate: totalTasks ? closedTasks / totalTasks : 0
  }
}

/** Risk decision mix over all tasks. */
export function riskDistribution(world) {
  return Object.keys(RISK_DECISION).map(key => ({
    key,
    ...RISK_DECISION[key],
    count: world.tasks.filter(task => task.riskDecision === key).length
  }))
}

/** Seven-day task volume series (oldest → today). */
export function volumeSeries(world, days = 7) {
  const buckets = []
  const history = Array.isArray(world.volumeHistory) ? world.volumeHistory : []
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const start = now.getTime() - offset * DAY
    const end = start + DAY
    const tasks = world.tasks.filter(task => {
      const at = new Date(task.createdAt).getTime()
      return at >= start && at < end
    })
    // Past days come from the seeded trend; today is live from the tasks so the
    // chart answers immediately when the operator settles a payment.
    const seeded = offset > 0 ? (history[offset - 1] || 0) : 0
    const live = tasks.reduce((sum, task) => sum + task.amount, 0)
    buckets.push({
      label: `${new Date(start).getMonth() + 1}/${new Date(start).getDate()}`,
      value: offset > 0 ? seeded : live,
      count: tasks.length,
      isToday: offset === 0
    })
  }
  return buckets
}

/** Delegation chain root → leaf. */
export function chainFor(world, delegationId) {
  const chain = []
  let current = delegationById(world, delegationId)
  let guard = 0
  while (current && guard < 12) {
    chain.unshift(current)
    current = current.parentId ? delegationById(world, current.parentId) : null
    guard += 1
  }
  return chain
}

/** Effective limits of a delegation chain (narrowest wins). */
export function chainEffective(world, delegationId) {
  const chain = chainFor(world, delegationId)
  if (!chain.length) return null
  const active = chain.every(item => item.status === 'ACTIVE')
  const amountLimit = Math.min(...chain.map(item => item.amountLimit))
  const dailyLimit = Math.min(...chain.map(item => item.dailyLimit))
  const usedToday = chain.length ? chain[chain.length - 1].usedToday : 0
  const actions = chain.map(item => item.actionLabels)
  return {
    active,
    chain,
    amountLimit,
    dailyLimit,
    dailyRemaining: Math.max(0, dailyLimit - usedToday),
    usedToday,
    leafActions: actions[actions.length - 1] || []
  }
}

/** Events for one task, oldest first (timeline order). */
export function taskEvents(world, taskId) {
  return world.events
    .filter(event => event.taskId === taskId)
    .sort((left, right) => new Date(left.at).getTime() - new Date(right.at).getTime())
}

/** Interventions linked to a task. */
export function interventionsForTask(world, taskId) {
  return world.interventions.filter(item => item.taskId === taskId)
}

/** Evidence tied to a task id mentioned in its subject. */
export function evidenceForTask(world, taskId) {
  return world.evidence.filter(item => item.subject.includes(taskId))
}

/** Progress ratio through the canonical task flow. */
export function taskProgress(task) {
  const terminal = ['CLOSED', 'FAILED', 'CANCELLED']
  if (terminal.includes(task.status)) {
    return task.status === 'CLOSED' ? { ratio: 1, step: TASK_FLOW.length, label: '已完成' } : { ratio: 0, step: TASK_FLOW.indexOf('CREATED') + 1, label: TASK_STATUS[task.status]?.label || task.status }
  }
  const index = TASK_FLOW.indexOf(task.status)
  const step = Math.max(1, index + 1)
  return { ratio: step / TASK_FLOW.length, step, label: TASK_STATUS[task.status]?.label || task.status }
}

/** Most recent audit activity across the world. */
export function recentActivity(world, limit = 8) {
  return [...world.events]
    .sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime())
    .slice(0, limit)
}

/** Unread notifications. */
export function unreadNotifications(world) {
  return world.notifications.filter(item => !item.read)
}

/** Top agents by monthly volume. */
export function agentLeaderboard(world, limit = 4) {
  return [...world.agents]
    .filter(agent => agent.role !== 'compliance')
    .sort((left, right) => right.monthlyVolume - left.monthlyVolume)
    .slice(0, limit)
}

/** Tasks that need attention on the dashboard. */
export function attentionItems(world) {
  const items = []
  const overdue = world.interventions.filter(item => item.status === 'PENDING' && new Date(item.dueAt).getTime() < Date.now())
  for (const item of overdue) items.push({ tone: 'danger', title: `复核超时：${item.title}`, detail: `已超时，需立即处理`, to: 'approvals' })
  const blocked = world.tasks.filter(task => task.status === 'CREATED' && task.riskDecision === 'BLOCK')
  for (const task of blocked) items.push({ tone: 'warn', title: `付款被拦截：${task.title}`, detail: task.blockedReason || '等待人工介入', to: 'tasks', params: { taskId: task.id } })
  const escalated = world.cases.filter(item => item.status === 'ESCALATED')
  for (const item of escalated) items.push({ tone: 'danger', title: `案件升级：${item.title}`, detail: '已升级至合规委员会', to: 'audit', params: { caseId: item.id } })
  const expiring = world.delegations.filter(item => item.status === 'ACTIVE' && new Date(item.validTo).getTime() - Date.now() < 3 * DAY)
  for (const item of expiring) items.push({ tone: 'info', title: `委托即将到期：${item.name}`, detail: '3 天内到期，请确认是否续期', to: 'delegations' })
  return items
}

/** Case summary counts. */
export function caseStats(world) {
  return {
    open: world.cases.filter(item => item.status === 'OPEN').length,
    escalated: world.cases.filter(item => item.status === 'ESCALATED').length,
    resolved: world.cases.filter(item => item.status === 'RESOLVED').length,
    avgCoverage: world.cases.length ? world.cases.reduce((sum, item) => sum + item.coverage, 0) / world.cases.length : 0
  }
}

/** Agents ordered for the roster page. */
export function roster(world) {
  return [...world.agents].sort((left, right) => {
    if (left.role === 'compliance') return 1
    if (right.role === 'compliance') return -1
    return right.monthlyVolume - left.monthlyVolume
  })
}

/** Tasks touched by one agent (via events). */
export function agentTaskIds(world, agentId) {
  const agent = agentById(world, agentId)
  if (!agent) return []
  const dids = new Set([agent.did])
  const ids = new Set()
  for (const event of world.events) {
    if (event.actorId === agentId || (event.actor && agent.name && event.actor.includes(agent.shortName))) ids.add(event.taskId)
  }
  for (const task of world.tasks) {
    if (task.delegationId && ids.size < 4 && new Date(task.createdAt).getTime() > 0) {
      const chain = chainFor(world, task.delegationId)
      if (chain.some(item => item.subjectId === agentId)) ids.add(task.id)
    }
  }
  return [...ids]
}

/** Global search over tasks, agents, cases and policies. */
export function searchAll(world, query) {
  const text = String(query || '').trim().toLowerCase()
  if (!text) return []
  const hits = []
  for (const task of world.tasks) {
    if (`${task.title} ${task.counterparty} ${task.invoiceNo}`.toLowerCase().includes(text)) hits.push({ kind: 'task', id: task.id, title: task.title, detail: `${task.counterparty} · ${task.status}` })
  }
  for (const agent of world.agents) {
    if (`${agent.name} ${agent.did} ${agent.roleLabel}`.toLowerCase().includes(text)) hits.push({ kind: 'agent', id: agent.id, title: agent.name, detail: agent.roleLabel })
  }
  for (const item of world.cases) {
    if (`${item.title} ${item.summary}`.toLowerCase().includes(text)) hits.push({ kind: 'case', id: item.id, title: item.title, detail: item.status })
  }
  for (const item of world.policies.concat(world.models)) {
    if (`${item.name} ${item.version}`.toLowerCase().includes(text)) hits.push({ kind: 'governance', id: item.id, title: item.name, detail: item.version })
  }
  return hits.slice(0, 12)
}
