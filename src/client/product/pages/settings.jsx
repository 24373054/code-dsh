/**
 * 产品设置：工作区信息、提醒与显示、数据与隐私、关于。
 *
 * 信任运营台是本地优先的产品：工作区数据保存在本机插件目录，产品不连接任何云服务，
 * 也不会把数据上传到外部。当前版本使用示例工作区，便于在接入真实数据前体验完整流程。
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

const PRIVACY_NOTES = [
  '本地优先：工作区数据保存在本机的插件数据目录，不依赖任何云端服务。',
  '零外传：产品不会上传工作区数据，也不会把付款信息发送给第三方。',
  '可导出：随时下载完整快照，用于评审、存档或迁移前的备份。',
  '可恢复：一键恢复到示例初始状态，练习与演示产生的记录会被清除。',
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
  return `trust-workspace-${stamp}.json`
}

/** 下载当前工作区的完整快照。 */
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
  const [showTech, setShowTech] = useState(false)

  const savePreferences = () => {
    toast.push('提醒与显示偏好已保存', 'success')
  }

  const handleExport = () => {
    try {
      downloadWorldSnapshot(world)
      toast.push('工作区快照已导出', 'success')
    } catch {
      toast.push('导出失败，请稍后重试', 'error')
    }
  }

  const resetConfirmValid = resetConfirm.trim() === 'RESET'

  const handleReset = () => {
    if (!resetConfirmValid) return
    actions.resetDemo()
    setResetConfirm('')
    toast.push('工作区已恢复到示例初始状态', 'success')
  }

  return (
    <div className="tp-page">
      <PageHead
        title="设置"
        desc="管理工作区信息、提醒偏好与本地数据。"
      />

      <Card
        title="工作区"
        desc="当前工作区创建在这台电脑上，数据不会离开本机。"
        actions={<Tag tone="neutral" dot>本地工作区</Tag>}
        style={{ marginBottom: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={org.name || '星桥支付'} seed={org.id || 'org'} size="lg" />
          <div style={{ minWidth: 0 }}>
            <div className="tp-strong" style={{ fontSize: 15 }}>{org.name || '未命名工作区'}</div>
            <div className="tp-faint" style={{ fontSize: 12, marginTop: 2 }}>
              {ORG_KIND[org.kind] || '组织'} · {org.domain || '—'}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Tag tone={org.verified ? 'success' : 'neutral'} dot>{org.verified ? '已认证' : '待认证'}</Tag>
          </div>
        </div>

        <div className="tp-divider" style={{ margin: '14px 0 12px' }} />

        <button
          type="button"
          className="tp-link-btn"
          onClick={() => setShowTech(value => !value)}
          aria-expanded={showTech}
        >
          <Icon name={showTech ? 'chevronDown' : 'chevronRight'} size={13} />
          {showTech ? '收起技术详情' : '技术详情'}
        </button>
        {showTech ? (
          <div style={{ marginTop: 12 }}>
            <KV
              items={[
                { k: '工作区标识', v: shortId(org.id || '—') },
                { k: '认证主体类型', v: ORG_KIND[org.kind] || '组织' },
                { k: '接入域名', v: org.domain || '—' },
                { k: '认证状态', v: <Tag tone={org.verified ? 'success' : 'neutral'} dot>{org.verified ? '已认证' : '待认证'}</Tag> },
              ]}
            />
          </div>
        ) : null}
      </Card>

      <Card
        title="提醒与显示"
        desc="调整此设备上的提醒方式与列表显示。"
        actions={<Tag tone="neutral">仅本机生效</Tag>}
        style={{ marginBottom: 16 }}
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

      <Card
        title="数据与隐私"
        desc="工作区数据完全保存在本机，产品不连接任何云服务。"
        style={{ marginBottom: 16 }}
      >
        <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--tp-text-2)', fontSize: 13, lineHeight: 1.9 }}>
          {PRIVACY_NOTES.map(item => <li key={item}>{item}</li>)}
        </ul>

        <div className="tp-divider" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '16px 0' }}>
          <div>
            <div className="tp-strong" style={{ fontSize: 13 }}>导出工作区快照</div>
            <div className="tp-faint" style={{ fontSize: 12, marginTop: 2 }}>下载一份完整数据文件，便于评审留档或交付前备份</div>
          </div>
          <Button icon="download" onClick={handleExport}>导出快照</Button>
        </div>

        <div className="tp-divider" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '16px 0' }}>
          <div>
            <div className="tp-strong" style={{ fontSize: 13 }}>恢复示例数据</div>
            <div className="tp-faint" style={{ fontSize: 12, marginTop: 2 }}>清除体验期间产生的记录，恢复为示例初始状态；请输入 RESET 确认</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              className="tp-input"
              style={{ width: 150 }}
              value={resetConfirm}
              onChange={event => setResetConfirm(event.target.value)}
              placeholder="输入 RESET"
              aria-label="输入 RESET 确认恢复示例数据"
            />
            <Button variant="danger" icon="refresh" disabled={!resetConfirmValid} onClick={handleReset}>
              恢复示例数据
            </Button>
          </div>
        </div>
      </Card>

      <Card title="关于" desc="产品信息与隐私承诺">
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
            { k: '数据位置', v: '本机（不连接云服务）' },
            { k: '示例数据生成时间', v: world.seededAt ? fmtDateTime(world.seededAt) : '—' },
          ]}
        />
        <div className="tp-muted" style={{ fontSize: 12.5, lineHeight: 1.8, marginTop: 14 }}>
          信任运营台是开源产品：核心代码公开可审计，数据默认留在本机。
          当前版本使用示例工作区，仅用于产品体验，不构成真实支付或审计依据。
        </div>
      </Card>
    </div>
  )
}
