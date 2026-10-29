/**
 * 产品设置：组织信息、工作台偏好、数据管理与关于。
 * 演示数据仅保存在本机浏览器，页面不连接任何外部服务。
 */
import { useState } from 'react'
import { useActions, useWorld } from '../hooks.js'
import { PRODUCT_VERSION } from '../version.js'
import { fmtDateTime, shortId } from '../ui/format.js'
import { Icon } from '../ui/icons.jsx'
import {
  Avatar,
  Button,
  Card,
  KV,
  PageHead,
  Select,
  Tag,
  useToast,
} from '../ui/primitives.jsx'

const ORG_KIND = {
  operator: '运营机构',
  merchant: '商户',
  bank: '银行',
}

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '每页 10 条' },
  { value: '20', label: '每页 20 条' },
  { value: '50', label: '每页 50 条' },
]

const TIME_OPTIONS = [
  { value: 'relative', label: '相对时间（如 3 小时前）' },
  { value: 'exact', label: '精确时间（如 2026-10-29 18:06）' },
]

const DATA_NOTES = [
  '演示数据保存在本机，不会上传到外部服务。',
  '导出快照会下载一份当前演示数据文件，便于评审留档或交付前备份。',
  '重置会恢复初始演示数据，期间产生的审批、结案与报告记录将被清除且无法撤销。',
]

function pad2(value) {
  return String(value).padStart(2, '0')
}

function snapshotFilename(now = new Date()) {
  const stamp = [
    now.getFullYear(),
    pad2(now.getMonth() + 1),
    pad2(now.getDate()),
  ].join('') + '-' + [pad2(now.getHours()), pad2(now.getMinutes()), pad2(now.getSeconds())].join('')
  return `trust-platform-demo-${stamp}.json`
}

