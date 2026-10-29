/**
 * Frame and top-level navigation of the trust-platform console.
 *
 * The console is one DSH main panel: the shell renders the operator's workspace
 * header (organization, search, notifications, account) plus the product tabs.
 * Pages own their own content and use `useNavigation()` for drill-downs.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigation } from './navigation.jsx'
import { useActions, useWorld } from '../hooks.js'
import { searchAll, unreadNotifications } from '../selectors.js'
import { fmtMoney, fmtRelative } from '../ui/format.js'
import { Avatar, IconButton, Tag } from '../ui/primitives.jsx'
import { Icon } from '../ui/icons.jsx'
import { DashboardPage } from '../pages/dashboard.jsx'
import { ApprovalsPage } from '../pages/approvals.jsx'
import { TasksPage, TaskDetailPage } from '../pages/tasks.jsx'
import { AgentsPage, AgentDetailPage } from '../pages/agents.jsx'
import { DelegationsPage } from '../pages/delegations.jsx'
import { GovernancePage } from '../pages/governance.jsx'
import { AuditPage, CaseDetailPage } from '../pages/audit.jsx'
import { ProductSettingsPage } from '../pages/settings.jsx'

/** Top-level tabs, in product order. */
const TABS = [
  { id: 'dashboard', label: '总览', icon: 'dashboard' },
  { id: 'approvals', label: '审批', icon: 'checkCircle' },
  { id: 'tasks', label: '付款任务', icon: 'package' },
  { id: 'agents', label: '代理', icon: 'users' },
  { id: 'delegations', label: '委托授权', icon: 'branch' },
  { id: 'governance', label: '治理策略', icon: 'sliders' },
  { id: 'audit', label: '审计与案件', icon: 'fileText' },
  { id: 'settings', label: '设置', icon: 'settings' }
]

/** Detail pages and the tab they belong to. */
const DETAIL_PARENT = { task: 'tasks', agent: 'agents', case: 'audit' }

