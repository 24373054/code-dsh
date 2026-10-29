/**
 * Agent roster and agent detail.
 *
 * The console treats every AI agent as an employee with a job, a signed
 * credential and a delegated spending limit. This page lists the roster and
 * opens one agent's full authority picture: what it may do, who entrusted it,
 * what it did recently, and any risk signals a finance user should know about.
 */
import { Fragment, useMemo, useState } from 'react'
import { useNavigation } from '../app/navigation.jsx'
import { useWorld } from '../hooks.js'
import {
  agentById,
  agentTaskIds,
  chainEffective,
  chainFor,
  dashboardStats,
  roster,
  taskById,
} from '../selectors.js'
import {
  CREDENTIAL_STATUS,
  DELEGATION_STATUS,
  DID_STATUS,
  RISK_DECISION,
  TASK_STATUS,
  fmtCountdown,
  fmtDate,
  fmtDateTime,
  fmtMoney,
  fmtPct,
  fmtRelative,
  shortId,
} from '../ui/format.js'
import { Icon } from '../ui/icons.jsx'
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  KV,
  PageHead,
  Progress,
  Segmented,
  Select,
  StatCard,
  StatusTag,
  Tag,
  Timeline,
} from '../ui/primitives.jsx'

const CLAIM_LABELS = {
  scope: '业务范围',
  singleLimit: '单笔上限',
  dailyLimit: '日累计上限',
  currency: '结算币种',
  corridors: '收付通道',
  dataClasses: '可读数据',
  retention: '留存时长',
  maxSingle: '单笔上限',
  registration: '登记编号',
  jurisdiction: '注册属地',
}

const CLAIM_VALUE_LABELS = {
  procurement: '采购下单',
  'payment-request': '付款申请',
  'cross-border-settlement': '跨境结算',
  'read-only': '只读查看',
  evidence: '证据材料',
  case: '案件材料',
  'logistics-settlement': '物流结算',
  'counterparty-verification': '对手方核验',
  transaction: '交易数据',
  identity: '身份数据',
}

/**
 * Trust band for the roster. Unlike the transaction risk score, a HIGHER
 * trust score means LOWER risk, so this mapping is intentionally separate
 * from the shared riskBand() helper.
 * @param {number} trustScore
 * @returns {{label: string, tone: 'success'|'info'|'warn'|'danger'}}
 */
function trustBand(trustScore) {
  const score = Number(trustScore) || 0
  if (score >= 0.95) return { label: '低风险', tone: 'success' }
  if (score >= 0.92) return { label: '风险较低', tone: 'info' }
  if (score >= 0.88) return { label: '风险中等', tone: 'warn' }
  return { label: '风险偏高', tone: 'danger' }
}

/**
 * "200,000 USD" / "procurement,payment-request" claim values are written for
 * machines; turn the enumerations a business reader already knows into labels.
 * @param {string} value
 */
function readableClaim(value) {
  return String(value)
    .split(',')
    .map((part) => {
      const trimmed = part.trim()
      return trimmed ? CLAIM_VALUE_LABELS[trimmed] || trimmed : ''
    })
    .filter(Boolean)
    .join(' · ')
}

/** @param {object} credential */
function credentialClaims(credential) {
  const claims = credential.claims || {}
  return Object.keys(claims)
    .filter((key) => claims[key] !== undefined && claims[key] !== null)
    .map((key) => ({
      k: CLAIM_LABELS[key] || '其他信息',
      v: key === 'scope' || key === 'dataClasses' ? readableClaim(claims[key]) : String(claims[key]),
    }))
}

/** @param {string} tone */
function timelineIcon(tone) {
  if (tone === 'danger') return 'alert'
  if (tone === 'warn') return 'clock'
  if (tone === 'success') return 'checkCircle'
  return 'info'
}

/**
 * One metric tile inside roster cards and the detail header.
 * @param {{label: string, value: any, hint?: string}} props
 */
