# Plugin configuration

`@sealwax/dsh-trust-platform` is a DSH function plugin that registers the trust-platform tools and
serves the browser half from the same package. The whole trust plane — identities, credentials,
delegations, payment tasks, operation events, risk evidence, interventions, receipts, evidence, cases,
reports, knowledge documents and governance records — runs **inside the plugin process**. There is no
sidecar control plane, no `baseUrl`, no bearer token and no listening port.

The engine keeps its records in a profile-owned data directory and runs deterministically offline.

## Modes

| | `embedded` (default) | `sandbox` |
| --- | --- | --- |
| Store | JSON file under `$DSH_HOME/plugin-data/dsh-trust-platform/state.json` | Process memory only |
| Persistence | Survives plugin reloads, profile restarts and `dsh` upgrades | Lost when the plugin reloads |
| Tools | 58 tools (59 with the intervention gate) | Same 58/59 tools, same names |
| Authoritative | Yes (`source: "embedded-engine"`, `authoritative: true`) | No (`source: "in-memory-sandbox"`, `authoritative: false`) |
| Typical use | Real workflows, settings panel, demos with durable state | Offline tests, throwaway experiments |

Both modes share the same engine, the same tool surface and the same browser API. Only the store
differs, so a sandbox session can be validated with tests and then repeated in embedded mode without
changing any tool call.

## Fields

`Config` is a Schemastery object. Cordis validates it before `apply` runs and fills every default, so a
deployment only sets the fields it changes. Invalid configuration fails plugin load with an actionable
error; the plugin never falls back silently.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `"embedded"` \| `"sandbox"` | `"embedded"` | Persistence mode (see above). |
| `dataDir` | string | `""` | Optional state directory for embedded mode. Empty uses `$DSH_HOME/plugin-data/dsh-trust-platform`. |
| `actorDid` | string | `"system:dsh-web"` | Default actor DID recorded on writes. Also editable in **Settings → Trust platform**. |
| `allowInterventionExecution` | boolean | `false` | Registers `execute_intervention`, which records an execution receipt. It records only and never transfers funds. Also editable in the settings panel. |
| `policy.policyVersion` | string | `"policy-2026-10-25-001"` | Policy version stamped on decisions and evidence. |
| `policy.singleAmountLimit` | number | `1000000` | Single-payment ceiling used by admission and authorization checks. |
| `policy.dailyAmountLimit` | number | `5000000` | Daily ceiling used by admission and authorization checks. |
| `policy.riskBlockThreshold` | number | `0.8` | BLOCK at or above this risk score. |
| `policy.riskDeferThreshold` | number | `0.6` | DEFER at or above this risk score. |
| `policy.riskThrottleThreshold` | number | `0.4` | THROTTLE at or above this risk score. |
| `policy.defaultTrustScore` | number | `0.95` | Trust score assigned to a freshly registered identity. |

The risk thresholds must satisfy `riskBlockThreshold >= riskDeferThreshold >= riskThrottleThreshold`.
The schema is exported as `Config`; `Config({})` produces all defaults.

## What is editable at runtime

Three groups of settings can be changed from the DSH Web GUI (**Settings → Trust platform**) without
editing the profile, and are persisted with the engine state:

- `actorDid`
- `allowInterventionExecution` (takes effect for tools registered on the next plugin load)
- every `policy.*` field listed above

