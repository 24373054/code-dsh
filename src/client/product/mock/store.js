/**
 * Demo store for the trust-platform console.
 *
 * Phase 1 has no browser API: every screen reads this in-memory world, and user
 * actions are applied as optimistic mutations so approval, settlement, and
 * governance flows feel real. The store persists its state to `localStorage`
 * (best effort) so a reload keeps the operator's changes.
 *
 * The backend phase will replace `createDemoStore()` with a remote-backed store
 * that implements the same `subscribe`/`getSnapshot`/`actions` surface.
 */
import { createSeed, ago } from './seed.js'

const STORAGE_KEY = 'dsh-trust-platform.demo-world.v2'

/** Monotonic suffix source for freshly created records. */
let idCounter = 0
/** @returns {string} a unique demo id. */
function nextId(prefix) {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36).slice(-4)}${idCounter.toString(36)}`
}

/**
 * Build the audit event an action appends.
 * @param {object} state
 * @param {{taskId: string, type: string, typeLabel: string, actor: string, body?: string, tone?: string, finality?: string, ledger?: object}} input
 */
function recordEvent(state, input) {
  const event = {
    id: nextId('evt'),
    taskId: input.taskId,
    type: input.type,
    typeLabel: input.typeLabel,
    actor: input.actor,
    actorId: 'agent-mobai',
    at: new Date().toISOString(),
    tone: input.tone || 'neutral',
    verification: 'VALID',
    finality: input.finality || 'PENDING',
    body: input.body || '',
    signature: { algorithm: 'Ed25519', keyId: 'did:trust:starbridge.pay:audit-01#key-1', value: `sig_${nextId('h')}` },
    ledger: input.ledger || null
  }
  state.events = [event, ...state.events]
  return event
}

/**
 * Append a notification.
 * @param {object} state
 * @param {{title: string, body: string, tone?: string, target?: string}} input
 */
function notify(state, input) {
  state.notifications = [{
    id: nextId('ntf'),
    title: input.title,
    body: input.body,
    at: new Date().toISOString(),
    tone: input.tone || 'info',
    read: false,
    target: input.target || 'dashboard'
  }, ...state.notifications]
}

/**
 * Read the persisted world, falling back to a fresh seed on any error.
 * @returns {object}
 */
function loadState() {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.version === 1 && Array.isArray(parsed.tasks) && Array.isArray(parsed.agents)) return parsed
    }
  } catch {
    /* storage unavailable or corrupt: fall through to a fresh seed */
  }
  return createSeed()
}

/**
 * Create the demo store.
 * @returns {object} store
 */
export function createDemoStore() {
  let state = loadState()
  const listeners = new Set()

  const emit = () => {
    for (const listener of listeners) listener()
  }

  const save = () => {
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* quota or privacy mode: the session keeps working in memory */
    }
  }

  /**
   * Apply one mutation, persist, and notify subscribers.
   * @param {(draft: object) => void} mutate
   */
  const commit = (mutate) => {
    mutate(state)
    // Publish a new top-level snapshot so React subscriptions observe the change.
    state = { ...state }
    save()
    emit()
  }

  const actions = {
    /**
     * Approve a pending intervention and let its task proceed.
     * @param {string} id
     * @param {{note?: string, by?: string}} [options]
     */
    approveIntervention(id, options = {}) {
      commit(draft => {
        const item = draft.interventions.find(entry => entry.id === id)
        if (!item || item.status !== 'PENDING') return
        item.status = 'APPROVED'
        item.decidedAt = ago(0)
        item.decidedBy = options.by || '周明（财务负责人）'
        item.decisionNote = options.note || '同意，按流程放行'
        const task = draft.tasks.find(entry => entry.id === item.taskId)
        if (task && (task.status === 'PAYREQ_PENDING' || task.status === 'CREATED')) {
          task.status = 'AUTHORIZED'
          task.updatedAt = ago(0)
        }
        recordEvent(draft, {
          taskId: item.taskId,
          type: 'INTERVENTION_APPROVED',
          typeLabel: '人工复核通过',
          actor: item.decidedBy,
          tone: 'success',
          body: item.decisionNote
        })
        notify(draft, {
          title: `复核已通过：${item.title}`,
          body: `处理人：${item.decidedBy}`,
          tone: 'success',
          target: 'approvals'
        })
      })
    },

    /**
     * Deny a pending intervention and stop the linked task.
     * @param {string} id
     * @param {{note?: string, by?: string}} [options]
     */
    denyIntervention(id, options = {}) {
      commit(draft => {
        const item = draft.interventions.find(entry => entry.id === id)
        if (!item || item.status !== 'PENDING') return
        item.status = 'DENIED'
        item.decidedAt = ago(0)
        item.decidedBy = options.by || '周明（财务负责人）'
        item.decisionNote = options.note || '拒绝，退回业务侧补充材料'
        const task = draft.tasks.find(entry => entry.id === item.taskId)
        if (task && (task.status === 'PAYREQ_PENDING' || task.status === 'CREATED')) {
          task.status = 'CANCELLED'
          task.updatedAt = ago(0)
          task.blockedReason = '人工复核拒绝'
        }
        recordEvent(draft, {
          taskId: item.taskId,
          type: 'INTERVENTION_DENIED',
          typeLabel: '人工复核拒绝',
          actor: item.decidedBy,
          tone: 'danger',
          body: item.decisionNote
        })
        notify(draft, {
          title: `复核已拒绝：${item.title}`,
          body: item.decisionNote,
          tone: 'danger',
          target: 'approvals'
        })
      })
    },

    /**
     * Settle a submitted or confirmed task: append a verified FINAL settlement
     * event, then close the task.
     * @param {string} taskId
     * @param {{by?: string, reference?: string}} [options]
     * @returns {{ok: boolean, reason?: string}}
     */
    settleTask(taskId, options = {}) {
      let result = { ok: false }
      commit(draft => {
        const task = draft.tasks.find(entry => entry.id === taskId)
        if (!task) {
          result = { ok: false, reason: '任务不存在' }
          return
        }
        if (task.status !== 'SUBMITTED' && task.status !== 'CONFIRMED') {
          result = { ok: false, reason: '当前状态不能结算，请先提交付款' }
          return
        }
        const reference = options.reference || `ledger-usdc-${Math.floor(9000 + Math.random() * 900)}`
        const event = recordEvent(draft, {
          taskId: task.id,
          type: 'SETTLEMENT_FINAL',
          typeLabel: '结算终局',
          actor: options.by || '结算代理·小澜',
          tone: 'success',
          finality: 'FINAL',
          body: `已结算 ${task.amount.toLocaleString('en-US')} ${task.currency}`,
          ledger: { scheme: 'USDC 清算网络', reference }
        })
        task.settlementRef = reference
        task.status = 'CLOSED'
        task.updatedAt = ago(0)
        task.closedAt = ago(0)
        task.reviews = [
          ...(task.reviews || []),
          { by: event.actor, at: ago(0), note: '结算事件通过校验，任务关闭' }
        ]
        const delegation = draft.delegations.find(entry => entry.id === task.delegationId)
        if (delegation) delegation.usedToday = Math.min(delegation.dailyLimit, delegation.usedToday + task.amount)
        notify(draft, {
          title: `任务已完成：${task.title}`,
          body: `结算凭证 ${reference} 已通过校验`,
          tone: 'success',
          target: 'tasks'
        })
        result = { ok: true, reference }
      })
      return result
    },

    /**
     * Revoke an active delegation.
     * @param {string} id
     * @param {{reason?: string, by?: string}} [options]
     */
    revokeDelegation(id, options = {}) {
      commit(draft => {
        const item = draft.delegations.find(entry => entry.id === id)
        if (!item || item.status !== 'ACTIVE') return
        item.status = 'REVOKED'
        item.revokedAt = ago(0)
        item.revokeReason = options.reason || '管理员手动撤销'
        recordEvent(draft, {
          taskId: id,
          type: 'DELEGATION_REVOKED',
          typeLabel: '撤销委托',
          actor: options.by || '周明（财务负责人）',
          tone: 'danger',
          body: item.revokeReason
        })
        notify(draft, {
          title: `委托已撤销：${item.name}`,
          body: item.revokeReason,
          tone: 'warn',
          target: 'delegations'
        })
      })
    },

    /**
     * Create a new payment task awaiting authorization.
     * @param {{title: string, counterparty: string, purpose: string, amount: number, currency?: string, delegationId?: string}} input
     * @returns {object|null} the created task
     */
    createTask(input) {
      let created = null
      commit(draft => {
        const amount = Number(input.amount) || 0
        const riskScore = Math.min(0.95, 0.18 + (amount / 200000) * 0.7 + Math.random() * 0.08)
        const task = {
          id: nextId('task'),
          title: input.title,
          counterparty: input.counterparty,
          counterpartyOrg: draft.orgs.find(org => org.name === input.counterparty)?.id || 'org-yunfan',
          purpose: input.purpose,
          amount,
          currency: input.currency || 'USD',
          status: 'CREATED',
          riskScore,
          riskDecision: riskScore >= 0.8 ? 'BLOCK' : riskScore >= 0.6 ? 'DEFER' : riskScore >= 0.4 ? 'THROTTLE' : 'ALLOW',
          delegationId: input.delegationId || 'del-root',
          createdAt: ago(0),
          updatedAt: ago(0),
          invoiceNo: `NEW-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}`,
          reviews: []
        }
        draft.tasks = [task, ...draft.tasks]
        recordEvent(draft, {
          taskId: task.id,
          type: 'TASK_CREATED',
          typeLabel: '创建任务',
          actor: '采购代理·阿澈',
          body: `${task.title} · ${task.amount.toLocaleString('en-US')} ${task.currency}`
        })
        notify(draft, { title: `新任务：${task.title}`, body: '等待授权与风险决策', tone: 'info', target: 'tasks' })
        created = task
      })
      return created
    },

    /**
     * Publish a draft policy.
     * @param {string} id
     */
    publishPolicy(id) {
      commit(draft => {
        const item = draft.policies.find(entry => entry.id === id)
        if (!item || item.status === 'PUBLISHED') return
        item.status = 'PUBLISHED'
        item.publishedAt = ago(0)
        item.publishedBy = '周明（财务负责人）'
        recordEvent(draft, {
          taskId: item.id,
          type: 'POLICY_PUBLISHED',
          typeLabel: '发布策略',
          actor: item.publishedBy,
          tone: 'success',
          body: `${item.name} ${item.version} 已生效`
        })
        notify(draft, { title: '策略已发布', body: `${item.name} ${item.version}`, tone: 'success', target: 'governance' })
      })
    },

    /**
     * Edit a policy's risk thresholds (draft or published, both take a new revision).
     * @param {string} id
     * @param {{block: number, defer: number, throttle: number}} thresholds
     */
    savePolicyThresholds(id, thresholds) {
      commit(draft => {
        const item = draft.policies.find(entry => entry.id === id)
        if (!item) return
        item.thresholds = {
          block: clamp01(thresholds.block),
          defer: clamp01(thresholds.defer),
          throttle: clamp01(thresholds.throttle)
        }
        item.revisedAt = ago(0)
        recordEvent(draft, {
          taskId: item.id,
          type: 'POLICY_REVISED',
          typeLabel: '修改策略',
          actor: '周明（财务负责人）',
          tone: 'info',
          body: `阈值更新为 ${formatThresholds(item.thresholds)}`
        })
      })
    },

    /**
     * Resolve an open case.
     * @param {string} id
     * @param {{conclusion?: string, by?: string}} [options]
     */
    resolveCase(id, options = {}) {
      commit(draft => {
        const item = draft.cases.find(entry => entry.id === id)
        if (!item || item.status === 'RESOLVED') return
        item.status = 'RESOLVED'
        item.resolvedAt = ago(0)
        item.conclusion = options.conclusion || '调查完成，已按结论整改'
        item.coverage = Math.min(1, item.coverage + 0.3)
        item.findings = [...(item.findings || []), { at: ago(0), text: `结案：${item.conclusion}` }]
        recordEvent(draft, {
          taskId: item.id,
          type: 'CASE_RESOLVED',
          typeLabel: '案件结案',
          actor: options.by || '合规审计代理·墨白',
          tone: 'success',
          body: item.conclusion
        })
        notify(draft, { title: `案件已结案：${item.title}`, body: item.conclusion, tone: 'success', target: 'cases' })
      })
    },

    /**
     * Anchor one evidence record.
     * @param {string} id
     */
    anchorEvidence(id) {
      commit(draft => {
        const item = draft.evidence.find(entry => entry.id === id)
        if (!item || item.anchored) return
        item.anchored = true
        item.anchoredAt = ago(0)
      })
    },

    /**
     * Generate a report record.
     * @param {{title: string, period: string, sections?: string[]}} input
     */
    generateReport(input) {
      commit(draft => {
        const report = {
          id: nextId('rpt'),
          title: input.title,
          period: input.period,
          status: 'READY',
          createdAt: ago(0),
          createdBy: '合规审计代理·墨白',
          format: 'PDF · JSON',
          sizeLabel: '1.2 MB',
          sections: input.sections || ['委托链健康度', '风险决策分布', '结算闭环']
        }
        draft.reports = [report, ...draft.reports]
        notify(draft, { title: '报告已生成', body: report.title, tone: 'success', target: 'reports' })
      })
    },

    /**
     * Mark one notification as read.
     * @param {string} id
     */
    markNotificationRead(id) {
      commit(draft => {
        const item = draft.notifications.find(entry => entry.id === id)
        if (item) item.read = true
      })
    },

    /** Mark every notification as read. */
    markAllNotificationsRead() {
      commit(draft => {
        for (const item of draft.notifications) item.read = true
      })
    },

    /** Restore the pristine demo world. */
    resetDemo() {
      state = createSeed()
      save()
      emit()
    },

    /** Persist current state immediately (used by debug/export flows). */
    flush() {
      save()
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot() {
      return state
    },
    getServerSnapshot() {
      return state
    },
    actions
  }
}

/**
 * Clamp a threshold into 0..1.
 * @param {number} value
 * @returns {number}
 */
function clamp01(value) {
  const number = Number(value)
  if (Number.isNaN(number)) return 0
  return Math.max(0, Math.min(1, Math.round(number * 100) / 100))
}

/**
 * Format thresholds for event bodies.
 * @param {{block: number, defer: number, throttle: number}} thresholds
 * @returns {string}
 */
function formatThresholds(thresholds) {
  return `拦截 ${thresholds.block.toFixed(2)} · 转人工 ${thresholds.defer.toFixed(2)} · 限流 ${thresholds.throttle.toFixed(2)}`
}

/** Lazily created singleton store shared by every page. */
let singleton = null

/**
 * Shared demo store for the console.
 * @returns {ReturnType<typeof createDemoStore>}
 */
export function getDemoStore() {
  if (!singleton) singleton = createDemoStore()
  return singleton
}

/** Build a fresh store (tests and reset-after-logout flows). */
export function createIsolatedStore() {
  return createDemoStore()
}
