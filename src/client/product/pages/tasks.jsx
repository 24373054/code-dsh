/**
 * 付款任务 — every payment an agent has submitted, plus the full trail behind
 * one task: how far it got, which delegation authorises it, what the rules
 * decided, who reviewed it, and which evidence backs it.
 *
 * The list is the finance operator's queue. The detail view is deliberately
 * read-only apart from submitting settlement, so an auditor can reconstruct
 * the task without mutating it.
 */
import { useState } from 'react'
import { useActions, useWorld } from '../hooks.js'
import { useNavigation } from '../app/navigation.jsx'
import {
  chainEffective, chainFor, delegationById, evidenceForTask, interventionsForTask,
  taskById, taskEvents, taskProgress, TASK_FLOW
} from '../selectors.js'
import {
  DELEGATION_STATUS, EVIDENCE_KIND, FINALITY, fmtCountdown, fmtDateTime, fmtMoney, fmtPct,
  fmtRelative, INTERVENTION_STATUS, riskBand, RISK_DECISION, shortId, TASK_STATUS, VERIFICATION
} from '../ui/format.js'
import {
  Avatar, Button, Card, Copyable, EmptyState, Field, KV, Modal, PageHead, Progress,
  SearchInput, Segmented, Select, StatCard, StatusTag, Tag, Timeline, useToast
} from '../ui/primitives.jsx'
import { Icon } from '../ui/icons.jsx'

/** Status buckets behind the segmented filter. */
const STATUS_GROUPS = {
  pending: ['CREATED', 'PAYREQ_PENDING'],
  progress: ['AUTHORIZED', 'DELEGATING', 'QUOTING', 'SELECTED', 'SUBMITTED', 'CONFIRMED', 'AUDITED'],
  done: ['CLOSED'],
  exception: ['FAILED', 'CANCELLED']
}

const FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'progress', label: '进行中' },
  { value: 'done', label: '已完成' },
  { value: 'exception', label: '异常' }
]

const RISK_OPTIONS = [
  { value: 'all', label: '全部风险决策' },
  ...Object.entries(RISK_DECISION).map(([value, item]) => ({ value, label: item.label }))
]

const TERMINAL_BAD_STATES = ['FAILED', 'CANCELLED']

const sumAmount = (tasks) => tasks.reduce((total, task) => total + (Number(task.amount) || 0), 0)

