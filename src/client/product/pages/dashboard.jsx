/**
 * 总览 — the operator's daily cockpit.
 *
 * Answers four questions at a glance: what needs me now, how much value moved,
 * is the delegation network healthy, and what happened recently.
 */
import { useState } from 'react'
import { useWorld } from '../hooks.js'
import { useNavigation } from '../app/navigation.jsx'
import {
  agentLeaderboard, attentionItems, dashboardStats, openInterventions,
  recentActivity, riskDistribution, volumeSeries
} from '../selectors.js'
import { fmtDateTime, fmtMoney, fmtPct, fmtRelative, INTERVENTION_STATUS, RISK_DECISION, TASK_STATUS } from '../ui/format.js'
import { Avatar, Bars, Button, Card, Donut, EmptyState, Legend, PageHead, Progress, StatCard, StatusTag, Tag } from '../ui/primitives.jsx'
import { Icon } from '../ui/icons.jsx'

const RISK_COLORS = { ALLOW: '#1f9d63', THROTTLE: '#0a6cff', DEFER: '#b36b00', BLOCK: '#d92d20' }


/** First-run guidance, dismissed once per browser. */
const ONBOARDING_KEY = 'dsh-trust-platform.onboarding.v1'

function useOnboarding() {
  const [visible, setVisible] = useState(() => {
    try {
      return window.localStorage.getItem(ONBOARDING_KEY) !== 'done'
    } catch {
      return true
    }
  })
  const dismiss = () => {
    try {
      window.localStorage.setItem(ONBOARDING_KEY, 'done')
    } catch {
      // 忽略隐私模式下的存储限制
    }
    setVisible(false)
  }
  return [visible, dismiss]
}

