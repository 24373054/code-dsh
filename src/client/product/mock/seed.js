/**
 * Deterministic demo world for the trust-platform console.
 *
 * Phase 1 of the product runs entirely on this fixture: a cross-border payment
 * operator ("星桥支付") whose agent workforce performs procurement, settlement,
 * logistics, and compliance work under delegated authority. The fixture is
 * coherent — amounts, limits, timestamps, risk decisions, and audit events all
 * agree with each other — so every screen can be reviewed as a product rather
 * than as placeholder text.
 *
 * Timestamps are computed relative to "now" on every seed so the console always
 * shows fresh activity. Actions mutate a copy of this world through the store.
 */

const MINUTE = 1
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** @returns {string} ISO timestamp `minutes` in the past. */
const ago = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString()
/** @returns {string} ISO timestamp `minutes` in the future. */
const ahead = (minutes) => new Date(Date.now() + minutes * 60_000).toISOString()

/** Demo policy identifier the fixture's risk decisions cite. */
const POLICY = 'policy-2026-10-30-001'
/** Demo model identifier the fixture's risk decisions cite. */
const MODEL = 'rules-2026-10-25-001'

const ORGS = [
  { id: 'org-starbridge', name: '星桥支付', domain: 'starbridge.pay', kind: 'operator', verified: true },
  { id: 'org-yunfan', name: '云帆贸易', domain: 'yunfan.trade', kind: 'merchant', verified: true },
  { id: 'org-hanhai', name: '瀚海物流', domain: 'hanhai.logi', kind: 'merchant', verified: true },
  { id: 'org-hengxin', name: '恒信银行', domain: 'hengxin.bank', kind: 'bank', verified: true }
]

/** @typedef {'procurement'|'settlement'|'logistics'|'compliance'|'counterparty'} AgentRole */

const AGENTS = [
  {
    id: 'agent-ache',
    name: '采购代理·阿澈',
    shortName: '阿澈',
    role: 'procurement',
    roleLabel: '采购执行代理',
    orgId: 'org-starbridge',
    orgName: '星桥支付',
    did: 'did:trust:starbridge.pay:procurement-01',
    status: 'ACTIVE',
    trustScore: 0.96,
    keyLabel: 'Ed25519 · 主密钥',
    createdAt: ago(38 * DAY),
    lastActiveAt: ago(7),
    monthlyVolume: 428000,
    successRate: 0.994,
    description: '负责供应商询价、采购下单与付款申请，在财务负责人的委托额度内行动。'
  },
  {
    id: 'agent-xiaolan',
    name: '结算代理·小澜',
    shortName: '小澜',
    role: 'settlement',
    roleLabel: '结算执行代理',
    orgId: 'org-starbridge',
    orgName: '星桥支付',
    did: 'did:trust:starbridge.pay:settlement-01',
    status: 'ACTIVE',
    trustScore: 0.94,
    keyLabel: 'Ed25519 · 主密钥',
    createdAt: ago(52 * DAY),
    lastActiveAt: ago(2),
    monthlyVolume: 1260000,
    successRate: 0.997,
    description: '执行跨境收付与对账，负责结算凭证的签名与终局确认。'
  },
  {
    id: 'agent-aze',
    name: '物流代理·阿泽',
    shortName: '阿泽',
    role: 'logistics',
    roleLabel: '物流结算代理',
    orgId: 'org-starbridge',
    orgName: '星桥支付',
    did: 'did:trust:starbridge.pay:logistics-01',
    status: 'ACTIVE',
    trustScore: 0.91,
    keyLabel: 'Ed25519 · 主密钥',
    createdAt: ago(26 * DAY),
    lastActiveAt: ago(53),
    monthlyVolume: 96000,
    successRate: 0.986,
    description: '处理仓储与运费结算，单笔额度较低，由结算代理二次委托授权。'
  },
  {
    id: 'agent-mobai',
    name: '合规审计代理·墨白',
    shortName: '墨白',
    role: 'compliance',
    roleLabel: '合规审计代理',
    orgId: 'org-starbridge',
    orgName: '星桥支付',
    did: 'did:trust:starbridge.pay:audit-01',
    status: 'ACTIVE',
    trustScore: 0.99,
    keyLabel: 'Ed25519 · 审计密钥',
    createdAt: ago(64 * DAY),
    lastActiveAt: ago(21),
    monthlyVolume: 0,
    successRate: 1,
    description: '只读审计与案件调查，不持有付款权限；负责证据封存与报告出具。'
  },
  {
    id: 'agent-yunfan',
    name: '云帆贸易·采购助理',
    shortName: '云帆助理',
    role: 'counterparty',
    roleLabel: '外部交易对手代理',
    orgId: 'org-yunfan',
    orgName: '云帆贸易',
    did: 'did:trust:yunfan.trade:buyer-agent',
    status: 'ACTIVE',
    trustScore: 0.88,
    keyLabel: 'Ed25519 · 对外密钥',
    createdAt: ago(17 * DAY),
    lastActiveAt: ago(130),
    monthlyVolume: 512000,
    successRate: 0.972,
    description: '供应商侧代理，提交对账单与收款请求，需通过星桥支付的委托链校验。'
  }
]

