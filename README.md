# DSH Trust Platform Plugin

DeepSeek Harness bundle plugin exposing identity, delegation and payment-governance tools for
agent payment workflows. It runs in one of two modes:

- **In-memory sandbox** (default): nine local tools with no network and no persistence. Decisions are
  illustrative and **not authoritative**.
- **Control plane**: the same nine tool names backed by a real trust control-plane HTTP service, plus
  the remote read/decision tools the service exposes. Decisions come from that service.

The plugin never sends money or settles value in either mode.

## Install

```sh
npm install @00ccf/dsh-trust-platform
```

The package declares `dsh.bundle.patch`, so `dsh plugin` composes it into a profile:

```sh
dsh plugin --profile demo add @00ccf/dsh-trust-platform
dsh --profile demo --dump-config   # shows the trust-platform-tools row
```

A local checkout can be linked the same way with `dsh plugin --profile demo add /path/to/code-dsh`.

## Configuration

Configuration lives in the profile `cordis.patch.yml`. The defaults load the sandbox:

```yaml
- id: trust-platform-tools
  config:
    mode: control-plane
    baseUrl: http://127.0.0.1:8080
    actorDid: system:console
    timeoutMs: 30000
    allowInterventionExecution: false
```

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `mode` | `in-memory` \| `control-plane` | `in-memory` | Backing implementation of the nine canonical tools. |
| `baseUrl` | string | `''` | Control-plane origin, required in `control-plane` mode; must be an absolute `http(s)` URL without embedded credentials. |
| `token` | secret string | `''` | Bearer token sent as `Authorization`. Secret-role config; never logged. |
| `actorDid` | string | `''` | Actor DID sent as `X-Actor-DID`; defaults to the token subject on the service side. |
| `timeoutMs` | number | `30000` | Per-request timeout for control-plane calls. |
| `allowInterventionExecution` | boolean | `false` | Registers `execute_intervention`, which applies a control-plane intervention decision. Control-plane mode only. |

Invalid configuration fails plugin load with an actionable error instead of falling back to unsafe
defaults. See [Plugin configuration](docs/plugin-configuration.md) for the full reference, deployment
examples, validation errors and security semantics.

## Tools by mode

**In-memory sandbox (9):** `register_identity`, `get_identity_status`, `verify_credential`,
`check_authorization`, `create_payment_task`, `submit_operation_event`, `get_risk_decision`,
`request_step_up`, `get_execution_receipt`.

**Control plane (36):** the same nine canonical tools, backed by the service, plus 27 adapter tools:

- Remote reads and decisions (21): `check_service_health`, `resolve_identity_admission`,
  `verify_remote_credential`, `read_payment_task`, `list_payment_tasks`, `read_delegation`,
  `list_delegations`, `verify_operation_event`, `evaluate_remote_risk`, `read_risk_evidence`,
  `propose_intervention`, `read_interventions`, `read_trace_context`, `search_trust_knowledge`,
  `read_evidence`, `ingest_evidence`, `create_trace_case`, `read_report`,
  `submit_governance_feedback`, `read_dashboard_summary`, `query_audit_assistant`.
- Lifecycle helpers (6): `create_delegation`, `revoke_delegation`, `issue_credential`,
  `read_credential`, `transition_payment_task`, `create_trace_report`.

With `allowInterventionExecution: true` the control-plane mode registers 37 tools: the 36 above plus
`execute_intervention`.

## Safety invariants

- No `send_money`, transfer, payout or settlement tool exists in any mode. `create_payment_task`
  records an intent; settlement is out of scope and `get_execution_receipt` says so honestly.
- `check_authorization` performs a deterministic, conservative check of the delegation record:
  status, validity window, delegated action, subject binding, amount/daily limits, asset scope and —
  when the task is supplied — root issuer. Missing or unreadable data yields `DEFER`, never `ALLOW`.
- A risk decision never grants payment authorization: `get_risk_decision` reports
  `authorization_effect: "NONE"`, and `evaluate_remote_risk` is a read of the service decision only.
- `verify_operation_event` with an unsigned/unverified event reports `UNKNOWN`, never `VALID`.
- Warning-level or step-up decisions do not pass as approvals; only an explicit `ALLOW` authorization
  can be used by `create_payment_task`.