/** Dashboard page. */
export function DashboardPage() {
  const world = useWorld()
  const { navigate, go } = useNavigation()
  const stats = dashboardStats(world)
  const volumes = volumeSeries(world)
  const risks = riskDistribution(world)
  const pending = openInterventions(world)
  const attention = attentionItems(world)
  const activity = recentActivity(world, 7)
  const leaders = agentLeaderboard(world)
  const maxVolume = Math.max(...volumes.map(item => item.value), 1)
  const [showOnboarding, dismissOnboarding] = useOnboarding()

  return (
    <div className="tp-page">
      <PageHead
        title="今天需要你关注的事情"
        desc="代理正在按委托链执行交易，你只需处理被规则挑出来的例外。"
        actions={(
          <>
            <Button icon="plus" onClick={() => navigate('tasks', { create: true })}>新建付款任务</Button>
            <Button variant="primary" icon="checkCircle" onClick={() => go('approvals')}>
              处理审批{pending.length ? ` · ${pending.length}` : ''}
            </Button>
          </>
        )}
      />


      {showOnboarding ? (
        <section className="tp-onboarding" aria-label="新手指引">
          <div className="tp-onboarding-head">
            <div>
              <div className="tp-onboarding-title">三步开始使用信任运营台</div>
              <div className="tp-onboarding-sub">先认识一下工作台：设定边界、放手执行、处理例外。</div>
            </div>
            <button type="button" className="tp-onboarding-close" aria-label="关闭新手指引" onClick={dismissOnboarding}>
              <Icon name="x" size={13} />
            </button>
          </div>
          <ol className="tp-onboarding-steps">
            <li>
              <span className="tp-onboarding-index">1</span>
              <span><b>设定边界</b>：在「治理策略」里确定风险阈值，在「委托授权」里给每个代理设定单笔与每日额度。</span>
            </li>
            <li>
              <span className="tp-onboarding-index">2</span>
              <span><b>代理执行</b>：代理在你的授权范围内创建并提交付款任务，每一步都留痕。</span>
            </li>
            <li>
              <span className="tp-onboarding-index">3</span>
              <span><b>处理例外</b>：只有超出规则的动作会进入「审批」，其余自动完成。</span>
            </li>
          </ol>
          <div className="tp-onboarding-actions">
            <Button icon="checkCircle" onClick={() => go(approvals)}>看看待我审批</Button>
            <Button variant="primary" icon="shield" onClick={() => go(delegations)}>查看委托授权</Button>
          </div>
        </section>
      ) : null}
      <div className="tp-stat-grid">
        <StatCard label="待我审批" value={pending.length} unit="项" icon="shield" iconTone="var(--tp-warn)"
          foot={stats.overdueApprovals ? `${stats.overdueApprovals} 项已超时` : '全部按时'} />
        <StatCard label="本月代理交易额" value={fmtMoney(stats.monthlyVolume)} icon="trendUp" iconTone="var(--tp-accent)"
          delta="8.4%" foot="环比上月" />
        <StatCard label="委托链健康" value={`${stats.activeDelegations}/${world.delegations.length}`} unit="生效" icon="branch" iconTone="var(--tp-success)"
          foot="无失效链路" />
        <StatCard label="待处理案件" value={stats.openCases} unit="个" icon="flag" iconTone={stats.openCases ? 'var(--tp-danger)' : 'var(--tp-success)'}
          foot={stats.openCases ? '含 1 个已升级' : '无未结案件'} />
      </div>

      <div className="tp-grid-2-1">
        <Card title="近 7 天交易额" desc="按任务创建时间汇总" actions={<Tag tone="info">近 7 天 {fmtMoney(volumes.reduce((sum, item) => sum + item.value, 0))}</Tag>}>
          <Bars
            items={volumes.map(item => ({
              label: item.label,
              value: item.value,
              tone: item.value > maxVolume * 0.85 ? 'warn' : ''
            }))}
            height={112}
          />
          <div className="tp-chart-foot">
            <span><span className="tp-faint">今日</span> {fmtMoney(volumes[volumes.length - 1].value)}</span>
            <span><span className="tp-faint">日均</span> {fmtMoney(volumes.reduce((sum, item) => sum + item.value, 0) / volumes.length)}</span>
            <span><span className="tp-faint">最高</span> {fmtMoney(maxVolume)}</span>
          </div>
        </Card>

        <Card title="风险决策分布" desc="全部付款任务">
          <div className="tp-donut-row">
            <Donut
              segments={risks.map(item => ({ label: item.label, value: item.count, color: RISK_COLORS[item.key] }))}
              center={<div><div className="tp-donut-value">{world.tasks.length}</div><div className="tp-faint">任务</div></div>}
            />
            <Legend items={risks.map(item => ({ label: item.label, color: RISK_COLORS[item.key], value: item.count }))} />
          </div>
          <div className="tp-card-note">
            <Icon name="info" size={13} />
            <span>拦截 {stats.blocked} 笔 · 人工复核 {stats.humanReview} 笔</span>
          </div>
        </Card>
      </div>

      <div className="tp-grid-2-1">
        <Card
          title="需要关注"
          desc="按优先级排序的例外处理"
          actions={<Button size="sm" variant="ghost" onClick={() => go('approvals')}>查看全部</Button>}
        >
          {attention.length === 0 ? (
            <EmptyState icon="checkCircle" title="没有待处理事项" desc="所有代理都在授权范围内正常工作。" />
          ) : (
            <div className="tp-attention">
              {attention.slice(0, 5).map((item, index) => (
                <button
                  type="button"
                  key={`${item.title}-${index}`}
                  className={`tp-attention-row ${item.tone}`}
                  onClick={() => (item.params?.taskId ? navigate('task', item.params) : item.params?.caseId ? navigate('case', item.params) : go(item.to))}
                >
                  <span className={`tp-attention-icon ${item.tone}`}>
                    <Icon name={item.tone === 'danger' ? 'alert' : item.tone === 'warn' ? 'clock' : 'info'} size={14} />
                  </span>
                  <span className="tp-attention-main">
                    <span className="tp-attention-title">{item.title}</span>
                    <span className="tp-attention-detail">{item.detail}</span>
                  </span>
                  <Icon name="chevronRight" size={15} />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card title="待我审批" desc="超过 SLA 会标红" actions={<Button size="sm" variant="ghost" onClick={() => go('approvals')}>去审批</Button>}>
          {pending.length === 0 ? (
            <EmptyState icon="checkCircle" title="审批已清空" desc="新的例外会实时出现在这里。" />
          ) : (
            <div className="tp-mini-list">
              {pending.slice(0, 3).map(item => (
                <button type="button" key={item.id} className="tp-mini-item" onClick={() => go('approvals')}>
                  <div className="tp-mini-main">
                    <div className="tp-mini-title">{item.title}</div>
                    <div className="tp-mini-sub">{item.reason}</div>
                  </div>
                  <div className="tp-mini-meta">
                    <StatusTag map={INTERVENTION_STATUS} status={item.status} />
                    <span className={new Date(item.dueAt) < Date.now() ? 'tp-danger-text' : 'tp-faint'}>{new Date(item.dueAt) < Date.now() ? '已超时' : fmtRelative(item.dueAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="tp-grid-2-1">
        <Card title="最近动态" desc="已签名并校验的审计事件">
          <div className="tp-activity">
            {activity.map(event => (
              <div className="tp-activity-row" key={event.id}>
                <span className={`tp-activity-node ${event.tone}`} />
                <div className="tp-activity-main">
                  <div className="tp-activity-title">
                    {event.typeLabel}
                    <span className="tp-faint"> · {event.actor}</span>
                  </div>
                  <div className="tp-activity-body">{event.body}</div>
                </div>
                <span className="tp-activity-time">{fmtRelative(event.at)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="代理活跃度" desc="按本月经手金额" actions={<Button size="sm" variant="ghost" onClick={() => go('agents')}>代理名册</Button>}>
          <div className="tp-leader-list">
            {leaders.map(agent => (
              <button type="button" key={agent.id} className="tp-leader-item" onClick={() => navigate('agent', { agentId: agent.id })}>
                <Avatar name={agent.shortName} seed={agent.id} size="sm" />
                <div className="tp-leader-main">
                  <div className="tp-leader-name">{agent.name}</div>
                  <Progress value={agent.monthlyVolume / Math.max(1, leaders[0].monthlyVolume)} />
                </div>
                <div className="tp-leader-meta">
                  <div className="tp-strong tp-num">{fmtMoney(agent.monthlyVolume)}</div>
                  <div className="tp-faint">成功率 {fmtPct(agent.successRate)}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="tp-footer-note">
        <Icon name="lock" size={13} />
        所有交易都留有可验证的审计记录。当前为本地体验数据，恢复示例数据后回到初始状态。
      </div>
    </div>
  )
}
