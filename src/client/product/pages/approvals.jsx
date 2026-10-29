/**
 * 审批 — human reviews the rules escalated.
 *
 * Each pending intervention expands into the full context a finance approver
 * needs: what the agent asked, why the rule escalated it, the delegation chain
 * behind it, and the evidence trail. Decisions are applied to the demo world
 * optimistically and produce audit events.
 */
import { useMemo, useState } from 'react'
import { useActions, useWorld } from '../hooks.js'
import { useNavigation } from '../app/navigation.jsx'
import { chainFor, chainEffective, openInterventions, taskById, taskEvents } from '../selectors.js'
import {
  DELEGATION_STATUS, fmtCountdown, fmtDateTime, fmtMoney, fmtPct, fmtRelative,
  INTERVENTION_STATUS, RISK_DECISION, shortId, TASK_STATUS
} from '../ui/format.js'
import {
  Avatar, Button, Card, Drawer, EmptyState, Field, KV, PageHead, Progress, Segmented,
  StatusTag, Tag, useToast
} from '../ui/primitives.jsx'
import { Icon } from '../ui/icons.jsx'

/** Approvals page. */
export function ApprovalsPage() {
  const world = useWorld()
  const actions = useActions()
  const { navigate } = useNavigation()
  const toast = useToast()
  const [filter, setFilter] = useState('pending')
  const [selectedId, setSelectedId] = useState(null)
  const [decision, setDecision] = useState(null)
  const [note, setNote] = useState('')

  const pending = openInterventions(world)
  const history = useMemo(() => world.interventions
    .filter(item => item.status !== 'PENDING')
    .sort((left, right) => new Date(right.decidedAt).getTime() - new Date(left.decidedAt).getTime()), [world.interventions])

  const items = filter === 'pending' ? pending : history
  const selected = world.interventions.find(item => item.id === selectedId) || null
  const selectedTask = selected ? taskById(world, selected.taskId) : null
  const chain = selectedTask ? chainFor(world, selectedTask.delegationId) : []

  const openDecision = (mode) => {
    setDecision(mode)
    setNote(mode === 'approve' ? '同意，按流程放行' : '拒绝，退回业务侧补充材料')
  }

  const submitDecision = () => {
    if (!selected) return
    if (decision === 'approve') {
      actions.approveIntervention(selected.id, { note })
      toast.push('已通过复核，任务恢复执行', 'success')
    } else {
      actions.denyIntervention(selected.id, { note })
      toast.push('已拒绝复核，任务已停止', 'info')
    }
    setDecision(null)
    setSelectedId(null)
  }

  return (
    <div className="tp-page">
      <PageHead
        title="审批工作台"
        desc="只处理被规则转人工的例外。通过后代理继续执行；拒绝会终止对应任务。"
        actions={(
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'pending', label: `待处理 ${pending.length}` },
              { value: 'history', label: `已处理 ${history.length}` }
            ]}
          />
        )}
      />

      <div className="tp-sla-strip">
        <div className="tp-sla-item">
          <span className="tp-faint">最早截止</span>
          <span className="tp-strong">{pending.length ? fmtCountdown(pending[0].dueAt) : '—'}</span>
        </div>
        <div className="tp-sla-item">
          <span className="tp-faint">已超时</span>
          <span className={`tp-strong ${pending.some(item => new Date(item.dueAt) < Date.now()) ? 'tp-danger-text' : ''}`}>
            {world.interventions.filter(item => item.status === 'PENDING' && new Date(item.dueAt) < Date.now()).length} 项
          </span>
        </div>
        <div className="tp-sla-item">
          <span className="tp-faint">平均处理时长</span>
          <span className="tp-strong">{avgDecision(world.interventions)}</span>
        </div>
        <div className="tp-sla-item">
          <span className="tp-faint">本月通过率</span>
          <span className="tp-strong">{approvalRate(world.interventions)}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <EmptyState
            icon="checkCircle"
            title={filter === 'pending' ? '审批队列已清空' : '还没有处理记录'}
            desc={filter === 'pending' ? '新的例外会自动出现在这里，并发送通知。' : '处理过的复核会保留完整的审计记录。'}
          />
        </Card>
      ) : (
        <div className="tp-approval-list">
          {items.map(item => {
            const task = taskById(world, item.taskId)
            const delegation = task ? world.delegations.find(entry => entry.id === task.delegationId) : null
            const overdue = item.status === 'PENDING' && new Date(item.dueAt) < Date.now()
            return (
              <Card key={item.id} className={`tp-approval-card ${overdue ? 'overdue' : ''}`}>
                <div className="tp-approval-head">
                  <span className={`tp-approval-icon ${overdue ? 'danger' : item.status === 'PENDING' ? 'warn' : 'success'}`}>
                    <Icon name={overdue ? 'alert' : item.level >= 3 ? 'shield' : 'clock'} size={16} />
                  </span>
                  <div className="tp-approval-title-block">
                    <div className="tp-approval-title">{item.title}</div>
                    <div className="tp-approval-sub">
                      {task ? task.counterparty : '—'} · {task ? fmtMoney(task.amount, task.currency) : '—'}
                      <span className="tp-dot-sep" />
                      发起于 {fmtRelative(item.requestedAt)}
                    </div>
                  </div>
                  <div className="tp-approval-status">
                    <StatusTag map={INTERVENTION_STATUS} status={item.status} />
                    {item.status === 'PENDING' ? (
                      <span className={overdue ? 'tp-danger-text tp-small' : 'tp-faint tp-small'}>
                        {overdue ? '已超时' : `${fmtCountdown(item.dueAt)}内处理`}
                      </span>
                    ) : (
                      <span className="tp-faint tp-small">{item.decidedBy} · {fmtRelative(item.decidedAt)}</span>
                    )}
                  </div>
                </div>

                <div className="tp-approval-reason">
                  <Icon name="info" size={14} />
                  <span>{item.reason}</span>
                </div>

                <div className="tp-approval-grid">
                  <div>
                    <div className="tp-label">风险评估</div>
                    <div className="tp-risk-row">
                      <Progress value={item.riskScore} tone={item.riskScore >= 0.8 ? 'danger' : item.riskScore >= 0.6 ? 'warn' : ''} />
                      <span className="tp-strong tp-num">{item.riskScore.toFixed(2)}</span>
                      <Tag tone={RISK_DECISION[task?.riskDecision]?.tone || 'neutral'}>{RISK_DECISION[task?.riskDecision]?.label || '—'}</Tag>
                    </div>
                  </div>
                  <div>
                    <div className="tp-label">任务金额</div>
                    <div className="tp-strong">{task ? fmtMoney(task.amount, task.currency) : '—'}</div>
                    <div className="tp-faint tp-small">单笔上限 {task?.delegationId ? fmtMoney(chainEffective(world, task.delegationId)?.amountLimit) : '—'}</div>
                  </div>
                  <div>
                    <div className="tp-label">关联代理</div>
                    <div className="tp-strong">{delegation ? delegation.subjectName : '未指派'}</div>
                    <div className="tp-faint tp-small">{delegation ? DELEGATION_STATUS[delegation.status]?.label : (task ? TASK_STATUS[task.status]?.label : '')}</div>
                  </div>
                </div>

                <div className="tp-approval-actions">
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedId(item.id); setDecision(null) }}>
                    <Icon name="eye" size={14} /> 查看详情
                  </Button>
                  {item.status === 'PENDING' ? (
                    <>
                      <Button size="sm" onClick={() => { setSelectedId(item.id); openDecision('deny') }}>
                        <Icon name="x" size={14} /> 拒绝
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => { setSelectedId(item.id); openDecision('approve') }}>
                        <Icon name="check" size={14} /> 通过复核
                      </Button>
                    </>
                  ) : null}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Drawer
        open={Boolean(selected)}
        onClose={() => { setSelectedId(null); setDecision(null) }}
        title={selected?.title || ''}
        subtitle={selectedTask ? `${selectedTask.counterparty} · ${fmtMoney(selectedTask.amount, selectedTask.currency)}` : ''}
        width={520}
        footer={selected?.status === 'PENDING' ? (
          <div className="tp-drawer-actions">
            <Button onClick={() => openDecision('deny')}>拒绝</Button>
            <Button variant="primary" onClick={() => openDecision('approve')}>通过复核</Button>
          </div>
        ) : null}
      >
        {selected ? (
          <div className="tp-stack">
            <div className="tp-callout">
              <div className="tp-callout-title"><Icon name="info" size={14} /> 为什么需要人工复核</div>
              <div className="tp-callout-body">{selected.reason}</div>
              <div className="tp-callout-detail">{selected.detail}</div>
            </div>

            <KV items={[
              { k: '复核级别', v: `L${selected.level}` },
              { k: '发起方', v: selected.requestedBy },
              { k: '截止时间', v: `${fmtDateTime(selected.dueAt)}（${fmtCountdown(selected.dueAt)}）` },
              { k: '风险分', v: `${selected.riskScore.toFixed(2)}` },
              { k: '关联任务', v: selectedTask ? selectedTask.title : '—' }
            ]} />

            {selectedTask ? (
              <Card flat title="付款任务">
                <KV items={[
                  { k: '金额', v: fmtMoney(selectedTask.amount, selectedTask.currency) },
                  { k: '收款方', v: selectedTask.counterparty },
                  { k: '状态', v: TASK_STATUS[selectedTask.status]?.label || selectedTask.status },
                  { k: '发票号', v: selectedTask.invoiceNo }
                ]} />
                <Button size="sm" variant="ghost" style={{ marginTop: 8 }} onClick={() => navigate('task', { taskId: selectedTask.id })}>
                  打开任务详情 <Icon name="arrowRight" size={13} />
                </Button>
              </Card>
            ) : null}

            {chain.length ? (
              <Card flat title="委托链" desc="从发起人到执行人的授权路径">
                <div className="tp-chain">
                  {chain.map((item, index) => (
                    <div className="tp-chain-node" key={item.id}>
                      <div className="tp-chain-line">
                        <span className="tp-chain-avatar"><Avatar name={item.issuerName} seed={item.issuerDid} size="sm" /></span>
                        <span className="tp-chain-name">{item.issuerName}</span>
                        {index < chain.length - 1 ? <Icon name="chevronDown" size={13} /> : <Tag tone="success">执行人</Tag>}
                      </div>
                      <div className="tp-chain-detail">
                        <span>单笔上限 {fmtMoney(item.amountLimit)}</span>
                        <span>已用 {fmtMoney(item.usedToday)} / {fmtMoney(item.dailyLimit)}</span>
                        <StatusTag map={DELEGATION_STATUS} status={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            <Card flat title="证据与事件">
              <div className="tp-evidence-list">
                {taskEvents(world, selected.taskId).map(event => (
                  <div className="tp-evidence-row" key={event.id}>
                    <Icon name="checkCircle" size={13} />
                    <span className="tp-strong">{event.typeLabel}</span>
                    <span className="tp-faint">{event.actor}</span>
                    <span className="tp-faint" style={{ marginLeft: 'auto' }}>{fmtRelative(event.at)}</span>
                  </div>
                ))}
              </div>
            </Card>

            {selected.status !== 'PENDING' ? (
              <div className="tp-callout success">
                <div className="tp-callout-title"><Icon name="checkCircle" size={14} /> 处理记录</div>
                <div className="tp-callout-body">{selected.decisionNote}</div>
                <div className="tp-callout-detail">{selected.decidedBy} · {fmtDateTime(selected.decidedAt)}</div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={Boolean(decision) && Boolean(selected)}
        onClose={() => setDecision(null)}
        title={decision === 'approve' ? '通过复核' : '拒绝复核'}
        subtitle={selected ? selected.title : ''}
        width={460}
        footer={(
          <div className="tp-drawer-actions">
            <Button variant="ghost" onClick={() => setDecision(null)}>取消</Button>
            <Button variant={decision === 'approve' ? 'primary' : 'danger'} onClick={submitDecision}>
              {decision === 'approve' ? '确认通过' : '确认拒绝'}
            </Button>
          </div>
        )}
      >
        <div className="tp-stack">
          <div className={`tp-callout ${decision === 'approve' ? 'success' : 'danger'}`}>
            <div className="tp-callout-title">
              <Icon name={decision === 'approve' ? 'checkCircle' : 'alert'} size={14} />
              {decision === 'approve' ? '通过后，任务将恢复执行' : '拒绝后，任务将立即停止'}
            </div>
            <div className="tp-callout-detail">
              {decision === 'approve'
                ? '代理会在原委托额度内继续提交付款，所有动作仍会留下审计事件。'
                : '任务状态会变为已取消，供应商侧会收到通知，委托额度不会被占用。'}
            </div>
          </div>
          <Field label="处理意见" hint="会写入审计记录，对代理和审计员可见">
            <textarea className="tp-textarea" value={note} onChange={event => setNote(event.target.value)} rows={4} />
          </Field>
        </div>
      </Drawer>
    </div>
  )
}

/**
 * Average human decision time.
 * @param {Array<object>} interventions
 */
function avgDecision(interventions) {
  const decided = interventions.filter(item => item.decidedAt)
  if (!decided.length) return '—'
  const minutes = decided.reduce((sum, item) => sum + (new Date(item.decidedAt) - new Date(item.requestedAt)) / 60000, 0) / decided.length
  if (minutes < 60) return `${Math.round(minutes)} 分钟`
  return `${(minutes / 60).toFixed(1)} 小时`
}

/**
 * Share of approved decisions.
 * @param {Array<object>} interventions
 */
function approvalRate(interventions) {
  const decided = interventions.filter(item => item.status === 'APPROVED' || item.status === 'DENIED')
  if (!decided.length) return '—'
  return fmtPct(decided.filter(item => item.status === 'APPROVED').length / decided.length)
}
