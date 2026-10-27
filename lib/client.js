window.__ModuleLoader__.load({
	id: "@00ccf/dsh-trust-platform",
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
		  "overview.mode.control-plane": "Control plane",
		  "overview.mode.in-memory": "In-memory sandbox",
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
		  "overview.unavailable": "The overview endpoint is unavailable in this host."
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
		  "overview.mode.in-memory": "内存沙箱",
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
		  "overview.unavailable": "此宿主未提供概览接口。"
		});

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

		// src/client/format.js
		var PLUGIN_ID = "@00ccf/dsh-trust-platform";
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
		  let input = value;
		  if (typeof input === "number" && Number.isFinite(input)) input = new Date(input);
		  else if (isNonEmptyString(input)) input = new Date(input);
		  else return null;
		  const date = input instanceof Date ? input : null;
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

		// src/client/overview.jsx
		var import_react2 = require("react");
		var import_jsx_runtime3 = require("react/jsx-runtime");
		var OVERVIEW_URL = "/trust-platform/api/overview";
		var POLL_INTERVAL_MS = 5e3;
		var MAX_RECENT_EVENTS = 10;
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
		function describeError(error, t) {
		  switch (error.kind) {
		    case "forbidden":
		      return translate(t, "overview.error.forbidden");
		    case "http":
		      return translate(t, "overview.error.http", { status: error.status });
		    case "network":
		      return translate(t, "overview.error.network", { message: error.message });
		    case "host":
		      return translate(t, "overview.error.host", { code: error.code, message: error.message || "—" });
		    case "unavailable":
		      return translate(t, "overview.unavailable");
		    default:
		      return translate(t, "overview.error.invalid");
		  }
		}
		function useOverview() {
		  const [state, setState] = (0, import_react2.useState)({ data: null, error: null, loading: false, refreshedAt: 0 });
		  const [generation, setGeneration] = (0, import_react2.useState)(0);
		  const reload = (0, import_react2.useCallback)(() => setGeneration((value) => value + 1), []);
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
		    const timer = setInterval(load, POLL_INTERVAL_MS);
		    return () => {
		      disposed = true;
		      clearInterval(timer);
		      if (controller) controller.abort();
		    };
		  }, [generation]);
		  return [state, reload];
		}
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
		  const [state, reload] = useOverview();
		  const { data, error, loading, refreshedAt } = state;
		  const plugin = data && data.plugin && typeof data.plugin === "object" ? data.plugin : null;
		  const counts2 = data && data.counts && typeof data.counts === "object" ? data.counts : null;
		  const health = data && data.health && typeof data.health === "object" ? data.health : null;
		  const events = data && Array.isArray(data.recent_events) ? data.recent_events.slice(0, MAX_RECENT_EVENTS) : [];
		  const mode = plugin && (plugin.mode === "control-plane" || plugin.mode === "in-memory") ? plugin.mode : null;
		  const authoritative = Boolean(plugin && plugin.authoritative === true);
		  const source = plugin && typeof plugin.source === "string" && plugin.source ? plugin.source : null;
		  const version = plugin && typeof plugin.version === "string" && plugin.version ? plugin.version : null;
		  const healthText = health && typeof health.status === "string" && health.status ? health.status : translate(t, "overview.health.unknown");
		  const errorText = error ? describeError(error, t) : null;
		  const refreshedText = refreshedAt ? formatTime(refreshedAt) : null;
		  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { style: section, "data-trust-overview": "", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: sectionHead, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: sectionTitle, children: translate(t, "overview.title") }),
		      mode === "control-plane" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Badge, { tone: "ok", children: translate(t, "overview.mode.control-plane") }) : null,
		      mode === "in-memory" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Badge, { tone: "info", children: translate(t, "overview.mode.in-memory") }) : null,
		      plugin && !mode ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Badge, { tone: "neutral", children: translate(t, "overview.mode.unknown") }) : null,
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

		// src/client/index.jsx
		var inject = ["slots", "locale"];
		function apply(ctx) {
		  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "trust-platform: dictionaries");
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
		}
		return module.exports;
	}
});
