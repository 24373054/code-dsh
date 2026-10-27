# Plugin configuration

`@00ccf/dsh-trust-platform` is a DSH function plugin that registers trust-platform tools through the
Harness `tools` service. It has two modes:

| | `in-memory` (default) | `control-plane` |
| --- | --- | --- |
| Backend | Local process memory, no network | Real trust control-plane HTTP service |
| Tools | 9 canonical sandbox tools | 9 authoritative canonical tools + 27 adapter tools (36 total) |
| With `allowInterventionExecution: true` | n/a | 37 tools (`execute_intervention` added) |
| Decision source | Illustrative local rules (`authoritative: false`) | The service (`authoritative: true`) |
| Persistence | None, resets when the process exits | Service database |
| Requirements | None | A reachable control plane and, in production, a bearer token |

Configuration is a Schemastery object exported as `Config`. Cordis validates it before `apply` runs
and fills every default, so a deployment only sets the fields it changes. Invalid configuration fails
plugin load with an actionable error; the plugin never falls back silently.

## Fields

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `"in-memory"` \| `"control-plane"` | `"in-memory"` | Backend used by the nine canonical tools. |
| `baseUrl` | string | `""` | Control-plane origin. Required and validated in `control-plane` mode: absolute `http(s)` URL, no credentials embedded, trailing slash trimmed. |
| `token` | string (secret role) | `""` | Bearer token sent as `Authorization: Bearer <token>` on every control-plane request. Never logged or returned by the client. |
| `actorDid` | string | `""` | Sent as `X-Actor-DID`. Leave empty to let the service choose its actor (`system:console` in development, the token subject in production). |
| `timeoutMs` | number | `30000` | Per-request timeout in milliseconds; must be a positive finite number. |
| `allowInterventionExecution` | boolean | `false` | Control-plane only. Registers `execute_intervention`, which applies an intervention decision through the service. Requires `mode: control-plane`. |

The schema is available as `Config` and accepts `Config({})` (all defaults) or
`Config['~standard'].validate(value)`.

## Deployment examples

### Sandbox (default)

No configuration row is needed; the plugin's own `cordis.patch.yml` inserts the row with schema
defaults. An explicit row is equivalent:

```yaml
- id: trust-platform-tools
  config:
    mode: in-memory
```

The sandbox is useful for tool discovery, prompts and offline demos. Its decisions are **not**
authoritative and must not gate real payments.

### Development control plane

```yaml
- id: trust-platform-tools
  config:
    mode: control-plane
    baseUrl: http://127.0.0.1:8080
    timeoutMs: 30000
```

Development servers accept requests without a token and default the actor to `system:console`, which
bypasses task ownership checks. Set `actorDid` to the caller DID when the workflow creates tasks for a
specific requester; the task `requester_did`, entity `actor_did`, and `submitted_by` fields fall back to
`actorDid` where a tool allows it.

### Production control plane

```yaml
- id: trust-platform-tools
  config:
    mode: control-plane
    baseUrl: https://trust.internal.example
    token: <HS256 JWT>
    actorDid: did:trust:corp.example:agent-7
    timeoutMs: 15000
    allowInterventionExecution: false
```

Production requires a Bearer JWT; when `actorDid` is sent it must equal the token subject, otherwise the
service rejects the call (`403 ACTOR_MISMATCH`). Keep `allowInterventionExecution` off unless the
deployment is specifically trusted to execute intervention decisions.

### Enabling intervention execution

```yaml
- id: trust-platform-tools
  config:
    mode: control-plane
    baseUrl: https://trust.internal.example
    token: <HS256 JWT>
    allowInterventionExecution: true
```

`execute_intervention` calls `POST /v1/interventions/{id}/execute`. It applies the decision (the
service may change task state and reserve quota) and returns the service execution receipt. It does
not move funds by itself, but it is a state-changing operation, so it is opt-in and off by default.

## Validation errors

Configuration problems abort plugin load with messages such as:

- `mode "control-plane" requires config.baseUrl to be a non-empty absolute http(s) URL (got "...")`
- `mode "control-plane" requires config.baseUrl to be an absolute http(s) URL (got "...")`
  (relative URL or unsupported scheme)
- `mode "control-plane" requires config.baseUrl to be an absolute http(s) URL without embedded credentials`
- `allowInterventionExecution requires mode "control-plane"; the in-memory sandbox has no intervention execution endpoint`
- `timeoutMs must be a positive number of milliseconds`

