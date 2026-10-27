![信任平台设置页](preview.zh.svg)

# 信任平台

`@sealwax/dsh-trust-platform` 是一个 DeepSeek Harness bundle 插件，把身份与支付治理的信任平面**放进插件进程内部**运行。无需部署外部控制平面服务，也无需配置远程地址或访问令牌：内置引擎把记录保存在 profile 自己的数据目录中，并以确定性的方式在离线环境运行。另提供基于内存存储的沙箱模式用于实验，该模式明确不具权威性。

## 功能一览

- **内置信任平面**：身份、委托、授权、风险与回执工具全部在进程内执行。引擎记录每一次决策，并且绝不会把未知或不可读的数据变成 `ALLOW`。
- **对话中的信任卡片**：八个受治理的工具调用渲染为紧凑卡片，包含本地化标题、状态徽标（`ok` / `failed` / `running`）、结果中的 `decision` 徽标（如 `ALLOW`、`DENY`、`DEFER`、`STEP_UP`）、单行 code/message 摘要，以及可展开的原始 JSON。
- **概览面板**：设置 → 插件 → DSH 信任平台 显示引擎模式（`embedded` / `sandbox`）、来源、权威性与健康状态、六项计数（身份、凭证、授权、任务、事件、回执）以及最近十条操作事件。面板挂载期间每 5 秒轮询一次同源概览路由；刷新失败时保留上一次成功快照。
- **可编辑设置页**：设置 → 信任平台 页面可以在 GUI 中直接修改运行时设置，无需编辑 profile 文件。
- **本地化元数据**：`locale/en.json` 与 `locale/zh.json` 提供插件标题、描述与详情页，Harness 会按语言链自动选择。

## 安装

```sh
npm install @sealwax/dsh-trust-platform
dsh plugin --profile demo add @sealwax/dsh-trust-platform
dsh --profile demo --dump-config   # shows the trust-platform-tools row
```

本地 checkout 也可以用同样方式链接：`dsh plugin --profile demo add /path/to/code-dsh`。

## 设置用法

设置页每 10 秒读取 `GET /trust-platform/api/settings` 与 `GET /trust-platform/api/health`，并通过 `PUT /trust-platform/api/settings` 只提交发生变化的字段。宿主返回 `422` 校验失败时，页面会展示宿主给出的提示并保留表单内容，而不是丢弃用户的修改。

| 控件 | 字段 | 范围 |
| --- | --- | --- |
| 操作者 DID | `actorDid` | 3–200 个字符；引擎调用的默认操作者。 |
| 干预开关 | `allowInterventionExecution` | 开启后才注册 `execute_intervention`；默认关闭。 |
| 策略版本 | `policyVersion` | 3–120 个字符。 |
| 单笔支付限额 | `singleAmountLimit` | 正数金额，最大 1,000,000,000,000。 |
| 每日支付限额 | `dailyAmountLimit` | 正数金额，最大 1,000,000,000,000。 |
| 风险阻断阈值 | `riskBlockThreshold` | 0 到 1 之间的数值。 |
| 风险延后阈值 | `riskDeferThreshold` | 0 到 1 之间的数值。 |
| 风险限流阈值 | `riskThrottleThreshold` | 0 到 1 之间的数值。 |
| 默认信任分 | `defaultTrustScore` | 0 到 1 之间的数值。 |

三个风险阈值需满足“阻断 ≥ 延后 ≥ 限流”。**保存**只提交变化的字段，**取消**恢复已保存的值，**填入默认值**会把引擎启动时的默认策略填入表单。危险操作区会在二次确认后通过 `POST /trust-platform/api/reset`（请求体 `{ "confirm": true }`）删除引擎记录；运行时设置会保留。

## 对话中的工具

浏览器端为八个带 key 的受治理调用各注册一个 `tool.call.toolview` 条目：`register_identity`、`get_identity_status`、`verify_credential`、`check_authorization`、`create_payment_task`、`get_risk_decision`、`verify_operation_event`、`get_execution_receipt`。

卡片读取规范化工具结果——即由 `succeeded()` 或 `failed()` 产生、放在单个文本块中的 JSON——并从中推导状态、决策、摘要与原始载荷。畸形载荷不会抛出异常：卡片会回退到原始文本或本地化占位文案。

## 数据与隐私

- 内置引擎拥有自己的数据目录；浏览器端不会把文件路径作为输入或输出。
- 浏览器端的所有请求都是固定路由上的同源请求（`credentials: "same-origin"`），没有遥测、分析或外部主机。
- `403`、`404`、`422`、`500`、无效 JSON 与网络失败都会显示本地化且可重试的状态；刷新失败时保留上一次成功快照。
- 所有可见文案都在 `trust-platform` 的 zh/en 字典中，两种语言 key 完全一致，英文作为回退。内联样式使用 DSH 设计令牌 CSS 变量，并带有明暗主题安全的回退值。

## 安全不变量

- 任何模式下都不存在 `send_money`、转账、付款或结算工具。`create_payment_task` 只记录意图；结算不在范围内，`get_execution_receipt` 会如实说明。
- `check_authorization` 是确定性的保守检查：缺失或不可读的数据返回 `DEFER`，绝不返回 `ALLOW`。
- 风险决策不授予支付授权（`authorization_effect: "NONE"`）。
- 未签名或未验证的操作事件返回 `UNKNOWN`，绝不返回 `VALID`。
- 警告级或 step-up 决策不能当作批准；只有显式的 `ALLOW` 才能被 `create_payment_task` 使用。
- 干预开关未开启时不存在 `execute_intervention`；它只应用干预决策，本身不移动资金。
- 沙箱结果会明确标注为不具权威性，而不会被当作真实的信任决策展示。

## 构建与测试

```sh
npm run build:client  # esbuild：src/client/index.jsx -> lib/client.js（惰性 CJS 包装）
node --test tests/client-bundle.test.js
npm run pack:check    # 重新构建 bundle，然后 npm pack --dry-run
```

构建会把 CJS 主体包进 `window.__ModuleLoader__.load({ id, factory })`，拒绝任何不在 shell 基线清单内的裸 `require()`，并在 bundle 超过 128 KiB 时失败。当前 bundle 仅引入 `react` 与 `react/jsx-runtime`。

`tests/client-bundle.test.js` 完全离线运行、不需要浏览器：先构建 bundle，在 `node:vm` 沙箱中以桩模块和伪 `window.__ModuleLoader__` 执行它，再用伪造的客户端上下文调用工厂与 `apply()`，断言模块信封、八个带 key 的渲染器、插件管理页条目、设置页的 data-* 标记、本地化元数据、设置传输的各种结果，以及不存在非基线导入。