const CREDENTIALS = [
  {
    id: 'vc-001',
    name: '代理经营授权凭证',
    type: 'AgentAuthorityCredential',
    subjectId: 'agent-ache',
    issuerName: '星桥支付',
    issuerDid: 'did:trust:starbridge.pay:issuer-01',
    status: 'ACTIVE',
    issuedAt: ago(38 * DAY),
    expiresAt: ahead(24 * DAY),
    claims: { scope: 'procurement,payment-request', singleLimit: '200,000 USD', dailyLimit: '600,000 USD', currency: 'USD' },
    digest: '0x8f3a…c21d',
    verifiedAt: ago(3)
  },
  {
    id: 'vc-002',
    name: '跨境支付业务资质',
    type: 'PaymentLicenseCredential',
    subjectId: 'agent-xiaolan',
    issuerName: '恒信银行',
    issuerDid: 'did:trust:hengxin.bank:issuer-01',
    status: 'ACTIVE',
    issuedAt: ago(52 * DAY),
    expiresAt: ahead(43 * DAY),
    claims: { scope: 'cross-border-settlement', corridors: 'CN-US, CN-EU', currency: 'USD,EUR' },
    digest: '0x6b21…90ae',
    verifiedAt: ago(5)
  },
  {
    id: 'vc-003',
    name: '数据合规审计授权',
    type: 'AuditAuthorizationCredential',
    subjectId: 'agent-mobai',
    issuerName: '星桥支付',
    issuerDid: 'did:trust:starbridge.pay:issuer-01',
    status: 'ACTIVE',
    issuedAt: ago(64 * DAY),
    expiresAt: ahead(58 * DAY),
    claims: { scope: 'read-only,evidence,case', dataClasses: 'transaction,identity', retention: '180 天' },
    digest: '0x1d9c…4f77',
    verifiedAt: ago(11)
  },
  {
    id: 'vc-004',
    name: '物流服务协议凭证',
    type: 'ServiceAgreementCredential',
    subjectId: 'agent-aze',
    issuerName: '星桥支付',
    issuerDid: 'did:trust:starbridge.pay:issuer-01',
    status: 'ACTIVE',
    issuedAt: ago(26 * DAY),
    expiresAt: ahead(9 * DAY),
    claims: { scope: 'logistics-settlement', maxSingle: '20,000 USD', currency: 'USD' },
    digest: '0x4a08…b3e2',
    verifiedAt: ago(31)
  },
  {
    id: 'vc-005',
    name: '交易对手主体认证',
    type: 'KYBCredential',
    subjectId: 'agent-yunfan',
    issuerName: '恒信银行',
    issuerDid: 'did:trust:hengxin.bank:issuer-01',
    status: 'SUSPENDED',
    issuedAt: ago(17 * DAY),
    expiresAt: ahead(72 * DAY),
    claims: { scope: 'counterparty-verification', registration: '91310000MA1FL8X23K', jurisdiction: 'CN' },
    digest: '0x77be…12a0',
    verifiedAt: ago(43)
  }
]

const DELEGATIONS = [
  {
    id: 'del-root',
    name: '财务负责人 → 采购代理',
    issuerName: '周明（财务负责人）',
    issuerDid: 'did:trust:starbridge.pay:treasury-lead',
    subjectId: 'agent-ache',
    subjectName: '采购代理·阿澈',
    subjectDid: 'did:trust:starbridge.pay:procurement-01',
    parentId: null,
    purpose: '日常采购付款申请与供应商询价',
    actions: ['CREATE_TASK', 'AUTHORIZE_PAYMENT', 'SUBMIT_PAYMENT'],
    actionLabels: ['创建任务', '付款授权', '提交付款'],
    amountLimit: 200000,
    dailyLimit: 600000,
    currency: 'USD',
    usedToday: 133800,
    validFrom: ago(6 * HOUR),
    validTo: ahead(30 * DAY),
    status: 'ACTIVE',
    canRedelegate: true
  },
  {
    id: 'del-settle',
    name: '采购代理 → 结算代理',
    issuerName: '采购代理·阿澈',
    issuerDid: 'did:trust:starbridge.pay:procurement-01',
    subjectId: 'agent-xiaolan',
    subjectName: '结算代理·小澜',
    subjectDid: 'did:trust:starbridge.pay:settlement-01',
    parentId: 'del-root',
    purpose: '跨境收付执行与结算凭证签署',
    actions: ['SUBMIT_PAYMENT', 'SETTLE'],
    actionLabels: ['提交付款', '结算'],
    amountLimit: 80000,
    dailyLimit: 240000,
    currency: 'USD',
    usedToday: 56600,
    validFrom: ago(3 * HOUR),
    validTo: ahead(21 * DAY),
    status: 'ACTIVE',
    canRedelegate: true
  },
  {
    id: 'del-logistics',
    name: '结算代理 → 物流代理',
    issuerName: '结算代理·小澜',
    issuerDid: 'did:trust:starbridge.pay:settlement-01',
    subjectId: 'agent-aze',
    subjectName: '物流代理·阿泽',
    subjectDid: 'did:trust:starbridge.pay:logistics-01',
    parentId: 'del-settle',
    purpose: '仓储与运费结算，单笔限额较低',
    actions: ['SUBMIT_PAYMENT'],
    actionLabels: ['提交付款'],
    amountLimit: 20000,
    dailyLimit: 60000,
    currency: 'USD',
    usedToday: 20900,
    validFrom: ago(2 * HOUR),
    validTo: ahead(14 * DAY),
    status: 'ACTIVE',
    canRedelegate: false
  },
  {
    id: 'del-trial',
    name: '历史试用委托（已撤销）',
    issuerName: '采购代理·阿澈',
    issuerDid: 'did:trust:starbridge.pay:procurement-01',
    subjectId: 'agent-yunfan',
    subjectName: '云帆贸易·采购助理',
    subjectDid: 'did:trust:yunfan.trade:buyer-agent',
    parentId: 'del-root',
    purpose: '供应商侧提交对账单试用',
    actions: ['SUBMIT_INVOICE'],
    actionLabels: ['提交对账单'],
    amountLimit: 5000,
    dailyLimit: 10000,
    currency: 'USD',
    usedToday: 0,
    validFrom: ago(12 * DAY),
    validTo: ago(2 * DAY),
    status: 'REVOKED',
    canRedelegate: false,
    revokedAt: ago(2 * DAY),
    revokeReason: '试用期结束，改为人工对账'
  }
]

