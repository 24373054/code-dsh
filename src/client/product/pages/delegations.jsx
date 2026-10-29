/**
 * 委托授权 — the limits humans hand to their payment agents.
 *
 * Each card is one link in a delegation chain: who granted it, which agent acts
 * on it, what it may do, how much is left today, and when it expires. Revoking
 * a link immediately strips the downstream agents of their authority, so the
 * action lives behind a confirmation that demands a written reason.
 */
import { useState } from 'react'
import { useActions, useWorld } from '../hooks.js'
import { useNavigation } from '../app/navigation.jsx'
import { chainEffective, chainFor } from '../selectors.js'
import { DELEGATION_STATUS, fmtCountdown, fmtDateTime, fmtMoney, fmtPct, fmtRelative } from '../ui/format.js'
import {
  Avatar, Button, Card, EmptyState, Field, KV, Modal, PageHead, Progress, Segmented,
  StatCard, StatusTag, Tag, useToast
} from '../ui/primitives.jsx'
import { Icon } from '../ui/icons.jsx'

/** A delegation counts as expiring soon inside this window. */
const EXPIRING_WINDOW = 14 * 24 * 60 * 60 * 1000

const FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '生效中' },
  { value: 'expiring', label: '即将到期' },
  { value: 'inactive', label: '已失效' }
]

const STATUS_RANK = { ACTIVE: 0, EXPIRED: 1, REVOKED: 2 }

const isExpiring = (item) => {
  if (item.status !== 'ACTIVE') return false
  const left = new Date(item.validTo).getTime() - Date.now()
  return left > 0 && left <= EXPIRING_WINDOW
}

const matchesFilter = (item, value) => {
  if (value === 'all') return true
  if (value === 'active') return item.status === 'ACTIVE'
  if (value === 'expiring') return isExpiring(item)
  if (value === 'inactive') return item.status !== 'ACTIVE'
  return true
}

