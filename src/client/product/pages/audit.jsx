/**
 * 审计中心：案件、审计报告、证据库，以及案件详情。
 * 面向财务与合规人员，界面文案统一使用业务术语。
 */
import { useEffect, useMemo, useState } from 'react'
import { useActions, useWorld } from '../hooks.js'
import { useNavigation } from '../app/navigation.jsx'
import {
  caseById,
  caseStats,
  evidenceForTask,
  taskById,
} from '../selectors.js'
import {
  CASE_STATUS,
  EVIDENCE_KIND,
  INTERVENTION_STATUS,
  REPORT_STATUS,
  TASK_STATUS,
  fmtDate,
  fmtDateTime,
  fmtMoney,
  fmtNum,
  fmtPct,
  fmtRelative,
  shortId,
} from '../ui/format.js'
import { Icon } from '../ui/icons.jsx'
import {
  Button,
  Card,
  Drawer,
  EmptyState,
  Field,
  KV,
  Modal,
  PageHead,
  Progress,
  SearchInput,
  Segmented,
  StatCard,
  StatusTag,
  Tag,
  Timeline,
  useToast,
} from '../ui/primitives.jsx'

const SEVERITY = {
  critical: { label: '严重', tone: 'danger' },
  high: { label: '高', tone: 'danger' },
  medium: { label: '中', tone: 'warn' },
  low: { label: '低', tone: 'neutral' },
}

const REPORT_SECTIONS = ['委托链健康度', '风险决策分布', '结算闭环', '案件与整改', '证据覆盖率']

function severityOf(value) {
  return SEVERITY[value] || { label: '一般', tone: 'neutral' }
}

/** 报告文件格式中的技术类型转成业务可读名称。 */
function displayFormat(format) {
  return String(format || '')
    .split('·')
    .map(part => {
      const value = part.trim()
      return value === 'JSON' ? '数据文件' : value
    })
    .filter(Boolean)
    .join(' · ')
}

function defaultPeriod() {
  const now = new Date()
  return `${now.getFullYear()} 年 ${now.getMonth() + 1} 月`
}

/** 汇总裁决案件关联的证据：优先按关联任务匹配，再补充关联事件所属任务。 */
function linkedEvidence(world, item) {
  if (!item) return []
  const taskIds = new Set(item.linkedTaskIds || [])
  for (const event of world.events || []) {
    if ((item.linkedEventIds || []).includes(event.id) && event.taskId) taskIds.add(event.taskId)
  }
  const seen = new Set()
  const rows = []
  for (const taskId of taskIds) {
    for (const evidence of evidenceForTask(world, taskId)) {
      if (seen.has(evidence.id)) continue
      seen.add(evidence.id)
      rows.push(evidence)
    }
  }
  return rows
}

function groupEvidenceByKind(rows) {
  const groups = new Map()
  for (const row of rows) {
    if (!groups.has(row.kind)) groups.set(row.kind, [])
    groups.get(row.kind).push(row)
  }
  return [...groups.entries()].map(([kind, items]) => {
    const anchored = items.filter(item => item.anchored).length
    return {
      kind,
      items,
      total: items.length,
      anchored,
      coverage: items.length ? anchored / items.length : 0,
    }
  })
}