/** Console shell. */
export function Shell() {
  const world = useWorld()
  const actions = useActions()
  const { route, navigate, back, go } = useNavigation()
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showBell, setShowBell] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const searchRef = useRef(null)
  const stats = useWorldStats(world)
  const unread = unreadNotifications(world)
  const parentTab = DETAIL_PARENT[route.page] || route.page
  const results = searchAll(world, query)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setShowSearch(false)
        setShowBell(false)
        setShowAccount(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus()
  }, [showSearch])

  const openResult = (hit) => {
    setQuery('')
    setShowSearch(false)
    if (hit.kind === 'task') navigate('task', { taskId: hit.id })
    else if (hit.kind === 'agent') navigate('agent', { agentId: hit.id })
    else if (hit.kind === 'case') navigate('case', { caseId: hit.id })
    else go('governance')
  }

  const openNotification = (item) => {
    actions.markNotificationRead(item.id)
    setShowBell(false)
    if (item.target === 'approvals' || item.target === 'tasks' || item.target === 'delegations' || item.target === 'cases') {
      go(item.target === 'cases' ? 'audit' : item.target)
    } else if (item.target === 'governance') go('governance')
    else if (item.target === 'reports') go('audit')
  }

  return (
    <div className="tp-shell">
      <header className="tp-topbar">
        <div className="tp-brand">
          <span className="tp-brand-mark"><Icon name="shield" size={17} strokeWidth={2} /></span>
          <div className="tp-brand-text">
            <div className="tp-brand-name">星桥支付 · 信任运营台</div>
            <div className="tp-brand-sub">代理交易的可审计工作台</div>
          </div>
          <Tag tone="info" style={{ marginLeft: 10 }}>沙箱数据</Tag>
        </div>

        <div className="tp-topbar-right">
          <div className="tp-global-search">
            <button type="button" className="tp-search-trigger" onClick={() => setShowSearch(value => !value)}>
              <Icon name="search" size={14} />
              <span>搜索任务、代理、案件…</span>
              <kbd>⌘K</kbd>
            </button>
            {showSearch ? (
              <div className="tp-popover tp-search-pop">
                <input
                  ref={searchRef}
                  className="tp-search-input"
                  value={query}
                  placeholder="输入关键词"
                  onChange={event => setQuery(event.target.value)}
                />
                <div className="tp-search-results">
                  {results.length === 0 ? (
                    <div className="tp-search-empty">{query ? '没有匹配结果' : '输入关键词开始搜索'}</div>
                  ) : results.map(hit => (
                    <button type="button" key={`${hit.kind}-${hit.id}`} className="tp-search-hit" onClick={() => openResult(hit)}>
                      <span className="tp-search-hit-icon"><Icon name={hit.kind === 'task' ? 'package' : hit.kind === 'agent' ? 'users' : hit.kind === 'case' ? 'flag' : 'sliders'} size={14} /></span>
                      <span className="tp-search-hit-main">
                        <span className="tp-search-hit-title">{hit.title}</span>
                        <span className="tp-search-hit-detail">{hit.detail}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="tp-pop-anchor">
            <IconButton name="bell" label="通知" onClick={() => { setShowBell(value => !value); setShowAccount(false) }} />
            {unread.length > 0 ? <span className="tp-bell-dot">{unread.length}</span> : null}
            {showBell ? (
              <div className="tp-popover tp-notify-pop">
                <div className="tp-popover-head">
                  <span className="tp-strong">通知</span>
                  <button type="button" className="tp-link-btn" onClick={() => actions.markAllNotificationsRead()}>全部已读</button>
                </div>
                <div className="tp-notify-list">
                  {world.notifications.slice(0, 8).map(item => (
                    <button type="button" key={item.id} className={`tp-notify-item ${item.read ? '' : 'unread'}`} onClick={() => openNotification(item)}>
                      <span className={`tp-notify-icon ${item.tone}`}>
                        <Icon name={item.tone === 'danger' ? 'alert' : item.tone === 'warn' ? 'clock' : item.tone === 'success' ? 'checkCircle' : 'info'} size={13} />
                      </span>
                      <span className="tp-notify-main">
                        <span className="tp-notify-title">{item.title}</span>
                        <span className="tp-notify-body">{item.body}</span>
                      </span>
                      <span className="tp-notify-time">{fmtRelative(item.at)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="tp-pop-anchor">
            <button type="button" className="tp-account" onClick={() => { setShowAccount(value => !value); setShowBell(false) }}>
              <Avatar name="周明" seed="zhouming" size="sm" />
              <span className="tp-account-text">
                <span className="tp-account-name">周明</span>
                <span className="tp-account-role">财务负责人</span>
              </span>
              <Icon name="chevronDown" size={13} />
            </button>
            {showAccount ? (
              <div className="tp-popover tp-account-pop">
                <div className="tp-account-pop-head">
                  <Avatar name="周明" seed="zhouming" />
                  <div>
                    <div className="tp-strong">周明</div>
                    <div className="tp-muted">财务负责人 · 星桥支付</div>
                    <div className="tp-muted" style={{ marginTop: 2 }}>zhou.ming@starbridge.pay</div>
                  </div>
                </div>
                <div className="tp-account-pop-row"><span>本月放行金额</span><span className="tp-strong">{fmtMoney(stats.settledVolume)}</span></div>
                <div className="tp-account-pop-row"><span>待我处理</span><span className={`tp-strong ${stats.openApprovals ? 'tp-warn-text' : ''}`}>{stats.openApprovals} 项</span></div>
                <button type="button" className="tp-account-pop-action" onClick={() => { setShowAccount(false); go('settings') }}>
                  <Icon name="settings" size={14} />
                  工作台设置
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <nav className="tp-tabs" aria-label="信任运营台导航">
        {TABS.map(tab => {
          const active = parentTab === tab.id
          const badge = tab.id === 'approvals' ? stats.openApprovals : tab.id === 'audit' ? stats.openCases : 0
          return (
            <button
              type="button"
              key={tab.id}
              className={`tp-tab ${active ? 'active' : ''}`}
              onClick={() => go(tab.id)}
            >
              <Icon name={tab.icon} size={15} />
              <span>{tab.label}</span>
              {badge > 0 ? <span className="tp-tab-badge">{badge}</span> : null}
            </button>
          )
        })}
      </nav>

      <main className="tp-main">
        {route.page !== 'dashboard' && route.page !== 'approvals' && route.page !== 'tasks' && route.page !== 'agents' && route.page !== 'delegations' && route.page !== 'governance' && route.page !== 'audit' && route.page !== 'settings' ? (
          <div className="tp-breadcrumb">
            <button type="button" className="tp-back" onClick={back}>
              <Icon name="arrowLeft" size={14} />
              返回
            </button>
          </div>
        ) : null}

        {renderPage(route)}
      </main>
    </div>
  )
}

/**
 * Render the page for a route.
 * @param {{page: string, params: object}} route
 */
function renderPage(route) {
  switch (route.page) {
    case 'dashboard': return <DashboardPage />
    case 'approvals': return <ApprovalsPage />
    case 'tasks': return <TasksPage />
    case 'task': return <TaskDetailPage taskId={route.params?.taskId} />
    case 'agents': return <AgentsPage />
    case 'agent': return <AgentDetailPage agentId={route.params?.agentId} />
    case 'delegations': return <DelegationsPage />
    case 'governance': return <GovernancePage />
    case 'audit': return <AuditPage />
    case 'case': return <CaseDetailPage caseId={route.params?.caseId} />
    case 'settings': return <ProductSettingsPage />
    default: return <DashboardPage />
  }
}

/**
 * Headline counters used by the shell chrome.
 * @param {object} world
 */
function useWorldStats(world) {
  const openApprovals = world.interventions.filter(item => item.status === 'PENDING').length
  const openCases = world.cases.filter(item => item.status !== 'RESOLVED').length
  const settledVolume = world.tasks
    .filter(task => ['SUBMITTED', 'CONFIRMED', 'AUDITED', 'CLOSED'].includes(task.status))
    .reduce((sum, task) => sum + task.amount, 0)
  return { openApprovals, openCases, settledVolume }
}
