/**
 * Governance: risk policies and risk models.
 *
 * A finance user reads this page to answer two questions: "at what risk level
 * does an agent get stopped?" and "what is scoring the risk?". Policies expose
 * four business zones (放行/限流/转人工/拦截) driven by three thresholds.
 * Drafts can be tuned with sliders, saved and published; publishing is
 * confirmed because it takes effect for every agent immediately.
 */
import { useMemo, useState } from 'react'
import { useActions, useWorld } from '../hooks.js'
import { dashboardStats, riskDistribution } from '../selectors.js'
import { POLICY_STATUS, fmtDate, fmtDateTime, fmtNum, fmtPct } from '../ui/format.js'
import { Icon } from '../ui/icons.jsx'
import {
  Button,
  Card,
  Donut,
  EmptyState,
  KV,
  Legend,
  Modal,
  PageHead,
  Segmented,
  StatCard,
  StatusTag,
  Tag,
  useToast,
} from '../ui/primitives.jsx'

const RISK_COLORS = {
  ALLOW: '#1f9d63',
  THROTTLE: '#0a6cff',
  DEFER: '#b36b00',
  BLOCK: '#d92d20',
}

/** The three thresholds, ordered from strictest to loosest. */
const THRESHOLD_ROWS = [
  {
    key: 'block',
    label: '拦截',
    tone: 'danger',
    color: RISK_COLORS.BLOCK,
    desc: '风险分达到该值直接拒绝，不留给人工放行的入口。',
  },
  {
    key: 'defer',
    label: '转人工',
    tone: 'warn',
    color: RISK_COLORS.DEFER,
    desc: '达到该值后暂停任务，等待财务负责人复核。',
  },
  {
    key: 'throttle',
    label: '限流',
    tone: 'info',
    color: RISK_COLORS.THROTTLE,
    desc: '达到该值后允许继续，但降低频次与单笔额度。',
  },
]

/**
 * @param {number} value
 * @returns {number} clamped to 0..1
 */
function clamp01(value) {
  return Math.min(Math.max(Number(value) || 0, 0), 1)
}

/**
 * Business rule: a stricter threshold must never be lower than a looser one.
 * @param {{block: number, defer: number, throttle: number}} thresholds
 */
function isOrdered(thresholds) {
  return thresholds.block >= thresholds.defer && thresholds.defer >= thresholds.throttle
}

/**
 * @param {number} value
 * @returns {string} two-decimal display, e.g. 0.80
 */
function fmtThreshold(value) {
  return clamp01(value).toFixed(2)
}

/**
 * Has the user moved any slider away from the stored policy?
 * @param {object} policy
 * @param {{block: number, defer: number, throttle: number}} value
 */
function isDirty(policy, value) {
  return THRESHOLD_ROWS.some(
    (row) => Math.abs((Number(value[row.key]) || 0) - (Number(policy.thresholds[row.key]) || 0)) > 0.001,
  )
}

/**
 * Split 0..1 into the four visible zones. Widths are derived from the
 * thresholds so the bar mirrors the business meaning.
 * @param {{block: number, defer: number, throttle: number}} thresholds
 */
function zoneSegments(thresholds) {
  const block = clamp01(thresholds.block)
  const defer = clamp01(thresholds.defer)
  const throttle = clamp01(thresholds.throttle)
  return [
    { label: '放行', color: RISK_COLORS.ALLOW, width: throttle },
    { label: '限流', color: RISK_COLORS.THROTTLE, width: Math.max(defer - throttle, 0) },
    { label: '转人工', color: RISK_COLORS.DEFER, width: Math.max(block - defer, 0) },
    { label: '拦截', color: RISK_COLORS.BLOCK, width: Math.max(1 - block, 0) },
  ]
}

/**
 * Publish/revise events are written against the policy id, so they double as
 * the version history for a policy.
 * @param {object} world
 * @param {object} policy
 */