/** Delegation list: limits, windows, chains and revoke. */
export function DelegationsPage() {
  const world = useWorld()
  const actions = useActions()
  const { navigate } = useNavigation()
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [revokeTarget, setRevokeTarget] = useState(null)
  const [reason, setReason] = useState('')

  const delegations = [...world.delegations].sort((left, right) => {
    const byStatus = (STATUS_RANK[left.status] ?? 3) - (STATUS_RANK[right.status] ?? 3)
    if (byStatus !== 0) return byStatus
    return chainFor(world, left.id).length - chainFor(world, right.id).length
  })
  const filterOptions = FILTERS.map(item => ({
    value: item.value,
    label: item.label,
    count: item.value === 'all' ? delegations.length : delegations.filter(entry => matchesFilter(entry, item.value)).length
  }))
  const visible = delegations.filter(item => matchesFilter(item, filter))

  const active = delegations.filter(item => item.status === 'ACTIVE')
  const expiring = active.filter(isExpiring)
  const revoked = delegations.filter(item => item.status === 'REVOKED')
  const expired = delegations.filter(item => item.status === 'EXPIRED')
  const usedToday = active.reduce((total, item) => total + (Number(item.usedToday) || 0), 0)
  const dailyTotal = active.reduce((total, item) => total + (Number(item.dailyLimit) || 0), 0)
  const nearest = [...active].sort((left, right) => new Date(left.validTo).getTime() - new Date(right.validTo).getTime())[0] || null
  const subjectCount = new Set(active.map(item => item.subjectId)).size

  const closeRevoke = () => {
    setRevokeTarget(null)
    setReason('')
  }

  const confirmRevoke = () => {
    if (!revokeTarget) return
    const trimmed = reason.trim()
    if (!trimmed) {
      toast.push('请填写撤销原因，便于审计追溯', 'error')
      return
    }
    actions.revokeDelegation(revokeTarget.id, { reason: trimmed, by: '周明（财务负责人）' })
    toast.push('委托已撤销，代理权限已收回', 'success')
    closeRevoke()
  }

  return (
    <div className="tp-page">
      <PageHead
        title="委托授权"
        desc="资金负责人把付款权限交给代理，并在这里设定单笔限额、每日限额与有效期。撤销或到期都会立即生效。"
        actions={<Segmented value={filter} onChange={setFilter} options={filterOptions} />}
      />

      <div className="tp-stat-grid">
        <StatCard
          label="生效中委托"
          value={active.length}
          unit="项"
          icon="branch"
          iconTone="var(--tp-accent)"
          foot={`覆盖 ${subjectCount} 个执行代理`}
        />
        <StatCard
          label="14 天内到期"
          value={expiring.length}
          unit="项"
          icon="clock"
          iconTone="var(--tp-warn)"
          foot={nearest ? `${nearest.subjectName} · ${fmtCountdown(nearest.validTo)}后到期` : '暂无临近到期的委托'}
        />
        <StatCard
          label="今日已用额度"
          value={fmtMoney(usedToday)}
          icon="wallet"
          iconTone="var(--tp-info)"
          foot={dailyTotal ? `占生效日额度的 ${fmtPct(usedToday / dailyTotal, 1)}` : '暂无生效额度'}
        />
        <StatCard
          label="已撤销委托"
          value={revoked.length}
          unit="项"
          icon="xCircle"
          iconTone="var(--tp-danger)"
          foot={expired.length ? `另有 ${expired.length} 项已过期并失效` : '撤销后相关代理立即失去权限'}
        />
      </div>

      <div className="tp-callout info">
        <div className="tp-callout-title"><Icon name="shield" size={14} />委托权限逐级收窄</div>
        <div className="tp-callout-body">
          单笔与每日限额取整条链中最窄的一级；上级委托撤销或到期后，下游代理会立即失去对应权限。
        </div>
      </div>

      {visible.length ? visible.map(item => {
        const chain = chainFor(world, item.id)
        const effective = chainEffective(world, item.id)
        const parent = chain.length > 1 ? chain[chain.length - 2] : null
        const linkedTasks = world.tasks.filter(task => task.delegationId === item.id)
        const dailyRatio = item.dailyLimit ? Math.min(1, item.usedToday / item.dailyLimit) : 0
        const isActive = item.status === 'ACTIVE'

        return (
          <Card key={item.id}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Avatar name={item.subjectName} seed={item.subjectId} size="lg" />
              <div className="tp-grow">
                <div className="tp-inline" style={{ gap: 8 }}>
                  <span className="tp-strong" style={{ fontSize: 14 }}>{item.name}</span>
                  <StatusTag map={DELEGATION_STATUS} status={item.status} />
                  <Tag tone="neutral">{`${chain.length} 级委托`}</Tag>
                  {item.canRedelegate ? <Tag tone="info">可再委托</Tag> : <Tag tone="neutral">不可再委托</Tag>}
                </div>
                <div className="tp-hint" style={{ marginTop: 3 }}>{item.purpose}</div>
                <div className="tp-inline" style={{ marginTop: 8, gap: 6 }}>
                  <Avatar name={item.issuerName} seed={item.issuerDid} size="sm" />
                  <span className="tp-small tp-strong">{item.issuerName}</span>
                  <Icon name="arrowRight" size={13} style={{ color: 'var(--tp-text-3)' }} />
                  <Avatar name={item.subjectName} seed={item.subjectDid} size="sm" />
                  <span className="tp-small tp-strong">{item.subjectName}</span>
                  <span className="tp-faint tp-small">可执行：{item.actionLabels.join('、')}</span>
                </div>
              </div>
              <div style={{ flex: 'none', textAlign: 'right' }}>
                <div className="tp-faint tp-small">
                  {isActive ? '剩余有效期' : item.status === 'REVOKED' ? '撤销时间' : '到期时间'}
                </div>
                <div className="tp-strong tp-num" style={{ marginTop: 2 }}>
                  {isActive
                    ? fmtCountdown(item.validTo)
                    : item.status === 'REVOKED'
                      ? fmtRelative(item.revokedAt)
                      : fmtRelative(item.validTo)}
                </div>
                <div className="tp-faint tp-small" style={{ marginTop: 2 }}>{`截止 ${fmtDateTime(item.validTo)}`}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 16, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--tp-border-soft)' }}>
              <div>
                <div className="tp-label">单笔限额</div>
                <div className="tp-strong tp-num" style={{ marginTop: 4, fontSize: 15 }}>{fmtMoney(item.amountLimit, item.currency)}</div>
                <div className="tp-hint">本层委托允许的最大单笔金额</div>
              </div>
              <div>
                <div className="tp-inline" style={{ justifyContent: 'space-between' }}>
                  <span className="tp-label">今日累计</span>
                  <span className="tp-faint tp-small tp-num">
                    {fmtMoney(item.usedToday, item.currency)} / {fmtMoney(item.dailyLimit, item.currency)}
                  </span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Progress value={dailyRatio} tone={dailyRatio >= 0.8 ? 'warn' : ''} />
                </div>
                <div className="tp-hint" style={{ marginTop: 4 }}>
                  今日剩余 {fmtMoney(Math.max(0, item.dailyLimit - item.usedToday), item.currency)}
                </div>
              </div>
              <div>
                <div className="tp-label">有效窗口</div>
                <div className="tp-small" style={{ marginTop: 4 }}>{fmtDateTime(item.validFrom)} 至 {fmtDateTime(item.validTo)}</div>
                <div className="tp-hint" style={{ marginTop: 4 }}>
                  {isActive ? `${fmtCountdown(item.validTo)}后自动到期` : item.status === 'REVOKED' ? '撤销后即刻失效' : '已超过有效期'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 'var(--tp-radius-md)', background: 'var(--tp-surface-2)' }}>
              <div className="tp-inline" style={{ gap: 6 }}>
                <span className="tp-label" style={{ marginRight: 4 }}>委托链路</span>
                <Avatar name={item.issuerName} seed={item.issuerDid} size="sm" />
                <span className="tp-small tp-strong">{item.issuerName}</span>
                {chain.map(level => (
                  <span key={level.id} className="tp-inline" style={{ gap: 6 }}>
                    <Icon name="chevronRight" size={12} style={{ color: 'var(--tp-text-3)' }} />
                    <Avatar name={level.subjectName} seed={level.subjectDid} size="sm" />
                    <span className={level.id === item.id ? 'tp-small tp-strong' : 'tp-small'}>{level.subjectName}</span>
                  </span>
                ))}
              </div>
              <div className="tp-hint" style={{ marginTop: 6 }}>
                {parent ? `上级委托：${parent.name} · ` : '一级委托，由资金负责人直接签发 · '}
                整条链生效单笔上限 {fmtMoney(effective.amountLimit, item.currency)}，今日剩余 {fmtMoney(effective.dailyRemaining, item.currency)}
                {effective.active ? '' : '（链路中含有已失效环节）'}
              </div>
            </div>

            {item.status === 'REVOKED' ? (
              <div className="tp-callout warn" style={{ marginTop: 10 }}>
                <div className="tp-callout-title"><Icon name="alert" size={14} />该委托已撤销</div>
                <div className="tp-callout-body">撤销原因：{item.revokeReason || '未填写'}</div>
                <div className="tp-callout-detail">
                  {fmtRelative(item.revokedAt)}撤销 · {item.subjectName} 已失去对应付款权限
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--tp-border-soft)', flexWrap: 'wrap' }}>
              <span className="tp-faint tp-small">
                关联任务 {linkedTasks.length} 笔 · 今日已用 {fmtMoney(item.usedToday, item.currency)}
              </span>
              {linkedTasks.length ? (
                <Button
                  size="sm"
                  variant="ghost"
                  icon="external"
                  onClick={() => navigate('task', { taskId: linkedTasks[0].id })}
                >
                  查看最近一笔任务
                </Button>
              ) : null}
              <span className="tp-toolbar-end tp-inline" style={{ gap: 8 }}>
                {isActive ? (
                  <Button size="sm" variant="danger" icon="trash" onClick={() => { setRevokeTarget(item); setReason('') }}>
                    撤销委托
                  </Button>
                ) : (
                  <Tag tone={item.status === 'REVOKED' ? 'danger' : 'neutral'}>
                    {item.status === 'REVOKED' ? '权限已收回' : '已过期'}
                  </Tag>
                )}
              </span>
            </div>
          </Card>
        )
      }) : (
        <Card>
          <EmptyState
            icon="branch"
            title={filter === 'all' ? '还没有委托记录' : '没有符合筛选的委托'}
            desc={filter === 'all'
              ? '资金负责人签发委托后，这里会显示每一级的权限、限额与有效期。'
              : '换一个筛选条件，或查看全部委托。'}
            action={filter === 'all' ? null : <Button variant="ghost" onClick={() => setFilter('all')}>查看全部委托</Button>}
          />
        </Card>
      )}

      <Modal
        open={Boolean(revokeTarget)}
        onClose={closeRevoke}
        title="撤销委托"
        footer={(
          <div className="tp-drawer-actions">
            <Button variant="ghost" onClick={closeRevoke}>取消</Button>
            <Button variant="danger" icon="trash" disabled={!reason.trim()} onClick={confirmRevoke}>
              确认撤销
            </Button>
          </div>
        )}
      >
        {revokeTarget ? (
          <div className="tp-stack">
            <div className="tp-callout danger">
              <div className="tp-callout-title"><Icon name="alert" size={14} />撤销后权限立即收回</div>
              <div className="tp-callout-body">
                {revokeTarget.subjectName} 将立即失去「{revokeTarget.actionLabels.join('、')}」权限，其下游委托也会一并失效。
              </div>
              <div className="tp-callout-detail">该操作会写入审计记录，不可撤回；如只是临时停用，建议等委托到期自动失效。</div>
            </div>
            <KV
              items={[
                { k: '委托', v: revokeTarget.name },
                { k: '授权对象', v: revokeTarget.subjectName },
                { k: '单笔限额', v: fmtMoney(revokeTarget.amountLimit, revokeTarget.currency) },
                { k: '剩余有效期', v: fmtCountdown(revokeTarget.validTo) }
              ]}
            />
            <Field label="撤销原因" hint="必填。会写入审计记录，对代理和审计员可见。">
              <textarea
                className="tp-textarea"
                rows={3}
                value={reason}
                onChange={event => setReason(event.target.value)}
                placeholder="例如：代理行为异常，暂停其付款权限"
              />
            </Field>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