function Metric({ label, value, hint }) {
  return (
    <div>
      <div className="tp-label">{label}</div>
      <div className="tp-strong tp-num" style={{ marginTop: 2, fontSize: 13 }}>
        {value}
      </div>
      {hint ? <div className="tp-hint" style={{ marginTop: 1 }}>{hint}</div> : null}
    </div>
  )
}

/**
 * Agent roster: ordered cards with compliance last, filterable by status/role.
 */
export function AgentsPage() {
  const world = useWorld()
  const { navigate } = useNavigation()
  const [status, setStatus] = useState('all')
  const [role, setRole] = useState('all')

  const stats = dashboardStats(world)
  const agents = useMemo(() => roster(world), [world])

  const roleOptions = useMemo(() => {
    const seen = new Map()
    for (const agent of agents) {
      if (!seen.has(agent.role)) seen.set(agent.role, agent.roleLabel)
    }
    return [{ value: 'all', label: '全部角色' }, ...Array.from(seen, ([value, label]) => ({ value, label }))]
  }, [agents])

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: '全部', count: agents.length },
      { value: 'ACTIVE', label: '在册', count: agents.filter((agent) => agent.status === 'ACTIVE').length },
      { value: 'SUSPENDED', label: '已暂停', count: agents.filter((agent) => agent.status === 'SUSPENDED').length },
    ],
    [agents],
  )

  const filtered = useMemo(
    () =>
      agents.filter(
        (agent) =>
          (status === 'all' || agent.status === status) && (role === 'all' || agent.role === role),
      ),
    [agents, role, status],
  )

  const openAgent = (agentId) => navigate('agent', { agentId })

  return (
    <div className="tp-page">
      <PageHead
        title="代理"
        desc="每个代理都像一名有明确授权的员工：有自己的职责、凭证与额度。合规审计类代理只读，不会占用付款额度。"
        actions={
          <>
            <Button icon="branch" onClick={() => navigate('delegations')}>
              委托授权
            </Button>
            <Button variant="primary" icon="sliders" onClick={() => navigate('governance')}>
              风险策略
            </Button>
          </>
        }
      />

      <div className="tp-stat-grid">
        <StatCard
          label="在册代理"
          value={stats.activeAgents}
          unit={`/ ${world.agents.length}`}
          icon="users"
          iconTone="var(--tp-accent)"
          foot="可按职责分工执行任务"
        />
        <StatCard
          label="生效委托"
          value={stats.activeDelegations}
          unit="项"
          icon="branch"
          iconTone="var(--tp-info)"
          foot="委托链路完整才可付款"
        />
        <StatCard
          label="本月代理交易额"
          value={fmtMoney(stats.monthlyVolume)}
          icon="wallet"
          iconTone="var(--tp-success)"
          foot="含采购付款与跨境结算"
        />
        <StatCard
          label="任务完成率"
          value={fmtPct(stats.successRate)}
          icon="checkCircle"
          iconTone="var(--tp-success)"
          foot="近 30 天已完成任务占比"
        />
      </div>

      <Card
        title="代理名册"
        desc="按本月交易额排序；合规审计代理排在最后，便于与业务代理区分。"
        actions={<Tag tone="neutral">{filtered.length} 个代理</Tag>}
      >
        <div className="tp-toolbar" style={{ marginBottom: 14 }}>
          <Segmented value={status} onChange={setStatus} options={statusOptions} />
          <span className="tp-inline" style={{ gap: 6 }}>
            <span className="tp-hint">角色</span>
            <Select value={role} onChange={setRole} options={roleOptions} label="按角色筛选" />
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="users"
            title="没有符合条件的代理"
            desc="换一个角色或状态筛选，或者查看全部代理名册。"
            action={
              <Button
                icon="refresh"
                onClick={() => {
                  setStatus('all')
                  setRole('all')
                }}
              >
                重置筛选
              </Button>
            }
          />
        ) : (
          <div className="tp-grid tp-grid-3">
            {filtered.map((agent) => {
              const band = trustBand(agent.trustScore)
              const taskCount = agentTaskIds(world, agent.id).length
              return (
                <div
                  key={agent.id}
                  className="tp-card tp-card-flat"
                  role="button"
                  tabIndex={0}
                  onClick={() => openAgent(agent.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openAgent(agent.id)
                    }
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}
                >
                  <div className="tp-inline" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                    <Avatar name={agent.shortName || agent.name} seed={agent.id} size="lg" />
                    <div className="tp-grow">
                      <div className="tp-inline" style={{ gap: 6 }}>
                        <span className="tp-strong" style={{ fontSize: 14 }}>{agent.name}</span>
                        <StatusTag map={DID_STATUS} status={agent.status} />
                      </div>
                      <div className="tp-muted tp-small" style={{ marginTop: 3 }}>
                        {agent.roleLabel} · {agent.orgName}
                      </div>
                      <div className="tp-inline" style={{ marginTop: 6, gap: 6 }}>
                        <Tag tone={band.tone}>{band.label}</Tag>
                        <span className="tp-mono tp-faint">{shortId(agent.id)}</span>
                      </div>
                    </div>
                  </div>

                  <p className="tp-muted tp-small" style={{ margin: 0, lineHeight: 1.55 }}>
                    {agent.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                    <Metric label="信任分" value={Number(agent.trustScore).toFixed(2)} />
                    <Metric label="本月交易额" value={fmtMoney(agent.monthlyVolume)} />
                    <Metric label="成功率" value={fmtPct(agent.successRate)} />
                    <Metric label="最近任务" value={`${taskCount} 个`} />
                  </div>

                  <div className="tp-divider" style={{ margin: '2px 0' }} />

                  <div className="tp-inline" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <span className="tp-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="clock" size={12} />
                      最近活跃 {fmtRelative(agent.lastActiveAt)}
                    </span>
                    <span className="tp-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      查看详情
                      <Icon name="chevronRight" size={12} />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="tp-card-note">
          <Icon name="info" size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
          名册中每个代理都必须有一张有效凭证和一条生效委托，缺少任一项都会被拦截。
        </div>
      </Card>

      <div className="tp-footer-note">
        <Icon name="lock" size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
        代理身份与权限变更都会写入审计记录。
      </div>
    </div>
  )
}

/**
 * Agent detail: header, credentials, delegations, recent tasks, timeline and
 * proactive risk notes. Unknown ids fall back to a friendly empty state.
 * @param {{agentId?: string}} props
 */
export function AgentDetailPage({ agentId }) {
  const world = useWorld()
  const { navigate } = useNavigation()
  const agent = agentId ? agentById(world, agentId) : undefined

  if (!agent) {
    return (
      <div className="tp-page">
        <Card>
          <EmptyState
            icon="users"
            title="未找到这个代理"
            desc={
              agentId
                ? `代理 ${shortId(agentId)} 可能已移出名册，或链接已经失效。`
                : '缺少代理编号，请从代理名册重新进入。'
            }
            action={
              <Button icon="arrowLeft" onClick={() => navigate('agents')}>
                返回代理名册
              </Button>
            }
          />
        </Card>
      </div>
    )
  }

  const band = trustBand(agent.trustScore)
  const credentials = world.credentials.filter((credential) => credential.subjectId === agent.id)
  const granted = world.delegations.filter((delegation) => delegation.subjectId === agent.id)
  const issued = world.delegations.filter((delegation) => delegation.issuerName === agent.name)
  const taskIds = agentTaskIds(world, agent.id)
  const idList = Array.isArray(taskIds) ? taskIds : Array.from(taskIds || [])
  const tasks = idList
    .map((id) => taskById(world, id))
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const events = world.events
    .filter(
      (event) =>
        event.actorId === agent.id ||
        (agent.shortName && event.actor && event.actor.includes(agent.shortName)),
    )
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  const notes = buildRiskNotes({ agent, credentials, granted, issued, tasks })

  return (
    <div className="tp-page">
      <Card>
        <div className="tp-inline" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 16 }}>
          <Avatar name={agent.shortName || agent.name} seed={agent.id} size="lg" />
          <div className="tp-grow">
            <div className="tp-inline" style={{ gap: 8 }}>
              <h2 className="tp-section-title" style={{ fontSize: 18 }}>{agent.name}</h2>
              <StatusTag map={DID_STATUS} status={agent.status} />
              <Tag tone={band.tone}>{band.label}</Tag>
            </div>
            <div className="tp-muted tp-small" style={{ marginTop: 4 }}>
              {agent.roleLabel} · {agent.orgName} · 加入 {fmtRelative(agent.createdAt)}
            </div>
            <div className="tp-inline" style={{ marginTop: 8, gap: 6 }}>
              <span className="tp-mono tp-faint" title="代理登记标识">{shortId(agent.id)}</span>
              <span className="tp-dot-sep" />
              <span className="tp-hint">最近活跃 {fmtRelative(agent.lastActiveAt)}</span>
              <span className="tp-dot-sep" />
              <span className="tp-hint">信任分 {Number(agent.trustScore).toFixed(2)}</span>
            </div>
          </div>
          <div className="tp-inline" style={{ flexWrap: 'nowrap', flex: 'none' }}>
            <Button size="sm" icon="branch" onClick={() => navigate('delegations')}>
              委托链
            </Button>
            <Button size="sm" icon="fileText" onClick={() => navigate('audit')}>
              审计记录
            </Button>
          </div>
        </div>

        <p className="tp-muted tp-small" style={{ margin: '14px 0 0', lineHeight: 1.6 }}>{agent.description}</p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid var(--tp-border-soft)',
          }}
        >
          <Metric label="信任分" value={Number(agent.trustScore).toFixed(2)} hint={band.label} />
          <Metric label="本月交易额" value={fmtMoney(agent.monthlyVolume)} />
          <Metric label="成功率" value={fmtPct(agent.successRate)} />
          <Metric label="有效凭证" value={`${credentials.filter((item) => item.status === 'ACTIVE').length} / ${credentials.length}`} />
          <Metric label="最近任务" value={`${tasks.length} 个`} />
        </div>
      </Card>

      <div className="tp-grid-2-1">
        <div className="tp-stack">
          <Card
            title="能力与凭证"
            desc="由签发方授予、在有效期内可核验的业务权限。凭证失效后相关操作会被拦截。"
            actions={<Tag tone="neutral">{credentials.length} 张</Tag>}
          >
            {credentials.length === 0 ? (
              <EmptyState
                icon="key"
                title="暂无凭证"
                desc="该代理没有可核验的能力凭证，无法发起新的任务。"
              />
            ) : (
              <div className="tp-list">
                {credentials.map((credential) => (
                  <div key={credential.id} className="tp-list-row" style={{ alignItems: 'flex-start' }}>
                    <Avatar name={credential.issuerName} seed={credential.issuerDid} size="sm" />
                    <div className="tp-list-main">
                      <div className="tp-list-title">
                        <span>{credential.name}</span>
                        <StatusTag map={CREDENTIAL_STATUS} status={credential.status} />
                      </div>
                      <div className="tp-list-sub">
                        <span>签发方 {credential.issuerName}</span>
                        <span className="tp-dot-sep" />
                        <span>有效期至 {fmtDate(credential.expiresAt)}（还剩 {fmtCountdown(credential.expiresAt)}）</span>
                        <span className="tp-dot-sep" />
                        <span>最近核验 {fmtRelative(credential.verifiedAt)}</span>
                      </div>
                      <div className="tp-claims" style={{ marginTop: 8 }}>
                        {credentialClaims(credential).map((claim) => (
                          <div key={claim.k} className="tp-hint">
                            <span className="tp-label">{claim.k}</span>
                            <div className="tp-small">{claim.v}</div>
                          </div>
                        ))}
                      </div>
                      <div className="tp-inline" style={{ marginTop: 8 }}>
                        <span className="tp-mono tp-faint" title="凭证指纹">{shortId(credential.digest)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title="委托授权"
            desc="代理只能在被明确委托的额度与动作内行动；子委托会继承上级链路的最严限制。"
            actions={<Tag tone="neutral">{granted.length + issued.length} 项</Tag>}
          >
            {granted.length === 0 && issued.length === 0 ? (
              <EmptyState
                icon="branch"
                title="暂无委托关系"
                desc="还没有人把付款权限委托给这个代理，或者它也没有向下授权。"
                action={
                  <Button size="sm" onClick={() => navigate('delegations')}>
                    查看委托授权
                  </Button>
                }
              />
            ) : (
              <div className="tp-stack" style={{ gap: 18 }}>
                {granted.length > 0 ? (
                  <div>
                    <div className="tp-label" style={{ marginBottom: 8 }}>收到的委托</div>
                    <div className="tp-list">
                      {granted.map((delegation) => (
                        <DelegationRow key={delegation.id} world={world} delegation={delegation} />
                      ))}
                    </div>
                  </div>
                ) : null}
                {issued.length > 0 ? (
                  <div>
                    <div className="tp-label" style={{ marginBottom: 8 }}>向下授予的委托</div>
                    <div className="tp-list">
                      {issued.map((delegation) => (
                        <DelegationRow key={delegation.id} world={world} delegation={delegation} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </Card>

          <Card
            title="最近任务"
            desc="该代理最近参与的任务；点击任意一行查看完整审批与凭证。"
            actions={
              <Button size="sm" variant="ghost" icon="arrowRight" onClick={() => navigate('tasks')}>
                全部任务
              </Button>
            }
          >
            {tasks.length === 0 ? (
              <EmptyState icon="fileText" title="暂无任务" desc="该代理还没有参与过付款任务。" />
            ) : (
              <div className="tp-table-wrap">
                <table className="tp-table">
                  <thead>
                    <tr>
                      <th>任务</th>
                      <th>交易对手</th>
                      <th className="tp-th-right">金额</th>
                      <th>风险处置</th>
                      <th>状态</th>
                      <th className="tp-th-right">创建时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="tp-clickable"
                        onClick={() => navigate('task', { taskId: task.id })}
                      >
                        <td>
                          <div className="tp-strong" style={{ fontSize: 12.5 }}>{task.title}</div>
                          <div className="tp-mono tp-faint">{shortId(task.id)}</div>
                        </td>
                        <td>
                          <div>{task.counterparty}</div>
                          <div className="tp-faint tp-small">{task.counterpartyOrg}</div>
                        </td>
                        <td className="tp-td-right">{fmtMoney(task.amount, task.currency)}</td>
                        <td>
                          <Tag tone={RISK_DECISION[task.riskDecision]?.tone || 'neutral'}>
                            {RISK_DECISION[task.riskDecision]?.label || '待评估'}
                          </Tag>
                        </td>
                        <td>
                          <StatusTag map={TASK_STATUS} status={task.status} />
                        </td>
                        <td className="tp-td-right tp-faint">{fmtDateTime(task.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card
            title="活动时间线"
            desc="来自审计记录的代理动作，按时间倒序排列。"
            actions={<Tag tone="neutral">{events.length} 条</Tag>}
          >
            {events.length === 0 ? (
              <EmptyState icon="activity" title="暂无活动记录" desc="该代理还没有留下可审计的动作。" />
            ) : (
              <Timeline
                items={events.map((event) => ({
                  key: event.id,
                  title: event.typeLabel,
                  meta: `${event.actor} · ${fmtDateTime(event.at)}`,
                  body: event.body,
                  tone: ['success', 'warn', 'danger'].includes(event.tone) ? event.tone : undefined,
                  icon: timelineIcon(event.tone),
                }))}
              />
            )}
          </Card>
        </div>

        <div className="tp-stack">
          <Card
            title="风险提示"
            desc="系统根据凭证、委托、任务与风险记录自动汇总，仅作提醒，不替代人工判断。"
          >
            <div className="tp-stack" style={{ gap: 10 }}>
              {notes.map((note) => (
                <div key={note.title} className={`tp-callout ${note.tone}`}>
                  <div className="tp-callout-title">
                    <Icon
                      name={note.tone === 'danger' ? 'alert' : note.tone === 'warn' ? 'clock' : note.tone === 'success' ? 'checkCircle' : 'info'}
                      size={14}
                    />
                    {note.title}
                  </div>
                  <div className="tp-callout-body">{note.body}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="关键信息" desc="对外展示与排查问题时常用">
            <KV
              items={[
                { k: '代理名称', v: agent.name },
                { k: '职责角色', v: agent.roleLabel },
                { k: '所属组织', v: agent.orgName },
                { k: '名册状态', v: <StatusTag map={DID_STATUS} status={agent.status} /> },
                { k: '信任分', v: <span className="tp-num">{Number(agent.trustScore).toFixed(2)}</span> },
                {
                  k: '签名密钥',
                  v: agent.role === 'compliance' ? '审计密钥已登记' : '主密钥已登记',
                },
                { k: '登记标识', v: <span className="tp-mono">{shortId(agent.id)}</span> },
                { k: '加入时间', v: fmtDateTime(agent.createdAt) },
                { k: '最近活跃', v: fmtRelative(agent.lastActiveAt) },
              ]}
            />
            <div className="tp-card-note">
              <Icon name="lock" size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
              代理不能自行扩大额度；任何提额都需要财务负责人重新委托。
            </div>
          </Card>
        </div>
      </div>

      <div className="tp-footer-note">
        <Icon name="lock" size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
        所有代理动作均以证据形式留存，可在审计与案件中复核。
      </div>
    </div>
  )
}

/**
 * One delegation with its parent chain and effective daily budget.
 * @param {{world: object, delegation: object}} props
 */
function DelegationRow({ world, delegation }) {
  const chain = chainFor(world, delegation.id)
  const effective =
    chainEffective(world, delegation.id) || {
      dailyLimit: delegation.dailyLimit,
      dailyRemaining: undefined,
      usedToday: delegation.usedToday,
    }
  const used = Number(delegation.usedToday) || 0
  const dailyLimit = Number(effective.dailyLimit || delegation.dailyLimit) || 0
  const usedRatio = dailyLimit > 0 ? Math.min(used / dailyLimit, 1) : 0

  return (
    <div
      className="tp-list-row"
      style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}
    >
      <div className="tp-inline" style={{ width: '100%' }}>
        <span className="tp-list-title">{delegation.name}</span>
        <StatusTag map={DELEGATION_STATUS} status={delegation.status} />
        <span className="tp-grow" />
        <span className="tp-hint">
          {delegation.issuerName} → {delegation.subjectName}
        </span>
      </div>
      <div className="tp-small tp-muted">{delegation.purpose}</div>
      <div className="tp-inline">
        {(delegation.actionLabels || []).map((label) => (
          <Tag key={label} tone="neutral">{label}</Tag>
        ))}
      </div>
      <div className="tp-progress-row">
        <span className="tp-hint" style={{ whiteSpace: 'nowrap' }}>今日已用</span>
        <Progress value={usedRatio} tone={usedRatio >= 0.8 ? 'danger' : usedRatio >= 0.6 ? 'warn' : 'success'} />
        <span className="tp-hint" style={{ whiteSpace: 'nowrap' }}>
          {fmtMoney(used)} / {fmtMoney(dailyLimit)}
        </span>
      </div>
      <div className="tp-inline">
        <span className="tp-hint">单笔上限 {fmtMoney(delegation.amountLimit)}</span>
        <span className="tp-dot-sep" />
        <span className="tp-hint">日累计上限 {fmtMoney(delegation.dailyLimit)}</span>
        <span className="tp-dot-sep" />
        <span className="tp-hint">有效期 {fmtDate(delegation.validFrom)} 至 {fmtDate(delegation.validTo)}</span>
        {effective.dailyRemaining !== undefined ? (
          <>
            <span className="tp-dot-sep" />
            <span className="tp-hint">今日剩余 {fmtMoney(effective.dailyRemaining)}</span>
          </>
        ) : null}
      </div>
      {chain.length > 0 ? (
        <div className="tp-chain" style={{ marginTop: 2 }}>
          {chain.map((node, index) => (
            <Fragment key={node.id}>
              {index > 0 ? <span className="tp-chain-arrow" /> : null}
              <div className={`tp-chain-node${index === 0 ? ' root' : ''}`}>
                <div className="tp-chain-line">
                  <Avatar name={node.issuerName} seed={node.issuerDid} size="sm" />
                  <span className="tp-chain-name">{node.issuerName}</span>
                  <Icon name="chevronRight" size={12} />
                  <span className="tp-chain-name">{node.subjectName}</span>
                </div>
                <div className="tp-chain-detail">
                  <span>单笔 {fmtMoney(node.amountLimit)}</span>
                  <span>日累计 {fmtMoney(node.dailyLimit)}</span>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      ) : null}
      {delegation.status === 'REVOKED' && delegation.revokeReason ? (
        <div className="tp-callout warn" style={{ padding: '8px 10px' }}>
          <div className="tp-callout-body">
            已撤销{delegation.revokedAt ? `（${fmtDate(delegation.revokedAt)}）` : ''}：{delegation.revokeReason}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Plain-language risk notes for one agent. Returns at least one entry so the
 * panel never renders empty.
 * @param {{agent: object, credentials: object[], granted: object[], issued: object[], tasks: object[]}} input
 */
function buildRiskNotes({ agent, credentials, granted, issued, tasks }) {
  const notes = []

  const suspended = credentials.filter((credential) => credential.status === 'SUSPENDED')
  if (suspended.length > 0) {
    notes.push({
      tone: 'warn',
      title: `${suspended.length} 张凭证处于暂停状态`,
      body: '暂停期间相关付款会被自动拒绝，需要在签发方重新核验后才能恢复。',
    })
  }

  const blocked = tasks.filter((task) => task.riskDecision === 'BLOCK')
  if (blocked.length > 0) {
    notes.push({
      tone: 'danger',
      title: `${blocked.length} 笔付款任务被拦截`,
      body: `最近一笔为「${blocked[0].title}」。如确需继续，请走人工复核或调整策略阈值。`,
    })
  }

  const deferred = tasks.filter((task) => task.riskDecision === 'DEFER')
  if (deferred.length > 0) {
    notes.push({
      tone: 'warn',
      title: `${deferred.length} 笔任务曾转人工复核`,
      body: '人工复核会保留完整记录，建议关注同一交易对手是否反复触发。',
    })
  }

  const revoked = [...granted, ...issued].filter((delegation) => delegation.status === 'REVOKED')
  if (revoked.length > 0) {
    notes.push({
      tone: 'info',
      title: `存在 ${revoked.length} 项已撤销的委托`,
      body: '撤销不会删除历史记录，但新的请求会被拒绝。',
    })
  }

  if (agent.role === 'compliance') {
    notes.push({
      tone: 'info',
      title: '只读审计代理',
      body: '该代理不持有付款委托，只能查看与调查，符合职责分离要求。',
    })
  }

  if (Number(agent.trustScore) < 0.92) {
    notes.push({
      tone: 'warn',
      title: '信任分低于组织平均水平',
      body: '建议缩小单笔额度、要求人工复核，或在观察期内只开放小额任务。',
    })
  }

  if (agent.role !== 'compliance' && granted.length === 0 && credentials.length === 0) {
    notes.push({
      tone: 'danger',
      title: '缺少有效授权',
      body: '该代理没有凭证也没有委托，目前无法发起任何付款。',
    })
  }

  if (notes.length === 0) {
    notes.push({
      tone: 'success',
      title: '暂未发现异常',
      body: '凭证有效、委托仍在有效期内，近期任务没有被拦截或长时间挂起。',
    })
  }

  return notes
}