/**
 * Event helper: one audit event with a stable shape.
 * @param {string} id
 * @param {string} taskId
 * @param {string} type
 * @param {string} typeLabel
 * @param {{actor: string, minutesAgo: number, tone?: string, verification?: string,
 *   finality?: string, body?: string}} options
 */
function event(id, taskId, type, typeLabel, options) {
  const keyId = `did:trust:starbridge.pay:${options.actorId || 'audit-01'}#key-1`
  return {
    id,
    taskId,
    type,
    typeLabel,
    actor: options.actor,
    actorId: options.actorId || 'agent-ache',
    at: ago(options.minutesAgo),
    tone: options.tone || 'neutral',
    verification: options.verification || 'VALID',
    finality: options.finality || 'PENDING',
    body: options.body || '',
    signature: { algorithm: 'Ed25519', keyId, value: `sig_${id.replaceAll('-', '')}…${String(id).slice(-4)}` },
    ledger: options.ledger || null
  }
}

const TASKS = [
  {
    id: 'task-101',
    title: '云帆贸易 · 10 月采购结算',
    counterparty: '云帆贸易',
    counterpartyOrg: 'org-yunfan',
    purpose: '电子元器件采购尾款结算',
    amount: 48000,
    currency: 'USD',
    status: 'SUBMITTED',
    riskScore: 0.38,
    riskDecision: 'ALLOW',
    delegationId: 'del-settle',
    createdAt: ago(190),
    updatedAt: ago(34),
    submittedAt: ago(34),
    invoiceNo: 'YF-2026-1024',
    settlementRef: 'ledger-usdc-8841',
    reviews: [
      { by: '采购代理·阿澈', at: ago(160), note: '供应商对账无误，申请付款' },
      { by: '结算代理·小澜', at: ago(34), note: '已提交跨境结算' }
    ]
  },
  {
    id: 'task-102',
    title: '瀚海物流 · 10 月运费',
    counterparty: '瀚海物流',
    counterpartyOrg: 'org-hanhai',
    purpose: '华东—洛杉矶海运头程费用',
    amount: 8600,
    currency: 'USD',
    status: 'SUBMITTED',
    riskScore: 0.22,
    riskDecision: 'ALLOW',
    delegationId: 'del-logistics',
    createdAt: ago(96),
    updatedAt: ago(18),
    submittedAt: ago(18),
    invoiceNo: 'HH-88213',
    settlementRef: 'ledger-usdc-8842',
    reviews: [{ by: '物流代理·阿泽', at: ago(18), note: '运费早于计划入账，申请结算' }]
  },
  {
    id: 'task-103',
    title: '云帆贸易 · 样品采购',
    counterparty: '云帆贸易',
    counterpartyOrg: 'org-yunfan',
    purpose: '新供应商样品试单',
    amount: 3200,
    currency: 'USD',
    status: 'CLOSED',
    riskScore: 0.17,
    riskDecision: 'ALLOW',
    delegationId: 'del-root',
    createdAt: ago(2 * 24 * 60),
    updatedAt: ago(41 * 60),
    submittedAt: ago(30 * 60),
    closedAt: ago(41 * 60),
    invoiceNo: 'YF-2026-0991',
    settlementRef: 'ledger-usdc-8690',
    reviews: [
      { by: '采购代理·阿澈', at: ago(29 * 60), note: '样品验收通过' },
      { by: '合规审计代理·墨白', at: ago(41 * 60), note: '结算凭证校验通过，任务关闭' }
    ]
  },
  {
    id: 'task-104',
    title: '恒信银行 · 汇款手续费',
    counterparty: '恒信银行',
    counterpartyOrg: 'org-hengxin',
    purpose: '跨境汇款通道手续费',
    amount: 1450,
    currency: 'USD',
    status: 'CONFIRMED',
    riskScore: 0.09,
    riskDecision: 'ALLOW',
    delegationId: 'del-settle',
    createdAt: ago(74),
    updatedAt: ago(12),
    submittedAt: ago(40),
    confirmedAt: ago(12),
    invoiceNo: 'HX-FEE-1027',
    settlementRef: 'ledger-usdc-8844',
    reviews: [{ by: '结算代理·小澜', at: ago(12), note: '银行侧确认，待审计关闭' }]
  },
  {
    id: 'task-105',
    title: '云帆贸易 · 大宗采购预付款',
    counterparty: '云帆贸易',
    counterpartyOrg: 'org-yunfan',
    purpose: 'Q4 主材预付款（30%）',
    amount: 186000,
    currency: 'USD',
    status: 'CREATED',
    riskScore: 0.81,
    riskDecision: 'BLOCK',
    delegationId: 'del-root',
    createdAt: ago(240),
    updatedAt: ago(228),
    invoiceNo: 'YF-2026-1030',
    reviews: [],
    blockedReason: '单笔金额超过采购代理委托限额，且历史同类交易存在供应商变更记录'
  },
  {
    id: 'task-106',
    title: '瀚海物流 · 旺季仓储费',
    counterparty: '瀚海物流',
    counterpartyOrg: 'org-hanhai',
    purpose: '旺季仓储与操作费',
    amount: 12300,
    currency: 'USD',
    status: 'PAYREQ_PENDING',
    riskScore: 0.72,
    riskDecision: 'DEFER',
    delegationId: 'del-logistics',
    createdAt: ago(160),
    updatedAt: ago(13),
    invoiceNo: 'HH-88220',
    reviews: [{ by: '物流代理·阿泽', at: ago(13), note: '费用超出日常阈值，转人工复核' }],
    interventionId: 'int-1'
  },
  {
    id: 'task-107',
    title: '云帆贸易 · 尾款补付',
    counterparty: '云帆贸易',
    counterpartyOrg: 'org-yunfan',
    purpose: '补充结算（供应商索赔）',
    amount: 92000,
    currency: 'USD',
    status: 'FAILED',
    riskScore: 0.88,
    riskDecision: 'BLOCK',
    delegationId: 'del-settle',
    createdAt: ago(200),
    updatedAt: ago(120),
    invoiceNo: 'YF-2026-1029',
    reviews: [],
    blockedReason: '收款账户与合同登记账户不一致，触发资金安全拦截',
    interventionId: 'int-2'
  },
  {
    id: 'task-108',
    title: '恒信银行 · 账户管理费',
    counterparty: '恒信银行',
    counterpartyOrg: 'org-hengxin',
    purpose: '跨境账户月度管理费',
    amount: 980,
    currency: 'USD',
    status: 'CLOSED',
    riskScore: 0.05,
    riskDecision: 'ALLOW',
    delegationId: 'del-settle',
    createdAt: ago(3 * 24 * 60),
    updatedAt: ago(2 * 24 * 60),
    submittedAt: ago(50 * 60),
    closedAt: ago(2 * 24 * 60),
    invoiceNo: 'HX-FEE-1020',
    settlementRef: 'ledger-usdc-8621',
    reviews: []
  },
  {
    id: 'task-109',
    title: '云帆贸易 · 新订单预付款',
    counterparty: '云帆贸易',
    counterpartyOrg: 'org-yunfan',
    purpose: '11 月新订单 20% 预付款',
    amount: 25000,
    currency: 'USD',
    status: 'AUTHORIZED',
    riskScore: 0.31,
    riskDecision: 'ALLOW',
    delegationId: 'del-root',
    createdAt: ago(48),
    updatedAt: ago(45),
    invoiceNo: 'YF-2026-1101',
    reviews: [{ by: '采购代理·阿澈', at: ago(45), note: '已完成付款授权，等待供应商确认' }]
  },
  {
    id: 'task-110',
    title: '瀚海物流 · 加急运输',
    counterparty: '瀚海物流',
    counterpartyOrg: 'org-hanhai',
    purpose: '展会样机加急运输',
    amount: 16800,
    currency: 'USD',
    status: 'CANCELLED',
    riskScore: 0.34,
    riskDecision: 'THROTTLE',
    delegationId: 'del-logistics',
    createdAt: ago(140),
    updatedAt: ago(120),
    invoiceNo: 'HH-88218',
    reviews: [],
    blockedReason: '供应商主动取消行程'
  }
]