The settings page validates input, submits only changed fields and shows the host's validation
message. The browser API behind it is documented in [Browser API](#browser-api).

Everything else — `mode` and `dataDir` — is host configuration: those values decide where the engine
lives, so they stay in the profile's `cordis.patch.yml` row.

## Deployment examples

### Sandbox (default row)

The plugin's `cordis.patch.yml` inserts the row with schema defaults. An explicit row is equivalent:

```yaml
- id: trust-platform-tools
  config:
    mode: sandbox
```

The sandbox is useful for tool discovery, prompts and offline demos. Its decisions are **not**
authoritative and must not gate real payments; every sandbox result says
`source: "in-memory-sandbox"` / `authoritative: false`.

### Embedded with the default data directory

```yaml
- id: trust-platform-tools
```

That is the recommended row for a real profile: state lives in
`$DSH_HOME/plugin-data/dsh-trust-platform/state.json`, `actorDid` defaults to `system:dsh-web`, and the
intervention gate stays off.

### Embedded with a custom data directory and actor

```yaml
- id: trust-platform-tools
  config:
    mode: embedded
    dataDir: /var/lib/dsh/trust-platform
    actorDid: did:trust:corp.example:agent-7
    policy:
      policyVersion: policy-2026-10-25-001
      singleAmountLimit: 250000
      dailyAmountLimit: 1000000
```

`dataDir` is a plain directory path; the engine creates it, writes `state.json` atomically (temporary
file + rename) and debounces writes.

### Enabling intervention execution

```yaml
- id: trust-platform-tools
  config:
    allowInterventionExecution: true
```

`execute_intervention` applies an existing intervention decision: it validates the decision, records an
execution receipt (`target_system: "embedded-engine"`), updates the intervention's applied state and
audits the action. It does **not** move funds, reserve a real quota or settle value. The tool is
opt-in; with the gate off it is not registered at all, and calls to it fail as an unknown tool.

## Validation errors

Configuration problems abort plugin load with messages such as:

- `[dsh-trust-platform] unknown mode "x"; expected one of: embedded, sandbox`
- Cordis/Schemastery type errors before `apply` runs, for example
  `$.policy.riskBlockThreshold expected number but got high`.

Browser settings patches are validated by the engine and rejected with HTTP 422
`{"ok":false,"error_code":"VALIDATION_ERROR","message":…,"details":…}`:

- `actorDid` must be a string of 3–200 characters.
- `allowInterventionExecution` must be a boolean.
- `policy.policyVersion` must be a string of 3–120 characters.
- amount limits must be finite numbers in `(0, 1e12]`.
- risk thresholds and `defaultTrustScore` must be finite numbers in `[0, 1]`.
- risk thresholds must satisfy `block >= defer >= throttle`.
- unknown settings or policy fields are rejected.

## State file

`embedded` mode writes one JSON document: `state.json` in the data directory. It contains the
schema version, engine settings (including the runtime-edited values), sequence counters, the audit
log and every collection:

`identities`, `identity_keys`, `credentials`, `credential_status`, `delegations`, `tasks`, `events`,
`verifications`, `risk_evidence`, `interventions`, `receipts`, `evidence`, `anchors`, `cases`,
`case_snapshots`, `reports`, `knowledge`, `knowledge_chunks`, `feedback`, `policies`, `models`,
`idempotency`, `counters`, `activity`, `admission_decisions`.

Writes are atomic (temp file + rename) and debounced; the plugin flushes pending state when it is
disposed or reloaded. Corrupt state is never silently replaced: the loader reports the error and the
plugin fails to start rather than starting with partial data.

## Browser API

The host half serves a same-origin route family under `/trust-platform/api`, guarded by the DSH
connection's browser-session check (`401`/`403` for non-browser callers) and never cached
(`cache-control: no-store`):

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/trust-platform/api/overview` | Plugin, engine health, mode/source/authoritative, six counters and up to ten recent events. |
| `GET` | `/trust-platform/api/health` | Engine health document (`status`, `engine`, `mode`, `schema_revision`, `started_at`). |
| `GET` | `/trust-platform/api/settings` | Current runtime settings, the effective data directory and `editable: true`. |
| `PUT` | `/trust-platform/api/settings` | Patch of `actorDid` / `allowInterventionExecution` / `policy.*`; returns the saved settings. |
| `POST` | `/trust-platform/api/reset` | Requires `{"confirm":true}`; clears every engine record and keeps runtime settings. |

The browser half (`lib/client.js`) consumes exactly these routes; it never talks to a third-party
origin and never reads tokens or credentials.

## Security semantics

- **No money movement.** No tool sends money, transfers, pays out or settles value.
  `create_payment_task` records a task; `get_execution_receipt` reports the engine's receipt state
  (`NOT_SETTLED` until an execution gate records one).
- **No ALLOW without evidence.** `check_authorization` never returns `ALLOW` when the delegation record
  is missing, unreadable, incomplete, outside its validity window, revoked, scoped to another
  action/subject/asset, or over its limits; such cases are `DENY` or `DEFER`, and only an `ALLOW`
  authorization is accepted by `create_payment_task`.
- **Risk is not authorization.** `get_risk_decision` reports what the risk engine decided
  (`ALLOW`/`WARN`/`THROTTLE`/`STEP_UP`/`DEFER`/`BLOCK`/`FREEZE`) and exposes
  `authorization_effect: "NONE"`; it never creates an authorization.
- **UNKNOWN / NOT_EVALUABLE never pass.** Credential verification distinguishes `VALID`, `INVALID`,
  `UNKNOWN` and `NOT_EVALUABLE`; unsigned or unverifiable operation events report `UNKNOWN`, never
  `VALID`.
- **No attestation claims.** Anchoring records are deterministic local anchors
  (`status: "CONFIRMED"`, `chain_id: "local-chain"`); the plugin never claims an external chain
  finality or settlement.
- **Sandbox is not authoritative.** Sandbox mode is a deterministic demo and is labeled as such in every
  result and in the settings/overview panels.
- **No secrets in the browser half.** The settings page displays the data directory and policy but no
  token or key material; the engine's signing keys live only in the state file.

## Compatibility

- Harness: `engines.dsh` is `>=0.2.1-rc.3 <0.3.0`.
- Host packages are **peer dependencies** (`@deepseek-ai/cordis ~4.0.5`,
  `@deepseek-ai/dsh-tools >=0.2.1-rc.3 <0.3.0`, `@deepseek-ai/schemastery ~3.18.5`): the profile
  resolves them from the harness itself, so a profile never installs a second copy that shadows the
  harness services.
- Tools are registered through the `tools` service; the engine is provided as the `trustPlane` model
  service and resolved lazily on every tool call, so a plugin reload is picked up by later calls.
- The plugin has no default export; it exports `name`, `inject`, `Config` and `apply`.
- The browser half is a prebuilt lazy CommonJS bundle (`lib/client.js`) declaring
  `dsh.client.platform: web` and injecting `@deepseek-ai/dsh-client-locale` and
  `@deepseek-ai/dsh-client-ui-slots`.

## What this plugin does not do

- It does not send money, transfer assets, pay out, settle or reconcile value.
- It does not manage a wallet, sign on-chain transactions or produce real cryptographic settlement.
- It does not require or provide a separate control-plane HTTP service.
- It does not replace the harness: it uses the `tools` and `webServer`/`connection` services and
  registers through the public plugin API.
