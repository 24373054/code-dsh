# 浏览器端实现细节

![DSH 信任平台在插件管理页中的概览面板](preview.zh.svg)

0.3.0 版本为 `@sealwax/dsh-trust-platform` 增加了浏览器端。DSH Web GUI 会从预构建的
`lib/client.js` 中惰性加载它：在对话里把八个受治理的信任工具调用渲染为紧凑卡片，并在插件详情页
增加一个概览面板。浏览器端只访问为其提供资源的 DSH 同源地址。

## 出现位置

| 界面 | 槽位（id / key） | 内容 |
| --- | --- | --- |
| 对话中的工具调用 | `tool.call.toolview`，每个 key 一个条目 | 该调用的信任卡片：标题、状态徽标、决策徽标、单行摘要、原始 JSON 展开。 |
| 设置 → 插件 → DSH 信任平台 | `plugins.detail.section`，id 为 `trust-platform-overview` | 概览面板：模式、来源、权威性、健康状态、六项计数、最近十条事件。 |
| 同一插件页 | `plugins.detail.badge`，id 为 `trust-platform-badge` | 当前信任平台包的版本徽标。 |

两个插件管理页条目都按包名（`@sealwax/dsh-trust-platform`）匹配——依次检查包 subject、行名与裸 id——
对其他任何包返回 `null`，因此不会在无关插件页面绘制界面。

## 工具卡片

注册的 `tool.call.toolview` key 为：`register_identity`、`get_identity_status`、`verify_credential`、
`check_authorization`、`create_payment_task`、`get_risk_decision`、`verify_operation_event`、
`get_execution_receipt`。

卡片读取规范化工具结果——即由 `succeeded()` 或 `failed()` 产生、放在单个文本块中的 JSON。由此推导：

- **状态**：`ok: true` 为 `ok`，`ok: false` 或错误结果为 `failed`，调用尚未结束时为 `running`；
- **决策**：结果中存在 `decision` 字段时显示对应徽标（`ALLOW`、`DENY`、`DEFER`、`REVIEW`、`STEP_UP` 等），
  并按绿/红/黄三类着色；
- **摘要**：优先使用 `code` 与 `message`，非 JSON 文本则截断后展示原文；
- **原始 JSON**：通过展开按钮显示在等宽块中。

畸形或意外载荷不会抛出异常：卡片会回退到原始文本或本地化占位文案。

## 概览面板

面板挂载期间每 5 秒轮询同源路由 `GET /trust-platform/api/overview`，并渲染符合约定结构的 `200` 响应
（字段与英文版文档一致：`plugin`、`health`、`counts`、`recent_events`、`now`）。

内存模式下返回 `mode: "in-memory"`、`authoritative: false`、计数为空且没有最近事件；面板会明确标注该
快照不具权威性，而不是隐藏它。面板既接受扁平结构（如上文文档所述），也接受包在 `overview` key 中的
结构，因此宿主端与浏览器端可以独立演进。加载中、空数据、过期（刷新失败时保留上次成功快照）与错误等
状态均有覆盖。`403`、`404`、`500`、无效 JSON 或网络失败都会显示本地化提示和重试按钮；面板不会出现空白或破损
画面。

## 安全与隐私

- **仅同源**：唯一的请求是固定的 `GET /trust-platform/api/overview`，使用
  `credentials: "same-origin"`；没有外部主机、遥测或分析上报。
- **只读**：浏览器端不写入信任状态，也不存在转移资金的工具；宿主端的安全不变量保持不变。
- **浏览器中没有密钥**：控制平面 token 与 actor DID 属于宿主侧配置，不会暴露给 bundle。
- **本地化且防御式实现**：所有可见文案都放在类型化的 `zh`/`en` 字典中，两种语言 key 完全一致，
  英文作为回退。内联样式使用 DSH 设计令牌 CSS 变量并带安全回退值，卡片与面板会跟随 GUI 主题。

## 配置

浏览器端无需额外配置：面板从路由响应中读取 `mode` 与 `source`，宿主端根据插件行的 `mode` 配置
（`in-memory` 或 `control-plane`）生成它们。路由路径固定，因此配置文件保持默认路由、只需安装插件即可。
若 GUI 会话无权调用该路由，面板显示本地化的 `403` 状态，并支持手动重试。

## 构建与测试

```sh
npm run build:client  # esbuild 0.25.12：src/client/index.jsx -> lib/client.js（惰性 CJS 包装）
node --test tests/client-bundle.test.js
npm run pack:check    # 重新构建 bundle，然后 npm pack --dry-run
```

构建会把 CJS 主体包进 `window.__ModuleLoader__.load({ id, factory })`，拒绝任何不在 shell 基线清单内的
裸 `require()`，并在 bundle 超过 128 KiB 时失败。当前 bundle 约 33 KB，仅引入 `react` 与
`react/jsx-runtime`。

`tests/client-bundle.test.js` 完全离线运行、不需要浏览器：先构建 bundle，在 `node:vm` 沙箱中以桩模块和
伪 `window.__ModuleLoader__` 执行它，再用伪造的客户端上下文调用工厂与 `apply()`，断言模块信封、八个
带 key 的渲染器、两个带 id 的插件管理页条目、zh/en 字典一致性、纯格式化辅助函数，以及不存在非基线
导入。

## 文件

| 文件 | 作用 |
| --- | --- |
| `src/client/index.jsx` | `apply`/`inject` 与全部槽位注册。 |
| `src/client/toolviews.jsx` | `ToolCard` 与八个 `tool.call.toolview` key。 |
| `src/client/overview.jsx` | 概览区块、徽标、轮询与错误状态。 |
| `src/client/locales.js` | `trust-platform` 命名空间的 `zh`/`en` 字典。 |
| `src/client/format.js` | 载荷解析、决策/状态/摘要推导、插件匹配。 |
| `src/client/styles.js` | 带 CSS 变量回退的内联样式常量。 |
| `scripts/build-client.mjs` | esbuild 构建、包装、基线 require 检查、体积预算。 |
| `lib/client.js` | 随包发布的生成产物（惰性 CJS bundle）。 |
| `tests/client-bundle.test.js` | 离线 bundle 契约测试。 |
| `docs/preview.svg` | 英文文档的示意图（640×300，自包含 SVG）。 |