/** Payment queue: filter, search and open one task. */
export function TasksPage() {
  const world = useWorld()
  const actions = useActions()
  const toast = useToast()
  const { navigate, route } = useNavigation()
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(Boolean(route.params?.create))
  const [draft, setDraft] = useState({ title: '', counterparty: '云帆贸易', amount: '', purpose: '', delegationId: 'del-root' })
  const orgOptions = world.orgs.map(org => ({ value: org.name, label: org.name }))
  const delegationOptions = world.delegations
    .filter(item => item.status === 'ACTIVE')
    .map(item => ({ value: item.id, label: item.name }))
  const openCreate = () => setCreateOpen(true)
  const submitCreate = () => {
    const amount = Number(draft.amount)
    if (!draft.title.trim() || !amount || amount <= 0) {
      toast.push('请填写付款用途与金额', 'error')
      return
    }
    const created = actions.createTask({
      ...draft,
      amount,
      title: draft.title.trim(),
      purpose: draft.purpose.trim() || '代理发起的付款申请'
    })
    setCreateOpen(false)
    setDraft({ title: '', counterparty: '云帆贸易', amount: '', purpose: '', delegationId: 'del-root' })
    if (created) {
      toast.push('付款任务已创建，等待授权与风险决策', 'success')
      navigate('task', { taskId: created.id })
    }
  }

  const tasks = [...world.tasks].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  const filterOptions = FILTERS.map(item => ({
    value: item.value,
    label: item.label,
    count: item.value === 'all' ? tasks.length : tasks.filter(task => STATUS_GROUPS[item.value].includes(task.status)).length
  }))

  const query = keyword.trim().toLowerCase()
  const visible = tasks.filter(task => {
    const group = filter === 'all' ? null : STATUS_GROUPS[filter]
    if (group && !group.includes(task.status)) return false
    if (riskFilter !== 'all' && task.riskDecision !== riskFilter) return false
    if (!query) return true
    const delegation = delegationById(world, task.delegationId)
    return [task.title, task.counterparty, task.invoiceNo, task.purpose, task.id, delegation?.subjectName || '']
      .some(text => String(text || '').toLowerCase().includes(query))
  })

  const pending = tasks.filter(task => STATUS_GROUPS.pending.includes(task.status))
  const inFlight = tasks.filter(task => STATUS_GROUPS.progress.includes(task.status))
  const closed = tasks.filter(task => task.status === 'CLOSED')
  const blocked = tasks.filter(task => task.riskDecision === 'BLOCK' && task.status !== 'CLOSED')
  const hasFilter = Boolean(query) || filter !== 'all' || riskFilter !== 'all'
  const resetFilters = () => {
    setKeyword('')
    setFilter('all')
    setRiskFilter('all')
  }

  return (
    <div className="tp-page">
      <PageHead
        title="付款任务"
        desc="公司代理提交的每一笔付款都在这里留痕。授权、风控、人工复核与结算结果实时更新。"
        actions={(
          <div className="tp-inline">
            <Segmented value={filter} onChange={setFilter} options={filterOptions} />
            <Button variant="primary" icon="plus" onClick={openCreate}>新建付款任务</Button>
          </div>
        )}
      />

      <div className="tp-stat-grid">
        <StatCard
          label="待处理任务"
          value={pending.length}
          unit="笔"
          icon="clock"
          iconTone="var(--tp-warn)"
          foot="等待授权、补材料或人工复核"
        />
        <StatCard
          label="在途金额"
          value={fmtMoney(sumAmount(inFlight))}
          icon="send"
          iconTone="var(--tp-info)"
          foot={`${inFlight.length} 笔任务正在执行`}
        />
        <StatCard
          label="已结算金额"
          value={fmtMoney(sumAmount(closed))}
          icon="checkCircle"
          iconTone="var(--tp-success)"
          foot={`${closed.length} 笔已完成并关闭`}
        />
        <StatCard
          label="风控拦截"
          value={blocked.length}
          unit="笔"
          icon="shield"
          iconTone="var(--tp-danger)"
          foot={`涉及金额 ${fmtMoney(sumAmount(blocked))}`}
        />
      </div>

      <div className="tp-toolbar">
        <SearchInput value={keyword} onChange={setKeyword} placeholder="搜索任务、收款方或发票号" />
        <Select value={riskFilter} onChange={setRiskFilter} options={RISK_OPTIONS} label="风险决策" />
        <span className="tp-toolbar-end tp-faint tp-small">
          显示 {visible.length} 笔 · 全部 {tasks.length} 笔
        </span>
      </div>

      <Card style={{ padding: 0 }}>
        {visible.length ? (
          <div className="tp-table-wrap">
            <table className="tp-table tp-tasks-table">
              <thead>
                <tr>
                  <th>付款任务</th>
                  <th>收款方</th>
                  <th className="tp-th-right">金额</th>
                  <th>风控决策</th>
                  <th>状态</th>
                  <th>进度</th>
                  <th>执行代理</th>
                  <th>创建时间</th>
                  <th className="tp-cell-actions" aria-label="查看" />
                </tr>
              </thead>
              <tbody>
                {visible.map(task => {
                  const delegation = delegationById(world, task.delegationId)
                  const progress = taskProgress(task)
                  const decision = RISK_DECISION[task.riskDecision] || RISK_DECISION.ALLOW
                  const open = () => navigate('task', { taskId: task.id })
                  return (
                    <tr
                      key={task.id}
                      className="tp-clickable"
                      tabIndex={0}
                      onClick={open}
                      onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          open()
                        }
                      }}
                    >
                      <td>
                        <div className="tp-strong">{task.title}</div>
                        <div className="tp-faint tp-small tp-mono">{shortId(task.id)}</div>
                      </td>
                      <td>
                        <div>{task.counterparty}</div>
                        <div className="tp-faint tp-small tp-truncate" style={{ maxWidth: 150 }}>{task.purpose}</div>
                      </td>
                      <td className="tp-td-right">
                        <span className="tp-strong tp-num">{fmtMoney(task.amount, task.currency)}</span>
                      </td>
                      <td><Tag tone={decision.tone} dot>{decision.label}</Tag></td>
                      <td><StatusTag map={TASK_STATUS} status={task.status} /></td>
                      <td>
                        <div style={{ minWidth: 104 }}>
                          <Progress
                            value={progress.ratio}
                            tone={task.status === 'CLOSED' ? 'success' : task.status === 'FAILED' ? 'danger' : ''}
                          />
                          <div className="tp-faint tp-small" style={{ marginTop: 4 }}>
                            第 {progress.step} / {TASK_FLOW.length} 步
                          </div>
                        </div>
                      </td>
                      <td>{delegation?.subjectName || '—'}</td>
                      <td>
                        <span className="tp-faint tp-small" title={fmtDateTime(task.createdAt)}>
                          {fmtRelative(task.createdAt)}
                        </span>
                      </td>
                      <td className="tp-cell-actions">
                        <Icon name="chevronRight" size={14} style={{ color: 'var(--tp-text-3)' }} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="package"
            title={hasFilter ? '没有匹配的付款任务' : '还没有付款任务'}
            desc={hasFilter ? '换一个关键词或调整筛选条件；也可以清除筛选查看全部任务。' : '代理提交付款后会出现在这里，授权与风控结果会同步更新。'}
            action={hasFilter ? <Button variant="ghost" onClick={resetFilters}>清除筛选</Button> : null}
          />
        )}
      </Card>
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="新建付款任务"
        footer={(
          <>
            <Button onClick={() => setCreateOpen(false)}>取消</Button>
            <Button variant="primary" onClick={submitCreate}>创建任务</Button>
          </>
        )}
      >
        <div className="tp-form-grid">
          <Field label="付款用途">
            <input className="tp-input" value={draft.title} placeholder="例如：11 月新订单预付款" onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} />
          </Field>
          <Field label="收款方">
            <Select value={draft.counterparty} onChange={value => setDraft(current => ({ ...current, counterparty: value }))} options={orgOptions} label="收款方" />
          </Field>
          <Field label="金额（USD）">
            <input className="tp-input" type="number" min="1" value={draft.amount} placeholder="0.00" onChange={event => setDraft(current => ({ ...current, amount: event.target.value }))} />
          </Field>
          <Field label="执行代理">
            <Select value={draft.delegationId} onChange={value => setDraft(current => ({ ...current, delegationId: value }))} options={delegationOptions} label="执行代理" />
          </Field>
          <Field label="说明" hint="会出现在任务详情与审计记录中">
            <input className="tp-input" value={draft.purpose} placeholder="例如：供应商账期 30 天" onChange={event => setDraft(current => ({ ...current, purpose: event.target.value }))} />
          </Field>
        </div>
      </Modal>
    </div>
  )
}

