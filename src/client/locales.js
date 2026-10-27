/**
 * Localized copy for the trust-platform browser half.
 *
 * Dictionaries are flat `key -> template` maps with `{name}` placeholders. The
 * locale service interpolates parameters when the seat's `t` is called; the
 * English dictionary doubles as the fallback used by `translate()` when the
 * seat is unavailable (for example while a component is probed in isolation).
 *
 * Both dictionaries must carry exactly the same keys; `tests/client-bundle.test.js`
 * enforces that with a key-parity assertion.
 */

/** Locale namespace owned by this package. */
export const NS = 'trust-platform'

/** @type {Record<string, string>} */
export const en = Object.freeze({
  // Tool-card status vocabulary.
  'status.ok': 'OK',
  'status.failed': 'Failed',
  'status.running': 'Running',
  'result.waiting': 'Waiting for the host to return a result…',
  'result.empty': 'No result payload.',
  'result.unparsed': 'Result is not JSON.',
  'card.raw.show': 'Show raw JSON',
  'card.raw.hide': 'Hide raw JSON',
  'card.errorDetail': 'Error: {message}',

  // Localized titles for the eight tool-call cards.
  'tool.register_identity': 'Identity registration',
  'tool.get_identity_status': 'Identity status',
  'tool.verify_credential': 'Credential verification',
  'tool.check_authorization': 'Authorization check',
  'tool.create_payment_task': 'Payment task',
  'tool.get_risk_decision': 'Risk decision',
  'tool.verify_operation_event': 'Operation event check',
  'tool.get_execution_receipt': 'Execution receipt',
  'tool.unknown': 'Trust platform tool',

  // Overview panel.
  'overview.title': 'Trust platform overview',
  'overview.badge': 'Trust platform',
  'overview.refresh': 'Refresh',
  'overview.retry': 'Retry',
  'overview.loading': 'Loading overview…',
  'overview.updated': 'Updated {time}',
  'overview.mode.control-plane': 'Control plane',
  'overview.mode.in-memory': 'In-memory sandbox',
  'overview.mode.unknown': 'Unknown mode',
  'overview.source': 'Source: {source}',
  'overview.authoritative': 'Authoritative',
  'overview.nonAuthoritative': 'Not authoritative',
  'overview.health': 'Health',
  'overview.health.unknown': 'Unknown',
  'overview.count.identities': 'Identities',
  'overview.count.credentials': 'Credentials',
  'overview.count.authorizations': 'Authorizations',
  'overview.count.tasks': 'Payment tasks',
  'overview.count.events': 'Operation events',
  'overview.count.receipts': 'Execution receipts',
  'overview.recentEvents': 'Recent events',
  'overview.noEvents': 'No recent events.',
  'overview.error.forbidden': 'Access denied (403).',
  'overview.error.http': 'Request failed with status {status}.',
  'overview.error.network': 'Network error: {message}',
  'overview.error.invalid': 'Unexpected overview payload.',
  'overview.error.host': 'Host error {code}: {message}',
  'overview.error.stale': 'Last refresh failed: {message}',
  'overview.unavailable': 'The overview endpoint is unavailable in this host.',

  // Settings page (settings.section).
  'settings.nav': 'Trust Platform',
  'settings.title': 'Trust Platform',
  'settings.mode': 'Mode',
  'settings.source': 'Data source',
  'settings.health': 'Health',
  'settings.health.sandbox': 'In-memory sandbox',
  'settings.health.unknown': 'Unknown',
  'settings.refresh': 'Refresh',
  'settings.retry': 'Retry',
  'settings.loading': 'Loading trust platform status…',
  'settings.updated': 'Updated {time}',
  'settings.config': 'Configuration',
  'settings.config.baseUrl': 'Control plane base URL',
  'settings.config.actorDid': 'Actor DID',
  'settings.config.timeoutMs': 'Request timeout',
  'settings.config.allowInterventionExecution': 'Allow intervention execution',
  'settings.config.tokenConfigured': 'Access token',
  'settings.config.notReported': 'This host does not report the plugin configuration.',
  'settings.config.note': 'Read-only here. In the DSH profile cordis.patch.yml, edit the trust-platform-tools row config: mode, baseUrl, token, actorDid, timeoutMs, allowInterventionExecution.',
  'settings.value.none': '—',
  'settings.value.default': 'Default',
  'settings.value.yes': 'Yes',
  'settings.value.no': 'No',
  'settings.value.timeout': '{ms} ms',
  'settings.counts': 'Records',
  'settings.error.forbidden': 'Access denied (403).',
  'settings.error.http': 'Request failed with status {status}.',
  'settings.error.network': 'Network error: {message}',
  'settings.error.invalid': 'Unexpected status payload.',
  'settings.error.host': 'Host error {code}: {message}',
  'settings.error.stale': 'Last refresh failed: {message}',
  'settings.unavailable': 'The status endpoint is unavailable in this host.'
})

