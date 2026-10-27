window.__ModuleLoader__.load({
	id: "@sealwax/dsh-trust-platform",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __export = (target, all) => {
		  for (var name in all)
		    __defProp(target, name, { get: all[name], enumerable: true });
		};
		var __copyProps = (to, from, except, desc) => {
		  if (from && typeof from === "object" || typeof from === "function") {
		    for (let key of __getOwnPropNames(from))
		      if (!__hasOwnProp.call(to, key) && key !== except)
		        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
		  }
		  return to;
		};
		var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

		// src/client/index.jsx
		var index_exports = {};
		__export(index_exports, {
		  apply: () => apply,
		  inject: () => inject
		});
		module.exports = __toCommonJS(index_exports);

		// src/client/locales.js
		var NS = "trust-platform";
		var en = Object.freeze({
		  // Tool-card status vocabulary.
		  "status.ok": "OK",
		  "status.failed": "Failed",
		  "status.running": "Running",
		  "result.waiting": "Waiting for the host to return a result…",
		  "result.empty": "No result payload.",
		  "result.unparsed": "Result is not JSON.",
		  "card.raw.show": "Show raw JSON",
		  "card.raw.hide": "Hide raw JSON",
		  "card.errorDetail": "Error: {message}",
		  // Localized titles for the eight tool-call cards.
		  "tool.register_identity": "Identity registration",
		  "tool.get_identity_status": "Identity status",
		  "tool.verify_credential": "Credential verification",
		  "tool.check_authorization": "Authorization check",
		  "tool.create_payment_task": "Payment task",
		  "tool.get_risk_decision": "Risk decision",
		  "tool.verify_operation_event": "Operation event check",
		  "tool.get_execution_receipt": "Execution receipt",
		  "tool.unknown": "Trust platform tool",
		  // Overview panel.
		  "overview.title": "Trust platform overview",
		  "overview.badge": "Trust platform",
		  "overview.refresh": "Refresh",
		  "overview.retry": "Retry",
		  "overview.loading": "Loading overview…",
		  "overview.updated": "Updated {time}",
		  "overview.mode.embedded": "Embedded engine",
		  "overview.mode.control-plane": "Control plane",
		  "overview.mode.in-memory": "In-memory sandbox",
		  "overview.mode.sandbox": "In-memory sandbox",
		  "overview.mode.unknown": "Unknown mode",
		  "overview.source": "Source: {source}",
		  "overview.authoritative": "Authoritative",
		  "overview.nonAuthoritative": "Not authoritative",
		  "overview.health": "Health",
		  "overview.health.unknown": "Unknown",
		  "overview.count.identities": "Identities",
		  "overview.count.credentials": "Credentials",
		  "overview.count.authorizations": "Authorizations",
		  "overview.count.tasks": "Payment tasks",
		  "overview.count.events": "Operation events",
		  "overview.count.receipts": "Execution receipts",
		  "overview.recentEvents": "Recent events",
		  "overview.noEvents": "No recent events.",
		  "overview.error.forbidden": "Access denied (403).",
		  "overview.error.http": "Request failed with status {status}.",
		  "overview.error.network": "Network error: {message}",
		  "overview.error.invalid": "Unexpected overview payload.",
		  "overview.error.host": "Host error {code}: {message}",
		  "overview.error.stale": "Last refresh failed: {message}",
		  "overview.unavailable": "The overview endpoint is unavailable in this host.",
		  // Settings page (settings.section).
		  "settings.nav": "Trust Platform",
		  "settings.title": "Trust Platform",
		  "settings.mode": "Mode",
		  "settings.source": "Data source",
		  "settings.health": "Health",
		  "settings.health.sandbox": "In-memory sandbox",
		  "settings.health.unknown": "Unknown",
		  "settings.refresh": "Refresh",
		  "settings.retry": "Retry",
		  "settings.loading": "Loading trust platform status…",
		  "settings.updated": "Updated {time}",
		  "settings.value.none": "—",
		  "settings.value.default": "Default",
		  "settings.value.yes": "Yes",
		  "settings.value.no": "No",
		  "settings.value.timeout": "{ms} ms",
		  "settings.counts": "Records",
		  "settings.error.forbidden": "Access denied (403).",
		  "settings.error.http": "Request failed with status {status}.",
		  "settings.error.network": "Network error: {message}",
		  "settings.error.invalid": "Unexpected status payload.",
		  "settings.error.host": "Host error {code}: {message}",
		  "settings.error.stale": "Last refresh failed: {message}",
		  "settings.unavailable": "The status endpoint is unavailable in this host.",
		  // Embedded-engine mode and status vocabulary.
		  "settings.mode.embedded": "Embedded engine",
		  "settings.mode.sandbox": "In-memory sandbox",
		  "settings.mode.unknown": "Unknown mode",
		  "settings.authoritative": "Authoritative",
		  "settings.nonAuthoritative": "Not authoritative",
		  "settings.dataDir": "Data directory",
		  "settings.schemaRevision": "Schema revision",
		  "settings.startedAt": "Started",
		  // Editable runtime settings form.
		  "settings.form.title": "Runtime settings",
		  "settings.form.hint": "Saved changes apply to the embedded engine immediately and persist with its state.",
		  "settings.field.actorDid": "Actor DID",
		  "settings.field.allowInterventionExecution": "Allow intervention execution",
		  "settings.field.policyVersion": "Policy version",
		  "settings.field.singleAmountLimit": "Single payment limit",
		  "settings.field.dailyAmountLimit": "Daily payment limit",
		  "settings.field.riskBlockThreshold": "Risk block threshold",
		  "settings.field.riskDeferThreshold": "Risk defer threshold",
		  "settings.field.riskThrottleThreshold": "Risk throttle threshold",
		  "settings.field.defaultTrustScore": "Default trust score",
		  "settings.hint.actorDid": "3–200 characters; the default actor for engine calls.",
		  "settings.hint.intervention": "Gates the intervention execution tool; off by default.",
		  "settings.hint.amount": "Positive amount, at most {max}.",
		  "settings.hint.ratio": "Number between 0 and 1.",
		  "settings.hint.thresholds": "Block ≥ defer ≥ throttle.",
		  // Form actions and feedback.
		  "settings.action.save": "Save",
		  "settings.action.cancel": "Cancel",
		  "settings.action.applyDefaults": "Apply defaults",
		  "settings.action.reset": "Reset data",
		  "settings.action.confirmReset": "Confirm reset",
		  "settings.action.cancelReset": "Cancel",
		  "settings.action.saving": "Saving…",
		  "settings.action.resetting": "Resetting…",
		  "settings.reset.title": "Danger zone",
		  "settings.reset.description": "Deletes every embedded engine record and restores an empty trust state. Runtime settings are kept.",
		  "settings.reset.confirm": "This cannot be undone. Reset all trust data now?",
		  "settings.feedback.saved": "Saved at {time}.",
		  "settings.feedback.noChanges": "No changes to save.",
		  "settings.feedback.defaultsApplied": "Defaults loaded into the form. Save to apply them.",
		  "settings.feedback.reset": "Trust data reset ({count} records removed).",
		  // Client-side and Host validation errors.
		  "settings.error.actorDid": "Actor DID must be 3–200 characters.",
		  "settings.error.policyVersion": "Policy version must be 3–120 characters.",
		  "settings.error.number": "Enter a number for {field}.",
		  "settings.error.amount": "Enter a positive amount for {field}.",
		  "settings.error.ratio": "Enter a value from 0 to 1 for {field}.",
		  "settings.error.thresholds": "Risk thresholds must satisfy block ≥ defer ≥ throttle.",
		  "settings.error.validation": "The host rejected the change: {message}",
		  "settings.error.invalidDraft": "The form is incomplete.",
		  "settings.error.details": "Details: {details}"
		});
		var zh = Object.freeze({
		  // 工具卡片的状态词。
		  "status.ok": "正常",
		  "status.failed": "失败",
		  "status.running": "运行中",
		  "result.waiting": "等待宿主返回结果…",
		  "result.empty": "无结果载荷。",
		  "result.unparsed": "结果不是 JSON。",
		  "card.raw.show": "显示原始 JSON",
		  "card.raw.hide": "收起原始 JSON",
		  "card.errorDetail": "错误：{message}",
		  // 八个工具卡片的中文标题。
		  "tool.register_identity": "身份注册",
		  "tool.get_identity_status": "身份状态",
		  "tool.verify_credential": "凭证验证",
		  "tool.check_authorization": "授权检查",
		  "tool.create_payment_task": "支付任务",
		  "tool.get_risk_decision": "风险决策",
		  "tool.verify_operation_event": "操作事件校验",
		  "tool.get_execution_receipt": "执行回执",
		  "tool.unknown": "信任平台工具",
		  // 概览面板。
		  "overview.title": "信任平台概览",
		  "overview.badge": "信任平台",
		  "overview.refresh": "刷新",
		  "overview.retry": "重试",
		  "overview.loading": "正在加载概览…",
		  "overview.updated": "更新于 {time}",
		  "overview.mode.control-plane": "控制平面",
		  "overview.mode.embedded": "内置引擎",
		  "overview.mode.in-memory": "内存沙箱",
		  "overview.mode.sandbox": "内存沙箱",
		  "overview.mode.unknown": "未知模式",
		  "overview.source": "数据源：{source}",
		  "overview.authoritative": "权威数据",
		  "overview.nonAuthoritative": "非权威数据",
		  "overview.health": "健康状态",
		  "overview.health.unknown": "未知",
		  "overview.count.identities": "身份",
		  "overview.count.credentials": "凭证",
		  "overview.count.authorizations": "授权",
		  "overview.count.tasks": "支付任务",
		  "overview.count.events": "操作事件",
		  "overview.count.receipts": "执行回执",
		  "overview.recentEvents": "最近事件",
		  "overview.noEvents": "暂无最近事件。",
		  "overview.error.forbidden": "无权访问（403）。",
		  "overview.error.http": "请求失败，状态码 {status}。",
		  "overview.error.network": "网络错误：{message}",
		  "overview.error.invalid": "概览数据格式异常。",
		  "overview.error.host": "宿主错误 {code}：{message}",
		  "overview.error.stale": "上次刷新失败：{message}",
		  "overview.unavailable": "此宿主未提供概览接口。",
		  // 设置页（settings.section）。
		  "settings.nav": "信任平台",
		  "settings.title": "信任平台",
		  "settings.mode": "模式",
		  "settings.source": "数据源",
		  "settings.health": "健康状态",
		  "settings.health.sandbox": "内存沙箱",
		  "settings.health.unknown": "未知",
		  "settings.refresh": "刷新",
		  "settings.retry": "重试",
		  "settings.loading": "正在加载信任平台状态…",
		  "settings.updated": "更新于 {time}",
		  "settings.value.none": "—",
		  "settings.value.default": "默认",
		  "settings.value.yes": "是",
		  "settings.value.no": "否",
		  "settings.value.timeout": "{ms} 毫秒",
		  "settings.counts": "记录数",
		  "settings.error.forbidden": "无权访问（403）。",
		  "settings.error.http": "请求失败，状态码 {status}。",
		  "settings.error.network": "网络错误：{message}",
		  "settings.error.invalid": "状态数据格式异常。",
		  "settings.error.host": "宿主错误 {code}：{message}",
		  "settings.error.stale": "上次刷新失败：{message}",
		  "settings.unavailable": "此宿主未提供状态接口。",
		  // 内置引擎的模式与状态词。
		  "settings.mode.embedded": "内置引擎",
		  "settings.mode.sandbox": "内存沙箱",
		  "settings.mode.unknown": "未知模式",
		  "settings.authoritative": "权威数据",
		  "settings.nonAuthoritative": "非权威数据",
		  "settings.dataDir": "数据目录",
		  "settings.schemaRevision": "Schema 版本",
		  "settings.startedAt": "启动时间",
		  // 可编辑的运行时设置表单。
		  "settings.form.title": "运行时设置",
		  "settings.form.hint": "保存后立即作用于内置引擎，并随引擎状态持久化。",
		  "settings.field.actorDid": "操作者 DID",
		  "settings.field.allowInterventionExecution": "允许干预执行",
		  "settings.field.policyVersion": "策略版本",
		  "settings.field.singleAmountLimit": "单笔支付限额",
		  "settings.field.dailyAmountLimit": "每日支付限额",
		  "settings.field.riskBlockThreshold": "风险阻断阈值",
		  "settings.field.riskDeferThreshold": "风险延后阈值",
		  "settings.field.riskThrottleThreshold": "风险限流阈值",
		  "settings.field.defaultTrustScore": "默认信任分",
		  "settings.hint.actorDid": "3–200 个字符；作为引擎调用的默认操作者。",
		  "settings.hint.intervention": "控制干预执行工具是否可用；默认关闭。",
		  "settings.hint.amount": "正数金额，最大 {max}。",
		  "settings.hint.ratio": "0 到 1 之间的数值。",
		  "settings.hint.thresholds": "阻断 ≥ 延后 ≥ 限流。",
		  // 表单动作与反馈。
		  "settings.action.save": "保存",
		  "settings.action.cancel": "取消",
		  "settings.action.applyDefaults": "填入默认值",
		  "settings.action.reset": "重置数据",
		  "settings.action.confirmReset": "确认重置",
		  "settings.action.cancelReset": "取消",
		  "settings.action.saving": "保存中…",
		  "settings.action.resetting": "重置中…",
		  "settings.reset.title": "危险操作",
		  "settings.reset.description": "删除内置引擎的全部记录并恢复为空的信任状态；运行时设置会保留。",
		  "settings.reset.confirm": "此操作不可撤销。现在重置全部信任数据？",
		  "settings.feedback.saved": "已保存于 {time}。",
		  "settings.feedback.noChanges": "没有需要保存的更改。",
		  "settings.feedback.defaultsApplied": "默认值已填入表单，保存后生效。",
		  "settings.feedback.reset": "信任数据已重置（删除 {count} 条记录）。",
		  // 客户端与宿主校验错误。
		  "settings.error.actorDid": "操作者 DID 需为 3–200 个字符。",
		  "settings.error.policyVersion": "策略版本需为 3–120 个字符。",
		  "settings.error.number": "{field} 需填写数字。",
		  "settings.error.amount": "{field} 需填写正数金额。",
		  "settings.error.ratio": "{field} 需填写 0 到 1 之间的数值。",
		  "settings.error.thresholds": "风险阈值需满足 阻断 ≥ 延后 ≥ 限流。",
		  "settings.error.validation": "宿主拒绝了该修改：{message}",
		  "settings.error.invalidDraft": "表单内容不完整。",
		  "settings.error.details": "详情：{details}"
		});

		// src/client/format.js
		var PLUGIN_ID = "@sealwax/dsh-trust-platform";
		var COUNT_KEYS = Object.freeze([
		  "identities",
		  "credentials",
		  "authorizations",
		  "tasks",
		  "events",
		  "receipts"
		]);
		var SUMMARY_LIMIT = 160;
		function isObject(value) {
		  return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		function isNonEmptyString(value) {
		  return typeof value === "string" && value.length > 0;
		}
		function truncate(text) {
		  const line = String(text).split("\n").find((entry) => entry.trim().length > 0) || "";
		  const trimmed = line.trim();
		  return trimmed.length > SUMMARY_LIMIT ? `${trimmed.slice(0, SUMMARY_LIMIT - 1)}…` : trimmed;
		}
		function interpolate(template, params) {
		  if (!params || typeof params !== "object") return template;
		  return template.replace(/\{(\w+)\}/g, (match, name) => Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match);
		}
		function translate(t, key, params) {
		  let value;
		  if (typeof t === "function") {
		    try {
		      value = t(key, params);
		    } catch {
		      value = void 0;
		    }
		  }
		  if (typeof value !== "string" || value === "" || value === key) {
		    value = typeof en[key] === "string" ? en[key] : key;
		  }
		  return interpolate(value, params);
		}
		function hasCopy(key) {
		  return typeof en[key] === "string";
		}
		function resultText(block) {
		  if (!block || !Array.isArray(block.content)) return "";
		  const parts = [];
		  for (const entry of block.content) {
		    if (entry && entry.type === "text" && isNonEmptyString(entry.text)) parts.push(entry.text);
		  }
		  return parts.join("\n").trim();
		}
		function parsePayload(block) {
		  const text = resultText(block);
		  if (!text) return { text: "", parsed: false, value: void 0 };
		  try {
		    return { text, parsed: true, value: JSON.parse(text) };
		  } catch {
		    return { text, parsed: false, value: void 0 };
		  }
		}
		function toolState(phase, block) {
		  if (phase !== "result" || !block) return "running";
		  const { parsed, value } = parsePayload(block);
		  if (parsed && isObject(value) && value.ok === false) return "failed";
		  if (block.isError === true) return "failed";
		  return "ok";
		}
		function resultSummary(block, t) {
		  const { text, parsed, value } = parsePayload(block);
		  if (parsed && isObject(value)) {
		    const code = isNonEmptyString(value.code) ? value.code : null;
		    const message = isNonEmptyString(value.message) ? value.message : null;
		    if (code && message) return truncate(`${code} · ${message}`);
		    if (code) return truncate(code);
		    if (message) return truncate(message);
		    if (isNonEmptyString(value.decision)) return truncate(value.decision);
		    if (value.ok === true) return translate(t, "status.ok");
		    return translate(t, "result.empty");
		  }
		  if (parsed) return truncate(JSON.stringify(value));
		  if (text) return truncate(text);
		  if (block && block.isError === true && isObject(block.error)) {
		    const name = isNonEmptyString(block.error.name) ? block.error.name : "Error";
		    const code = isNonEmptyString(block.error.code) ? block.error.code : "UNKNOWN";
		    return translate(t, "card.errorDetail", { message: `${name}: ${code}` });
		  }
		  return translate(t, "result.empty");
		}
		function toolDecision(block) {
		  const { parsed, value } = parsePayload(block);
		  if (!parsed || !isObject(value) || !isNonEmptyString(value.decision)) return null;
		  return value.decision;
		}
		function decisionTone(decision) {
		  const normalized = String(decision || "").toUpperCase();
		  if (normalized === "ALLOW" || normalized === "APPROVED" || normalized === "VERIFIED" || normalized === "VALID") return "ok";
		  if (normalized === "DENY" || normalized === "DENIED" || normalized === "REJECTED" || normalized === "BLOCKED") return "failed";
		  if (normalized === "DEFER" || normalized === "REVIEW" || normalized === "STEP_UP" || normalized === "REQUIRE_STEP_UP" || normalized === "PENDING" || normalized === "WARNING") return "warn";
		  return "neutral";
		}
		function rawPayload(block) {
		  const { text, parsed, value } = parsePayload(block);
		  if (parsed) {
		    try {
		      return JSON.stringify(value, null, 2);
		    } catch {
		      return text || null;
		    }
		  }
		  const parts = [];
		  if (text) parts.push(text);
		  if (block && block.isError === true && isObject(block.error)) {
		    try {
		      parts.push(JSON.stringify(block.error, null, 2));
		    } catch {
		    }
		  }
		  return parts.length > 0 ? parts.join("\n\n") : null;
		}
		function hasRawPayload(block) {
		  return resultText(block).length > 0 || Boolean(block && block.isError === true && block.error);
		}
		function formatTime(value) {
		  let input2 = value;
		  if (typeof input2 === "number" && Number.isFinite(input2)) input2 = new Date(input2);
		  else if (isNonEmptyString(input2)) input2 = new Date(input2);
		  else return null;
		  const date = input2 instanceof Date ? input2 : null;
		  if (!date || Number.isNaN(date.getTime())) return isNonEmptyString(value) ? value : null;
		  try {
		    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
		  } catch {
		    return isNonEmptyString(value) ? value : null;
		  }
		}
		function matchesPlugin(subject) {
		  if (!subject || typeof subject !== "object") return false;
		  const candidates = [];
		  if (isObject(subject.pkg) && isNonEmptyString(subject.pkg.name)) candidates.push(subject.pkg.name);
		  if (isObject(subject.row) && isNonEmptyString(subject.row.name)) candidates.push(subject.row.name);
		  if (isNonEmptyString(subject.name)) candidates.push(subject.name);
		  if (isNonEmptyString(subject.id)) candidates.push(subject.id);
		  return candidates.includes(PLUGIN_ID);
		}
		function normalizeOverviewBody(body) {
		  if (!isObject(body)) return null;
		  const nested = body.overview;
		  return isObject(nested) ? nested : body;
		}

		// src/client/toolviews.jsx
		var import_react = require("react");

		// src/client/styles.js
		var MUTED = "var(--dsw-color-text-secondary, #6b7280)";
		var card = {
		  border: "1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.25))",
		  borderRadius: "8px",
		  padding: "8px 10px",
		  margin: "6px 0",
		  background: "var(--dsw-color-surface, transparent)"
		};
		var cardHead = {
		  display: "flex",
		  alignItems: "center",
		  gap: "6px",
		  flexWrap: "wrap"
		};
		var cardTitle = {
		  fontWeight: 600,
		  color: "var(--dsw-color-text-primary, inherit)"
		};
		var cardSummary = {
		  color: MUTED,
		  fontSize: "12px",
		  marginTop: "4px",
		  wordBreak: "break-word"
		};
		var raw = {
		  margin: "8px 0 0",
		  padding: "8px",
		  maxHeight: "240px",
		  overflow: "auto",
		  fontSize: "11px",
		  lineHeight: 1.5,
		  whiteSpace: "pre-wrap",
		  wordBreak: "break-word",
		  borderRadius: "6px",
		  background: "var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.08))",
		  fontFamily: "var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
		  color: "var(--dsw-color-text-primary, inherit)"
		};
		var linkButton = {
		  marginTop: "6px",
		  padding: "0",
		  border: "none",
		  background: "transparent",
		  color: "var(--dsw-color-accent, #2563eb)",
		  cursor: "pointer",
		  fontSize: "12px"
		};
		var actionButton = {
		  padding: "2px 8px",
		  borderRadius: "6px",
		  border: "1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.25))",
		  background: "var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.08))",
		  color: "var(--dsw-color-text-primary, inherit)",
		  cursor: "pointer",
		  fontSize: "12px"
		};
		var section = {
		  marginTop: "16px",
		  padding: "12px 14px",
		  border: "1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.25))",
		  borderRadius: "10px",
		  background: "var(--dsw-color-surface, transparent)",
		  color: "var(--dsw-color-text-primary, inherit)",
		  fontSize: "13px"
		};
		var sectionHead = {
		  display: "flex",
		  alignItems: "center",
		  gap: "8px",
		  flexWrap: "wrap"
		};
		var sectionTitle = {
		  fontWeight: 600,
		  fontSize: "14px"
		};
		var actions = {
		  display: "flex",
		  alignItems: "center",
		  gap: "6px",
		  marginLeft: "auto",
		  flexWrap: "wrap"
		};
		var meta = {
		  color: MUTED,
		  fontSize: "11px",
		  marginTop: "4px"
		};
		var metaRow = {
		  display: "flex",
		  alignItems: "center",
		  gap: "12px",
		  flexWrap: "wrap",
		  color: MUTED,
		  fontSize: "12px",
		  marginTop: "8px"
		};
		var mono = {
		  fontFamily: "var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
		  fontSize: "11px"
		};
		var counts = {
		  display: "grid",
		  gridTemplateColumns: "repeat(auto-fit, minmax(112px, 1fr))",
		  gap: "8px",
		  marginTop: "10px"
		};
		var countCell = {
		  padding: "8px 10px",
		  borderRadius: "8px",
		  background: "var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.08))"
		};
		var countValue = {
		  fontSize: "18px",
		  fontWeight: 600,
		  lineHeight: 1.2
		};
		var countLabel = {
		  color: MUTED,
		  fontSize: "11px",
		  marginTop: "2px"
		};
		var subTitle = {
		  fontWeight: 600,
		  fontSize: "12px",
		  marginTop: "14px"
		};
		var list = {
		  margin: "6px 0 0",
		  padding: 0,
		  listStyle: "none",
		  display: "flex",
		  flexDirection: "column",
		  gap: "4px"
		};
		var eventRow = {
		  display: "flex",
		  alignItems: "baseline",
		  gap: "8px",
		  flexWrap: "wrap",
		  paddingTop: "4px",
		  borderTop: "1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.18))",
		  fontSize: "12px"
		};
		var eventType = {
		  fontFamily: "var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
		  fontSize: "11px",
		  color: "var(--dsw-color-text-primary, inherit)"
		};
		var eventActor = {
		  color: MUTED,
		  overflow: "hidden",
		  textOverflow: "ellipsis",
		  whiteSpace: "nowrap",
		  maxWidth: "240px"
		};
		var eventTime = {
		  color: MUTED,
		  marginLeft: "auto",
		  fontSize: "11px"
		};
		var muted = {
		  color: MUTED,
		  fontSize: "12px",
		  marginTop: "8px"
		};
		var errorBox = {
		  marginTop: "8px",
		  padding: "8px 10px",
		  borderRadius: "8px",
		  border: "1px solid var(--dsw-color-danger-border, rgba(198, 40, 40, 0.35))",
		  background: "var(--dsw-color-danger-bg, rgba(198, 40, 40, 0.08))",
		  color: "var(--dsw-color-danger, #c62828)",
		  fontSize: "12px",
		  display: "flex",
		  alignItems: "center",
		  gap: "8px",
		  flexWrap: "wrap"
		};
		var staleBox = {
		  marginTop: "8px",
		  padding: "6px 10px",
		  borderRadius: "8px",
		  border: "1px solid var(--dsw-color-warning-border, rgba(154, 103, 0, 0.35))",
		  background: "var(--dsw-color-warning-bg, rgba(154, 103, 0, 0.08))",
		  color: "var(--dsw-color-warning, #9a6700)",
		  fontSize: "12px"
		};
		var pluginBadge = {
		  display: "inline-flex",
		  alignItems: "center",
		  padding: "0 8px",
		  height: "20px",
		  borderRadius: "10px",
		  border: "1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.3))",
		  background: "var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.1))",
		  color: MUTED,
		  fontSize: "11px",
		  fontWeight: 600,
		  whiteSpace: "nowrap"
		};
		var form = {
		  display: "flex",
		  flexDirection: "column",
		  gap: "6px",
		  marginTop: "10px"
		};
		var formRow = {
		  display: "flex",
		  alignItems: "center",
		  gap: "12px",
		  flexWrap: "wrap",
		  paddingTop: "6px",
		  borderTop: "1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.18))"
		};
		var formLabel = {
		  flex: "0 0 220px",
		  color: MUTED,
		  fontSize: "12px"
		};
		var formControl = {
		  display: "flex",
		  alignItems: "center",
		  gap: "8px",
		  flex: "1 1 240px",
		  minWidth: "160px"
		};
		var input = {
		  flex: "1 1 240px",
		  minWidth: "160px",
		  padding: "4px 8px",
		  borderRadius: "6px",
		  border: "1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.3))",
		  background: "var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.08))",
		  color: "var(--dsw-color-text-primary, inherit)",
		  fontSize: "12px"
		};
		var inputNumber = {
		  flex: "0 0 180px",
		  minWidth: "150px",
		  padding: "4px 8px",
		  borderRadius: "6px",
		  border: "1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.3))",
		  background: "var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.08))",
		  color: "var(--dsw-color-text-primary, inherit)",
		  fontSize: "12px"
		};
		var checkbox = {
		  width: "14px",
		  height: "14px",
		  accentColor: "var(--dsw-color-accent, #2563eb)"
		};
		var inputDisabled = {
		  opacity: 0.55,
		  cursor: "not-allowed"
		};
		var hint = {
		  color: MUTED,
		  fontSize: "11px"
		};
		var formActions = {
		  display: "flex",
		  alignItems: "center",
		  gap: "8px",
		  flexWrap: "wrap",
		  marginTop: "10px"
		};
		var primaryButton = {
		  ...actionButton,
		  borderColor: "var(--dsw-color-accent-border, rgba(37, 99, 235, 0.35))",
		  color: "var(--dsw-color-accent, #2563eb)",
		  fontWeight: 600
		};
		var dangerButton = {
		  ...actionButton,
		  borderColor: "var(--dsw-color-danger-border, rgba(198, 40, 40, 0.35))",
		  color: "var(--dsw-color-danger, #c62828)"
		};
		var buttonDisabled = {
		  opacity: 0.55,
		  cursor: "not-allowed"
		};
		var confirmBox = {
		  marginTop: "8px",
		  padding: "8px 10px",
		  borderRadius: "8px",
		  border: "1px solid var(--dsw-color-warning-border, rgba(154, 103, 0, 0.35))",
		  background: "var(--dsw-color-warning-bg, rgba(154, 103, 0, 0.08))",
		  color: "var(--dsw-color-warning, #9a6700)",
		  fontSize: "12px"
		};
		var feedbackOk = {
		  marginTop: "8px",
		  padding: "6px 10px",
		  borderRadius: "8px",
		  border: "1px solid var(--dsw-color-success-border, rgba(26, 127, 55, 0.35))",
		  background: "var(--dsw-color-success-bg, rgba(26, 127, 55, 0.08))",
		  color: "var(--dsw-color-success, #1a7f37)",
		  fontSize: "12px"
		};
		var note = {
		  marginTop: "10px",
		  color: MUTED,
		  fontSize: "11px",
		  lineHeight: 1.5
		};
		var pill = {
		  display: "inline-flex",
		  alignItems: "center",
		  padding: "0 6px",
		  height: "18px",
		  borderRadius: "9px",
		  border: "1px solid transparent",
		  fontSize: "11px",
		  fontWeight: 600,
		  lineHeight: "18px",
		  whiteSpace: "nowrap"
		};
		var TONES = {
		  neutral: {
		    color: "var(--dsw-color-text-secondary, #6b7280)",
		    background: "var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.1))",
		    borderColor: "var(--dsw-color-border, rgba(127, 127, 127, 0.3))"
		  },
		  ok: {
		    color: "var(--dsw-color-success, #1a7f37)",
		    background: "var(--dsw-color-success-bg, rgba(26, 127, 55, 0.12))",
		    borderColor: "var(--dsw-color-success-border, rgba(26, 127, 55, 0.35))"
		  },
		  failed: {
		    color: "var(--dsw-color-danger, #c62828)",
		    background: "var(--dsw-color-danger-bg, rgba(198, 40, 40, 0.12))",
		    borderColor: "var(--dsw-color-danger-border, rgba(198, 40, 40, 0.35))"
		  },
		  warn: {
		    color: "var(--dsw-color-warning, #9a6700)",
		    background: "var(--dsw-color-warning-bg, rgba(154, 103, 0, 0.12))",
		    borderColor: "var(--dsw-color-warning-border, rgba(154, 103, 0, 0.35))"
		  },
		  info: {
		    color: "var(--dsw-color-accent, #2563eb)",
		    background: "var(--dsw-color-accent-bg, rgba(37, 99, 235, 0.12))",
		    borderColor: "var(--dsw-color-accent-border, rgba(37, 99, 235, 0.35))"
		  }
		};
		function toneStyle(tone) {
		  return TONES[tone] || TONES.neutral;
		}

		// src/client/badge.jsx
		var import_jsx_runtime = require("react/jsx-runtime");
		function Badge({ tone, children }) {
		  if (children === null || children === void 0 || children === "") return null;
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { ...pill, ...toneStyle(tone) }, children });
		}

		// src/client/toolviews.jsx
		var import_jsx_runtime2 = require("react/jsx-runtime");
		var TOOL_KEYS = Object.freeze([
		  "register_identity",
		  "get_identity_status",
		  "verify_credential",
		  "check_authorization",
		  "create_payment_task",
		  "get_risk_decision",
		  "verify_operation_event",
		  "get_execution_receipt"
		]);
		function stateTone(state) {
		  if (state === "ok") return "ok";
		  if (state === "failed") return "failed";
		  return "neutral";
		}
		function ToolCard(props) {
		  const { t, phase, block, toolName } = props || {};
		  const [open, setOpen] = (0, import_react.useState)(false);
		  const name = typeof toolName === "string" && toolName ? toolName : block && typeof block.name === "string" && block.name ? block.name : "";
		  const titleKey = `tool.${name}`;
		  const title = hasCopy(titleKey) ? translate(t, titleKey) : translate(t, "tool.unknown");
		  const state = toolState(phase, block);
		  const summary = phase === "result" ? resultSummary(block, t) : translate(t, "result.waiting");
		  const decision = phase === "result" ? toolDecision(block) : null;
		  const expandable = phase === "result" && hasRawPayload(block);
		  const raw2 = open && expandable ? rawPayload(block) : null;
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: card, "data-trust-tool": name || void 0, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: cardHead, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: cardTitle, children: title }),
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { tone: stateTone(state), children: translate(t, `status.${state}`) }),
		      decision ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { tone: decisionTone(decision), children: decision }) : null
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: cardSummary, children: summary }),
		    expandable ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		      "button",
		      {
		        type: "button",
		        "aria-expanded": open,
		        onClick: () => setOpen((value) => !value),
		        style: linkButton,
		        children: translate(t, open ? "card.raw.hide" : "card.raw.show")
		      }
		    ) : null,
		    raw2 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("pre", { style: raw, children: raw2 }) : null
		  ] });
		}

		// src/client/overview-data.js
		var import_react2 = require("react");
		var OVERVIEW_URL = "/trust-platform/api/overview";
		var DEFAULT_POLL_INTERVAL_MS = 5e3;
		function errorMessage(error) {
		  if (error && typeof error === "object") {
		    if (typeof error.message === "string" && error.message) return error.message;
		    return String(error);
		  }
		  return String(error);
		}
		async function requestOverview(signal) {
		  if (typeof fetch !== "function") return { error: { kind: "unavailable" } };
		  let response;
		  try {
		    response = await fetch(OVERVIEW_URL, {
		      credentials: "same-origin",
		      headers: { accept: "application/json" },
		      signal: signal || void 0
		    });
		  } catch (error) {
		    if (error && (error.name === "AbortError" || error.code === "ABORT_ERR")) return { aborted: true };
		    return { error: { kind: "network", message: errorMessage(error) } };
		  }
		  if (response.status === 401 || response.status === 403) return { error: { kind: "forbidden" } };
		  if (response.status === 404) return { error: { kind: "unavailable" } };
		  if (!response.ok) return { error: { kind: "http", status: response.status } };
		  let body;
		  try {
		    body = await response.json();
		  } catch {
		    return { error: { kind: "invalid" } };
		  }
		  if (!body || typeof body !== "object" || Array.isArray(body) || body.ok !== true) {
		    return {
		      error: {
		        kind: "host",
		        code: body && typeof body.error_code === "string" ? body.error_code : "UNKNOWN",
		        message: body && typeof body.message === "string" ? body.message : ""
		      }
		    };
		  }
		  const overview = normalizeOverviewBody(body);
		  if (overview === null) return { error: { kind: "invalid" } };
		  return { data: overview };
		}
		function describeError(error, t, prefix = "overview") {
		  switch (error.kind) {
		    case "forbidden":
		      return translate(t, `${prefix}.error.forbidden`);
		    case "http":
		      return translate(t, `${prefix}.error.http`, { status: error.status });
		    case "network":
		      return translate(t, `${prefix}.error.network`, { message: error.message });
		    case "validation":
		      return translate(t, `${prefix}.error.validation`, { message: error.message || "—" });
		    case "host":
		      return translate(t, `${prefix}.error.host`, { code: error.code, message: error.message || "—" });
		    case "unavailable":
		      return translate(t, `${prefix}.unavailable`);
		    default:
		      return translate(t, `${prefix}.error.invalid`);
		  }
		}
		function useOverview(intervalMs = DEFAULT_POLL_INTERVAL_MS) {
		  const [state, setState] = (0, import_react2.useState)({ data: null, error: null, loading: false, refreshedAt: 0 });
		  const [generation, setGeneration] = (0, import_react2.useState)(0);
		  const reload = () => setGeneration((value) => value + 1);
		  (0, import_react2.useEffect)(() => {
		    let disposed = false;
		    let inFlight = false;
		    let controller = null;
		    const load = () => {
		      if (disposed || inFlight) return;
		      inFlight = true;
		      controller = typeof AbortController === "function" ? new AbortController() : null;
		      setState((previous) => ({ ...previous, loading: true }));
		      requestOverview(controller ? controller.signal : void 0).then((outcome) => {
		        if (disposed) return;
		        inFlight = false;
		        if (outcome.data) {
		          setState({ data: outcome.data, error: null, loading: false, refreshedAt: Date.now() });
		        } else if (outcome.error) {
		          setState((previous) => ({ ...previous, loading: false, error: outcome.error }));
		        } else {
		          setState((previous) => ({ ...previous, loading: false }));
		        }
		      });
		    };
		    load();
		    const timer = setInterval(load, intervalMs);
		    return () => {
		      disposed = true;
		      clearInterval(timer);
		      if (controller) controller.abort();
		    };
		  }, [generation, intervalMs]);
		  return [state, reload];
		}

		// src/client/overview.jsx
		var import_jsx_runtime3 = require("react/jsx-runtime");
		var POLL_INTERVAL_MS = 5e3;
		var MAX_RECENT_EVENTS = 10;
		function counterValue(counts2, key) {
		  if (!counts2 || typeof counts2 !== "object") return "—";
		  const value = counts2[key];
		  return typeof value === "number" && Number.isFinite(value) ? String(value) : "—";
		}
		function DecisionPill({ decision }) {
		  if (typeof decision !== "string" || !decision) return null;
		  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Badge, { tone: decisionTone(decision), children: decision });
		}
		function OverviewBody({ t }) {
		  const [state, reload] = useOverview(POLL_INTERVAL_MS);
		  const { data, error, loading, refreshedAt } = state;
		  const plugin = data && data.plugin && typeof data.plugin === "object" ? data.plugin : null;
		  const counts2 = data && data.counts && typeof data.counts === "object" ? data.counts : null;
		  const health = data && data.health && typeof data.health === "object" ? data.health : null;
		  const events = data && Array.isArray(data.recent_events) ? data.recent_events.slice(0, MAX_RECENT_EVENTS) : [];
		  const mode = plugin && typeof plugin.mode === "string" && plugin.mode ? plugin.mode : null;
		  const authoritative = Boolean(plugin && plugin.authoritative === true);
		  const source = plugin && typeof plugin.source === "string" && plugin.source ? plugin.source : null;
		  const version = plugin && typeof plugin.version === "string" && plugin.version ? plugin.version : null;
		  const healthText = health && typeof health.status === "string" && health.status ? health.status : translate(t, "overview.health.unknown");
		  const errorText = error ? describeError(error, t) : null;
		  const refreshedText = refreshedAt ? formatTime(refreshedAt) : null;
		  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { style: section, "data-trust-overview": "", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: sectionHead, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: sectionTitle, children: translate(t, "overview.title") }),
		      mode && hasCopy(`overview.mode.${mode}`) ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Badge, { tone: mode === "embedded" || mode === "control-plane" ? "ok" : "info", children: translate(t, `overview.mode.${mode}`) }) : plugin ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Badge, { tone: "neutral", children: translate(t, "overview.mode.unknown") }) : null,
		      plugin ? authoritative ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Badge, { tone: "ok", children: translate(t, "overview.authoritative") }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Badge, { tone: "warn", children: translate(t, "overview.nonAuthoritative") }) : null,
		      refreshedText ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: meta, children: translate(t, "overview.updated", { time: refreshedText }) }) : null,
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: actions, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: reload, disabled: loading, style: actionButton, children: translate(t, error ? "overview.retry" : "overview.refresh") }) })
		    ] }),
		    errorText && !data ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: errorBox, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: errorText }),
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: reload, disabled: loading, style: actionButton, children: translate(t, "overview.retry") })
		    ] }) : null,
		    !data && !errorText ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: muted, children: translate(t, "overview.loading") }) : null,
		    data ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: metaRow, children: [
		        source ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: translate(t, "overview.source", { source }) }) : null,
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
		          translate(t, "overview.health"),
		          ": ",
		          healthText
		        ] }),
		        version ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: mono, children: `v${version}` }) : null
		      ] }),
		      errorText ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: staleBox, children: translate(t, "overview.error.stale", { message: errorText }) }) : null,
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: counts, children: COUNT_KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: countCell, children: [
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: countValue, children: counterValue(counts2, key) }),
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: countLabel, children: translate(t, `overview.count.${key}`) })
		      ] }, key)) }),
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: subTitle, children: translate(t, "overview.recentEvents") }),
		      events.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: muted, children: translate(t, "overview.noEvents") }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { style: list, children: events.map((event, index) => {
		        const item = event && typeof event === "object" ? event : {};
		        const eventType2 = typeof item.event_type === "string" && item.event_type ? item.event_type : "—";
		        const actor = typeof item.actor_did === "string" && item.actor_did ? item.actor_did : "—";
		        const occurred = formatTime(item.occurred_at) || "—";
		        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { style: eventRow, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: eventType, children: eventType2 }),
		          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(DecisionPill, { decision: item.decision }),
		          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: eventActor, title: actor, children: actor }),
		          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: eventTime, children: occurred })
		        ] }, index);
		      }) })
		    ] }) : null
		  ] });
		}
		function OverviewSection(props) {
		  const { t, subject } = props || {};
		  if (!matchesPlugin(subject)) return null;
		  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(OverviewBody, { t });
		}
		function OverviewBadge(props) {
		  const { t, subject } = props || {};
		  if (!matchesPlugin(subject)) return null;
		  const pkg = subject && subject.pkg && typeof subject.pkg === "object" ? subject.pkg : null;
		  const version = pkg && typeof pkg.version === "string" && pkg.version ? pkg.version : "";
		  const label = translate(t, "overview.badge");
		  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: pluginBadge, title: label, children: version ? `${label} v${version}` : label });
		}

		// src/client/settings.jsx
		var import_react4 = require("react");

		// src/client/settings-data.js
		var SETTINGS_URL = "/trust-platform/api/settings";
		var HEALTH_URL = "/trust-platform/api/health";
		var RESET_URL = "/trust-platform/api/reset";
		var MAX_AMOUNT = 1e12;
		var POLICY_NUMBER_FIELDS = Object.freeze([
		  "singleAmountLimit",
		  "dailyAmountLimit",
		  "riskBlockThreshold",
		  "riskDeferThreshold",
		  "riskThrottleThreshold",
		  "defaultTrustScore"
		]);
		var AMOUNT_FIELDS = Object.freeze(["singleAmountLimit", "dailyAmountLimit"]);
		var RATIO_FIELDS = Object.freeze([
		  "riskBlockThreshold",
		  "riskDeferThreshold",
		  "riskThrottleThreshold",
		  "defaultTrustScore"
		]);
		function isObject2(value) {
		  return value !== null && typeof value === "object" && !Array.isArray(value);
		}
		function isNonEmptyString2(value) {
		  return typeof value === "string" && value !== "";
		}
		function errorMessage2(error) {
		  if (error && typeof error === "object") {
		    if (typeof error.message === "string" && error.message) return error.message;
		    return String(error);
		  }
		  return String(error);
		}
		async function requestJson(url, options, signal) {
		  if (typeof fetch !== "function") return { error: { kind: "unavailable" } };
		  const headers = { accept: "application/json" };
		  if (options && options.body) headers["content-type"] = "application/json";
		  let response;
		  try {
		    response = await fetch(url, {
		      method: options && options.method ? options.method : "GET",
		      credentials: "same-origin",
		      headers,
		      body: options && options.body ? options.body : void 0,
		      signal: signal || void 0
		    });
		  } catch (error) {
		    if (error && (error.name === "AbortError" || error.code === "ABORT_ERR")) return { aborted: true };
		    return { error: { kind: "network", message: errorMessage2(error) } };
		  }
		  if (response.status === 401 || response.status === 403) return { error: { kind: "forbidden" } };
		  if (response.status === 404) return { error: { kind: "unavailable" } };
		  let body = null;
		  try {
		    body = await response.json();
		  } catch {
		    body = null;
		  }
		  if (response.status === 422) {
		    const envelope = isObject2(body) ? body : {};
		    return {
		      error: {
		        kind: "validation",
		        message: typeof envelope.message === "string" ? envelope.message : "",
		        details: envelope.details === void 0 ? null : envelope.details
		      }
		    };
		  }
		  if (!response.ok) return { error: { kind: "http", status: response.status } };
		  if (!isObject2(body) || body.ok !== true) {
		    return {
		      error: {
		        kind: "host",
		        code: isObject2(body) && typeof body.error_code === "string" ? body.error_code : "UNKNOWN",
		        message: isObject2(body) && typeof body.message === "string" ? body.message : ""
		      }
		    };
		  }
		  return { data: body };
		}
		function normalizePolicy(raw2) {
		  const policy = isObject2(raw2) ? raw2 : {};
		  const result = { policyVersion: isNonEmptyString2(policy.policyVersion) ? policy.policyVersion : null };
		  for (const field of POLICY_NUMBER_FIELDS) {
		    result[field] = typeof policy[field] === "number" && Number.isFinite(policy[field]) ? policy[field] : null;
		  }
		  return result;
		}
		function normalizeSettings(raw2) {
		  const settings = isObject2(raw2) ? raw2 : {};
		  return {
		    actorDid: isNonEmptyString2(settings.actorDid) ? settings.actorDid : null,
		    allowInterventionExecution: typeof settings.allowInterventionExecution === "boolean" ? settings.allowInterventionExecution : null,
		    policy: normalizePolicy(settings.policy)
		  };
		}
		function normalizeEditable(raw2) {
		  const editable = isObject2(raw2) ? raw2 : {};
		  const policy = isObject2(editable.policy) ? editable.policy : {};
		  const editablePolicy = {};
		  for (const field of POLICY_NUMBER_FIELDS) {
		    editablePolicy[field] = policy[field] !== false;
		  }
		  editablePolicy.policyVersion = policy.policyVersion !== false;
		  return {
		    actorDid: editable.actorDid !== false,
		    allowInterventionExecution: editable.allowInterventionExecution !== false,
		    policy: editablePolicy
		  };
		}
		function normalizeSettingsPayload(body) {
		  if (!isObject2(body)) return null;
		  return {
		    mode: isNonEmptyString2(body.mode) ? body.mode : null,
		    dataDir: isNonEmptyString2(body.dataDir) ? body.dataDir : null,
		    settings: normalizeSettings(body.settings),
		    defaults: normalizeSettings(body.defaults),
		    editable: normalizeEditable(body.editable)
		  };
		}
		function normalizeHealthPayload(body) {
		  if (!isObject2(body)) return null;
		  return {
		    status: isNonEmptyString2(body.status) ? body.status : null,
		    mode: isNonEmptyString2(body.mode) ? body.mode : null,
		    engine: isNonEmptyString2(body.engine) ? body.engine : null,
		    schemaRevision: isNonEmptyString2(body.schema_revision) ? body.schema_revision : null,
		    startedAt: isNonEmptyString2(body.started_at) ? body.started_at : null
		  };
		}
		function normalizeCounts(counts2) {
		  const source = isObject2(counts2) ? counts2 : {};
		  const result = {};
		  for (const key of COUNT_KEYS) {
		    result[key] = typeof source[key] === "number" && Number.isFinite(source[key]) ? source[key] : null;
		  }
		  return result;
		}
		async function requestSettings(signal) {
		  const outcome = await requestJson(SETTINGS_URL, { method: "GET" }, signal);
		  if (!outcome.data) return outcome;
		  const data = normalizeSettingsPayload(outcome.data);
		  return data ? { data } : { error: { kind: "invalid" } };
		}
		async function requestHealth(signal) {
		  const outcome = await requestJson(HEALTH_URL, { method: "GET" }, signal);
		  if (!outcome.data) return outcome;
		  const data = normalizeHealthPayload(outcome.data);
		  return data ? { data } : { error: { kind: "invalid" } };
		}
		async function saveSettings(patch, signal) {
		  const outcome = await requestJson(
		    SETTINGS_URL,
		    { method: "PUT", body: JSON.stringify(patch && typeof patch === "object" ? patch : {}) },
		    signal
		  );
		  if (!outcome.data) return outcome;
		  const body = outcome.data;
		  if (!isObject2(body.settings)) return { error: { kind: "invalid" } };
		  return {
		    data: {
		      settings: normalizeSettings(body.settings),
		      savedAt: isNonEmptyString2(body.saved_at) ? body.saved_at : null
		    }
		  };
		}
		async function resetEngineData(signal) {
		  const outcome = await requestJson(
		    RESET_URL,
		    { method: "POST", body: JSON.stringify({ confirm: true }) },
		    signal
		  );
		  if (!outcome.data) return outcome;
		  return { data: { counts: normalizeCounts(outcome.data.counts) } };
		}
		function createDraft(settings) {
		  if (!isObject2(settings)) return null;
		  const policy = isObject2(settings.policy) ? settings.policy : {};
		  const draft = {
		    actorDid: isNonEmptyString2(settings.actorDid) ? settings.actorDid : "",
		    allowInterventionExecution: settings.allowInterventionExecution === true,
		    policyVersion: isNonEmptyString2(policy.policyVersion) ? policy.policyVersion : ""
		  };
		  for (const field of POLICY_NUMBER_FIELDS) {
		    draft[field] = typeof policy[field] === "number" && Number.isFinite(policy[field]) ? String(policy[field]) : "";
		  }
		  return draft;
		}
		function buildSettingsPatch(draft, saved) {
		  if (!isObject2(draft) || !isObject2(saved)) return null;
		  const patch = {};
		  const actorDid = typeof draft.actorDid === "string" ? draft.actorDid.trim() : "";
		  if (actorDid !== (isNonEmptyString2(saved.actorDid) ? saved.actorDid : "")) {
		    patch.actorDid = actorDid;
		  }
		  const allow = draft.allowInterventionExecution === true;
		  if (allow !== (saved.allowInterventionExecution === true)) {
		    patch.allowInterventionExecution = allow;
		  }
		  const policy = {};
		  const policyVersion = typeof draft.policyVersion === "string" ? draft.policyVersion.trim() : "";
		  if (policyVersion !== (isNonEmptyString2(saved.policy.policyVersion) ? saved.policy.policyVersion : "")) {
		    policy.policyVersion = policyVersion;
		  }
		  for (const field of POLICY_NUMBER_FIELDS) {
		    const value = Number(draft[field]);
		    if (!Number.isFinite(value)) return null;
		    if (value !== saved.policy[field]) policy[field] = value;
		  }
		  if (Object.keys(policy).length > 0) patch.policy = policy;
		  return Object.keys(patch).length > 0 ? patch : null;
		}
		function validateDraft(draft) {
		  if (!isObject2(draft)) return [{ key: "settings.error.invalidDraft" }];
		  const errors = [];
		  const actorDid = typeof draft.actorDid === "string" ? draft.actorDid.trim() : "";
		  if (actorDid.length < 3 || actorDid.length > 200) errors.push({ key: "settings.error.actorDid" });
		  const policyVersion = typeof draft.policyVersion === "string" ? draft.policyVersion.trim() : "";
		  if (policyVersion.length < 3 || policyVersion.length > 120) errors.push({ key: "settings.error.policyVersion" });
		  const values = {};
		  for (const field of POLICY_NUMBER_FIELDS) {
		    const raw2 = draft[field];
		    const value = typeof raw2 === "string" && raw2.trim() !== "" ? Number(raw2) : NaN;
		    if (!Number.isFinite(value)) {
		      errors.push({ key: "settings.error.number", params: { field } });
		      continue;
		    }
		    values[field] = value;
		    if (AMOUNT_FIELDS.includes(field) && (value <= 0 || value > MAX_AMOUNT)) {
		      errors.push({ key: "settings.error.amount", params: { field } });
		    } else if (RATIO_FIELDS.includes(field) && (value < 0 || value > 1)) {
		      errors.push({ key: "settings.error.ratio", params: { field } });
		    }
		  }
		  const block = values.riskBlockThreshold;
		  const defer = values.riskDeferThreshold;
		  const throttle = values.riskThrottleThreshold;
		  if (Number.isFinite(block) && Number.isFinite(defer) && Number.isFinite(throttle) && !(block >= defer && defer >= throttle)) {
		    errors.push({ key: "settings.error.thresholds" });
		  }
		  return errors;
		}
		function totalCount(counts2) {
		  let total = 0;
		  for (const key of COUNT_KEYS) {
		    const value = counts2 && typeof counts2[key] === "number" ? counts2[key] : 0;
		    total += value;
		  }
		  return total;
		}
		function describeDetails(details) {
		  if (details === null || details === void 0) return null;
		  if (typeof details === "string") return details;
		  try {
		    const text = JSON.stringify(details);
		    if (typeof text !== "string") return null;
		    return text.length > 200 ? `${text.slice(0, 197)}…` : text;
		  } catch {
		    return null;
		  }
		}

		// src/client/settings-store.js
		var import_react3 = require("react");
		var DEFAULT_SETTINGS_REFRESH_MS = 1e4;
		function useSettings(intervalMs = DEFAULT_SETTINGS_REFRESH_MS) {
		  const [state, setState] = (0, import_react3.useState)({
		    data: null,
		    health: null,
		    error: null,
		    healthError: null,
		    loading: false,
		    refreshedAt: 0
		  });
		  const [generation, setGeneration] = (0, import_react3.useState)(0);
		  const reload = () => setGeneration((value) => value + 1);
		  (0, import_react3.useEffect)(() => {
		    let disposed = false;
		    let inFlight = false;
		    let controller = null;
		    const load = () => {
		      if (disposed || inFlight) return;
		      inFlight = true;
		      controller = typeof AbortController === "function" ? new AbortController() : null;
		      const signal = controller ? controller.signal : void 0;
		      setState((previous) => ({ ...previous, loading: true }));
		      Promise.all([requestSettings(signal), requestHealth(signal)]).then(([settingsOutcome, healthOutcome]) => {
		        if (disposed) return;
		        inFlight = false;
		        setState((previous) => {
		          const next = { ...previous, loading: false };
		          if (healthOutcome && healthOutcome.data) next.health = healthOutcome.data;
		          else if (healthOutcome && healthOutcome.error) next.healthError = healthOutcome.error;
		          if (settingsOutcome && settingsOutcome.data) {
		            next.data = settingsOutcome.data;
		            next.error = null;
		            next.refreshedAt = Date.now();
		          } else if (settingsOutcome && settingsOutcome.error) {
		            next.error = settingsOutcome.error;
		          }
		          return next;
		        });
		      });
		    };
		    load();
		    const timer = setInterval(load, intervalMs);
		    return () => {
		      disposed = true;
		      clearInterval(timer);
		      if (controller) controller.abort();
		    };
		  }, [generation, intervalMs]);
		  return [state, reload];
		}

		// src/client/settings.jsx
		var import_jsx_runtime4 = require("react/jsx-runtime");
		var POLL_INTERVAL_MS2 = 1e4;
		var AMOUNT_FIELDS2 = /* @__PURE__ */ new Set(["singleAmountLimit", "dailyAmountLimit"]);
		function modeTone(mode) {
		  if (mode === "embedded" || mode === "control-plane") return "ok";
		  if (mode === "sandbox" || mode === "in-memory") return "info";
		  return "neutral";
		}
		function canEdit(editable, field) {
		  return !editable || editable[field] !== false;
		}
		function canEditPolicy(editable, field) {
		  return !editable || !editable.policy || editable.policy[field] !== false;
		}
		function controlStyle(base, locked) {
		  return locked ? { ...base, ...inputDisabled } : base;
		}
		function actionStyle(base, disabled) {
		  return disabled ? { ...base, ...buttonDisabled } : base;
		}
		function SettingsPanel(props) {
		  const { t } = props || {};
		  const [snapshot, reload] = useSettings(POLL_INTERVAL_MS2);
		  const { data, health, error, refreshedAt } = snapshot;
		  const server = data ? data.settings : null;
		  const defaults = data ? data.defaults : null;
		  const editable = data ? data.editable : null;
		  const [editor, setEditor] = (0, import_react4.useState)(null);
		  const [saving, setSaving] = (0, import_react4.useState)(false);
		  const [resetting, setResetting] = (0, import_react4.useState)(false);
		  const [confirmingReset, setConfirmingReset] = (0, import_react4.useState)(false);
		  const [feedback, setFeedback] = (0, import_react4.useState)(null);
		  const [actionError, setActionError] = (0, import_react4.useState)(null);
		  const draft = editor ? editor.draft : server ? createDraft(server) : null;
		  const dirty = Boolean(editor && editor.dirty);
		  (0, import_react4.useEffect)(() => {
		    if (!server) return;
		    setEditor((current) => current && current.dirty ? current : null);
		  }, [server]);
		  const clearMessages = () => {
		    setFeedback(null);
		    setActionError(null);
		  };
		  const updateField = (field, value) => {
		    setEditor((current) => {
		      const base = current ? current.draft : createDraft(server);
		      if (!base) return current;
		      return { draft: { ...base, [field]: value }, dirty: true };
		    });
		    clearMessages();
		  };
		  const cancelEdits = () => {
		    setEditor(null);
		    clearMessages();
		  };
		  const applyDefaults = () => {
		    const base = createDraft(defaults);
		    if (!base) return;
		    setEditor({ draft: base, dirty: true });
		    setActionError(null);
		    setFeedback({ tone: "info", text: translate(t, "settings.feedback.defaultsApplied") });
		  };
		  const save = () => {
		    if (!server || !draft || saving || resetting) return;
		    const errors = validateDraft(draft);
		    if (errors.length > 0) {
		      const first = errors[0];
		      setFeedback(null);
		      setActionError({ text: translate(t, first.key, first.params), details: null });
		      return;
		    }
		    const patch = buildSettingsPatch(draft, server);
		    if (!patch) {
		      setActionError(null);
		      setFeedback({ tone: "info", text: translate(t, "settings.feedback.noChanges") });
		      return;
		    }
		    setSaving(true);
		    clearMessages();
		    saveSettings(patch).then((outcome) => {
		      setSaving(false);
		      if (outcome.data) {
		        setEditor(null);
		        setFeedback({
		          tone: "ok",
		          text: translate(t, "settings.feedback.saved", { time: formatTime(outcome.data.savedAt) || "—" })
		        });
		        reload();
		      } else if (outcome.error) {
		        setActionError({
		          text: describeError(outcome.error, t, "settings"),
		          details: describeDetails(outcome.error.details)
		        });
		      }
		    });
		  };
		  const reset = () => {
		    if (saving || resetting) return;
		    setResetting(true);
		    clearMessages();
		    resetEngineData().then((outcome) => {
		      setResetting(false);
		      setConfirmingReset(false);
		      if (outcome.data) {
		        setEditor(null);
		        setFeedback({
		          tone: "ok",
		          text: translate(t, "settings.feedback.reset", { count: totalCount(outcome.data.counts) })
		        });
		        reload();
		      } else if (outcome.error) {
		        setActionError({
		          text: describeError(outcome.error, t, "settings"),
		          details: describeDetails(outcome.error.details)
		        });
		      }
		    });
		  };
		  const mode = data ? data.mode : null;
		  const modeLabel = mode && hasCopy(`settings.mode.${mode}`) ? translate(t, `settings.mode.${mode}`) : translate(t, "settings.mode.unknown");
		  const authoritative = mode === "embedded" || mode === "control-plane";
		  const healthLabel = health && health.status ? health.status : translate(t, "settings.health.unknown");
		  const errorText = error ? describeError(error, t, "settings") : null;
		  const refreshedText = refreshedAt ? formatTime(refreshedAt) : null;
		  const busy = saving || resetting;
		  const stateName = saving ? "saving" : resetting ? "resetting" : actionError ? "error" : feedback ? "saved" : data ? "ready" : errorText ? "error" : "loading";
		  const policyVersionLocked = !canEditPolicy(editable, "policyVersion");
		  const actorDidLocked = !canEdit(editable, "actorDid");
		  const interventionLocked = !canEdit(editable, "allowInterventionExecution");
		  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
		    "section",
		    {
		      style: section,
		      "data-trust-settings": "trust-platform",
		      "data-trust-state": stateName,
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: sectionHead, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: sectionTitle, children: translate(t, "settings.title") }),
		          data ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { tone: modeTone(mode), children: modeLabel }) : null,
		          data ? authoritative ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { tone: "ok", children: translate(t, "settings.authoritative") }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { tone: "warn", children: translate(t, "settings.nonAuthoritative") }) : null,
		          refreshedText ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: meta, children: translate(t, "settings.updated", { time: refreshedText }) }) : null,
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: actions, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		            "button",
		            {
		              type: "button",
		              onClick: reload,
		              disabled: busy || snapshot.loading,
		              style: actionStyle(actionButton, busy || snapshot.loading),
		              children: translate(t, errorText ? "settings.retry" : "settings.refresh")
		            }
		          ) })
		        ] }),
		        errorText && !data ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: errorBox, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: errorText }),
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", onClick: reload, disabled: busy, style: actionStyle(actionButton, busy), children: translate(t, "settings.retry") })
		        ] }) : null,
		        !data && !errorText ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: muted, children: translate(t, "settings.loading") }) : null,
		        data ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: metaRow, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
		              translate(t, "settings.mode"),
		              ": ",
		              modeLabel
		            ] }),
		            data.dataDir ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: mono, title: data.dataDir, children: [
		              translate(t, "settings.dataDir"),
		              ": ",
		              data.dataDir
		            ] }) : null,
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
		              translate(t, "settings.health"),
		              ": ",
		              healthLabel
		            ] }),
		            health && health.schemaRevision ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: mono, children: [
		              translate(t, "settings.schemaRevision"),
		              ": ",
		              health.schemaRevision
		            ] }) : null,
		            health && health.startedAt ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
		              translate(t, "settings.startedAt"),
		              ": ",
		              formatTime(health.startedAt) || health.startedAt
		            ] }) : null
		          ] }),
		          errorText ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: staleBox, children: translate(t, "settings.error.stale", { message: errorText }) }) : null,
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: subTitle, children: translate(t, "settings.form.title") }),
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: note, children: translate(t, "settings.form.hint") }),
		          draft ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: form, "data-trust-form": "settings", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: formRow, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { style: formLabel, htmlFor: "trust-platform-actor-did", children: translate(t, "settings.field.actorDid") }),
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: formControl, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                  "input",
		                  {
		                    id: "trust-platform-actor-did",
		                    type: "text",
		                    value: draft.actorDid,
		                    maxLength: 200,
		                    disabled: actorDidLocked || busy,
		                    onChange: (event) => updateField("actorDid", event.target.value),
		                    "data-trust-field": "actorDid",
		                    style: controlStyle(input, actorDidLocked || busy)
		                  }
		                ),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: hint, children: translate(t, "settings.hint.actorDid") })
		              ] })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: formRow, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { style: formLabel, htmlFor: "trust-platform-allow-intervention", children: translate(t, "settings.field.allowInterventionExecution") }),
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: formControl, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                  "input",
		                  {
		                    id: "trust-platform-allow-intervention",
		                    type: "checkbox",
		                    checked: draft.allowInterventionExecution,
		                    disabled: interventionLocked || busy,
		                    onChange: (event) => updateField("allowInterventionExecution", event.target.checked),
		                    "data-trust-field": "allowInterventionExecution",
		                    style: checkbox
		                  }
		                ),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: hint, children: translate(t, "settings.hint.intervention") })
		              ] })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: formRow, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { style: formLabel, htmlFor: "trust-platform-policy-version", children: translate(t, "settings.field.policyVersion") }),
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: formControl, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                "input",
		                {
		                  id: "trust-platform-policy-version",
		                  type: "text",
		                  value: draft.policyVersion,
		                  maxLength: 120,
		                  disabled: policyVersionLocked || busy,
		                  onChange: (event) => updateField("policyVersion", event.target.value),
		                  "data-trust-field": "policyVersion",
		                  "data-trust-policy": "policyVersion",
		                  style: controlStyle(input, policyVersionLocked || busy)
		                }
		              ) })
		            ] }),
		            POLICY_NUMBER_FIELDS.map((field) => {
		              const amount = AMOUNT_FIELDS2.has(field);
		              const locked = !canEditPolicy(editable, field) || busy;
		              return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: formRow, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { style: formLabel, htmlFor: `trust-platform-policy-${field}`, children: translate(t, `settings.field.${field}`) }),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: formControl, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                    "input",
		                    {
		                      id: `trust-platform-policy-${field}`,
		                      type: "number",
		                      inputMode: "decimal",
		                      value: draft[field],
		                      min: amount ? 1 : 0,
		                      max: amount ? MAX_AMOUNT : 1,
		                      step: amount ? 1 : 0.01,
		                      disabled: locked,
		                      onChange: (event) => updateField(field, event.target.value),
		                      "data-trust-policy": field,
		                      style: controlStyle(inputNumber, locked)
		                    }
		                  ),
		                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: hint, children: amount ? translate(t, "settings.hint.amount", { max: MAX_AMOUNT }) : translate(t, "settings.hint.ratio") })
		                ] })
		              ] }, field);
		            }),
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: note, children: translate(t, "settings.hint.thresholds") }),
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: formActions, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                "button",
		                {
		                  type: "button",
		                  onClick: save,
		                  disabled: busy || !dirty,
		                  "data-trust-action": "save",
		                  style: actionStyle(primaryButton, busy || !dirty),
		                  children: translate(t, saving ? "settings.action.saving" : "settings.action.save")
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                "button",
		                {
		                  type: "button",
		                  onClick: cancelEdits,
		                  disabled: busy || !dirty,
		                  "data-trust-action": "cancel",
		                  style: actionStyle(actionButton, busy || !dirty),
		                  children: translate(t, "settings.action.cancel")
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                "button",
		                {
		                  type: "button",
		                  onClick: applyDefaults,
		                  disabled: busy || !defaults,
		                  "data-trust-action": "apply-defaults",
		                  style: actionStyle(actionButton, busy || !defaults),
		                  children: translate(t, "settings.action.applyDefaults")
		                }
		              )
		            ] })
		          ] }) : null,
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: subTitle, children: translate(t, "settings.reset.title") }),
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: note, children: translate(t, "settings.reset.description") }),
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: formActions, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		            "button",
		            {
		              type: "button",
		              onClick: () => setConfirmingReset(true),
		              disabled: busy || confirmingReset,
		              "data-trust-action": "reset-data",
		              style: actionStyle(dangerButton, busy || confirmingReset),
		              children: translate(t, resetting ? "settings.action.resetting" : "settings.action.reset")
		            }
		          ) }),
		          confirmingReset ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: confirmBox, "data-trust-confirm": "reset", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: translate(t, "settings.reset.confirm") }),
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: actions, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                "button",
		                {
		                  type: "button",
		                  onClick: reset,
		                  disabled: resetting,
		                  "data-trust-confirm-reset": "",
		                  style: actionStyle(dangerButton, resetting),
		                  children: translate(t, resetting ? "settings.action.resetting" : "settings.action.confirmReset")
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                "button",
		                {
		                  type: "button",
		                  onClick: () => setConfirmingReset(false),
		                  disabled: resetting,
		                  "data-trust-action": "cancel-reset",
		                  style: actionStyle(actionButton, resetting),
		                  children: translate(t, "settings.action.cancelReset")
		                }
		              )
		            ] })
		          ] }) : null,
		          feedback ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		            "div",
		            {
		              style: feedback.tone === "ok" ? feedbackOk : note,
		              "data-trust-feedback": feedback.tone,
		              children: feedback.text
		            }
		          ) : null,
		          actionError ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: errorBox, "data-trust-feedback": "error", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: actionError.text }),
		            actionError.details ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: mono, children: translate(t, "settings.error.details", { details: actionError.details }) }) : null
		          ] }) : null
		        ] }) : null
		      ]
		    }
		  );
		}

		// src/client/index.jsx
		var inject = ["slots", "locale"];
		function apply(ctx) {
		  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "trust-platform: dictionaries");
		  const t = ctx.locale.bind(NS);
		  for (const key of TOOL_KEYS) {
		    ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
		      name: "tool.call.toolview",
		      key,
		      locale: NS
		    }, ToolCard));
		  }
		  ctx.slots.inject("plugins.detail.badge", () => ctx.slots.register({
		    name: "plugins.detail.badge",
		    id: "trust-platform-badge",
		    locale: NS,
		    order: 10
		  }, OverviewBadge));
		  ctx.slots.inject("plugins.detail.section", () => ctx.slots.register({
		    name: "plugins.detail.section",
		    id: "trust-platform-overview",
		    locale: NS,
		    order: 10
		  }, OverviewSection));
		  ctx.slots.inject("settings.section", () => ctx.slots.register({
		    name: "settings.section",
		    id: "trust-platform",
		    order: 55,
		    label: () => translate(t, "settings.nav"),
		    locale: NS,
		    inject: () => ({})
		  }, SettingsPanel));
		}
		return module.exports;
	}
});