/** One task: progress, authorising chain, audit trail, reviews, evidence, settle. */
export function TaskDetailPage({ taskId }) {
  const world = useWorld()
  const actions = useActions()
  const { navigate } = useNavigation()
  const toast = useToast()
  const [settleOpen, setSettleOpen] = useState(false)
  const [reference, setReference] = useState('')

  const task = taskId ? taskById(world, taskId) : null

  if (!task) {
    return (
      <div className="tp-page">
        <PageHead
          title="付款任务"
          desc="查看单笔付款的授权、风控、执行与结算全链路。"
          actions={(
            <Button icon="arrowLeft" onClick={() => navigate('tasks')}>返回任务列表</Button>
          )}
        />
        <Card>
          <EmptyState
            icon="fileText"
            title="没有找到这笔付款任务"
            desc="链接可能已失效，或这笔任务不在当前工作区。请回到任务列表重新选择。"
            action={<Button variant="primary" onClick={() => navigate('tasks')}>返回任务列表</Button>}
          />
        </Card>
      </div>
    )
  }

  const delegation = delegationById(world, task.delegationId)
  const chain = chainFor(world, task.delegationId)
  const effective = chainEffective(world, task.delegationId)
  const events = taskEvents(world, task.id)
  const reviews = interventionsForTask(world, task.id)
  const evidence = evidenceForTask(world, task.id)
  const progress = taskProgress(task)
  const pendingReview = reviews.find(item => item.status === 'PENDING') || null
  const decision = RISK_DECISION[task.riskDecision] || RISK_DECISION.ALLOW
  const band = riskBand(task.riskScore)
  const agentName = delegation?.subjectName || '—'
  const canSettle = task.status === 'SUBMITTED' || task.status === 'CONFIRMED'
  const failed = TERMINAL_BAD_STATES.includes(task.status)
  const showRiskNote = (task.riskDecision === 'BLOCK' || task.riskDecision === 'DEFER') && !failed

  const submitSettle = () => {
    const result = actions.settleTask(task.id, {
      by: '周明（财务负责人）',
      reference: reference.trim() || undefined
    })
    if (result?.ok) {
      setSettleOpen(false)
      setReference('')
      toast.push('已提交结算，等待清算确认', 'success')
    } else {
      toast.push(result?.reason || '提交失败，请稍后重试', 'error')
    }
  }

  return (
    <div className="tp-page">
      <PageHead
        title={task.title}
        desc={`收款方 ${task.counterparty} · 发票号 ${task.invoiceNo} · 创建于 ${fmtDateTime(task.createdAt)}`}
        actions={(
          <div className="tp-inline">
            <Button icon="arrowLeft" onClick={() => navigate('tasks')}>返回任务列表</Button>
            <Button
              variant="primary"
              icon="send"
              disabled={!canSettle}
              title={canSettle ? undefined : '只有已提交或已确认的任务可以提交结算'}
              onClick={() => {
                setReference(task.settlementRef || '')
                setSettleOpen(true)
              }}
            >
              提交结算
            </Button>
          </div>
        )}
      />

      <div className="tp-sla-strip">
        <div className="tp-sla-item">
          <span className="tp-faint">付款金额</span>
          <span className="tp-strong tp-num" style={{ fontSize: 17 }}>{fmtMoney(task.amount, task.currency)}</span>
        </div>
        <div className="tp-sla-item">
          <span className="tp-faint">任务状态</span>
          <span><StatusTag map={TASK_STATUS} status={task.status} /></span>
        </div>
        <div className="tp-sla-item">
          <span className="tp-faint">风险决策</span>
          <span><Tag tone={decision.tone} dot>{decision.label}</Tag></span>
        </div>
        <div className="tp-sla-item">
          <span className="tp-faint">执行代理</span>
          <span className="tp-strong" style={{ fontSize: 13 }}>{agentName}</span>
          <span className="tp-faint tp-small">{delegation?.name || '未关联委托'}</span>
        </div>
      </div>

      {showRiskNote ? (
        <div className={`tp-callout ${task.riskDecision === 'BLOCK' ? 'danger' : 'warn'}`}>
          <div className="tp-callout-title">
            <Icon name={task.riskDecision === 'BLOCK' ? 'shield' : 'alert'} size={14} />
            {task.riskDecision === 'BLOCK' ? '风控已拦截这笔付款' : '这笔付款被转人工复核'}
          </div>
          <div className="tp-callout-body">
            {task.blockedReason || (task.riskDecision === 'BLOCK'
              ? '触发资金安全规则，付款已暂停。'
              : '风险评分超过阈值，需要人工确认后才能继续。')}
          </div>
          <div className="tp-inline" style={{ gap: 8 }}>
            <span className="tp-callout-detail">
              {task.riskDecision === 'BLOCK'
                ? '拦截期间资金不会划出；如确需支付，请先由财务负责人确认例外，再重新发起任务。'
                : '复核通过后任务会恢复执行；复核期间付款保持挂起。'}
            </span>
            {pendingReview ? (
              <Button size="sm" variant="ghost" onClick={() => navigate('approvals')}>前往审批工作台</Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {failed ? (
        <div className={`tp-callout ${task.status === 'FAILED' ? 'danger' : 'warn'}`}>
          <div className="tp-callout-title">
            <Icon name={task.status === 'FAILED' ? 'xCircle' : 'x'} size={14} />
            {task.status === 'FAILED' ? '这笔付款已失败' : '这笔付款已取消'}
          </div>
          <div className="tp-callout-body">{task.blockedReason || '任务已中止，不再进入结算环节。'}</div>
          <div className="tp-inline" style={{ gap: 8 }}>
            <span className="tp-callout-detail">
              {task.status === 'FAILED'
                ? '如确认是误拦截，请提交复核；复核通过后需要重新发起付款。'
                : '该任务不会继续执行，相关资金未划出。'}
            </span>
            {pendingReview ? (
              <Button size="sm" variant="ghost" onClick={() => navigate('approvals')}>前往审批工作台</Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="tp-grid-2-1">
        <div className="tp-stack">
          <Card
            title="付款进度"
            desc="从任务创建到结算关闭的完整路径"
            actions={<Tag tone="info">{`第 ${progress.step} / ${TASK_FLOW.length} 步`}</Tag>}
          >
            <div className="tp-progress-row">
              <Progress
                value={progress.ratio}
                tone={task.status === 'CLOSED' ? 'success' : task.status === 'FAILED' ? 'danger' : ''}
              />
              <span className="tp-strong tp-num" style={{ fontSize: 12.5 }}>{fmtPct(progress.ratio, 0)}</span>
              <span className="tp-faint tp-small">{progress.label}</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(72px, 1fr))',
                gap: 6,
                marginTop: 16,
                overflowX: 'auto',
                paddingBottom: 4
              }}
            >
              {TASK_FLOW.map((step, index) => {
                const stepNo = index + 1
                const current = !failed && stepNo === progress.step && task.status !== 'CLOSED'
                const done = !failed && (task.status === 'CLOSED' || stepNo < progress.step)
                return (
                  <div
                    key={step}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        background: done ? 'var(--tp-success-soft)' : current ? 'var(--tp-accent-soft)' : 'var(--tp-surface-3)',
                        color: done ? 'var(--tp-success)' : current ? 'var(--tp-accent)' : 'var(--tp-text-3)',
                        boxShadow: current ? '0 0 0 1px var(--tp-accent)' : 'none'
                      }}
                    >
                      {done
                        ? <Icon name="check" size={11} />
                        : <span className="tp-num" style={{ fontSize: 10, fontWeight: 700 }}>{stepNo}</span>}
                    </span>
                    <span
                      className={current ? 'tp-strong tp-small' : 'tp-faint tp-small'}
                      style={{ fontSize: 11, lineHeight: 1.3 }}
                    >
                      {TASK_STATUS[step]?.label || step}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card
            title="委托链与生效额度"
            desc="每一级都可独立设限，整条链最窄的一级决定本笔付款的实际上限。"
            actions={(
              <Button size="sm" variant="ghost" onClick={() => navigate('delegations')}>查看全部委托</Button>
            )}
          >
            {effective ? (
              <div className="tp-callout info" style={{ marginBottom: 10 }}>
                <div className="tp-callout-title"><Icon name="shield" size={14} />本笔付款的生效额度</div>
                <div className="tp-callout-body">
                  单笔上限 {fmtMoney(effective.amountLimit, task.currency)} · 今日剩余 {fmtMoney(effective.dailyRemaining, task.currency)}
                </div>
                <div className="tp-callout-detail">
                  {effective.active ? `按 ${chain.length} 级委托逐级收窄` : '委托链中已有环节失效，本笔付款的授权不再完整'}
                  {chain.length ? ` · 可执行动作：${chain[chain.length - 1].actionLabels.join('、')}` : ''}
                </div>
              </div>
            ) : <div className="tp-hint">这笔任务没有关联生效中的委托。</div>}
            <div className="tp-list">
              {chain.map((level, index) => (
                <div className="tp-list-row" key={level.id} style={{ paddingLeft: index * 14 }}>
                  <Avatar name={level.issuerName} seed={level.issuerDid} size="sm" />
                  <Icon name="arrowRight" size={13} style={{ flex: 'none', color: 'var(--tp-text-3)' }} />
                  <Avatar name={level.subjectName} seed={level.subjectDid} size="sm" />
                  <div className="tp-list-main">
                    <div className="tp-list-title">{level.issuerName} → {level.subjectName}</div>
                    <div className="tp-list-sub">
                      {level.actionLabels.join('、')} · 单笔上限 {fmtMoney(level.amountLimit, level.currency)}
                      {' '}· 今日已用 {fmtMoney(level.usedToday, level.currency)} / {fmtMoney(level.dailyLimit, level.currency)}
                    </div>
                  </div>
                  <div className="tp-list-side">
                    <StatusTag map={DELEGATION_STATUS} status={level.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="审计事件"
            desc="关键动作按发生顺序留痕，可供审计员复核。"
            actions={<Tag tone="neutral">{`共 ${events.length} 条`}</Tag>}
          >
            {events.length ? (
              <Timeline
                items={events.map(event => ({
                  key: event.id,
                  title: (
                    <span className="tp-inline" style={{ gap: 6 }}>
                      <span>{event.typeLabel}</span>
                      {event.finality && event.finality !== 'PENDING' ? (
                        <Tag tone={FINALITY[event.finality]?.tone || 'neutral'} dot>
                          {FINALITY[event.finality]?.label || event.finality}
                        </Tag>
                      ) : null}
                    </span>
                  ),
                  meta: `${event.actor} · ${fmtDateTime(event.at)} · ${fmtRelative(event.at)}`,
                  body: (
                    <div className="tp-stack" style={{ gap: 5 }}>
                      <span>{event.body}</span>
                      <span className="tp-inline">
                        <Tag tone={VERIFICATION[event.verification]?.tone || 'neutral'}>
                          {VERIFICATION[event.verification]?.label || '未校验'}
                        </Tag>
                        {event.ledger ? (
                          <Tag tone="info">
                            {event.ledger.scheme} · <span className="tp-mono">{event.ledger.reference}</span>
                          </Tag>
                        ) : null}
                      </span>
                    </div>
                  ),
                  tone: event.tone,
                  icon: event.tone === 'danger'
                    ? 'alert'
                    : event.tone === 'success'
                      ? 'checkCircle'
                      : event.tone === 'warn'
                        ? 'clock'
                        : 'activity'
                }))}
              />
            ) : <div className="tp-hint">这笔任务还没有审计事件。</div>}
          </Card>
        </div>

        <div className="tp-stack">
          <Card title="任务摘要">
            <KV
              items={[
                { k: '任务编号', v: <span className="tp-mono">{shortId(task.id)}</span> },
                { k: '付款金额', v: <span className="tp-strong tp-num">{fmtMoney(task.amount, task.currency)}</span> },
                { k: '收款方', v: task.counterparty },
                { k: '发票号', v: <span className="tp-mono">{task.invoiceNo}</span> },
                { k: '付款用途', v: task.purpose },
                { k: '执行代理', v: agentName },
                { k: '任务状态', v: <StatusTag map={TASK_STATUS} status={task.status} /> },
                {
                  k: '风险评分',
                  v: (
                    <span className="tp-inline" style={{ gap: 6 }}>
                      <span className="tp-num">{task.riskScore.toFixed(2)}</span>
                      <Tag tone={band.tone}>{band.label}</Tag>
                    </span>
                  )
                },
                { k: '创建时间', v: fmtDateTime(task.createdAt) },
                { k: '最近更新', v: fmtRelative(task.updatedAt) },
                {
                  k: '结算凭证',
                  v: task.settlementRef ? <Copyable label="复制结算凭证">{task.settlementRef}</Copyable> : null
                }
              ]}
            />
          </Card>

          <Card
            title="人工复核"
            desc="被规则转人工的记录与处理结论。"
            actions={pendingReview
              ? <Button size="sm" variant="ghost" onClick={() => navigate('approvals')}>前往审批</Button>
              : null}
          >
            {reviews.length ? (
              <div>
                {reviews.map(item => {
                  const countdown = fmtCountdown(item.dueAt)
                  return (
                    <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--tp-border-soft)' }}>
                      <div className="tp-inline" style={{ justifyContent: 'space-between', gap: 8 }}>
                        <span className="tp-strong tp-small">{item.title}</span>
                        <StatusTag map={INTERVENTION_STATUS} status={item.status} />
                      </div>
                      <div className="tp-faint tp-small" style={{ marginTop: 4, lineHeight: 1.45 }}>{item.reason}</div>
                      <div className="tp-faint tp-small" style={{ marginTop: 4 }}>
                        {item.status === 'PENDING'
                          ? `${item.requestedBy} 发起 · ${countdown === '已超时' ? '已超过处理时限' : `${countdown}内处理`}`
                          : `${item.decidedBy || '审批人'} · ${fmtRelative(item.decidedAt)}处理`}
                      </div>
                      {item.decisionNote ? (
                        <div className="tp-hint" style={{ marginTop: 4 }}>结论：{item.decisionNote}</div>
                      ) : null}
                      {item.status === 'PENDING' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="arrowRight"
                          style={{ marginTop: 6 }}
                          onClick={() => navigate('approvals')}
                        >
                          去审批工作台
                        </Button>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : <div className="tp-hint">这笔任务没有触发人工复核。</div>}
          </Card>

          <Card
            title="证据与凭证"
            desc="支撑本笔付款的授权、风险与结算留痕。"
            actions={<Tag tone="neutral">{`共 ${evidence.length} 条`}</Tag>}
          >
            {evidence.length ? (
              <div className="tp-evidence-list">
                {evidence.map(item => (
                  <div className="tp-evidence-row" key={item.id} style={{ alignItems: 'flex-start' }}>
                    <Icon
                      name="fileText"
                      size={14}
                      style={{ marginTop: 2, flex: 'none', color: 'var(--tp-text-3)' }}
                    />
                    <div className="tp-grow">
                      <div className="tp-strong tp-small">
                        {EVIDENCE_KIND[item.kind] || '凭证'} · {item.subject.replaceAll(task.id, '本任务')}
                      </div>
                      <div className="tp-hint" style={{ marginTop: 2 }}>{item.summary}</div>
                      <div className="tp-inline" style={{ marginTop: 5, gap: 8 }}>
                        <Tag tone={item.anchored ? 'success' : 'neutral'} dot>
                          {item.anchored ? '已存证' : '待存证'}
                        </Tag>
                        <span className="tp-faint tp-small">{fmtRelative(item.at)}</span>
                        <Copyable label="复制存证编号">{item.digest}</Copyable>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="tp-hint">暂未归档证据。</div>}
          </Card>
        </div>
      </div>

      <Modal
        open={settleOpen}
        onClose={() => setSettleOpen(false)}
        title="提交结算"
        footer={(
          <div className="tp-drawer-actions">
            <Button variant="ghost" onClick={() => setSettleOpen(false)}>取消</Button>
            <Button variant="primary" icon="send" onClick={submitSettle}>确认提交结算</Button>
          </div>
        )}
      >
        <div className="tp-stack">
          <div className="tp-callout info">
            <div className="tp-callout-title">
              <Icon name="send" size={14} />将 {fmtMoney(task.amount, task.currency)} 提交至清算网络
            </div>
            <div className="tp-callout-body">收款方 {task.counterparty} · 发票号 {task.invoiceNo}</div>
            <div className="tp-callout-detail">
              提交后会生成结算事件并等待清算确认，确认前请再核对收款账户与金额。
            </div>
          </div>
          <KV
            items={[
              { k: '收款方', v: task.counterparty },
              { k: '付款金额', v: <span className="tp-strong tp-num">{fmtMoney(task.amount, task.currency)}</span> },
              { k: '执行代理', v: agentName },
              {
                k: '委托链',
                v: effective
                  ? `${chain.length} 级委托 · 单笔上限 ${fmtMoney(effective.amountLimit, task.currency)}`
                  : '—'
              }
            ]}
          />
          <Field label="结算参考号" hint="选填。填写银行流水号或内部对账编号，便于后续核对。">
            <input
              className="tp-input"
              value={reference}
              onChange={event => setReference(event.target.value)}
              placeholder="例如 20261029-001"
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