Cordis' Schemastery validation additionally rejects unknown modes and wrong field types before
`apply` runs, for example: `$.mode expected "in-memory" | "control-plane" but got "sandbox"`.

## Request behaviour

The exported client (`@00ccf/dsh-trust-platform/client`) and the control-plane tools use it for every
call:

- **Fixed routes.** Only operations in the frozen `ROUTES` map are callable; there is no
  arbitrary-URL entry point.
- **Headers.** `Accept: application/json`, a fresh `X-Request-ID` per request, `X-Actor-DID` when
  configured, `Authorization: Bearer` when a token is configured and `Content-Type: application/json`
  on writes.
- **Idempotency.** Writes that require an idempotency key receive a generated `dsh-<uuid>`
  `Idempotency-Key` (overridable per call). Routes documented as idempotency-optional still get a
  generated key; routes that must not carry one (GETs, credential verification, knowledge search) do
  not.
- **Query parameters.** GET reads accept query parameters, `undefined` values are skipped.
- **Timeouts.** Every request carries `timeoutMs`; a timeout surfaces as `TRUST_TIMEOUT`
  (`retryable: true`).
- **Errors.** Non-2xx responses map the service's flat body
  `{error_code, message, request_id, retryable, evidence_refs, policy_version, details?}` onto a
  `ControlPlaneError` with the same fields. Transport failures become `TRUST_TRANSPORT_ERROR`,
  caller cancellation `TRUST_ABORTED`, unparseable success bodies `TRUST_INVALID_RESPONSE`.
  `retryable` is informational; the plugin does not retry writes automatically.

## Security semantics

- **No money movement.** No tool sends money, transfers, pays out or settles. `create_payment_task`
  records a task and `get_execution_receipt` reports `NOT_SETTLED`; in control-plane mode it returns
  `NOT_SUPPORTED` because the service exposes no receipt read endpoint.
- **No ALLOW without evidence.** `check_authorization` never returns `ALLOW` when the delegation
  record is missing, unreadable, incomplete, outside its validity window, revoked, scoped to another
  action/subject/asset, or over its limits. Such cases are `DENY` or `DEFER`, and `DEFER` cannot be
  used by `create_payment_task`, which requires an `ALLOW` authorization created in the same session.
- **Risk is not authorization.** `get_risk_decision` and `evaluate_remote_risk` report what the risk
  engine decided (`ALLOW`/`WARN`/`THROTTLE`/`STEP_UP`/`DEFER`/`BLOCK`/`FREEZE`); the canonical tool
  exposes `authorization_effect: "NONE"` and never creates an authorization.
- **UNKNOWN / NOT_EVALUABLE never pass.** Credential verification distinguishes `VALID`, `INVALID`,
  `UNKNOWN` and `NOT_EVALUABLE`; unsigned or unverified operation events report `UNKNOWN`, not
  `VALID`.
- **No attestation claims.** Evidence anchoring and settlement are service-side concepts; the plugin
  never claims an anchor is final or that settlement occurred.
- **Sandbox is not authoritative.** In-memory mode is a deterministic demo: it does not call the
  service and must not be treated as a trust decision. Every sandbox result says
  `source: "in-memory-sandbox"` / `authoritative: false`.
- **Actor identity.** In production the service binds the actor to the JWT subject; the plugin does
  not invent DIDs or tokens.

## Compatibility

- Harness: `engines.dsh` is `>=0.2.1-rc.3 <0.3.0`.
- Cordis peer dependency: `@deepseek-ai/cordis ~4.0.5`; tools are registered through the `tools`
  service and the client is provided as the `trustPlatformClient` service in control-plane mode.
- Runtime dependencies: `@deepseek-ai/dsh-tools` and `@deepseek-ai/schemastery`.
- The plugin has no default export; it exports `name`, `inject`, `Config` and `apply`.

## What this plugin does not do

- It does not send money, transfer assets, pay out, settle or reconcile value.
- It does not manage private keys, sign transactions or run a wallet.
- It does not replace the control plane's policy engine; it consumes its decisions.
- It does not cache authoritative decisions for later reuse across sessions; authorizations are
  session-local.
- It does not provide tools for DID rotation/status changes, credential status changes, policy or
  model publication, or evidence anchoring. Those mutations remain service-side operations outside
  this plugin's tool surface.