const EVENTS = [
  event('evt-001', 'task-106', 'RISK_DEFER', '风险转人工', { actor: '风控引擎', actorId: 'audit-01', minutesAgo: 13, tone: 'warn', body: '风险分 0.72 超过转人工阈值 0.60' }),
  event('evt-002', 'task-106', 'INTERVENTION_CREATED', '发起人工复核', { actor: '采购代理·阿澈', minutesAgo: 13, tone: 'warn', body: '复核项：旺季仓储费金额超出日常阈值' }),
  event('evt-003', 'task-101', 'PAYMENT_SUBMITTED', '提交结算', { actor: '结算代理·小澜', actorId: 'agent-xiaolan', minutesAgo: 34, body: '已提交 48,000 USD 跨境结算请求', ledger: { scheme: 'USDC 清算网络', reference: 'ledger-usdc-8841' } }),
  event('evt-004', 'task-101', 'RISK_ALLOW', '风险放行', { actor: '风控引擎', actorId: 'audit-01', minutesAgo: 35, body: '风险分 0.38，低于限流阈值 0.40' }),
  event('evt-005', 'task-101', 'AUTHORIZATION_GRANTED', '付款授权通过', { actor: '授权服务', actorId: 'audit-01', minutesAgo: 36, body: '委托链有效，金额在单笔限额内' }),
  event('evt-006', 'task-104', 'SETTLEMENT_CONFIRMED', '结算确认', { actor: '恒信银行', actorId: 'agent-xiaolan', minutesAgo: 12, finality: 'CONFIRMED', body: '银行返回结算受理成功', ledger: { scheme: 'USDC 清算网络', reference: 'ledger-usdc-8844' } }),
  event('evt-007', 'task-105', 'RISK_BLOCK', '风险拦截', { actor: '风控引擎', actorId: 'audit-01', minutesAgo: 228, tone: 'danger', body: '金额超过委托限额，自动拦截并通知财务负责人' }),
  event('evt-008', 'task-107', 'RISK_BLOCK', '风险拦截', { actor: '风控引擎', actorId: 'audit-01', minutesAgo: 120, tone: 'danger', body: '收款账户不一致，资金安全拦截' }),
  event('evt-009', 'task-103', 'SETTLEMENT_FINAL', '结算终局', { actor: '合规审计代理·墨白', actorId: 'agent-mobai', minutesAgo: 41 * 60, finality: 'FINAL', body: '结算凭证校验通过，任务关闭', ledger: { scheme: 'USDC 清算网络', reference: 'ledger-usdc-8690' } }),
  event('evt-010', 'task-109', 'AUTHORIZATION_GRANTED', '付款授权通过', { actor: '授权服务', actorId: 'audit-01', minutesAgo: 45, body: '在委托额度内，允许提交供应商' }),
  event('evt-011', 'task-102', 'PAYMENT_SUBMITTED', '提交结算', { actor: '物流代理·阿泽', actorId: 'agent-aze', minutesAgo: 18, body: '已提交 8,600 USD 运费结算', ledger: { scheme: 'USDC 清算网络', reference: 'ledger-usdc-8842' } }),
  event('evt-012', 'del-trial', 'DELEGATION_REVOKED', '撤销委托', { actor: '采购代理·阿澈', minutesAgo: 2 * 24 * 60, tone: 'danger', body: '试用期结束，委托撤销' }),
  event('evt-013', 'task-108', 'SETTLEMENT_FINAL', '结算终局', { actor: '结算代理·小澜', actorId: 'agent-xiaolan', minutesAgo: 2 * 24 * 60, finality: 'FINAL', body: '账户管理费已终局结算', ledger: { scheme: 'USDC 清算网络', reference: 'ledger-usdc-8621' } }),
  event('evt-014', 'task-110', 'TASK_CANCELLED', '任务取消', { actor: '物流代理·阿泽', actorId: 'agent-aze', minutesAgo: 120, tone: 'neutral', body: '供应商取消加急运输' }),
  event('evt-015', 'task-104', 'AUDIT_NOTE', '审计备注', { actor: '合规审计代理·墨白', actorId: 'agent-mobai', minutesAgo: 10, tone: 'info', body: '已登记待办：本周内关闭任务 104' })
]

