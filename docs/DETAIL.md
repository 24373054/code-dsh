![Trust platform settings page](preview.svg)

# Trust platform

`@sealwax/dsh-trust-platform` is a DeepSeek Harness bundle plugin that keeps an identity and
payment-governance trust plane **inside the plugin process**. There is no external control-plane
service to deploy and no remote URL or bearer token to configure: the embedded engine stores its
records in a profile-owned data directory and runs deterministically offline. A sandbox mode backed
by an in-memory store is available for experiments and is explicitly non-authoritative.

## What you get

- **The embedded trust plane.** Identity, delegation, authorization, risk and receipt tools execute
  in-process. The engine records every decision and refuses to turn unknown or unreadable data into
  `ALLOW`.
- **Trust cards in the conversation.** Eight governed calls render as compact cards with a localized
  title, a status badge (`ok` / `failed` / `running`), the result's `decision` badge when present, a
  one-line code/message summary and a raw-JSON disclosure.
- **Overview panel.** Settings → Plugins → DSH Trust Platform shows the engine mode (`embedded` /
  `sandbox`), source, authority and health, the six entity counters (identities, credentials,
  authorizations, tasks, events, receipts) and the ten most recent operation events. It polls the
  same-origin overview route every 5 seconds while mounted and keeps the last good snapshot when a
  refresh fails.
- **Editable settings page.** Settings → Trust Platform edits the runtime settings without touching
  a profile file (see below).
- **Localized metadata.** `locale/en.json` and `locale/zh.json` provide the plugin title,
  description and detail page; the harness picks them by language.

## Install

```sh
npm install @sealwax/dsh-trust-platform
dsh plugin --profile demo add @sealwax/dsh-trust-platform
dsh --profile demo --dump-config   # shows the trust-platform-tools row
```

A local checkout is linked the same way: `dsh plugin --profile demo add /path/to/code-dsh`.

## Settings

The settings page reads `GET /trust-platform/api/settings` and
`GET /trust-platform/api/health` every 10 seconds and writes only changed fields through
`PUT /trust-platform/api/settings`. A rejected patch renders the Host's `422` validation message
instead of discarding the form.

| Control | Field | Range |
| --- | --- | --- |
| Actor DID | `actorDid` | 3–200 characters; default actor for engine calls. |
| Intervention gate | `allowInterventionExecution` | Enables `execute_intervention`; off by default. |
| Policy version | `policyVersion` | 3–120 characters. |
| Single payment limit | `singleAmountLimit` | Positive amount, up to 1,000,000,000,000. |
| Daily payment limit | `dailyAmountLimit` | Positive amount, up to 1,000,000,000,000. |
| Risk block threshold | `riskBlockThreshold` | Number between 0 and 1. |
| Risk defer threshold | `riskDeferThreshold` | Number between 0 and 1. |
| Risk throttle threshold | `riskThrottleThreshold` | Number between 0 and 1. |
| Default trust score | `defaultTrustScore` | Number between 0 and 1. |

The three risk thresholds must satisfy block ≥ defer ≥ throttle. **Save** sends only the changed
fields, **Cancel** restores the saved values, and **Apply defaults** fills the form with the engine's
startup policy. The danger zone deletes all engine records through
`POST /trust-platform/api/reset` with `{ "confirm": true }` after a second confirmation click;
runtime settings are kept.

## Tools in the conversation

The browser half registers one `tool.call.toolview` entry per keyed governed call:
`register_identity`, `get_identity_status`, `verify_credential`, `check_authorization`,
`create_payment_task`, `get_risk_decision`, `verify_operation_event` and `get_execution_receipt`.
Each card reads the canonical tool result — a single text block containing the JSON envelope of
`succeeded()` or `failed()` — and derives the status, decision, summary and raw payload from it.
Malformed payloads never throw; the card falls back to the raw text or a localized placeholder.

## Data and privacy

- The embedded engine owns its data directory; the browser half never receives file paths as input.
- Every browser request is same-origin (`credentials: "same-origin"`) against fixed routes; there is
  no telemetry, no analytics and no external host.
- `403`, `404`, `422`, `500`, invalid JSON and network failures render localized, retryable states;
  a failed refresh keeps the last good snapshot on screen.
- All visible copy lives in the `trust-platform` zh/en dictionaries; the two stay key-identical and
  English is the fallback. Inline styles use DSH design-token CSS variables with light/dark-safe
  fallbacks.

## Safety invariants

- No `send_money`, transfer, payout or settlement tool exists. `create_payment_task` records an
  intent; settlement is out of scope and `get_execution_receipt` says so honestly.
- `check_authorization` is deterministic and conservative: missing or unreadable data yields `DEFER`,
  never `ALLOW`.
- Risk decisions never grant payment authorization (`authorization_effect: "NONE"`).
- An unsigned or unverified operation event reports `UNKNOWN`, never `VALID`.
- Warning-level or step-up decisions do not pass as approvals; only an explicit `ALLOW` can be used
  by `create_payment_task`.
- `execute_intervention` is absent unless the intervention gate is enabled, and applying an
  intervention decision never moves funds itself.
- Sandbox results are marked non-authoritative rather than presented as real trust decisions.

## Build and test

```sh
npm run build:client  # esbuild: src/client/index.jsx -> lib/client.js (lazy-CJS wrapper)
node --test tests/client-bundle.test.js
npm run pack:check    # rebuild the bundle, then npm pack --dry-run
```

The build wraps the CJS body in `window.__ModuleLoader__.load({ id, factory })`, rejects any bare
`require()` outside the shell baseline list and fails above 128 KiB. The bundle imports only `react`
and `react/jsx-runtime`.

`tests/client-bundle.test.js` runs offline with no browser: it builds the bundle, executes it in a
`node:vm` sandbox with stubbed baseline modules and a fake `window.__ModuleLoader__`, calls the
factory and `apply()` against a fake client context, and asserts the envelope, the eight keyed
renderers, the plugin-manager entries, the settings page data markers, the locale metadata, the
settings transport outcomes and the absence of non-baseline imports.
