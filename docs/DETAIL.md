![Trust platform settings page](preview.svg)

# Trust platform

An embedded identity and payment-governance trust plane for multi-agent payment workflows. The whole
trust plane runs **inside the DSH plugin process**: there is no external control-plane service to
deploy, no HTTP backend and no `baseUrl` or bearer token to configure. The engine keeps its records in
a profile-owned data directory, runs deterministically offline and never moves funds itself.

A sandbox mode uses an in-memory store for experiments and is explicitly non-authoritative: sandbox
records never count as a trust decision. The plugin never sends money or settles value in either mode.

## What's new in 0.7.0

- **Tool catalog grows to 60 tools** in embedded/sandbox mode (61 with the intervention gate
  enabled): `read_delegation_chain` resolves a delegation chain root → leaf with its effective
  limits and `chain_trustworthy`, and `settle_payment_task` runs a signed `FINAL SETTLE` close-loop
  (`CONFIRMED → AUDITED → CLOSED`) that refuses when verification is not `VALID`.
- **Multi-level delegation chains** — authorization follows delegated capabilities across multiple
  links, and a broken, expired or over-scoped link fails closed with `DEFER`, never `ALLOW`.
- **Signed settlement close-loop** — payment tasks can be closed out against signed settlement
  evidence, so receipts and audit records link back to a verifiable settlement record. The engine
  records evidence; it still never transfers funds.
- **Governance policy and model activation** — policy versions and risk-model revisions can be
  activated at runtime in addition to the editable amount limits and risk thresholds.
- **Data management** — the settings page now shows the state-file storage card, downloads the full
  engine state as JSON and resets records behind a typed `RESET` confirmation.
- **Crash recovery** — the embedded engine reloads its state file after a restart and reports the
  recovery result in the data-management card.

## What you get

- An embedded trust plane whose identity, delegation, payment-task, operation-event, risk and
  execution-receipt records are stored in the profile's data directory.
- Eight compact trust cards in the conversation with a localized title, a status badge, the result
  `decision` badge when present, a one-line code/message summary and a raw-JSON disclosure.
- A plugin overview panel in Settings → Plugins → DSH Trust Platform that polls the engine every five
  seconds and keeps the last good snapshot when a refresh fails.
- An editable settings page in Settings → Trust Platform for the actor DID, the
  intervention-execution gate and the risk policy limits.
- A data-management section with the storage card, JSON export and a guarded reset.
- Localized plugin metadata for the harness plugin manager: English and Chinese detail pages.

## Install

```sh
npm install @sealwax/dsh-trust-platform
dsh plugin --profile demo add @sealwax/dsh-trust-platform
dsh --profile demo --dump-config   # shows the trust-platform-tools row
```

A local checkout can be linked the same way with `dsh plugin --profile demo add /path/to/code-dsh`.
The embedded engine owns its data directory; the profile configures no control-plane address or
token.

## Settings

The browser half reads `GET /trust-platform/api/settings` and `GET /trust-platform/api/health` every
10 seconds while the page is mounted. Saving sends only the changed fields to
`PUT /trust-platform/api/settings`; a rejected patch returns `422` and its message is rendered next
to the form instead of discarding the operator's changes. Unsaved edits survive refreshes, Cancel
restores the last saved snapshot and Apply defaults fills the form from the engine's startup policy.

| Control | Field | Notes |
| --- | --- | --- |
| Actor DID | `actorDid` | 3–200 characters; default actor for engine calls. |
| Intervention gate | `allowInterventionExecution` | Enables `execute_intervention`; off by default. |
| Policy version | `policyVersion` | 3–120 characters. |
| Amount limits | `singleAmountLimit`, `dailyAmountLimit` | Positive amounts up to 1,000,000,000,000. |
| Risk thresholds | `riskBlockThreshold`, `riskDeferThreshold`, `riskThrottleThreshold` | Numbers between 0 and 1; block ≥ defer ≥ throttle. |
| Default trust score | `defaultTrustScore` | Number between 0 and 1. |

## Data management

The settings page renders a storage card driven by `GET /trust-platform/api/storage`: data directory,
state file, file size, whether the file exists, last saved time, schema version and the recovery
state. A `write_error` is surfaced as a warning instead of hiding the card, and a missing storage
capability renders a localized `503` state.

- **Export data** downloads the complete engine state as JSON from
  `GET /trust-platform/api/export` (attachment filename `trust-platform-state-<timestamp>.json`, at
  most 8 MiB; a larger state returns `413`). The last snapshot is kept on screen when an export
  fails.
- **Reset data** deletes every engine record with `POST /trust-platform/api/reset`, body
  `{"confirm": true}`, and is only enabled after the operator types `RESET` into the confirmation
  field. Runtime settings are kept across a reset.
- **Refresh** re-reads the storage card and the settings snapshot.

All routes are same-origin, use the GUI session and are rendered as localized, retryable states on
`403`, `404`, `413`, `422`, `500`, `503`, invalid JSON or network failure. The browser half sends no
telemetry and no data leaves the DSH origin.

## Tools in the conversation

The eight governed calls `register_identity`, `get_identity_status`, `verify_credential`,
`check_authorization`, `create_payment_task`, `get_risk_decision`, `verify_operation_event` and
`get_execution_receipt` render as trust cards. Other engine tools — including
`read_delegation_chain` and `settle_payment_task` — use the host's default tool row. The host half
returns the canonical `succeeded()`/`failed()` JSON envelope; the cards parse it defensively and
fall back to the raw text when a payload is malformed, so a broken result never throws inside the
conversation.

## Data and privacy

Everything runs offline: no telemetry, no external network and no data leaves the DSH origin. The
browser half only knows fixed same-origin routes under `/trust-platform/api`. Failed refreshes keep
the last good snapshot, every failure state is localized and retryable, and the locale dictionaries
fall back to English when a visible string is missing in the active language.

## Safety invariants

- The plugin never moves funds. `create_payment_task` records an intent and the signed settlement
  close-loop records and verifies settlement evidence; neither initiates a transfer.
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
- The embedded engine marks its results authoritative; sandbox results are explicitly
  non-authoritative and unknown or unreadable data never yields `ALLOW`.

## Build and test

```sh
npm run build:client   # src/client/index.jsx -> lib/client.js (lazy-CJS wrapper, size check)
node --test tests/client-bundle.test.js
npm run pack:check     # rebuild the bundle, then npm pack --dry-run
```

The bundle test executes `lib/client.js` in a `node:vm` sandbox with stubbed baseline modules and a
stubbed `fetch`, asserting the registered settings/overview/tool slots, the settings form and
data-management markers, the locale metadata, the lazy-CJS envelope and that only `react` modules
are imported. It is fully offline and never starts a browser or a server.