const INTERVENTIONS = [
  {
    id: 'int-1',
    taskId: 'task-106',
    title: '仓储费付款人工复核',
    reason: '金额超出代理日常阈值，风险分 0.72（转人工阈值 0.60）',
    detail: '物流代理阿泽提交旺季仓储费 12,300 USD，超出其单笔授权额度 20,000 USD 的日常使用模式；系统按转人工策略挂起，等待财务负责人确认。',
    status: 'PENDING',
    level: 2,
    requestedBy: '风控引擎',
    requestedAt: ago(13),
    dueAt: ahead(32),
    requiredApprovals: 1,
    evidenceRefs: ['evt-001', 'evt-002'],
    riskScore: 0.72
  },
  {
    id: 'int-2',
    taskId: 'task-107',
    title: '收款账户不一致拦截复核',
    reason: '收款账户与合同登记账户不一致，风险分 0.88（拦截阈值 0.80）',
    detail: '系统在提交前拦截尾款补付 92,000 USD：供应商提供的收款账户与合同登记账户不一致。需财务负责人与合规审计共同确认是否存在账户变更审批。',
    status: 'PENDING',
    level: 3,
    requestedBy: '风控引擎',
    requestedAt: ago(120),
    dueAt: ago(12),
    requiredApprovals: 1,
    evidenceRefs: ['evt-008'],
    riskScore: 0.88
  },
  {
    id: 'int-3',
    taskId: 'task-104',
    title: '手续费低置信度复核（可选）',
    reason: '模型置信度低于 0.9，建议抽查',
    detail: '恒信银行手续费 1,450 USD 已被放行并确认；审计代理建议抽查发票与清算流水是否一致。',
    status: 'PENDING',
    level: 1,
    requestedBy: '合规审计代理·墨白',
    requestedAt: ago(9),
    dueAt: ahead(47),
    requiredApprovals: 1,
    evidenceRefs: ['evt-006', 'evt-015'],
    riskScore: 0.09
  },
  {
    id: 'int-4',
    taskId: 'task-103',
    title: '样品采购验收复核',
    reason: '新供应商首笔交易，按策略抽查',
    detail: '已完成验收，复核结论：验收单与发票一致。',
    status: 'APPROVED',
    level: 1,
    requestedBy: '风控引擎',
    requestedAt: ago(29 * 60),
    decidedAt: ago(28.5 * 60),
    decidedBy: '周明（财务负责人）',
    decisionNote: '验收材料齐全，同意',
    requiredApprovals: 1,
    evidenceRefs: ['evt-009'],
    riskScore: 0.17
  },
  {
    id: 'int-5',
    taskId: 'task-105',
    title: '超限预付款复核',
    reason: '单笔 186,000 USD 超过委托限额',
    detail: '财务负责人拒绝一次性支付，要求拆分订单。',
    status: 'DENIED',
    level: 2,
    requestedBy: '风控引擎',
    requestedAt: ago(230),
    decidedAt: ago(226),
    decidedBy: '周明（财务负责人）',
    decisionNote: '金额超限，拆分订单后再提交',
    requiredApprovals: 1,
    evidenceRefs: ['evt-007'],
    riskScore: 0.81
  }
]