/** @type {Record<string, string>} */
export const zh = Object.freeze({
  // 工具卡片的状态词。
  'status.ok': '正常',
  'status.failed': '失败',
  'status.running': '运行中',
  'result.waiting': '等待宿主返回结果…',
  'result.empty': '无结果载荷。',
  'result.unparsed': '结果不是 JSON。',
  'card.raw.show': '显示原始 JSON',
  'card.raw.hide': '收起原始 JSON',
  'card.errorDetail': '错误：{message}',

  // 八个工具卡片的中文标题。
  'tool.register_identity': '身份注册',
  'tool.get_identity_status': '身份状态',
  'tool.verify_credential': '凭证验证',
  'tool.check_authorization': '授权检查',
  'tool.create_payment_task': '支付任务',
  'tool.get_risk_decision': '风险决策',
  'tool.verify_operation_event': '操作事件校验',
  'tool.get_execution_receipt': '执行回执',
  'tool.unknown': '信任平台工具',

  // 概览面板。
  'overview.title': '信任平台概览',
  'overview.badge': '信任平台',
  'overview.refresh': '刷新',
  'overview.retry': '重试',
  'overview.loading': '正在加载概览…',
  'overview.updated': '更新于 {time}',
  'overview.mode.control-plane': '控制平面',
  'overview.mode.in-memory': '内存沙箱',
  'overview.mode.unknown': '未知模式',
  'overview.source': '数据源：{source}',
  'overview.authoritative': '权威数据',
  'overview.nonAuthoritative': '非权威数据',
  'overview.health': '健康状态',
  'overview.health.unknown': '未知',
  'overview.count.identities': '身份',
  'overview.count.credentials': '凭证',
  'overview.count.authorizations': '授权',
  'overview.count.tasks': '支付任务',
  'overview.count.events': '操作事件',
  'overview.count.receipts': '执行回执',
  'overview.recentEvents': '最近事件',
  'overview.noEvents': '暂无最近事件。',
  'overview.error.forbidden': '无权访问（403）。',
  'overview.error.http': '请求失败，状态码 {status}。',
  'overview.error.network': '网络错误：{message}',
  'overview.error.invalid': '概览数据格式异常。',
  'overview.error.host': '宿主错误 {code}：{message}',
  'overview.error.stale': '上次刷新失败：{message}',
  'overview.unavailable': '此宿主未提供概览接口。',

  // 设置页（settings.section）。
  'settings.nav': '信任平台',
  'settings.title': '信任平台',
  'settings.mode': '模式',
  'settings.source': '数据源',
  'settings.health': '健康状态',
  'settings.health.sandbox': '内存沙箱',
  'settings.health.unknown': '未知',
  'settings.refresh': '刷新',
  'settings.retry': '重试',
  'settings.loading': '正在加载信任平台状态…',
  'settings.updated': '更新于 {time}',
  'settings.config': '配置',
  'settings.config.baseUrl': '控制平面地址',
  'settings.config.actorDid': '操作者 DID',
  'settings.config.timeoutMs': '请求超时',
  'settings.config.allowInterventionExecution': '允许干预执行',
  'settings.config.tokenConfigured': '访问令牌',
  'settings.config.notReported': '此宿主未上报插件配置。',
  'settings.config.note': '此处只读。请在 DSH profile 的 cordis.patch.yml 中编辑 trust-platform-tools 行的 config：mode、baseUrl、token、actorDid、timeoutMs、allowInterventionExecution。',
  'settings.value.none': '—',
  'settings.value.default': '默认',
  'settings.value.yes': '是',
  'settings.value.no': '否',
  'settings.value.timeout': '{ms} 毫秒',
  'settings.counts': '记录数',
  'settings.error.forbidden': '无权访问（403）。',
  'settings.error.http': '请求失败，状态码 {status}。',
  'settings.error.network': '网络错误：{message}',
  'settings.error.invalid': '状态数据格式异常。',
  'settings.error.host': '宿主错误 {code}：{message}',
  'settings.error.stale': '上次刷新失败：{message}',
  'settings.unavailable': '此宿主未提供状态接口。'
})