/** 结案确认弹窗：填写结案结论后写入案件调查记录。 */
function ResolveCaseModal({ open, caseItem, onClose }) {
  const actions = useActions()
  const toast = useToast()
  const [conclusion, setConclusion] = useState('')

  useEffect(() => {
    if (open) setConclusion('')
  }, [open, caseItem && caseItem.id])

  if (!caseItem) return null

  const confirm = () => {
    actions.resolveCase(caseItem.id, { conclusion: conclusion.trim() || undefined })
    toast.push('案件已结案，结论已写入审计记录', 'success')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="案件结案"
      footer={(
        <>
          <Button onClick={onClose}>取消</Button>
          <Button variant="danger" onClick={confirm}>确认结案</Button>
        </>
      )}
    >
      <KV
        items={[
          { k: '案件', v: caseItem.title },
          { k: '当前状态', v: (CASE_STATUS[caseItem.status] || {}).label || caseItem.status },
          { k: '负责人', v: caseItem.owner },
          { k: '证据覆盖率', v: fmtPct(caseItem.coverage) },
        ]}
      />
      {caseItem.status === 'ESCALATED' ? (
        <div className="tp-callout warn" style={{ margin: '12px 0' }}>
          <div className="tp-callout-title">升级提示</div>
          <div className="tp-callout-detail">该案件已升级，结案后升级记录仍会保留在审计轨迹中。</div>
        </div>
      ) : null}
      <Field label="结案结论" hint="结论将写入案件调查记录，用于后续审计追溯">
        <textarea
          className="tp-textarea"
          rows={4}
          value={conclusion}
          onChange={event => setConclusion(event.target.value)}
          placeholder="例如：证据链完整，确认费用异常由重复计费导致，已要求供应商退款并补充对账。"
        />
      </Field>
    </Modal>
  )
}

/** 升级申请弹窗：填写升级说明并通知合规委员会。 */
function EscalateCaseModal({ open, caseItem, onClose }) {
  const toast = useToast()
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) setNote('')
  }, [open, caseItem && caseItem.id])

  if (!caseItem) return null

  const confirm = () => {
    toast.push('升级申请已提交，等待合规委员会复核', 'info')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="升级案件"
      footer={(
        <>
          <Button onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={confirm}>提交升级申请</Button>
        </>
      )}
    >
      <KV
        items={[
          { k: '案件', v: caseItem.title },
          { k: '当前状态', v: (CASE_STATUS[caseItem.status] || {}).label || caseItem.status },
          { k: '严重程度', v: severityOf(caseItem.severity).label },
          { k: '负责人', v: caseItem.owner },
        ]}
      />
      <Field label="升级说明" hint="升级后处理时限顺延，复核意见将归档到审计报告">
        <textarea
          className="tp-textarea"
          rows={4}
          value={note}
          onChange={event => setNote(event.target.value)}
          placeholder="说明需要委员会介入的原因，例如：涉及跨主体委托链与高额结算，建议升级复核。"
        />
      </Field>
    </Modal>
  )
}