const EVIDENCE = [
  { id: 'evi-001', kind: 'authorization', subject: 'task-101 付款授权', summary: '委托链有效性校验与金额限额校验记录', digest: '0x3a91…77bd', at: ago(36), anchored: true, anchoredAt: ago(20), dimension: '授权证据' },
  { id: 'evi-002', kind: 'settlement', subject: 'task-101 结算凭证', summary: '提交结算的事件签名与清算流水引用', digest: '0x81ff…0c42', at: ago(34), anchored: true, anchoredAt: ago(20), dimension: '结算证据' },
  { id: 'evi-003', kind: 'risk', subject: 'task-106 风险决策', summary: '风险分 0.72，转人工策略命中记录', digest: '0xbe07…9ac1', at: ago(13), anchored: false, anchoredAt: null, dimension: '风险证据' },
  { id: 'evi-004', kind: 'identity', subject: '采购代理·阿澈 主体', summary: 'DID 文档与密钥登记快照', digest: '0x51d3…4a08', at: ago(38 * 24 * 60), anchored: true, anchoredAt: ago(30 * 24 * 60), dimension: '身份证据' },
  { id: 'evi-005', kind: 'credential', subject: '跨境支付业务资质', summary: '恒信银行签发凭证与吊销状态可查', digest: '0x6b21…90ae', at: ago(52 * 24 * 60), anchored: true, anchoredAt: ago(51 * 24 * 60), dimension: '凭证证据' },
  { id: 'evi-006', kind: 'delegation', subject: 'del-settle 委托链', summary: '二级委托链（财务负责人 → 采购 → 结算）快照', digest: '0x0f72…aa31', at: ago(3 * 60), anchored: false, anchoredAt: null, dimension: '委托证据' },
  { id: 'evi-007', kind: 'settlement', subject: 'task-103 结算终局', summary: 'FINAL 结算事件通过校验并关闭任务', digest: '0xd4c0…1e87', at: ago(41 * 60), anchored: true, anchoredAt: ago(40 * 60), dimension: '结算证据' },
  { id: 'evi-008', kind: 'audit', subject: 'task-104 审计备注', summary: '审计代理登记的待办与备注', digest: '0x9e55…3b90', at: ago(10), anchored: false, anchoredAt: null, dimension: '审计证据' },
  { id: 'evi-009', kind: 'risk', subject: 'task-107 拦截记录', summary: '收款账户不一致的拦截证据', digest: '0xc7a2…5d19', at: ago(120), anchored: true, anchoredAt: ago(118), dimension: '风险证据' },
  { id: 'evi-010', kind: 'audit', subject: '策略发布记录', summary: 'policy-2026-10-30-001 发布签名与摘要', digest: '0x2f19…b6c4', at: ago(2 * 24 * 60), anchored: true, anchoredAt: ago(2 * 24 * 60), dimension: '治理证据' }
]

