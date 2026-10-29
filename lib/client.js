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
		  PANEL_ID: () => PANEL_ID,
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
		  // Docked right-column console tab and Session-header launcher labels.
		  "panel.label": "Trust Platform",
		  "panel.desc": "Operate your agent workforce",
		  // Docked console tab and its Session-header launcher.
		  "panel.tab": "Trust Platform",
		  "panel.open": "Open Trust Platform",
		  "panel.guide": "Agent payment workspace docked beside the chat",
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
		  "settings.error.details": "Details: {details}",
		  "settings.error.export": "The state export failed.",
		  // Data management: storage facts, export and guarded reset.
		  "settings.storage.title": "Data management",
		  "settings.storage.description": "Where the embedded engine keeps its state, plus export and reset actions.",
		  "settings.storage.dataDir": "Data directory",
		  "settings.storage.stateFile": "State file",
		  "settings.storage.fileSize": "Size",
		  "settings.storage.exists": "State file present",
		  "settings.storage.missing": "State file not created yet",
		  "settings.storage.lastSavedAt": "Last saved",
		  "settings.storage.schemaVersion": "Schema revision",
		  "settings.storage.recovery": "Recovery",
		  "settings.storage.recoveryClean": "No recovery required",
		  "settings.storage.recoveryDetected": "Restored from backup",
		  "settings.storage.backupPath": "Backup file",
		  "settings.storage.writeError": "Write error: {message}",
		  "settings.storage.loading": "Loading storage details…",
		  "settings.storage.refresh": "Refresh storage",
		  "settings.storage.unavailable": "Storage details are not available in this plugin mode.",
		  "settings.action.export": "Export data",
		  "settings.action.exporting": "Exporting…",
		  "settings.reset.confirmInput": "Type RESET to enable the reset button.",
		  "settings.feedback.exported": "Exported {filename}."
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
		  // 停靠式控制台标签页与对话页签入口按钮文案。
		  "panel.label": "信任平台",
		  "panel.desc": "代理交易工作台",
		  // Dock 控制台标签页与对话页签入口按钮。
		  "panel.tab": "信任平台",
		  "panel.open": "打开信任平台",
		  "panel.guide": "固定在对话右侧的代理交易工作台",
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
		  "settings.error.details": "详情：{details}",
		  "settings.error.export": "状态数据导出失败。",
		  // 数据管理：存储信息、导出与受保护的重置。
		  "settings.storage.title": "数据管理",
		  "settings.storage.description": "内置引擎状态的存放位置，以及导出与重置操作。",
		  "settings.storage.dataDir": "数据目录",
		  "settings.storage.stateFile": "状态文件",
		  "settings.storage.fileSize": "大小",
		  "settings.storage.exists": "状态文件已创建",
		  "settings.storage.missing": "状态文件尚未创建",
		  "settings.storage.lastSavedAt": "最后保存",
		  "settings.storage.schemaVersion": "Schema 版本",
		  "settings.storage.recovery": "恢复状态",
		  "settings.storage.recoveryClean": "无需恢复",
		  "settings.storage.recoveryDetected": "已从备份恢复",
		  "settings.storage.backupPath": "备份文件",
		  "settings.storage.writeError": "写入异常：{message}",
		  "settings.storage.loading": "正在加载存储信息…",
		  "settings.storage.refresh": "刷新存储信息",
		  "settings.storage.unavailable": "当前插件模式不提供存储信息。",
		  "settings.action.export": "导出数据",
		  "settings.action.exporting": "导出中…",
		  "settings.reset.confirmInput": "输入 RESET 以启用重置按钮。",
		  "settings.feedback.exported": "已导出 {filename}。"
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
		var storageCard = {
		  marginTop: "8px",
		  padding: "10px 12px",
		  borderRadius: "8px",
		  border: "1px solid var(--dsw-color-border, rgba(127, 127, 127, 0.3))",
		  background: "var(--dsw-color-surface-subtle, rgba(127, 127, 127, 0.06))",
		  display: "flex",
		  flexDirection: "column",
		  gap: "6px"
		};
		var storageRow = {
		  display: "flex",
		  alignItems: "baseline",
		  gap: "8px",
		  flexWrap: "wrap",
		  fontSize: "12px"
		};
		var storageLabel = {
		  flex: "0 0 180px",
		  color: MUTED,
		  fontSize: "11px"
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
		      mode && hasCopy(`overview.mode.${mode}`) ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Badge, { tone: mode === "embedded" ? "ok" : "info", children: translate(t, `overview.mode.${mode}`) }) : plugin ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Badge, { tone: "neutral", children: translate(t, "overview.mode.unknown") }) : null,
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
		      events.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: muted, children: translate(t, "overview.noEvents") }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { style: list, children: events.map((event2, index) => {
		        const item = event2 && typeof event2 === "object" ? event2 : {};
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
		var STORAGE_URL = "/trust-platform/api/storage";
		var EXPORT_URL = "/trust-platform/api/export";
		var MAX_EXPORT_BYTES = 8 * 1024 * 1024;
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
		function normalizeRecovery(value) {
		  if (!isObject2(value)) return null;
		  return {
		    kind: isNonEmptyString2(value.kind) ? value.kind : null,
		    backupPath: isNonEmptyString2(value.backupPath) ? value.backupPath : null,
		    occurredAt: isNonEmptyString2(value.occurred_at) ? value.occurred_at : null
		  };
		}
		function normalizeWriteError(value) {
		  if (!isObject2(value)) return null;
		  return {
		    code: isNonEmptyString2(value.code) ? value.code : null,
		    message: isNonEmptyString2(value.message) ? value.message : null,
		    at: isNonEmptyString2(value.at) ? value.at : null
		  };
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
		function normalizeStoragePayload(body) {
		  if (!isObject2(body)) return null;
		  const source = isObject2(body.storage) ? body.storage : body;
		  return {
		    dataDir: isNonEmptyString2(source.data_dir) ? source.data_dir : null,
		    stateFile: isNonEmptyString2(source.state_file) ? source.state_file : null,
		    exists: typeof source.exists === "boolean" ? source.exists : null,
		    fileSizeBytes: typeof source.file_size_bytes === "number" && Number.isFinite(source.file_size_bytes) && source.file_size_bytes >= 0 ? source.file_size_bytes : null,
		    lastSavedAt: isNonEmptyString2(source.last_saved_at) ? source.last_saved_at : null,
		    schemaVersion: isNonEmptyString2(source.schema_version) ? source.schema_version : null,
		    recovery: normalizeRecovery(source.recovery),
		    writeError: normalizeWriteError(source.write_error)
		  };
		}
		function formatByteSize(bytes) {
		  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return null;
		  if (bytes < 1024) return `${Math.round(bytes)} B`;
		  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
		  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
		  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GiB`;
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
		async function requestStorage(signal) {
		  const outcome = await requestJson(STORAGE_URL, { method: "GET" }, signal);
		  if (!outcome.data) return outcome;
		  const data = normalizeStoragePayload(outcome.data);
		  return data ? { data } : { error: { kind: "invalid" } };
		}
		function exportFilenameFromDisposition(disposition) {
		  if (typeof disposition !== "string" || disposition === "") return null;
		  const quoted = /filename\s*=\s*"([^"]+)"/i.exec(disposition);
		  if (quoted && quoted[1]) return quoted[1];
		  const bare = /filename\s*=\s*([^\s;]+)/i.exec(disposition);
		  return bare && bare[1] ? bare[1] : null;
		}
		function defaultExportFilename(date = /* @__PURE__ */ new Date()) {
		  const moment = date instanceof Date && Number.isFinite(date.getTime()) ? date : /* @__PURE__ */ new Date();
		  const pad = (value) => String(value).padStart(2, "0");
		  const day = `${moment.getUTCFullYear()}${pad(moment.getUTCMonth() + 1)}${pad(moment.getUTCDate())}`;
		  const clock = `${pad(moment.getUTCHours())}${pad(moment.getUTCMinutes())}${pad(moment.getUTCSeconds())}`;
		  return `trust-platform-state-${day}-${clock}.json`;
		}
		async function requestExport(signal) {
		  if (typeof fetch !== "function") return { error: { kind: "unavailable" } };
		  let response;
		  try {
		    response = await fetch(EXPORT_URL, {
		      method: "GET",
		      credentials: "same-origin",
		      headers: { accept: "application/json" },
		      signal: signal || void 0
		    });
		  } catch (error) {
		    if (error && (error.name === "AbortError" || error.code === "ABORT_ERR")) return { aborted: true };
		    return { error: { kind: "network", message: errorMessage2(error) } };
		  }
		  if (!isObject2(response)) return { error: { kind: "invalid" } };
		  if (response.status === 401 || response.status === 403) return { error: { kind: "forbidden" } };
		  if (response.status === 404) return { error: { kind: "unavailable" } };
		  if (!response.ok) return { error: { kind: "http", status: response.status } };
		  let text = "";
		  try {
		    text = await response.text();
		  } catch {
		    return { error: { kind: "invalid" } };
		  }
		  if (typeof text !== "string" || text.trim() === "") return { error: { kind: "invalid" } };
		  let parsed;
		  try {
		    parsed = JSON.parse(text);
		  } catch {
		    return { error: { kind: "invalid" } };
		  }
		  if (!isObject2(parsed) || parsed.ok !== true) return { error: { kind: "invalid" } };
		  let size = 0;
		  try {
		    size = typeof TextEncoder === "function" ? new TextEncoder().encode(text).length : text.length;
		  } catch {
		    size = text.length;
		  }
		  if (size > MAX_EXPORT_BYTES) return { error: { kind: "http", status: 413 } };
		  const disposition = response.headers && typeof response.headers.get === "function" ? response.headers.get("content-disposition") : null;
		  return {
		    data: {
		      filename: exportFilenameFromDisposition(disposition) || defaultExportFilename(),
		      text
		    }
		  };
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
		    storage: null,
		    error: null,
		    healthError: null,
		    storageError: null,
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
		      Promise.all([requestSettings(signal), requestHealth(signal), requestStorage(signal)]).then(([settingsOutcome, healthOutcome, storageOutcome]) => {
		        if (disposed) return;
		        inFlight = false;
		        setState((previous) => {
		          const next = { ...previous, loading: false };
		          if (healthOutcome && healthOutcome.data) next.health = healthOutcome.data;
		          else if (healthOutcome && healthOutcome.error) next.healthError = healthOutcome.error;
		          if (storageOutcome && storageOutcome.data) {
		            next.storage = storageOutcome.data;
		            next.storageError = null;
		          } else if (storageOutcome && storageOutcome.error) {
		            next.storageError = storageOutcome.error;
		          }
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
		  if (mode === "embedded") return "ok";
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
		function saveDownload(filename, text) {
		  try {
		    if (typeof document === "undefined" || typeof Blob !== "function") return false;
		    const api = URL && (typeof URL === "function" || typeof URL === "object") ? URL : null;
		    if (!api || typeof api.createObjectURL !== "function") return false;
		    const blob = new Blob([text], { type: "application/json" });
		    const href = api.createObjectURL(blob);
		    const anchor = document.createElement("a");
		    anchor.href = href;
		    anchor.download = filename;
		    anchor.rel = "noopener";
		    if (document.body && typeof document.body.appendChild === "function") document.body.appendChild(anchor);
		    anchor.click();
		    if (typeof anchor.remove === "function") anchor.remove();
		    setTimeout(() => api.revokeObjectURL(href), 0);
		    return true;
		  } catch {
		    return false;
		  }
		}
		function SettingsPanel(props) {
		  const { t } = props || {};
		  const [snapshot, reload] = useSettings(POLL_INTERVAL_MS2);
		  const { data, health, storage, error, storageError, refreshedAt } = snapshot;
		  const server = data ? data.settings : null;
		  const defaults = data ? data.defaults : null;
		  const editable = data ? data.editable : null;
		  const [editor, setEditor] = (0, import_react4.useState)(null);
		  const [saving, setSaving] = (0, import_react4.useState)(false);
		  const [resetting, setResetting] = (0, import_react4.useState)(false);
		  const [exporting, setExporting] = (0, import_react4.useState)(false);
		  const [resetConfirm, setResetConfirm] = (0, import_react4.useState)("");
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
		    if (saving || resetting || resetConfirm.trim() !== "RESET") return;
		    setResetting(true);
		    clearMessages();
		    resetEngineData().then((outcome) => {
		      setResetting(false);
		      if (outcome.data) {
		        setEditor(null);
		        setResetConfirm("");
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
		  const exportData = () => {
		    if (exporting) return;
		    setExporting(true);
		    clearMessages();
		    requestExport().then((outcome) => {
		      setExporting(false);
		      if (outcome.data) {
		        const downloaded = saveDownload(outcome.data.filename, outcome.data.text);
		        setFeedback({
		          tone: downloaded ? "ok" : "info",
		          text: translate(t, downloaded ? "settings.feedback.exported" : "settings.error.export", {
		            filename: outcome.data.filename
		          })
		        });
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
		  const authoritative = mode === "embedded";
		  const healthLabel = health && health.status ? health.status : translate(t, "settings.health.unknown");
		  const errorText = error ? describeError(error, t, "settings") : null;
		  const storageErrorText = storageError ? describeError(storageError, t, "settings") : null;
		  const refreshedText = refreshedAt ? formatTime(refreshedAt) : null;
		  const busy = saving || resetting;
		  const resetReady = resetConfirm.trim() === "RESET";
		  const storageState = storage ? "ready" : storageErrorText ? "error" : "loading";
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
		                    onChange: (event2) => updateField("actorDid", event2.target.value),
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
		                    onChange: (event2) => updateField("allowInterventionExecution", event2.target.checked),
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
		                  onChange: (event2) => updateField("policyVersion", event2.target.value),
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
		                      onChange: (event2) => updateField(field, event2.target.value),
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
		          ] }) : null
		        ] }) : null,
		        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: subTitle, children: translate(t, "settings.storage.title") }),
		        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: note, children: translate(t, "settings.storage.description") }),
		        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: formActions, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		            "button",
		            {
		              type: "button",
		              onClick: reload,
		              disabled: busy || snapshot.loading,
		              "data-trust-action": "refresh-storage",
		              style: actionStyle(actionButton, busy || snapshot.loading),
		              children: translate(t, "settings.storage.refresh")
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		            "button",
		            {
		              type: "button",
		              onClick: exportData,
		              disabled: exporting || busy,
		              "data-trust-action": "export-data",
		              style: actionStyle(actionButton, exporting || busy),
		              children: translate(t, exporting ? "settings.action.exporting" : "settings.action.export")
		            }
		          )
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		          "div",
		          {
		            style: storageCard,
		            "data-trust-storage": "card",
		            "data-trust-storage-state": storageState,
		            children: storageState === "error" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: errorBox, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: storageErrorText }),
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", onClick: reload, disabled: busy, style: actionStyle(actionButton, busy), children: translate(t, "settings.retry") })
		            ] }) : storage ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: storageRow, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: storageLabel, children: translate(t, "settings.storage.dataDir") }),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: mono, children: storage.dataDir || "—" })
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: storageRow, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: storageLabel, children: translate(t, "settings.storage.stateFile") }),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: mono, children: storage.stateFile || "—" })
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: storageRow, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: storageLabel, children: translate(t, "settings.storage.fileSize") }),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: formatByteSize(storage.fileSizeBytes) || "—" })
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: storageRow, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: storageLabel, children: translate(t, "settings.storage.exists") }),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: translate(t, storage.exists === false ? "settings.storage.missing" : "settings.storage.exists") })
		              ] }),
		              storage.lastSavedAt ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: storageRow, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: storageLabel, children: translate(t, "settings.storage.lastSavedAt") }),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: formatTime(storage.lastSavedAt) || storage.lastSavedAt })
		              ] }) : null,
		              storage.schemaVersion ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: storageRow, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: storageLabel, children: translate(t, "settings.storage.schemaVersion") }),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: mono, children: storage.schemaVersion })
		              ] }) : null,
		              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: storageRow, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: storageLabel, children: translate(t, "settings.storage.recovery") }),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: storage.recovery ? [
		                  storage.recovery.kind || translate(t, "settings.storage.recoveryDetected"),
		                  storage.recovery.occurredAt ? formatTime(storage.recovery.occurredAt) || storage.recovery.occurredAt : null
		                ].filter(Boolean).join(" · ") : translate(t, "settings.storage.recoveryClean") })
		              ] }),
		              storage.recovery && storage.recovery.backupPath ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: storageRow, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: storageLabel, children: translate(t, "settings.storage.backupPath") }),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: mono, children: storage.recovery.backupPath })
		              ] }) : null,
		              storage.writeError ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: confirmBox, "data-trust-storage-warning": "write_error", children: [
		                translate(t, "settings.storage.writeError", {
		                  message: storage.writeError.message || storage.writeError.code || ""
		                }),
		                storage.writeError.at ? ` · ${formatTime(storage.writeError.at) || storage.writeError.at}` : ""
		              ] }) : null
		            ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: muted, children: translate(t, "settings.storage.loading") })
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: subTitle, children: translate(t, "settings.reset.title") }),
		        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: note, children: translate(t, "settings.reset.description") }),
		        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: formActions, "data-trust-confirm": "reset", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		            "input",
		            {
		              type: "text",
		              value: resetConfirm,
		              placeholder: "RESET",
		              "aria-label": translate(t, "settings.reset.confirmInput"),
		              disabled: busy,
		              onChange: (event2) => setResetConfirm(event2.target.value),
		              "data-trust-reset-input": "confirm",
		              style: controlStyle(input, busy)
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: hint, children: translate(t, "settings.reset.confirmInput") }),
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		            "button",
		            {
		              type: "button",
		              onClick: reset,
		              disabled: busy || !resetReady,
		              "data-trust-action": "reset",
		              style: actionStyle(dangerButton, busy || !resetReady),
		              children: translate(t, resetting ? "settings.action.resetting" : "settings.action.reset")
		            }
		          )
		        ] }),
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
		      ]
		    }
		  );
		}

		// src/client/product/ui/primitives.jsx
		var import_react6 = require("react");

		// src/client/product/ui/icons.jsx
		var import_react5 = require("react");
		var PATHS = {
		  dashboard: ["M4 13h6V4H4v9Z", "M14 20h6v-9h-6v9Z", "M4 20h6v-4H4v4Z", "M14 7h6V4h-6v3Z"],
		  shield: ["M12 3 5 6v5c0 4.4 2.9 8.3 7 9.5 4.1-1.2 7-5.1 7-9.5V6l-7-3Z", "m9 12 2 2 4-4"],
		  check: ["M20 6 9 17l-5-5"],
		  checkCircle: ["M21 11.1V12a9 9 0 1 1-5.3-8.2", "M21 4 12 13l-3-3"],
		  x: ["M18 6 6 18", "m6 6 12 12"],
		  xCircle: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "m9 9 6 6", "m15 9-6 6"],
		  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3 2"],
		  arrowRight: ["M4 12h16", "m14 6 6 6-6 6"],
		  arrowUpRight: ["M7 17 17 7", "M8 7h9v9"],
		  arrowLeft: ["M20 12H4", "m10 6-6 6 6 6"],
		  chevronRight: ["m9 6 6 6-6 6"],
		  chevronDown: ["m6 9 6 6 6-6"],
		  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "m21 21-4.3-4.3"],
		  refresh: ["M20 11a8 8 0 0 0-14.9-3M4 4v4h4", "M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"],
		  download: ["M12 3v12", "m7 10 5 5 5-5", "M4 21h16"],
		  plus: ["M12 5v14", "M5 12h14"],
		  bell: ["M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8", "M10.3 21a2 2 0 0 0 3.4 0"],
		  settings: ["M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c.2.6.7 1 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z"],
		  lock: ["M6 11h12v10H6V11Z", "M8 11V7a4 4 0 0 1 8 0v4"],
		  key: ["M21 3 11 13", "m8 18 2 2", "M11 13l-2-2", "M7 14a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"],
		  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4 21a8 8 0 0 1 16 0"],
		  users: ["M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M22 21v-1a4 4 0 0 0-3-3.9", "M16 3.1a4 4 0 0 1 0 7.8"],
		  building: ["M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16", "M16 9h2a2 2 0 0 1 2 2v10", "M2 21h20", "M8 7h4", "M8 11h4", "M8 15h4"],
		  wallet: ["M20 7H5a2 2 0 0 1 0-4h13v4", "M3 5v14a2 2 0 0 0 2 2h15V7", "M17 14h.01"],
		  card: ["M3 6h18v12H3V6Z", "M3 10h18"],
		  package: ["M21 8 12 3 3 8v8l9 5 9-5V8Z", "m3 8 9 5 9-5", "M12 13v8"],
		  branch: ["M6 4v12a4 4 0 0 0 4 4h4", "M18 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M6 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
		  activity: ["M3 12h4l3-8 4 16 3-8h4"],
		  alert: ["M12 3 2 21h20L12 3Z", "M12 10v5", "M12 18.5h.01"],
		  info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 11v6", "M12 7h.01"],
		  layers: ["m12 3 9 5-9 5-9-5 9-5Z", "m3 13 9 5 9-5", "m3 18 9 5 9-5"],
		  fileText: ["M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z", "M14 3v6h6", "M9 13h6", "M9 17h6"],
		  book: ["M4 5a3 3 0 0 1 3-3h13v18H7a3 3 0 0 0-3 3V5Z", "M4 19a3 3 0 0 0 3 3h13"],
		  scale: ["M12 3v18", "M3 7h18", "m6 7-3 7h6L6 7Z", "m18 7-3 7h6l-3-7Z", "M8 21h8"],
		  chart: ["M3 3v18h18", "m7 15 4-5 3 3 5-7"],
		  trendUp: ["m3 17 6-6 4 4 8-8", "M17 7h4v4"],
		  filter: ["M3 5h18l-7 8v6l-4 2v-8L3 5Z"],
		  more: ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
		  trash: ["M4 7h16", "M10 11v6", "M14 11v6", "M6 7l1 14h10l1-14", "M9 7V4h6v3"],
		  external: ["M14 4h6v6", "M20 4 10 14", "M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"],
		  sparkles: ["m12 3 1.8 4.8L18.5 9.5 14 11.6 12 16l-1.9-4.4L5.5 9.5l4.5-1.7L12 3Z", "M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8L19 15Z"],
		  sliders: ["M4 21v-7", "M4 10V3", "M12 21v-9", "M12 8V3", "M20 21v-5", "M20 12V3", "M1 14h6", "M9 8h6", "M17 16h6"],
		  globe: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M3 12h18", "M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"],
		  send: ["m22 2-7 20-4-9-9-4 20-7Z", "M22 2 11 13"],
		  database: ["M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3Z", "M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5", "M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"],
		  play: ["M7 4v16l13-8L7 4Z"],
		  pause: ["M6 4h4v16H6V4Z", "M14 4h4v16h-4V4Z"],
		  flag: ["M4 21V4", "M4 4h12l-2 4 2 4H4"],
		  circleDot: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
		  link: ["M9 15 15 9", "M11 6l1-1a4 4 0 0 1 6 6l-1 1", "M13 18l-1 1a4 4 0 0 1-6-6l1-1"],
		  eye: ["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"]
		};
		function Icon({ name, size = 16, strokeWidth = 1.8, style }) {
		  const paths = PATHS[name] || PATHS.circleDot;
		  return (0, import_react5.createElement)("svg", {
		    width: size,
		    height: size,
		    viewBox: "0 0 24 24",
		    fill: "none",
		    stroke: "currentColor",
		    strokeWidth,
		    strokeLinecap: "round",
		    strokeLinejoin: "round",
		    "aria-hidden": "true",
		    focusable: "false",
		    style: { display: "block", flex: "none", ...style }
		  }, paths.map((d, index) => (0, import_react5.createElement)("path", { key: index, d })));
		}

		// src/client/product/ui/format.js
		var CURRENCY_SYMBOL = { USD: "$", CNY: "¥", EUR: "€", HKD: "HK$", GBP: "£" };
		function fmtMoney(amount, currency = "USD") {
		  const value = Number(amount) || 0;
		  const digits = Math.abs(value) >= 1e3 ? 0 : 2;
		  const symbol = CURRENCY_SYMBOL[currency];
		  const body = value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
		  if (symbol) return `${symbol}${body}`;
		  return `${body} ${currency}`;
		}
		function fmtNum(value, digits = 0) {
		  return (Number(value) || 0).toLocaleString("en-US", {
		    minimumFractionDigits: digits,
		    maximumFractionDigits: digits
		  });
		}
		function fmtPct(ratio, digits = 1) {
		  return `${((Number(ratio) || 0) * 100).toFixed(digits)}%`;
		}
		function fmtDateTime(iso) {
		  if (!iso) return "—";
		  const date = new Date(iso);
		  if (Number.isNaN(date.getTime())) return "—";
		  const pad = (n) => String(n).padStart(2, "0");
		  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
		}
		function fmtDate(iso) {
		  if (!iso) return "—";
		  const date = new Date(iso);
		  if (Number.isNaN(date.getTime())) return "—";
		  const pad = (n) => String(n).padStart(2, "0");
		  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
		}
		function fmtRelative(iso) {
		  if (!iso) return "—";
		  const then = new Date(iso).getTime();
		  if (Number.isNaN(then)) return "—";
		  const diff = Date.now() - then;
		  const minute = 60 * 1e3;
		  const hour = 60 * minute;
		  const day = 24 * hour;
		  if (diff < 0) {
		    const ahead2 = -diff;
		    if (ahead2 < hour) return `${Math.round(ahead2 / minute)} 分钟后`;
		    if (ahead2 < day) return `${Math.round(ahead2 / hour)} 小时后`;
		    return fmtDate(iso);
		  }
		  if (diff < minute) return "刚刚";
		  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
		  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
		  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
		  return fmtDate(iso);
		}
		function fmtCountdown(iso) {
		  const target = new Date(iso).getTime();
		  if (Number.isNaN(target)) return "—";
		  const diff = target - Date.now();
		  if (diff <= 0) return "已超时";
		  const minute = 60 * 1e3;
		  const hour = 60 * minute;
		  if (diff < hour) return `${Math.max(1, Math.ceil(diff / minute))} 分钟`;
		  if (diff < 24 * hour) return `${Math.ceil(diff / hour)} 小时`;
		  return `${Math.ceil(diff / (24 * hour))} 天`;
		}
		function initials(name) {
		  const text = String(name || "").trim();
		  if (!text) return "—";
		  if (/^[\x00-\x7F]+$/.test(text)) {
		    return text.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
		  }
		  return text.slice(0, 2);
		}
		var AVATAR_COLORS = ["#0a6cff", "#6a5cff", "#1f9d63", "#b36b00", "#d92d20", "#0b8f9a", "#8e44ad", "#c2560a"];
		function avatarColor(seed) {
		  let hash = 0;
		  const text = String(seed || "");
		  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) % 1e5;
		  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
		}
		var TASK_STATUS = {
		  CREATED: { label: "已创建", tone: "neutral" },
		  AUTHORIZED: { label: "已授权", tone: "info" },
		  DELEGATING: { label: "委托中", tone: "neutral" },
		  QUOTING: { label: "询价中", tone: "neutral" },
		  SELECTED: { label: "已选供应商", tone: "neutral" },
		  PAYREQ_PENDING: { label: "待付款申请", tone: "warn" },
		  SUBMITTED: { label: "已提交", tone: "warn" },
		  CONFIRMED: { label: "已确认", tone: "info" },
		  AUDITED: { label: "已审计", tone: "info" },
		  CLOSED: { label: "已完成", tone: "success" },
		  FAILED: { label: "已失败", tone: "danger" },
		  CANCELLED: { label: "已取消", tone: "neutral" }
		};
		var INTERVENTION_STATUS = {
		  PENDING: { label: "待处理", tone: "warn" },
		  APPROVED: { label: "已通过", tone: "success" },
		  DENIED: { label: "已拒绝", tone: "danger" },
		  EXPIRED: { label: "已超时", tone: "neutral" }
		};
		var RISK_DECISION = {
		  ALLOW: { label: "放行", tone: "success" },
		  THROTTLE: { label: "限流", tone: "info" },
		  DEFER: { label: "转人工", tone: "warn" },
		  BLOCK: { label: "拦截", tone: "danger" }
		};
		var CREDENTIAL_STATUS = {
		  ACTIVE: { label: "有效", tone: "success" },
		  SUSPENDED: { label: "已暂停", tone: "warn" },
		  REVOKED: { label: "已吊销", tone: "danger" },
		  EXPIRED: { label: "已过期", tone: "neutral" }
		};
		var DID_STATUS = {
		  ACTIVE: { label: "在册", tone: "success" },
		  SUSPENDED: { label: "已暂停", tone: "warn" },
		  REVOKED: { label: "已注销", tone: "danger" }
		};
		var DELEGATION_STATUS = {
		  ACTIVE: { label: "生效中", tone: "success" },
		  REVOKED: { label: "已撤销", tone: "danger" },
		  EXPIRED: { label: "已过期", tone: "neutral" }
		};
		var CASE_STATUS = {
		  OPEN: { label: "处理中", tone: "warn" },
		  RESOLVED: { label: "已结案", tone: "success" },
		  ESCALATED: { label: "已升级", tone: "danger" }
		};
		var FINALITY = {
		  PENDING: { label: "待结算", tone: "warn" },
		  CONFIRMED: { label: "已确认", tone: "info" },
		  FINAL: { label: "已终局", tone: "success" }
		};
		var VERIFICATION = {
		  VALID: { label: "校验通过", tone: "success" },
		  INVALID: { label: "校验失败", tone: "danger" },
		  UNKNOWN: { label: "未校验", tone: "neutral" }
		};
		var EVIDENCE_KIND = {
		  identity: "主体身份",
		  credential: "凭证签发",
		  delegation: "委托授权",
		  authorization: "付款授权",
		  risk: "风险决策",
		  settlement: "结算凭证",
		  audit: "审计事件"
		};
		var POLICY_STATUS = {
		  PUBLISHED: { label: "已发布", tone: "success" },
		  DRAFT: { label: "草稿", tone: "neutral" },
		  RETIRED: { label: "已退役", tone: "neutral" }
		};
		var REPORT_STATUS = {
		  READY: { label: "可下载", tone: "success" },
		  GENERATING: { label: "生成中", tone: "info" },
		  FAILED: { label: "生成失败", tone: "danger" }
		};
		function riskBand(score) {
		  const value = Number(score) || 0;
		  if (value >= 0.8) return { label: "高风险", tone: "danger" };
		  if (value >= 0.6) return { label: "中高风险", tone: "warn" };
		  if (value >= 0.4) return { label: "中等风险", tone: "warn" };
		  return { label: "低风险", tone: "success" };
		}
		function shortId(value, head = 10, tail = 4) {
		  const text = String(value || "");
		  if (text.length <= head + tail + 1) return text;
		  return `${text.slice(0, head)}…${text.slice(-tail)}`;
		}

		// src/client/product/ui/primitives.jsx
		var import_jsx_runtime5 = require("react/jsx-runtime");
		function Button({ children, variant = "default", size = "md", icon, onClick, disabled, type = "button", title, style }) {
		  const classes = ["tp-btn"];
		  if (variant === "primary") classes.push("tp-btn-primary");
		  else if (variant === "danger") classes.push("tp-btn-danger");
		  else if (variant === "ghost") classes.push("tp-btn-ghost");
		  if (size === "sm") classes.push("tp-btn-sm");
		  if (size === "lg") classes.push("tp-btn-lg");
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { type, className: classes.join(" "), onClick, disabled, title, style, children: [
		    icon ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: icon, size: size === "sm" ? 13 : 15 }) : null,
		    children
		  ] });
		}
		function IconButton({ name, label, onClick, disabled }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", className: "tp-icon-btn", "aria-label": label, title: label, onClick, disabled, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name, size: 16 }) });
		}
		function Card({ children, title, desc, actions: actions2, className = "", flat = false, style }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: `tp-card${flat ? " tp-card-flat" : ""} ${className}`.trim(), style, children: [
		    title || desc || actions2 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("header", { className: "tp-card-head", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { minWidth: 0 }, children: [
		        title ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-card-title", children: title }) : null,
		        desc ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-card-desc", children: desc }) : null
		      ] }),
		      actions2 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-card-actions", children: actions2 }) : null
		    ] }) : null,
		    children
		  ] });
		}
		function PageHead({ title, desc, actions: actions2 }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("header", { className: "tp-page-head", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tp-page-head-text", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h1", { className: "tp-page-title", children: title }),
		      desc ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "tp-page-desc", children: desc }) : null
		    ] }),
		    actions2 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-page-actions", children: actions2 }) : null
		  ] });
		}
		function StatCard({ label, value, unit, delta, deltaTone = "up", foot, icon, iconTone }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Card, { flat: true, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tp-stat", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
		      icon ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: {
		        width: 26,
		        height: 26,
		        borderRadius: 8,
		        display: "grid",
		        placeItems: "center",
		        background: `color-mix(in srgb, ${iconTone || "var(--tp-accent)"} 12%, transparent)`,
		        color: iconTone || "var(--tp-accent)"
		      }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: icon, size: 14 }) }) : null,
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tp-stat-label", children: label })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tp-stat-value", children: [
		      value,
		      unit ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tp-stat-unit", children: unit }) : null
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
		      delta ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: `tp-stat-delta ${deltaTone}`, children: [
		        deltaTone === "down" ? "▾" : "▴",
		        " ",
		        delta
		      ] }) : null,
		      foot ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tp-stat-foot", children: foot }) : null
		    ] })
		  ] }) });
		}
		function Tag({ children, tone = "neutral", dot = false, style }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: `tp-tag ${tone}`, style, children: [
		    dot ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tp-tag-dot" }) : null,
		    children
		  ] });
		}
		function StatusTag({ map, status }) {
		  const entry = map[status] || { label: status || "未知", tone: "neutral" };
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Tag, { tone: entry.tone, dot: true, children: entry.label });
		}
		function Avatar({ name, seed, size = "md", style }) {
		  const classes = ["tp-avatar"];
		  if (size === "sm") classes.push("tp-avatar-sm");
		  if (size === "lg") classes.push("tp-avatar-lg");
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: classes.join(" "), style: { background: avatarColor(seed || name), ...style }, "aria-hidden": "true", children: initials(name) });
		}
		function SearchInput({ value, onChange, placeholder = "搜索" }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "tp-search", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: "search", size: 14 }),
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		      "input",
		      {
		        value,
		        placeholder,
		        "aria-label": placeholder,
		        onChange: (event2) => onChange(event2.target.value)
		      }
		    )
		  ] });
		}
		function Segmented({ options, value, onChange }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-seg", role: "group", children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		    "button",
		    {
		      type: "button",
		      "aria-pressed": option.value === value,
		      onClick: () => onChange(option.value),
		      children: [
		        option.label,
		        typeof option.count === "number" ? ` ${option.count}` : ""
		      ]
		    },
		    option.value
		  )) });
		}
		function Select({ value, onChange, options, label }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("select", { className: "tp-select", value, "aria-label": label || "筛选", onChange: (event2) => onChange(event2.target.value), children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: option.value, children: option.label }, option.value)) });
		}
		function EmptyState({ icon = "layers", title, desc, action }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tp-empty", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tp-empty-icon", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: icon, size: 22 }) }),
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-empty-title", children: title }),
		    desc ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-empty-desc", children: desc }) : null,
		    action
		  ] });
		}
		function Drawer({ open, onClose, title, subtitle, children, footer, width }) {
		  (0, import_react6.useEffect)(() => {
		    if (!open) return void 0;
		    const onKey = (event2) => {
		      if (event2.key === "Escape") onClose();
		    };
		    document.addEventListener("keydown", onKey);
		    return () => document.removeEventListener("keydown", onKey);
		  }, [open, onClose]);
		  if (!open) return null;
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-drawer-mask", onClick: onClose, role: "presentation" }),
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("aside", { className: "tp-drawer", style: width ? { width } : void 0, role: "dialog", "aria-modal": "true", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("header", { className: "tp-drawer-head", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-card-title", children: title }),
		          subtitle ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-card-desc", children: subtitle }) : null
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(IconButton, { name: "x", label: "关闭", onClick: onClose })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-drawer-body", children }),
		      footer ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("footer", { className: "tp-drawer-foot", children: footer }) : null
		    ] })
		  ] });
		}
		function Modal({ open, onClose, title, children, footer }) {
		  (0, import_react6.useEffect)(() => {
		    if (!open) return void 0;
		    const handleKeyDown = (event2) => {
		      if (event2.key === "Escape") onClose?.();
		    };
		    window.addEventListener("keydown", handleKeyDown);
		    return () => window.removeEventListener("keydown", handleKeyDown);
		  }, [open, onClose]);
		  if (!open) return null;
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-modal-mask", onClick: onClose, role: "presentation", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tp-modal", role: "dialog", "aria-modal": "true", onClick: (event2) => event2.stopPropagation(), children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("header", { className: "tp-modal-head", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-card-title", style: { flex: 1 }, children: title }),
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(IconButton, { name: "x", label: "关闭", onClick: onClose })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-modal-body", children }),
		    footer ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("footer", { className: "tp-modal-foot", children: footer }) : null
		  ] }) });
		}
		function KV({ items }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("dl", { className: "tp-kv", children: items.filter((item) => item && item.v !== void 0 && item.v !== null && item.v !== "").map((item) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "contents" }, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("dt", { children: item.k }),
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("dd", { children: item.v })
		  ] }, item.k)) });
		}
		function Timeline({ items }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-timeline", children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tp-timeline-item", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: `tp-timeline-node ${item.tone || ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: item.icon || "circleDot", size: 11, strokeWidth: 2 }) }),
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tp-timeline-main", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-timeline-title", children: item.title }),
		      item.meta ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-timeline-meta", children: item.meta }) : null,
		      item.body ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-timeline-body", children: item.body }) : null
		    ] })
		  ] }, item.key || index)) });
		}
		function Progress({ value, tone = "" }) {
		  const pct = Math.max(0, Math.min(1, Number(value) || 0)) * 100;
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-progress", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: `tp-progress-fill ${tone}`, style: { width: `${pct}%` } }) });
		}
		function Bars({ items, height = 84 }) {
		  const max = Math.max(1, ...items.map((item) => Number(item.value) || 0));
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-bars", style: { height }, children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tp-bars-col", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		      "div",
		      {
		        className: `tp-bars-bar ${item.tone || ""}`,
		        title: `${item.label}: ${item.value}`,
		        style: { height: `${Math.max(4, Number(item.value) / max * (height - 26))}px` }
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tp-bars-label", children: item.label })
		  ] }, item.label)) });
		}
		function Donut({ segments, size = 108, thickness = 12, center }) {
		  const total = segments.reduce((sum, segment) => sum + (Number(segment.value) || 0), 0) || 1;
		  const radius = (size - thickness) / 2;
		  const circumference = 2 * Math.PI * radius;
		  let offset = 0;
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { position: "relative", width: size, height: size, flex: "none" }, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, "aria-hidden": "true", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "var(--tp-surface-3)", strokeWidth: thickness }),
		      segments.map((segment) => {
		        const fraction = (Number(segment.value) || 0) / total;
		        const dash = fraction * circumference;
		        const element = /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		          "circle",
		          {
		            cx: size / 2,
		            cy: size / 2,
		            r: radius,
		            fill: "none",
		            stroke: segment.color,
		            strokeWidth: thickness,
		            strokeDasharray: `${dash} ${circumference - dash}`,
		            strokeDashoffset: -offset,
		            strokeLinecap: "round",
		            transform: `rotate(-90 ${size / 2} ${size / 2})`
		          },
		          segment.label
		        );
		        offset += dash;
		        return element;
		      })
		    ] }),
		    center ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }, children: center }) : null
		  ] });
		}
		function Legend({ items }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 7 }, children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12 }, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { width: 8, height: 8, borderRadius: 3, background: item.color, flex: "none" } }),
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tp-muted", style: { flex: 1 }, children: item.label }),
		    item.value !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tp-strong tp-num", children: item.value }) : null
		  ] }, item.label)) });
		}
		function Field({ label, hint: hint2, children }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "tp-field", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tp-field-label", children: label }),
		    children,
		    hint2 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tp-field-hint", children: hint2 }) : null
		  ] });
		}
		function Copyable({ children, label }) {
		  const [copied, setCopied] = (0, import_react6.useState)(false);
		  const timer = (0, import_react6.useRef)(null);
		  const copy = (0, import_react6.useCallback)(() => {
		    try {
		      void navigator.clipboard?.writeText(String(children));
		    } catch {
		    }
		    setCopied(true);
		    if (timer.current) clearTimeout(timer.current);
		    timer.current = setTimeout(() => setCopied(false), 1400);
		  }, [children]);
		  (0, import_react6.useEffect)(() => () => {
		    if (timer.current) clearTimeout(timer.current);
		  }, []);
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		    "button",
		    {
		      type: "button",
		      className: "tp-btn tp-btn-ghost tp-btn-sm",
		      onClick: copy,
		      title: label || "复制",
		      style: { marginLeft: "auto", flex: "none" },
		      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tp-mono", children: copied ? "已复制" : children })
		    }
		  );
		}
		var ToastContext = (0, import_react6.createContext)(null);
		function ToastProvider({ children }) {
		  const [toasts, setToasts] = (0, import_react6.useState)([]);
		  const push = (0, import_react6.useCallback)((message, tone = "success") => {
		    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
		    setToasts((current) => [...current, { id, message, tone }]);
		    setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3200);
		  }, []);
		  const value = (0, import_react6.useMemo)(() => ({ push }), [push]);
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(ToastContext.Provider, { value, children: [
		    children,
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tp-toast-stack", "aria-live": "polite", children: toasts.map((toast) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: `tp-toast ${toast.tone}`, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tp-toast-icon", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: toast.tone === "error" ? "alert" : toast.tone === "info" ? "info" : "checkCircle", size: 15 }) }),
		      toast.message
		    ] }, toast.id)) })
		  ] });
		}
		function useToast() {
		  const context = (0, import_react6.useContext)(ToastContext);
		  return context || { push: () => {
		  } };
		}

		// src/client/product/ui/styles.js
		var STYLE_ID = "dsh-trust-platform-product-styles";
		var CSS = `
		.tp-root,
		.tp-panel-root {
		  --tp-bg: var(--dsw-alias-bg-base, #f5f5f7);
		  --tp-surface: var(--dsw-alias-bg-layer-1, #ffffff);
		  --tp-surface-2: var(--dsw-alias-bg-layer-2, #fbfbfd);
		  --tp-surface-3: var(--dsw-alias-bg-layer-3, #f2f2f7);
		  --tp-text: var(--dsw-alias-label-primary, #1d1d1f);
		  --tp-text-2: var(--dsw-alias-label-secondary, #6e6e73);
		  --tp-text-3: var(--dsw-alias-label-tertiary, #8e8e93);
		  --tp-border: var(--dsw-alias-border-l2, rgba(60, 60, 67, 0.12));
		  --tp-border-soft: var(--dsw-alias-border-l1, rgba(60, 60, 67, 0.08));
		  --tp-accent: var(--dsw-alias-brand-primary, #0a6cff);
		  --tp-accent-soft: rgba(10, 108, 255, 0.10);
		  --tp-hover: var(--dsw-alias-interactive-bg-hover, rgba(120, 120, 128, 0.08));
		  --tp-success: #1f9d63;
		  --tp-success-soft: rgba(31, 157, 99, 0.12);
		  --tp-warn: #b36b00;
		  --tp-warn-soft: rgba(214, 133, 12, 0.14);
		  --tp-danger: #d92d20;
		  --tp-danger-soft: rgba(217, 45, 32, 0.10);
		  --tp-info: #0a6cff;
		  --tp-info-soft: rgba(10, 108, 255, 0.10);
		  --tp-radius-xl: 18px;
		  --tp-radius-lg: 14px;
		  --tp-radius-md: 10px;
		  --tp-radius-sm: 7px;
		  --tp-shadow-card: 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.04);
		  --tp-shadow-pop: 0 12px 40px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08);
		  --tp-font: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", sans-serif);
		}

		.tp-root,
		.tp-panel-root {
		  display: flex;
		  flex-direction: column;
		  overflow: hidden;
		  background: var(--tp-bg);
		  color: var(--tp-text);
		  font-family: var(--tp-font);
		  font-size: 13px;
		  line-height: 1.5;
		  -webkit-font-smoothing: antialiased;
		}

		.tp-root { position: absolute; inset: 0; }

		/* The docked console fills whatever width DSH gives its right column; the
		   container query below compacts the chrome on narrow columns. */
		.tp-panel-root {
		  position: relative;
		  flex: 1 1 auto;
		  min-width: 0;
		  min-height: 0;
		  height: 100%;
		  container-type: inline-size;
		}
		.tp-panel-root .tp-shell { flex: 1; min-height: 0; }

		.tp-root *, .tp-root *::before, .tp-root *::after,
		.tp-panel-root *, .tp-panel-root *::before, .tp-panel-root *::after { box-sizing: border-box; }

		/* ---------- shell ---------- */
		.tp-shell { flex: 1; display: flex; min-height: 0; }
		.tp-nav {
		  width: 224px;
		  flex: none;
		  display: flex;
		  flex-direction: column;
		  gap: 2px;
		  padding: 14px 10px 12px;
		  border-right: 1px solid var(--tp-border-soft);
		  background: color-mix(in srgb, var(--tp-surface-2) 72%, transparent);
		  overflow-y: auto;
		}
		.tp-nav-brand { display: flex; align-items: center; gap: 10px; padding: 4px 10px 14px; }
		.tp-nav-brand-mark {
		  width: 28px; height: 28px; border-radius: 9px;
		  display: grid; place-items: center;
		  color: #fff;
		  background: linear-gradient(135deg, #0a6cff, #7b5cff);
		  box-shadow: 0 4px 12px rgba(10, 108, 255, 0.3);
		}
		.tp-nav-brand-name { font-size: 14px; font-weight: 700; letter-spacing: 0.2px; }
		.tp-nav-brand-sub { font-size: 11px; color: var(--tp-text-3); font-weight: 500; }
		.tp-nav-group { padding: 12px 10px 6px; font-size: 11px; font-weight: 600; color: var(--tp-text-3); letter-spacing: 0.4px; }
		.tp-nav-item {
		  display: flex; align-items: center; gap: 10px;
		  height: 34px; padding: 0 10px;
		  border: 0; border-radius: var(--tp-radius-md);
		  background: transparent; color: var(--tp-text-2);
		  font: inherit; font-size: 13px; font-weight: 500; text-align: left;
		  cursor: pointer; width: 100%;
		}
		.tp-nav-item:hover { background: var(--tp-hover); color: var(--tp-text); }
		.tp-nav-item[aria-current="page"] { background: var(--tp-accent-soft); color: var(--tp-accent); font-weight: 600; }
		.tp-nav-item .tp-nav-badge {
		  margin-left: auto; min-width: 18px; height: 18px; padding: 0 5px;
		  border-radius: 9px; font-size: 11px; font-weight: 600; line-height: 18px;
		  text-align: center; color: #fff; background: var(--tp-danger);
		}
		.tp-nav-item .tp-nav-count { margin-left: auto; font-size: 12px; color: var(--tp-text-3); font-variant-numeric: tabular-nums; }
		.tp-nav-foot { margin-top: auto; padding: 10px 4px 0; border-top: 1px solid var(--tp-border-soft); }
		.tp-nav-mode { display: flex; align-items: center; gap: 6px; padding: 6px 10px; font-size: 11px; color: var(--tp-text-3); }
		.tp-nav-mode-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--tp-success); }

		.tp-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
		.tp-topbar {
		  position: relative; z-index: 20;
		  height: 58px; flex: none;
		  display: flex; align-items: center; gap: 12px;
		  padding: 0 22px;
		  border-bottom: 1px solid var(--tp-border-soft);
		  background: color-mix(in srgb, var(--tp-surface) 86%, transparent);
		  backdrop-filter: saturate(180%) blur(16px);
		}
		.tp-topbar-title { font-size: 16px; font-weight: 700; letter-spacing: -0.2px; }
		.tp-topbar-sub { font-size: 12px; color: var(--tp-text-3); margin-left: 2px; }
		.tp-topbar-spacer { flex: 1; }
		.tp-content { flex: 1; overflow-y: auto; padding: 22px 24px 44px; }
		.tp-page { max-width: 1180px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }

		/* ---------- primitives ---------- */
		.tp-page-head { display: flex; align-items: flex-end; gap: 14px; }
		.tp-page-head-text { flex: 1; min-width: 0; }
		.tp-page-title { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.4px; }
		.tp-page-desc { margin: 4px 0 0; font-size: 12.5px; color: var(--tp-text-2); }
		.tp-page-actions { display: flex; align-items: center; gap: 8px; }

		.tp-btn {
		  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
		  height: 32px; padding: 0 14px;
		  border: 1px solid var(--tp-border); border-radius: 999px;
		  background: var(--tp-surface); color: var(--tp-text);
		  font: inherit; font-size: 12.5px; font-weight: 600;
		  cursor: pointer; white-space: nowrap;
		  transition: background 0.12s ease, border-color 0.12s ease, opacity 0.12s ease;
		}
		.tp-btn:hover { background: var(--tp-hover); }
		.tp-btn:active { opacity: 0.75; }
		.tp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
		.tp-btn-primary { background: var(--tp-accent); border-color: transparent; color: #fff; }
		.tp-btn-primary:hover { background: color-mix(in srgb, var(--tp-accent) 88%, #000); }
		.tp-btn-danger { background: var(--tp-danger); border-color: transparent; color: #fff; }
		.tp-btn-danger:hover { background: color-mix(in srgb, var(--tp-danger) 88%, #000); }
		.tp-btn-ghost { background: transparent; border-color: transparent; color: var(--tp-text-2); }
		.tp-btn-ghost:hover { background: var(--tp-hover); color: var(--tp-text); }
		.tp-btn-sm { height: 26px; padding: 0 10px; font-size: 12px; }
		.tp-btn-lg { height: 40px; padding: 0 20px; font-size: 14px; }

		.tp-icon-btn {
		  width: 30px; height: 30px; display: grid; place-items: center;
		  border: 0; border-radius: 8px; background: transparent; color: var(--tp-text-2);
		  cursor: pointer;
		}
		.tp-icon-btn:hover { background: var(--tp-hover); color: var(--tp-text); }

		.tp-card {
		  background: var(--tp-surface);
		  border: 1px solid var(--tp-border-soft);
		  border-radius: var(--tp-radius-xl);
		  box-shadow: var(--tp-shadow-card);
		  padding: 18px;
		}
		.tp-card-flat { box-shadow: none; }
		.tp-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
		.tp-card-title { font-size: 14px; font-weight: 650; letter-spacing: -0.1px; }
		.tp-card-desc { font-size: 12px; color: var(--tp-text-3); }
		.tp-card-actions { margin-left: auto; display: flex; align-items: center; gap: 6px; }

		.tp-grid { display: grid; gap: 14px; }
		.tp-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
		.tp-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
		.tp-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.tp-span-2 { grid-column: span 2; }

		.tp-stat { display: flex; flex-direction: column; gap: 6px; }
		.tp-stat-label { font-size: 12px; font-weight: 600; color: var(--tp-text-3); }
		.tp-stat-value { font-size: 26px; font-weight: 720; letter-spacing: -0.8px; font-variant-numeric: tabular-nums; }
		.tp-stat-unit { font-size: 13px; font-weight: 600; color: var(--tp-text-3); margin-left: 4px; }
		.tp-stat-delta { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; }
		.tp-stat-delta.up { color: var(--tp-success); }
		.tp-stat-delta.down { color: var(--tp-danger); }
		.tp-stat-foot { font-size: 12px; color: var(--tp-text-3); }

		.tp-tag {
		  display: inline-flex; align-items: center; gap: 4px;
		  height: 22px; padding: 0 8px;
		  border-radius: 999px; font-size: 11.5px; font-weight: 600;
		  background: var(--tp-surface-3); color: var(--tp-text-2); white-space: nowrap;
		}
		.tp-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
		.tp-tag.success { background: var(--tp-success-soft); color: var(--tp-success); }
		.tp-tag.warn { background: var(--tp-warn-soft); color: var(--tp-warn); }
		.tp-tag.danger { background: var(--tp-danger-soft); color: var(--tp-danger); }
		.tp-tag.info { background: var(--tp-info-soft); color: var(--tp-info); }
		.tp-tag.neutral { background: var(--tp-surface-3); color: var(--tp-text-2); }

		.tp-avatar {
		  width: 34px; height: 34px; flex: none;
		  border-radius: 10px;
		  display: grid; place-items: center;
		  font-size: 12px; font-weight: 700; color: #fff;
		  letter-spacing: 0.2px;
		}
		.tp-avatar-sm { width: 26px; height: 26px; border-radius: 8px; font-size: 10.5px; }
		.tp-avatar-lg { width: 44px; height: 44px; border-radius: 12px; font-size: 14px; }

		.tp-mono { font-family: var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace); font-size: 11.5px; }
		.tp-muted { color: var(--tp-text-2); }
		.tp-faint { color: var(--tp-text-3); }
		.tp-strong { font-weight: 650; }
		.tp-num { font-variant-numeric: tabular-nums; }
		.tp-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

		.tp-table-wrap { overflow: auto; border-radius: var(--tp-radius-lg); }
		.tp-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12.5px; }
		.tp-table th {
		  position: sticky; top: 0; z-index: 1;
		  text-align: left; font-size: 11.5px; font-weight: 600; color: var(--tp-text-3);
		  padding: 9px 12px; background: var(--tp-surface-2);
		  border-bottom: 1px solid var(--tp-border-soft);
		  white-space: nowrap;
		}
		.tp-table td { padding: 12px; border-bottom: 1px solid var(--tp-border-soft); vertical-align: middle; }
		.tp-table tbody tr:last-child td { border-bottom: 0; }
		.tp-table tbody tr { transition: background 0.1s ease; }
		.tp-table tbody tr:hover { background: var(--tp-hover); }
		.tp-table .tp-cell-actions { text-align: right; white-space: nowrap; }
		.tp-clickable { cursor: pointer; }

		.tp-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
		.tp-search {
		  display: flex; align-items: center; gap: 7px;
		  height: 32px; padding: 0 12px;
		  border: 1px solid var(--tp-border); border-radius: 999px;
		  background: var(--tp-surface); min-width: 220px; color: var(--tp-text-3);
		}
		.tp-search input {
		  flex: 1; min-width: 0; border: 0; outline: 0; background: transparent;
		  color: var(--tp-text); font: inherit; font-size: 12.5px;
		}
		.tp-select {
		  height: 32px; padding: 0 28px 0 12px;
		  border: 1px solid var(--tp-border); border-radius: 999px;
		  background: var(--tp-surface) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%238e8e93' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") no-repeat right 12px center;
		  color: var(--tp-text); font: inherit; font-size: 12.5px; appearance: none; cursor: pointer;
		}
		.tp-seg {
		  display: inline-flex; padding: 3px; gap: 2px;
		  background: var(--tp-surface-3); border-radius: 999px;
		}
		.tp-seg button {
		  height: 26px; padding: 0 12px; border: 0; border-radius: 999px;
		  background: transparent; color: var(--tp-text-2); font: inherit; font-size: 12px; font-weight: 600;
		  cursor: pointer; white-space: nowrap;
		}
		.tp-seg button[aria-pressed="true"] { background: var(--tp-surface); color: var(--tp-text); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

		.tp-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 54px 20px; text-align: center; color: var(--tp-text-3); }
		.tp-empty-icon { width: 46px; height: 46px; border-radius: 16px; display: grid; place-items: center; background: var(--tp-surface-3); color: var(--tp-text-3); }
		.tp-empty-title { font-size: 13.5px; font-weight: 600; color: var(--tp-text-2); }
		.tp-empty-desc { font-size: 12px; max-width: 320px; }

		.tp-drawer-mask { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,0.28); animation: tp-fade 0.15s ease; }
		.tp-drawer {
		  position: fixed; top: 0; right: 0; bottom: 0; z-index: 61;
		  width: min(520px, 94vw);
		  display: flex; flex-direction: column;
		  background: var(--tp-bg); box-shadow: var(--tp-shadow-pop);
		  animation: tp-slide-in 0.22s cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		.tp-modal-mask { position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; padding: 24px; background: rgba(0,0,0,0.3); animation: tp-fade 0.15s ease; }
		.tp-modal {
		  width: min(560px, 100%); max-height: 82vh; overflow: auto;
		  background: var(--tp-bg); border-radius: var(--tp-radius-xl);
		  box-shadow: var(--tp-shadow-pop); animation: tp-pop 0.2s cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		.tp-drawer-head, .tp-modal-head {
		  display: flex; align-items: center; gap: 10px;
		  padding: 16px 20px; border-bottom: 1px solid var(--tp-border-soft);
		  background: var(--tp-surface);
		}
		.tp-drawer-body, .tp-modal-body { flex: 1; overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 16px; }
		.tp-drawer-foot, .tp-modal-foot {
		  display: flex; align-items: center; gap: 8px; justify-content: flex-end;
		  padding: 13px 20px; border-top: 1px solid var(--tp-border-soft); background: var(--tp-surface);
		}

		@keyframes tp-fade { from { opacity: 0; } to { opacity: 1; } }
		@keyframes tp-slide-in { from { transform: translateX(24px); opacity: 0.4; } to { transform: none; opacity: 1; } }
		@keyframes tp-pop { from { transform: scale(0.98) translateY(6px); opacity: 0.5; } to { transform: none; opacity: 1; } }

		.tp-field { display: flex; flex-direction: column; gap: 6px; }
		.tp-field-label { font-size: 12px; font-weight: 600; color: var(--tp-text-2); }
		.tp-input, .tp-textarea {
		  min-height: 34px; padding: 7px 11px;
		  border: 1px solid var(--tp-border); border-radius: var(--tp-radius-md);
		  background: var(--tp-surface); color: var(--tp-text); font: inherit; font-size: 13px; outline: none;
		  width: 100%;
		}
		.tp-input:focus, .tp-textarea:focus { border-color: var(--tp-accent); }
		.tp-textarea { min-height: 78px; resize: vertical; }
		.tp-field-hint { font-size: 11.5px; color: var(--tp-text-3); }
		.tp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
		.tp-form-grid .tp-field:last-child { grid-column: 1 / -1; }

		.tp-kv { display: grid; grid-template-columns: 118px 1fr; gap: 9px 14px; font-size: 12.5px; align-items: baseline; }
		.tp-kv dt { color: var(--tp-text-3); }
		.tp-kv dd { margin: 0; color: var(--tp-text); word-break: break-word; }

		.tp-timeline { display: flex; flex-direction: column; }
		.tp-timeline-item { position: relative; display: flex; gap: 12px; padding-bottom: 16px; }
		.tp-timeline-item::before { content: ""; position: absolute; left: 10px; top: 24px; bottom: 0; width: 1px; background: var(--tp-border); }
		.tp-timeline-item:last-child::before { display: none; }
		.tp-timeline-node {
		  width: 21px; height: 21px; flex: none; border-radius: 50%;
		  display: grid; place-items: center; background: var(--tp-surface-3); color: var(--tp-text-2);
		  border: 2px solid var(--tp-surface);
		  box-shadow: 0 0 0 1px var(--tp-border);
		}
		.tp-timeline-node.success { background: var(--tp-success-soft); color: var(--tp-success); }
		.tp-timeline-node.warn { background: var(--tp-warn-soft); color: var(--tp-warn); }
		.tp-timeline-node.danger { background: var(--tp-danger-soft); color: var(--tp-danger); }
		.tp-timeline-main { flex: 1; min-width: 0; }
		.tp-timeline-title { font-size: 12.5px; font-weight: 600; }
		.tp-timeline-meta { font-size: 11.5px; color: var(--tp-text-3); margin-top: 1px; }
		.tp-timeline-body { margin-top: 5px; font-size: 12px; color: var(--tp-text-2); }

		.tp-progress { height: 6px; border-radius: 999px; background: var(--tp-surface-3); overflow: hidden; }
		.tp-progress-fill { height: 100%; border-radius: 999px; background: var(--tp-accent); transition: width 0.3s ease; }
		.tp-progress-fill.success { background: var(--tp-success); }
		.tp-progress-fill.warn { background: var(--tp-warn); }
		.tp-progress-fill.danger { background: var(--tp-danger); }

		.tp-bars { display: flex; align-items: flex-end; gap: 6px; height: 84px; }
		.tp-bars-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 0; }
		.tp-bars-bar { width: 100%; max-width: 26px; border-radius: 6px 6px 3px 3px; background: var(--tp-accent); transition: height 0.3s ease; }
		.tp-bars-bar.success { background: var(--tp-success); }
		.tp-bars-bar.warn { background: var(--tp-warn); }
		.tp-bars-bar.danger { background: var(--tp-danger); }
		.tp-bars-label { font-size: 10.5px; color: var(--tp-text-3); white-space: nowrap; }

		.tp-list { display: flex; flex-direction: column; }
		.tp-list-row {
		  display: flex; align-items: center; gap: 12px;
		  padding: 11px 2px; border-bottom: 1px solid var(--tp-border-soft);
		  min-width: 0;
		}
		.tp-list-row:last-child { border-bottom: 0; }
		.tp-list-main { flex: 1; min-width: 0; }
		.tp-list-title { font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
		.tp-list-sub { font-size: 11.5px; color: var(--tp-text-3); margin-top: 1px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
		.tp-list-side { display: flex; align-items: center; gap: 10px; flex: none; }

		.tp-threshold-row { display: grid; grid-template-columns: 86px 1fr 72px; align-items: center; gap: 12px; }
		.tp-threshold-row input[type="range"] { width: 100%; accent-color: var(--tp-accent); }
		.tp-slider-value { font-size: 12.5px; font-weight: 650; text-align: right; font-variant-numeric: tabular-nums; }

		.tp-chain { display: flex; align-items: center; gap: 0; flex-wrap: wrap; }
		.tp-chain-node { display: flex; flex-direction: column; gap: 2px; padding: 7px 12px; border: 1px solid var(--tp-border); border-radius: var(--tp-radius-md); background: var(--tp-surface); }
		.tp-chain-node.root { border-color: color-mix(in srgb, var(--tp-accent) 45%, transparent); }
		.tp-chain-arrow { width: 22px; height: 1.5px; background: var(--tp-border); position: relative; margin: 0 2px; }
		.tp-chain-arrow::after { content: ""; position: absolute; right: -1px; top: -3.5px; border: 4px solid transparent; border-left-color: var(--tp-border); }

		.tp-hero {
		  display: flex; align-items: center; gap: 18px;
		  padding: 20px 22px;
		  border-radius: var(--tp-radius-xl);
		  color: #fff;
		  background: linear-gradient(120deg, #0a5cd6 0%, #0a84ff 45%, #6a5cff 100%);
		  box-shadow: 0 10px 30px rgba(10, 92, 214, 0.22);
		}
		.tp-hero-title { font-size: 18px; font-weight: 700; letter-spacing: -0.2px; }
		.tp-hero-desc { font-size: 12.5px; opacity: 0.85; margin-top: 3px; }
		.tp-hero-metrics { margin-left: auto; display: flex; gap: 26px; }
		.tp-hero-metric { text-align: right; }
		.tp-hero-metric-value { font-size: 19px; font-weight: 700; font-variant-numeric: tabular-nums; }
		.tp-hero-metric-label { font-size: 11px; opacity: 0.75; }

		.tp-risk-gauge { display: flex; align-items: center; gap: 12px; }
		.tp-risk-score { font-size: 24px; font-weight: 720; font-variant-numeric: tabular-nums; letter-spacing: -0.5px; }

		.tp-claims { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 18px; }

		.tp-divider { height: 1px; background: var(--tp-border-soft); margin: 2px 0; }

		.tp-toast-stack { position: fixed; right: 22px; bottom: 22px; z-index: 80; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
		.tp-toast {
		  display: flex; align-items: center; gap: 9px;
		  padding: 10px 14px; border-radius: var(--tp-radius-md);
		  background: var(--tp-surface); color: var(--tp-text);
		  box-shadow: var(--tp-shadow-pop); border: 1px solid var(--tp-border-soft);
		  font-size: 12.5px; font-weight: 500; animation: tp-pop 0.18s ease;
		  max-width: 360px;
		}
		.tp-toast.success .tp-toast-icon { color: var(--tp-success); }
		.tp-toast.error .tp-toast-icon { color: var(--tp-danger); }
		.tp-toast-icon { display: grid; place-items: center; }

		.tp-skeleton { border-radius: 8px; background: linear-gradient(90deg, var(--tp-surface-3), var(--tp-surface-2), var(--tp-surface-3)); background-size: 200% 100%; animation: tp-shimmer 1.2s infinite; }
		@keyframes tp-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

		@media (max-width: 1080px) {
		  .tp-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		  .tp-grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		}
		@media (max-width: 760px) {
		  .tp-nav { width: 64px; padding: 14px 8px; }
		  .tp-nav-brand-name, .tp-nav-brand-sub, .tp-nav-group, .tp-nav-item span, .tp-nav-foot { display: none; }
		  .tp-nav-item { justify-content: center; padding: 0; }
		  .tp-grid-4, .tp-grid-3, .tp-grid-2 { grid-template-columns: minmax(0, 1fr); }
		  .tp-span-2 { grid-column: auto; }
		}
		/* ---------- console layout (shared by only-one mount point) ---------- */
		.tp-root { min-height: 0; }
		.tp-shell { flex: 1; display: flex; flex-direction: column; min-height: 0; min-width: 0; }
		.tp-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 6px; }
		.tp-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
		.tp-brand-mark {
		  width: 30px; height: 30px; flex: none; border-radius: 9px;
		  display: grid; place-items: center; color: #fff;
		  background: linear-gradient(135deg, #0a6cff, #7b5cff);
		  box-shadow: 0 4px 12px rgba(10, 108, 255, 0.28);
		}
		.tp-brand-text { min-width: 0; }
		.tp-brand-name { font-size: 13.5px; font-weight: 700; letter-spacing: -0.1px; white-space: nowrap; }
		.tp-brand-sub { font-size: 11px; color: var(--tp-text-3); font-weight: 500; white-space: nowrap; }

		.tp-tabs {
		  flex: none; display: flex; align-items: center; gap: 2px;
		  padding: 0 20px; height: 46px;
		  border-bottom: 1px solid var(--tp-border-soft);
		  background: color-mix(in srgb, var(--tp-surface) 65%, transparent);
		  overflow-x: auto;
		}
		.tp-tab {
		  display: inline-flex; align-items: center; gap: 7px;
		  height: 30px; padding: 0 11px; border: 0; border-radius: 9px;
		  background: transparent; color: var(--tp-text-2);
		  font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; white-space: nowrap;
		}
		.tp-tab:hover { background: var(--tp-hover); color: var(--tp-text); }
		.tp-tab.active { background: var(--tp-accent-soft); color: var(--tp-accent); }
		.tp-tab-badge {
		  min-width: 17px; height: 17px; padding: 0 5px; border-radius: 999px;
		  font-size: 10.5px; font-weight: 700; line-height: 17px; text-align: center;
		  color: #fff; background: var(--tp-danger);
		}
		.tp-main {
		  flex: 1; min-width: 0; min-height: 0; overflow-y: auto;
		  display: flex; flex-direction: column;
		  padding: 22px 24px 44px;
		  background: var(--tp-bg);
		}
		.tp-breadcrumb { max-width: 1180px; width: 100%; margin: 0 auto 12px; }
		.tp-back {
		  display: inline-flex; align-items: center; gap: 5px;
		  height: 28px; padding: 0 11px; border: 1px solid var(--tp-border); border-radius: 999px;
		  background: var(--tp-surface); color: var(--tp-text-2);
		  font: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
		}
		.tp-back:hover { background: var(--tp-hover); color: var(--tp-text); }

		/* ---------- topbar widgets ---------- */
		.tp-global-search { position: relative; }
		.tp-global-search { position: relative; display: flex; align-items: center; }
		.tp-search-trigger {
		  display: flex; align-items: center; gap: 7px;
		  height: 30px; padding: 0 11px; min-width: 216px;
		  border: 1px solid var(--tp-border); border-radius: 999px;
		  background: var(--tp-surface); color: var(--tp-text-3);
		  font: inherit; font-size: 12px; cursor: pointer; text-align: left;
		}
		.tp-search-trigger:hover { border-color: var(--tp-border); background: var(--tp-surface-2); }
		.tp-search-trigger kbd {
		  margin-left: auto; padding: 1px 5px; border-radius: 5px;
		  border: 1px solid var(--tp-border); background: var(--tp-surface-3);
		  font: inherit; font-size: 10.5px; color: var(--tp-text-3);
		}
		.tp-pop-anchor { position: relative; }
		.tp-bell-dot {
		  position: absolute; top: 1px; right: 1px; min-width: 15px; height: 15px;
		  padding: 0 4px; border-radius: 999px; font-size: 9.5px; font-weight: 700;
		  line-height: 15px; text-align: center; color: #fff; background: var(--tp-danger);
		  box-shadow: 0 0 0 2px var(--tp-surface);
		}
		.tp-popover {
		  position: absolute; top: calc(100% + 8px); right: 0; z-index: 50;
		  min-width: 300px; max-width: 380px;
		  background: var(--tp-surface); border: 1px solid var(--tp-border-soft);
		  border-radius: var(--tp-radius-lg); box-shadow: var(--tp-shadow-pop);
		  overflow: hidden; animation: tp-pop 0.16s cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		.tp-popover-head {
		  display: flex; align-items: center; justify-content: space-between;
		  padding: 11px 14px; border-bottom: 1px solid var(--tp-border-soft);
		  font-size: 12.5px;
		}
		.tp-search-pop { min-width: 380px; }
		.tp-search-input {
		  width: 100%; height: 40px; padding: 0 14px; border: 0; outline: 0;
		  border-bottom: 1px solid var(--tp-border-soft);
		  background: transparent; color: var(--tp-text); font: inherit; font-size: 13px;
		}
		.tp-search-results { max-height: 330px; overflow-y: auto; padding: 6px; }
		.tp-search-empty { padding: 26px 12px; text-align: center; font-size: 12px; color: var(--tp-text-3); }
		.tp-search-hit {
		  display: flex; align-items: center; gap: 10px; width: 100%;
		  padding: 8px 10px; border: 0; border-radius: 9px;
		  background: transparent; color: var(--tp-text); font: inherit; text-align: left; cursor: pointer;
		}
		.tp-search-hit:hover { background: var(--tp-hover); }
		.tp-search-hit-icon {
		  width: 28px; height: 28px; flex: none; border-radius: 8px;
		  display: grid; place-items: center;
		  background: var(--tp-surface-3); color: var(--tp-text-2);
		}
		.tp-search-hit-main { min-width: 0; }
		.tp-search-hit-title { display: block; font-size: 12.5px; font-weight: 600; }
		.tp-search-hit-detail { display: block; font-size: 11px; color: var(--tp-text-3); }
		.tp-link-btn {
		  border: 0; background: transparent; color: var(--tp-accent);
		  font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0;
		}
		.tp-notify-list { max-height: 360px; overflow-y: auto; }
		.tp-notify-item {
		  display: flex; align-items: flex-start; gap: 10px; width: 100%;
		  padding: 11px 14px; border: 0; border-bottom: 1px solid var(--tp-border-soft);
		  background: transparent; color: var(--tp-text); font: inherit; text-align: left; cursor: pointer;
		}
		.tp-notify-item:last-child { border-bottom: 0; }
		.tp-notify-item:hover { background: var(--tp-hover); }
		.tp-notify-item.unread { background: color-mix(in srgb, var(--tp-accent-soft) 55%, transparent); }
		.tp-notify-icon {
		  width: 26px; height: 26px; flex: none; border-radius: 8px;
		  display: grid; place-items: center;
		  background: var(--tp-surface-3); color: var(--tp-text-2);
		}
		.tp-notify-icon.success { background: var(--tp-success-soft); color: var(--tp-success); }
		.tp-notify-icon.warn { background: var(--tp-warn-soft); color: var(--tp-warn); }
		.tp-notify-icon.danger { background: var(--tp-danger-soft); color: var(--tp-danger); }
		.tp-notify-icon.info { background: var(--tp-info-soft); color: var(--tp-info); }
		.tp-notify-main { flex: 1; min-width: 0; }
		.tp-notify-title { display: block; font-size: 12.5px; font-weight: 600; }
		.tp-notify-body { display: block; font-size: 11.5px; color: var(--tp-text-2); margin-top: 1px; }
		.tp-notify-time { font-size: 10.5px; color: var(--tp-text-3); white-space: nowrap; margin-top: 2px; }
		.tp-account {
		  display: flex; align-items: center; gap: 8px;
		  height: 36px; padding: 0 8px; border: 0; border-radius: 999px;
		  background: transparent; color: var(--tp-text); font: inherit; cursor: pointer;
		}
		.tp-account:hover { background: var(--tp-hover); }
		.tp-account-text { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; }
		.tp-account-name { font-size: 12px; font-weight: 600; }
		.tp-account-role { font-size: 10.5px; color: var(--tp-text-3); }
		.tp-account-pop { min-width: 280px; }
		.tp-account-pop-head { display: flex; align-items: center; gap: 11px; padding: 14px; border-bottom: 1px solid var(--tp-border-soft); }
		.tp-account-pop-row {
		  display: flex; align-items: center; justify-content: space-between;
		  padding: 9px 14px; font-size: 12px; color: var(--tp-text-2);
		  border-bottom: 1px solid var(--tp-border-soft);
		}
		.tp-account-pop-action {
		  display: flex; align-items: center; gap: 8px; width: 100%;
		  padding: 11px 14px; border: 0; background: transparent;
		  color: var(--tp-text); font: inherit; font-size: 12.5px; font-weight: 600;
		  text-align: left; cursor: pointer;
		}
		.tp-account-pop-action:hover { background: var(--tp-hover); }

		/* ---------- approvals ---------- */
		.tp-sla-strip {
		  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;
		  padding: 14px 16px; border-radius: var(--tp-radius-lg);
		  background: var(--tp-surface); border: 1px solid var(--tp-border-soft);
		  box-shadow: var(--tp-shadow-card);
		}
		.tp-sla-item { display: flex; flex-direction: column; gap: 3px; font-size: 13px; }
		.tp-approval-list { display: flex; flex-direction: column; gap: 12px; }
		.tp-approval-card { padding: 16px 18px; }
		.tp-approval-card.overdue { border-color: color-mix(in srgb, var(--tp-danger) 45%, transparent); }
		.tp-approval-head { display: flex; align-items: center; gap: 12px; }
		.tp-approval-icon {
		  width: 34px; height: 34px; flex: none; border-radius: 10px;
		  display: grid; place-items: center;
		  background: var(--tp-surface-3); color: var(--tp-text-2);
		}
		.tp-approval-icon.warn { background: var(--tp-warn-soft); color: var(--tp-warn); }
		.tp-approval-icon.danger { background: var(--tp-danger-soft); color: var(--tp-danger); }
		.tp-approval-icon.success { background: var(--tp-success-soft); color: var(--tp-success); }
		.tp-approval-title-block { flex: 1; min-width: 0; }
		.tp-approval-title { font-size: 13.5px; font-weight: 650; }
		.tp-approval-sub { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; font-size: 12px; color: var(--tp-text-3); margin-top: 2px; }
		.tp-approval-status { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex: none; }
		.tp-approval-reason {
		  display: flex; align-items: flex-start; gap: 7px;
		  margin: 11px 0; padding: 9px 11px;
		  border-radius: var(--tp-radius-md);
		  background: var(--tp-surface-2); color: var(--tp-text-2); font-size: 12.5px;
		}
		.tp-approval-reason svg { flex: none; margin-top: 2px; }
		.tp-approval-grid {
		  display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 16px;
		  padding: 12px 0; border-top: 1px solid var(--tp-border-soft);
		  border-bottom: 1px solid var(--tp-border-soft); margin-bottom: 12px;
		}
		.tp-approval-actions { display: flex; align-items: center; gap: 8px; }
		.tp-approval-actions .tp-btn:first-child { margin-right: auto; }
		.tp-risk-row { display: flex; align-items: center; gap: 9px; margin-top: 5px; }
		.tp-risk-row .tp-progress { flex: 1; min-width: 60px; }
		.tp-label { font-size: 11.5px; font-weight: 600; color: var(--tp-text-3); }
		.tp-small { font-size: 11.5px; }
		.tp-stack { display: flex; flex-direction: column; gap: 14px; }
		.tp-dot-sep { width: 3px; height: 3px; flex: none; border-radius: 50%; background: var(--tp-text-3); }
		.tp-danger-text { color: var(--tp-danger); }
		.tp-warn-text { color: var(--tp-warn); }
		.tp-success-text { color: var(--tp-success); }
		.tp-drawer-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; width: 100%; }

		/* ---------- callouts ---------- */
		.tp-callout {
		  padding: 12px 14px; border-radius: var(--tp-radius-md);
		  background: var(--tp-surface-2); border: 1px solid var(--tp-border-soft);
		  display: flex; flex-direction: column; gap: 4px;
		}
		.tp-callout.info { background: var(--tp-info-soft); border-color: transparent; }
		.tp-callout.success { background: var(--tp-success-soft); border-color: transparent; }
		.tp-callout.warn { background: var(--tp-warn-soft); border-color: transparent; }
		.tp-callout.danger { background: var(--tp-danger-soft); border-color: transparent; }
		.tp-callout-title { display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 650; }
		.tp-callout-body { font-size: 12.5px; color: var(--tp-text); }
		.tp-callout-detail { font-size: 11.5px; color: var(--tp-text-2); }

		/* ---------- dashboard lists ---------- */
		.tp-attention { display: flex; flex-direction: column; }
		.tp-attention-row {
		  display: flex; align-items: center; gap: 10px; width: 100%;
		  padding: 10px 2px; border: 0; border-bottom: 1px solid var(--tp-border-soft);
		  background: transparent; color: var(--tp-text); font: inherit; text-align: left; cursor: pointer;
		}
		.tp-attention-row:last-child { border-bottom: 0; }
		.tp-attention-row:hover { background: var(--tp-hover); }
		.tp-attention-icon {
		  width: 28px; height: 28px; flex: none; border-radius: 8px;
		  display: grid; place-items: center; background: var(--tp-surface-3); color: var(--tp-text-2);
		}
		.tp-attention-icon.danger { background: var(--tp-danger-soft); color: var(--tp-danger); }
		.tp-attention-icon.warn { background: var(--tp-warn-soft); color: var(--tp-warn); }
		.tp-attention-icon.info { background: var(--tp-info-soft); color: var(--tp-info); }
		.tp-attention-main { flex: 1; min-width: 0; }
		.tp-attention-title { font-size: 12.5px; font-weight: 600; }
		.tp-attention-detail { font-size: 11.5px; color: var(--tp-text-3); }
		.tp-activity { display: flex; flex-direction: column; }
		.tp-activity-row { display: flex; gap: 11px; padding: 9px 0; }
		.tp-activity-node {
		  width: 8px; height: 8px; flex: none; margin-top: 6px; border-radius: 50%;
		  background: var(--tp-text-3); box-shadow: 0 0 0 4px var(--tp-surface-3);
		}
		.tp-activity-node.success { background: var(--tp-success); box-shadow: 0 0 0 4px var(--tp-success-soft); }
		.tp-activity-node.warn { background: var(--tp-warn); box-shadow: 0 0 0 4px var(--tp-warn-soft); }
		.tp-activity-node.danger { background: var(--tp-danger); box-shadow: 0 0 0 4px var(--tp-danger-soft); }
		.tp-activity-main { flex: 1; min-width: 0; }
		.tp-activity-title { font-size: 12.5px; }
		.tp-activity-body { font-size: 11.5px; color: var(--tp-text-2); margin-top: 1px; }
		.tp-activity-time { font-size: 10.5px; color: var(--tp-text-3); white-space: nowrap; }
		.tp-leader-list { display: flex; flex-direction: column; }
		.tp-leader-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--tp-border-soft); }
		.tp-leader-item:last-child { border-bottom: 0; }
		.tp-leader-main { flex: 1; min-width: 0; }
		.tp-leader-name { font-size: 12.5px; font-weight: 600; }
		.tp-leader-meta { font-size: 11px; color: var(--tp-text-3); }
		.tp-mini-list { display: flex; flex-direction: column; gap: 2px; }
		.tp-mini-item { display: flex; align-items: center; gap: 9px; padding: 7px 0; }
		.tp-mini-main { flex: 1; min-width: 0; }
		.tp-mini-title { font-size: 12px; font-weight: 600; }
		.tp-mini-sub { font-size: 11px; color: var(--tp-text-3); }
		.tp-mini-meta { font-size: 11px; color: var(--tp-text-3); font-variant-numeric: tabular-nums; }
		.tp-chart-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 10px; font-size: 11.5px; color: var(--tp-text-3); }
		.tp-donut-row { display: flex; align-items: center; gap: 18px; }
		.tp-donut-value { font-size: 20px; font-weight: 720; font-variant-numeric: tabular-nums; }
		.tp-stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
		.tp-grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }
		.tp-card-note { font-size: 11.5px; color: var(--tp-text-3); margin-top: 10px; }
		.tp-footer-note { max-width: 1180px; width: 100%; margin: 0 auto; font-size: 11px; color: var(--tp-text-3); text-align: center; }
		.tp-evidence-list { display: flex; flex-direction: column; }
		.tp-evidence-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--tp-border-soft); font-size: 12px; }
		.tp-evidence-row:last-child { border-bottom: 0; }
		.tp-chain-line { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; }
		.tp-chain-avatar { display: flex; }
		.tp-chain-name { font-size: 12.5px; }
		.tp-chain-detail { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 11.5px; color: var(--tp-text-3); margin-top: 3px; }

		/* ---------- generic page helpers ---------- */
		.tp-section-title { font-size: 13px; font-weight: 650; letter-spacing: -0.1px; margin: 0; }
		.tp-hint { font-size: 11.5px; color: var(--tp-text-3); }
		.tp-inline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
		.tp-grow { flex: 1; min-width: 0; }
		.tp-wrap { flex-wrap: wrap; }
		.tp-chart { width: 100%; min-width: 0; }
		.tp-list-clickable .tp-list-row { cursor: pointer; border-radius: var(--tp-radius-sm); }
		.tp-list-clickable .tp-list-row:hover { background: var(--tp-hover); }
		.tp-toolbar-end { margin-left: auto; }
		.tp-tag-lg { height: 26px; padding: 0 10px; font-size: 12px; }
		.tp-progress-row { display: flex; align-items: center; gap: 10px; }
		.tp-progress-row .tp-progress { flex: 1; min-width: 60px; }
		.tp-table .tp-th-right { text-align: right; }
		.tp-table .tp-td-right { text-align: right; }
		.tp-scroll-y { overflow-y: auto; }

		@media (max-width: 980px) {
		  .tp-sla-strip, .tp-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		  .tp-grid-2-1 { grid-template-columns: minmax(0, 1fr); }
		  .tp-approval-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		}
		@media (max-width: 720px) {
		  .tp-main { padding: 16px 14px 32px; }
		  .tp-tabs { padding: 0 12px; }
		  .tp-sla-strip, .tp-stat-grid, .tp-approval-grid { grid-template-columns: minmax(0, 1fr); }
		}


		/* ---------- docked right-column console ---------- */
		.tp-launcher {
		  display: inline-flex; align-items: center; justify-content: center;
		  width: 30px; height: 30px; padding: 0; border: 1px solid transparent;
		  border-radius: 9px; background: transparent; cursor: pointer;
		  color: var(--dsw-alias-label-secondary, var(--tp-text-2, #6e6e73));
		  transition: background 0.15s ease, color 0.15s ease;
		}
		.tp-launcher:hover {
		  background: var(--dsw-alias-interactive-bg-hover, rgba(120, 120, 128, 0.12));
		  color: var(--dsw-alias-label-primary, var(--tp-text, #1d1d1f));
		}
		.tp-launcher:focus-visible {
		  outline: 2px solid var(--dsw-alias-brand-primary, #0a6cff);
		  outline-offset: 1px;
		}

		.tp-panel-root .tp-topbar {
		  height: auto; min-height: 48px; flex-wrap: wrap;
		  padding: 8px 10px; gap: 6px 8px;
		}
		.tp-panel-root .tp-brand { gap: 8px; }
		.tp-panel-root .tp-brand-mark { width: 26px; height: 26px; border-radius: 8px; }
		.tp-panel-root .tp-brand-name { font-size: 12.5px; }
		.tp-panel-root .tp-brand-sub { display: none; }
		.tp-panel-root .tp-topbar-right { gap: 4px; }
		.tp-panel-root .tp-search-trigger { min-width: 0; width: 30px; padding: 0; justify-content: center; }
		.tp-panel-root .tp-search-trigger span,
		.tp-panel-root .tp-search-trigger kbd { display: none; }
		.tp-panel-root .tp-search-pop {
		  min-width: 0;
		  width: min(360px, calc(100vw - 40px));
		  right: 0;
		}
		.tp-panel-root .tp-account { padding: 0 4px; }
		.tp-panel-root .tp-account-text,
		.tp-panel-root .tp-account > .tp-icon { display: none; }
		.tp-panel-root .tp-popover {
		  min-width: 0;
		  width: min(340px, calc(100vw - 40px));
		  max-width: none;
		}

		.tp-panel-root .tp-tabs {
		  display: grid;
		  grid-template-columns: repeat(4, minmax(0, 1fr));
		  gap: 2px; height: auto; padding: 6px 8px;
		  overflow: visible;
		}
		.tp-panel-root .tp-tab {
		  justify-content: center; gap: 5px;
		  height: 40px; padding: 0 4px;
		  flex-direction: column; font-size: 11px; line-height: 1.1;
		}
		.tp-panel-root .tp-tab span {
		  max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
		}
		.tp-panel-root .tp-tab-badge {
		  position: absolute; top: 2px; right: 8px;
		}
		.tp-panel-root .tp-tab { position: relative; }

		@container (min-width: 560px) {
		  .tp-panel-root .tp-tabs { grid-template-columns: repeat(8, minmax(0, 1fr)); }
		  .tp-panel-root .tp-tab { flex-direction: row; height: 30px; padding: 0 2px; font-size: 11.5px; }
		}

		@container (min-width: 760px) {
		  .tp-panel-root .tp-tab { padding: 0 4px; font-size: 12px; }
		}

		/* Narrow docked column: drop the two secondary task columns; the task detail keeps them. */
		@container (max-width: 759px) {
		  .tp-panel-root .tp-tasks-table th:nth-child(7),
		  .tp-panel-root .tp-tasks-table td:nth-child(7),
		  .tp-panel-root .tp-tasks-table th:nth-child(8),
		  .tp-panel-root .tp-tasks-table td:nth-child(8) { display: none; }
		  .tp-panel-root .tp-audit-table th:nth-child(4),
		  .tp-panel-root .tp-audit-table td:nth-child(4),
		  .tp-panel-root .tp-audit-table th:nth-child(6),
		  .tp-panel-root .tp-audit-table td:nth-child(6) { display: none; }
		}

		.tp-panel-root .tp-main { padding: 14px 12px 30px; }
		.tp-panel-root .tp-page { gap: 13px; max-width: none; min-width: 0; margin: 0; }
		.tp-panel-root .tp-page > * { min-width: 0; }
		.tp-panel-root .tp-page-head { flex-wrap: wrap; align-items: flex-start; }
		.tp-panel-root .tp-page-title { font-size: 18px; letter-spacing: -0.2px; }
		.tp-panel-root .tp-page-desc { font-size: 12px; }
		.tp-panel-root .tp-page-actions { width: 100%; justify-content: flex-start; }

		.tp-panel-root .tp-grid-4,
		.tp-panel-root .tp-grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.tp-panel-root .tp-grid-2,
		.tp-panel-root .tp-grid-2-1,
		.tp-panel-root .tp-span-2 { grid-template-columns: minmax(0, 1fr); grid-column: auto; }
		.tp-panel-root .tp-approval-grid { grid-template-columns: 1.2fr 1fr 1fr; }
		.tp-panel-root .tp-sla-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.tp-panel-root .tp-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.tp-panel-root .tp-hero { flex-wrap: wrap; }
		.tp-panel-root .tp-hero-metrics { margin-left: 0; width: 100%; gap: 18px; }
		.tp-panel-root .tp-hero-title { font-size: 16px; }

		.tp-panel-root .tp-table-wrap { overflow-x: auto; }
		.tp-panel-root .tp-table { min-width: 560px; }
		.tp-panel-root .tp-card { padding: 14px 14px; }
		.tp-panel-root .tp-toolbar { flex-wrap: wrap; }
		.tp-panel-root .tp-modal-mask { position: absolute; inset: 0; padding: 16px; }
		.tp-panel-root .tp-modal { width: min(520px, calc(100% - 24px)); max-height: 100%; }

		`;
		var injected = false;
		function ensureProductStyles() {
		  if (injected || typeof document === "undefined") return;
		  if (document.getElementById(STYLE_ID)) {
		    injected = true;
		    return;
		  }
		  const style = document.createElement("style");
		  style.id = STYLE_ID;
		  style.dataset.dshTrustPlatform = "";
		  style.textContent = CSS;
		  document.head.appendChild(style);
		  injected = true;
		}

		// src/client/product/app/navigation.jsx
		var import_react7 = require("react");
		var import_jsx_runtime6 = require("react/jsx-runtime");
		var NavigationContext = (0, import_react7.createContext)(null);
		function NavigationProvider({ children }) {
		  const [stack, setStack] = (0, import_react7.useState)([{ page: "dashboard", params: {} }]);
		  const value = (0, import_react7.useMemo)(() => {
		    const current = stack[stack.length - 1];
		    return {
		      route: current,
		      /**
		       * Push a page. Re-using the top page for the same page+id replaces it
		       * instead of duplicating history.
		       * @param {string} page
		       * @param {object} [params]
		       */
		      navigate(page, params = {}) {
		        setStack((currentStack) => {
		          const top = currentStack[currentStack.length - 1];
		          const same = top.page === page && (top.params?.taskId || top.params?.agentId || "") === (params?.taskId || params?.agentId || "");
		          return same ? currentStack : [...currentStack, { page, params }];
		        });
		      },
		      back() {
		        setStack((currentStack) => currentStack.length > 1 ? currentStack.slice(0, -1) : currentStack);
		      },
		      /** Jump to a top-level tab, clearing the stack. */
		      go(page) {
		        setStack([{ page, params: {} }]);
		      }
		    };
		  }, [stack]);
		  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(NavigationContext.Provider, { value, children });
		}
		function useNavigation() {
		  const value = (0, import_react7.useContext)(NavigationContext);
		  if (!value) throw new Error("useNavigation must be used inside NavigationProvider");
		  return value;
		}

		// src/client/product/app/shell.jsx
		var import_react16 = require("react");

		// src/client/product/hooks.js
		var import_react8 = require("react");

		// src/client/product/mock/seed.js
		var MINUTE = 1;
		var HOUR = 60 * MINUTE;
		var DAY = 24 * HOUR;
		var ago = (minutes) => new Date(Date.now() - minutes * 6e4).toISOString();
		var ahead = (minutes) => new Date(Date.now() + minutes * 6e4).toISOString();
		var ORGS = [
		  { id: "org-starbridge", name: "星桥支付", domain: "starbridge.pay", kind: "operator", verified: true },
		  { id: "org-yunfan", name: "云帆贸易", domain: "yunfan.trade", kind: "merchant", verified: true },
		  { id: "org-hanhai", name: "瀚海物流", domain: "hanhai.logi", kind: "merchant", verified: true },
		  { id: "org-hengxin", name: "恒信银行", domain: "hengxin.bank", kind: "bank", verified: true }
		];
		var AGENTS = [
		  {
		    id: "agent-ache",
		    name: "采购代理·阿澈",
		    shortName: "阿澈",
		    role: "procurement",
		    roleLabel: "采购执行代理",
		    orgId: "org-starbridge",
		    orgName: "星桥支付",
		    did: "did:trust:starbridge.pay:procurement-01",
		    status: "ACTIVE",
		    trustScore: 0.96,
		    keyLabel: "Ed25519 · 主密钥",
		    createdAt: ago(38 * DAY),
		    lastActiveAt: ago(7),
		    monthlyVolume: 428e3,
		    successRate: 0.994,
		    description: "负责供应商询价、采购下单与付款申请，在财务负责人的委托额度内行动。"
		  },
		  {
		    id: "agent-xiaolan",
		    name: "结算代理·小澜",
		    shortName: "小澜",
		    role: "settlement",
		    roleLabel: "结算执行代理",
		    orgId: "org-starbridge",
		    orgName: "星桥支付",
		    did: "did:trust:starbridge.pay:settlement-01",
		    status: "ACTIVE",
		    trustScore: 0.94,
		    keyLabel: "Ed25519 · 主密钥",
		    createdAt: ago(52 * DAY),
		    lastActiveAt: ago(2),
		    monthlyVolume: 126e4,
		    successRate: 0.997,
		    description: "执行跨境收付与对账，负责结算凭证的签名与终局确认。"
		  },
		  {
		    id: "agent-aze",
		    name: "物流代理·阿泽",
		    shortName: "阿泽",
		    role: "logistics",
		    roleLabel: "物流结算代理",
		    orgId: "org-starbridge",
		    orgName: "星桥支付",
		    did: "did:trust:starbridge.pay:logistics-01",
		    status: "ACTIVE",
		    trustScore: 0.91,
		    keyLabel: "Ed25519 · 主密钥",
		    createdAt: ago(26 * DAY),
		    lastActiveAt: ago(53),
		    monthlyVolume: 96e3,
		    successRate: 0.986,
		    description: "处理仓储与运费结算，单笔额度较低，由结算代理二次委托授权。"
		  },
		  {
		    id: "agent-mobai",
		    name: "合规审计代理·墨白",
		    shortName: "墨白",
		    role: "compliance",
		    roleLabel: "合规审计代理",
		    orgId: "org-starbridge",
		    orgName: "星桥支付",
		    did: "did:trust:starbridge.pay:audit-01",
		    status: "ACTIVE",
		    trustScore: 0.99,
		    keyLabel: "Ed25519 · 审计密钥",
		    createdAt: ago(64 * DAY),
		    lastActiveAt: ago(21),
		    monthlyVolume: 0,
		    successRate: 1,
		    description: "只读审计与案件调查，不持有付款权限；负责证据封存与报告出具。"
		  },
		  {
		    id: "agent-yunfan",
		    name: "云帆贸易·采购助理",
		    shortName: "云帆助理",
		    role: "counterparty",
		    roleLabel: "外部交易对手代理",
		    orgId: "org-yunfan",
		    orgName: "云帆贸易",
		    did: "did:trust:yunfan.trade:buyer-agent",
		    status: "ACTIVE",
		    trustScore: 0.88,
		    keyLabel: "Ed25519 · 对外密钥",
		    createdAt: ago(17 * DAY),
		    lastActiveAt: ago(130),
		    monthlyVolume: 512e3,
		    successRate: 0.972,
		    description: "供应商侧代理，提交对账单与收款请求，需通过星桥支付的委托链校验。"
		  }
		];
		var CREDENTIALS = [
		  {
		    id: "vc-001",
		    name: "代理经营授权凭证",
		    type: "AgentAuthorityCredential",
		    subjectId: "agent-ache",
		    issuerName: "星桥支付",
		    issuerDid: "did:trust:starbridge.pay:issuer-01",
		    status: "ACTIVE",
		    issuedAt: ago(38 * DAY),
		    expiresAt: ahead(24 * DAY),
		    claims: { scope: "procurement,payment-request", singleLimit: "200,000 USD", dailyLimit: "600,000 USD", currency: "USD" },
		    digest: "0x8f3a…c21d",
		    verifiedAt: ago(3)
		  },
		  {
		    id: "vc-002",
		    name: "跨境支付业务资质",
		    type: "PaymentLicenseCredential",
		    subjectId: "agent-xiaolan",
		    issuerName: "恒信银行",
		    issuerDid: "did:trust:hengxin.bank:issuer-01",
		    status: "ACTIVE",
		    issuedAt: ago(52 * DAY),
		    expiresAt: ahead(43 * DAY),
		    claims: { scope: "cross-border-settlement", corridors: "CN-US, CN-EU", currency: "USD,EUR" },
		    digest: "0x6b21…90ae",
		    verifiedAt: ago(5)
		  },
		  {
		    id: "vc-003",
		    name: "数据合规审计授权",
		    type: "AuditAuthorizationCredential",
		    subjectId: "agent-mobai",
		    issuerName: "星桥支付",
		    issuerDid: "did:trust:starbridge.pay:issuer-01",
		    status: "ACTIVE",
		    issuedAt: ago(64 * DAY),
		    expiresAt: ahead(58 * DAY),
		    claims: { scope: "read-only,evidence,case", dataClasses: "transaction,identity", retention: "180 天" },
		    digest: "0x1d9c…4f77",
		    verifiedAt: ago(11)
		  },
		  {
		    id: "vc-004",
		    name: "物流服务协议凭证",
		    type: "ServiceAgreementCredential",
		    subjectId: "agent-aze",
		    issuerName: "星桥支付",
		    issuerDid: "did:trust:starbridge.pay:issuer-01",
		    status: "ACTIVE",
		    issuedAt: ago(26 * DAY),
		    expiresAt: ahead(9 * DAY),
		    claims: { scope: "logistics-settlement", maxSingle: "20,000 USD", currency: "USD" },
		    digest: "0x4a08…b3e2",
		    verifiedAt: ago(31)
		  },
		  {
		    id: "vc-005",
		    name: "交易对手主体认证",
		    type: "KYBCredential",
		    subjectId: "agent-yunfan",
		    issuerName: "恒信银行",
		    issuerDid: "did:trust:hengxin.bank:issuer-01",
		    status: "SUSPENDED",
		    issuedAt: ago(17 * DAY),
		    expiresAt: ahead(72 * DAY),
		    claims: { scope: "counterparty-verification", registration: "91310000MA1FL8X23K", jurisdiction: "CN" },
		    digest: "0x77be…12a0",
		    verifiedAt: ago(43)
		  }
		];
		var DELEGATIONS = [
		  {
		    id: "del-root",
		    name: "财务负责人 → 采购代理",
		    issuerName: "周明（财务负责人）",
		    issuerDid: "did:trust:starbridge.pay:treasury-lead",
		    subjectId: "agent-ache",
		    subjectName: "采购代理·阿澈",
		    subjectDid: "did:trust:starbridge.pay:procurement-01",
		    parentId: null,
		    purpose: "日常采购付款申请与供应商询价",
		    actions: ["CREATE_TASK", "AUTHORIZE_PAYMENT", "SUBMIT_PAYMENT"],
		    actionLabels: ["创建任务", "付款授权", "提交付款"],
		    amountLimit: 2e5,
		    dailyLimit: 6e5,
		    currency: "USD",
		    usedToday: 133800,
		    validFrom: ago(6 * HOUR),
		    validTo: ahead(30 * DAY),
		    status: "ACTIVE",
		    canRedelegate: true
		  },
		  {
		    id: "del-settle",
		    name: "采购代理 → 结算代理",
		    issuerName: "采购代理·阿澈",
		    issuerDid: "did:trust:starbridge.pay:procurement-01",
		    subjectId: "agent-xiaolan",
		    subjectName: "结算代理·小澜",
		    subjectDid: "did:trust:starbridge.pay:settlement-01",
		    parentId: "del-root",
		    purpose: "跨境收付执行与结算凭证签署",
		    actions: ["SUBMIT_PAYMENT", "SETTLE"],
		    actionLabels: ["提交付款", "结算"],
		    amountLimit: 8e4,
		    dailyLimit: 24e4,
		    currency: "USD",
		    usedToday: 56600,
		    validFrom: ago(3 * HOUR),
		    validTo: ahead(21 * DAY),
		    status: "ACTIVE",
		    canRedelegate: true
		  },
		  {
		    id: "del-logistics",
		    name: "结算代理 → 物流代理",
		    issuerName: "结算代理·小澜",
		    issuerDid: "did:trust:starbridge.pay:settlement-01",
		    subjectId: "agent-aze",
		    subjectName: "物流代理·阿泽",
		    subjectDid: "did:trust:starbridge.pay:logistics-01",
		    parentId: "del-settle",
		    purpose: "仓储与运费结算，单笔限额较低",
		    actions: ["SUBMIT_PAYMENT"],
		    actionLabels: ["提交付款"],
		    amountLimit: 2e4,
		    dailyLimit: 6e4,
		    currency: "USD",
		    usedToday: 20900,
		    validFrom: ago(2 * HOUR),
		    validTo: ahead(14 * DAY),
		    status: "ACTIVE",
		    canRedelegate: false
		  },
		  {
		    id: "del-trial",
		    name: "历史试用委托（已撤销）",
		    issuerName: "采购代理·阿澈",
		    issuerDid: "did:trust:starbridge.pay:procurement-01",
		    subjectId: "agent-yunfan",
		    subjectName: "云帆贸易·采购助理",
		    subjectDid: "did:trust:yunfan.trade:buyer-agent",
		    parentId: "del-root",
		    purpose: "供应商侧提交对账单试用",
		    actions: ["SUBMIT_INVOICE"],
		    actionLabels: ["提交对账单"],
		    amountLimit: 5e3,
		    dailyLimit: 1e4,
		    currency: "USD",
		    usedToday: 0,
		    validFrom: ago(12 * DAY),
		    validTo: ago(2 * DAY),
		    status: "REVOKED",
		    canRedelegate: false,
		    revokedAt: ago(2 * DAY),
		    revokeReason: "试用期结束，改为人工对账"
		  }
		];
		function event(id, taskId, type, typeLabel, options) {
		  const keyId = `did:trust:starbridge.pay:${options.actorId || "audit-01"}#key-1`;
		  return {
		    id,
		    taskId,
		    type,
		    typeLabel,
		    actor: options.actor,
		    actorId: options.actorId || "agent-ache",
		    at: ago(options.minutesAgo),
		    tone: options.tone || "neutral",
		    verification: options.verification || "VALID",
		    finality: options.finality || "PENDING",
		    body: options.body || "",
		    signature: { algorithm: "Ed25519", keyId, value: `sig_${id.replaceAll("-", "")}…${String(id).slice(-4)}` },
		    ledger: options.ledger || null
		  };
		}
		var TASKS = [
		  {
		    id: "task-101",
		    title: "云帆贸易 · 10 月采购结算",
		    counterparty: "云帆贸易",
		    counterpartyOrg: "org-yunfan",
		    purpose: "电子元器件采购尾款结算",
		    amount: 48e3,
		    currency: "USD",
		    status: "SUBMITTED",
		    riskScore: 0.38,
		    riskDecision: "ALLOW",
		    delegationId: "del-settle",
		    createdAt: ago(190),
		    updatedAt: ago(34),
		    submittedAt: ago(34),
		    invoiceNo: "YF-2026-1024",
		    settlementRef: "ledger-usdc-8841",
		    reviews: [
		      { by: "采购代理·阿澈", at: ago(160), note: "供应商对账无误，申请付款" },
		      { by: "结算代理·小澜", at: ago(34), note: "已提交跨境结算" }
		    ]
		  },
		  {
		    id: "task-102",
		    title: "瀚海物流 · 10 月运费",
		    counterparty: "瀚海物流",
		    counterpartyOrg: "org-hanhai",
		    purpose: "华东—洛杉矶海运头程费用",
		    amount: 8600,
		    currency: "USD",
		    status: "SUBMITTED",
		    riskScore: 0.22,
		    riskDecision: "ALLOW",
		    delegationId: "del-logistics",
		    createdAt: ago(96),
		    updatedAt: ago(18),
		    submittedAt: ago(18),
		    invoiceNo: "HH-88213",
		    settlementRef: "ledger-usdc-8842",
		    reviews: [{ by: "物流代理·阿泽", at: ago(18), note: "运费早于计划入账，申请结算" }]
		  },
		  {
		    id: "task-103",
		    title: "云帆贸易 · 样品采购",
		    counterparty: "云帆贸易",
		    counterpartyOrg: "org-yunfan",
		    purpose: "新供应商样品试单",
		    amount: 3200,
		    currency: "USD",
		    status: "CLOSED",
		    riskScore: 0.17,
		    riskDecision: "ALLOW",
		    delegationId: "del-root",
		    createdAt: ago(2 * 24 * 60),
		    updatedAt: ago(41 * 60),
		    submittedAt: ago(30 * 60),
		    closedAt: ago(41 * 60),
		    invoiceNo: "YF-2026-0991",
		    settlementRef: "ledger-usdc-8690",
		    reviews: [
		      { by: "采购代理·阿澈", at: ago(29 * 60), note: "样品验收通过" },
		      { by: "合规审计代理·墨白", at: ago(41 * 60), note: "结算凭证校验通过，任务关闭" }
		    ]
		  },
		  {
		    id: "task-104",
		    title: "恒信银行 · 汇款手续费",
		    counterparty: "恒信银行",
		    counterpartyOrg: "org-hengxin",
		    purpose: "跨境汇款通道手续费",
		    amount: 1450,
		    currency: "USD",
		    status: "CONFIRMED",
		    riskScore: 0.09,
		    riskDecision: "ALLOW",
		    delegationId: "del-settle",
		    createdAt: ago(74),
		    updatedAt: ago(12),
		    submittedAt: ago(40),
		    confirmedAt: ago(12),
		    invoiceNo: "HX-FEE-1027",
		    settlementRef: "ledger-usdc-8844",
		    reviews: [{ by: "结算代理·小澜", at: ago(12), note: "银行侧确认，待审计关闭" }]
		  },
		  {
		    id: "task-105",
		    title: "云帆贸易 · 大宗采购预付款",
		    counterparty: "云帆贸易",
		    counterpartyOrg: "org-yunfan",
		    purpose: "Q4 主材预付款（30%）",
		    amount: 186e3,
		    currency: "USD",
		    status: "CREATED",
		    riskScore: 0.81,
		    riskDecision: "BLOCK",
		    delegationId: "del-root",
		    createdAt: ago(240),
		    updatedAt: ago(228),
		    invoiceNo: "YF-2026-1030",
		    reviews: [],
		    blockedReason: "单笔金额超过采购代理委托限额，且历史同类交易存在供应商变更记录"
		  },
		  {
		    id: "task-106",
		    title: "瀚海物流 · 旺季仓储费",
		    counterparty: "瀚海物流",
		    counterpartyOrg: "org-hanhai",
		    purpose: "旺季仓储与操作费",
		    amount: 12300,
		    currency: "USD",
		    status: "PAYREQ_PENDING",
		    riskScore: 0.72,
		    riskDecision: "DEFER",
		    delegationId: "del-logistics",
		    createdAt: ago(160),
		    updatedAt: ago(13),
		    invoiceNo: "HH-88220",
		    reviews: [{ by: "物流代理·阿泽", at: ago(13), note: "费用超出日常阈值，转人工复核" }],
		    interventionId: "int-1"
		  },
		  {
		    id: "task-107",
		    title: "云帆贸易 · 尾款补付",
		    counterparty: "云帆贸易",
		    counterpartyOrg: "org-yunfan",
		    purpose: "补充结算（供应商索赔）",
		    amount: 92e3,
		    currency: "USD",
		    status: "FAILED",
		    riskScore: 0.88,
		    riskDecision: "BLOCK",
		    delegationId: "del-settle",
		    createdAt: ago(200),
		    updatedAt: ago(120),
		    invoiceNo: "YF-2026-1029",
		    reviews: [],
		    blockedReason: "收款账户与合同登记账户不一致，触发资金安全拦截",
		    interventionId: "int-2"
		  },
		  {
		    id: "task-108",
		    title: "恒信银行 · 账户管理费",
		    counterparty: "恒信银行",
		    counterpartyOrg: "org-hengxin",
		    purpose: "跨境账户月度管理费",
		    amount: 980,
		    currency: "USD",
		    status: "CLOSED",
		    riskScore: 0.05,
		    riskDecision: "ALLOW",
		    delegationId: "del-settle",
		    createdAt: ago(3 * 24 * 60),
		    updatedAt: ago(2 * 24 * 60),
		    submittedAt: ago(50 * 60),
		    closedAt: ago(2 * 24 * 60),
		    invoiceNo: "HX-FEE-1020",
		    settlementRef: "ledger-usdc-8621",
		    reviews: []
		  },
		  {
		    id: "task-109",
		    title: "云帆贸易 · 新订单预付款",
		    counterparty: "云帆贸易",
		    counterpartyOrg: "org-yunfan",
		    purpose: "11 月新订单 20% 预付款",
		    amount: 25e3,
		    currency: "USD",
		    status: "AUTHORIZED",
		    riskScore: 0.31,
		    riskDecision: "ALLOW",
		    delegationId: "del-root",
		    createdAt: ago(48),
		    updatedAt: ago(45),
		    invoiceNo: "YF-2026-1101",
		    reviews: [{ by: "采购代理·阿澈", at: ago(45), note: "已完成付款授权，等待供应商确认" }]
		  },
		  {
		    id: "task-110",
		    title: "瀚海物流 · 加急运输",
		    counterparty: "瀚海物流",
		    counterpartyOrg: "org-hanhai",
		    purpose: "展会样机加急运输",
		    amount: 16800,
		    currency: "USD",
		    status: "CANCELLED",
		    riskScore: 0.34,
		    riskDecision: "THROTTLE",
		    delegationId: "del-logistics",
		    createdAt: ago(140),
		    updatedAt: ago(120),
		    invoiceNo: "HH-88218",
		    reviews: [],
		    blockedReason: "供应商主动取消行程"
		  }
		];
		var EVENTS = [
		  event("evt-001", "task-106", "RISK_DEFER", "风险转人工", { actor: "风控引擎", actorId: "audit-01", minutesAgo: 13, tone: "warn", body: "风险分 0.72 超过转人工阈值 0.60" }),
		  event("evt-002", "task-106", "INTERVENTION_CREATED", "发起人工复核", { actor: "采购代理·阿澈", minutesAgo: 13, tone: "warn", body: "复核项：旺季仓储费金额超出日常阈值" }),
		  event("evt-003", "task-101", "PAYMENT_SUBMITTED", "提交结算", { actor: "结算代理·小澜", actorId: "agent-xiaolan", minutesAgo: 34, body: "已提交 48,000 USD 跨境结算请求", ledger: { scheme: "USDC 清算网络", reference: "ledger-usdc-8841" } }),
		  event("evt-004", "task-101", "RISK_ALLOW", "风险放行", { actor: "风控引擎", actorId: "audit-01", minutesAgo: 35, body: "风险分 0.38，低于限流阈值 0.40" }),
		  event("evt-005", "task-101", "AUTHORIZATION_GRANTED", "付款授权通过", { actor: "授权服务", actorId: "audit-01", minutesAgo: 36, body: "委托链有效，金额在单笔限额内" }),
		  event("evt-006", "task-104", "SETTLEMENT_CONFIRMED", "结算确认", { actor: "恒信银行", actorId: "agent-xiaolan", minutesAgo: 12, finality: "CONFIRMED", body: "银行返回结算受理成功", ledger: { scheme: "USDC 清算网络", reference: "ledger-usdc-8844" } }),
		  event("evt-007", "task-105", "RISK_BLOCK", "风险拦截", { actor: "风控引擎", actorId: "audit-01", minutesAgo: 228, tone: "danger", body: "金额超过委托限额，自动拦截并通知财务负责人" }),
		  event("evt-008", "task-107", "RISK_BLOCK", "风险拦截", { actor: "风控引擎", actorId: "audit-01", minutesAgo: 120, tone: "danger", body: "收款账户不一致，资金安全拦截" }),
		  event("evt-009", "task-103", "SETTLEMENT_FINAL", "结算终局", { actor: "合规审计代理·墨白", actorId: "agent-mobai", minutesAgo: 41 * 60, finality: "FINAL", body: "结算凭证校验通过，任务关闭", ledger: { scheme: "USDC 清算网络", reference: "ledger-usdc-8690" } }),
		  event("evt-010", "task-109", "AUTHORIZATION_GRANTED", "付款授权通过", { actor: "授权服务", actorId: "audit-01", minutesAgo: 45, body: "在委托额度内，允许提交供应商" }),
		  event("evt-011", "task-102", "PAYMENT_SUBMITTED", "提交结算", { actor: "物流代理·阿泽", actorId: "agent-aze", minutesAgo: 18, body: "已提交 8,600 USD 运费结算", ledger: { scheme: "USDC 清算网络", reference: "ledger-usdc-8842" } }),
		  event("evt-012", "del-trial", "DELEGATION_REVOKED", "撤销委托", { actor: "采购代理·阿澈", minutesAgo: 2 * 24 * 60, tone: "danger", body: "试用期结束，委托撤销" }),
		  event("evt-013", "task-108", "SETTLEMENT_FINAL", "结算终局", { actor: "结算代理·小澜", actorId: "agent-xiaolan", minutesAgo: 2 * 24 * 60, finality: "FINAL", body: "账户管理费已终局结算", ledger: { scheme: "USDC 清算网络", reference: "ledger-usdc-8621" } }),
		  event("evt-014", "task-110", "TASK_CANCELLED", "任务取消", { actor: "物流代理·阿泽", actorId: "agent-aze", minutesAgo: 120, tone: "neutral", body: "供应商取消加急运输" }),
		  event("evt-015", "task-104", "AUDIT_NOTE", "审计备注", { actor: "合规审计代理·墨白", actorId: "agent-mobai", minutesAgo: 10, tone: "info", body: "已登记待办：本周内关闭任务 104" })
		];
		var INTERVENTIONS = [
		  {
		    id: "int-1",
		    taskId: "task-106",
		    title: "仓储费付款人工复核",
		    reason: "金额超出代理日常阈值，风险分 0.72（转人工阈值 0.60）",
		    detail: "物流代理阿泽提交旺季仓储费 12,300 USD，超出其单笔授权额度 20,000 USD 的日常使用模式；系统按转人工策略挂起，等待财务负责人确认。",
		    status: "PENDING",
		    level: 2,
		    requestedBy: "风控引擎",
		    requestedAt: ago(13),
		    dueAt: ahead(32),
		    requiredApprovals: 1,
		    evidenceRefs: ["evt-001", "evt-002"],
		    riskScore: 0.72
		  },
		  {
		    id: "int-2",
		    taskId: "task-107",
		    title: "收款账户不一致拦截复核",
		    reason: "收款账户与合同登记账户不一致，风险分 0.88（拦截阈值 0.80）",
		    detail: "系统在提交前拦截尾款补付 92,000 USD：供应商提供的收款账户与合同登记账户不一致。需财务负责人与合规审计共同确认是否存在账户变更审批。",
		    status: "PENDING",
		    level: 3,
		    requestedBy: "风控引擎",
		    requestedAt: ago(120),
		    dueAt: ago(12),
		    requiredApprovals: 1,
		    evidenceRefs: ["evt-008"],
		    riskScore: 0.88
		  },
		  {
		    id: "int-3",
		    taskId: "task-104",
		    title: "手续费低置信度复核（可选）",
		    reason: "模型置信度低于 0.9，建议抽查",
		    detail: "恒信银行手续费 1,450 USD 已被放行并确认；审计代理建议抽查发票与清算流水是否一致。",
		    status: "PENDING",
		    level: 1,
		    requestedBy: "合规审计代理·墨白",
		    requestedAt: ago(9),
		    dueAt: ahead(47),
		    requiredApprovals: 1,
		    evidenceRefs: ["evt-006", "evt-015"],
		    riskScore: 0.09
		  },
		  {
		    id: "int-4",
		    taskId: "task-103",
		    title: "样品采购验收复核",
		    reason: "新供应商首笔交易，按策略抽查",
		    detail: "已完成验收，复核结论：验收单与发票一致。",
		    status: "APPROVED",
		    level: 1,
		    requestedBy: "风控引擎",
		    requestedAt: ago(29 * 60),
		    decidedAt: ago(28.5 * 60),
		    decidedBy: "周明（财务负责人）",
		    decisionNote: "验收材料齐全，同意",
		    requiredApprovals: 1,
		    evidenceRefs: ["evt-009"],
		    riskScore: 0.17
		  },
		  {
		    id: "int-5",
		    taskId: "task-105",
		    title: "超限预付款复核",
		    reason: "单笔 186,000 USD 超过委托限额",
		    detail: "财务负责人拒绝一次性支付，要求拆分订单。",
		    status: "DENIED",
		    level: 2,
		    requestedBy: "风控引擎",
		    requestedAt: ago(230),
		    decidedAt: ago(226),
		    decidedBy: "周明（财务负责人）",
		    decisionNote: "金额超限，拆分订单后再提交",
		    requiredApprovals: 1,
		    evidenceRefs: ["evt-007"],
		    riskScore: 0.81
		  }
		];
		var EVIDENCE = [
		  { id: "evi-001", kind: "authorization", subject: "task-101 付款授权", summary: "委托链有效性校验与金额限额校验记录", digest: "0x3a91…77bd", at: ago(36), anchored: true, anchoredAt: ago(20), dimension: "授权证据" },
		  { id: "evi-002", kind: "settlement", subject: "task-101 结算凭证", summary: "提交结算的事件签名与清算流水引用", digest: "0x81ff…0c42", at: ago(34), anchored: true, anchoredAt: ago(20), dimension: "结算证据" },
		  { id: "evi-003", kind: "risk", subject: "task-106 风险决策", summary: "风险分 0.72，转人工策略命中记录", digest: "0xbe07…9ac1", at: ago(13), anchored: false, anchoredAt: null, dimension: "风险证据" },
		  { id: "evi-004", kind: "identity", subject: "采购代理·阿澈 主体", summary: "DID 文档与密钥登记快照", digest: "0x51d3…4a08", at: ago(38 * 24 * 60), anchored: true, anchoredAt: ago(30 * 24 * 60), dimension: "身份证据" },
		  { id: "evi-005", kind: "credential", subject: "跨境支付业务资质", summary: "恒信银行签发凭证与吊销状态可查", digest: "0x6b21…90ae", at: ago(52 * 24 * 60), anchored: true, anchoredAt: ago(51 * 24 * 60), dimension: "凭证证据" },
		  { id: "evi-006", kind: "delegation", subject: "del-settle 委托链", summary: "二级委托链（财务负责人 → 采购 → 结算）快照", digest: "0x0f72…aa31", at: ago(3 * 60), anchored: false, anchoredAt: null, dimension: "委托证据" },
		  { id: "evi-007", kind: "settlement", subject: "task-103 结算终局", summary: "FINAL 结算事件通过校验并关闭任务", digest: "0xd4c0…1e87", at: ago(41 * 60), anchored: true, anchoredAt: ago(40 * 60), dimension: "结算证据" },
		  { id: "evi-008", kind: "audit", subject: "task-104 审计备注", summary: "审计代理登记的待办与备注", digest: "0x9e55…3b90", at: ago(10), anchored: false, anchoredAt: null, dimension: "审计证据" },
		  { id: "evi-009", kind: "risk", subject: "task-107 拦截记录", summary: "收款账户不一致的拦截证据", digest: "0xc7a2…5d19", at: ago(120), anchored: true, anchoredAt: ago(118), dimension: "风险证据" },
		  { id: "evi-010", kind: "audit", subject: "策略发布记录", summary: "policy-2026-10-30-001 发布签名与摘要", digest: "0x2f19…b6c4", at: ago(2 * 24 * 60), anchored: true, anchoredAt: ago(2 * 24 * 60), dimension: "治理证据" }
		];
		var CASES = [
		  {
		    id: "case-001",
		    title: "瀚海物流旺季仓储费异常上涨调查",
		    summary: "连续三个月仓储费环比上涨超过 40%，需核查计费口径与货物周转数据。",
		    status: "OPEN",
		    severity: "high",
		    openedAt: ago(3 * 60),
		    owner: "合规审计代理·墨白",
		    coverage: 0.62,
		    linkedTaskIds: ["task-106", "task-102"],
		    linkedEventIds: ["evt-001", "evt-011"],
		    findings: [
		      { at: ago(150), text: "调取 9-10 月仓储计费明细，发现旺季附加费口径与合同不一致" },
		      { at: ago(90), text: "供应商已提交补充说明，等待财务确认" }
		    ],
		    conclusion: ""
		  },
		  {
		    id: "case-002",
		    title: "委托链越权尝试复盘",
		    summary: "外部代理曾尝试在已撤销的试用委托下提交对账单，被委托链校验拦截。",
		    status: "RESOLVED",
		    severity: "medium",
		    openedAt: ago(2 * 24 * 60),
		    resolvedAt: ago(26 * 60),
		    owner: "合规审计代理·墨白",
		    coverage: 0.94,
		    linkedTaskIds: [],
		    linkedEventIds: ["evt-012"],
		    findings: [
		      { at: ago(2 * 24 * 60 + 30), text: "拦截日志确认：委托状态为已撤销，拒绝提交" },
		      { at: ago(27 * 60), text: "已收紧外部代理的委托策略，试用期结束后自动失效" }
		    ],
		    conclusion: "系统按预期拦截，无需进一步处置；已将案件结论归档。"
		  },
		  {
		    id: "case-003",
		    title: "供应商收款账户变更核实",
		    summary: "云帆贸易收款账户发生变更请求，与合同登记账户不一致，需人工核实变更审批。",
		    status: "ESCALATED",
		    severity: "critical",
		    openedAt: ago(118),
		    owner: "周明（财务负责人）",
		    coverage: 0.35,
		    linkedTaskIds: ["task-107"],
		    linkedEventIds: ["evt-008"],
		    findings: [{ at: ago(110), text: "已暂停付款并升级至财务负责人与合规委员会" }],
		    conclusion: ""
		  }
		];
		var KNOWLEDGE = [
		  {
		    id: "kb-001",
		    category: "合规",
		    title: "代理付款委托链的生效与失效规则",
		    summary: "委托链从根委托向下逐级收窄；任一层被撤销后，其下游委托同时失去效力，付款请求将被拒绝。",
		    tags: ["委托", "授权", "合规"],
		    updatedAt: ago(2 * 24 * 60),
		    author: "合规审计代理·墨白",
		    readMinutes: 4
		  },
		  {
		    id: "kb-002",
		    category: "风控",
		    title: "什么时候会触发人工复核（转人工）",
		    summary: "风险分达到 0.60 或金额超过代理日常阈值时进入人工复核；复核期间付款保持挂起，超时自动失效。",
		    tags: ["风控", "人工复核", "SLA"],
		    updatedAt: ago(4 * 24 * 60),
		    author: "风控引擎",
		    readMinutes: 3
		  },
		  {
		    id: "kb-003",
		    category: "操作",
		    title: "结算完成与任务关闭的关系",
		    summary: "任务只有在一笔已签名的终局结算事件通过校验后才可以关闭；手动关闭会被系统拒绝。",
		    tags: ["结算", "任务", "证据"],
		    updatedAt: ago(6 * 24 * 60),
		    author: "结算代理·小澜",
		    readMinutes: 2
		  },
		  {
		    id: "kb-004",
		    category: "案例",
		    title: "账户变更类欺诈的识别与处置",
		    summary: "优先核对合同登记账户；任何账户变更需走双人复核；命中拦截后立即暂停相关供应商全部付款。",
		    tags: ["欺诈", "账户", "案例"],
		    updatedAt: ago(24 * 60),
		    author: "合规审计代理·墨白",
		    readMinutes: 6
		  },
		  {
		    id: "kb-005",
		    category: "治理",
		    title: "策略版本如何生效",
		    summary: "策略以版本化记录发布；风险决策必须引用已发布的策略版本与模型版本，未发布的版本会导致决策不可评估并转人工。",
		    tags: ["策略", "模型", "版本"],
		    updatedAt: ago(3 * 24 * 60),
		    author: "周明（财务负责人）",
		    readMinutes: 4
		  }
		];
		var POLICIES = [
		  {
		    id: "policy-2026-10-30-001",
		    name: "代理付款风控策略",
		    version: "2026-10-30-001",
		    status: "PUBLISHED",
		    publishedAt: ago(2 * 24 * 60),
		    publishedBy: "周明（财务负责人）",
		    thresholds: { block: 0.8, defer: 0.6, throttle: 0.4 },
		    scope: "全部代理 · 跨境付款",
		    ruleCount: 12,
		    description: "按风险分区间执行拦截/转人工/限流/放行，并约束单笔与日累计限额。"
		  },
		  {
		    id: "policy-2026-10-28-002",
		    name: "跨境结算限额策略",
		    version: "2026-10-28-002",
		    status: "PUBLISHED",
		    publishedAt: ago(4 * 24 * 60),
		    publishedBy: "周明（财务负责人）",
		    thresholds: { block: 0.9, defer: 0.75, throttle: 0.55 },
		    scope: "结算代理 · 跨境收付",
		    ruleCount: 8,
		    description: "对结算代理设定更严格的限额与币种约束，跨境通道异常时自动降级。"
		  },
		  {
		    id: "policy-2026-11-01-003",
		    name: "供应商准入策略（草稿）",
		    version: "2026-11-01-003",
		    status: "DRAFT",
		    thresholds: { block: 0.85, defer: 0.65, throttle: 0.45 },
		    scope: "新供应商 · 首笔交易",
		    ruleCount: 5,
		    description: "新供应商首笔交易需人工复核，KYB 凭证进入待复核状态时暂停付款。"
		  }
		];
		var MODELS = [
		  {
		    id: "rules-2026-10-25-001",
		    name: "风险评分模型",
		    version: "2026-10-25-001",
		    status: "PUBLISHED",
		    publishedAt: ago(5 * 24 * 60),
		    metrics: { auc: 0.93, precision: 0.91, recall: 0.88, samples: 124e3 },
		    features: ["金额偏离度", "对手方历史", "时段异常", "委托链深度"],
		    description: "基于规则与历史统计的评分模型，输出 0..1 风险分供策略使用。"
		  },
		  {
		    id: "anomaly-2026-10-20-002",
		    name: "异常检测模型",
		    version: "2026-10-20-002",
		    status: "PUBLISHED",
		    publishedAt: ago(9 * 24 * 60),
		    metrics: { auc: 0.89, precision: 0.86, recall: 0.92, samples: 87e3 },
		    features: ["账户变更", "发票重复", "金额拆分"],
		    description: "识别账户变更、重复发票与金额拆分等异常模式。"
		  }
		];
		var REPORTS = [
		  {
		    id: "rpt-001",
		    title: "2026 年 10 月信任运营月报",
		    period: "2026-10-01 ~ 2026-10-31",
		    status: "READY",
		    createdAt: ago(5 * 60),
		    createdBy: "合规审计代理·墨白",
		    format: "PDF · JSON",
		    sizeLabel: "2.4 MB",
		    sections: ["委托链健康度", "风险决策分布", "结算闭环", "案件与整改"]
		  },
		  {
		    id: "rpt-002",
		    title: "案件 case-001 调查阶段报告",
		    period: "2026-10-25 ~ 2026-10-30",
		    status: "READY",
		    createdAt: ago(3.5 * 60),
		    createdBy: "合规审计代理·墨白",
		    format: "PDF",
		    sizeLabel: "860 KB",
		    sections: ["调查背景", "证据清单", "初步结论"]
		  },
		  {
		    id: "rpt-003",
		    title: "委托链权限审计报告（Q4）",
		    period: "2026-10-01 ~ 2026-12-31",
		    status: "GENERATING",
		    createdAt: ago(8),
		    createdBy: "周明（财务负责人）",
		    format: "PDF · JSON",
		    sizeLabel: "—",
		    sections: ["全部委托链", "额度使用率", "越权尝试"]
		  }
		];
		var NOTIFICATIONS = [
		  { id: "ntf-1", title: "有 3 项人工复核待处理", body: "其中 1 项已超时，请尽快处理。", at: ago(9), tone: "warn", read: false, target: "approvals" },
		  { id: "ntf-2", title: "案件 case-003 已升级", body: "供应商账户变更核实升级至合规委员会。", at: ago(110), tone: "danger", read: false, target: "cases" },
		  { id: "ntf-3", title: "月报已生成", body: "2026 年 10 月信任运营月报可下载。", at: ago(5 * 60), tone: "info", read: true, target: "reports" },
		  { id: "ntf-4", title: "策略已发布", body: "代理付款风控策略 2026-10-30-001 已生效。", at: ago(2 * 24 * 60), tone: "success", read: true, target: "governance" }
		];
		function createSeed() {
		  return {
		    version: 1,
		    /* Settled volume of the previous six days; today is computed from tasks. */
		    volumeHistory: [124800, 168200, 96200, 212500, 151400, 183900],
		    seededAt: (/* @__PURE__ */ new Date()).toISOString(),
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
		  };
		}

		// src/client/product/mock/store.js
		var STORAGE_KEY = "dsh-trust-platform.demo-world.v2";
		var idCounter = 0;
		function nextId(prefix) {
		  idCounter += 1;
		  return `${prefix}-${Date.now().toString(36).slice(-4)}${idCounter.toString(36)}`;
		}
		function recordEvent(state, input2) {
		  const event2 = {
		    id: nextId("evt"),
		    taskId: input2.taskId,
		    type: input2.type,
		    typeLabel: input2.typeLabel,
		    actor: input2.actor,
		    actorId: "agent-mobai",
		    at: (/* @__PURE__ */ new Date()).toISOString(),
		    tone: input2.tone || "neutral",
		    verification: "VALID",
		    finality: input2.finality || "PENDING",
		    body: input2.body || "",
		    signature: { algorithm: "Ed25519", keyId: "did:trust:starbridge.pay:audit-01#key-1", value: `sig_${nextId("h")}` },
		    ledger: input2.ledger || null
		  };
		  state.events = [event2, ...state.events];
		  return event2;
		}
		function notify(state, input2) {
		  state.notifications = [{
		    id: nextId("ntf"),
		    title: input2.title,
		    body: input2.body,
		    at: (/* @__PURE__ */ new Date()).toISOString(),
		    tone: input2.tone || "info",
		    read: false,
		    target: input2.target || "dashboard"
		  }, ...state.notifications];
		}
		function loadState() {
		  try {
		    const raw2 = globalThis.localStorage?.getItem(STORAGE_KEY);
		    if (raw2) {
		      const parsed = JSON.parse(raw2);
		      if (parsed && parsed.version === 1 && Array.isArray(parsed.tasks) && Array.isArray(parsed.agents)) return parsed;
		    }
		  } catch {
		  }
		  return createSeed();
		}
		function createDemoStore() {
		  let state = loadState();
		  const listeners = /* @__PURE__ */ new Set();
		  const emit = () => {
		    for (const listener of listeners) listener();
		  };
		  const save = () => {
		    try {
		      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
		    } catch {
		    }
		  };
		  const commit = (mutate) => {
		    mutate(state);
		    state = { ...state };
		    save();
		    emit();
		  };
		  const actions2 = {
		    /**
		     * Approve a pending intervention and let its task proceed.
		     * @param {string} id
		     * @param {{note?: string, by?: string}} [options]
		     */
		    approveIntervention(id, options = {}) {
		      commit((draft) => {
		        const item = draft.interventions.find((entry) => entry.id === id);
		        if (!item || item.status !== "PENDING") return;
		        item.status = "APPROVED";
		        item.decidedAt = ago(0);
		        item.decidedBy = options.by || "周明（财务负责人）";
		        item.decisionNote = options.note || "同意，按流程放行";
		        const task = draft.tasks.find((entry) => entry.id === item.taskId);
		        if (task && (task.status === "PAYREQ_PENDING" || task.status === "CREATED")) {
		          task.status = "AUTHORIZED";
		          task.updatedAt = ago(0);
		        }
		        recordEvent(draft, {
		          taskId: item.taskId,
		          type: "INTERVENTION_APPROVED",
		          typeLabel: "人工复核通过",
		          actor: item.decidedBy,
		          tone: "success",
		          body: item.decisionNote
		        });
		        notify(draft, {
		          title: `复核已通过：${item.title}`,
		          body: `处理人：${item.decidedBy}`,
		          tone: "success",
		          target: "approvals"
		        });
		      });
		    },
		    /**
		     * Deny a pending intervention and stop the linked task.
		     * @param {string} id
		     * @param {{note?: string, by?: string}} [options]
		     */
		    denyIntervention(id, options = {}) {
		      commit((draft) => {
		        const item = draft.interventions.find((entry) => entry.id === id);
		        if (!item || item.status !== "PENDING") return;
		        item.status = "DENIED";
		        item.decidedAt = ago(0);
		        item.decidedBy = options.by || "周明（财务负责人）";
		        item.decisionNote = options.note || "拒绝，退回业务侧补充材料";
		        const task = draft.tasks.find((entry) => entry.id === item.taskId);
		        if (task && (task.status === "PAYREQ_PENDING" || task.status === "CREATED")) {
		          task.status = "CANCELLED";
		          task.updatedAt = ago(0);
		          task.blockedReason = "人工复核拒绝";
		        }
		        recordEvent(draft, {
		          taskId: item.taskId,
		          type: "INTERVENTION_DENIED",
		          typeLabel: "人工复核拒绝",
		          actor: item.decidedBy,
		          tone: "danger",
		          body: item.decisionNote
		        });
		        notify(draft, {
		          title: `复核已拒绝：${item.title}`,
		          body: item.decisionNote,
		          tone: "danger",
		          target: "approvals"
		        });
		      });
		    },
		    /**
		     * Settle a submitted or confirmed task: append a verified FINAL settlement
		     * event, then close the task.
		     * @param {string} taskId
		     * @param {{by?: string, reference?: string}} [options]
		     * @returns {{ok: boolean, reason?: string}}
		     */
		    settleTask(taskId, options = {}) {
		      let result = { ok: false };
		      commit((draft) => {
		        const task = draft.tasks.find((entry) => entry.id === taskId);
		        if (!task) {
		          result = { ok: false, reason: "任务不存在" };
		          return;
		        }
		        if (task.status !== "SUBMITTED" && task.status !== "CONFIRMED") {
		          result = { ok: false, reason: "当前状态不能结算，请先提交付款" };
		          return;
		        }
		        const reference = options.reference || `ledger-usdc-${Math.floor(9e3 + Math.random() * 900)}`;
		        const event2 = recordEvent(draft, {
		          taskId: task.id,
		          type: "SETTLEMENT_FINAL",
		          typeLabel: "结算终局",
		          actor: options.by || "结算代理·小澜",
		          tone: "success",
		          finality: "FINAL",
		          body: `已结算 ${task.amount.toLocaleString("en-US")} ${task.currency}`,
		          ledger: { scheme: "USDC 清算网络", reference }
		        });
		        task.settlementRef = reference;
		        task.status = "CLOSED";
		        task.updatedAt = ago(0);
		        task.closedAt = ago(0);
		        task.reviews = [
		          ...task.reviews || [],
		          { by: event2.actor, at: ago(0), note: "结算事件通过校验，任务关闭" }
		        ];
		        const delegation = draft.delegations.find((entry) => entry.id === task.delegationId);
		        if (delegation) delegation.usedToday = Math.min(delegation.dailyLimit, delegation.usedToday + task.amount);
		        notify(draft, {
		          title: `任务已完成：${task.title}`,
		          body: `结算凭证 ${reference} 已通过校验`,
		          tone: "success",
		          target: "tasks"
		        });
		        result = { ok: true, reference };
		      });
		      return result;
		    },
		    /**
		     * Revoke an active delegation.
		     * @param {string} id
		     * @param {{reason?: string, by?: string}} [options]
		     */
		    revokeDelegation(id, options = {}) {
		      commit((draft) => {
		        const item = draft.delegations.find((entry) => entry.id === id);
		        if (!item || item.status !== "ACTIVE") return;
		        item.status = "REVOKED";
		        item.revokedAt = ago(0);
		        item.revokeReason = options.reason || "管理员手动撤销";
		        recordEvent(draft, {
		          taskId: id,
		          type: "DELEGATION_REVOKED",
		          typeLabel: "撤销委托",
		          actor: options.by || "周明（财务负责人）",
		          tone: "danger",
		          body: item.revokeReason
		        });
		        notify(draft, {
		          title: `委托已撤销：${item.name}`,
		          body: item.revokeReason,
		          tone: "warn",
		          target: "delegations"
		        });
		      });
		    },
		    /**
		     * Create a new payment task awaiting authorization.
		     * @param {{title: string, counterparty: string, purpose: string, amount: number, currency?: string, delegationId?: string}} input
		     * @returns {object|null} the created task
		     */
		    createTask(input2) {
		      let created = null;
		      commit((draft) => {
		        const amount = Number(input2.amount) || 0;
		        const riskScore = Math.min(0.95, 0.18 + amount / 2e5 * 0.7 + Math.random() * 0.08);
		        const task = {
		          id: nextId("task"),
		          title: input2.title,
		          counterparty: input2.counterparty,
		          counterpartyOrg: draft.orgs.find((org) => org.name === input2.counterparty)?.id || "org-yunfan",
		          purpose: input2.purpose,
		          amount,
		          currency: input2.currency || "USD",
		          status: "CREATED",
		          riskScore,
		          riskDecision: riskScore >= 0.8 ? "BLOCK" : riskScore >= 0.6 ? "DEFER" : riskScore >= 0.4 ? "THROTTLE" : "ALLOW",
		          delegationId: input2.delegationId || "del-root",
		          createdAt: ago(0),
		          updatedAt: ago(0),
		          invoiceNo: `NEW-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replaceAll("-", "")}`,
		          reviews: []
		        };
		        draft.tasks = [task, ...draft.tasks];
		        recordEvent(draft, {
		          taskId: task.id,
		          type: "TASK_CREATED",
		          typeLabel: "创建任务",
		          actor: "采购代理·阿澈",
		          body: `${task.title} · ${task.amount.toLocaleString("en-US")} ${task.currency}`
		        });
		        notify(draft, { title: `新任务：${task.title}`, body: "等待授权与风险决策", tone: "info", target: "tasks" });
		        created = task;
		      });
		      return created;
		    },
		    /**
		     * Publish a draft policy.
		     * @param {string} id
		     */
		    publishPolicy(id) {
		      commit((draft) => {
		        const item = draft.policies.find((entry) => entry.id === id);
		        if (!item || item.status === "PUBLISHED") return;
		        item.status = "PUBLISHED";
		        item.publishedAt = ago(0);
		        item.publishedBy = "周明（财务负责人）";
		        recordEvent(draft, {
		          taskId: item.id,
		          type: "POLICY_PUBLISHED",
		          typeLabel: "发布策略",
		          actor: item.publishedBy,
		          tone: "success",
		          body: `${item.name} ${item.version} 已生效`
		        });
		        notify(draft, { title: "策略已发布", body: `${item.name} ${item.version}`, tone: "success", target: "governance" });
		      });
		    },
		    /**
		     * Edit a policy's risk thresholds (draft or published, both take a new revision).
		     * @param {string} id
		     * @param {{block: number, defer: number, throttle: number}} thresholds
		     */
		    savePolicyThresholds(id, thresholds) {
		      commit((draft) => {
		        const item = draft.policies.find((entry) => entry.id === id);
		        if (!item) return;
		        item.thresholds = {
		          block: clamp01(thresholds.block),
		          defer: clamp01(thresholds.defer),
		          throttle: clamp01(thresholds.throttle)
		        };
		        item.revisedAt = ago(0);
		        recordEvent(draft, {
		          taskId: item.id,
		          type: "POLICY_REVISED",
		          typeLabel: "修改策略",
		          actor: "周明（财务负责人）",
		          tone: "info",
		          body: `阈值更新为 ${formatThresholds(item.thresholds)}`
		        });
		      });
		    },
		    /**
		     * Resolve an open case.
		     * @param {string} id
		     * @param {{conclusion?: string, by?: string}} [options]
		     */
		    resolveCase(id, options = {}) {
		      commit((draft) => {
		        const item = draft.cases.find((entry) => entry.id === id);
		        if (!item || item.status === "RESOLVED") return;
		        item.status = "RESOLVED";
		        item.resolvedAt = ago(0);
		        item.conclusion = options.conclusion || "调查完成，已按结论整改";
		        item.coverage = Math.min(1, item.coverage + 0.3);
		        item.findings = [...item.findings || [], { at: ago(0), text: `结案：${item.conclusion}` }];
		        recordEvent(draft, {
		          taskId: item.id,
		          type: "CASE_RESOLVED",
		          typeLabel: "案件结案",
		          actor: options.by || "合规审计代理·墨白",
		          tone: "success",
		          body: item.conclusion
		        });
		        notify(draft, { title: `案件已结案：${item.title}`, body: item.conclusion, tone: "success", target: "cases" });
		      });
		    },
		    /**
		     * Anchor one evidence record.
		     * @param {string} id
		     */
		    anchorEvidence(id) {
		      commit((draft) => {
		        const item = draft.evidence.find((entry) => entry.id === id);
		        if (!item || item.anchored) return;
		        item.anchored = true;
		        item.anchoredAt = ago(0);
		      });
		    },
		    /**
		     * Generate a report record.
		     * @param {{title: string, period: string, sections?: string[]}} input
		     */
		    generateReport(input2) {
		      commit((draft) => {
		        const report = {
		          id: nextId("rpt"),
		          title: input2.title,
		          period: input2.period,
		          status: "READY",
		          createdAt: ago(0),
		          createdBy: "合规审计代理·墨白",
		          format: "PDF · JSON",
		          sizeLabel: "1.2 MB",
		          sections: input2.sections || ["委托链健康度", "风险决策分布", "结算闭环"]
		        };
		        draft.reports = [report, ...draft.reports];
		        notify(draft, { title: "报告已生成", body: report.title, tone: "success", target: "reports" });
		      });
		    },
		    /**
		     * Mark one notification as read.
		     * @param {string} id
		     */
		    markNotificationRead(id) {
		      commit((draft) => {
		        const item = draft.notifications.find((entry) => entry.id === id);
		        if (item) item.read = true;
		      });
		    },
		    /** Mark every notification as read. */
		    markAllNotificationsRead() {
		      commit((draft) => {
		        for (const item of draft.notifications) item.read = true;
		      });
		    },
		    /** Restore the pristine demo world. */
		    resetDemo() {
		      state = createSeed();
		      save();
		      emit();
		    },
		    /** Persist current state immediately (used by debug/export flows). */
		    flush() {
		      save();
		    }
		  };
		  return {
		    subscribe(listener) {
		      listeners.add(listener);
		      return () => listeners.delete(listener);
		    },
		    getSnapshot() {
		      return state;
		    },
		    getServerSnapshot() {
		      return state;
		    },
		    actions: actions2
		  };
		}
		function clamp01(value) {
		  const number = Number(value);
		  if (Number.isNaN(number)) return 0;
		  return Math.max(0, Math.min(1, Math.round(number * 100) / 100));
		}
		function formatThresholds(thresholds) {
		  return `拦截 ${thresholds.block.toFixed(2)} · 转人工 ${thresholds.defer.toFixed(2)} · 限流 ${thresholds.throttle.toFixed(2)}`;
		}
		var singleton = null;
		function getDemoStore() {
		  if (!singleton) singleton = createDemoStore();
		  return singleton;
		}

		// src/client/product/hooks.js
		var store = () => getDemoStore();
		function useWorld() {
		  return (0, import_react8.useSyncExternalStore)(
		    (listener) => store().subscribe(listener),
		    () => store().getSnapshot(),
		    () => store().getServerSnapshot()
		  );
		}
		function useActions() {
		  return store().actions;
		}

		// src/client/product/selectors.js
		var MINUTE2 = 60 * 1e3;
		var HOUR2 = 60 * MINUTE2;
		var DAY2 = 24 * HOUR2;
		var TASK_FLOW = ["CREATED", "AUTHORIZED", "PAYREQ_PENDING", "SUBMITTED", "CONFIRMED", "AUDITED", "CLOSED"];
		function taskById(world, id) {
		  return world.tasks.find((task) => task.id === id) || null;
		}
		function agentById(world, id) {
		  return world.agents.find((agent) => agent.id === id) || null;
		}
		function delegationById(world, id) {
		  return world.delegations.find((item) => item.id === id) || null;
		}
		function caseById(world, id) {
		  return world.cases.find((item) => item.id === id) || null;
		}
		function openInterventions(world) {
		  return world.interventions.filter((item) => item.status === "PENDING").sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime());
		}
		function overdueCount(world) {
		  return world.interventions.filter((item) => item.status === "PENDING" && new Date(item.dueAt).getTime() < Date.now()).length;
		}
		function dashboardStats(world) {
		  const totalTasks = world.tasks.length;
		  const closedTasks = world.tasks.filter((task) => task.status === "CLOSED").length;
		  const settledVolume = world.tasks.filter((task) => ["SUBMITTED", "CONFIRMED", "AUDITED", "CLOSED"].includes(task.status)).reduce((sum, task) => sum + task.amount, 0);
		  const monthlyVolume = world.agents.reduce((sum, agent) => sum + agent.monthlyVolume, 0);
		  const decided = world.interventions.filter((item) => item.status === "APPROVED" || item.status === "DENIED");
		  const avgDecisionMinutes = decided.length ? decided.reduce((sum, item) => sum + Math.max(1, (new Date(item.decidedAt).getTime() - new Date(item.requestedAt).getTime()) / MINUTE2), 0) / decided.length : 0;
		  const blocked = world.tasks.filter((task) => task.riskDecision === "BLOCK").length;
		  const humanReview = world.tasks.filter((task) => task.riskDecision === "DEFER" || task.riskDecision === "THROTTLE").length;
		  return {
		    totalTasks,
		    closedTasks,
		    settledVolume,
		    monthlyVolume,
		    openApprovals: openInterventions(world).length,
		    overdueApprovals: overdueCount(world),
		    activeDelegations: world.delegations.filter((item) => item.status === "ACTIVE").length,
		    activeAgents: world.agents.filter((agent) => agent.status === "ACTIVE").length,
		    activeCredentials: world.credentials.filter((item) => item.status === "ACTIVE").length,
		    blocked,
		    humanReview,
		    anchorRate: world.evidence.length ? world.evidence.filter((item) => item.anchored).length / world.evidence.length : 0,
		    avgDecisionMinutes,
		    verificationRate: world.events.length ? world.events.filter((event2) => event2.verification === "VALID").length / world.events.length : 0,
		    riskEvents7d: world.events.filter((event2) => event2.type.startsWith("RISK_") && Date.now() - new Date(event2.at).getTime() < 7 * DAY2).length,
		    openCases: world.cases.filter((item) => item.status !== "RESOLVED").length,
		    successRate: totalTasks ? closedTasks / totalTasks : 0
		  };
		}
		function riskDistribution(world) {
		  return Object.keys(RISK_DECISION).map((key) => ({
		    key,
		    ...RISK_DECISION[key],
		    count: world.tasks.filter((task) => task.riskDecision === key).length
		  }));
		}
		function volumeSeries(world, days = 7) {
		  const buckets = [];
		  const history = Array.isArray(world.volumeHistory) ? world.volumeHistory : [];
		  const now = /* @__PURE__ */ new Date();
		  now.setHours(0, 0, 0, 0);
		  for (let offset = days - 1; offset >= 0; offset -= 1) {
		    const start = now.getTime() - offset * DAY2;
		    const end = start + DAY2;
		    const tasks = world.tasks.filter((task) => {
		      const at = new Date(task.createdAt).getTime();
		      return at >= start && at < end;
		    });
		    const seeded = offset > 0 ? history[offset - 1] || 0 : 0;
		    const live = tasks.reduce((sum, task) => sum + task.amount, 0);
		    buckets.push({
		      label: `${new Date(start).getMonth() + 1}/${new Date(start).getDate()}`,
		      value: offset > 0 ? seeded : live,
		      count: tasks.length,
		      isToday: offset === 0
		    });
		  }
		  return buckets;
		}
		function chainFor(world, delegationId) {
		  const chain = [];
		  let current = delegationById(world, delegationId);
		  let guard = 0;
		  while (current && guard < 12) {
		    chain.unshift(current);
		    current = current.parentId ? delegationById(world, current.parentId) : null;
		    guard += 1;
		  }
		  return chain;
		}
		function chainEffective(world, delegationId) {
		  const chain = chainFor(world, delegationId);
		  if (!chain.length) return null;
		  const active = chain.every((item) => item.status === "ACTIVE");
		  const amountLimit = Math.min(...chain.map((item) => item.amountLimit));
		  const dailyLimit = Math.min(...chain.map((item) => item.dailyLimit));
		  const usedToday = chain.length ? chain[chain.length - 1].usedToday : 0;
		  const actions2 = chain.map((item) => item.actionLabels);
		  return {
		    active,
		    chain,
		    amountLimit,
		    dailyLimit,
		    dailyRemaining: Math.max(0, dailyLimit - usedToday),
		    usedToday,
		    leafActions: actions2[actions2.length - 1] || []
		  };
		}
		function taskEvents(world, taskId) {
		  return world.events.filter((event2) => event2.taskId === taskId).sort((left, right) => new Date(left.at).getTime() - new Date(right.at).getTime());
		}
		function interventionsForTask(world, taskId) {
		  return world.interventions.filter((item) => item.taskId === taskId);
		}
		function evidenceForTask(world, taskId) {
		  return world.evidence.filter((item) => item.subject.includes(taskId));
		}
		function taskProgress(task) {
		  const terminal = ["CLOSED", "FAILED", "CANCELLED"];
		  if (terminal.includes(task.status)) {
		    return task.status === "CLOSED" ? { ratio: 1, step: TASK_FLOW.length, label: "已完成" } : { ratio: 0, step: TASK_FLOW.indexOf("CREATED") + 1, label: TASK_STATUS[task.status]?.label || task.status };
		  }
		  const index = TASK_FLOW.indexOf(task.status);
		  const step = Math.max(1, index + 1);
		  return { ratio: step / TASK_FLOW.length, step, label: TASK_STATUS[task.status]?.label || task.status };
		}
		function recentActivity(world, limit = 8) {
		  return [...world.events].sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime()).slice(0, limit);
		}
		function unreadNotifications(world) {
		  return world.notifications.filter((item) => !item.read);
		}
		function agentLeaderboard(world, limit = 4) {
		  return [...world.agents].filter((agent) => agent.role !== "compliance").sort((left, right) => right.monthlyVolume - left.monthlyVolume).slice(0, limit);
		}
		function attentionItems(world) {
		  const items = [];
		  const overdue = world.interventions.filter((item) => item.status === "PENDING" && new Date(item.dueAt).getTime() < Date.now());
		  for (const item of overdue) items.push({ tone: "danger", title: `复核超时：${item.title}`, detail: `已超时，需立即处理`, to: "approvals" });
		  const blocked = world.tasks.filter((task) => task.status === "CREATED" && task.riskDecision === "BLOCK");
		  for (const task of blocked) items.push({ tone: "warn", title: `付款被拦截：${task.title}`, detail: task.blockedReason || "等待人工介入", to: "tasks", params: { taskId: task.id } });
		  const escalated = world.cases.filter((item) => item.status === "ESCALATED");
		  for (const item of escalated) items.push({ tone: "danger", title: `案件升级：${item.title}`, detail: "已升级至合规委员会", to: "audit", params: { caseId: item.id } });
		  const expiring = world.delegations.filter((item) => item.status === "ACTIVE" && new Date(item.validTo).getTime() - Date.now() < 3 * DAY2);
		  for (const item of expiring) items.push({ tone: "info", title: `委托即将到期：${item.name}`, detail: "3 天内到期，请确认是否续期", to: "delegations" });
		  return items;
		}
		function caseStats(world) {
		  return {
		    open: world.cases.filter((item) => item.status === "OPEN").length,
		    escalated: world.cases.filter((item) => item.status === "ESCALATED").length,
		    resolved: world.cases.filter((item) => item.status === "RESOLVED").length,
		    avgCoverage: world.cases.length ? world.cases.reduce((sum, item) => sum + item.coverage, 0) / world.cases.length : 0
		  };
		}
		function roster(world) {
		  return [...world.agents].sort((left, right) => {
		    if (left.role === "compliance") return 1;
		    if (right.role === "compliance") return -1;
		    return right.monthlyVolume - left.monthlyVolume;
		  });
		}
		function agentTaskIds(world, agentId) {
		  const agent = agentById(world, agentId);
		  if (!agent) return [];
		  const dids = /* @__PURE__ */ new Set([agent.did]);
		  const ids = /* @__PURE__ */ new Set();
		  for (const event2 of world.events) {
		    if (event2.actorId === agentId || event2.actor && agent.name && event2.actor.includes(agent.shortName)) ids.add(event2.taskId);
		  }
		  for (const task of world.tasks) {
		    if (task.delegationId && ids.size < 4 && new Date(task.createdAt).getTime() > 0) {
		      const chain = chainFor(world, task.delegationId);
		      if (chain.some((item) => item.subjectId === agentId)) ids.add(task.id);
		    }
		  }
		  return [...ids];
		}
		function searchAll(world, query) {
		  const text = String(query || "").trim().toLowerCase();
		  if (!text) return [];
		  const hits = [];
		  for (const task of world.tasks) {
		    if (`${task.title} ${task.counterparty} ${task.invoiceNo}`.toLowerCase().includes(text)) hits.push({ kind: "task", id: task.id, title: task.title, detail: `${task.counterparty} · ${task.status}` });
		  }
		  for (const agent of world.agents) {
		    if (`${agent.name} ${agent.did} ${agent.roleLabel}`.toLowerCase().includes(text)) hits.push({ kind: "agent", id: agent.id, title: agent.name, detail: agent.roleLabel });
		  }
		  for (const item of world.cases) {
		    if (`${item.title} ${item.summary}`.toLowerCase().includes(text)) hits.push({ kind: "case", id: item.id, title: item.title, detail: item.status });
		  }
		  for (const item of world.policies.concat(world.models)) {
		    if (`${item.name} ${item.version}`.toLowerCase().includes(text)) hits.push({ kind: "governance", id: item.id, title: item.name, detail: item.version });
		  }
		  return hits.slice(0, 12);
		}

		// src/client/product/pages/dashboard.jsx
		var import_jsx_runtime7 = require("react/jsx-runtime");
		var RISK_COLORS = { ALLOW: "#1f9d63", THROTTLE: "#0a6cff", DEFER: "#b36b00", BLOCK: "#d92d20" };
		function DashboardPage() {
		  const world = useWorld();
		  const { navigate, go } = useNavigation();
		  const stats = dashboardStats(world);
		  const volumes = volumeSeries(world);
		  const risks = riskDistribution(world);
		  const pending = openInterventions(world);
		  const attention = attentionItems(world);
		  const activity = recentActivity(world, 7);
		  const leaders = agentLeaderboard(world);
		  const maxVolume = Math.max(...volumes.map((item) => item.value), 1);
		  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-page", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		      PageHead,
		      {
		        title: "今天需要你关注的事情",
		        desc: "代理正在按委托链执行交易。你只需处理被规则挑出来的例外。",
		        actions: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Button, { icon: "plus", onClick: () => navigate("tasks", { create: true }), children: "新建付款任务" }),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Button, { variant: "primary", icon: "checkCircle", onClick: () => go("approvals"), children: [
		            "处理审批",
		            pending.length ? ` · ${pending.length}` : ""
		          ] })
		        ] })
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-stat-grid", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		        StatCard,
		        {
		          label: "待我审批",
		          value: pending.length,
		          unit: "项",
		          icon: "shield",
		          iconTone: "var(--tp-warn)",
		          foot: stats.overdueApprovals ? `${stats.overdueApprovals} 项已超时` : "全部按时"
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		        StatCard,
		        {
		          label: "本月代理交易额",
		          value: fmtMoney(stats.monthlyVolume),
		          icon: "trendUp",
		          iconTone: "var(--tp-accent)",
		          delta: "8.4%",
		          foot: "环比上月"
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		        StatCard,
		        {
		          label: "委托链健康",
		          value: `${stats.activeDelegations}/${world.delegations.length}`,
		          unit: "生效",
		          icon: "branch",
		          iconTone: "var(--tp-success)",
		          foot: "无失效链路"
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		        StatCard,
		        {
		          label: "待处理案件",
		          value: stats.openCases,
		          unit: "个",
		          icon: "flag",
		          iconTone: stats.openCases ? "var(--tp-danger)" : "var(--tp-success)",
		          foot: stats.openCases ? "含 1 个已升级" : "无未结案件"
		        }
		      )
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-grid-2-1", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Card, { title: "近 7 天交易额", desc: "按任务创建时间汇总", actions: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Tag, { tone: "info", children: [
		        "近 7 天 ",
		        fmtMoney(volumes.reduce((sum, item) => sum + item.value, 0))
		      ] }), children: [
		        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		          Bars,
		          {
		            items: volumes.map((item) => ({
		              label: item.label,
		              value: item.value,
		              tone: item.value > maxVolume * 0.85 ? "warn" : ""
		            })),
		            height: 112
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-chart-foot", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "tp-faint", children: "今日" }),
		            " ",
		            fmtMoney(volumes[volumes.length - 1].value)
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "tp-faint", children: "日均" }),
		            " ",
		            fmtMoney(volumes.reduce((sum, item) => sum + item.value, 0) / volumes.length)
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "tp-faint", children: "最高" }),
		            " ",
		            fmtMoney(maxVolume)
		          ] })
		        ] })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Card, { title: "风险决策分布", desc: "全部付款任务", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-donut-row", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		            Donut,
		            {
		              segments: risks.map((item) => ({ label: item.label, value: item.count, color: RISK_COLORS[item.key] })),
		              center: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
		                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tp-donut-value", children: world.tasks.length }),
		                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tp-faint", children: "任务" })
		              ] })
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Legend, { items: risks.map((item) => ({ label: item.label, color: RISK_COLORS[item.key], value: item.count })) })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-card-note", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: "info", size: 13 }),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { children: [
		            "拦截 ",
		            stats.blocked,
		            " 笔 · 人工复核 ",
		            stats.humanReview,
		            " 笔"
		          ] })
		        ] })
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-grid-2-1", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		        Card,
		        {
		          title: "需要关注",
		          desc: "按优先级排序的例外处理",
		          actions: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => go("approvals"), children: "查看全部" }),
		          children: attention.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(EmptyState, { icon: "checkCircle", title: "没有待处理事项", desc: "所有代理都在授权范围内正常工作。" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tp-attention", children: attention.slice(0, 5).map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
		            "button",
		            {
		              type: "button",
		              className: `tp-attention-row ${item.tone}`,
		              onClick: () => item.params?.taskId ? navigate("task", item.params) : item.params?.caseId ? navigate("case", item.params) : go(item.to),
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: `tp-attention-icon ${item.tone}`, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: item.tone === "danger" ? "alert" : item.tone === "warn" ? "clock" : "info", size: 14 }) }),
		                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "tp-attention-main", children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "tp-attention-title", children: item.title }),
		                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "tp-attention-detail", children: item.detail })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: "chevronRight", size: 15 })
		              ]
		            },
		            `${item.title}-${index}`
		          )) })
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Card, { title: "待我审批", desc: "超过 SLA 会标红", actions: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => go("approvals"), children: "去审批" }), children: pending.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(EmptyState, { icon: "checkCircle", title: "审批已清空", desc: "新的例外会实时出现在这里。" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tp-mini-list", children: pending.slice(0, 3).map((item) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", { type: "button", className: "tp-mini-item", onClick: () => go("approvals"), children: [
		        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-mini-main", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tp-mini-title", children: item.title }),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tp-mini-sub", children: item.reason })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-mini-meta", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(StatusTag, { map: INTERVENTION_STATUS, status: item.status }),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: new Date(item.dueAt) < Date.now() ? "tp-danger-text" : "tp-faint", children: new Date(item.dueAt) < Date.now() ? "已超时" : fmtRelative(item.dueAt) })
		        ] })
		      ] }, item.id)) }) })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-grid-2-1", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Card, { title: "最近动态", desc: "已签名并校验的审计事件", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tp-activity", children: activity.map((event2) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-activity-row", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: `tp-activity-node ${event2.tone}` }),
		        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-activity-main", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-activity-title", children: [
		            event2.typeLabel,
		            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "tp-faint", children: [
		              " · ",
		              event2.actor
		            ] })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tp-activity-body", children: event2.body })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "tp-activity-time", children: fmtRelative(event2.at) })
		      ] }, event2.id)) }) }),
		      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Card, { title: "代理活跃度", desc: "按本月经手金额", actions: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => go("agents"), children: "代理名册" }), children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tp-leader-list", children: leaders.map((agent) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", { type: "button", className: "tp-leader-item", onClick: () => navigate("agent", { agentId: agent.id }), children: [
		        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Avatar, { name: agent.shortName, seed: agent.id, size: "sm" }),
		        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-leader-main", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tp-leader-name", children: agent.name }),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Progress, { value: agent.monthlyVolume / Math.max(1, leaders[0].monthlyVolume) })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-leader-meta", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tp-strong tp-num", children: fmtMoney(agent.monthlyVolume) }),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-faint", children: [
		            "成功率 ",
		            fmtPct(agent.successRate)
		          ] })
		        ] })
		      ] }, agent.id)) }) })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tp-footer-note", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: "lock", size: 13 }),
		      "所有交易都留有可验证的签名事件。数据来自演示世界，刷新页面或重置后恢复。"
		    ] })
		  ] });
		}

		// src/client/product/pages/approvals.jsx
		var import_react9 = require("react");
		var import_jsx_runtime8 = require("react/jsx-runtime");
		function ApprovalsPage() {
		  const world = useWorld();
		  const actions2 = useActions();
		  const { navigate } = useNavigation();
		  const toast = useToast();
		  const [filter, setFilter] = (0, import_react9.useState)("pending");
		  const [selectedId, setSelectedId] = (0, import_react9.useState)(null);
		  const [decision, setDecision] = (0, import_react9.useState)(null);
		  const [note2, setNote] = (0, import_react9.useState)("");
		  const pending = openInterventions(world);
		  const history = (0, import_react9.useMemo)(() => world.interventions.filter((item) => item.status !== "PENDING").sort((left, right) => new Date(right.decidedAt).getTime() - new Date(left.decidedAt).getTime()), [world.interventions]);
		  const items = filter === "pending" ? pending : history;
		  const selected = world.interventions.find((item) => item.id === selectedId) || null;
		  const selectedTask = selected ? taskById(world, selected.taskId) : null;
		  const chain = selectedTask ? chainFor(world, selectedTask.delegationId) : [];
		  const openDecision = (mode) => {
		    setDecision(mode);
		    setNote(mode === "approve" ? "同意，按流程放行" : "拒绝，退回业务侧补充材料");
		  };
		  const submitDecision = () => {
		    if (!selected) return;
		    if (decision === "approve") {
		      actions2.approveIntervention(selected.id, { note: note2 });
		      toast.push("已通过复核，任务恢复执行", "success");
		    } else {
		      actions2.denyIntervention(selected.id, { note: note2 });
		      toast.push("已拒绝复核，任务已停止", "info");
		    }
		    setDecision(null);
		    setSelectedId(null);
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-page", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		      PageHead,
		      {
		        title: "审批工作台",
		        desc: "只处理被规则转人工的例外。通过后代理继续执行；拒绝会终止对应任务。",
		        actions: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		          Segmented,
		          {
		            value: filter,
		            onChange: setFilter,
		            options: [
		              { value: "pending", label: `待处理 ${pending.length}` },
		              { value: "history", label: `已处理 ${history.length}` }
		            ]
		          }
		        )
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-sla-strip", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-sla-item", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-faint", children: "最早截止" }),
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-strong", children: pending.length ? fmtCountdown(pending[0].dueAt) : "—" })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-sla-item", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-faint", children: "已超时" }),
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: `tp-strong ${pending.some((item) => new Date(item.dueAt) < Date.now()) ? "tp-danger-text" : ""}`, children: [
		          world.interventions.filter((item) => item.status === "PENDING" && new Date(item.dueAt) < Date.now()).length,
		          " 项"
		        ] })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-sla-item", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-faint", children: "平均处理时长" }),
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-strong", children: avgDecision(world.interventions) })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-sla-item", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-faint", children: "本月通过率" }),
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-strong", children: approvalRate(world.interventions) })
		      ] })
		    ] }),
		    items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		      EmptyState,
		      {
		        icon: "checkCircle",
		        title: filter === "pending" ? "审批队列已清空" : "还没有处理记录",
		        desc: filter === "pending" ? "新的例外会自动出现在这里，并发送通知。" : "处理过的复核会保留完整的审计记录。"
		      }
		    ) }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-approval-list", children: items.map((item) => {
		      const task = taskById(world, item.taskId);
		      const delegation = task ? world.delegations.find((entry) => entry.id === task.delegationId) : null;
		      const overdue = item.status === "PENDING" && new Date(item.dueAt) < Date.now();
		      return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(Card, { className: `tp-approval-card ${overdue ? "overdue" : ""}`, children: [
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-approval-head", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: `tp-approval-icon ${overdue ? "danger" : item.status === "PENDING" ? "warn" : "success"}`, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: overdue ? "alert" : item.level >= 3 ? "shield" : "clock", size: 16 }) }),
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-approval-title-block", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-approval-title", children: item.title }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-approval-sub", children: [
		              task ? task.counterparty : "—",
		              " · ",
		              task ? fmtMoney(task.amount, task.currency) : "—",
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-dot-sep" }),
		              "发起于 ",
		              fmtRelative(item.requestedAt)
		            ] })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-approval-status", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(StatusTag, { map: INTERVENTION_STATUS, status: item.status }),
		            item.status === "PENDING" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: overdue ? "tp-danger-text tp-small" : "tp-faint tp-small", children: overdue ? "已超时" : `${fmtCountdown(item.dueAt)}内处理` }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "tp-faint tp-small", children: [
		              item.decidedBy,
		              " · ",
		              fmtRelative(item.decidedAt)
		            ] })
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-approval-reason", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "info", size: 14 }),
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: item.reason })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-approval-grid", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-label", children: "风险评估" }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-risk-row", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Progress, { value: item.riskScore, tone: item.riskScore >= 0.8 ? "danger" : item.riskScore >= 0.6 ? "warn" : "" }),
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-strong tp-num", children: item.riskScore.toFixed(2) }),
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Tag, { tone: RISK_DECISION[task?.riskDecision]?.tone || "neutral", children: RISK_DECISION[task?.riskDecision]?.label || "—" })
		            ] })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-label", children: "任务金额" }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-strong", children: task ? fmtMoney(task.amount, task.currency) : "—" }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-faint tp-small", children: [
		              "单笔上限 ",
		              task?.delegationId ? fmtMoney(chainEffective(world, task.delegationId)?.amountLimit) : "—"
		            ] })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-label", children: "关联代理" }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-strong", children: delegation ? delegation.subjectName : "未指派" }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-faint tp-small", children: delegation ? DELEGATION_STATUS[delegation.status]?.label : task ? TASK_STATUS[task.status]?.label : "" })
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-approval-actions", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(Button, { size: "sm", variant: "ghost", onClick: () => {
		            setSelectedId(item.id);
		            setDecision(null);
		          }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "eye", size: 14 }),
		            " 查看详情"
		          ] }),
		          item.status === "PENDING" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(Button, { size: "sm", onClick: () => {
		              setSelectedId(item.id);
		              openDecision("deny");
		            }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "x", size: 14 }),
		              " 拒绝"
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(Button, { size: "sm", variant: "primary", onClick: () => {
		              setSelectedId(item.id);
		              openDecision("approve");
		            }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "check", size: 14 }),
		              " 通过复核"
		            ] })
		          ] }) : null
		        ] })
		      ] }, item.id);
		    }) }),
		    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		      Drawer,
		      {
		        open: Boolean(selected),
		        onClose: () => {
		          setSelectedId(null);
		          setDecision(null);
		        },
		        title: selected?.title || "",
		        subtitle: selectedTask ? `${selectedTask.counterparty} · ${fmtMoney(selectedTask.amount, selectedTask.currency)}` : "",
		        width: 520,
		        footer: selected?.status === "PENDING" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-drawer-actions", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { onClick: () => openDecision("deny"), children: "拒绝" }),
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { variant: "primary", onClick: () => openDecision("approve"), children: "通过复核" })
		        ] }) : null,
		        children: selected ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-stack", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-callout", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-callout-title", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "info", size: 14 }),
		              " 为什么需要人工复核"
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-callout-body", children: selected.reason }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-callout-detail", children: selected.detail })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(KV, { items: [
		            { k: "复核级别", v: `L${selected.level}` },
		            { k: "发起方", v: selected.requestedBy },
		            { k: "截止时间", v: `${fmtDateTime(selected.dueAt)}（${fmtCountdown(selected.dueAt)}）` },
		            { k: "风险分", v: `${selected.riskScore.toFixed(2)}` },
		            { k: "关联任务", v: selectedTask ? selectedTask.title : "—" }
		          ] }),
		          selectedTask ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(Card, { flat: true, title: "付款任务", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(KV, { items: [
		              { k: "金额", v: fmtMoney(selectedTask.amount, selectedTask.currency) },
		              { k: "收款方", v: selectedTask.counterparty },
		              { k: "状态", v: TASK_STATUS[selectedTask.status]?.label || selectedTask.status },
		              { k: "发票号", v: selectedTask.invoiceNo }
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(Button, { size: "sm", variant: "ghost", style: { marginTop: 8 }, onClick: () => navigate("task", { taskId: selectedTask.id }), children: [
		              "打开任务详情 ",
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "arrowRight", size: 13 })
		            ] })
		          ] }) : null,
		          chain.length ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Card, { flat: true, title: "委托链", desc: "从发起人到执行人的授权路径", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-chain", children: chain.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-chain-node", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-chain-line", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-chain-avatar", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Avatar, { name: item.issuerName, seed: item.issuerDid, size: "sm" }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-chain-name", children: item.issuerName }),
		              index < chain.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "chevronDown", size: 13 }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Tag, { tone: "success", children: "执行人" })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-chain-detail", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
		                "单笔上限 ",
		                fmtMoney(item.amountLimit)
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
		                "已用 ",
		                fmtMoney(item.usedToday),
		                " / ",
		                fmtMoney(item.dailyLimit)
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(StatusTag, { map: DELEGATION_STATUS, status: item.status })
		            ] })
		          ] }, item.id)) }) }) : null,
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Card, { flat: true, title: "证据与事件", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-evidence-list", children: taskEvents(world, selected.taskId).map((event2) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-evidence-row", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "checkCircle", size: 13 }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-strong", children: event2.typeLabel }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-faint", children: event2.actor }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "tp-faint", style: { marginLeft: "auto" }, children: fmtRelative(event2.at) })
		          ] }, event2.id)) }) }),
		          selected.status !== "PENDING" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-callout success", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-callout-title", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "checkCircle", size: 14 }),
		              " 处理记录"
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-callout-body", children: selected.decisionNote }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-callout-detail", children: [
		              selected.decidedBy,
		              " · ",
		              fmtDateTime(selected.decidedAt)
		            ] })
		          ] }) : null
		        ] }) : null
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		      Drawer,
		      {
		        open: Boolean(decision) && Boolean(selected),
		        onClose: () => setDecision(null),
		        title: decision === "approve" ? "通过复核" : "拒绝复核",
		        subtitle: selected ? selected.title : "",
		        width: 460,
		        footer: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-drawer-actions", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { variant: "ghost", onClick: () => setDecision(null), children: "取消" }),
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { variant: decision === "approve" ? "primary" : "danger", onClick: submitDecision, children: decision === "approve" ? "确认通过" : "确认拒绝" })
		        ] }),
		        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-stack", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: `tp-callout ${decision === "approve" ? "success" : "danger"}`, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tp-callout-title", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: decision === "approve" ? "checkCircle" : "alert", size: 14 }),
		              decision === "approve" ? "通过后，任务将恢复执行" : "拒绝后，任务将立即停止"
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tp-callout-detail", children: decision === "approve" ? "代理会在原委托额度内继续提交付款，所有动作仍会留下审计事件。" : "任务状态会变为已取消，供应商侧会收到通知，委托额度不会被占用。" })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Field, { label: "处理意见", hint: "会写入审计记录，对代理和审计员可见", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("textarea", { className: "tp-textarea", value: note2, onChange: (event2) => setNote(event2.target.value), rows: 4 }) })
		        ] })
		      }
		    )
		  ] });
		}
		function avgDecision(interventions) {
		  const decided = interventions.filter((item) => item.decidedAt);
		  if (!decided.length) return "—";
		  const minutes = decided.reduce((sum, item) => sum + (new Date(item.decidedAt) - new Date(item.requestedAt)) / 6e4, 0) / decided.length;
		  if (minutes < 60) return `${Math.round(minutes)} 分钟`;
		  return `${(minutes / 60).toFixed(1)} 小时`;
		}
		function approvalRate(interventions) {
		  const decided = interventions.filter((item) => item.status === "APPROVED" || item.status === "DENIED");
		  if (!decided.length) return "—";
		  return fmtPct(decided.filter((item) => item.status === "APPROVED").length / decided.length);
		}

		// src/client/product/pages/tasks.jsx
		var import_react10 = require("react");
		var import_jsx_runtime9 = require("react/jsx-runtime");
		var STATUS_GROUPS = {
		  pending: ["CREATED", "PAYREQ_PENDING"],
		  progress: ["AUTHORIZED", "DELEGATING", "QUOTING", "SELECTED", "SUBMITTED", "CONFIRMED", "AUDITED"],
		  done: ["CLOSED"],
		  exception: ["FAILED", "CANCELLED"]
		};
		var FILTERS = [
		  { value: "all", label: "全部" },
		  { value: "pending", label: "待处理" },
		  { value: "progress", label: "进行中" },
		  { value: "done", label: "已完成" },
		  { value: "exception", label: "异常" }
		];
		var RISK_OPTIONS = [
		  { value: "all", label: "全部风险决策" },
		  ...Object.entries(RISK_DECISION).map(([value, item]) => ({ value, label: item.label }))
		];
		var TERMINAL_BAD_STATES = ["FAILED", "CANCELLED"];
		var sumAmount = (tasks) => tasks.reduce((total, task) => total + (Number(task.amount) || 0), 0);
		function TasksPage() {
		  const world = useWorld();
		  const actions2 = useActions();
		  const toast = useToast();
		  const { navigate, route } = useNavigation();
		  const [keyword, setKeyword] = (0, import_react10.useState)("");
		  const [filter, setFilter] = (0, import_react10.useState)("all");
		  const [riskFilter, setRiskFilter] = (0, import_react10.useState)("all");
		  const [createOpen, setCreateOpen] = (0, import_react10.useState)(Boolean(route.params?.create));
		  const [draft, setDraft] = (0, import_react10.useState)({ title: "", counterparty: "云帆贸易", amount: "", purpose: "", delegationId: "del-root" });
		  const orgOptions = world.orgs.map((org) => ({ value: org.name, label: org.name }));
		  const delegationOptions = world.delegations.filter((item) => item.status === "ACTIVE").map((item) => ({ value: item.id, label: item.name }));
		  const openCreate = () => setCreateOpen(true);
		  const submitCreate = () => {
		    const amount = Number(draft.amount);
		    if (!draft.title.trim() || !amount || amount <= 0) {
		      toast.push("请填写付款用途与金额", "error");
		      return;
		    }
		    const created = actions2.createTask({
		      ...draft,
		      amount,
		      title: draft.title.trim(),
		      purpose: draft.purpose.trim() || "代理发起的付款申请"
		    });
		    setCreateOpen(false);
		    setDraft({ title: "", counterparty: "云帆贸易", amount: "", purpose: "", delegationId: "del-root" });
		    if (created) {
		      toast.push("付款任务已创建，等待授权与风险决策", "success");
		      navigate("task", { taskId: created.id });
		    }
		  };
		  const tasks = [...world.tasks].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
		  const filterOptions = FILTERS.map((item) => ({
		    value: item.value,
		    label: item.label,
		    count: item.value === "all" ? tasks.length : tasks.filter((task) => STATUS_GROUPS[item.value].includes(task.status)).length
		  }));
		  const query = keyword.trim().toLowerCase();
		  const visible = tasks.filter((task) => {
		    const group = filter === "all" ? null : STATUS_GROUPS[filter];
		    if (group && !group.includes(task.status)) return false;
		    if (riskFilter !== "all" && task.riskDecision !== riskFilter) return false;
		    if (!query) return true;
		    const delegation = delegationById(world, task.delegationId);
		    return [task.title, task.counterparty, task.invoiceNo, task.purpose, task.id, delegation?.subjectName || ""].some((text) => String(text || "").toLowerCase().includes(query));
		  });
		  const pending = tasks.filter((task) => STATUS_GROUPS.pending.includes(task.status));
		  const inFlight = tasks.filter((task) => STATUS_GROUPS.progress.includes(task.status));
		  const closed = tasks.filter((task) => task.status === "CLOSED");
		  const blocked = tasks.filter((task) => task.riskDecision === "BLOCK" && task.status !== "CLOSED");
		  const hasFilter = Boolean(query) || filter !== "all" || riskFilter !== "all";
		  const resetFilters = () => {
		    setKeyword("");
		    setFilter("all");
		    setRiskFilter("all");
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-page", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		      PageHead,
		      {
		        title: "付款任务",
		        desc: "公司代理提交的每一笔付款都在这里留痕。授权、风控、人工复核与结算结果实时更新。",
		        actions: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-inline", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Segmented, { value: filter, onChange: setFilter, options: filterOptions }),
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { variant: "primary", icon: "plus", onClick: openCreate, children: "新建付款任务" })
		        ] })
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-stat-grid", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		        StatCard,
		        {
		          label: "待处理任务",
		          value: pending.length,
		          unit: "笔",
		          icon: "clock",
		          iconTone: "var(--tp-warn)",
		          foot: "等待授权、补材料或人工复核"
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		        StatCard,
		        {
		          label: "在途金额",
		          value: fmtMoney(sumAmount(inFlight)),
		          icon: "send",
		          iconTone: "var(--tp-info)",
		          foot: `${inFlight.length} 笔任务正在执行`
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		        StatCard,
		        {
		          label: "已结算金额",
		          value: fmtMoney(sumAmount(closed)),
		          icon: "checkCircle",
		          iconTone: "var(--tp-success)",
		          foot: `${closed.length} 笔已完成并关闭`
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		        StatCard,
		        {
		          label: "风控拦截",
		          value: blocked.length,
		          unit: "笔",
		          icon: "shield",
		          iconTone: "var(--tp-danger)",
		          foot: `涉及金额 ${fmtMoney(sumAmount(blocked))}`
		        }
		      )
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-toolbar", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SearchInput, { value: keyword, onChange: setKeyword, placeholder: "搜索任务、收款方或发票号" }),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Select, { value: riskFilter, onChange: setRiskFilter, options: RISK_OPTIONS, label: "风险决策" }),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "tp-toolbar-end tp-faint tp-small", children: [
		        "显示 ",
		        visible.length,
		        " 笔 · 全部 ",
		        tasks.length,
		        " 笔"
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Card, { style: { padding: 0 }, children: visible.length ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-table-wrap", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("table", { className: "tp-table tp-tasks-table", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("tr", { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("th", { children: "付款任务" }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("th", { children: "收款方" }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("th", { className: "tp-th-right", children: "金额" }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("th", { children: "风控决策" }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("th", { children: "状态" }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("th", { children: "进度" }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("th", { children: "执行代理" }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("th", { children: "创建时间" }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("th", { className: "tp-cell-actions", "aria-label": "查看" })
		      ] }) }),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("tbody", { children: visible.map((task) => {
		        const delegation = delegationById(world, task.delegationId);
		        const progress = taskProgress(task);
		        const decision = RISK_DECISION[task.riskDecision] || RISK_DECISION.ALLOW;
		        const open = () => navigate("task", { taskId: task.id });
		        return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
		          "tr",
		          {
		            className: "tp-clickable",
		            tabIndex: 0,
		            onClick: open,
		            onKeyDown: (event2) => {
		              if (event2.key === "Enter" || event2.key === " ") {
		                event2.preventDefault();
		                open();
		              }
		            },
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("td", { children: [
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-strong", children: task.title }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-faint tp-small tp-mono", children: shortId(task.id) })
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("td", { children: [
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: task.counterparty }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-faint tp-small tp-truncate", style: { maxWidth: 150 }, children: task.purpose })
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("td", { className: "tp-td-right", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-strong tp-num", children: fmtMoney(task.amount, task.currency) }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Tag, { tone: decision.tone, dot: true, children: decision.label }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(StatusTag, { map: TASK_STATUS, status: task.status }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { style: { minWidth: 104 }, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		                  Progress,
		                  {
		                    value: progress.ratio,
		                    tone: task.status === "CLOSED" ? "success" : task.status === "FAILED" ? "danger" : ""
		                  }
		                ),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-faint tp-small", style: { marginTop: 4 }, children: [
		                  "第 ",
		                  progress.step,
		                  " / ",
		                  TASK_FLOW.length,
		                  " 步"
		                ] })
		              ] }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("td", { children: delegation?.subjectName || "—" }),
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-faint tp-small", title: fmtDateTime(task.createdAt), children: fmtRelative(task.createdAt) }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("td", { className: "tp-cell-actions", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "chevronRight", size: 14, style: { color: "var(--tp-text-3)" } }) })
		            ]
		          },
		          task.id
		        );
		      }) })
		    ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		      EmptyState,
		      {
		        icon: "package",
		        title: hasFilter ? "没有匹配的付款任务" : "还没有付款任务",
		        desc: hasFilter ? "换一个关键词或调整筛选条件；也可以清除筛选查看全部任务。" : "代理提交付款后会出现在这里，授权与风控结果会同步更新。",
		        action: hasFilter ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { variant: "ghost", onClick: resetFilters, children: "清除筛选" }) : null
		      }
		    ) }),
		    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		      Modal,
		      {
		        open: createOpen,
		        onClose: () => setCreateOpen(false),
		        title: "新建付款任务",
		        footer: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { onClick: () => setCreateOpen(false), children: "取消" }),
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { variant: "primary", onClick: submitCreate, children: "创建任务" })
		        ] }),
		        children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-form-grid", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Field, { label: "付款用途", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("input", { className: "tp-input", value: draft.title, placeholder: "例如：11 月新订单预付款", onChange: (event2) => setDraft((current) => ({ ...current, title: event2.target.value })) }) }),
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Field, { label: "收款方", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Select, { value: draft.counterparty, onChange: (value) => setDraft((current) => ({ ...current, counterparty: value })), options: orgOptions, label: "收款方" }) }),
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Field, { label: "金额（USD）", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("input", { className: "tp-input", type: "number", min: "1", value: draft.amount, placeholder: "0.00", onChange: (event2) => setDraft((current) => ({ ...current, amount: event2.target.value })) }) }),
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Field, { label: "执行代理", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Select, { value: draft.delegationId, onChange: (value) => setDraft((current) => ({ ...current, delegationId: value })), options: delegationOptions, label: "执行代理" }) }),
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Field, { label: "说明", hint: "会出现在任务详情与审计记录中", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("input", { className: "tp-input", value: draft.purpose, placeholder: "例如：供应商账期 30 天", onChange: (event2) => setDraft((current) => ({ ...current, purpose: event2.target.value })) }) })
		        ] })
		      }
		    )
		  ] });
		}
		function TaskDetailPage({ taskId }) {
		  const world = useWorld();
		  const actions2 = useActions();
		  const { navigate } = useNavigation();
		  const toast = useToast();
		  const [settleOpen, setSettleOpen] = (0, import_react10.useState)(false);
		  const [reference, setReference] = (0, import_react10.useState)("");
		  const task = taskId ? taskById(world, taskId) : null;
		  if (!task) {
		    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-page", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		        PageHead,
		        {
		          title: "付款任务",
		          desc: "查看单笔付款的授权、风控、执行与结算全链路。",
		          actions: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { icon: "arrowLeft", onClick: () => navigate("tasks"), children: "返回任务列表" })
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		        EmptyState,
		        {
		          icon: "fileText",
		          title: "没有找到这笔付款任务",
		          desc: "链接可能已失效，或这笔任务不在当前工作区。请回到任务列表重新选择。",
		          action: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { variant: "primary", onClick: () => navigate("tasks"), children: "返回任务列表" })
		        }
		      ) })
		    ] });
		  }
		  const delegation = delegationById(world, task.delegationId);
		  const chain = chainFor(world, task.delegationId);
		  const effective = chainEffective(world, task.delegationId);
		  const events = taskEvents(world, task.id);
		  const reviews = interventionsForTask(world, task.id);
		  const evidence = evidenceForTask(world, task.id);
		  const progress = taskProgress(task);
		  const pendingReview = reviews.find((item) => item.status === "PENDING") || null;
		  const decision = RISK_DECISION[task.riskDecision] || RISK_DECISION.ALLOW;
		  const band = riskBand(task.riskScore);
		  const agentName = delegation?.subjectName || "—";
		  const canSettle = task.status === "SUBMITTED" || task.status === "CONFIRMED";
		  const failed = TERMINAL_BAD_STATES.includes(task.status);
		  const showRiskNote = (task.riskDecision === "BLOCK" || task.riskDecision === "DEFER") && !failed;
		  const submitSettle = () => {
		    const result = actions2.settleTask(task.id, {
		      by: "周明（财务负责人）",
		      reference: reference.trim() || void 0
		    });
		    if (result?.ok) {
		      setSettleOpen(false);
		      setReference("");
		      toast.push("已提交结算，等待清算确认", "success");
		    } else {
		      toast.push(result?.reason || "提交失败，请稍后重试", "error");
		    }
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-page", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		      PageHead,
		      {
		        title: task.title,
		        desc: `收款方 ${task.counterparty} · 发票号 ${task.invoiceNo} · 创建于 ${fmtDateTime(task.createdAt)}`,
		        actions: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-inline", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { icon: "arrowLeft", onClick: () => navigate("tasks"), children: "返回任务列表" }),
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		            Button,
		            {
		              variant: "primary",
		              icon: "send",
		              disabled: !canSettle,
		              title: canSettle ? void 0 : "只有已提交或已确认的任务可以提交结算",
		              onClick: () => {
		                setReference(task.settlementRef || "");
		                setSettleOpen(true);
		              },
		              children: "提交结算"
		            }
		          )
		        ] })
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-sla-strip", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-sla-item", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-faint", children: "付款金额" }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-strong tp-num", style: { fontSize: 17 }, children: fmtMoney(task.amount, task.currency) })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-sla-item", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-faint", children: "任务状态" }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(StatusTag, { map: TASK_STATUS, status: task.status }) })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-sla-item", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-faint", children: "风险决策" }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Tag, { tone: decision.tone, dot: true, children: decision.label }) })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-sla-item", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-faint", children: "执行代理" }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-strong", style: { fontSize: 13 }, children: agentName }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-faint tp-small", children: delegation?.name || "未关联委托" })
		      ] })
		    ] }),
		    showRiskNote ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `tp-callout ${task.riskDecision === "BLOCK" ? "danger" : "warn"}`, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-callout-title", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: task.riskDecision === "BLOCK" ? "shield" : "alert", size: 14 }),
		        task.riskDecision === "BLOCK" ? "风控已拦截这笔付款" : "这笔付款被转人工复核"
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-callout-body", children: task.blockedReason || (task.riskDecision === "BLOCK" ? "触发资金安全规则，付款已暂停。" : "风险评分超过阈值，需要人工确认后才能继续。") }),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-inline", style: { gap: 8 }, children: [
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-callout-detail", children: task.riskDecision === "BLOCK" ? "拦截期间资金不会划出；如确需支付，请先由财务负责人确认例外，再重新发起任务。" : "复核通过后任务会恢复执行；复核期间付款保持挂起。" }),
		        pendingReview ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => navigate("approvals"), children: "前往审批工作台" }) : null
		      ] })
		    ] }) : null,
		    failed ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `tp-callout ${task.status === "FAILED" ? "danger" : "warn"}`, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-callout-title", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: task.status === "FAILED" ? "xCircle" : "x", size: 14 }),
		        task.status === "FAILED" ? "这笔付款已失败" : "这笔付款已取消"
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-callout-body", children: task.blockedReason || "任务已中止，不再进入结算环节。" }),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-inline", style: { gap: 8 }, children: [
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-callout-detail", children: task.status === "FAILED" ? "如确认是误拦截，请提交复核；复核通过后需要重新发起付款。" : "该任务不会继续执行，相关资金未划出。" }),
		        pendingReview ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => navigate("approvals"), children: "前往审批工作台" }) : null
		      ] })
		    ] }) : null,
		    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-grid-2-1", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-stack", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
		          Card,
		          {
		            title: "付款进度",
		            desc: "从任务创建到结算关闭的完整路径",
		            actions: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Tag, { tone: "info", children: `第 ${progress.step} / ${TASK_FLOW.length} 步` }),
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-progress-row", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		                  Progress,
		                  {
		                    value: progress.ratio,
		                    tone: task.status === "CLOSED" ? "success" : task.status === "FAILED" ? "danger" : ""
		                  }
		                ),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-strong tp-num", style: { fontSize: 12.5 }, children: fmtPct(progress.ratio, 0) }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-faint tp-small", children: progress.label })
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		                "div",
		                {
		                  style: {
		                    display: "grid",
		                    gridTemplateColumns: "repeat(7, minmax(72px, 1fr))",
		                    gap: 6,
		                    marginTop: 16,
		                    overflowX: "auto",
		                    paddingBottom: 4
		                  },
		                  children: TASK_FLOW.map((step, index) => {
		                    const stepNo = index + 1;
		                    const current = !failed && stepNo === progress.step && task.status !== "CLOSED";
		                    const done = !failed && (task.status === "CLOSED" || stepNo < progress.step);
		                    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
		                      "div",
		                      {
		                        style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" },
		                        children: [
		                          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		                            "span",
		                            {
		                              "aria-hidden": "true",
		                              style: {
		                                width: 22,
		                                height: 22,
		                                borderRadius: "50%",
		                                display: "grid",
		                                placeItems: "center",
		                                background: done ? "var(--tp-success-soft)" : current ? "var(--tp-accent-soft)" : "var(--tp-surface-3)",
		                                color: done ? "var(--tp-success)" : current ? "var(--tp-accent)" : "var(--tp-text-3)",
		                                boxShadow: current ? "0 0 0 1px var(--tp-accent)" : "none"
		                              },
		                              children: done ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "check", size: 11 }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-num", style: { fontSize: 10, fontWeight: 700 }, children: stepNo })
		                            }
		                          ),
		                          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		                            "span",
		                            {
		                              className: current ? "tp-strong tp-small" : "tp-faint tp-small",
		                              style: { fontSize: 11, lineHeight: 1.3 },
		                              children: TASK_STATUS[step]?.label || step
		                            }
		                          )
		                        ]
		                      },
		                      step
		                    );
		                  })
		                }
		              )
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
		          Card,
		          {
		            title: "委托链与生效额度",
		            desc: "每一级都可独立设限，整条链最窄的一级决定本笔付款的实际上限。",
		            actions: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => navigate("delegations"), children: "查看全部委托" }),
		            children: [
		              effective ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-callout info", style: { marginBottom: 10 }, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-callout-title", children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "shield", size: 14 }),
		                  "本笔付款的生效额度"
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-callout-body", children: [
		                  "单笔上限 ",
		                  fmtMoney(effective.amountLimit, task.currency),
		                  " · 今日剩余 ",
		                  fmtMoney(effective.dailyRemaining, task.currency)
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-callout-detail", children: [
		                  effective.active ? `按 ${chain.length} 级委托逐级收窄` : "委托链中已有环节失效，本笔付款的授权不再完整",
		                  chain.length ? ` · 可执行动作：${chain[chain.length - 1].actionLabels.join("、")}` : ""
		                ] })
		              ] }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-hint", children: "这笔任务没有关联生效中的委托。" }),
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-list", children: chain.map((level, index) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-list-row", style: { paddingLeft: index * 14 }, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Avatar, { name: level.issuerName, seed: level.issuerDid, size: "sm" }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "arrowRight", size: 13, style: { flex: "none", color: "var(--tp-text-3)" } }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Avatar, { name: level.subjectName, seed: level.subjectDid, size: "sm" }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-list-main", children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-list-title", children: [
		                    level.issuerName,
		                    " → ",
		                    level.subjectName
		                  ] }),
		                  /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-list-sub", children: [
		                    level.actionLabels.join("、"),
		                    " · 单笔上限 ",
		                    fmtMoney(level.amountLimit, level.currency),
		                    " ",
		                    "· 今日已用 ",
		                    fmtMoney(level.usedToday, level.currency),
		                    " / ",
		                    fmtMoney(level.dailyLimit, level.currency)
		                  ] })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-list-side", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(StatusTag, { map: DELEGATION_STATUS, status: level.status }) })
		              ] }, level.id)) })
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		          Card,
		          {
		            title: "审计事件",
		            desc: "关键动作按发生顺序留痕，可供审计员复核。",
		            actions: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Tag, { tone: "neutral", children: `共 ${events.length} 条` }),
		            children: events.length ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		              Timeline,
		              {
		                items: events.map((event2) => ({
		                  key: event2.id,
		                  title: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "tp-inline", style: { gap: 6 }, children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: event2.typeLabel }),
		                    event2.finality && event2.finality !== "PENDING" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Tag, { tone: FINALITY[event2.finality]?.tone || "neutral", dot: true, children: FINALITY[event2.finality]?.label || event2.finality }) : null
		                  ] }),
		                  meta: `${event2.actor} · ${fmtDateTime(event2.at)} · ${fmtRelative(event2.at)}`,
		                  body: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-stack", style: { gap: 5 }, children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: event2.body }),
		                    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "tp-inline", children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Tag, { tone: VERIFICATION[event2.verification]?.tone || "neutral", children: VERIFICATION[event2.verification]?.label || "未校验" }),
		                      event2.ledger ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(Tag, { tone: "info", children: [
		                        event2.ledger.scheme,
		                        " · ",
		                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-mono", children: event2.ledger.reference })
		                      ] }) : null
		                    ] })
		                  ] }),
		                  tone: event2.tone,
		                  icon: event2.tone === "danger" ? "alert" : event2.tone === "success" ? "checkCircle" : event2.tone === "warn" ? "clock" : "activity"
		                }))
		              }
		            ) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-hint", children: "这笔任务还没有审计事件。" })
		          }
		        )
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-stack", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Card, { title: "任务摘要", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		          KV,
		          {
		            items: [
		              { k: "任务编号", v: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-mono", children: shortId(task.id) }) },
		              { k: "付款金额", v: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-strong tp-num", children: fmtMoney(task.amount, task.currency) }) },
		              { k: "收款方", v: task.counterparty },
		              { k: "发票号", v: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-mono", children: task.invoiceNo }) },
		              { k: "付款用途", v: task.purpose },
		              { k: "执行代理", v: agentName },
		              { k: "任务状态", v: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(StatusTag, { map: TASK_STATUS, status: task.status }) },
		              {
		                k: "风险评分",
		                v: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "tp-inline", style: { gap: 6 }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-num", children: task.riskScore.toFixed(2) }),
		                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Tag, { tone: band.tone, children: band.label })
		                ] })
		              },
		              { k: "创建时间", v: fmtDateTime(task.createdAt) },
		              { k: "最近更新", v: fmtRelative(task.updatedAt) },
		              {
		                k: "结算凭证",
		                v: task.settlementRef ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Copyable, { label: "复制结算凭证", children: task.settlementRef }) : null
		              }
		            ]
		          }
		        ) }),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		          Card,
		          {
		            title: "人工复核",
		            desc: "被规则转人工的记录与处理结论。",
		            actions: pendingReview ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => navigate("approvals"), children: "前往审批" }) : null,
		            children: reviews.length ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: reviews.map((item) => {
		              const countdown = fmtCountdown(item.dueAt);
		              return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { style: { padding: "10px 0", borderBottom: "1px solid var(--tp-border-soft)" }, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-inline", style: { justifyContent: "space-between", gap: 8 }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-strong tp-small", children: item.title }),
		                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(StatusTag, { map: INTERVENTION_STATUS, status: item.status })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-faint tp-small", style: { marginTop: 4, lineHeight: 1.45 }, children: item.reason }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-faint tp-small", style: { marginTop: 4 }, children: item.status === "PENDING" ? `${item.requestedBy} 发起 · ${countdown === "已超时" ? "已超过处理时限" : `${countdown}内处理`}` : `${item.decidedBy || "审批人"} · ${fmtRelative(item.decidedAt)}处理` }),
		                item.decisionNote ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-hint", style: { marginTop: 4 }, children: [
		                  "结论：",
		                  item.decisionNote
		                ] }) : null,
		                item.status === "PENDING" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		                  Button,
		                  {
		                    size: "sm",
		                    variant: "ghost",
		                    icon: "arrowRight",
		                    style: { marginTop: 6 },
		                    onClick: () => navigate("approvals"),
		                    children: "去审批工作台"
		                  }
		                ) : null
		              ] }, item.id);
		            }) }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-hint", children: "这笔任务没有触发人工复核。" })
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		          Card,
		          {
		            title: "证据与凭证",
		            desc: "支撑本笔付款的授权、风险与结算留痕。",
		            actions: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Tag, { tone: "neutral", children: `共 ${evidence.length} 条` }),
		            children: evidence.length ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-evidence-list", children: evidence.map((item) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-evidence-row", style: { alignItems: "flex-start" }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		                Icon,
		                {
		                  name: "fileText",
		                  size: 14,
		                  style: { marginTop: 2, flex: "none", color: "var(--tp-text-3)" }
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-grow", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-strong tp-small", children: [
		                  EVIDENCE_KIND[item.kind] || "凭证",
		                  " · ",
		                  item.subject.replaceAll(task.id, "本任务")
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-hint", style: { marginTop: 2 }, children: item.summary }),
		                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-inline", style: { marginTop: 5, gap: 8 }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Tag, { tone: item.anchored ? "success" : "neutral", dot: true, children: item.anchored ? "已存证" : "待存证" }),
		                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-faint tp-small", children: fmtRelative(item.at) }),
		                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Copyable, { label: "复制存证编号", children: item.digest })
		                ] })
		              ] })
		            ] }, item.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-hint", children: "暂未归档证据。" })
		          }
		        )
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		      Modal,
		      {
		        open: settleOpen,
		        onClose: () => setSettleOpen(false),
		        title: "提交结算",
		        footer: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-drawer-actions", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { variant: "ghost", onClick: () => setSettleOpen(false), children: "取消" }),
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { variant: "primary", icon: "send", onClick: submitSettle, children: "确认提交结算" })
		        ] }),
		        children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-stack", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-callout info", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-callout-title", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "send", size: 14 }),
		              "将 ",
		              fmtMoney(task.amount, task.currency),
		              " 提交至清算网络"
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "tp-callout-body", children: [
		              "收款方 ",
		              task.counterparty,
		              " · 发票号 ",
		              task.invoiceNo
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "tp-callout-detail", children: "提交后会生成结算事件并等待清算确认，确认前请再核对收款账户与金额。" })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		            KV,
		            {
		              items: [
		                { k: "收款方", v: task.counterparty },
		                { k: "付款金额", v: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "tp-strong tp-num", children: fmtMoney(task.amount, task.currency) }) },
		                { k: "执行代理", v: agentName },
		                {
		                  k: "委托链",
		                  v: effective ? `${chain.length} 级委托 · 单笔上限 ${fmtMoney(effective.amountLimit, task.currency)}` : "—"
		                }
		              ]
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Field, { label: "结算参考号", hint: "选填。填写银行流水号或内部对账编号，便于后续核对。", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		            "input",
		            {
		              className: "tp-input",
		              value: reference,
		              onChange: (event2) => setReference(event2.target.value),
		              placeholder: "例如 20261029-001"
		            }
		          ) })
		        ] })
		      }
		    )
		  ] });
		}

		// src/client/product/pages/agents.jsx
		var import_react11 = require("react");
		var import_jsx_runtime10 = require("react/jsx-runtime");
		var CLAIM_LABELS = {
		  scope: "业务范围",
		  singleLimit: "单笔上限",
		  dailyLimit: "日累计上限",
		  currency: "结算币种",
		  corridors: "收付通道",
		  dataClasses: "可读数据",
		  retention: "留存时长",
		  maxSingle: "单笔上限",
		  registration: "登记编号",
		  jurisdiction: "注册属地"
		};
		var CLAIM_VALUE_LABELS = {
		  procurement: "采购下单",
		  "payment-request": "付款申请",
		  "cross-border-settlement": "跨境结算",
		  "read-only": "只读查看",
		  evidence: "证据材料",
		  case: "案件材料",
		  "logistics-settlement": "物流结算",
		  "counterparty-verification": "对手方核验",
		  transaction: "交易数据",
		  identity: "身份数据"
		};
		function trustBand(trustScore) {
		  const score = Number(trustScore) || 0;
		  if (score >= 0.95) return { label: "低风险", tone: "success" };
		  if (score >= 0.92) return { label: "风险较低", tone: "info" };
		  if (score >= 0.88) return { label: "风险中等", tone: "warn" };
		  return { label: "风险偏高", tone: "danger" };
		}
		function readableClaim(value) {
		  return String(value).split(",").map((part) => {
		    const trimmed = part.trim();
		    return trimmed ? CLAIM_VALUE_LABELS[trimmed] || trimmed : "";
		  }).filter(Boolean).join(" · ");
		}
		function credentialClaims(credential) {
		  const claims = credential.claims || {};
		  return Object.keys(claims).filter((key) => claims[key] !== void 0 && claims[key] !== null).map((key) => ({
		    k: CLAIM_LABELS[key] || "其他信息",
		    v: key === "scope" || key === "dataClasses" ? readableClaim(claims[key]) : String(claims[key])
		  }));
		}
		function timelineIcon(tone) {
		  if (tone === "danger") return "alert";
		  if (tone === "warn") return "clock";
		  if (tone === "success") return "checkCircle";
		  return "info";
		}
		function Metric({ label, value, hint: hint2 }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
		    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-label", children: label }),
		    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-strong tp-num", style: { marginTop: 2, fontSize: 13 }, children: value }),
		    hint2 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-hint", style: { marginTop: 1 }, children: hint2 }) : null
		  ] });
		}
		function AgentsPage() {
		  const world = useWorld();
		  const { navigate } = useNavigation();
		  const [status, setStatus] = (0, import_react11.useState)("all");
		  const [role, setRole] = (0, import_react11.useState)("all");
		  const stats = dashboardStats(world);
		  const agents = (0, import_react11.useMemo)(() => roster(world), [world]);
		  const roleOptions = (0, import_react11.useMemo)(() => {
		    const seen = /* @__PURE__ */ new Map();
		    for (const agent of agents) {
		      if (!seen.has(agent.role)) seen.set(agent.role, agent.roleLabel);
		    }
		    return [{ value: "all", label: "全部角色" }, ...Array.from(seen, ([value, label]) => ({ value, label }))];
		  }, [agents]);
		  const statusOptions = (0, import_react11.useMemo)(
		    () => [
		      { value: "all", label: "全部", count: agents.length },
		      { value: "ACTIVE", label: "在册", count: agents.filter((agent) => agent.status === "ACTIVE").length },
		      { value: "SUSPENDED", label: "已暂停", count: agents.filter((agent) => agent.status === "SUSPENDED").length }
		    ],
		    [agents]
		  );
		  const filtered = (0, import_react11.useMemo)(
		    () => agents.filter(
		      (agent) => (status === "all" || agent.status === status) && (role === "all" || agent.role === role)
		    ),
		    [agents, role, status]
		  );
		  const openAgent = (agentId) => navigate("agent", { agentId });
		  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-page", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		      PageHead,
		      {
		        title: "代理",
		        desc: "每个代理都像一名有明确授权的员工：有自己的职责、凭证与额度。合规审计类代理只读，不会占用付款额度。",
		        actions: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { icon: "branch", onClick: () => navigate("delegations"), children: "委托授权" }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { variant: "primary", icon: "sliders", onClick: () => navigate("governance"), children: "风险策略" })
		        ] })
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-stat-grid", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		        StatCard,
		        {
		          label: "在册代理",
		          value: stats.activeAgents,
		          unit: `/ ${world.agents.length}`,
		          icon: "users",
		          iconTone: "var(--tp-accent)",
		          foot: "可按职责分工执行任务"
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		        StatCard,
		        {
		          label: "生效委托",
		          value: stats.activeDelegations,
		          unit: "项",
		          icon: "branch",
		          iconTone: "var(--tp-info)",
		          foot: "委托链路完整才可付款"
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		        StatCard,
		        {
		          label: "本月代理交易额",
		          value: fmtMoney(stats.monthlyVolume),
		          icon: "wallet",
		          iconTone: "var(--tp-success)",
		          foot: "含采购付款与跨境结算"
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		        StatCard,
		        {
		          label: "任务完成率",
		          value: fmtPct(stats.successRate),
		          icon: "checkCircle",
		          iconTone: "var(--tp-success)",
		          foot: "近 30 天已完成任务占比"
		        }
		      )
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
		      Card,
		      {
		        title: "代理名册",
		        desc: "按本月交易额排序；合规审计代理排在最后，便于与业务代理区分。",
		        actions: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Tag, { tone: "neutral", children: [
		          filtered.length,
		          " 个代理"
		        ] }),
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-toolbar", style: { marginBottom: 14 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Segmented, { value: status, onChange: setStatus, options: statusOptions }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "tp-inline", style: { gap: 6 }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-hint", children: "角色" }),
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Select, { value: role, onChange: setRole, options: roleOptions, label: "按角色筛选" })
		            ] })
		          ] }),
		          filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		            EmptyState,
		            {
		              icon: "users",
		              title: "没有符合条件的代理",
		              desc: "换一个角色或状态筛选，或者查看全部代理名册。",
		              action: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		                Button,
		                {
		                  icon: "refresh",
		                  onClick: () => {
		                    setStatus("all");
		                    setRole("all");
		                  },
		                  children: "重置筛选"
		                }
		              )
		            }
		          ) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-grid tp-grid-3", children: filtered.map((agent) => {
		            const band = trustBand(agent.trustScore);
		            const taskCount = agentTaskIds(world, agent.id).length;
		            return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
		              "div",
		              {
		                className: "tp-card tp-card-flat",
		                role: "button",
		                tabIndex: 0,
		                onClick: () => openAgent(agent.id),
		                onKeyDown: (event2) => {
		                  if (event2.key === "Enter" || event2.key === " ") {
		                    event2.preventDefault();
		                    openAgent(agent.id);
		                  }
		                },
		                style: { display: "flex", flexDirection: "column", gap: 12, cursor: "pointer" },
		                children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-inline", style: { flexWrap: "nowrap", alignItems: "flex-start" }, children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Avatar, { name: agent.shortName || agent.name, seed: agent.id, size: "lg" }),
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-grow", children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-inline", style: { gap: 6 }, children: [
		                        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-strong", style: { fontSize: 14 }, children: agent.name }),
		                        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(StatusTag, { map: DID_STATUS, status: agent.status })
		                      ] }),
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-muted tp-small", style: { marginTop: 3 }, children: [
		                        agent.roleLabel,
		                        " · ",
		                        agent.orgName
		                      ] }),
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-inline", style: { marginTop: 6, gap: 6 }, children: [
		                        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Tag, { tone: band.tone, children: band.label }),
		                        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-mono tp-faint", children: shortId(agent.id) })
		                      ] })
		                    ] })
		                  ] }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "tp-muted tp-small", style: { margin: 0, lineHeight: 1.55 }, children: agent.description }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }, children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Metric, { label: "信任分", value: Number(agent.trustScore).toFixed(2) }),
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Metric, { label: "本月交易额", value: fmtMoney(agent.monthlyVolume) }),
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Metric, { label: "成功率", value: fmtPct(agent.successRate) }),
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Metric, { label: "最近任务", value: `${taskCount} 个` })
		                  ] }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-divider", style: { margin: "2px 0" } }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-inline", style: { justifyContent: "space-between", width: "100%" }, children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "tp-hint", style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Icon, { name: "clock", size: 12 }),
		                      "最近活跃 ",
		                      fmtRelative(agent.lastActiveAt)
		                    ] }),
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "tp-hint", style: { display: "inline-flex", alignItems: "center", gap: 3 }, children: [
		                      "查看详情",
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Icon, { name: "chevronRight", size: 12 })
		                    ] })
		                  ] })
		                ]
		              },
		              agent.id
		            );
		          }) }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-card-note", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Icon, { name: "info", size: 13, style: { verticalAlign: "-2px", marginRight: 4 } }),
		            "名册中每个代理都必须有一张有效凭证和一条生效委托，缺少任一项都会被拦截。"
		          ] })
		        ]
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-footer-note", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Icon, { name: "lock", size: 12, style: { verticalAlign: "-2px", marginRight: 4 } }),
		      "代理身份与权限变更都会写入审计记录。"
		    ] })
		  ] });
		}
		function AgentDetailPage({ agentId }) {
		  const world = useWorld();
		  const { navigate } = useNavigation();
		  const agent = agentId ? agentById(world, agentId) : void 0;
		  if (!agent) {
		    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-page", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		      EmptyState,
		      {
		        icon: "users",
		        title: "未找到这个代理",
		        desc: agentId ? `代理 ${shortId(agentId)} 可能已移出名册，或链接已经失效。` : "缺少代理编号，请从代理名册重新进入。",
		        action: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { icon: "arrowLeft", onClick: () => navigate("agents"), children: "返回代理名册" })
		      }
		    ) }) });
		  }
		  const band = trustBand(agent.trustScore);
		  const credentials = world.credentials.filter((credential) => credential.subjectId === agent.id);
		  const granted = world.delegations.filter((delegation) => delegation.subjectId === agent.id);
		  const issued = world.delegations.filter((delegation) => delegation.issuerName === agent.name);
		  const taskIds = agentTaskIds(world, agent.id);
		  const idList = Array.isArray(taskIds) ? taskIds : Array.from(taskIds || []);
		  const tasks = idList.map((id) => taskById(world, id)).filter(Boolean).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		  const events = world.events.filter(
		    (event2) => event2.actorId === agent.id || agent.shortName && event2.actor && event2.actor.includes(agent.shortName)
		  ).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
		  const notes = buildRiskNotes({ agent, credentials, granted, issued, tasks });
		  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-page", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Card, { children: [
		      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-inline", style: { flexWrap: "nowrap", alignItems: "flex-start", gap: 16 }, children: [
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Avatar, { name: agent.shortName || agent.name, seed: agent.id, size: "lg" }),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-grow", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-inline", style: { gap: 8 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h2", { className: "tp-section-title", style: { fontSize: 18 }, children: agent.name }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(StatusTag, { map: DID_STATUS, status: agent.status }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Tag, { tone: band.tone, children: band.label })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-muted tp-small", style: { marginTop: 4 }, children: [
		            agent.roleLabel,
		            " · ",
		            agent.orgName,
		            " · 加入 ",
		            fmtRelative(agent.createdAt)
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-inline", style: { marginTop: 8, gap: 6 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-mono tp-faint", title: "代理登记标识", children: shortId(agent.id) }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-dot-sep" }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "tp-hint", children: [
		              "最近活跃 ",
		              fmtRelative(agent.lastActiveAt)
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-dot-sep" }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "tp-hint", children: [
		              "信任分 ",
		              Number(agent.trustScore).toFixed(2)
		            ] })
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-inline", style: { flexWrap: "nowrap", flex: "none" }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", icon: "branch", onClick: () => navigate("delegations"), children: "委托链" }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", icon: "fileText", onClick: () => navigate("audit"), children: "审计记录" })
		        ] })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "tp-muted tp-small", style: { margin: "14px 0 0", lineHeight: 1.6 }, children: agent.description }),
		      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
		        "div",
		        {
		          style: {
		            display: "grid",
		            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
		            gap: 12,
		            marginTop: 14,
		            paddingTop: 14,
		            borderTop: "1px solid var(--tp-border-soft)"
		          },
		          children: [
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Metric, { label: "信任分", value: Number(agent.trustScore).toFixed(2), hint: band.label }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Metric, { label: "本月交易额", value: fmtMoney(agent.monthlyVolume) }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Metric, { label: "成功率", value: fmtPct(agent.successRate) }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Metric, { label: "有效凭证", value: `${credentials.filter((item) => item.status === "ACTIVE").length} / ${credentials.length}` }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Metric, { label: "最近任务", value: `${tasks.length} 个` })
		          ]
		        }
		      )
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-grid-2-1", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-stack", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		          Card,
		          {
		            title: "能力与凭证",
		            desc: "由签发方授予、在有效期内可核验的业务权限。凭证失效后相关操作会被拦截。",
		            actions: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Tag, { tone: "neutral", children: [
		              credentials.length,
		              " 张"
		            ] }),
		            children: credentials.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		              EmptyState,
		              {
		                icon: "key",
		                title: "暂无凭证",
		                desc: "该代理没有可核验的能力凭证，无法发起新的任务。"
		              }
		            ) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-list", children: credentials.map((credential) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-list-row", style: { alignItems: "flex-start" }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Avatar, { name: credential.issuerName, seed: credential.issuerDid, size: "sm" }),
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-list-main", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-list-title", children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: credential.name }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(StatusTag, { map: CREDENTIAL_STATUS, status: credential.status })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-list-sub", children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
		                    "签发方 ",
		                    credential.issuerName
		                  ] }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-dot-sep" }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
		                    "有效期至 ",
		                    fmtDate(credential.expiresAt),
		                    "（还剩 ",
		                    fmtCountdown(credential.expiresAt),
		                    "）"
		                  ] }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-dot-sep" }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
		                    "最近核验 ",
		                    fmtRelative(credential.verifiedAt)
		                  ] })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-claims", style: { marginTop: 8 }, children: credentialClaims(credential).map((claim) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-hint", children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-label", children: claim.k }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-small", children: claim.v })
		                ] }, claim.k)) }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-inline", style: { marginTop: 8 }, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-mono tp-faint", title: "凭证指纹", children: shortId(credential.digest) }) })
		              ] })
		            ] }, credential.id)) })
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		          Card,
		          {
		            title: "委托授权",
		            desc: "代理只能在被明确委托的额度与动作内行动；子委托会继承上级链路的最严限制。",
		            actions: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Tag, { tone: "neutral", children: [
		              granted.length + issued.length,
		              " 项"
		            ] }),
		            children: granted.length === 0 && issued.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		              EmptyState,
		              {
		                icon: "branch",
		                title: "暂无委托关系",
		                desc: "还没有人把付款权限委托给这个代理，或者它也没有向下授权。",
		                action: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", onClick: () => navigate("delegations"), children: "查看委托授权" })
		              }
		            ) : /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-stack", style: { gap: 18 }, children: [
		              granted.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-label", style: { marginBottom: 8 }, children: "收到的委托" }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-list", children: granted.map((delegation) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(DelegationRow, { world, delegation }, delegation.id)) })
		              ] }) : null,
		              issued.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-label", style: { marginBottom: 8 }, children: "向下授予的委托" }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-list", children: issued.map((delegation) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(DelegationRow, { world, delegation }, delegation.id)) })
		              ] }) : null
		            ] })
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		          Card,
		          {
		            title: "最近任务",
		            desc: "该代理最近参与的任务；点击任意一行查看完整审批与凭证。",
		            actions: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", variant: "ghost", icon: "arrowRight", onClick: () => navigate("tasks"), children: "全部任务" }),
		            children: tasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(EmptyState, { icon: "fileText", title: "暂无任务", desc: "该代理还没有参与过付款任务。" }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-table-wrap", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("table", { className: "tp-table", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("tr", { children: [
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("th", { children: "任务" }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("th", { children: "交易对手" }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("th", { className: "tp-th-right", children: "金额" }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("th", { children: "风险处置" }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("th", { children: "状态" }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("th", { className: "tp-th-right", children: "创建时间" })
		              ] }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("tbody", { children: tasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
		                "tr",
		                {
		                  className: "tp-clickable",
		                  onClick: () => navigate("task", { taskId: task.id }),
		                  children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("td", { children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-strong", style: { fontSize: 12.5 }, children: task.title }),
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-mono tp-faint", children: shortId(task.id) })
		                    ] }),
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("td", { children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { children: task.counterparty }),
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-faint tp-small", children: task.counterpartyOrg })
		                    ] }),
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("td", { className: "tp-td-right", children: fmtMoney(task.amount, task.currency) }),
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Tag, { tone: RISK_DECISION[task.riskDecision]?.tone || "neutral", children: RISK_DECISION[task.riskDecision]?.label || "待评估" }) }),
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(StatusTag, { map: TASK_STATUS, status: task.status }) }),
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("td", { className: "tp-td-right tp-faint", children: fmtDateTime(task.createdAt) })
		                  ]
		                },
		                task.id
		              )) })
		            ] }) })
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		          Card,
		          {
		            title: "活动时间线",
		            desc: "来自审计记录的代理动作，按时间倒序排列。",
		            actions: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Tag, { tone: "neutral", children: [
		              events.length,
		              " 条"
		            ] }),
		            children: events.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(EmptyState, { icon: "activity", title: "暂无活动记录", desc: "该代理还没有留下可审计的动作。" }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		              Timeline,
		              {
		                items: events.map((event2) => ({
		                  key: event2.id,
		                  title: event2.typeLabel,
		                  meta: `${event2.actor} · ${fmtDateTime(event2.at)}`,
		                  body: event2.body,
		                  tone: ["success", "warn", "danger"].includes(event2.tone) ? event2.tone : void 0,
		                  icon: timelineIcon(event2.tone)
		                }))
		              }
		            )
		          }
		        )
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-stack", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		          Card,
		          {
		            title: "风险提示",
		            desc: "系统根据凭证、委托、任务与风险记录自动汇总，仅作提醒，不替代人工判断。",
		            children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-stack", style: { gap: 10 }, children: notes.map((note2) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: `tp-callout ${note2.tone}`, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-callout-title", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		                  Icon,
		                  {
		                    name: note2.tone === "danger" ? "alert" : note2.tone === "warn" ? "clock" : note2.tone === "success" ? "checkCircle" : "info",
		                    size: 14
		                  }
		                ),
		                note2.title
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-callout-body", children: note2.body })
		            ] }, note2.title)) })
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Card, { title: "关键信息", desc: "对外展示与排查问题时常用", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		            KV,
		            {
		              items: [
		                { k: "代理名称", v: agent.name },
		                { k: "职责角色", v: agent.roleLabel },
		                { k: "所属组织", v: agent.orgName },
		                { k: "名册状态", v: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(StatusTag, { map: DID_STATUS, status: agent.status }) },
		                { k: "信任分", v: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-num", children: Number(agent.trustScore).toFixed(2) }) },
		                {
		                  k: "签名密钥",
		                  v: agent.role === "compliance" ? "审计密钥已登记" : "主密钥已登记"
		                },
		                { k: "登记标识", v: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-mono", children: shortId(agent.id) }) },
		                { k: "加入时间", v: fmtDateTime(agent.createdAt) },
		                { k: "最近活跃", v: fmtRelative(agent.lastActiveAt) }
		              ]
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-card-note", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Icon, { name: "lock", size: 13, style: { verticalAlign: "-2px", marginRight: 4 } }),
		            "代理不能自行扩大额度；任何提额都需要财务负责人重新委托。"
		          ] })
		        ] })
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-footer-note", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Icon, { name: "lock", size: 12, style: { verticalAlign: "-2px", marginRight: 4 } }),
		      "所有代理动作均以证据形式留存，可在审计与案件中复核。"
		    ] })
		  ] });
		}
		function DelegationRow({ world, delegation }) {
		  const chain = chainFor(world, delegation.id);
		  const effective = chainEffective(world, delegation.id) || {
		    dailyLimit: delegation.dailyLimit,
		    dailyRemaining: void 0,
		    usedToday: delegation.usedToday
		  };
		  const used = Number(delegation.usedToday) || 0;
		  const dailyLimit = Number(effective.dailyLimit || delegation.dailyLimit) || 0;
		  const usedRatio = dailyLimit > 0 ? Math.min(used / dailyLimit, 1) : 0;
		  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
		    "div",
		    {
		      className: "tp-list-row",
		      style: { flexDirection: "column", alignItems: "stretch", gap: 8 },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-inline", style: { width: "100%" }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-list-title", children: delegation.name }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(StatusTag, { map: DELEGATION_STATUS, status: delegation.status }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-grow" }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "tp-hint", children: [
		            delegation.issuerName,
		            " → ",
		            delegation.subjectName
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-small tp-muted", children: delegation.purpose }),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-inline", children: (delegation.actionLabels || []).map((label) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Tag, { tone: "neutral", children: label }, label)) }),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-progress-row", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-hint", style: { whiteSpace: "nowrap" }, children: "今日已用" }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Progress, { value: usedRatio, tone: usedRatio >= 0.8 ? "danger" : usedRatio >= 0.6 ? "warn" : "success" }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "tp-hint", style: { whiteSpace: "nowrap" }, children: [
		            fmtMoney(used),
		            " / ",
		            fmtMoney(dailyLimit)
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-inline", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "tp-hint", children: [
		            "单笔上限 ",
		            fmtMoney(delegation.amountLimit)
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-dot-sep" }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "tp-hint", children: [
		            "日累计上限 ",
		            fmtMoney(delegation.dailyLimit)
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-dot-sep" }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "tp-hint", children: [
		            "有效期 ",
		            fmtDate(delegation.validFrom),
		            " 至 ",
		            fmtDate(delegation.validTo)
		          ] }),
		          effective.dailyRemaining !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-dot-sep" }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "tp-hint", children: [
		              "今日剩余 ",
		              fmtMoney(effective.dailyRemaining)
		            ] })
		          ] }) : null
		        ] }),
		        chain.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-chain", style: { marginTop: 2 }, children: chain.map((node, index) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_react11.Fragment, { children: [
		          index > 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-chain-arrow" }) : null,
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: `tp-chain-node${index === 0 ? " root" : ""}`, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-chain-line", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Avatar, { name: node.issuerName, seed: node.issuerDid, size: "sm" }),
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-chain-name", children: node.issuerName }),
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Icon, { name: "chevronRight", size: 12 }),
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "tp-chain-name", children: node.subjectName })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-chain-detail", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
		                "单笔 ",
		                fmtMoney(node.amountLimit)
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
		                "日累计 ",
		                fmtMoney(node.dailyLimit)
		              ] })
		            ] })
		          ] })
		        ] }, node.id)) }) : null,
		        delegation.status === "REVOKED" && delegation.revokeReason ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tp-callout warn", style: { padding: "8px 10px" }, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "tp-callout-body", children: [
		          "已撤销",
		          delegation.revokedAt ? `（${fmtDate(delegation.revokedAt)}）` : "",
		          "：",
		          delegation.revokeReason
		        ] }) }) : null
		      ]
		    }
		  );
		}
		function buildRiskNotes({ agent, credentials, granted, issued, tasks }) {
		  const notes = [];
		  const suspended = credentials.filter((credential) => credential.status === "SUSPENDED");
		  if (suspended.length > 0) {
		    notes.push({
		      tone: "warn",
		      title: `${suspended.length} 张凭证处于暂停状态`,
		      body: "暂停期间相关付款会被自动拒绝，需要在签发方重新核验后才能恢复。"
		    });
		  }
		  const blocked = tasks.filter((task) => task.riskDecision === "BLOCK");
		  if (blocked.length > 0) {
		    notes.push({
		      tone: "danger",
		      title: `${blocked.length} 笔付款任务被拦截`,
		      body: `最近一笔为「${blocked[0].title}」。如确需继续，请走人工复核或调整策略阈值。`
		    });
		  }
		  const deferred = tasks.filter((task) => task.riskDecision === "DEFER");
		  if (deferred.length > 0) {
		    notes.push({
		      tone: "warn",
		      title: `${deferred.length} 笔任务曾转人工复核`,
		      body: "人工复核会保留完整记录，建议关注同一交易对手是否反复触发。"
		    });
		  }
		  const revoked = [...granted, ...issued].filter((delegation) => delegation.status === "REVOKED");
		  if (revoked.length > 0) {
		    notes.push({
		      tone: "info",
		      title: `存在 ${revoked.length} 项已撤销的委托`,
		      body: "撤销不会删除历史记录，但新的请求会被拒绝。"
		    });
		  }
		  if (agent.role === "compliance") {
		    notes.push({
		      tone: "info",
		      title: "只读审计代理",
		      body: "该代理不持有付款委托，只能查看与调查，符合职责分离要求。"
		    });
		  }
		  if (Number(agent.trustScore) < 0.92) {
		    notes.push({
		      tone: "warn",
		      title: "信任分低于组织平均水平",
		      body: "建议缩小单笔额度、要求人工复核，或在观察期内只开放小额任务。"
		    });
		  }
		  if (agent.role !== "compliance" && granted.length === 0 && credentials.length === 0) {
		    notes.push({
		      tone: "danger",
		      title: "缺少有效授权",
		      body: "该代理没有凭证也没有委托，目前无法发起任何付款。"
		    });
		  }
		  if (notes.length === 0) {
		    notes.push({
		      tone: "success",
		      title: "暂未发现异常",
		      body: "凭证有效、委托仍在有效期内，近期任务没有被拦截或长时间挂起。"
		    });
		  }
		  return notes;
		}

		// src/client/product/pages/delegations.jsx
		var import_react12 = require("react");
		var import_jsx_runtime11 = require("react/jsx-runtime");
		var EXPIRING_WINDOW = 14 * 24 * 60 * 60 * 1e3;
		var FILTERS2 = [
		  { value: "all", label: "全部" },
		  { value: "active", label: "生效中" },
		  { value: "expiring", label: "即将到期" },
		  { value: "inactive", label: "已失效" }
		];
		var STATUS_RANK = { ACTIVE: 0, EXPIRED: 1, REVOKED: 2 };
		var isExpiring = (item) => {
		  if (item.status !== "ACTIVE") return false;
		  const left = new Date(item.validTo).getTime() - Date.now();
		  return left > 0 && left <= EXPIRING_WINDOW;
		};
		var matchesFilter = (item, value) => {
		  if (value === "all") return true;
		  if (value === "active") return item.status === "ACTIVE";
		  if (value === "expiring") return isExpiring(item);
		  if (value === "inactive") return item.status !== "ACTIVE";
		  return true;
		};
		function DelegationsPage() {
		  const world = useWorld();
		  const actions2 = useActions();
		  const { navigate } = useNavigation();
		  const toast = useToast();
		  const [filter, setFilter] = (0, import_react12.useState)("all");
		  const [revokeTarget, setRevokeTarget] = (0, import_react12.useState)(null);
		  const [reason, setReason] = (0, import_react12.useState)("");
		  const delegations = [...world.delegations].sort((left, right) => {
		    const byStatus = (STATUS_RANK[left.status] ?? 3) - (STATUS_RANK[right.status] ?? 3);
		    if (byStatus !== 0) return byStatus;
		    return chainFor(world, left.id).length - chainFor(world, right.id).length;
		  });
		  const filterOptions = FILTERS2.map((item) => ({
		    value: item.value,
		    label: item.label,
		    count: item.value === "all" ? delegations.length : delegations.filter((entry) => matchesFilter(entry, item.value)).length
		  }));
		  const visible = delegations.filter((item) => matchesFilter(item, filter));
		  const active = delegations.filter((item) => item.status === "ACTIVE");
		  const expiring = active.filter(isExpiring);
		  const revoked = delegations.filter((item) => item.status === "REVOKED");
		  const expired = delegations.filter((item) => item.status === "EXPIRED");
		  const usedToday = active.reduce((total, item) => total + (Number(item.usedToday) || 0), 0);
		  const dailyTotal = active.reduce((total, item) => total + (Number(item.dailyLimit) || 0), 0);
		  const nearest = [...active].sort((left, right) => new Date(left.validTo).getTime() - new Date(right.validTo).getTime())[0] || null;
		  const subjectCount = new Set(active.map((item) => item.subjectId)).size;
		  const closeRevoke = () => {
		    setRevokeTarget(null);
		    setReason("");
		  };
		  const confirmRevoke = () => {
		    if (!revokeTarget) return;
		    const trimmed = reason.trim();
		    if (!trimmed) {
		      toast.push("请填写撤销原因，便于审计追溯", "error");
		      return;
		    }
		    actions2.revokeDelegation(revokeTarget.id, { reason: trimmed, by: "周明（财务负责人）" });
		    toast.push("委托已撤销，代理权限已收回", "success");
		    closeRevoke();
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-page", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		      PageHead,
		      {
		        title: "委托授权",
		        desc: "资金负责人把付款权限交给代理，并在这里设定单笔限额、每日限额与有效期。撤销或到期都会立即生效。",
		        actions: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Segmented, { value: filter, onChange: setFilter, options: filterOptions })
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-stat-grid", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		        StatCard,
		        {
		          label: "生效中委托",
		          value: active.length,
		          unit: "项",
		          icon: "branch",
		          iconTone: "var(--tp-accent)",
		          foot: `覆盖 ${subjectCount} 个执行代理`
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		        StatCard,
		        {
		          label: "14 天内到期",
		          value: expiring.length,
		          unit: "项",
		          icon: "clock",
		          iconTone: "var(--tp-warn)",
		          foot: nearest ? `${nearest.subjectName} · ${fmtCountdown(nearest.validTo)}后到期` : "暂无临近到期的委托"
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		        StatCard,
		        {
		          label: "今日已用额度",
		          value: fmtMoney(usedToday),
		          icon: "wallet",
		          iconTone: "var(--tp-info)",
		          foot: dailyTotal ? `占生效日额度的 ${fmtPct(usedToday / dailyTotal, 1)}` : "暂无生效额度"
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		        StatCard,
		        {
		          label: "已撤销委托",
		          value: revoked.length,
		          unit: "项",
		          icon: "xCircle",
		          iconTone: "var(--tp-danger)",
		          foot: expired.length ? `另有 ${expired.length} 项已过期并失效` : "撤销后相关代理立即失去权限"
		        }
		      )
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-callout info", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-callout-title", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, { name: "shield", size: 14 }),
		        "委托权限逐级收窄"
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "tp-callout-body", children: "单笔与每日限额取整条链中最窄的一级；上级委托撤销或到期后，下游代理会立即失去对应权限。" })
		    ] }),
		    visible.length ? visible.map((item) => {
		      const chain = chainFor(world, item.id);
		      const effective = chainEffective(world, item.id);
		      const parent = chain.length > 1 ? chain[chain.length - 2] : null;
		      const linkedTasks = world.tasks.filter((task) => task.delegationId === item.id);
		      const dailyRatio = item.dailyLimit ? Math.min(1, item.usedToday / item.dailyLimit) : 0;
		      const isActive = item.status === "ACTIVE";
		      return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(Card, { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { display: "flex", alignItems: "flex-start", gap: 12 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Avatar, { name: item.subjectName, seed: item.subjectId, size: "lg" }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-grow", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-inline", style: { gap: 8 }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "tp-strong", style: { fontSize: 14 }, children: item.name }),
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(StatusTag, { map: DELEGATION_STATUS, status: item.status }),
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Tag, { tone: "neutral", children: `${chain.length} 级委托` }),
		              item.canRedelegate ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Tag, { tone: "info", children: "可再委托" }) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Tag, { tone: "neutral", children: "不可再委托" })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "tp-hint", style: { marginTop: 3 }, children: item.purpose }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-inline", style: { marginTop: 8, gap: 6 }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Avatar, { name: item.issuerName, seed: item.issuerDid, size: "sm" }),
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "tp-small tp-strong", children: item.issuerName }),
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, { name: "arrowRight", size: 13, style: { color: "var(--tp-text-3)" } }),
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Avatar, { name: item.subjectName, seed: item.subjectDid, size: "sm" }),
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "tp-small tp-strong", children: item.subjectName }),
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: "tp-faint tp-small", children: [
		                "可执行：",
		                item.actionLabels.join("、")
		              ] })
		            ] })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { flex: "none", textAlign: "right" }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "tp-faint tp-small", children: isActive ? "剩余有效期" : item.status === "REVOKED" ? "撤销时间" : "到期时间" }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "tp-strong tp-num", style: { marginTop: 2 }, children: isActive ? fmtCountdown(item.validTo) : item.status === "REVOKED" ? fmtRelative(item.revokedAt) : fmtRelative(item.validTo) }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "tp-faint tp-small", style: { marginTop: 2 }, children: `截止 ${fmtDateTime(item.validTo)}` })
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 16, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--tp-border-soft)" }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "tp-label", children: "单笔限额" }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "tp-strong tp-num", style: { marginTop: 4, fontSize: 15 }, children: fmtMoney(item.amountLimit, item.currency) }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "tp-hint", children: "本层委托允许的最大单笔金额" })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-inline", style: { justifyContent: "space-between" }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "tp-label", children: "今日累计" }),
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: "tp-faint tp-small tp-num", children: [
		                fmtMoney(item.usedToday, item.currency),
		                " / ",
		                fmtMoney(item.dailyLimit, item.currency)
		              ] })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { marginTop: 8 }, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Progress, { value: dailyRatio, tone: dailyRatio >= 0.8 ? "warn" : "" }) }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-hint", style: { marginTop: 4 }, children: [
		              "今日剩余 ",
		              fmtMoney(Math.max(0, item.dailyLimit - item.usedToday), item.currency)
		            ] })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "tp-label", children: "有效窗口" }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-small", style: { marginTop: 4 }, children: [
		              fmtDateTime(item.validFrom),
		              " 至 ",
		              fmtDateTime(item.validTo)
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "tp-hint", style: { marginTop: 4 }, children: isActive ? `${fmtCountdown(item.validTo)}后自动到期` : item.status === "REVOKED" ? "撤销后即刻失效" : "已超过有效期" })
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { marginTop: 12, padding: "10px 12px", borderRadius: "var(--tp-radius-md)", background: "var(--tp-surface-2)" }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-inline", style: { gap: 6 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "tp-label", style: { marginRight: 4 }, children: "委托链路" }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Avatar, { name: item.issuerName, seed: item.issuerDid, size: "sm" }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "tp-small tp-strong", children: item.issuerName }),
		            chain.map((level) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: "tp-inline", style: { gap: 6 }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, { name: "chevronRight", size: 12, style: { color: "var(--tp-text-3)" } }),
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Avatar, { name: level.subjectName, seed: level.subjectDid, size: "sm" }),
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: level.id === item.id ? "tp-small tp-strong" : "tp-small", children: level.subjectName })
		            ] }, level.id))
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-hint", style: { marginTop: 6 }, children: [
		            parent ? `上级委托：${parent.name} · ` : "一级委托，由资金负责人直接签发 · ",
		            "整条链生效单笔上限 ",
		            fmtMoney(effective.amountLimit, item.currency),
		            "，今日剩余 ",
		            fmtMoney(effective.dailyRemaining, item.currency),
		            effective.active ? "" : "（链路中含有已失效环节）"
		          ] })
		        ] }),
		        item.status === "REVOKED" ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-callout warn", style: { marginTop: 10 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-callout-title", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, { name: "alert", size: 14 }),
		            "该委托已撤销"
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-callout-body", children: [
		            "撤销原因：",
		            item.revokeReason || "未填写"
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-callout-detail", children: [
		            fmtRelative(item.revokedAt),
		            "撤销 · ",
		            item.subjectName,
		            " 已失去对应付款权限"
		          ] })
		        ] }) : null,
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 10, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--tp-border-soft)", flexWrap: "wrap" }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: "tp-faint tp-small", children: [
		            "关联任务 ",
		            linkedTasks.length,
		            " 笔 · 今日已用 ",
		            fmtMoney(item.usedToday, item.currency)
		          ] }),
		          linkedTasks.length ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		            Button,
		            {
		              size: "sm",
		              variant: "ghost",
		              icon: "external",
		              onClick: () => navigate("task", { taskId: linkedTasks[0].id }),
		              children: "查看最近一笔任务"
		            }
		          ) : null,
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "tp-toolbar-end tp-inline", style: { gap: 8 }, children: isActive ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Button, { size: "sm", variant: "danger", icon: "trash", onClick: () => {
		            setRevokeTarget(item);
		            setReason("");
		          }, children: "撤销委托" }) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Tag, { tone: item.status === "REVOKED" ? "danger" : "neutral", children: item.status === "REVOKED" ? "权限已收回" : "已过期" }) })
		        ] })
		      ] }, item.id);
		    }) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		      EmptyState,
		      {
		        icon: "branch",
		        title: filter === "all" ? "还没有委托记录" : "没有符合筛选的委托",
		        desc: filter === "all" ? "资金负责人签发委托后，这里会显示每一级的权限、限额与有效期。" : "换一个筛选条件，或查看全部委托。",
		        action: filter === "all" ? null : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Button, { variant: "ghost", onClick: () => setFilter("all"), children: "查看全部委托" })
		      }
		    ) }),
		    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		      Modal,
		      {
		        open: Boolean(revokeTarget),
		        onClose: closeRevoke,
		        title: "撤销委托",
		        footer: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-drawer-actions", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Button, { variant: "ghost", onClick: closeRevoke, children: "取消" }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Button, { variant: "danger", icon: "trash", disabled: !reason.trim(), onClick: confirmRevoke, children: "确认撤销" })
		        ] }),
		        children: revokeTarget ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-stack", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-callout danger", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-callout-title", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, { name: "alert", size: 14 }),
		              "撤销后权限立即收回"
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "tp-callout-body", children: [
		              revokeTarget.subjectName,
		              " 将立即失去「",
		              revokeTarget.actionLabels.join("、"),
		              "」权限，其下游委托也会一并失效。"
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "tp-callout-detail", children: "该操作会写入审计记录，不可撤回；如只是临时停用，建议等委托到期自动失效。" })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		            KV,
		            {
		              items: [
		                { k: "委托", v: revokeTarget.name },
		                { k: "授权对象", v: revokeTarget.subjectName },
		                { k: "单笔限额", v: fmtMoney(revokeTarget.amountLimit, revokeTarget.currency) },
		                { k: "剩余有效期", v: fmtCountdown(revokeTarget.validTo) }
		              ]
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Field, { label: "撤销原因", hint: "必填。会写入审计记录，对代理和审计员可见。", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		            "textarea",
		            {
		              className: "tp-textarea",
		              rows: 3,
		              value: reason,
		              onChange: (event2) => setReason(event2.target.value),
		              placeholder: "例如：代理行为异常，暂停其付款权限"
		            }
		          ) })
		        ] }) : null
		      }
		    )
		  ] });
		}

		// src/client/product/pages/governance.jsx
		var import_react13 = require("react");
		var import_jsx_runtime12 = require("react/jsx-runtime");
		var RISK_COLORS2 = {
		  ALLOW: "#1f9d63",
		  THROTTLE: "#0a6cff",
		  DEFER: "#b36b00",
		  BLOCK: "#d92d20"
		};
		var THRESHOLD_ROWS = [
		  {
		    key: "block",
		    label: "拦截",
		    tone: "danger",
		    color: RISK_COLORS2.BLOCK,
		    desc: "风险分达到该值直接拒绝，不留给人工放行的入口。"
		  },
		  {
		    key: "defer",
		    label: "转人工",
		    tone: "warn",
		    color: RISK_COLORS2.DEFER,
		    desc: "达到该值后暂停任务，等待财务负责人复核。"
		  },
		  {
		    key: "throttle",
		    label: "限流",
		    tone: "info",
		    color: RISK_COLORS2.THROTTLE,
		    desc: "达到该值后允许继续，但降低频次与单笔额度。"
		  }
		];
		function clamp012(value) {
		  return Math.min(Math.max(Number(value) || 0, 0), 1);
		}
		function isOrdered(thresholds) {
		  return thresholds.block >= thresholds.defer && thresholds.defer >= thresholds.throttle;
		}
		function fmtThreshold(value) {
		  return clamp012(value).toFixed(2);
		}
		function isDirty(policy, value) {
		  return THRESHOLD_ROWS.some(
		    (row) => Math.abs((Number(value[row.key]) || 0) - (Number(policy.thresholds[row.key]) || 0)) > 1e-3
		  );
		}
		function zoneSegments(thresholds) {
		  const block = clamp012(thresholds.block);
		  const defer = clamp012(thresholds.defer);
		  const throttle = clamp012(thresholds.throttle);
		  return [
		    { label: "放行", color: RISK_COLORS2.ALLOW, width: throttle },
		    { label: "限流", color: RISK_COLORS2.THROTTLE, width: Math.max(defer - throttle, 0) },
		    { label: "转人工", color: RISK_COLORS2.DEFER, width: Math.max(block - defer, 0) },
		    { label: "拦截", color: RISK_COLORS2.BLOCK, width: Math.max(1 - block, 0) }
		  ];
		}
		function policyHistory(world, policy) {
		  return (world.events || []).filter(
		    (event2) => event2.taskId === policy.id && (event2.type === "POLICY_PUBLISHED" || event2.type === "POLICY_REVISED")
		  ).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
		}
		function GovernancePage() {
		  const world = useWorld();
		  const actions2 = useActions();
		  const toast = useToast();
		  const [tab, setTab] = (0, import_react13.useState)("policies");
		  const [drafts, setDrafts] = (0, import_react13.useState)({});
		  const [publishTarget, setPublishTarget] = (0, import_react13.useState)(null);
		  const stats = (0, import_react13.useMemo)(() => dashboardStats(world), [world]);
		  const distribution = (0, import_react13.useMemo)(() => riskDistribution(world), [world]);
		  const policies = world.policies || [];
		  const models = world.models || [];
		  const published = policies.filter((policy) => policy.status === "PUBLISHED");
		  const pendingDrafts = policies.filter((policy) => policy.status === "DRAFT");
		  const liveModels = models.filter((model) => model.status === "PUBLISHED");
		  const ruleTotal = policies.reduce((sum, policy) => sum + (Number(policy.ruleCount) || 0), 0);
		  const reference = published[0] || policies[0] || null;
		  const valueOf = (policy) => drafts[policy.id] || policy.thresholds;
		  const changeThreshold = (policy, key, raw2) => {
		    if (policy.status !== "DRAFT") return;
		    setDrafts((prev) => ({
		      ...prev,
		      [policy.id]: { ...prev[policy.id] || policy.thresholds, [key]: clamp012(raw2) }
		    }));
		  };
		  const resetDraft = (policy) => setDrafts((prev) => {
		    const next = { ...prev };
		    delete next[policy.id];
		    return next;
		  });
		  const saveDraft = (policy) => {
		    const value = valueOf(policy);
		    if (!isOrdered(value)) {
		      toast.push("阈值需满足：拦截 ≥ 转人工 ≥ 限流", "error");
		      return;
		    }
		    actions2.savePolicyThresholds(policy.id, value);
		    resetDraft(policy);
		    toast.push(`「${policy.name}」草稿已保存，发布后才会生效`, "success");
		  };
		  const askPublish = (policy) => {
		    if (!isOrdered(valueOf(policy))) {
		      toast.push("阈值顺序不对，无法发布", "error");
		      return;
		    }
		    setPublishTarget(policy);
		  };
		  const confirmPublish = () => {
		    if (!publishTarget) return;
		    const policy = publishTarget;
		    const value = valueOf(policy);
		    if (isDirty(policy, value)) actions2.savePolicyThresholds(policy.id, value);
		    actions2.publishPolicy(policy.id);
		    resetDraft(policy);
		    setPublishTarget(null);
		    toast.push(`「${policy.name}」已发布，新阈值立即对全部代理生效`, "success");
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-page", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		      PageHead,
		      {
		        title: "治理策略",
		        desc: "风险越高，处置越严格：低风险自动放行，中风险限流，较高风险转人工复核，高风险直接拦截。所有调整都会留下版本记录。",
		        actions: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		          Segmented,
		          {
		            value: tab,
		            onChange: setTab,
		            options: [
		              { value: "policies", label: "风险策略", count: policies.length },
		              { value: "models", label: "风险模型", count: models.length }
		            ]
		          }
		        )
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-stat-grid", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		        StatCard,
		        {
		          label: "生效中的策略",
		          value: published.length,
		          unit: `/ ${policies.length}`,
		          icon: "shield",
		          iconTone: "var(--tp-success)",
		          foot: "覆盖全部代理付款"
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		        StatCard,
		        {
		          label: "待发布草稿",
		          value: pendingDrafts.length,
		          unit: "项",
		          icon: "fileText",
		          iconTone: pendingDrafts.length > 0 ? "var(--tp-warn)" : "var(--tp-text-3)",
		          foot: pendingDrafts.length > 0 ? "调整阈值后需发布才生效" : "没有待发布的草稿"
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		        StatCard,
		        {
		          label: "运行中的模型",
		          value: liveModels.length,
		          unit: `/ ${models.length}`,
		          icon: "activity",
		          iconTone: "var(--tp-accent)",
		          foot: `合计覆盖 ${ruleTotal} 条规则`
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		        StatCard,
		        {
		          label: "近 7 天风险事件",
		          value: stats.riskEvents7d,
		          unit: "起",
		          icon: "alert",
		          iconTone: "var(--tp-warn)",
		          foot: `拦截 ${stats.blocked} 笔 · 转人工 ${stats.humanReview} 笔`
		        }
		      )
		    ] }),
		    tab === "policies" ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
		      policies.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		        EmptyState,
		        {
		          icon: "shield",
		          title: "还没有风险策略",
		          desc: "没有策略时代理无法发起付款，请先创建一条策略。"
		        }
		      ) }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-stack", children: policies.map((policy) => {
		        const value = valueOf(policy);
		        return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		          PolicyCard,
		          {
		            world,
		            policy,
		            value,
		            dirty: isDirty(policy, value),
		            ordered: isOrdered(value),
		            onChange: (key, raw2) => changeThreshold(policy, key, raw2),
		            onReset: () => resetDraft(policy),
		            onSave: () => saveDraft(policy),
		            onPublish: () => askPublish(policy)
		          },
		          policy.id
		        );
		      }) }),
		      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-grid-2-1", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		          Card,
		          {
		            title: "风险决策分布",
		            desc: "全部付款任务按实际处置结果汇总，反映策略当前的严格程度。",
		            children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-donut-row", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		                Donut,
		                {
		                  segments: distribution.map((item) => ({
		                    label: item.label,
		                    value: item.count,
		                    color: RISK_COLORS2[item.key] || RISK_COLORS2.ALLOW
		                  })),
		                  size: 168,
		                  thickness: 20,
		                  center: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-donut-value", children: stats.totalTasks }),
		                    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-faint", children: "付款任务" })
		                  ] })
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-grow", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		                  Legend,
		                  {
		                    items: distribution.map((item) => ({
		                      label: item.label,
		                      color: RISK_COLORS2[item.key] || RISK_COLORS2.ALLOW,
		                      value: item.count
		                    }))
		                  }
		                ),
		                /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-card-note", children: "阈值越严格，拦截与转人工的占比越会上升，放行笔数相应减少。" })
		              ] })
		            ] })
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		          Card,
		          {
		            title: "阈值怎么读",
		            desc: reference ? `以「${reference.name}」的当前阈值为例` : "四段区间对应四种处置",
		            children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-stack", style: { gap: 10 }, children: reference ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
		              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		                ThresholdExplainer,
		                {
		                  tone: "danger",
		                  title: `拦截 · 风险分 ≥ ${fmtThreshold(valueOf(reference).block)}`,
		                  body: "自动拒绝，不进入人工审批；如需继续必须调整策略或走线下特批。"
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		                ThresholdExplainer,
		                {
		                  tone: "warn",
		                  title: `转人工 · ${fmtThreshold(valueOf(reference).defer)} – ${fmtThreshold(valueOf(reference).block)}`,
		                  body: "任务暂停并通知财务复核，复核通过后才提交付款。"
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		                ThresholdExplainer,
		                {
		                  tone: "info",
		                  title: `限流 · ${fmtThreshold(valueOf(reference).throttle)} – ${fmtThreshold(valueOf(reference).defer)}`,
		                  body: "允许继续，但会降低发起频次并收紧单笔额度，同时保留记录。"
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		                ThresholdExplainer,
		                {
		                  tone: "success",
		                  title: `放行 · 低于 ${fmtThreshold(valueOf(reference).throttle)}`,
		                  body: "自动放行，仍需按正常流程提交付款并留存凭证。"
		                }
		              )
		            ] }) : null })
		          }
		        )
		      ] })
		    ] }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
		      models.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		        EmptyState,
		        {
		          icon: "activity",
		          title: "还没有风险模型",
		          desc: "缺少模型时只有静态限额规则生效，风险判断会偏保守。"
		        }
		      ) }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-grid tp-grid-2", children: models.map((model) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ModelCard, { model }, model.id)) }),
		      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Card, { title: "模型与策略的关系", desc: "模型只负责打分，策略负责决定怎么处置", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-callout info", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-callout-title", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "info", size: 14 }),
		          "风险分先由模型给出，再由策略阈值划分区间"
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-callout-body", children: "模型综合金额偏离、对手方历史、账户变更等信号，给每笔交易打一个 0 到 1 的风险分； 风险策略把这把尺子切成四段，分别对应放行、限流、转人工和拦截。" }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-callout-detail", children: "更换模型或更新版本，会改变风险分的整体水平，因此上线前需要与当前阈值一起评估。" })
		      ] }) })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-footer-note", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "lock", size: 12, style: { verticalAlign: "-2px", marginRight: 4 } }),
		      "策略发布与阈值修改都会写入审计记录，历史版本不会被覆盖删除。"
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		      Modal,
		      {
		        open: Boolean(publishTarget),
		        onClose: () => setPublishTarget(null),
		        title: "发布策略",
		        footer: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { onClick: () => setPublishTarget(null), children: "取消" }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { variant: "primary", icon: "check", onClick: confirmPublish, children: "确认发布" })
		        ] }),
		        children: publishTarget ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-stack", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("p", { className: "tp-muted", style: { margin: 0, lineHeight: 1.6 }, children: [
		            "发布后「",
		            publishTarget.name,
		            "」的新阈值会立即对全部代理生效，已在途任务仍按原策略处理。"
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-callout warn", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-callout-title", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "alert", size: 14 }),
		              "即将生效的阈值"
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-callout-body", children: [
		              "拦截 ",
		              fmtThreshold(valueOf(publishTarget).block),
		              " · 转人工",
		              " ",
		              fmtThreshold(valueOf(publishTarget).defer),
		              " · 限流",
		              " ",
		              fmtThreshold(valueOf(publishTarget).throttle)
		            ] })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		            KV,
		            {
		              items: [
		                { k: "策略版本", v: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "tp-mono", children: publishTarget.version }) },
		                { k: "适用范围", v: publishTarget.scope },
		                { k: "规则数量", v: `${publishTarget.ruleCount || 0} 条` },
		                { k: "撤销方式", v: "发布新版本覆盖，历史版本保留在审计记录中" }
		              ]
		            }
		          )
		        ] }) : null
		      }
		    )
		  ] });
		}
		function PolicyCard({ world, policy, value, dirty, ordered, onChange, onReset, onSave, onPublish }) {
		  const isDraft = policy.status === "DRAFT";
		  const zones = zoneSegments(value);
		  const history = policyHistory(world, policy);
		  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
		    Card,
		    {
		      title: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "tp-inline", style: { gap: 8 }, children: [
		        policy.name,
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(StatusTag, { map: POLICY_STATUS, status: policy.status }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(Tag, { tone: "neutral", children: [
		          "版本 ",
		          policy.version
		        ] })
		      ] }),
		      desc: `适用范围：${policy.scope} · 覆盖 ${policy.ruleCount || 0} 条规则`,
		      actions: isDraft ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: onReset, disabled: !dirty, children: "撤销改动" }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", onClick: onSave, disabled: !dirty || !ordered, children: "保存草稿" }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "primary", icon: "send", onClick: onPublish, disabled: !ordered, children: "发布策略" })
		      ] }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Tag, { tone: "success", children: "只读发布版" }),
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-inline", style: { justifyContent: "space-between", width: "100%", marginBottom: 10 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "tp-muted tp-small", style: { lineHeight: 1.6 }, children: policy.description }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "tp-hint", style: { flex: "none", marginLeft: 12 }, children: [
		            policy.publishedAt ? `${fmtDateTime(policy.publishedAt)} 起生效` : "发布后生效",
		            policy.publishedBy ? ` · ${policy.publishedBy}` : ""
		          ] })
		        ] }),
		        THRESHOLD_ROWS.map((row) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-threshold-row", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Tag, { tone: row.tone, children: row.label }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		            "input",
		            {
		              type: "range",
		              min: "0",
		              max: "1",
		              step: "0.01",
		              value: clamp012(value[row.key]),
		              disabled: !isDraft,
		              "aria-label": `${row.label}阈值`,
		              onChange: (event2) => onChange(row.key, event2.target.value)
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "tp-slider-value", children: fmtThreshold(value[row.key]) })
		        ] }, row.key)),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		          "div",
		          {
		            style: {
		              display: "flex",
		              height: 8,
		              borderRadius: 999,
		              overflow: "hidden",
		              marginTop: 14,
		              background: "var(--tp-surface-3)"
		            },
		            children: zones.map((zone) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		              "div",
		              {
		                title: `${zone.label} ${Math.round(zone.width * 100)}%`,
		                style: { width: `${zone.width * 100}%`, background: zone.color, opacity: 0.85 }
		              },
		              zone.label
		            ))
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-chart-foot", children: zones.map((zone) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "tp-inline", style: { gap: 5 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		            "span",
		            {
		              style: {
		                display: "inline-block",
		                width: 7,
		                height: 7,
		                borderRadius: "50%",
		                background: zone.color
		              }
		            }
		          ),
		          zone.label
		        ] }, zone.label)) }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-card-note", children: [
		          "风险分 ≥ ",
		          fmtThreshold(value.block),
		          " 拦截；",
		          fmtThreshold(value.defer),
		          "–",
		          fmtThreshold(value.block),
		          " 转人工；",
		          fmtThreshold(value.throttle),
		          "–",
		          fmtThreshold(value.defer),
		          " 限流；低于 ",
		          fmtThreshold(value.throttle),
		          " 放行。",
		          !isDraft ? " 已发布策略如需调整，请保存为新草稿并重新发布。" : ""
		        ] }),
		        !ordered ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-callout warn", style: { marginTop: 10 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-callout-title", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "alert", size: 14 }),
		            "阈值顺序需要满足：拦截 ≥ 转人工 ≥ 限流"
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-callout-body", children: "当前顺序会导致区间重叠，无法判断该拦截还是转人工，因此保存与发布都被阻止。" })
		        ] }) : null,
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-divider", style: { margin: "12px 0" } }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-label", style: { marginBottom: 6 }, children: "版本历史" }),
		        history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-hint", children: policy.status === "PUBLISHED" ? `当前版本 ${policy.version} 为初始发布版本，暂无修改记录。` : "尚未发布；保存草稿与发布都会在这里生成记录。" }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-list", children: history.map((event2) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-list-row", style: { padding: "8px 2px" }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-list-main", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-list-title", children: [
		              event2.type === "POLICY_PUBLISHED" ? "发布新版本" : "调整阈值",
		              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Tag, { tone: event2.tone === "success" ? "success" : "neutral", children: event2.type === "POLICY_PUBLISHED" ? "已发布" : "草稿修改" })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-list-sub", children: event2.body })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-list-side", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "tp-hint", children: fmtDateTime(event2.at) }) })
		        ] }, event2.id)) })
		      ]
		    }
		  );
		}
		function ThresholdExplainer({ tone, title, body }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: `tp-callout ${tone}`, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "tp-callout-title", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		        Icon,
		        {
		          name: tone === "danger" ? "xCircle" : tone === "warn" ? "clock" : tone === "info" ? "sliders" : "checkCircle",
		          size: 14
		        }
		      ),
		      title
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-callout-body", children: body })
		  ] });
		}
		function ModelCard({ model }) {
		  const metrics = model.metrics || {};
		  const live = model.status === "PUBLISHED";
		  const features = model.features || [];
		  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
		    Card,
		    {
		      title: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "tp-inline", style: { gap: 8 }, children: [
		        model.name,
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Tag, { tone: live ? "success" : "neutral", children: live ? "使用中" : POLICY_STATUS[model.status]?.label || "草稿" })
		      ] }),
		      desc: `版本 ${model.version}${model.publishedAt ? ` · ${fmtDate(model.publishedAt)} 上线` : ""}`,
		      actions: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(Tag, { tone: "neutral", children: [
		        features.length,
		        " 项判断依据"
		      ] }),
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { className: "tp-muted tp-small", style: { margin: "0 0 12px", lineHeight: 1.6 }, children: model.description }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ModelMetric, { label: "区分能力", value: fmtPct(metrics.auc) }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ModelMetric, { label: "判断准确率", value: fmtPct(metrics.precision) }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ModelMetric, { label: "异常召回率", value: fmtPct(metrics.recall) }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ModelMetric, { label: "参考样本", value: fmtNum(metrics.samples) })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-divider", style: { margin: "12px 0" } }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-label", style: { marginBottom: 6 }, children: "主要判断依据" }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-inline", children: features.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Tag, { tone: "neutral", children: feature }, feature)) }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-card-note", children: "模型只负责给出 0 到 1 的风险分，是否拦截或转人工由风险策略的阈值决定。" })
		      ]
		    }
		  );
		}
		function ModelMetric({ label, value }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { children: [
		    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-label", children: label }),
		    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "tp-strong tp-num", style: { marginTop: 2, fontSize: 13 }, children: value })
		  ] });
		}

		// src/client/product/pages/audit.jsx
		var import_react14 = require("react");
		var import_jsx_runtime13 = require("react/jsx-runtime");
		var SEVERITY = {
		  critical: { label: "严重", tone: "danger" },
		  high: { label: "高", tone: "danger" },
		  medium: { label: "中", tone: "warn" },
		  low: { label: "低", tone: "neutral" }
		};
		var REPORT_SECTIONS = ["委托链健康度", "风险决策分布", "结算闭环", "案件与整改", "证据覆盖率"];
		function severityOf(value) {
		  return SEVERITY[value] || { label: "一般", tone: "neutral" };
		}
		function displayFormat(format) {
		  return String(format || "").split("·").map((part) => {
		    const value = part.trim();
		    return value === "JSON" ? "数据文件" : value;
		  }).filter(Boolean).join(" · ");
		}
		function defaultPeriod() {
		  const now = /* @__PURE__ */ new Date();
		  return `${now.getFullYear()} 年 ${now.getMonth() + 1} 月`;
		}
		function linkedEvidence(world, item) {
		  if (!item) return [];
		  const taskIds = new Set(item.linkedTaskIds || []);
		  for (const event2 of world.events || []) {
		    if ((item.linkedEventIds || []).includes(event2.id) && event2.taskId) taskIds.add(event2.taskId);
		  }
		  const seen = /* @__PURE__ */ new Set();
		  const rows = [];
		  for (const taskId of taskIds) {
		    for (const evidence of evidenceForTask(world, taskId)) {
		      if (seen.has(evidence.id)) continue;
		      seen.add(evidence.id);
		      rows.push(evidence);
		    }
		  }
		  return rows;
		}
		function groupEvidenceByKind(rows) {
		  const groups = /* @__PURE__ */ new Map();
		  for (const row of rows) {
		    if (!groups.has(row.kind)) groups.set(row.kind, []);
		    groups.get(row.kind).push(row);
		  }
		  return [...groups.entries()].map(([kind, items]) => {
		    const anchored = items.filter((item) => item.anchored).length;
		    return {
		      kind,
		      items,
		      total: items.length,
		      anchored,
		      coverage: items.length ? anchored / items.length : 0
		    };
		  });
		}
		function ResolveCaseModal({ open, caseItem, onClose }) {
		  const actions2 = useActions();
		  const toast = useToast();
		  const [conclusion, setConclusion] = (0, import_react14.useState)("");
		  (0, import_react14.useEffect)(() => {
		    if (open) setConclusion("");
		  }, [open, caseItem && caseItem.id]);
		  if (!caseItem) return null;
		  const confirm = () => {
		    actions2.resolveCase(caseItem.id, { conclusion: conclusion.trim() || void 0 });
		    toast.push("案件已结案，结论已写入审计记录", "success");
		    onClose();
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
		    Modal,
		    {
		      open,
		      onClose,
		      title: "案件结案",
		      footer: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { onClick: onClose, children: "取消" }),
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { variant: "danger", onClick: confirm, children: "确认结案" })
		      ] }),
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		          KV,
		          {
		            items: [
		              { k: "案件", v: caseItem.title },
		              { k: "当前状态", v: (CASE_STATUS[caseItem.status] || {}).label || caseItem.status },
		              { k: "负责人", v: caseItem.owner },
		              { k: "证据覆盖率", v: fmtPct(caseItem.coverage) }
		            ]
		          }
		        ),
		        caseItem.status === "ESCALATED" ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-callout warn", style: { margin: "12px 0" }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-callout-title", children: "升级提示" }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-callout-detail", children: "该案件已升级，结案后升级记录仍会保留在审计轨迹中。" })
		        ] }) : null,
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Field, { label: "结案结论", hint: "结论将写入案件调查记录，用于后续审计追溯", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		          "textarea",
		          {
		            className: "tp-textarea",
		            rows: 4,
		            value: conclusion,
		            onChange: (event2) => setConclusion(event2.target.value),
		            placeholder: "例如：证据链完整，确认费用异常由重复计费导致，已要求供应商退款并补充对账。"
		          }
		        ) })
		      ]
		    }
		  );
		}
		function EscalateCaseModal({ open, caseItem, onClose }) {
		  const toast = useToast();
		  const [note2, setNote] = (0, import_react14.useState)("");
		  (0, import_react14.useEffect)(() => {
		    if (open) setNote("");
		  }, [open, caseItem && caseItem.id]);
		  if (!caseItem) return null;
		  const confirm = () => {
		    toast.push("升级申请已提交，等待合规委员会复核", "info");
		    onClose();
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
		    Modal,
		    {
		      open,
		      onClose,
		      title: "升级案件",
		      footer: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { onClick: onClose, children: "取消" }),
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { variant: "primary", onClick: confirm, children: "提交升级申请" })
		      ] }),
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		          KV,
		          {
		            items: [
		              { k: "案件", v: caseItem.title },
		              { k: "当前状态", v: (CASE_STATUS[caseItem.status] || {}).label || caseItem.status },
		              { k: "严重程度", v: severityOf(caseItem.severity).label },
		              { k: "负责人", v: caseItem.owner }
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Field, { label: "升级说明", hint: "升级后处理时限顺延，复核意见将归档到审计报告", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		          "textarea",
		          {
		            className: "tp-textarea",
		            rows: 4,
		            value: note2,
		            onChange: (event2) => setNote(event2.target.value),
		            placeholder: "说明需要委员会介入的原因，例如：涉及跨主体委托链与高额结算，建议升级复核。"
		          }
		        ) })
		      ]
		    }
		  );
		}
		function AuditPage() {
		  const world = useWorld();
		  const actions2 = useActions();
		  const toast = useToast();
		  const { navigate } = useNavigation();
		  const cases = world.cases || [];
		  const reports = world.reports || [];
		  const evidence = world.evidence || [];
		  const stats = caseStats(world);
		  const [tab, setTab] = (0, import_react14.useState)("cases");
		  const [caseFilter, setCaseFilter] = (0, import_react14.useState)("ALL");
		  const [resolveTarget, setResolveTarget] = (0, import_react14.useState)(null);
		  const [escalateTarget, setEscalateTarget] = (0, import_react14.useState)(null);
		  const [reportOpenId, setReportOpenId] = (0, import_react14.useState)(null);
		  const [reportDraftOpen, setReportDraftOpen] = (0, import_react14.useState)(false);
		  const [reportDraft, setReportDraft] = (0, import_react14.useState)({ title: "", period: "", sections: [] });
		  const [evidenceFilter, setEvidenceFilter] = (0, import_react14.useState)("ALL");
		  const [evidenceQuery, setEvidenceQuery] = (0, import_react14.useState)("");
		  const sortedCases = (0, import_react14.useMemo)(
		    () => [...cases].sort((a, b) => Date.parse(b.openedAt) - Date.parse(a.openedAt)),
		    [cases]
		  );
		  const filteredCases = (0, import_react14.useMemo)(
		    () => sortedCases.filter((item) => caseFilter === "ALL" || item.status === caseFilter),
		    [sortedCases, caseFilter]
		  );
		  const selectedReport = reports.find((report) => report.id === reportOpenId) || null;
		  const anchoredCount = (0, import_react14.useMemo)(() => evidence.filter((item) => item.anchored).length, [evidence]);
		  const evidenceRows = (0, import_react14.useMemo)(() => {
		    const query = evidenceQuery.trim().toLowerCase();
		    return evidence.filter((item) => {
		      if (evidenceFilter === "ANCHORED" && !item.anchored) return false;
		      if (evidenceFilter === "UNANCHORED" && item.anchored) return false;
		      if (!query) return true;
		      const kindLabel = EVIDENCE_KIND[item.kind] || item.kind || "";
		      return `${item.subject || ""} ${kindLabel} ${item.digest || ""}`.toLowerCase().includes(query);
		    });
		  }, [evidence, evidenceFilter, evidenceQuery]);
		  const tabs = [
		    { value: "cases", label: "案件", count: cases.length },
		    { value: "reports", label: "审计报告", count: reports.length },
		    { value: "evidence", label: "证据库", count: evidence.length }
		  ];
		  const caseFilters = [
		    { value: "ALL", label: "全部", count: cases.length },
		    { value: "OPEN", label: CASE_STATUS.OPEN.label, count: stats.open },
		    { value: "ESCALATED", label: CASE_STATUS.ESCALATED.label, count: stats.escalated },
		    { value: "RESOLVED", label: CASE_STATUS.RESOLVED.label, count: stats.resolved }
		  ];
		  const evidenceFilters = [
		    { value: "ALL", label: "全部", count: evidence.length },
		    { value: "ANCHORED", label: "已锚定", count: anchoredCount },
		    { value: "UNANCHORED", label: "待锚定", count: evidence.length - anchoredCount }
		  ];
		  const anchorRatio = evidence.length ? anchoredCount / evidence.length : 0;
		  const openReportForm = () => {
		    setReportDraft({ title: "", period: defaultPeriod(), sections: ["委托链健康度", "风险决策分布", "结算闭环"] });
		    setReportDraftOpen(true);
		  };
		  const updateReportDraft = (patch) => setReportDraft((prev) => ({ ...prev, ...patch }));
		  const toggleReportSection = (section2) => setReportDraft((prev) => ({
		    ...prev,
		    sections: prev.sections.includes(section2) ? prev.sections.filter((item) => item !== section2) : [...prev.sections, section2]
		  }));
		  const reportFormValid = Boolean(
		    reportDraft.title.trim() && reportDraft.period.trim() && reportDraft.sections.length
		  );
		  const submitReport = () => {
		    if (!reportFormValid) return;
		    actions2.generateReport({
		      title: reportDraft.title.trim(),
		      period: reportDraft.period.trim(),
		      sections: reportDraft.sections
		    });
		    setReportDraftOpen(false);
		    toast.push("审计报告已生成，可在列表中查看", "success");
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-page", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		      PageHead,
		      {
		        title: "审计中心",
		        desc: "集中管理案件调查、审计报告与证据锚定记录，支撑财务与合规团队的复核与归档。",
		        actions: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Segmented, { options: tabs, value: tab, onChange: setTab })
		      }
		    ),
		    tab === "cases" ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-stat-grid", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatCard, { label: "处理中案件", value: stats.open, foot: "需在时限内推进调查", icon: "flag", iconTone: "var(--tp-warn)" }),
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatCard, { label: "已升级案件", value: stats.escalated, foot: "等待合规委员会复核", icon: "alert", iconTone: "var(--tp-danger)" }),
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatCard, { label: "已结案案件", value: stats.resolved, foot: "结论已归档进审计记录", icon: "checkCircle", iconTone: "var(--tp-success)" }),
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatCard, { label: "平均证据覆盖率", value: fmtPct(stats.avgCoverage), foot: "已锚定证据占关联证据比例", icon: "shield", iconTone: "var(--tp-info)" })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		        Card,
		        {
		          title: "案件列表",
		          desc: "按开启时间排序，点击任意行查看案件详情",
		          actions: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Segmented, { options: caseFilters, value: caseFilter, onChange: setCaseFilter }),
		          children: filteredCases.length ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-table-wrap", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("table", { className: "tp-table tp-audit-table", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("tr", { children: [
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "案件" }),
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "状态" }),
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "严重程度" }),
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "负责人" }),
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "证据覆盖率" }),
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "开启时间" }),
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "操作" })
		            ] }) }),
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("tbody", { children: filteredCases.map((item) => {
		              const severity = severityOf(item.severity);
		              return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("tr", { className: "tp-clickable", onClick: () => navigate("case", { caseId: item.id }), children: [
		                /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("td", { children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-strong tp-truncate", style: { maxWidth: 280 }, children: item.title }),
		                  /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-faint", style: { fontSize: 12, marginTop: 2 }, children: [
		                    shortId(item.id),
		                    " · ",
		                    (item.findings || []).length,
		                    " 条调查记录"
		                  ] })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatusTag, { map: CASE_STATUS, status: item.status }) }),
		                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Tag, { tone: severity.tone, dot: true, children: severity.label }) }),
		                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("td", { children: item.owner }),
		                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-progress-row", style: { minWidth: 120 }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Progress, { value: item.coverage }),
		                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "tp-num tp-faint", style: { fontSize: 12 }, children: fmtPct(item.coverage) })
		                ] }) }),
		                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("td", { className: "tp-muted", style: { whiteSpace: "nowrap" }, children: fmtRelative(item.openedAt) }),
		                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-cell-actions", onClick: (event2) => event2.stopPropagation(), children: [
		                  item.status === "OPEN" ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setEscalateTarget(item), children: "升级" }) : null,
		                  item.status !== "RESOLVED" ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { size: "sm", variant: "danger", onClick: () => setResolveTarget(item), children: "结案" }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => navigate("case", { caseId: item.id }), children: "查看" })
		                ] }) })
		              ] }, item.id);
		            }) })
		          ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		            EmptyState,
		            {
		              icon: "scale",
		              title: "没有符合条件的案件",
		              desc: "当前筛选条件下没有案件，切换筛选后可查看全部案件。",
		              action: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { variant: "ghost", onClick: () => setCaseFilter("ALL"), children: "查看全部案件" })
		            }
		          )
		        }
		      )
		    ] }) : null,
		    tab === "reports" ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		      Card,
		      {
		        title: "审计报告",
		        desc: "按期间归档的信任运营报告，可查看章节或生成新的报告",
		        actions: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { variant: "primary", size: "sm", icon: "plus", onClick: openReportForm, children: "生成报告" }),
		        children: reports.length ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-list", children: reports.map((report) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-row", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-main", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-list-title", children: report.title }),
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-sub", children: [
		              report.period,
		              " · 生成于 ",
		              fmtDateTime(report.createdAt),
		              " · ",
		              report.createdBy
		            ] })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-side", style: { display: "flex", alignItems: "center", gap: 12 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: "tp-faint", style: { fontSize: 12 }, children: [
		              (report.sections || []).length,
		              " 个章节 · ",
		              report.sizeLabel
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatusTag, { map: REPORT_STATUS, status: report.status }),
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setReportOpenId(report.id), children: "查看" })
		          ] })
		        ] }, report.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		          EmptyState,
		          {
		            icon: "fileText",
		            title: "暂无审计报告",
		            desc: "生成首份信任运营报告，用于财务与合规团队的定期复核。",
		            action: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { variant: "primary", onClick: openReportForm, children: "生成报告" })
		          }
		        )
		      }
		    ) : null,
		    tab === "evidence" ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(Card, { title: "证据库", desc: `共 ${evidence.length} 条证据，已锚定 ${anchoredCount} 条`, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-toolbar", style: { marginBottom: 12 }, children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-progress-row", style: { flex: "1 1 240px", minWidth: 200 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Progress, { value: anchorRatio }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "tp-num tp-faint", style: { fontSize: 12, whiteSpace: "nowrap" }, children: fmtPct(anchorRatio) })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-toolbar-end", style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Segmented, { options: evidenceFilters, value: evidenceFilter, onChange: setEvidenceFilter }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(SearchInput, { value: evidenceQuery, onChange: setEvidenceQuery, placeholder: "搜索证据类型或关联事项" })
		        ] })
		      ] }),
		      evidenceRows.length ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-table-wrap", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("table", { className: "tp-table", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("tr", { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "证据类型" }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "关联事项" }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "摘要值" }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "锚定状态" }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "记录时间" }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("th", { children: "操作" })
		        ] }) }),
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("tbody", { children: evidenceRows.map((item) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("tr", { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Tag, { tone: "info", children: EVIDENCE_KIND[item.kind] || item.kind }) }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("td", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-strong tp-truncate", style: { maxWidth: 260 }, children: item.subject }),
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-faint", style: { fontSize: 12, marginTop: 2 }, children: shortId(item.id) })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "tp-mono", title: item.digest, children: shortId(item.digest) }) }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("td", { children: item.anchored ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Tag, { tone: "success", dot: true, children: "已锚定" }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Tag, { tone: "warn", dot: true, children: "待锚定" }) }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("td", { className: "tp-muted", style: { whiteSpace: "nowrap" }, children: fmtRelative(item.at) }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("td", { children: item.anchored ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: "tp-faint", style: { fontSize: 12 }, children: [
		            "锚定于 ",
		            item.anchoredAt ? fmtRelative(item.anchoredAt) : "—"
		          ] }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		            Button,
		            {
		              size: "sm",
		              variant: "ghost",
		              icon: "link",
		              onClick: () => {
		                actions2.anchorEvidence(item.id);
		                toast.push("证据已锚定，时间戳已写入审计记录", "success");
		              },
		              children: "锚定"
		            }
		          ) })
		        ] }, item.id)) })
		      ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		        EmptyState,
		        {
		          icon: "search",
		          title: "未找到匹配的证据",
		          desc: "调整搜索关键词或锚定状态筛选，查看更多证据记录。",
		          action: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { variant: "ghost", onClick: () => {
		            setEvidenceQuery("");
		            setEvidenceFilter("ALL");
		          }, children: "清空筛选" })
		        }
		      )
		    ] }) : null,
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		      ResolveCaseModal,
		      {
		        open: Boolean(resolveTarget),
		        caseItem: resolveTarget,
		        onClose: () => setResolveTarget(null)
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		      EscalateCaseModal,
		      {
		        open: Boolean(escalateTarget),
		        caseItem: escalateTarget,
		        onClose: () => setEscalateTarget(null)
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		      Drawer,
		      {
		        open: Boolean(selectedReport),
		        onClose: () => setReportOpenId(null),
		        title: selectedReport ? selectedReport.title : "审计报告",
		        subtitle: selectedReport ? `${selectedReport.period} · ${fmtDateTime(selectedReport.createdAt)}` : "",
		        footer: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { onClick: () => setReportOpenId(null), children: "关闭" }),
		        children: selectedReport ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-callout", style: { marginBottom: 14 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-callout-title", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, { name: "info", size: 14 }),
		              " 报告摘要"
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-callout-body", children: [
		              "本报告覆盖 ",
		              selectedReport.period,
		              " 期间星桥支付的委托链、风险决策与结算记录，供财务与合规团队复核与归档。"
		            ] })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		            KV,
		            {
		              items: [
		                { k: "报告状态", v: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatusTag, { map: REPORT_STATUS, status: selectedReport.status }) },
		                { k: "报告期间", v: selectedReport.period },
		                { k: "生成时间", v: fmtDateTime(selectedReport.createdAt) },
		                { k: "生成人", v: selectedReport.createdBy },
		                { k: "文件格式", v: displayFormat(selectedReport.format) },
		                { k: "文件大小", v: selectedReport.sizeLabel }
		              ]
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-divider" }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-section-title", style: { marginBottom: 8 }, children: "报告章节" }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-list", children: (selectedReport.sections || []).map((section2, index) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-row", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-main", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-list-title", children: `${String(index + 1).padStart(2, "0")} · ${section2}` }),
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-list-sub", children: "章节内容已归档至报告" })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-list-side", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, { name: "fileText", size: 16, style: { color: "var(--tp-text-3)" } }) })
		          ] }, `${section2}-${index}`)) })
		        ] }) : null
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
		      Modal,
		      {
		        open: reportDraftOpen,
		        onClose: () => setReportDraftOpen(false),
		        title: "生成审计报告",
		        footer: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { onClick: () => setReportDraftOpen(false), children: "取消" }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { variant: "primary", disabled: !reportFormValid, onClick: submitReport, children: "确认生成" })
		        ] }),
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Field, { label: "报告标题", hint: "将用于归档与检索", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		            "input",
		            {
		              className: "tp-input",
		              value: reportDraft.title,
		              onChange: (event2) => updateReportDraft({ title: event2.target.value }),
		              placeholder: "例如：2026 年 11 月信任运营月报"
		            }
		          ) }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Field, { label: "报告期间", hint: "填写本次报告覆盖的时间范围", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		            "input",
		            {
		              className: "tp-input",
		              value: reportDraft.period,
		              onChange: (event2) => updateReportDraft({ period: event2.target.value }),
		              placeholder: "例如：2026 年 11 月"
		            }
		          ) }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-field", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-field-label", children: "包含章节" }),
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }, children: REPORT_SECTIONS.map((section2) => {
		              const active = reportDraft.sections.includes(section2);
		              return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		                "button",
		                {
		                  type: "button",
		                  onClick: () => toggleReportSection(section2),
		                  style: {
		                    cursor: "pointer",
		                    padding: "6px 12px",
		                    borderRadius: 999,
		                    fontSize: 12,
		                    border: `1px solid ${active ? "var(--tp-accent)" : "var(--tp-border)"}`,
		                    background: active ? "var(--tp-accent-soft)" : "var(--tp-surface)",
		                    color: active ? "var(--tp-accent)" : "var(--tp-text-2)"
		                  },
		                  children: section2
		                },
		                section2
		              );
		            }) }),
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-field-hint", children: "至少选择一个章节" })
		          ] })
		        ]
		      }
		    )
		  ] });
		}
		function CaseDetailPage({ caseId }) {
		  const world = useWorld();
		  const { back, navigate } = useNavigation();
		  const item = caseId ? caseById(world, caseId) : null;
		  const [resolveOpen, setResolveOpen] = (0, import_react14.useState)(false);
		  const [escalateOpen, setEscalateOpen] = (0, import_react14.useState)(false);
		  const relatedTasks = (0, import_react14.useMemo)(() => {
		    if (!item) return [];
		    return (item.linkedTaskIds || []).map((taskId) => taskById(world, taskId)).filter(Boolean);
		  }, [world, item]);
		  const relatedEvents = (0, import_react14.useMemo)(() => {
		    if (!item) return [];
		    const ids = item.linkedEventIds || [];
		    return (world.events || []).filter((event2) => ids.includes(event2.id)).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
		  }, [world, item]);
		  const relatedInterventions = (0, import_react14.useMemo)(() => {
		    if (!item) return [];
		    const taskIds = new Set(item.linkedTaskIds || []);
		    return (world.interventions || []).filter((intervention) => taskIds.has(intervention.taskId));
		  }, [world, item]);
		  const evidenceGroups = (0, import_react14.useMemo)(
		    () => groupEvidenceByKind(linkedEvidence(world, item)),
		    [world, item]
		  );
		  const timelineItems = (0, import_react14.useMemo)(() => {
		    if (!item) return [];
		    const rows = [
		      {
		        key: "opened",
		        title: "案件开启",
		        meta: fmtDateTime(item.openedAt),
		        body: `负责人：${item.owner}`,
		        icon: "flag"
		      }
		    ];
		    const findings = [...item.findings || []].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
		    findings.forEach((finding, index) => {
		      rows.push({
		        key: `finding-${index}`,
		        title: "调查记录",
		        meta: fmtDateTime(finding.at),
		        body: finding.text
		      });
		    });
		    if (item.resolvedAt) {
		      rows.push({
		        key: "resolved",
		        title: "案件结案",
		        meta: fmtDateTime(item.resolvedAt),
		        body: item.conclusion || "调查完成，已按结案结论归档",
		        tone: "success",
		        icon: "checkCircle"
		      });
		    }
		    return rows;
		  }, [item]);
		  if (!item) {
		    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-page", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		        PageHead,
		        {
		          title: "案件详情",
		          desc: "查看案件调查进展、关联事项与证据覆盖情况",
		          actions: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { variant: "ghost", icon: "arrowLeft", onClick: back, children: "返回" })
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		        EmptyState,
		        {
		          icon: "search",
		          title: "未找到该案件",
		          desc: "案件可能已归档或链接已失效，请返回审计中心重新选择。",
		          action: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { variant: "primary", onClick: back, children: "返回审计中心" })
		        }
		      ) })
		    ] });
		  }
		  const severity = severityOf(item.severity);
		  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-page", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		      PageHead,
		      {
		        title: item.title,
		        desc: `${fmtDate(item.openedAt)} 开启 · ${item.owner} 负责`,
		        actions: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { variant: "ghost", icon: "arrowLeft", onClick: back, children: "返回列表" }),
		          item.status === "OPEN" ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { variant: "ghost", icon: "arrowUpRight", onClick: () => setEscalateOpen(true), children: "升级" }) : null,
		          item.status !== "RESOLVED" ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { variant: "danger", onClick: () => setResolveOpen(true), children: "结案" }) : null
		        ] })
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-inline", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatusTag, { map: CASE_STATUS, status: item.status }),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(Tag, { tone: severity.tone, dot: true, children: [
		        severity.label,
		        "严重程度"
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(Tag, { tone: "neutral", dot: true, children: [
		        "负责人 ",
		        item.owner
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: "tp-faint", style: { fontSize: 12 }, children: [
		        "案件编号 ",
		        shortId(item.id),
		        " · 开启于 ",
		        fmtDateTime(item.openedAt)
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-callout", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-callout-title", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, { name: "info", size: 14 }),
		        " 案件摘要"
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-callout-body", children: item.summary })
		    ] }),
		    item.status === "ESCALATED" ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-callout danger", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-callout-title", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, { name: "alert", size: 14 }),
		        " 已升级至合规委员会"
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-callout-detail", children: "该案件涉及较高风险，结案前请确认委员会复核意见已记录在案。" })
		    ] }) : null,
		    item.status === "RESOLVED" && item.conclusion ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-callout success", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-callout-title", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, { name: "checkCircle", size: 14 }),
		        " 结案结论 · ",
		        item.resolvedAt ? fmtDateTime(item.resolvedAt) : "已归档"
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-callout-body", children: item.conclusion })
		    ] }) : null,
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-stat-grid", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatCard, { label: "证据覆盖率", value: fmtPct(item.coverage), foot: "关联证据已锚定比例", icon: "shield", iconTone: "var(--tp-info)" }),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatCard, { label: "关联任务", value: relatedTasks.length, foot: "与案件直接关联的付款任务", icon: "package" }),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatCard, { label: "审计事件", value: relatedEvents.length, foot: "审计轨迹中的关键事件", icon: "activity" }),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatCard, { label: "调查记录", value: (item.findings || []).length, foot: "调查过程中的关键结论", icon: "fileText" })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-grid tp-grid-2", style: { alignItems: "start" }, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Card, { title: "调查时间线", desc: "案件开启以来的调查动作与关键结论", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Timeline, { items: timelineItems }) }),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(Card, { title: "证据覆盖情况", desc: "按证据类型统计锚定进度", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "tp-strong", style: { fontSize: 13 }, children: "整体覆盖率" }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "tp-num tp-faint", style: { fontSize: 12 }, children: fmtPct(item.coverage) })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Progress, { value: item.coverage }),
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-divider" }),
		        evidenceGroups.length ? evidenceGroups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: { marginBottom: 12 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "tp-strong", style: { fontSize: 13 }, children: EVIDENCE_KIND[group.kind] || group.kind }),
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: "tp-num tp-faint", style: { fontSize: 12 }, children: [
		              group.anchored,
		              " / ",
		              group.total,
		              " 已锚定 · ",
		              fmtPct(group.coverage)
		            ] })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Progress, { value: group.coverage, tone: group.coverage >= 1 ? "success" : void 0 })
		        ] }, group.kind)) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-muted", style: { fontSize: 13 }, children: "该案件暂未关联证据记录。" })
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-grid tp-grid-2", style: { alignItems: "start" }, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Card, { title: "关联任务", desc: "与案件调查直接相关的付款任务", children: relatedTasks.length ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-list tp-list-clickable", children: relatedTasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-row", onClick: () => navigate("task", { taskId: task.id }), children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-main", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-list-title", children: task.title }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-sub", children: [
		            task.counterpartyOrg,
		            " · ",
		            fmtMoney(task.amount, task.currency),
		            " · 风险评分 ",
		            fmtNum((task.riskScore || 0) * 100)
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-side", style: { display: "flex", alignItems: "center", gap: 8 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatusTag, { map: TASK_STATUS, status: task.status }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, { name: "chevronRight", size: 16, style: { color: "var(--tp-text-3)" } })
		        ] })
		      ] }, task.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(EmptyState, { icon: "package", title: "暂无关联任务", desc: "该案件的调查尚未关联到具体的付款任务。" }) }),
		      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Card, { title: "关联例外审批", desc: "与案件相关的例外审批与处理结果", children: relatedInterventions.length ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-list", children: relatedInterventions.map((intervention) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-row", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-main", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-list-title", children: intervention.title }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "tp-list-sub", children: [
		            intervention.reason,
		            " · 截止 ",
		            fmtRelative(intervention.dueAt)
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-list-side", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StatusTag, { map: INTERVENTION_STATUS, status: intervention.status }) })
		      ] }, intervention.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(EmptyState, { icon: "check", title: "暂无例外审批", desc: "该案件未触发需要人工裁决的例外审批。" }) })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Card, { title: "关联审计事件", desc: "案件调查过程中引用的审计轨迹", children: relatedEvents.length ? relatedEvents.map((event2) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
		      "div",
		      {
		        style: {
		          display: "flex",
		          gap: 12,
		          alignItems: "flex-start",
		          padding: "10px 0",
		          borderBottom: "1px solid var(--tp-border-soft)"
		        },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		            "div",
		            {
		              style: {
		                width: 8,
		                height: 8,
		                borderRadius: 999,
		                marginTop: 6,
		                flexShrink: 0,
		                background: event2.tone === "danger" ? "var(--tp-danger)" : event2.tone === "warn" ? "var(--tp-warn)" : "var(--tp-accent)"
		              }
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "tp-strong", style: { fontSize: 13 }, children: event2.typeLabel }),
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: "tp-faint", style: { fontSize: 12 }, children: [
		                event2.actor,
		                " · ",
		                fmtDateTime(event2.at)
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Tag, { tone: "info", children: shortId(event2.id) })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "tp-muted", style: { fontSize: 13, lineHeight: 1.6, marginTop: 4 }, children: event2.body })
		          ] })
		        ]
		      },
		      event2.id
		    )) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(EmptyState, { icon: "activity", title: "暂无关联审计事件", desc: "案件尚未引用外部审计事件。" }) }),
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ResolveCaseModal, { open: resolveOpen, caseItem: item, onClose: () => setResolveOpen(false) }),
		    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(EscalateCaseModal, { open: escalateOpen, caseItem: item, onClose: () => setEscalateOpen(false) })
		  ] });
		}

		// src/client/product/pages/settings.jsx
		var import_react15 = require("react");

		// src/client/product/version.js
		var PRODUCT_VERSION = true ? "0.8.1" : "0.0.0-dev";

		// src/client/product/pages/settings.jsx
		var import_jsx_runtime14 = require("react/jsx-runtime");
		var ORG_KIND = {
		  operator: "运营机构",
		  merchant: "商户",
		  bank: "银行"
		};
		var PAGE_SIZE_OPTIONS = [
		  { value: "10", label: "每页 10 条" },
		  { value: "20", label: "每页 20 条" },
		  { value: "50", label: "每页 50 条" }
		];
		var TIME_OPTIONS = [
		  { value: "relative", label: "相对时间（如 3 小时前）" },
		  { value: "exact", label: "精确时间（如 2026-10-29 18:06）" }
		];
		var DATA_NOTES = [
		  "演示数据保存在本机，不会上传到外部服务。",
		  "导出快照会下载一份当前演示数据文件，便于评审留档或交付前备份。",
		  "重置会恢复初始演示数据，期间产生的审批、结案与报告记录将被清除且无法撤销。"
		];
		function pad2(value) {
		  return String(value).padStart(2, "0");
		}
		function snapshotFilename(now = /* @__PURE__ */ new Date()) {
		  const stamp = [
		    now.getFullYear(),
		    pad2(now.getMonth() + 1),
		    pad2(now.getDate())
		  ].join("") + "-" + [pad2(now.getHours()), pad2(now.getMinutes()), pad2(now.getSeconds())].join("");
		  return `trust-platform-demo-${stamp}.json`;
		}
		function downloadWorldSnapshot(world) {
		  const blob = new Blob([JSON.stringify(world, null, 2)], { type: "application/json" });
		  const url = URL.createObjectURL(blob);
		  const link = document.createElement("a");
		  link.href = url;
		  link.download = snapshotFilename();
		  document.body.appendChild(link);
		  link.click();
		  link.remove();
		  URL.revokeObjectURL(url);
		}
		function PrefRow({ title, desc, children, last }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
		    "div",
		    {
		      style: {
		        display: "flex",
		        alignItems: "center",
		        justifyContent: "space-between",
		        gap: 16,
		        padding: "12px 0",
		        borderBottom: last ? "none" : "1px solid var(--tp-border-soft)"
		      },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { style: { minWidth: 0 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "tp-strong", style: { fontSize: 13 }, children: title }),
		          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "tp-faint", style: { fontSize: 12, marginTop: 2 }, children: desc })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { style: { flexShrink: 0 }, children })
		      ]
		    }
		  );
		}
		function Toggle({ checked, onChange, label }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
		    "button",
		    {
		      type: "button",
		      role: "switch",
		      "aria-checked": checked,
		      "aria-label": label,
		      onClick: () => onChange(!checked),
		      style: {
		        width: 44,
		        height: 24,
		        borderRadius: 999,
		        border: "none",
		        padding: 0,
		        position: "relative",
		        cursor: "pointer",
		        background: checked ? "var(--tp-accent)" : "var(--tp-surface-3)",
		        transition: "background .2s"
		      },
		      children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
		        "span",
		        {
		          style: {
		            position: "absolute",
		            top: 3,
		            left: checked ? 23 : 3,
		            width: 18,
		            height: 18,
		            borderRadius: "50%",
		            background: "#fff",
		            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.28)",
		            transition: "left .2s"
		          }
		        }
		      )
		    }
		  );
		}
		function ProductSettingsPage() {
		  const world = useWorld();
		  const actions2 = useActions();
		  const toast = useToast();
		  const orgs = world.orgs || [];
		  const org = orgs.find((item) => item.kind === "operator") || orgs[0] || {};
		  const productName = `${org.name || "星桥支付"} · 信任运营台`;
		  const [notify2, setNotify] = (0, import_react15.useState)(true);
		  const [pageSize, setPageSize] = (0, import_react15.useState)("20");
		  const [timeDisplay, setTimeDisplay] = (0, import_react15.useState)("relative");
		  const [resetConfirm, setResetConfirm] = (0, import_react15.useState)("");
		  const savePreferences = () => {
		    toast.push("工作台偏好已保存", "success");
		  };
		  const handleExport = () => {
		    try {
		      downloadWorldSnapshot(world);
		      toast.push("演示数据已导出为快照文件", "success");
		    } catch {
		      toast.push("导出失败，请稍后重试", "error");
		    }
		  };
		  const resetConfirmValid = resetConfirm.trim() === "RESET";
		  const handleReset = () => {
		    if (!resetConfirmValid) return;
		    actions2.resetDemo();
		    setResetConfirm("");
		    toast.push("演示数据已重置为初始状态", "success");
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "tp-page", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
		      PageHead,
		      {
		        title: "设置",
		        desc: "管理组织信息、工作台偏好与演示数据。"
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "tp-grid tp-grid-2", style: { marginBottom: 16, alignItems: "start" }, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(Card, { title: "组织信息", desc: "当前登录组织的登记信息，仅供核对", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Avatar, { name: org.name || "星桥支付", seed: org.id || "org", size: "lg" }),
		          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { style: { minWidth: 0 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "tp-strong", style: { fontSize: 15 }, children: org.name || "未登记组织" }),
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "tp-faint", style: { fontSize: 12, marginTop: 2 }, children: [
		              org.domain || "—",
		              " · ",
		              ORG_KIND[org.kind] || "组织"
		            ] })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { style: { marginLeft: "auto" }, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Tag, { tone: org.verified ? "success" : "neutral", dot: true, children: org.verified ? "已认证" : "待认证" }) })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
		          KV,
		          {
		            items: [
		              { k: "组织标识", v: shortId(org.id || "—") },
		              { k: "组织类型", v: ORG_KIND[org.kind] || "组织" },
		              { k: "接入域名", v: org.domain || "—" },
		              { k: "认证状态", v: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Tag, { tone: org.verified ? "success" : "neutral", dot: true, children: org.verified ? "已认证" : "待认证" }) }
		            ]
		          }
		        )
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
		        Card,
		        {
		          title: "工作台偏好",
		          desc: "调整提醒与列表的显示方式",
		          actions: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Tag, { tone: "neutral", children: "仅本机生效" }),
		          children: [
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(PrefRow, { title: "桌面通知", desc: "案件升级、审批到期时提醒我", children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Toggle, { checked: notify2, onChange: setNotify, label: "桌面通知" }) }),
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(PrefRow, { title: "每页数量", desc: "列表页默认展示的条数", children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Select, { value: pageSize, onChange: setPageSize, options: PAGE_SIZE_OPTIONS }) }),
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(PrefRow, { title: "时间显示", desc: "列表与详情中的时间展示方式", last: true, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Select, { value: timeDisplay, onChange: setTimeDisplay, options: TIME_OPTIONS }) }),
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 }, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Button, { variant: "primary", icon: "check", onClick: savePreferences, children: "保存偏好" }) })
		          ]
		        }
		      )
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
		      Card,
		      {
		        title: "数据管理",
		        desc: "演示数据保存在本机，支持导出快照与恢复初始状态",
		        style: { marginBottom: 16 },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("ul", { style: { margin: 0, paddingLeft: 18, color: "var(--tp-text-2)", fontSize: 13, lineHeight: 1.9 }, children: DATA_NOTES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("li", { children: item }, item)) }),
		          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "tp-divider" }),
		          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "16px 0" }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { children: [
		              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "tp-strong", style: { fontSize: 13 }, children: "导出演示数据" }),
		              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "tp-faint", style: { fontSize: 12, marginTop: 2 }, children: "下载当前演示数据快照，文件名包含导出时间" })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Button, { icon: "download", onClick: handleExport, children: "导出演示数据" })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "tp-divider" }),
		          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "16px 0" }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { children: [
		              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "tp-strong", style: { fontSize: 13 }, children: "重置演示数据" }),
		              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "tp-faint", style: { fontSize: 12, marginTop: 2 }, children: "恢复初始演示数据；请输入 RESET 确认操作" })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
		                "input",
		                {
		                  className: "tp-input",
		                  style: { width: 150 },
		                  value: resetConfirm,
		                  onChange: (event2) => setResetConfirm(event2.target.value),
		                  placeholder: "输入 RESET",
		                  "aria-label": "输入 RESET 确认重置"
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Button, { variant: "danger", icon: "refresh", disabled: !resetConfirmValid, onClick: handleReset, children: "重置演示数据" })
		            ] })
		          ] })
		        ]
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(Card, { title: "关于", desc: "产品信息与运行环境", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { style: { display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }, children: [
		        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
		          "div",
		          {
		            style: {
		              width: 44,
		              height: 44,
		              borderRadius: 12,
		              flexShrink: 0,
		              background: "var(--tp-accent-soft)",
		              display: "flex",
		              alignItems: "center",
		              justifyContent: "center",
		              color: "var(--tp-accent)"
		            },
		            children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Icon, { name: "shield", size: 22 })
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { style: { minWidth: 0 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "tp-strong", style: { fontSize: 15 }, children: productName }),
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(Tag, { tone: "info", children: [
		              "v",
		              PRODUCT_VERSION
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Tag, { tone: "neutral", dot: true, children: "沙箱演示数据" })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "tp-muted", style: { fontSize: 13, lineHeight: 1.7, marginTop: 6 }, children: "让 AI 代理在人类设定的委托额度内行动：财务与合规团队设定边界、审批例外， 每一笔付款都留下可核验、可追溯的审计记录。" })
		        ] })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
		        KV,
		        {
		          items: [
		            { k: "产品版本", v: `v${PRODUCT_VERSION}` },
		            { k: "适用角色", v: "财务负责人 · 合规审计员" },
		            { k: "运行环境", v: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Tag, { tone: "neutral", dot: true, children: "沙箱演示数据" }) },
		            { k: "数据生成时间", v: world.seededAt ? fmtDateTime(world.seededAt) : "—" }
		          ]
		        }
		      )
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "tp-footer-note", children: "本演示数据仅用于产品体验，不构成真实支付或审计依据。" })
		  ] });
		}

		// src/client/product/app/shell.jsx
		var import_jsx_runtime15 = require("react/jsx-runtime");
		var TABS = [
		  { id: "dashboard", label: "总览", icon: "dashboard" },
		  { id: "approvals", label: "审批", icon: "checkCircle" },
		  { id: "tasks", label: "付款任务", icon: "package" },
		  { id: "agents", label: "代理", icon: "users" },
		  { id: "delegations", label: "委托授权", icon: "branch" },
		  { id: "governance", label: "治理策略", icon: "sliders" },
		  { id: "audit", label: "审计与案件", icon: "fileText" },
		  { id: "settings", label: "设置", icon: "settings" }
		];
		var DETAIL_PARENT = { task: "tasks", agent: "agents", case: "audit" };
		function Shell() {
		  const world = useWorld();
		  const actions2 = useActions();
		  const { route, navigate, back, go } = useNavigation();
		  const [query, setQuery] = (0, import_react16.useState)("");
		  const [showSearch, setShowSearch] = (0, import_react16.useState)(false);
		  const [showBell, setShowBell] = (0, import_react16.useState)(false);
		  const [showAccount, setShowAccount] = (0, import_react16.useState)(false);
		  const searchRef = (0, import_react16.useRef)(null);
		  const stats = useWorldStats(world);
		  const unread = unreadNotifications(world);
		  const parentTab = DETAIL_PARENT[route.page] || route.page;
		  const results = searchAll(world, query);
		  (0, import_react16.useEffect)(() => {
		    const onKey = (event2) => {
		      if (event2.key === "Escape") {
		        setShowSearch(false);
		        setShowBell(false);
		        setShowAccount(false);
		      }
		    };
		    window.addEventListener("keydown", onKey);
		    return () => window.removeEventListener("keydown", onKey);
		  }, []);
		  (0, import_react16.useEffect)(() => {
		    if (showSearch && searchRef.current) searchRef.current.focus();
		  }, [showSearch]);
		  const openResult = (hit) => {
		    setQuery("");
		    setShowSearch(false);
		    if (hit.kind === "task") navigate("task", { taskId: hit.id });
		    else if (hit.kind === "agent") navigate("agent", { agentId: hit.id });
		    else if (hit.kind === "case") navigate("case", { caseId: hit.id });
		    else go("governance");
		  };
		  const openNotification = (item) => {
		    actions2.markNotificationRead(item.id);
		    setShowBell(false);
		    if (item.target === "approvals" || item.target === "tasks" || item.target === "delegations" || item.target === "cases") {
		      go(item.target === "cases" ? "audit" : item.target);
		    } else if (item.target === "governance") go("governance");
		    else if (item.target === "reports") go("audit");
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-shell", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("header", { className: "tp-topbar", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-brand", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-brand-mark", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Icon, { name: "shield", size: 17, strokeWidth: 2 }) }),
		        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-brand-text", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tp-brand-name", children: "星桥支付 · 信任运营台" }),
		          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tp-brand-sub", children: "代理交易的可审计工作台" })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Tag, { tone: "info", style: { marginLeft: 10 }, children: "沙箱数据" })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-topbar-right", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-global-search", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("button", { type: "button", className: "tp-search-trigger", onClick: () => setShowSearch((value) => !value), children: [
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Icon, { name: "search", size: 14 }),
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { children: "搜索任务、代理、案件…" }),
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("kbd", { children: "⌘K" })
		          ] }),
		          showSearch ? /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-popover tp-search-pop", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
		              "input",
		              {
		                ref: searchRef,
		                className: "tp-search-input",
		                value: query,
		                placeholder: "输入关键词",
		                onChange: (event2) => setQuery(event2.target.value)
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tp-search-results", children: results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tp-search-empty", children: query ? "没有匹配结果" : "输入关键词开始搜索" }) : results.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("button", { type: "button", className: "tp-search-hit", onClick: () => openResult(hit), children: [
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-search-hit-icon", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Icon, { name: hit.kind === "task" ? "package" : hit.kind === "agent" ? "users" : hit.kind === "case" ? "flag" : "sliders", size: 14 }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "tp-search-hit-main", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-search-hit-title", children: hit.title }),
		                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-search-hit-detail", children: hit.detail })
		              ] })
		            ] }, `${hit.kind}-${hit.id}`)) })
		          ] }) : null
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-pop-anchor", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(IconButton, { name: "bell", label: "通知", onClick: () => {
		            setShowBell((value) => !value);
		            setShowAccount(false);
		          } }),
		          unread.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-bell-dot", children: unread.length }) : null,
		          showBell ? /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-popover tp-notify-pop", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-popover-head", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-strong", children: "通知" }),
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("button", { type: "button", className: "tp-link-btn", onClick: () => actions2.markAllNotificationsRead(), children: "全部已读" })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tp-notify-list", children: world.notifications.slice(0, 8).map((item) => /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("button", { type: "button", className: `tp-notify-item ${item.read ? "" : "unread"}`, onClick: () => openNotification(item), children: [
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: `tp-notify-icon ${item.tone}`, children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Icon, { name: item.tone === "danger" ? "alert" : item.tone === "warn" ? "clock" : item.tone === "success" ? "checkCircle" : "info", size: 13 }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "tp-notify-main", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-notify-title", children: item.title }),
		                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-notify-body", children: item.body })
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-notify-time", children: fmtRelative(item.at) })
		            ] }, item.id)) })
		          ] }) : null
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-pop-anchor", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("button", { type: "button", className: "tp-account", onClick: () => {
		            setShowAccount((value) => !value);
		            setShowBell(false);
		          }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Avatar, { name: "周明", seed: "zhouming", size: "sm" }),
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "tp-account-text", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-account-name", children: "周明" }),
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-account-role", children: "财务负责人" })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Icon, { name: "chevronDown", size: 13 })
		          ] }),
		          showAccount ? /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-popover tp-account-pop", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-account-pop-head", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Avatar, { name: "周明", seed: "zhouming" }),
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { children: [
		                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tp-strong", children: "周明" }),
		                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tp-muted", children: "财务负责人 · 星桥支付" }),
		                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tp-muted", style: { marginTop: 2 }, children: "zhou.ming@starbridge.pay" })
		              ] })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-account-pop-row", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { children: "本月放行金额" }),
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-strong", children: fmtMoney(stats.settledVolume) })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tp-account-pop-row", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { children: "待我处理" }),
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: `tp-strong ${stats.openApprovals ? "tp-warn-text" : ""}`, children: [
		                stats.openApprovals,
		                " 项"
		              ] })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("button", { type: "button", className: "tp-account-pop-action", onClick: () => {
		              setShowAccount(false);
		              go("settings");
		            }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Icon, { name: "settings", size: 14 }),
		              "工作台设置"
		            ] })
		          ] }) : null
		        ] })
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("nav", { className: "tp-tabs", "aria-label": "信任运营台导航", children: TABS.map((tab) => {
		      const active = parentTab === tab.id;
		      const badge = tab.id === "approvals" ? stats.openApprovals : tab.id === "audit" ? stats.openCases : 0;
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
		        "button",
		        {
		          type: "button",
		          className: `tp-tab ${active ? "active" : ""}`,
		          onClick: () => go(tab.id),
		          children: [
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Icon, { name: tab.icon, size: 15 }),
		            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { children: tab.label }),
		            badge > 0 ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tp-tab-badge", children: badge }) : null
		          ]
		        },
		        tab.id
		      );
		    }) }),
		    /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("main", { className: "tp-main", children: [
		      route.page !== "dashboard" && route.page !== "approvals" && route.page !== "tasks" && route.page !== "agents" && route.page !== "delegations" && route.page !== "governance" && route.page !== "audit" && route.page !== "settings" ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tp-breadcrumb", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("button", { type: "button", className: "tp-back", onClick: back, children: [
		        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Icon, { name: "arrowLeft", size: 14 }),
		        "返回"
		      ] }) }) : null,
		      renderPage(route)
		    ] })
		  ] });
		}
		function renderPage(route) {
		  switch (route.page) {
		    case "dashboard":
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(DashboardPage, {});
		    case "approvals":
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(ApprovalsPage, {});
		    case "tasks":
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(TasksPage, {});
		    case "task":
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(TaskDetailPage, { taskId: route.params?.taskId });
		    case "agents":
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(AgentsPage, {});
		    case "agent":
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(AgentDetailPage, { agentId: route.params?.agentId });
		    case "delegations":
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(DelegationsPage, {});
		    case "governance":
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(GovernancePage, {});
		    case "audit":
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(AuditPage, {});
		    case "case":
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(CaseDetailPage, { caseId: route.params?.caseId });
		    case "settings":
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(ProductSettingsPage, {});
		    default:
		      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(DashboardPage, {});
		  }
		}
		function useWorldStats(world) {
		  const openApprovals = world.interventions.filter((item) => item.status === "PENDING").length;
		  const openCases = world.cases.filter((item) => item.status !== "RESOLVED").length;
		  const settledVolume = world.tasks.filter((task) => ["SUBMITTED", "CONFIRMED", "AUDITED", "CLOSED"].includes(task.status)).reduce((sum, task) => sum + task.amount, 0);
		  return { openApprovals, openCases, settledVolume };
		}

		// src/client/product/app/panel.jsx
		var import_jsx_runtime16 = require("react/jsx-runtime");
		function TrustPlatformPanel() {
		  ensureProductStyles();
		  return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "tp-panel-root", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(ToastProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(NavigationProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Shell, {}) }) }) });
		}

		// src/client/product/app/launcher.jsx
		var import_jsx_runtime17 = require("react/jsx-runtime");
		function TrustConsoleLauncher({ t, openConsole }) {
		  ensureProductStyles();
		  const label = translate(t, "panel.open");
		  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
		    "button",
		    {
		      type: "button",
		      className: "tp-launcher",
		      title: label,
		      "aria-label": label,
		      onClick: () => {
		        if (typeof openConsole === "function") openConsole();
		      },
		      children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Icon, { name: "shield", size: 16, strokeWidth: 1.9 })
		    }
		  );
		}

		// src/client/product/app/tab-type.js
		var TRUST_CONSOLE_ID = "@sealwax/dsh-trust-platform";
		var TRUST_CONSOLE_KIND = "trust-console";
		function trustConsoleDefinition(t) {
		  return {
		    id: TRUST_CONSOLE_ID,
		    kind: TRUST_CONSOLE_KIND,
		    priority: "builtin",
		    title: () => translate(t, "panel.tab"),
		    guide: [{
		      id: "trust-console",
		      order: 20,
		      title: () => translate(t, "panel.tab"),
		      description: () => translate(t, "panel.guide")
		    }]
		  };
		}

		// src/client/index.jsx
		var PANEL_ID = "trust-platform";
		var inject = ["slots", "locale", "sidebarRightTabs", "sidebarRight"];
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
		  ctx.effect(
		    () => ctx.sidebarRightTabs.register(trustConsoleDefinition(t)),
		    "trust-platform: console tab type"
		  );
		  ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
		    name: "sidebar.right.pane.tab",
		    key: TRUST_CONSOLE_ID,
		    locale: NS,
		    inject: () => ({})
		  }, TrustPlatformPanel)), "trust-platform: console tab body");
		  ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
		    name: "conversation.session.header.utilities",
		    id: "trust-platform-console",
		    order: 20,
		    locale: NS,
		    inject: () => ({
		      openConsole: () => ctx.sidebarRight.openTab(TRUST_CONSOLE_KIND)
		    })
		  }, TrustConsoleLauncher));
		}
		return module.exports;
	}
});