function policyHistory(world, policy) {
  return (world.events || [])
    .filter(
      (event) =>
        event.taskId === policy.id &&
        (event.type === 'POLICY_PUBLISHED' || event.type === 'POLICY_REVISED'),
    )
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

/**
 * Governance page with segmented 风险策略 / 风险模型 views.
 */
export function GovernancePage() {
  const world = useWorld()
  const actions = useActions()
  const toast = useToast()
  const [tab, setTab] = useState('policies')
  const [drafts, setDrafts] = useState({})
  const [publishTarget, setPublishTarget] = useState(null)

  const stats = useMemo(() => dashboardStats(world), [world])
  const distribution = useMemo(() => riskDistribution(world), [world])
  const policies = world.policies || []
  const models = world.models || []
  const published = policies.filter((policy) => policy.status === 'PUBLISHED')
  const pendingDrafts = policies.filter((policy) => policy.status === 'DRAFT')
  const liveModels = models.filter((model) => model.status === 'PUBLISHED')
  const ruleTotal = policies.reduce((sum, policy) => sum + (Number(policy.ruleCount) || 0), 0)
  const reference = published[0] || policies[0] || null

  const valueOf = (policy) => drafts[policy.id] || policy.thresholds

  const changeThreshold = (policy, key, raw) => {
    if (policy.status !== 'DRAFT') return
    setDrafts((prev) => ({
      ...prev,
      [policy.id]: { ...(prev[policy.id] || policy.thresholds), [key]: clamp01(raw) },
    }))
  }

  const resetDraft = (policy) =>
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[policy.id]
      return next
    })

  const saveDraft = (policy) => {
    const value = valueOf(policy)
    if (!isOrdered(value)) {
      toast.push('阈值需满足：拦截 ≥ 转人工 ≥ 限流', 'error')
      return
    }
    actions.savePolicyThresholds(policy.id, value)
    resetDraft(policy)
    toast.push(`「${policy.name}」草稿已保存，发布后才会生效`, 'success')
  }

  const askPublish = (policy) => {
    if (!isOrdered(valueOf(policy))) {
      toast.push('阈值顺序不对，无法发布', 'error')
      return
    }
    setPublishTarget(policy)
  }

  const confirmPublish = () => {
    if (!publishTarget) return
    const policy = publishTarget
    const value = valueOf(policy)
    if (isDirty(policy, value)) actions.savePolicyThresholds(policy.id, value)
    actions.publishPolicy(policy.id)
    resetDraft(policy)
    setPublishTarget(null)
    toast.push(`「${policy.name}」已发布，新阈值立即对全部代理生效`, 'success')
  }

  return (
    <div className="tp-page">
      <PageHead
        title="治理策略"
        desc="风险越高，处置越严格：低风险自动放行，中风险限流，较高风险转人工复核，高风险直接拦截。所有调整都会留下版本记录。"
        actions={
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'policies', label: '风险策略', count: policies.length },
              { value: 'models', label: '风险模型', count: models.length },
            ]}
          />
        }
      />

      <div className="tp-stat-grid">
        <StatCard
          label="生效中的策略"
          value={published.length}
          unit={`/ ${policies.length}`}
          icon="shield"
          iconTone="var(--tp-success)"
          foot="覆盖全部代理付款"
        />
        <StatCard
          label="待发布草稿"
          value={pendingDrafts.length}
          unit="项"
          icon="fileText"
          iconTone={pendingDrafts.length > 0 ? 'var(--tp-warn)' : 'var(--tp-text-3)'}
          foot={pendingDrafts.length > 0 ? '调整阈值后需发布才生效' : '没有待发布的草稿'}
        />
        <StatCard
          label="运行中的模型"
          value={liveModels.length}
          unit={`/ ${models.length}`}
          icon="activity"
          iconTone="var(--tp-accent)"
          foot={`合计覆盖 ${ruleTotal} 条规则`}
        />
        <StatCard
          label="近 7 天风险事件"
          value={stats.riskEvents7d}
          unit="起"
          icon="alert"
          iconTone="var(--tp-warn)"
          foot={`拦截 ${stats.blocked} 笔 · 转人工 ${stats.humanReview} 笔`}
        />
      </div>

      {tab === 'policies' ? (
        <>
          {policies.length === 0 ? (
            <Card>
              <EmptyState
                icon="shield"
                title="还没有风险策略"
                desc="没有策略时代理无法发起付款，请先创建一条策略。"
              />
            </Card>
          ) : (
            <div className="tp-stack">
              {policies.map((policy) => {
                const value = valueOf(policy)
                return (
                  <PolicyCard
                    key={policy.id}
                    world={world}
                    policy={policy}
                    value={value}
                    dirty={isDirty(policy, value)}
                    ordered={isOrdered(value)}
                    onChange={(key, raw) => changeThreshold(policy, key, raw)}
                    onReset={() => resetDraft(policy)}
                    onSave={() => saveDraft(policy)}
                    onPublish={() => askPublish(policy)}
                  />
                )
              })}
            </div>
          )}

          <div className="tp-grid-2-1">
            <Card
              title="风险决策分布"
              desc="全部付款任务按实际处置结果汇总，反映策略当前的严格程度。"
            >
              <div className="tp-donut-row">
                <Donut
                  segments={distribution.map((item) => ({
                    label: item.label,
                    value: item.count,
                    color: RISK_COLORS[item.key] || RISK_COLORS.ALLOW,
                  }))}
                  size={168}
                  thickness={20}
                  center={
                    <div>
                      <div className="tp-donut-value">{stats.totalTasks}</div>
                      <div className="tp-faint">付款任务</div>
                    </div>
                  }
                />
                <div className="tp-grow">
                  <Legend
                    items={distribution.map((item) => ({
                      label: item.label,
                      color: RISK_COLORS[item.key] || RISK_COLORS.ALLOW,
                      value: item.count,
                    }))}
                  />
                  <div className="tp-card-note">
                    阈值越严格，拦截与转人工的占比越会上升，放行笔数相应减少。
                  </div>
                </div>
              </div>
            </Card>

            <Card
              title="阈值怎么读"
              desc={reference ? `以「${reference.name}」的当前阈值为例` : '四段区间对应四种处置'}
            >
              <div className="tp-stack" style={{ gap: 10 }}>
                {reference ? (
                  <>
                    <ThresholdExplainer
                      tone="danger"
                      title={`拦截 · 风险分 ≥ ${fmtThreshold(valueOf(reference).block)}`}
                      body="自动拒绝，不进入人工审批；如需继续必须调整策略或走线下特批。"
                    />
                    <ThresholdExplainer
                      tone="warn"
                      title={`转人工 · ${fmtThreshold(valueOf(reference).defer)} – ${fmtThreshold(valueOf(reference).block)}`}
                      body="任务暂停并通知财务复核，复核通过后才提交付款。"
                    />
                    <ThresholdExplainer
                      tone="info"
                      title={`限流 · ${fmtThreshold(valueOf(reference).throttle)} – ${fmtThreshold(valueOf(reference).defer)}`}
                      body="允许继续，但会降低发起频次并收紧单笔额度，同时保留记录。"
                    />
                    <ThresholdExplainer
                      tone="success"
                      title={`放行 · 低于 ${fmtThreshold(valueOf(reference).throttle)}`}
                      body="自动放行，仍需按正常流程提交付款并留存凭证。"
                    />
                  </>
                ) : null}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <>
          {models.length === 0 ? (
            <Card>
              <EmptyState
                icon="activity"
                title="还没有风险模型"
                desc="缺少模型时只有静态限额规则生效，风险判断会偏保守。"
              />
            </Card>
          ) : (
            <div className="tp-grid tp-grid-2">
              {models.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          )}

          <Card title="模型与策略的关系" desc="模型只负责打分，策略负责决定怎么处置">
            <div className="tp-callout info">
              <div className="tp-callout-title">
                <Icon name="info" size={14} />
                风险分先由模型给出，再由策略阈值划分区间
              </div>
              <div className="tp-callout-body">
                模型综合金额偏离、对手方历史、账户变更等信号，给每笔交易打一个 0 到 1 的风险分；
                风险策略把这把尺子切成四段，分别对应放行、限流、转人工和拦截。
              </div>
              <div className="tp-callout-detail">
                更换模型或更新版本，会改变风险分的整体水平，因此上线前需要与当前阈值一起评估。
              </div>
            </div>
          </Card>
        </>
      )}

      <div className="tp-footer-note">
        <Icon name="lock" size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
        策略发布与阈值修改都会写入审计记录，历史版本不会被覆盖删除。
      </div>

      <Modal
        open={Boolean(publishTarget)}
        onClose={() => setPublishTarget(null)}
        title="发布策略"
        footer={
          <>
            <Button onClick={() => setPublishTarget(null)}>取消</Button>
            <Button variant="primary" icon="check" onClick={confirmPublish}>
              确认发布
            </Button>
          </>
        }
      >
        {publishTarget ? (
          <div className="tp-stack">
            <p className="tp-muted" style={{ margin: 0, lineHeight: 1.6 }}>
              发布后「{publishTarget.name}」的新阈值会立即对全部代理生效，已在途任务仍按原策略处理。
            </p>
            <div className="tp-callout warn">
              <div className="tp-callout-title">
                <Icon name="alert" size={14} />
                即将生效的阈值
              </div>
              <div className="tp-callout-body">
                拦截 {fmtThreshold(valueOf(publishTarget).block)} · 转人工{' '}
                {fmtThreshold(valueOf(publishTarget).defer)} · 限流{' '}
                {fmtThreshold(valueOf(publishTarget).throttle)}
              </div>
            </div>
            <KV
              items={[
                { k: '策略版本', v: <span className="tp-mono">{publishTarget.version}</span> },
                { k: '适用范围', v: publishTarget.scope },
                { k: '规则数量', v: `${publishTarget.ruleCount || 0} 条` },
                { k: '撤销方式', v: '发布新版本覆盖，历史版本保留在审计记录中' },
              ]}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

/**
 * One policy card: status, sliders (drafts only), four-zone bar, effective
 * window and version history.
 * @param {{world: object, policy: object, value: object, dirty: boolean, ordered: boolean,
 *   onChange: Function, onReset: Function, onSave: Function, onPublish: Function}} props
 */
function PolicyCard({ world, policy, value, dirty, ordered, onChange, onReset, onSave, onPublish }) {
  const isDraft = policy.status === 'DRAFT'
  const zones = zoneSegments(value)
  const history = policyHistory(world, policy)

  return (
    <Card
      title={
        <span className="tp-inline" style={{ gap: 8 }}>
          {policy.name}
          <StatusTag map={POLICY_STATUS} status={policy.status} />
          <Tag tone="neutral">版本 {policy.version}</Tag>
        </span>
      }
      desc={`适用范围：${policy.scope} · 覆盖 ${policy.ruleCount || 0} 条规则`}
      actions={
        isDraft ? (
          <>
            <Button size="sm" variant="ghost" onClick={onReset} disabled={!dirty}>
              撤销改动
            </Button>
            <Button size="sm" onClick={onSave} disabled={!dirty || !ordered}>
              保存草稿
            </Button>
            <Button size="sm" variant="primary" icon="send" onClick={onPublish} disabled={!ordered}>
              发布策略
            </Button>
          </>
        ) : (
          <Tag tone="success">只读发布版</Tag>
        )
      }
    >
      <div className="tp-inline" style={{ justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
        <span className="tp-muted tp-small" style={{ lineHeight: 1.6 }}>{policy.description}</span>
        <span className="tp-hint" style={{ flex: 'none', marginLeft: 12 }}>
          {policy.publishedAt ? `${fmtDateTime(policy.publishedAt)} 起生效` : '发布后生效'}
          {policy.publishedBy ? ` · ${policy.publishedBy}` : ''}
        </span>
      </div>

      {THRESHOLD_ROWS.map((row) => (
        <div className="tp-threshold-row" key={row.key}>
          <Tag tone={row.tone}>{row.label}</Tag>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={clamp01(value[row.key])}
            disabled={!isDraft}
            aria-label={`${row.label}阈值`}
            onChange={(event) => onChange(row.key, event.target.value)}
          />
          <span className="tp-slider-value">{fmtThreshold(value[row.key])}</span>
        </div>
      ))}

      <div
        style={{
          display: 'flex',
          height: 8,
          borderRadius: 999,
          overflow: 'hidden',
          marginTop: 14,
          background: 'var(--tp-surface-3)',
        }}
      >
        {zones.map((zone) => (
          <div
            key={zone.label}
            title={`${zone.label} ${Math.round(zone.width * 100)}%`}
            style={{ width: `${zone.width * 100}%`, background: zone.color, opacity: 0.85 }}
          />
        ))}
      </div>
      <div className="tp-chart-foot">
        {zones.map((zone) => (
          <span key={zone.label} className="tp-inline" style={{ gap: 5 }}>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: zone.color,
              }}
            />
            {zone.label}
          </span>
        ))}
      </div>

      <div className="tp-card-note">
        风险分 ≥ {fmtThreshold(value.block)} 拦截；{fmtThreshold(value.defer)}–{fmtThreshold(value.block)} 转人工；
        {fmtThreshold(value.throttle)}–{fmtThreshold(value.defer)} 限流；低于 {fmtThreshold(value.throttle)} 放行。
        {!isDraft ? ' 已发布策略如需调整，请保存为新草稿并重新发布。' : ''}
      </div>

      {!ordered ? (
        <div className="tp-callout warn" style={{ marginTop: 10 }}>
          <div className="tp-callout-title">
            <Icon name="alert" size={14} />
            阈值顺序需要满足：拦截 ≥ 转人工 ≥ 限流
          </div>
          <div className="tp-callout-body">
            当前顺序会导致区间重叠，无法判断该拦截还是转人工，因此保存与发布都被阻止。
          </div>
        </div>
      ) : null}

      <div className="tp-divider" style={{ margin: '12px 0' }} />

      <div className="tp-label" style={{ marginBottom: 6 }}>版本历史</div>
      {history.length === 0 ? (
        <div className="tp-hint">
          {policy.status === 'PUBLISHED'
            ? `当前版本 ${policy.version} 为初始发布版本，暂无修改记录。`
            : '尚未发布；保存草稿与发布都会在这里生成记录。'}
        </div>
      ) : (
        <div className="tp-list">
          {history.map((event) => (
            <div key={event.id} className="tp-list-row" style={{ padding: '8px 2px' }}>
              <div className="tp-list-main">
                <div className="tp-list-title">
                  {event.type === 'POLICY_PUBLISHED' ? '发布新版本' : '调整阈值'}
                  <Tag tone={event.tone === 'success' ? 'success' : 'neutral'}>
                    {event.type === 'POLICY_PUBLISHED' ? '已发布' : '草稿修改'}
                  </Tag>
                </div>
                <div className="tp-list-sub">{event.body}</div>
              </div>
              <div className="tp-list-side">
                <span className="tp-hint">{fmtDateTime(event.at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/**
 * Business-language explanation of one decision zone.
 * @param {{tone: 'danger'|'warn'|'info'|'success', title: string, body: string}} props
 */
function ThresholdExplainer({ tone, title, body }) {
  return (
    <div className={`tp-callout ${tone}`}>
      <div className="tp-callout-title">
        <Icon
          name={tone === 'danger' ? 'xCircle' : tone === 'warn' ? 'clock' : tone === 'info' ? 'sliders' : 'checkCircle'}
          size={14}
        />
        {title}
      </div>
      <div className="tp-callout-body">{body}</div>
    </div>
  )
}

/**
 * One risk model card in plain business language.
 * @param {{model: object}} props
 */
function ModelCard({ model }) {
  const metrics = model.metrics || {}
  const live = model.status === 'PUBLISHED'
  const features = model.features || []

  return (
    <Card
      title={
        <span className="tp-inline" style={{ gap: 8 }}>
          {model.name}
          <Tag tone={live ? 'success' : 'neutral'}>{live ? '使用中' : POLICY_STATUS[model.status]?.label || '草稿'}</Tag>
        </span>
      }
      desc={`版本 ${model.version}${model.publishedAt ? ` · ${fmtDate(model.publishedAt)} 上线` : ''}`}
      actions={<Tag tone="neutral">{features.length} 项判断依据</Tag>}
    >
      <p className="tp-muted tp-small" style={{ margin: '0 0 12px', lineHeight: 1.6 }}>{model.description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
        <ModelMetric label="区分能力" value={fmtPct(metrics.auc)} />
        <ModelMetric label="判断准确率" value={fmtPct(metrics.precision)} />
        <ModelMetric label="异常召回率" value={fmtPct(metrics.recall)} />
        <ModelMetric label="参考样本" value={fmtNum(metrics.samples)} />
      </div>

      <div className="tp-divider" style={{ margin: '12px 0' }} />

      <div className="tp-label" style={{ marginBottom: 6 }}>主要判断依据</div>
      <div className="tp-inline">
        {features.map((feature) => (
          <Tag key={feature} tone="neutral">{feature}</Tag>
        ))}
      </div>

      <div className="tp-card-note">
        模型只负责给出 0 到 1 的风险分，是否拦截或转人工由风险策略的阈值决定。
      </div>
    </Card>
  )
}

/**
 * Small labelled metric used by model cards.
 * @param {{label: string, value: any}} props
 */
function ModelMetric({ label, value }) {
  return (
    <div>
      <div className="tp-label">{label}</div>
      <div className="tp-strong tp-num" style={{ marginTop: 2, fontSize: 13 }}>
        {value}
      </div>
    </div>
  )
}