const CASES = [
  {
    id: 'case-001',
    title: '瀚海物流旺季仓储费异常上涨调查',
    summary: '连续三个月仓储费环比上涨超过 40%，需核查计费口径与货物周转数据。',
    status: 'OPEN',
    severity: 'high',
    openedAt: ago(3 * 60),
    owner: '合规审计代理·墨白',
    coverage: 0.62,
    linkedTaskIds: ['task-106', 'task-102'],
    linkedEventIds: ['evt-001', 'evt-011'],
    findings: [
      { at: ago(150), text: '调取 9-10 月仓储计费明细，发现旺季附加费口径与合同不一致' },
      { at: ago(90), text: '供应商已提交补充说明，等待财务确认' }
    ],
    conclusion: ''
  },
  {
    id: 'case-002',
    title: '委托链越权尝试复盘',
    summary: '外部代理曾尝试在已撤销的试用委托下提交对账单，被委托链校验拦截。',
    status: 'RESOLVED',
    severity: 'medium',
    openedAt: ago(2 * 24 * 60),
    resolvedAt: ago(26 * 60),
    owner: '合规审计代理·墨白',
    coverage: 0.94,
    linkedTaskIds: [],
    linkedEventIds: ['evt-012'],
    findings: [
      { at: ago(2 * 24 * 60 + 30), text: '拦截日志确认：委托状态为已撤销，拒绝提交' },
      { at: ago(27 * 60), text: '已收紧外部代理的委托策略，试用期结束后自动失效' }
    ],
    conclusion: '系统按预期拦截，无需进一步处置；已将案件结论归档。'
  },
  {
    id: 'case-003',
    title: '供应商收款账户变更核实',
    summary: '云帆贸易收款账户发生变更请求，与合同登记账户不一致，需人工核实变更审批。',
    status: 'ESCALATED',
    severity: 'critical',
    openedAt: ago(118),
    owner: '周明（财务负责人）',
    coverage: 0.35,
    linkedTaskIds: ['task-107'],
    linkedEventIds: ['evt-008'],
    findings: [{ at: ago(110), text: '已暂停付款并升级至财务负责人与合规委员会' }],
    conclusion: ''
  }
]

const KNOWLEDGE = [
  {
    id: 'kb-001',
    category: '合规',
    title: '代理付款委托链的生效与失效规则',
    summary: '委托链从根委托向下逐级收窄；任一层被撤销后，其下游委托同时失去效力，付款请求将被拒绝。',
    tags: ['委托', '授权', '合规'],
    updatedAt: ago(2 * 24 * 60),
    author: '合规审计代理·墨白',
    readMinutes: 4
  },
  {
    id: 'kb-002',
    category: '风控',
    title: '什么时候会触发人工复核（转人工）',
    summary: '风险分达到 0.60 或金额超过代理日常阈值时进入人工复核；复核期间付款保持挂起，超时自动失效。',
    tags: ['风控', '人工复核', 'SLA'],
    updatedAt: ago(4 * 24 * 60),
    author: '风控引擎',
    readMinutes: 3
  },
  {
    id: 'kb-003',
    category: '操作',
    title: '结算完成与任务关闭的关系',
    summary: '任务只有在一笔已签名的终局结算事件通过校验后才可以关闭；手动关闭会被系统拒绝。',
    tags: ['结算', '任务', '证据'],
    updatedAt: ago(6 * 24 * 60),
    author: '结算代理·小澜',
    readMinutes: 2
  },
  {
    id: 'kb-004',
    category: '案例',
    title: '账户变更类欺诈的识别与处置',
    summary: '优先核对合同登记账户；任何账户变更需走双人复核；命中拦截后立即暂停相关供应商全部付款。',
    tags: ['欺诈', '账户', '案例'],
    updatedAt: ago(24 * 60),
    author: '合规审计代理·墨白',
    readMinutes: 6
  },
  {
    id: 'kb-005',
    category: '治理',
    title: '策略版本如何生效',
    summary: '策略以版本化记录发布；风险决策必须引用已发布的策略版本与模型版本，未发布的版本会导致决策不可评估并转人工。',
    tags: ['策略', '模型', '版本'],
    updatedAt: ago(3 * 24 * 60),
    author: '周明（财务负责人）',
    readMinutes: 4
  }
]

const POLICIES = [
  {
    id: 'policy-2026-10-30-001',
    name: '代理付款风控策略',
    version: '2026-10-30-001',
    status: 'PUBLISHED',
    publishedAt: ago(2 * 24 * 60),
    publishedBy: '周明（财务负责人）',
    thresholds: { block: 0.8, defer: 0.6, throttle: 0.4 },
    scope: '全部代理 · 跨境付款',
    ruleCount: 12,
    description: '按风险分区间执行拦截/转人工/限流/放行，并约束单笔与日累计限额。'
  },
  {
    id: 'policy-2026-10-28-002',
    name: '跨境结算限额策略',
    version: '2026-10-28-002',
    status: 'PUBLISHED',
    publishedAt: ago(4 * 24 * 60),
    publishedBy: '周明（财务负责人）',
    thresholds: { block: 0.9, defer: 0.75, throttle: 0.55 },
    scope: '结算代理 · 跨境收付',
    ruleCount: 8,
    description: '对结算代理设定更严格的限额与币种约束，跨境通道异常时自动降级。'
  },
  {
    id: 'policy-2026-11-01-003',
    name: '供应商准入策略（草稿）',
    version: '2026-11-01-003',
    status: 'DRAFT',
    thresholds: { block: 0.85, defer: 0.65, throttle: 0.45 },
    scope: '新供应商 · 首笔交易',
    ruleCount: 5,
    description: '新供应商首笔交易需人工复核，KYB 凭证进入待复核状态时暂停付款。'
  }
]