- `execute_intervention` is absent unless `allowInterventionExecution` is explicitly enabled, and it
  applies a service decision rather than moving funds itself.
- The client only knows a frozen map of fixed routes; callers cannot request arbitrary URLs.
- In-memory results carry `source: "in-memory-sandbox"` and `authoritative: false`; control-plane
  results carry `source: "control-plane"` and `authoritative: true`.

## Client export

`@00ccf/dsh-trust-platform/control-plane-client` exports the fixed-route HTTP adapter used in
control-plane mode:
`createControlPlaneClient`, `ROUTES`, `ControlPlaneError` and `validateBaseUrl`. It maps the service's
flat error body (`error_code`, `message`, `request_id`, `retryable`, `evidence_refs`,
`policy_version`), sends `X-Request-ID`, optional `X-Actor-DID`/`Authorization`, generates
`Idempotency-Key` on writes that need one, supports GET query parameters and enforces per-request
timeouts. In control-plane mode the plugin provides it as the `trustPlatformClient` service. Since
0.3.0 the `./client` subpath resolves to the browser bundle described below; importing the HTTP
adapter from Node code now uses the explicit `./control-plane-client` subpath.

## Browser UI

Version 0.3.0 adds the browser half that the DSH Web GUI loads lazily. Installation is unchanged: the
package declares `dsh.client` (`platform: web`) and ships the prebuilt bundle at `lib/client.js`, so
`dsh plugin add` activates it without a build step. The bundle is a lazy CommonJS factory
(`window.__ModuleLoader__.load`) whose only bare imports are shell baseline modules (`react`,
`react/jsx-runtime`).

The browser half provides:

- **Tool renderers** in the conversation for eight governed calls: `register_identity`,
  `get_identity_status`, `verify_credential`, `check_authorization`, `create_payment_task`,
  `get_risk_decision`, `verify_operation_event` and `get_execution_receipt`. Each renders as a
  compact card with a localized title, a status badge (`ok` / `failed` / `running`), the tool's
  `decision` badge when present (`ALLOW`, `DENY`, `DEFER`, `STEP_UP`, …), a one-line code/message
  summary and a disclosure toggle for the raw JSON result. Unrecognized payloads degrade to the raw
  text instead of throwing.
- **Plugin overview panel** in Settings → Plugins → DSH Trust Platform: mode (`control-plane` /
  `in-memory`), source and authoritative flags, control-plane health, the six entity counters
  (identities, credentials, authorizations, tasks, events, receipts) and the ten most recent events.
  It polls the same-origin route `GET /trust-platform/api/overview` every 5 seconds while mounted and
  keeps the last good snapshot if a refresh fails.
- **Package badge** showing the version of the active trust-platform package.

The overview route is served by the plugin's host half and uses the GUI session; a `403`, `500` or
network error is rendered as a localized, retryable message instead of a broken panel. The browser
half sends no telemetry and no data leaves the DSH origin.

The bundle is committed at `lib/client.js` and rebuilt from source with esbuild:

```sh
npm run build:client   # src/client/index.jsx -> lib/client.js (lazy-CJS wrapper, size check)
```

`src/client/` holds the source: `index.jsx` (registrations), `toolviews.jsx`, `overview.jsx`,
`locales.js` (zh/en dictionaries), `format.js` (payload parsing) and `styles.js` (inline styles using
DSH design-token CSS variables with fallbacks). `tests/client-bundle.test.js` builds the bundle,
executes it in a `node:vm` sandbox with stubbed baseline modules and asserts the registered slots,
the module envelope and the absence of non-baseline imports — offline and without a browser.

## Development

```sh
npm test             # node --test tests/*.test.js (offline, stubbed fetch)
npm run build:client # rebuild lib/client.js from src/client/
npm run pack:check   # rebuild the browser bundle, then npm pack --dry-run
```

The tests never use the network or a live server; the bundle test rebuilds `lib/client.js` first so
the committed artifact and the source cannot drift. A separate integration harness can exercise the
real service. Requires DSH `>=0.2.1-rc.3 <0.3.0` (`engines.dsh`) and `@deepseek-ai/cordis ~4.0.5`.
