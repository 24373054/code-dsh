# DSH Trust Platform Plugin

DeepSeek Harness bundle plugin exposing identity, delegation and payment-governance tools for agent
payment workflows. The whole trust plane runs **inside the plugin process**: there is no external
control-plane service, no HTTP backend to deploy, and no `baseUrl` or bearer token to configure.

The embedded engine keeps its records in a profile-owned data directory and runs deterministically
offline. A sandbox mode uses an in-memory store for experiments; it is explicitly non-authoritative.

The plugin never sends money or settles value in either mode.

## Install

```sh
npm install @sealwax/dsh-trust-platform
```

The package declares `dsh.bundle.patch`, so `dsh plugin` composes it into a profile:

```sh
dsh plugin --profile demo add @sealwax/dsh-trust-platform
dsh --profile demo --dump-config   # shows the trust-platform-tools row
```

A local checkout can be linked the same way with `dsh plugin --profile demo add /path/to/code-dsh`.

## Configuration

The profile row keeps host-side settings only. Runtime trust settings — actor DID, intervention gate,
policy version, amount limits, risk thresholds and the default trust score — are edited in the Web
GUI: **Settings → Trust Platform** (see [Settings panel](#settings-panel)). The embedded engine owns
its data directory, so the profile does not configure a control-plane address or token.

Invalid configuration fails plugin load with an actionable error instead of falling back to unsafe
defaults. See [Plugin configuration](docs/plugin-configuration.md) for the host configuration
reference.

## Tools

The host half registers the identity and payment-governance tools of the embedded engine under the
same names the plugin has always used (`register_identity`, `get_identity_status`,
`verify_credential`, `check_authorization`, `create_payment_task`, `get_risk_decision`,
`verify_operation_event`, `get_execution_receipt`, …). `execute_intervention` appears only when the
intervention gate is enabled in the settings panel.

In the conversation, eight governed calls render as compact trust cards: a localized title, a status
badge, the result's `decision` badge when present, a one-line code/message summary and a raw-JSON
disclosure. Unrecognized payloads degrade to the raw text instead of throwing.

## Browser UI

The DSH Web GUI loads the prebuilt `lib/client.js` bundle lazily. The package declares `dsh.client`
(`platform: web`) and ships the bundle, so `dsh plugin add` activates it without a build step. The
bundle is a lazy CommonJS factory (`window.__ModuleLoader__.load`) whose only bare imports are shell
baseline modules (`react`, `react/jsx-runtime`).

- **Tool renderers** for the eight governed calls listed above, keyed in `tool.call.toolview`.
- **Plugin overview panel** in Settings → Plugins → DSH Trust Platform: engine mode (`embedded` /
  `sandbox`), source and authoritative flags, health status, the six entity counters (identities,
  credentials, authorizations, tasks, events, receipts) and the ten most recent events. It polls the
  same-origin route `GET /trust-platform/api/overview` every 5 seconds and keeps the last good
  snapshot if a refresh fails.
- **Package badge** showing the active trust-platform package version.
- **Settings panel** in Settings → Trust Platform: a live status header (mode, data directory,
  health, schema revision, start time) and an editable form for the actor DID, the
  intervention-execution gate and the policy limits. The page polls `GET /trust-platform/api/settings`
  and `GET /trust-platform/api/health` every 10 seconds while mounted, keeps unsaved edits on screen
  across refreshes, and renders the Host's `422` validation message instead of discarding the form.
  A danger zone resets all trust data behind a two-step confirmation; runtime settings are kept.

### Settings panel

| Control | Field | Notes |
| --- | --- | --- |
| Actor DID | `actorDid` | 3–200 characters; default actor for engine calls. |
| Intervention gate | `allowInterventionExecution` | Enables `execute_intervention`; off by default. |
| Policy version | `policyVersion` | 3–120 characters. |
| Amount limits | `singleAmountLimit`, `dailyAmountLimit` | Positive amounts up to 1,000,000,000,000. |
| Risk thresholds | `riskBlockThreshold`, `riskDeferThreshold`, `riskThrottleThreshold` | Numbers between 0 and 1; block ≥ defer ≥ throttle. |
| Default trust score | `defaultTrustScore` | Number between 0 and 1. |

Save sends only changed fields (`PUT /trust-platform/api/settings`); apply defaults fills the form
from the engine's startup policy; reset deletes engine records (`POST /trust-platform/api/reset`,
body `{ "confirm": true }`) and keeps the runtime settings. All routes are same-origin, use the GUI
session and are rendered as localized, retryable states on `403`, `404`, `422`, `500`, invalid JSON
or network failure. The browser half sends no telemetry and no data leaves the DSH origin.

### Localized plugin metadata

`locale/en.json` and `locale/zh.json` describe the plugin for the harness plugin manager:
`meta.title`, `meta.description` and `meta.detail`, where the detail page is
[docs/DETAIL.md](docs/DETAIL.md) for English and [docs/DETAIL.zh.md](docs/DETAIL.zh.md) for Chinese.
Both dictionaries ship in the package and are selected by the harness language chain.

The bundle is committed at `lib/client.js` and rebuilt from source with esbuild:

```sh
npm run build:client   # src/client/index.jsx -> lib/client.js (lazy-CJS wrapper, size check)
```

`src/client/` holds the source: `index.jsx` (registrations), `toolviews.jsx`, `overview.jsx`,
`settings.jsx`, `settings-data.js` (transport, patch and validation model), `settings-store.js`
(polling hook), `overview-data.js` (shared overview transport), `locales.js` (zh/en dictionaries),
`format.js` (payload parsing) and `styles.js` (inline styles using DSH design-token CSS variables
with fallbacks). `tests/client-bundle.test.js` builds the bundle, executes it in a `node:vm` sandbox
with stubbed baseline modules and the `fetch` stub, and asserts the registered slots, the settings
form markers, the locale metadata, the module envelope and the absence of non-baseline imports —
offline and without a browser.

## Package exports

- `@sealwax/dsh-trust-platform` — the host half the profile composes.
- `@sealwax/dsh-trust-platform/client` — the prebuilt browser bundle (`lib/client.js`).
- `@sealwax/dsh-trust-platform/cordis.patch.yml` — the bundle patch.
- `@sealwax/dsh-trust-platform/locale/*.json` — the localized plugin metadata.
- `@sealwax/dsh-trust-platform/package.json` — package metadata.

Since 0.6.0 the trust plane runs entirely in-process; the legacy `./control-plane-client` subpath
export of the external-service adapter has been removed.

## Safety invariants

- No `send_money`, transfer, payout or settlement tool exists in any mode. `create_payment_task`
  records an intent; settlement is out of scope and `get_execution_receipt` says so honestly.
- `check_authorization` performs a deterministic, conservative check of the delegation record:
  status, validity window, delegated action, subject binding, amount/daily limits, asset scope and —
  when the task is supplied — root issuer. Missing or unreadable data yields `DEFER`, never `ALLOW`.
- A risk decision never grants payment authorization: `get_risk_decision` reports
  `authorization_effect: "NONE"`.
- `verify_operation_event` with an unsigned/unverified event reports `UNKNOWN`, never `VALID`.
- Warning-level or step-up decisions do not pass as approvals; only an explicit `ALLOW` authorization
  can be used by `create_payment_task`.
- `execute_intervention` is absent unless `allowInterventionExecution` is explicitly enabled, and it
  applies an intervention decision rather than moving funds itself.
- The browser half only knows the fixed same-origin routes; callers cannot request arbitrary URLs.
- The embedded engine marks its results authoritative; sandbox results are explicitly non-authoritative
  and unknown or unreadable data never yields `ALLOW`.

## Development

```sh
npm test             # node --test tests/*.test.js (offline, stubbed fetch)
npm run build:client # rebuild lib/client.js from src/client/
npm run pack:check   # rebuild the browser bundle, then npm pack --dry-run
```

The tests never use the network or a live server; the bundle test rebuilds `lib/client.js` first so
the committed artifact and the source cannot drift. `tests/scenario-full-chain.test.js` runs the
complete DID → credential → payment task → delegation → authorization → operation event → risk →
intervention → case → report chain through the registered tools and the browser API, asserts that
every fail-closed path stays closed (a `DENY` authorization can never create a task, unsigned events
never verify as `VALID`), and checks that the whole chain survives in `state.json`.
Requires DSH `>=0.2.1-rc.3 <0.3.0`
(`engines.dsh`) and `@deepseek-ai/cordis ~4.0.5`.