export function AuditPage() {
  const world = useWorld()
  const actions = useActions()
  const toast = useToast()
  const { navigate } = useNavigation()

  const cases = world.cases || []
  const reports = world.reports || []
  const evidence = world.evidence || []
  const stats = caseStats(world)

  const [tab, setTab] = useState('cases')
  const [caseFilter, setCaseFilter] = useState('ALL')
  const [resolveTarget, setResolveTarget] = useState(null)
  const [escalateTarget, setEscalateTarget] = useState(null)
  const [reportOpenId, setReportOpenId] = useState(null)
  const [reportDraftOpen, setReportDraftOpen] = useState(false)
  const [reportDraft, setReportDraft] = useState({ title: '', period: '', sections: [] })
  const [evidenceFilter, setEvidenceFilter] = useState('ALL')
  const [evidenceQuery, setEvidenceQuery] = useState('')

  const sortedCases = useMemo(
    () => [...cases].sort((a, b) => Date.parse(b.openedAt) - Date.parse(a.openedAt)),
    [cases]
  )
  const filteredCases = useMemo(
    () => sortedCases.filter(item => caseFilter === 'ALL' || item.status === caseFilter),
    [sortedCases, caseFilter]
  )
  const selectedReport = reports.find(report => report.id === reportOpenId) || null
  const anchoredCount = useMemo(() => evidence.filter(item => item.anchored).length, [evidence])
  const evidenceRows = useMemo(() => {
    const query = evidenceQuery.trim().toLowerCase()
    return evidence.filter(item => {
      if (evidenceFilter === 'ANCHORED' && !item.anchored) return false
      if (evidenceFilter === 'UNANCHORED' && item.anchored) return false
      if (!query) return true
      const kindLabel = EVIDENCE_KIND[item.kind] || item.kind || ''
      return `${item.subject || ''} ${kindLabel} ${item.digest || ''}`.toLowerCase().includes(query)
    })
  }, [evidence, evidenceFilter, evidenceQuery])

  const tabs = [
    { value: 'cases', label: '案件', count: cases.length },
    { value: 'reports', label: '审计报告', count: reports.length },
    { value: 'evidence', label: '证据库', count: evidence.length },
  ]

  const caseFilters = [
    { value: 'ALL', label: '全部', count: cases.length },
    { value: 'OPEN', label: CASE_STATUS.OPEN.label, count: stats.open },
    { value: 'ESCALATED', label: CASE_STATUS.ESCALATED.label, count: stats.escalated },
    { value: 'RESOLVED', label: CASE_STATUS.RESOLVED.label, count: stats.resolved },
  ]

  const evidenceFilters = [
    { value: 'ALL', label: '全部', count: evidence.length },
    { value: 'ANCHORED', label: '已锚定', count: anchoredCount },
    { value: 'UNANCHORED', label: '待锚定', count: evidence.length - anchoredCount },
  ]

  const anchorRatio = evidence.length ? anchoredCount / evidence.length : 0

  const openReportForm = () => {
    setReportDraft({ title: '', period: defaultPeriod(), sections: ['委托链健康度', '风险决策分布', '结算闭环'] })
    setReportDraftOpen(true)
  }

  const updateReportDraft = patch => setReportDraft(prev => ({ ...prev, ...patch }))

  const toggleReportSection = section => setReportDraft(prev => ({
    ...prev,
    sections: prev.sections.includes(section)
      ? prev.sections.filter(item => item !== section)
      : [...prev.sections, section],
  }))

  const reportFormValid = Boolean(
    reportDraft.title.trim() && reportDraft.period.trim() && reportDraft.sections.length
  )

  const submitReport = () => {
    if (!reportFormValid) return
    actions.generateReport({
      title: reportDraft.title.trim(),
      period: reportDraft.period.trim(),
      sections: reportDraft.sections,
    })
    setReportDraftOpen(false)
    toast.push('审计报告已生成，可在列表中查看', 'success')
  }

  return (
    <div className="tp-page">
      <PageHead
        title="审计中心"
        desc="集中管理案件调查、审计报告与证据锚定记录，支撑财务与合规团队的复核与归档。"
        actions={<Segmented options={tabs} value={tab} onChange={setTab} />}
      />

      {tab === 'cases' ? (
        <>
          <div className="tp-stat-grid">
            <StatCard label="处理中案件" value={stats.open} foot="需在时限内推进调查" icon="flag" iconTone="var(--tp-warn)" />
            <StatCard label="已升级案件" value={stats.escalated} foot="等待合规委员会复核" icon="alert" iconTone="var(--tp-danger)" />
            <StatCard label="已结案案件" value={stats.resolved} foot="结论已归档进审计记录" icon="checkCircle" iconTone="var(--tp-success)" />
            <StatCard label="平均证据覆盖率" value={fmtPct(stats.avgCoverage)} foot="已锚定证据占关联证据比例" icon="shield" iconTone="var(--tp-info)" />
          </div>

          <Card
            title="案件列表"
            desc="按开启时间排序，点击任意行查看案件详情"
            actions={<Segmented options={caseFilters} value={caseFilter} onChange={setCaseFilter} />}
          >
            {filteredCases.length ? (
              <div className="tp-table-wrap">
                <table className="tp-table tp-audit-table">
                  <thead>
                    <tr>
                      <th>案件</th>
                      <th>状态</th>
                      <th>严重程度</th>
                      <th>负责人</th>
                      <th>证据覆盖率</th>
                      <th>开启时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map(item => {
                      const severity = severityOf(item.severity)
                      return (
                        <tr key={item.id} className="tp-clickable" onClick={() => navigate('case', { caseId: item.id })}>
                          <td>
                            <div className="tp-strong tp-truncate" style={{ maxWidth: 280 }}>{item.title}</div>
                            <div className="tp-faint" style={{ fontSize: 12, marginTop: 2 }}>
                              {shortId(item.id)} · {(item.findings || []).length} 条调查记录
                            </div>
                          </td>
                          <td><StatusTag map={CASE_STATUS} status={item.status} /></td>
                          <td><Tag tone={severity.tone} dot>{severity.label}</Tag></td>
                          <td>{item.owner}</td>
                          <td>
                            <div className="tp-progress-row" style={{ minWidth: 120 }}>
                              <Progress value={item.coverage} />
                              <span className="tp-num tp-faint" style={{ fontSize: 12 }}>{fmtPct(item.coverage)}</span>
                            </div>
                          </td>
                          <td className="tp-muted" style={{ whiteSpace: 'nowrap' }}>{fmtRelative(item.openedAt)}</td>
                          <td>
                            <div className="tp-cell-actions" onClick={event => event.stopPropagation()}>
                              {item.status === 'OPEN' ? (
                                <Button size="sm" variant="ghost" onClick={() => setEscalateTarget(item)}>升级</Button>
                              ) : null}
                              {item.status !== 'RESOLVED' ? (
                                <Button size="sm" variant="danger" onClick={() => setResolveTarget(item)}>结案</Button>
                              ) : (
                                <Button size="sm" variant="ghost" onClick={() => navigate('case', { caseId: item.id })}>查看</Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon="scale"
                title="没有符合条件的案件"
                desc="当前筛选条件下没有案件，切换筛选后可查看全部案件。"
                action={<Button variant="ghost" onClick={() => setCaseFilter('ALL')}>查看全部案件</Button>}
              />
            )}
          </Card>
        </>
      ) : null}

      {tab === 'reports' ? (
        <Card
          title="审计报告"
          desc="按期间归档的信任运营报告，可查看章节或生成新的报告"
          actions={<Button variant="primary" size="sm" icon="plus" onClick={openReportForm}>生成报告</Button>}
        >
          {reports.length ? (
            <div className="tp-list">
              {reports.map(report => (
                <div key={report.id} className="tp-list-row">
                  <div className="tp-list-main">
                    <div className="tp-list-title">{report.title}</div>
                    <div className="tp-list-sub">{report.period} · 生成于 {fmtDateTime(report.createdAt)} · {report.createdBy}</div>
                  </div>
                  <div className="tp-list-side" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="tp-faint" style={{ fontSize: 12 }}>
                      {(report.sections || []).length} 个章节 · {report.sizeLabel}
                    </span>
                    <StatusTag map={REPORT_STATUS} status={report.status} />
                    <Button size="sm" variant="ghost" onClick={() => setReportOpenId(report.id)}>查看</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="fileText"
              title="暂无审计报告"
              desc="生成首份信任运营报告，用于财务与合规团队的定期复核。"
              action={<Button variant="primary" onClick={openReportForm}>生成报告</Button>}
            />
          )}
        </Card>
      ) : null}

      {tab === 'evidence' ? (
        <Card title="证据库" desc={`共 ${evidence.length} 条证据，已锚定 ${anchoredCount} 条`}>
          <div className="tp-toolbar" style={{ marginBottom: 12 }}>
            <div className="tp-progress-row" style={{ flex: '1 1 240px', minWidth: 200 }}>
              <Progress value={anchorRatio} />
              <span className="tp-num tp-faint" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{fmtPct(anchorRatio)}</span>
            </div>
            <div className="tp-toolbar-end" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Segmented options={evidenceFilters} value={evidenceFilter} onChange={setEvidenceFilter} />
              <SearchInput value={evidenceQuery} onChange={setEvidenceQuery} placeholder="搜索证据类型或关联事项" />
            </div>
          </div>

          {evidenceRows.length ? (
            <div className="tp-table-wrap">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th>证据类型</th>
                    <th>关联事项</th>
                    <th>摘要值</th>
                    <th>锚定状态</th>
                    <th>记录时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {evidenceRows.map(item => (
                    <tr key={item.id}>
                      <td><Tag tone="info">{EVIDENCE_KIND[item.kind] || item.kind}</Tag></td>
                      <td>
                        <div className="tp-strong tp-truncate" style={{ maxWidth: 260 }}>{item.subject}</div>
                        <div className="tp-faint" style={{ fontSize: 12, marginTop: 2 }}>{shortId(item.id)}</div>
                      </td>
                      <td><span className="tp-mono" title={item.digest}>{shortId(item.digest)}</span></td>
                      <td>
                        {item.anchored
                          ? <Tag tone="success" dot>已锚定</Tag>
                          : <Tag tone="warn" dot>待锚定</Tag>}
                      </td>
                      <td className="tp-muted" style={{ whiteSpace: 'nowrap' }}>{fmtRelative(item.at)}</td>
                      <td>
                        {item.anchored ? (
                          <span className="tp-faint" style={{ fontSize: 12 }}>
                            锚定于 {item.anchoredAt ? fmtRelative(item.anchoredAt) : '—'}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon="link"
                            onClick={() => {
                              actions.anchorEvidence(item.id)
                              toast.push('证据已锚定，时间戳已写入审计记录', 'success')
                            }}
                          >
                            锚定
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon="search"
              title="未找到匹配的证据"
              desc="调整搜索关键词或锚定状态筛选，查看更多证据记录。"
              action={<Button variant="ghost" onClick={() => { setEvidenceQuery(''); setEvidenceFilter('ALL') }}>清空筛选</Button>}
            />
          )}
        </Card>
      ) : null}

      <ResolveCaseModal
        open={Boolean(resolveTarget)}
        caseItem={resolveTarget}
        onClose={() => setResolveTarget(null)}
      />
      <EscalateCaseModal
        open={Boolean(escalateTarget)}
        caseItem={escalateTarget}
        onClose={() => setEscalateTarget(null)}
      />

      <Drawer
        open={Boolean(selectedReport)}
        onClose={() => setReportOpenId(null)}
        title={selectedReport ? selectedReport.title : '审计报告'}
        subtitle={selectedReport ? `${selectedReport.period} · ${fmtDateTime(selectedReport.createdAt)}` : ''}
        footer={<Button onClick={() => setReportOpenId(null)}>关闭</Button>}
      >
        {selectedReport ? (
          <>
            <div className="tp-callout" style={{ marginBottom: 14 }}>
              <div className="tp-callout-title"><Icon name="info" size={14} /> 报告摘要</div>
              <div className="tp-callout-body">
                本报告覆盖 {selectedReport.period} 期间星桥支付的委托链、风险决策与结算记录，供财务与合规团队复核与归档。
              </div>
            </div>
            <KV
              items={[
                { k: '报告状态', v: <StatusTag map={REPORT_STATUS} status={selectedReport.status} /> },
                { k: '报告期间', v: selectedReport.period },
                { k: '生成时间', v: fmtDateTime(selectedReport.createdAt) },
                { k: '生成人', v: selectedReport.createdBy },
                { k: '文件格式', v: displayFormat(selectedReport.format) },
                { k: '文件大小', v: selectedReport.sizeLabel },
              ]}
            />
            <div className="tp-divider" />
            <div className="tp-section-title" style={{ marginBottom: 8 }}>报告章节</div>
            <div className="tp-list">
              {(selectedReport.sections || []).map((section, index) => (
                <div key={`${section}-${index}`} className="tp-list-row">
                  <div className="tp-list-main">
                    <div className="tp-list-title">{`${String(index + 1).padStart(2, '0')} · ${section}`}</div>
                    <div className="tp-list-sub">章节内容已归档至报告</div>
                  </div>
                  <div className="tp-list-side">
                    <Icon name="fileText" size={16} style={{ color: 'var(--tp-text-3)' }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Drawer>

      <Modal
        open={reportDraftOpen}
        onClose={() => setReportDraftOpen(false)}
        title="生成审计报告"
        footer={(
          <>
            <Button onClick={() => setReportDraftOpen(false)}>取消</Button>
            <Button variant="primary" disabled={!reportFormValid} onClick={submitReport}>确认生成</Button>
          </>
        )}
      >
        <Field label="报告标题" hint="将用于归档与检索">
          <input
            className="tp-input"
            value={reportDraft.title}
            onChange={event => updateReportDraft({ title: event.target.value })}
            placeholder="例如：2026 年 11 月信任运营月报"
          />
        </Field>
        <Field label="报告期间" hint="填写本次报告覆盖的时间范围">
          <input
            className="tp-input"
            value={reportDraft.period}
            onChange={event => updateReportDraft({ period: event.target.value })}
            placeholder="例如：2026 年 11 月"
          />
        </Field>
        <div className="tp-field">
          <div className="tp-field-label">包含章节</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {REPORT_SECTIONS.map(section => {
              const active = reportDraft.sections.includes(section)
              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => toggleReportSection(section)}
                  style={{
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 999,
                    fontSize: 12,
                    border: `1px solid ${active ? 'var(--tp-accent)' : 'var(--tp-border)'}`,
                    background: active ? 'var(--tp-accent-soft)' : 'var(--tp-surface)',
                    color: active ? 'var(--tp-accent)' : 'var(--tp-text-2)',
                  }}
                >
                  {section}
                </button>
              )
            })}
          </div>
          <div className="tp-field-hint">至少选择一个章节</div>
        </div>
      </Modal>
    </div>
  )
}

export function CaseDetailPage({ caseId }) {
  const world = useWorld()
  const { back, navigate } = useNavigation()

  const item = caseId ? caseById(world, caseId) : null

  const [resolveOpen, setResolveOpen] = useState(false)
  const [escalateOpen, setEscalateOpen] = useState(false)

  const relatedTasks = useMemo(() => {
    if (!item) return []
    return (item.linkedTaskIds || []).map(taskId => taskById(world, taskId)).filter(Boolean)
  }, [world, item])

  const relatedEvents = useMemo(() => {
    if (!item) return []
    const ids = item.linkedEventIds || []
    return (world.events || [])
      .filter(event => ids.includes(event.id))
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
  }, [world, item])

  const relatedInterventions = useMemo(() => {
    if (!item) return []
    const taskIds = new Set(item.linkedTaskIds || [])
    return (world.interventions || []).filter(intervention => taskIds.has(intervention.taskId))
  }, [world, item])

  const evidenceGroups = useMemo(
    () => groupEvidenceByKind(linkedEvidence(world, item)),
    [world, item]
  )

  const timelineItems = useMemo(() => {
    if (!item) return []
    const rows = [
      {
        key: 'opened',
        title: '案件开启',
        meta: fmtDateTime(item.openedAt),
        body: `负责人：${item.owner}`,
        icon: 'flag',
      },
    ]
    const findings = [...(item.findings || [])].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    findings.forEach((finding, index) => {
      rows.push({
        key: `finding-${index}`,
        title: '调查记录',
        meta: fmtDateTime(finding.at),
        body: finding.text,
      })
    })
    if (item.resolvedAt) {
      rows.push({
        key: 'resolved',
        title: '案件结案',
        meta: fmtDateTime(item.resolvedAt),
        body: item.conclusion || '调查完成，已按结案结论归档',
        tone: 'success',
        icon: 'checkCircle',
      })
    }
    return rows
  }, [item])

  if (!item) {
    return (
      <div className="tp-page">
        <PageHead
          title="案件详情"
          desc="查看案件调查进展、关联事项与证据覆盖情况"
          actions={<Button variant="ghost" icon="arrowLeft" onClick={back}>返回</Button>}
        />
        <Card>
          <EmptyState
            icon="search"
            title="未找到该案件"
            desc="案件可能已归档或链接已失效，请返回审计中心重新选择。"
            action={<Button variant="primary" onClick={back}>返回审计中心</Button>}
          />
        </Card>
      </div>
    )
  }

  const severity = severityOf(item.severity)

  return (
    <div className="tp-page">
      <PageHead
        title={item.title}
        desc={`${fmtDate(item.openedAt)} 开启 · ${item.owner} 负责`}
        actions={(
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button variant="ghost" icon="arrowLeft" onClick={back}>返回列表</Button>
            {item.status === 'OPEN' ? (
              <Button variant="ghost" icon="arrowUpRight" onClick={() => setEscalateOpen(true)}>升级</Button>
            ) : null}
            {item.status !== 'RESOLVED' ? (
              <Button variant="danger" onClick={() => setResolveOpen(true)}>结案</Button>
            ) : null}
          </div>
        )}
      />

      <div className="tp-inline">
        <StatusTag map={CASE_STATUS} status={item.status} />
        <Tag tone={severity.tone} dot>{severity.label}严重程度</Tag>
        <Tag tone="neutral" dot>负责人 {item.owner}</Tag>
        <span className="tp-faint" style={{ fontSize: 12 }}>
          案件编号 {shortId(item.id)} · 开启于 {fmtDateTime(item.openedAt)}
        </span>
      </div>

      <div className="tp-callout">
        <div className="tp-callout-title"><Icon name="info" size={14} /> 案件摘要</div>
        <div className="tp-callout-body">{item.summary}</div>
      </div>

      {item.status === 'ESCALATED' ? (
        <div className="tp-callout danger">
          <div className="tp-callout-title"><Icon name="alert" size={14} /> 已升级至合规委员会</div>
          <div className="tp-callout-detail">该案件涉及较高风险，结案前请确认委员会复核意见已记录在案。</div>
        </div>
      ) : null}

      {item.status === 'RESOLVED' && item.conclusion ? (
        <div className="tp-callout success">
          <div className="tp-callout-title">
            <Icon name="checkCircle" size={14} /> 结案结论 · {item.resolvedAt ? fmtDateTime(item.resolvedAt) : '已归档'}
          </div>
          <div className="tp-callout-body">{item.conclusion}</div>
        </div>
      ) : null}

      <div className="tp-stat-grid">
        <StatCard label="证据覆盖率" value={fmtPct(item.coverage)} foot="关联证据已锚定比例" icon="shield" iconTone="var(--tp-info)" />
        <StatCard label="关联任务" value={relatedTasks.length} foot="与案件直接关联的付款任务" icon="package" />
        <StatCard label="审计事件" value={relatedEvents.length} foot="审计轨迹中的关键事件" icon="activity" />
        <StatCard label="调查记录" value={(item.findings || []).length} foot="调查过程中的关键结论" icon="fileText" />
      </div>

      <div className="tp-grid tp-grid-2" style={{ alignItems: 'start' }}>
        <Card title="调查时间线" desc="案件开启以来的调查动作与关键结论">
          <Timeline items={timelineItems} />
        </Card>
        <Card title="证据覆盖情况" desc="按证据类型统计锚定进度">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
            <span className="tp-strong" style={{ fontSize: 13 }}>整体覆盖率</span>
            <span className="tp-num tp-faint" style={{ fontSize: 12 }}>{fmtPct(item.coverage)}</span>
          </div>
          <Progress value={item.coverage} />
          <div className="tp-divider" />
          {evidenceGroups.length ? evidenceGroups.map(group => (
            <div key={group.kind} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="tp-strong" style={{ fontSize: 13 }}>{EVIDENCE_KIND[group.kind] || group.kind}</span>
                <span className="tp-num tp-faint" style={{ fontSize: 12 }}>
                  {group.anchored} / {group.total} 已锚定 · {fmtPct(group.coverage)}
                </span>
              </div>
              <Progress value={group.coverage} tone={group.coverage >= 1 ? 'success' : undefined} />
            </div>
          )) : (
            <div className="tp-muted" style={{ fontSize: 13 }}>该案件暂未关联证据记录。</div>
          )}
        </Card>
      </div>

      <div className="tp-grid tp-grid-2" style={{ alignItems: 'start' }}>
        <Card title="关联任务" desc="与案件调查直接相关的付款任务">
          {relatedTasks.length ? (
            <div className="tp-list tp-list-clickable">
              {relatedTasks.map(task => (
                <div key={task.id} className="tp-list-row" onClick={() => navigate('task', { taskId: task.id })}>
                  <div className="tp-list-main">
                    <div className="tp-list-title">{task.title}</div>
                    <div className="tp-list-sub">
                      {task.counterpartyOrg} · {fmtMoney(task.amount, task.currency)} · 风险评分 {fmtNum((task.riskScore || 0) * 100)}
                    </div>
                  </div>
                  <div className="tp-list-side" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusTag map={TASK_STATUS} status={task.status} />
                    <Icon name="chevronRight" size={16} style={{ color: 'var(--tp-text-3)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="package" title="暂无关联任务" desc="该案件的调查尚未关联到具体的付款任务。" />
          )}
        </Card>
        <Card title="关联例外审批" desc="与案件相关的例外审批与处理结果">
          {relatedInterventions.length ? (
            <div className="tp-list">
              {relatedInterventions.map(intervention => (
                <div key={intervention.id} className="tp-list-row">
                  <div className="tp-list-main">
                    <div className="tp-list-title">{intervention.title}</div>
                    <div className="tp-list-sub">{intervention.reason} · 截止 {fmtRelative(intervention.dueAt)}</div>
                  </div>
                  <div className="tp-list-side">
                    <StatusTag map={INTERVENTION_STATUS} status={intervention.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="check" title="暂无例外审批" desc="该案件未触发需要人工裁决的例外审批。" />
          )}
        </Card>
      </div>

      <Card title="关联审计事件" desc="案件调查过程中引用的审计轨迹">
        {relatedEvents.length ? relatedEvents.map(event => (
          <div
            key={event.id}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: '10px 0',
              borderBottom: '1px solid var(--tp-border-soft)',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                marginTop: 6,
                flexShrink: 0,
                background: event.tone === 'danger'
                  ? 'var(--tp-danger)'
                  : event.tone === 'warn'
                    ? 'var(--tp-warn)'
                    : 'var(--tp-accent)',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="tp-strong" style={{ fontSize: 13 }}>{event.typeLabel}</span>
                <span className="tp-faint" style={{ fontSize: 12 }}>{event.actor} · {fmtDateTime(event.at)}</span>
                <Tag tone="info">{shortId(event.id)}</Tag>
              </div>
              <div className="tp-muted" style={{ fontSize: 13, lineHeight: 1.6, marginTop: 4 }}>{event.body}</div>
            </div>
          </div>
        )) : (
          <EmptyState icon="activity" title="暂无关联审计事件" desc="案件尚未引用外部审计事件。" />
        )}
      </Card>

      <ResolveCaseModal open={resolveOpen} caseItem={item} onClose={() => setResolveOpen(false)} />
      <EscalateCaseModal open={escalateOpen} caseItem={item} onClose={() => setEscalateOpen(false)} />
    </div>
  )
}