/** 下载当前演示数据的完整快照。 */
function downloadWorldSnapshot(world) {
  const blob = new Blob([JSON.stringify(world, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = snapshotFilename()
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function PrefRow({ title, desc, children, last }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 0',
        borderBottom: last ? 'none' : '1px solid var(--tp-border-soft)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div className="tp-strong" style={{ fontSize: 13 }}>{title}</div>
        <div className="tp-faint" style={{ fontSize: 12, marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        border: 'none',
        padding: 0,
        position: 'relative',
        cursor: 'pointer',
        background: checked ? 'var(--tp-accent-fill)' : 'var(--dsw-alias-border-l3, var(--tp-surface-3))',
        transition: 'background .2s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: checked ? 'var(--tp-on-accent)' : 'var(--dsw-alias-switch-thumb, #ffffff)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.28)',
          transition: 'left .2s',
        }}
      />
    </button>
  )
}

export function ProductSettingsPage() {
  const world = useWorld()
  const actions = useActions()
  const toast = useToast()

  const orgs = world.orgs || []
  const org = orgs.find(item => item.kind === 'operator') || orgs[0] || {}
  const productName = `${org.name || '星桥支付'} · 信任运营台`

  const [notify, setNotify] = useState(true)
  const [pageSize, setPageSize] = useState('20')
  const [timeDisplay, setTimeDisplay] = useState('relative')
  const [resetConfirm, setResetConfirm] = useState('')

  const savePreferences = () => {
    toast.push('工作台偏好已保存', 'success')
  }

  const handleExport = () => {
    try {
      downloadWorldSnapshot(world)
      toast.push('演示数据已导出为快照文件', 'success')
    } catch {
      toast.push('导出失败，请稍后重试', 'error')
    }
  }

  const resetConfirmValid = resetConfirm.trim() === 'RESET'

  const handleReset = () => {
    if (!resetConfirmValid) return
    actions.resetDemo()
    setResetConfirm('')
    toast.push('演示数据已重置为初始状态', 'success')
  }

  return (
    <div className="tp-page">
      <PageHead
        title="设置"
        desc="管理组织信息、工作台偏好与演示数据。"
      />

      <div className="tp-grid tp-grid-2" style={{ marginBottom: 16, alignItems: 'start' }}>
        <Card title="组织信息" desc="当前登录组织的登记信息，仅供核对">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Avatar name={org.name || '星桥支付'} seed={org.id || 'org'} size="lg" />
            <div style={{ minWidth: 0 }}>
              <div className="tp-strong" style={{ fontSize: 15 }}>{org.name || '未登记组织'}</div>
              <div className="tp-faint" style={{ fontSize: 12, marginTop: 2 }}>
                {org.domain || '—'} · {ORG_KIND[org.kind] || '组织'}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Tag tone={org.verified ? 'success' : 'neutral'} dot>{org.verified ? '已认证' : '待认证'}</Tag>
            </div>
          </div>
          <KV
            items={[
              { k: '组织标识', v: shortId(org.id || '—') },
              { k: '组织类型', v: ORG_KIND[org.kind] || '组织' },
              { k: '接入域名', v: org.domain || '—' },
              { k: '认证状态', v: <Tag tone={org.verified ? 'success' : 'neutral'} dot>{org.verified ? '已认证' : '待认证'}</Tag> },
            ]}
          />
        </Card>

        <Card
          title="工作台偏好"
          desc="调整提醒与列表的显示方式"
          actions={<Tag tone="neutral">仅本机生效</Tag>}
        >
          <PrefRow title="桌面通知" desc="案件升级、审批到期时提醒我">
            <Toggle checked={notify} onChange={setNotify} label="桌面通知" />
          </PrefRow>
          <PrefRow title="每页数量" desc="列表页默认展示的条数">
            <Select value={pageSize} onChange={setPageSize} options={PAGE_SIZE_OPTIONS} />
          </PrefRow>
          <PrefRow title="时间显示" desc="列表与详情中的时间展示方式" last>
            <Select value={timeDisplay} onChange={setTimeDisplay} options={TIME_OPTIONS} />
          </PrefRow>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="primary" icon="check" onClick={savePreferences}>保存偏好</Button>
          </div>
        </Card>
      </div>

      <Card
        title="数据管理"
        desc="演示数据保存在本机，支持导出快照与恢复初始状态"
        style={{ marginBottom: 16 }}
      >
        <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--tp-text-2)', fontSize: 13, lineHeight: 1.9 }}>
          {DATA_NOTES.map(item => <li key={item}>{item}</li>)}
        </ul>

        <div className="tp-divider" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '16px 0' }}>
          <div>
            <div className="tp-strong" style={{ fontSize: 13 }}>导出演示数据</div>
            <div className="tp-faint" style={{ fontSize: 12, marginTop: 2 }}>下载当前演示数据快照，文件名包含导出时间</div>
          </div>
          <Button icon="download" onClick={handleExport}>导出演示数据</Button>
        </div>

        <div className="tp-divider" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '16px 0' }}>
          <div>
            <div className="tp-strong" style={{ fontSize: 13 }}>重置演示数据</div>
            <div className="tp-faint" style={{ fontSize: 12, marginTop: 2 }}>恢复初始演示数据；请输入 RESET 确认操作</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              className="tp-input"
              style={{ width: 150 }}
              value={resetConfirm}
              onChange={event => setResetConfirm(event.target.value)}
              placeholder="输入 RESET"
              aria-label="输入 RESET 确认重置"
            />
            <Button variant="danger" icon="refresh" disabled={!resetConfirmValid} onClick={handleReset}>
              重置演示数据
            </Button>
          </div>
        </div>
      </Card>

      <Card title="关于" desc="产品信息与运行环境">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              flexShrink: 0,
              background: 'var(--tp-accent-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--tp-accent)',
            }}
          >
            <Icon name="shield" size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="tp-strong" style={{ fontSize: 15 }}>{productName}</span>
              <Tag tone="info">v{PRODUCT_VERSION}</Tag>
              <Tag tone="neutral" dot>沙箱演示数据</Tag>
            </div>
            <div className="tp-muted" style={{ fontSize: 13, lineHeight: 1.7, marginTop: 6 }}>
              让 AI 代理在人类设定的委托额度内行动：财务与合规团队设定边界、审批例外，
              每一笔付款都留下可核验、可追溯的审计记录。
            </div>
          </div>
        </div>
        <KV
          items={[
            { k: '产品版本', v: `v${PRODUCT_VERSION}` },
            { k: '适用角色', v: '财务负责人 · 合规审计员' },
            { k: '运行环境', v: <Tag tone="neutral" dot>沙箱演示数据</Tag> },
            { k: '数据生成时间', v: world.seededAt ? fmtDateTime(world.seededAt) : '—' },
          ]}
        />
      </Card>

      <div className="tp-footer-note">本演示数据仅用于产品体验，不构成真实支付或审计依据。</div>
    </div>
  )
}