const MODELS = [
  {
    id: 'rules-2026-10-25-001',
    name: '风险评分模型',
    version: '2026-10-25-001',
    status: 'PUBLISHED',
    publishedAt: ago(5 * 24 * 60),
    metrics: { auc: 0.93, precision: 0.91, recall: 0.88, samples: 124000 },
    features: ['金额偏离度', '对手方历史', '时段异常', '委托链深度'],
    description: '基于规则与历史统计的评分模型，输出 0..1 风险分供策略使用。'
  },
  {
    id: 'anomaly-2026-10-20-002',
    name: '异常检测模型',
    version: '2026-10-20-002',
    status: 'PUBLISHED',
    publishedAt: ago(9 * 24 * 60),
    metrics: { auc: 0.89, precision: 0.86, recall: 0.92, samples: 87000 },
    features: ['账户变更', '发票重复', '金额拆分'],
    description: '识别账户变更、重复发票与金额拆分等异常模式。'
  }
]

const REPORTS = [
  {
    id: 'rpt-001',
    title: '2026 年 10 月信任运营月报',
    period: '2026-10-01 ~ 2026-10-31',
    status: 'READY',
    createdAt: ago(5 * 60),
    createdBy: '合规审计代理·墨白',
    format: 'PDF · JSON',
    sizeLabel: '2.4 MB',
    sections: ['委托链健康度', '风险决策分布', '结算闭环', '案件与整改']
  },
  {
    id: 'rpt-002',
    title: '案件 case-001 调查阶段报告',
    period: '2026-10-25 ~ 2026-10-30',
    status: 'READY',
    createdAt: ago(3.5 * 60),
    createdBy: '合规审计代理·墨白',
    format: 'PDF',
    sizeLabel: '860 KB',
    sections: ['调查背景', '证据清单', '初步结论']
  },
  {
    id: 'rpt-003',
    title: '委托链权限审计报告（Q4）',
    period: '2026-10-01 ~ 2026-12-31',
    status: 'GENERATING',
    createdAt: ago(8),
    createdBy: '周明（财务负责人）',
    format: 'PDF · JSON',
    sizeLabel: '—',
    sections: ['全部委托链', '额度使用率', '越权尝试']
  }
]

const NOTIFICATIONS = [
  { id: 'ntf-1', title: '有 3 项人工复核待处理', body: '其中 1 项已超时，请尽快处理。', at: ago(9), tone: 'warn', read: false, target: 'approvals' },
  { id: 'ntf-2', title: '案件 case-003 已升级', body: '供应商账户变更核实升级至合规委员会。', at: ago(110), tone: 'danger', read: false, target: 'cases' },
  { id: 'ntf-3', title: '月报已生成', body: '2026 年 10 月信任运营月报可下载。', at: ago(5 * 60), tone: 'info', read: true, target: 'reports' },
  { id: 'ntf-4', title: '策略已发布', body: '代理付款风控策略 2026-10-30-001 已生效。', at: ago(2 * 24 * 60), tone: 'success', read: true, target: 'governance' }
]

/**
 * Build a fresh demo world.
 * @returns {object} the demo state
 */
export function createSeed() {
  return {
    version: 1,
    /* Settled volume of the previous six days; today is computed from tasks. */
    volumeHistory: [124800, 168200, 96200, 212500, 151400, 183900],
    seededAt: new Date().toISOString(),
    orgs: JSON.parse(JSON.stringify(ORGS)),
    agents: JSON.parse(JSON.stringify(AGENTS)),
    credentials: JSON.parse(JSON.stringify(CREDENTIALS)),
    delegations: JSON.parse(JSON.stringify(DELEGATIONS)),
    tasks: JSON.parse(JSON.stringify(TASKS)),
    events: JSON.parse(JSON.stringify(EVENTS)),
    interventions: JSON.parse(JSON.stringify(INTERVENTIONS)),
    evidence: JSON.parse(JSON.stringify(EVIDENCE)),
    cases: JSON.parse(JSON.stringify(CASES)),
    knowledge: JSON.parse(JSON.stringify(KNOWLEDGE)),
    policies: JSON.parse(JSON.stringify(POLICIES)),
    models: JSON.parse(JSON.stringify(MODELS)),
    reports: JSON.parse(JSON.stringify(REPORTS)),
    notifications: JSON.parse(JSON.stringify(NOTIFICATIONS))
  }
}

export { POLICY, MODEL, ago, ahead }
