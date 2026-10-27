# Control Plane API Contract (authoritative)

Derived by `cp-api` from the legacy FastAPI service source
(`code/services/control-plane/app/{main,config,errors,auth,schemas,service}.py`,
`app/api/*.py`), then **verified empirically against the live development
server**: `GET /openapi.json`, a 63-step happy path and 30 negative cases
driven over real HTTP (`tmp/cp-examples/`, all green). Corrections found while
verifying are listed in §13. Source wins over this doc; the OpenAPI document at
`tmp/cp-openapi.json` is the machine-readable snapshot.

- Service: `Cross-Border Agent Trust Platform` v0.1.0
- Dev base URL: `http://127.0.0.1:8080`
- All request/response bodies are JSON (`application/json`), except
  `GET /metrics` (text/plain).
- Every route under `/v1` is scoped by the **effective actor** (see Auth).
- **Money is a string.** All amounts are `Decimal`: requests may send
  `"1000.00"` / `"2000.00"` (strings; numeric also accepted), but responses
  serialize quantities as JSON **strings with 8 decimal places**:
  task `amount` = `"1000.00000000"`, delegation `amount_limit` =
  `"900.00000000"` / `daily_limit` = `"2000.00000000"`, receipt
  `amount_reserved` = `"100.00000000"`, admission `limits` =
  `{"single_amount":"1000000","daily_amount":"5000000"}`. Never parse money
  to a float for display/compare; keep the string.
- **Timestamps.** Most response datetimes are ISO-8601 **without** offset
  (naive, UTC server clock), e.g. `"2026-10-27T14:34:48.581102"`.
  Exceptions: operation-event `observed_at`/`event_time` end with `Z`
  (`"2026-10-27T14:34:48.684307Z"`) and `assistant` timeline `observed_at`
  uses `+00:00`. **Request** datetimes that are validated
  (`valid_from`/`valid_to`, `observed_at`, `event_time`,
  knowledge `effective_from`/`effective_to`) MUST be timezone-aware —
  sending a naive datetime currently crashes with a plain-text 500 (see
  §2.1 Known issues).
- `X-Request-ID`: optional request header. If absent the server generates a
  UUID. The effective value is echoed in the `X-Request-ID` response header
  and in every error body's `request_id`.

## 1. Auth, actor and required headers

| Situation | Requirement |
|---|---|
| `APP_ENV=development` (dev server, default) | `X-Actor-DID` optional. Effective actor = `X-Actor-DID` if non-empty, else **`system:console`**. `Authorization` is not required (and is ignored unless `MTLS_REQUIRED`). |
| `APP_ENV=production` | `Authorization: Bearer <HS256 JWT>` required on every route that depends on the actor. Claims: `sub` (or `actor_did`) must be present; `exp` enforced if present. If `X-Actor-DID` is also sent it MUST equal the token subject, otherwise `403 ACTOR_MISMATCH`. |
| `MTLS_REQUIRED=true` | Additionally `X-Spiffe-ID` header required (401 `MTLS_REQUIRED`); must equal `SPIFFE_ID` when configured (403 `SPIFFE_ID_INVALID`). |
| JWT algorithm | Must be `HS256`, signed with `ACCESS_TOKEN_SECRET` (the dev default value is defined in `app/config.py`; set the env var — do not ship secrets). Anything else → 401 `AUTHENTICATION_INVALID`. |
| All writes | `Idempotency-Key: <unique string>` — see per-operation table in §4. Missing → `400 IDEMPOTENCY_KEY_REQUIRED`. |

`system:*` actors (including the dev default `system:console`) bypass
ownership checks (`_require_claimed_actor`, `_require_identity_control`,
`_require_case_access`, `_require_task_access`), so the dev server lets a
single actor drive every happy path. A non-system actor DID must be a
registered `ACTIVE` DID for domain-scoped access.

Header set sent by the DSH plugin client today:
`Accept: application/json`, `X-Request-ID`, `X-Actor-DID`,
`Authorization` (only when a token is configured), and for non-GET:
`Content-Type: application/json`, `Idempotency-Key`.

### Idempotency semantics

- Same key + **same** request hash → cached resource replayed with the
  endpoint's normal success status; nothing is written twice.
- Same key + **different** body → `409 IDEMPOTENCY_CONFLICT`
  ("同一幂等键对应了不同请求").
- Header `Idempotency-Key` and event body field `idempotency_key` are
  reconciled for `POST /v1/events`: at least one required (400
  `IDEMPOTENCY_KEY_REQUIRED`), both present and different → `409`
  `IDEMPOTENCY_KEY_CONFLICT`.
- The plugin's client generates `dsh-<uuid>` per write; keep it stable across
  retries of the same logical call.

## 2. Error format (FLAT — not wrapped in `error`)

Every `ServiceError` is rendered by a custom exception handler as a **flat**
JSON object (HTTP status = `status_code`):

```json
{
  "error_code": "TASK_NOT_FOUND",
  "message": "支付任务不存在",
  "request_id": "5f0f…uuid",
  "retryable": false,
  "evidence_refs": [],
  "policy_version": "policy-2026-10-25-001"
}
```

> IMPORTANT for the plugin client: the error payload is the response body
> itself. Do **not** read `body.error`; read `body.error_code` /
> `body.message` / `body.retryable` directly. Messages are Chinese prose —
> branch on `error_code`, never on `message`.

Request body/query/header validation failures (pydantic) return **422**:

```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "请求参数校验失败",
  "request_id": "…",
  "retryable": false,
  "evidence_refs": [],
  "policy_version": "policy-2026-10-25-001",
  "details": [
    {"location": ["body", "amount"], "message": "Input should be greater than 0"}
  ]
}
```

`details[].location` is the pydantic loc list (e.g. `["body","field"]`,
`["header","idempotency-key"]`). `details` exists only on 422.

**Check order (verified, corrects the earlier source-only reading):** on a
write endpoint the `Idempotency-Key` dependency is resolved **before**
pydantic body validation. A write with both a missing key and an invalid
body returns **400 `IDEMPOTENCY_KEY_REQUIRED`**, not 422. Verified:
`POST /v1/tasks` with body `{}` and no key → 400. So always send a key;
422 then means the body itself is wrong. (**One exception:** a body that
raises inside a pydantic model *validator* — e.g. a naive datetime — is an
unhandled 500; see §2.1.)

### 2.1 Known issues / gotchas (verified against the live server)

1. **Naive datetime → plain-text 500.** `POST /v1/delegations` (and any
   request that runs the `DelegationCreateRequest.valid_window` validator,
   `app/schemas.py:148`) with a timezone-naive `valid_from`/`valid_to`
   returns HTTP 500 with body exactly `"Internal Server Error"`
   (`text/plain`), **no** flat error JSON and **no** `X-Request-ID` echo
   (the `TypeError: can't compare offset-naive and offset-aware datetimes`
   escapes the service error layer). Always send `+00:00`/`Z` datetimes.
2. There is no `INTERVENTION_NOT_FOUND`; executing an unknown decision is
   `404 DECISION_NOT_FOUND`.
3. `POST /v1/delegations/{id}/revoke` requires `status` to be a **valid
   task-status enum value** even though the value is ignored — `"REVOKED"`
   fails 422; send e.g. `"CLOSED"`.
4. `finality`/`status` mismatch is only rejected when `status` is present,
   `finality != "OBSERVED"`, and `status != finality` → 422
   `FINALITY_CONFLICT`. `finality:"OBSERVED"` + `status:"FINAL"` is accepted
   and `status` wins.
5. Dev mode deliberately accepts unsigned and even malformed-signature
   events (201); verification then reports `overall_status:"INVALID"`
   (`details.signature_ok=false`) — never `VALID`.

Common error codes (status ⇒ code). Statuses marked ✅ were reproduced against
the live dev server (`tmp/cp-examples/negative-cases-results.json`); the rest
come from source reading:

| Status | Codes |
|---|---|
| 400 | `IDEMPOTENCY_KEY_REQUIRED` ✅, `ASSET_SCOPE_MISMATCH` ✅, `CREDENTIAL_WINDOW_INVALID`, `TIMEZONE_REQUIRED` |
| 401 | `AUTHENTICATION_REQUIRED`, `AUTHENTICATION_INVALID`, `AUTHENTICATION_EXPIRED`, `MTLS_REQUIRED` |
| 403 | `ACCESS_DENIED` ✅, `ACTOR_MISMATCH` ✅, `ACTOR_NOT_FOUND` ✅, `ROOT_DELEGATION_ISSUER_INVALID` ✅, `REQUESTER_DOMAIN_MISMATCH` ✅, `SPIFFE_ID_INVALID`, `EVIDENCE_ACCESS_DENIED`, `REDELEGATION_FORBIDDEN` |
| 404 | `DID_NOT_FOUND` ✅, `TASK_NOT_FOUND` ✅, `CASE_NOT_FOUND` ✅, `REPORT_NOT_FOUND` ✅, `DELEGATION_NOT_FOUND` ✅, `DECISION_NOT_FOUND` ✅, `CREDENTIAL_NOT_FOUND`, `EVENT_NOT_FOUND`, `EVIDENCE_NOT_FOUND`, `KNOWLEDGE_DOCUMENT_NOT_FOUND`, `DOMAIN_NOT_FOUND`, `PARENT_DELEGATION_NOT_FOUND`, `ENTITY_NOT_FOUND`, `ASSET_NOT_FOUND` |
| 409 | `IDEMPOTENCY_CONFLICT` ✅, `SOURCE_REF_CONFLICT` ✅, `EVIDENCE_CONTENT_CONFLICT` ✅, `QUOTA_SCOPE_EXCEEDED` ✅, `TASK_STATE_TRANSITION_INVALID` ✅, `DID_INACTIVE`, `DID_KEY_MISMATCH`, `DID_STATUS_TRANSITION_INVALID`, `CREDENTIAL_STATUS_TRANSITION_INVALID`, `DELEGATION_EXPIRED`, `ACTION_SCOPE_EXCEEDED`, `TIME_SCOPE_EXCEEDED`, `REDELEGATION_FORBIDDEN`, `DELEGATION_ISSUER_MISMATCH`, `EVENT_ID_CONFLICT`, `DUPLICATE_MESSAGE`, `EVENT_TASK_MISMATCH`, `CASE_TASK_MISMATCH`, `CASE_SNAPSHOT_NOT_FOUND`, `ASSET_CONSERVATION_VIOLATION`, `QUOTA_EXCEEDED`, `POLICY_VERSION_CONFLICT`, `MODEL_VERSION_CONFLICT` |
| 422 | `VALIDATION_ERROR` ✅, `ACTION_NOT_SUPPORTED` ✅, `FINALITY_CONFLICT` ✅, `CONTENT_HASH_MISMATCH` ✅, `SIGNATURE_ALGORITHM_UNSUPPORTED`, `KNOWLEDGE_WINDOW_INVALID` |
| 500 | unhandled validator `TypeError` → plain text `"Internal Server Error"` ✅ (bug, see §2.1); `IDEMPOTENCY_RESOURCE_MISSING` (flat, retryable true) |
| 503 | `KEY_PROVISIONING_FAILED`, `ISSUER_KEY_UNAVAILABLE`, `OBJECT_STORE_UNAVAILABLE`, `QUOTA_STORE_UNAVAILABLE`, `SCHEMA_REGISTRY_UNAVAILABLE`, `GRAPH_STORE_UNAVAILABLE` (retryable true) |

## 3. System / health

### GET /health — 200 (no headers needed)
```json
{"status":"ok","service":"cross-border-agent-trust-platform","environment":"development","schema_revision":"b7c8d9e0f1a2"}
```
### GET /ready — 200 / 503
```json
{"status":"ready","checks":{"database":"ok","quota":"ok"}}
```
503 body: `{"status":"not_ready","checks":{"error":"…"}}`.
### GET /metrics — 200 text/plain Prometheus counters/latency.
(`/health`, `/ready`, `/metrics` are **not** under `/v1`.)

## 4. Operations

`Idem` column: **R** = `Idempotency-Key` header required, **O** = optional,
**–** = not required. `Actor` column: whether the handler resolves the
effective actor from `X-Actor-DID`/Bearer (all such handlers accept
`system:console` default in dev). Success status shown as `→ code`.

### 4.1 Identity — prefix `/v1/dids`

| Op | Method + path | Idem | Actor | Success |
|---|---|---|---|---|
| Register DID | `POST /v1/dids/register` | O (derived from body when absent) | no | 201 |
| List DIDs | `GET /v1/dids` | – | yes | 200 |
| Get DID | `GET /v1/dids/{did}` | – | no | 200 |
| List DID keys | `GET /v1/dids/{did}/keys` | – | no | 200 |
| Rotate key | `POST /v1/dids/{did}/rotate` | R | yes | 200 |
| Set status | `POST /v1/dids/{did}/status` | R | yes | 200 |
| Admission evaluate | `POST /v1/dids/admission` | R | yes | 201 |

Paths use Starlette's `{did:path}` converter, so DIDs (which contain `:` and
may contain `/`) can be sent raw in the path, e.g.
`GET /v1/dids/did:trust:payments.example:issuer-01`. Percent-encoding the
colons also works. DID format: **`did:trust:{domain_id}:{subject_id}`**.

`POST /v1/dids/register` request (required: `domain_id`, `subject_id`,
`display_name`):
```json
{"domain_id":"payments.example","subject_id":"issuer-01",
 "display_name":"Payments Issuer","jurisdiction":"CN"}
```
optional: `jurisdiction` (default `"CN"`, 2–40 chars), `public_key`,
`private_key` (base64url Ed25519 raw keys; omit to let the server generate).
Response `DIDRegisterResponse`:
`did, domain_id, document (W3C DID document dict), status ("ACTIVE"), dev_private_key`.
`dev_private_key` is base64url Ed25519 private key and is populated **only
when `APP_ENV=development`** (null elsewhere). Idempotent replay returns the
same DID and same key. Errors: `409 DID_KEY_MISMATCH`, `503
KEY_PROVISIONING_FAILED`.

`GET /v1/dids` → list of `DIDResponse`:
`did, domain_id, document, public_key, status, updated_at`.
`GET /v1/dids/{did}` → one `DIDResponse`. 404 `DID_NOT_FOUND`.

`GET /v1/dids/{did}/keys` → list of `DIDKeyResponse`:
`id, did, key_id, public_key, status, effective_at, retired_at, reason,
evidence_refs`.

`POST /v1/dids/{did}/rotate` body: `{public_key?, private_key?, reason
(3–1000, required)}` → **200** `DIDRegisterResponse`. Verified: the response
includes the rotated `document` (new verification method `#key-2`,
`publicKeyMultibase`, `updated_at` with `+00:00`) and, in development, a new
`dev_private_key`; it has **no** top-level `public_key`. Errors 404
`DID_NOT_FOUND`, 409 `DID_INACTIVE`, 503 `KEY_PROVISIONING_FAILED`.

`POST /v1/dids/{did}/status` body:
`{status: "ACTIVE"|"SUSPENDED"|"REVOKED", reason (3–1000)}` → 200
`DIDResponse` (`did, domain_id, document, public_key, status, updated_at`,
naive `updated_at`). Errors 404 `DID_NOT_FOUND`, 409
`DID_STATUS_TRANSITION_INVALID`, 403 `ACCESS_DENIED` (non-system actor ≠
target DID). Verified lifecycle: `SUSPENDED` → `ACTIVE` works.

`POST /v1/dids/register` under the hood auto-creates the `TrustDomain` row for
`domain_id` (idempotently) — a later `POST /v1/tasks` for that domain then
passes the domain existence check, but the requester DID must belong to it
(§4.4).

`POST /v1/dids/admission` request (required: `did`):
```json
{"did":"did:trust:payments.example:subject-01",
 "policy_version":"policy-2026-10-25-001",
 "required_actions":["PAYREQ"],
 "jurisdiction":"CN"}
```
all fields except `did` optional (`required_actions` default `[]`,
`jurisdiction` default null). Response `AdmissionResponse`:
`id, did, domain_id, status ("ALLOW"|"DEFER"|"BLOCK"|"UNKNOWN"),
trust_score (float 0..1), allowed_actions (list), limits (dict), evidence_refs,
policy_version, created_at`.
Semantics: needs an `ACTIVE` `AgentRegistrationCredential` credential on the
subject (claims may carry `capabilities[]`, `jurisdiction`):
no credentials → `UNKNOWN`; credentials but no registration credential
→ `DEFER`; requested actions outside credential capabilities or jurisdiction
mismatch → `BLOCK` (score 0.1); else `ALLOW` (0.95). Errors 404
`DID_NOT_FOUND`, 409 `DID_INACTIVE`, 403 `ACCESS_DENIED`.

### 4.2 Credentials — prefix `/v1/credentials`

| Op | Method + path | Idem | Actor | Success |
|---|---|---|---|---|
| Issue | `POST /v1/credentials/issue` | R | yes | 201 |
| Get | `GET /v1/credentials/{credential_id}` | – | no | 200 |
| Verify | `POST /v1/credentials/verify` | – (no idem dep) | no | 200 |
| Set status | `POST /v1/credentials/{credential_id}/status` | R | yes | 200 |
| Status history | `GET /v1/credentials/{credential_id}/status` | – | no | 200 |

`POST /v1/credentials/issue` request (required: `credential_type`,
`issuer_did`, `subject_did`):
```json
{"credential_type":"AgentRegistrationCredential",
 "issuer_did":"did:trust:payments.example:issuer-01",
 "subject_did":"did:trust:payments.example:subject-01",
 "claims":{"capabilities":["PAYREQ","RESULT"],"jurisdiction":"CN"},
 "valid_to":"2027-10-25T00:00:00+00:00"}
```
optional `claims` (dict, default `{}`), `valid_from`/`valid_to` (defaults:
now / now+365d; `valid_to > valid_from` else 400
`CREDENTIAL_WINDOW_INVALID`). Issuer DID and subject DID must exist and be
`ACTIVE` (404/409). Non-system actor must equal `issuer_did` (403
`ACCESS_DENIED`). The issuer private key must be in the key provider (dev:
memory; otherwise 503 `ISSUER_KEY_UNAVAILABLE`).

Response `CredentialResponse`:
`id, credential_type, issuer_did, subject_did, claims, proof (dict),
valid_from, valid_to, status ("ACTIVE"), credential`.
`credential` is the full W3C VC dict:
```json
{"@context":["https://www.w3.org/2018/credentials/v1"],
 "id":"vc_…",
 "type":["VerifiableCredential","AgentRegistrationCredential"],
 "issuer":"did:trust:…:issuer-01",
 "issuanceDate":"2026-10-27T…","expirationDate":"2027-10-25T…",
 "credentialSubject":{"id":"did:trust:…:subject-01","capabilities":["PAYREQ","RESULT"],"jurisdiction":"CN"},
 "proof":{"type":"Ed25519Signature2020","proofValue":"<base64url>"}}
```
Pass this whole `credential` object to verify.

`POST /v1/credentials/verify` request (required: `credential`):
```json
{"credential": { …full W3C VC dict from issue… },
 "required_claims":["capabilities"]}
```
No `Idempotency-Key` needed (handler has no idempotency dependency) and no
actor dependency. Response `CredentialVerifyResponse`:
`valid (bool), status ("VALID"|"INVALID"|"UNKNOWN"|"NOT_EVALUABLE"),
issuer_did, subject_did, evidence_refs (list[str]), reasons (list[str])`.
Semantics: missing `issuer`/`credentialSubject.id`/`proof` →
`valid=false, status=NOT_EVALUABLE`; unknown issuer DID → `UNKNOWN`; issuer
not ACTIVE → `INVALID`; bad Ed25519 proof, expired `expirationDate`, missing
`required_claims`, or stored credential status ≠ ACTIVE → `INVALID` with
reasons. Never silently returns VALID for tampered proof.

`POST /v1/credentials/{credential_id}/status` request:
```json
{"status":"SUSPENDED","reason":"compliance hold","actor_did":"did:trust:…:issuer-01"}
```
`actor_did` is **required**. Must equal the effective actor (unless actor is
`system:*`) and must be the issuer DID (or `system:*`) → else 403. Response
`CredentialStatusResponse`: `credential_id, status, reason, effective_at,
evidence_refs`. Allowed transitions: ACTIVE→{ACTIVE,SUSPENDED,REVOKED},
SUSPENDED→{ACTIVE,SUSPENDED,REVOKED}, REVOKED→{REVOKED}; else 409
`CREDENTIAL_STATUS_TRANSITION_INVALID`. 404 `CREDENTIAL_NOT_FOUND`.

`GET /v1/credentials/{id}/status` → list of `CredentialStatusResponse`
(newest first).

### 4.3 Delegations — prefix `/v1/delegations`

| Op | Method + path | Idem | Actor | Success |
|---|---|---|---|---|
| Create | `POST /v1/delegations` | R | yes | 201 |
| List | `GET /v1/delegations?task_id=` | – | yes | 200 |
| Get | `GET /v1/delegations/{delegation_id}` | – | yes | 200 |
| Revoke | `POST /v1/delegations/{delegation_id}/revoke` | R | yes | 200 |

`POST /v1/delegations` request (required: `task_id`, `issuer_did`,
`subject_did`, `actions`, `asset_id`, `amount_limit`, `daily_limit`,
`valid_from`, `valid_to`):
```json
{"task_id":"task_…",
 "issuer_did":"did:trust:payments.example:subject-01",
 "subject_did":"did:trust:payments.example:agent-02",
 "actions":["PAYREQ","RESULT"],
 "asset_id":"USD",
 "amount_limit":"900.00","daily_limit":"2000.00",
 "valid_from":"2026-10-27T00:00:00+00:00",
 "valid_to":"2026-11-27T00:00:00+00:00"}
```
optional: `parent_id`, `can_redelegate` (default false), `claims` (dict).
`actions` are normalized to sorted UPPER-case; supported:
`DELEGATE,QUOTE,SELECT,PAYREQ,RESULT,BRIDGE,SETTLE` (unknown → 422
`ACTION_NOT_SUPPORTED`). `valid_from`/`valid_to` **must carry a timezone**
(naive → 400 `TIMEZONE_REQUIRED`), `valid_to > now` else 409
`DELEGATION_EXPIRED`, `valid_to > valid_from` (422 from pydantic).
Cross-checks: task must exist (404); `asset_id == task.asset_id` else 400
`ASSET_SCOPE_MISMATCH`; issuer/subject DIDs must exist and be ACTIVE;
`amount_limit <= task.amount` else 409 `QUOTA_SCOPE_EXCEEDED`; root
delegation (`parent_id=null`) issuer must equal `task.requester_did` else 403
`ROOT_DELEGATION_ISSUER_INVALID`; parent delegation rules if `parent_id`
set (409 `REDELEGATION_FORBIDDEN`, `ACTION_SCOPE_EXCEEDED`,
`QUOTA_SCOPE_EXCEEDED`, `TIME_SCOPE_EXCEEDED`, `DELEGATION_ISSUER_MISMATCH`;
404 `PARENT_DELEGATION_NOT_FOUND`). A non-system actor must equal
`issuer_did` (403 `ACTOR_MISMATCH`) — the dev `system:console` bypasses this.

Response `DelegationResponse`:
`id, task_id, issuer_did, subject_did, actions, asset_id, amount_limit,
daily_limit, valid_from, valid_to, parent_id, can_redelegate, status
("ACTIVE")`.

`GET /v1/delegations?task_id=<optional>` → list of `DelegationResponse`
(actor-domain scoped; system actor sees all).
`GET /v1/delegations/{id}` → `DelegationResponse`; 404
`DELEGATION_NOT_FOUND` (or 404 `TASK_NOT_FOUND` for dangling task).

`POST /v1/delegations/{id}/revoke` request — **quirk**: the handler reuses
`TaskTransitionRequest`, so `status` is a required field even though only
`reason` is used. The value must still be a valid **task-status enum value**
(any of them; it is ignored) — `"REVOKED"` is NOT valid and returns 422
`VALIDATION_ERROR` (verified). Send:
```json
{"status":"CLOSED","reason":"revoked by policy"}
```
→ 200 `DelegationResponse` with `status:"REVOKED"`, amounts as strings
(`"900.00000000"` / `"2000.00000000"`), naive `valid_from`/`valid_to`.
404 `DELEGATION_NOT_FOUND`.

### 4.4 Payment tasks — prefix `/v1/tasks`

| Op | Method + path | Idem | Actor | Success |
|---|---|---|---|---|
| Create | `POST /v1/tasks` | R | yes | 201 |
| List | `GET /v1/tasks` | – | yes | 200 |
| Get | `GET /v1/tasks/{task_id}` | – | yes | 200 |
| Transition | `POST /v1/tasks/{task_id}/transition` | R | yes | 200 |

`POST /v1/tasks` request (required: `domain_id`, `requester_did`,
`asset_id`, `amount`, `beneficiary`):
```json
{"domain_id":"payments.example",
 "requester_did":"did:trust:payments.example:subject-01",
 "asset_id":"USD","amount":"1000.00",
 "beneficiary":"beneficiary-entity-001",
 "metadata":{"purpose":"cross-border settlement"}}
```
optional `policy_version` (default `"policy-2026-10-25-001"`), `metadata`
(dict). Errors: 404 `DOMAIN_NOT_FOUND` (domain must have been bootstrapped by
a DID registration), 403 `REQUESTER_DOMAIN_MISMATCH` (requester DID not in
that domain), 404 `DID_NOT_FOUND` if requester DID unknown.

Response `PaymentTaskResponse`:
`id, domain_id, requester_did, asset_id, amount, beneficiary, status
("CREATED"), policy_version, metadata, created_at, updated_at`.

`GET /v1/tasks` → list; `GET /v1/tasks/{id}` → one (404 `TASK_NOT_FOUND`,
403 `ACCESS_DENIED` for out-of-domain non-system actor).
`POST /v1/tasks/{id}/transition` request:
```json
{"status":"AUTHORIZED","reason":"delegation validated"}
```
`status` enum: `CREATED, AUTHORIZED, DELEGATING, QUOTING, SELECTED,
PAYREQ_PENDING, SUBMITTED, CONFIRMED, AUDITED, CLOSED, FAILED, BLOCKED,
DEFERRED, THROTTLED, PENDING_STEP_UP, CANCELLED`; `reason` 3–1000 chars.
Invalid transition → 409 `TASK_STATE_TRANSITION_INVALID`. 404
`TASK_NOT_FOUND`.

### 4.5 Operation events — prefix `/v1/events`

| Op | Method + path | Idem | Actor | Success |
|---|---|---|---|---|
| Ingest | `POST /v1/events` | R (header or body `idempotency_key`) | yes | 201 |
| List | `GET /v1/events?task_id=` | – | yes | 200 |
| Get | `GET /v1/events/{event_id}` | – | yes | 200 |
| Verify | `POST /v1/events/{event_id}/verify` | O | yes | 200 |
| Stream | `GET /v1/events/stream` | – | yes | 200 SSE |

`POST /v1/events` request (required: `task_id`, `event_type`, `actor_did`,
`source_ref`):
```json
{"task_id":"task_…","event_type":"PAYREQ",
 "actor_did":"did:trust:payments.example:agent-02",
 "source_ref":"ledger:tx:0001",
 "payload":{"amount":"100.00","beneficiary":"beneficiary-entity-001"},
 "finality":"OBSERVED",
 "observed_at":"2026-10-27T12:00:00+00:00"}
```
optional: `event_id` (must start `evt_`, min 6 chars, else 422),
`payload` (dict), `signature` (string OR `{key_id, algorithm (default
Ed25519), value}`), `finality`/`status` (`OBSERVED|CONFIRMED|FINAL`, default
OBSERVED; mismatch rule: only when `status` is present, `finality` is not
`OBSERVED`, and `status != finality` → 422 `FINALITY_CONFLICT`;
`finality:"OBSERVED"` + `status:"FINAL"` is accepted with `status` winning)
— verified above. `event_time`, `observed_at` (**must be timezone-aware**
→ else 400 `TIMEZONE_REQUIRED`), `schema_version` (default
`operation-event.v1`), `idempotency_key` (alternative to header),
`trace_id`, `counterparty_did`, `predecessors`, `evidence_refs`,
`source_ledger`, `policy_version`.
Dev mode has `DEV_ALLOW_UNSIGNED_EVENTS=true`, so unsigned **and even
malformed-signature** events are accepted (201) and stored as-is. Verification
then reports `overall_status:"INVALID"` with `details.signature_ok=false` —
never silent VALID. Errors: 404 `TASK_NOT_FOUND`, 409
`SOURCE_REF_CONFLICT` (re-using the same `source_ref` on the same task),
409 `EVENT_ID_CONFLICT`, 409 `DUPLICATE_MESSAGE` (duplicate
`trace_id`/`message_id` pair), 422 `SIGNATURE_ALGORITHM_UNSUPPORTED`.

Response `OperationEventResponse`:
`id, task_id, event_type, actor_did, payload, signature (string|null),
signature_detail ({key_id,algorithm,value}|null), source_ref, finality,
status (null|enum), event_time, observed_at, idempotency_key (echo),
verification (null | VerificationResponse), schema_version, trace_id,
counterparty_did, predecessors, evidence_refs, source_ledger, message_id,
policy_version`.

`GET /v1/events?task_id=` → list; `GET /v1/events/{id}` → one (404
`EVENT_NOT_FOUND`, 404 `TASK_NOT_FOUND`, 403 `ACCESS_DENIED`).

`POST /v1/events/{event_id}/verify` — **empty JSON body `{}`** (no body
schema; header `Idempotency-Key` optional; server derives
`legacy-verify-<event_id>` when absent) → `VerificationResponse`:
`id (int), event_id, identity_status, authorization_status, ledger_status,
overall_status, evidence_refs, policy_version, details (dict)`.
`overall_status` ∈ `VALID | INVALID | UNKNOWN | NOT_EVALUABLE`. Verified:
- unsigned dev event → `{"id":1,"overall_status":"UNKNOWN","identity_status":"UNKNOWN","authorization_status":"VALID","ledger_status":"UNKNOWN","details":{"signature_ok":false,"invariant_errors":[],"ledger":{}}}`;
- malformed signature string → `id` int, `overall_status:"INVALID"`,
  `identity_status:"INVALID"`, `authorization_status:"INVALID"`,
  `ledger_status:"UNKNOWN"`, `details.signature_ok:false`,
  `details.invariant_errors` may be non-empty (e.g. `["金额必须为正数"]`),
  `evidence_refs` holds 2 sha256 hashes.
An unsigned dev event must **never** be reported as `VALID` — assert this in
integration tests. 404 `EVENT_NOT_FOUND`.

### 4.6 Evidence — prefix `/v1/evidence`

| Op | Method + path | Idem | Actor | Success |
|---|---|---|---|---|
| Ingest | `POST /v1/evidence` | R | yes | 201 |
| Get | `GET /v1/evidence/{evidence_id}` | – | yes | 200 |
| Anchor | `POST /v1/evidence/{evidence_id}/anchor` | R | yes | 200 |
| Anchors | `GET /v1/evidence/{evidence_id}/anchors` | – | yes | 200 |

`POST /v1/evidence` request (required: `source_type`, `source_ref`,
`content_hash`):
```json
{"case_id":"case_…","source_type":"BANK_STATEMENT",
 "source_ref":"statement:2026-10-27:001",
 "content_hash":"<sha256 hex, 16–128 chars>",
 "content":"optional raw text to hash-check (≤10MB)",
 "metadata":{"jurisdiction":"CN"}}
```
optional: `case_id`, `sm3_hash`, `content`, `storage_uri`, `metadata`.
If `content` is provided its sha256 must equal `content_hash` (422
`CONTENT_HASH_MISMATCH`). Writes are inline in dev (`OBJECT_STORE_MODE=inline`).
Errors 404 `CASE_NOT_FOUND`, 409 `EVIDENCE_CONTENT_CONFLICT`.
Response `EvidenceResponse`:
`id, evidence_type (=source_type), source_ref, content_hash,
status ("REGISTERED"), details ({case_id, storage_uri, sm3_hash, metadata}),
created_at`.

`GET /v1/evidence/{id}` → `EvidenceResponse`; 404 `EVIDENCE_NOT_FOUND`, 403
`EVIDENCE_ACCESS_DENIED`.
`POST /v1/evidence/{id}/anchor` → 200 `AnchorResponse`:
`id, evidence_id, chain_id, tx_id, anchor_hash, sha256_hash, sm3_hash,
source_ref, captured_at, status, attempts, last_error, created_at`.
Verified in the running dev instance (`APP_ENV=development`,
`CHAINMAKER_ENABLED=false`): the anchor is recorded **locally and reported as
`status:"CONFIRMED"`** with `chain_id:"local-chain"`, `tx_id:"local:…"`,
`attempts:0`, `last_error:null` — the dev server simulates an anchor, it does
not talk to a real chain. Do not infer external chain finality from it in
production-like environments; in a real deployment the reconciler updates it.
Errors 404 `EVIDENCE_NOT_FOUND`.
`GET /v1/evidence/{id}/anchors` → list of `AnchorResponse` (newest first).

### 4.7 Risk — prefix `/v1/risk`

| Op | Method + path | Idem | Actor | Success |
|---|---|---|---|---|
| Evaluate | `POST /v1/risk/evaluate` | O | yes | 200 |
| Evidence list | `GET /v1/risk/evidence?task_id=` | – | yes | 200 |

`POST /v1/risk/evaluate` request (required: `task_id`, **`subject_did`**):
```json
{"task_id":"task_…","subject_did":"did:trust:payments.example:agent-02",
 "event_id":"evt_…",
 "features":{"velocity":0.2,"amount_deviation":0.7,"new_counterparty":true,"cross_chain_hops":0.1},
 "policy_version":"policy-2026-10-25-001",
 "model_version":"rules-2026-10-25-001"}
```
`event_id` optional (must belong to the task), `features` optional dict.
Only the feature keys `velocity, amount_deviation, new_counterparty,
cross_chain_hops, identity_unknown` (weights 0.25/0.25/0.2/0.15/0.15) affect
`score`; unknown keys pass through in `feature`. No usable features →
`evaluation_status=NOT_EVALUABLE` → `decision=DEFER`. Decision ladder:
`BLOCK` ≥0.8, `DEFER` ≥0.6, `THROTTLE` ≥0.4, else `ALLOW`; if the linked
event verification is not VALID → `identity_unknown=1` and status
`UNKNOWN`/`VALID` (INVALID ⇒ `BLOCK`). Response `RiskResponse`:
`evidence_id, trust_snapshot_id, score (risk 0..1), trust_score (1-score),
decision, reasons, feature, evaluation_status (VALID|NOT_EVALUABLE|UNKNOWN),
policy_version, model_version`. Verified response shape (features
`velocity .3, amount_deviation .9, new_counterparty true, cross_chain_hops .2`
→ `score 0.68`):
```json
{"evidence_id":"risk_…","trust_snapshot_id":"trust_…","score":0.68,
 "trust_score":0.32,"decision":"DEFER","reasons":["…中文…"],
 "feature":{"velocity":0.3,"amount_deviation":0.9,"new_counterparty":true,
            "cross_chain_hops":0.2,
            "_evaluation_status":"UNKNOWN","_decision":"DEFER"},
 "evaluation_status":"UNKNOWN","policy_version":"policy-2026-10-25-001",
 "model_version":"rules-2026-10-25-001"}
```
Note the extra `feature._evaluation_status` / `feature._decision` keys and
that `reasons` are Chinese prose (branch on enum values, not text).
Errors: 404 `TASK_NOT_FOUND`, 409 `EVENT_TASK_MISMATCH`, 404 `DID_NOT_FOUND`.

`GET /v1/risk/evidence?task_id=<optional>` → list of
`RiskEvidenceResponse`:
`id, task_id, event_id, score, decision, reasons, feature,
evaluation_status, policy_version, model_version, created_at`.

### 4.8 Interventions — prefix `/v1/interventions`

| Op | Method + path | Idem | Actor | Success |
|---|---|---|---|---|
| Decide | `POST /v1/interventions/decide` | R | yes | 201 |
| List | `GET /v1/interventions` | – | yes | 200 |
| Execute | `POST /v1/interventions/{decision_id}/execute` | O | yes | 200 |

`POST /v1/interventions/decide` request (required: `task_id`, `action`):
```json
{"task_id":"task_…","event_id":"evt_…",
 "action":"STEP_UP",
 "rationale":{"reason":"amount above threshold","risk_evidence":"risk_…"},
 "policy_version":"policy-2026-10-25-001"}
```
`action` ∈ `ALLOW,WARN,THROTTLE,STEP_UP,DEFER,BLOCK,FREEZE`.
**`rationale` is a dict** (default `{}`) — sending a plain string returns
422. Response `InterventionResponse`:
`id, task_id, event_id, action, rationale, policy_version, status,
created_at` — verified: `rationale` is **echoed and enriched** with
`requested_action`, `effective_action`, `decision_reasons[]`, `opa{}`, while
`status` is `"DECIDED"`; `id` is `dec_…`. 201. 404 `TASK_NOT_FOUND`, 409
`EVENT_TASK_MISMATCH`.

`GET /v1/interventions` → list of `InterventionResponse` (newest first,
actor-scoped).

`POST /v1/interventions/{id}/execute` — empty JSON body accepted
(`{}`); Idempotency-Key optional. → 200 `ExecutionReceiptResponse`.
Verified body keys: `id, decision_id, task_id, action, status, external_ref,
amount_reserved, details, target_system, operation_id, applied_at,
applied_state, target_tx_hash, error_code, signature, quota_key` — **no
`created_at`** in the response (the OpenAPI schema name is legacy).
Verified for `STEP_UP`: `status:"APPLIED"`, `external_ref:"gateway:<hex>"`,
`amount_reserved:"100.00000000"`, `applied_state:"PENDING_STEP_UP"` (the task
status is moved to it), `target_system:"execution-gateway"`,
`details{deterministic,policy_version,applied_state,transfer_id,applied_at,
target_system,operation_id,target_tx_hash,quota_key,quota_reservation_id,
signature_algorithm:"SHA-256/Ed25519-boundary"}`, `error_code:null`,
`signature:"sha256:<hex>"`. Idempotent per `decision_id`.
Errors 404 `DECISION_NOT_FOUND`/`TASK_NOT_FOUND`, 409
`TASK_STATE_TRANSITION_INVALID` (receipt cannot move task from its state),
409 `ASSET_CONSERVATION_VIOLATION`, 409 `QUOTA_EXCEEDED`, 503
`QUOTA_STORE_UNAVAILABLE`.

### 4.9 Cases (traceability) — prefix `/v1/cases`

| Op | Method + path | Idem | Actor | Success |
|---|---|---|---|---|
| Trace/create case | `POST /v1/cases/trace/{task_id}` | O | yes | 201 |
| List | `GET /v1/cases` | – | yes | 200 |
| Get | `GET /v1/cases/{case_id}` | – | yes | 200 |
| Trace snapshot | `GET /v1/cases/{case_id}/trace` | – | yes | 200 |
| Graph | `GET /v1/cases/{case_id}/graph` | – | yes | 200 |

`POST /v1/cases/trace/{task_id}` — **no body** (optional empty `{}` is
fine), Idempotency-Key optional (derived `legacy-trace-<task_id>` when
absent). Creates (or reuses) the OPEN case for a task and a new snapshot.
→ 201 `CaseResponse`:
`id, task_id, status ("OPEN"), scope (dict), policy_version, model_version,
created_at, snapshot`.
`snapshot` = `{id, graph_version, evidence_ids[], paths[], residuals[],
coverage (0..1 float), filters{}, created_at}`; coverage is 1.0 only when all
events are CONFIRMED/FINAL, else 0.5 (events present) or 0. Verified with one
`OBSERVED` event: `coverage:0.5`, `paths[0] = {"event_id","from",
"to","asset_id","amount":"100.00","confidence":0.6,"evidence_refs":[]}`,
`residuals[0] = {"asset_id":"USD","reason":"未达到最终性"}`,
`model_version:"trace-rules-2026-10-25-001"`.
Errors 404 `TASK_NOT_FOUND`.

`GET /v1/cases` → list of `CaseResponse`; `GET /v1/cases/{id}` and
`GET /v1/cases/{id}/trace` → same `CaseResponse`; 404 `CASE_NOT_FOUND`, 403
`ACCESS_DENIED`.
`GET /v1/cases/{id}/graph` → `GraphResponse`:
`case_id, snapshot_id, nodes[] ({id, entity_type, canonical_ref,
attributes}), edges[] ({id, source_entity_id, target_entity_id, relation,
certainty, confidence, evidence_refs, valid_from, valid_to,
model_version})`; 404 `CASE_NOT_FOUND`, 503 `GRAPH_STORE_UNAVAILABLE`.

### 4.10 Reports — router prefix is `/v1` (NOT `/v1/reports`)

| Op | Method + path | Idem | Actor | Success |
|---|---|---|---|---|
| Create | `POST /v1/cases/{case_id}/report` | R | yes | 201 |
| Get | `GET /v1/reports/{report_id}` | – | yes | 200 |
| List for case | `GET /v1/cases/{case_id}/reports` | – | yes | 200 |

`POST /v1/cases/{case_id}/report` — **no body** (omit; empty `{}` also
accepted); Header `Idempotency-Key` required (R). Creates an immutable report
snapshot from the case + latest trace snapshot. → 201 `ReportResponse`:
`id, case_id, case_snapshot_id, content (dict), evidence_refs, policy_version,
model_version, generated_by, created_at`. Verified `content` keys:
`verified_facts[]` (`{event_id, statement:"事件已登记并进入追踪快照",
evidence_refs[]}`), `algorithmic_candidates[]` (= snapshot `paths` with
string amounts, confidence 0.6 for OBSERVED), `unresolved_items[]`
(`{asset_id, reason:"未达到最终性"}`), `human_findings[]`, `coverage:0.5`;
`generated_by` = effective actor (`"system:console"` in dev); `evidence_refs`
holds the event ids used by the snapshot (verified non-empty when the snapshot
has paths); `model_version:"trace-rules-2026-10-25-001"`. Errors 404
`CASE_NOT_FOUND` (verified), 409 `CASE_SNAPSHOT_NOT_FOUND` when the case has
no trace snapshot (call `POST /v1/cases/trace/{task_id}` first).
`GET /v1/reports/{report_id}` → `ReportResponse` (404 `REPORT_NOT_FOUND`).
`GET /v1/cases/{case_id}/reports` → list of `ReportResponse`.

### 4.11 Governance / feedback — prefix `/v1/feedback`

| Op | Method + path | Idem | Actor | Success |
|---|---|---|---|---|
| Submit feedback | `POST /v1/feedback` | R | yes | 201 |
| Publish policy | `POST /v1/feedback/policies` | R | yes | 201 |
| List policies | `GET /v1/feedback/policies?domain_id=` | – | no | 200 |
| Publish model | `POST /v1/feedback/models` | R | yes | 201 |
| List models | `GET /v1/feedback/models?model_name=` | – | no | 200 |

`POST /v1/feedback` request (required: `label`, `reason`, `submitted_by`):
```json
{"case_id":"case_…","subject_did":"did:trust:…:agent-02",
 "label":"CONFIRMED","reason":"risk decision validated by analyst",
 "evidence_refs":["ev_…"],"submitted_by":"system:console"}
```
`label` ∈ `CONFIRMED | FALSE_POSITIVE | WITHDRAWN | NEEDS_MORE_EVIDENCE`;
`reason` 3–4000; `submitted_by` 2–250 — **required**, and for a non-system
actor it must equal the effective actor (403 `ACTOR_MISMATCH`). `case_id`,
`subject_did`, `evidence_refs` optional. Side effect: labels
CONFIRMED/FALSE_POSITIVE/WITHDRAWN resolve the case. Response 201:
`{"feedback_id":"feedback_…","status":"RECORDED"}`. Errors 404
`CASE_NOT_FOUND`, 404 `EVIDENCE_NOT_FOUND`.

`POST /v1/feedback/policies` request (required: `policy_id`, `domain_id`,
`version`, `package`, `signed_by`):
`{"policy_id":"risk-policy","domain_id":"payments.example","version":"2026-10-27.1","package":{"rules":[...]},"package_uri":"inline://policy","signed_by":"system:console"}`;
optional `signature`, `rollback_version`. `signed_by` must equal the actor
for non-system actors (403 `ACTOR_MISMATCH`); same version+different digest →
409 `POLICY_VERSION_CONFLICT`. → `PolicyResponse`: `id, domain_id, digest,
package_uri, status, signed_by, created_at`.
`GET /v1/feedback/policies?domain_id=` → list of `PolicyResponse`.

`POST /v1/feedback/models` request (required: `model_id`, `model_name`,
`digest` 16–128, `artifact_uri`, `signed_by`): optional `metrics` dict.
→ `ModelResponse`: `id, model_name, digest, artifact_uri, status, metrics,
created_at`. Same name/digest conflict → 409 `MODEL_VERSION_CONFLICT`.
`GET /v1/feedback/models?model_name=` → list of `ModelResponse`.

### 4.12 Dashboard — `GET /v1/dashboard/summary` (no idem, actor yes)

Response `DashboardSummary`:
```json
{"tasks_total":0,"tasks_by_status":{},"events_total":0,"risks_total":0,
 "open_cases":0,"decisions_by_action":{},
 "recent_events":[{"id":"evt_…","task_id":"task_…","event_type":"PAYREQ",
                   "actor_did":"did:…","observed_at":"…","finality":"OBSERVED"}]}
```
Actor-domain scoped (`system:*` sees everything).

### 4.13 Knowledge — prefix `/v1/knowledge`

| Op | Method + path | Idem | Actor | Success |
|---|---|---|---|---|
| Ingest document | `POST /v1/knowledge` | R | yes | 201 |
| Search | `POST /v1/knowledge/search` | – (no idem dep) | yes | 200 |
| Publish | `POST /v1/knowledge/{document_id}/publish` | R | yes | 200 |
| Get | `GET /v1/knowledge/{document_id}` | – | yes | 200 |

`POST /v1/knowledge` request (required: `title`, `content`):
```json
{"title":"Cross-border settlement rule","content":"…chunked text…",
 "jurisdiction":"CN","access_level":"INTERNAL",
 "effective_from":"2026-10-01T00:00:00+00:00",
 "effective_to":"2027-10-01T00:00:00+00:00",
 "metadata":{"source":"regulator"}}
```
optional `evidence_id`, `content_hash` (if supplied must match content),
`jurisdiction` (default `"GLOBAL"`), `effective_from/to`, `access_level`
(`PUBLIC|INTERNAL|RESTRICTED`, default INTERNAL), `metadata`. Document is
chunked server-side. → `KnowledgeDocumentResponse`:
`id, evidence_id, owner_domain_id, title, content_hash, jurisdiction,
effective_from, effective_to, access_level, review_status, chunks[]`.
`chunks[]` = `{id, document_id, chunk_index, text, source_offset,
review_status, embedding_status, metadata}`.
Errors 422 `KNOWLEDGE_WINDOW_INVALID`/`CONTENT_HASH_MISMATCH`, 404
`EVIDENCE_NOT_FOUND`, 403 ACCESS_DENIED.

`POST /v1/knowledge/search` request (required: `query`):
```json
{"query":"cross-border payments requires verified delegation","jurisdiction":"CN","limit":5}
```
optional `jurisdiction`, `effective_at`, `limit` 1–20 (default 5). → 200
`{"query":"…","results":[{chunk…}]}` where each result is a
`KnowledgeChunkResponse`: `id, document_id, chunk_index, text,
source_offset, review_status, embedding_status, metadata`; verified extra
`metadata` keys `title, jurisdiction, source_evidence_id, document_id,
evidence_id, access_level, retrieval_mode:"lexical", match_score`.
**Search semantics (verified from `app/service.py`): lexical only** —
`query` is lower-cased and counted as a *contiguous substring* of each PUBLISHED
chunk's lower-cased text (`text.count(query)`), no tokenization/embeddings
(`embedding_status:"NOT_CONFIGURED"`, `retrieval_mode:"lexical"`). So use a
phrase that literally occurs in the chunk; word-soup queries return `[]` even
when documents exist. **Access:** only documents with
`access_level:"PUBLIC"` are visible to `system:*` actors (their
`owner_domain_id` is null); `INTERNAL`/`RESTRICTED` documents are skipped
unless the actor's domain owns them (`system:knowledge` is the special
bypass). Docs ingested by the dev default actor therefore must be PUBLIC to be
searchable from the console. No idempotency header required (read-only).
`POST /v1/knowledge/{id}/publish` body `{"review_note":""}` → 200
`KnowledgeDocumentResponse` with `chunks[].review_status:"PUBLISHED"`.
`GET /v1/knowledge/{id}` → `KnowledgeDocumentResponse` (404
`KNOWLEDGE_DOCUMENT_NOT_FOUND`).

### 4.14 Assistant — `POST /v1/assistant/query` (idem optional, actor yes)

Request (required: `tool`):
```json
{"tool":"get_timeline","arguments":{"task_id":"task_…"}}
```
`tool` enum: `resolve_entity`, `get_timeline`, `trace_asset`, `replay_rule`,
`rank_nodes`, `match_pattern`, `draft_report`. `arguments` dict (default
`{}`). Response is a **tool-specific free-form dict** (response_model
`dict[str, Any]`), always HTTP 200 on success:
- `get_timeline` {task_id} → `{"events":[{id,event_type,actor_did,observed_at,finality}]}`
  (verified; `observed_at` uses `+00:00`)
- `trace_asset` {task_id, asset_id?} → `{"case_id","snapshot":[paths],"coverage":0.5}` (verified)
- `rank_nodes` {task_id, limit?} → `{"risk_evidence":[{id,score,reasons}],"status"}` (verified)
- `match_pattern` {query, jurisdiction?, limit?} → `{"matches":[{id,document_id,text,metadata}]}`
  (verified; same **lexical** matching/PUBLIC-access rules as knowledge search)
- `draft_report` {case_id} → `{"report_id","content","evidence_refs"}` — this
  tool **does** require an `Idempotency-Key` header (400
  `IDEMPOTENCY_KEY_REQUIRED` without it) and creates a real report; verified
  `content` has the same keys as §4.10
- `resolve_entity` {query} → `{"entities":[{id,entity_type,canonical_ref,attributes}]}`
  (404 `ENTITY_NOT_FOUND` when empty/no match)
- `replay_rule` {features} → verified
  `{"status":"VALID","policy_version":"policy-2026-10-25-001",
  "model_version":"rules-2026-10-25-001","score":0.5,"trust_score":0.5,
  "decision":"THROTTLE","deterministic":true}` (same feature weights as
  §4.7; bool features count as 0/1) or `{"status":"NOT_EVALUABLE","reason":…}`.
  All tools take `arguments` dict with at least `task_id`; a missing/invalid
  task yields 404 `TASK_NOT_FOUND`.
Errors: 404 `TASK_NOT_FOUND`, `CASE_NOT_FOUND`, `EVENT_NOT_FOUND`, 409
`CASE_TASK_MISMATCH`, 404 `ASSET_NOT_FOUND`.

### 4.15 Other routes (not used by the plugin)

`GET /v1/events/stream` — SSE (`text/event-stream`) for `system:*` actors
only (403 `ACCESS_DENIED` otherwise).

## 5. Recommended happy-path call order

1. `POST /v1/dids/register` — issuer DID (domain `payments.example`,
   subject `issuer-01`); capture `dev_private_key`.
2. `POST /v1/dids/register` — subject/agent DID (`subject-01` or `agent-02`).
   (Domain is bootstrapped by the first registration.)
3. `POST /v1/credentials/issue` — `AgentRegistrationCredential` from issuer
   to subject, `claims.capabilities` and `claims.jurisdiction`.
4. `POST /v1/dids/admission` — `{did: subject, required_actions:[…]}` →
   `ALLOW`.
5. `POST /v1/credentials/verify` — pass `response.credential` from step 3 →
   `VALID`.
6. `POST /v1/tasks` — requester = subject DID, `asset_id` `USD`,
   `amount` `"1000.00"`, `beneficiary`.
7. `POST /v1/delegations` — issuer = task requester, subject = agent DID,
   actions `["PAYREQ","RESULT"]`, `amount_limit` ≤ task amount,
   `daily_limit`, tz-aware validity window.
8. `POST /v1/tasks/{id}/transition` — e.g. `AUTHORIZED`, then later
   `SUBMITTED`/`CONFIRMED`.
9. `POST /v1/events` — `PAYREQ` event for the task (unique `source_ref`!).
10. `POST /v1/events/{id}/verify` — record `overall_status`.
11. `POST /v1/risk/evaluate` — task + subject_did (+ event_id, features).
12. `GET /v1/risk/evidence?task_id=…` — list risk evidence.
13. `POST /v1/interventions/decide` — e.g. `STEP_UP` with dict rationale.
14. `POST /v1/cases/trace/{task_id}` — creates case + snapshot.
15. `POST /v1/evidence` — hashed evidence; then
    `POST /v1/evidence/{id}/anchor` and `GET /v1/evidence/{id}/anchors`.
16. `POST /v1/cases/{case_id}/report` — report; `GET /v1/reports/{id}`;
    `GET /v1/cases/{case_id}/reports`.
17. `POST /v1/interventions/{decision_id}/execute` — optional receipt.
18. `GET /v1/dashboard/summary`.
19. `POST /v1/knowledge` (ingest) → `POST /v1/knowledge/{id}/publish` →
    `POST /v1/knowledge/search`.
20. `POST /v1/assistant/query` (`get_timeline`, `rank_nodes`, …).
21. `POST /v1/feedback` — `CONFIRMED` with `submitted_by`.
22. `POST /v1/feedback/policies`, `POST /v1/feedback/models` (optional).

A 63-step real-HTTP driver covering this whole sequence (plus DID rotate/status,
credential suspend/reactivate, delegation revoke and all assistant tools) is
`tmp/cp-examples/run-happy-path.py`; it passed with 0 failures. Steps 1–5 must
happen in order (domain → DIDs → credential → admission/verify); after a task
exists, event → risk → intervention → case → evidence → report can be replayed
per task. `execute_intervention` changes the task status to the applied state
(e.g. `STEP_UP` → `PENDING_STEP_UP`), so run it last or account for the new
state in later transitions.

## 6. Plugin client integration checklist (current `src/control-plane-client.js`)

**Status: resolved.** When this doc was first written the plugin client had two
wrong report routes and read errors from `body.error`. `plugin-dev` rewrote
`src/control-plane-client.js` against this contract; the current `ROUTES` map
(health, ready, all identity/credential/delegation/task/event/evidence/risk/
intervention/case/report/feedback/knowledge/assistant ops, including
`didRotate`/`didStatus` and `credentialStatus*`) matches the live server, and
error handling reads the **flat** `body.error_code` / `body.message` /
`body.retryable` / `body.request_id` correctly. Path parameters are
percent-encoded by the client, which the server accepts for DIDs
(`%3A` for `:`) as well as raw colons.

Checklist that any client must keep (all verified in this doc):
- Send `Idempotency-Key` per the §10 matrix (`required` vs `optional`).
- Read the flat error body; branch on `error_code`, not on Chinese `message`.
- `evaluate_remote_risk` needs `task_id` **and** `subject_did`;
  `propose_intervention` sends `rationale` as an object; feedback needs
  `submitted_by`; assistant `tool` is a 7-value enum and `draft_report`
  additionally needs an `Idempotency-Key` header.
- `ingest_evidence` `content_hash` is 16–128 chars (sha256 hex) and must match
  `content` when `content` is present.
- GET list endpoints accept query filters only where §4 documents them
  (`delegations/events/risk-evidence?task_id=`, `policies?domain_id=`,
  `models?model_name=`); otherwise the server returns the actor-scoped list.
- Keep money as strings; request datetimes timezone-aware.

## 7. Running the dev server (for integration tests)

```bash
cd C:/Users/23157/CODE/00CCF/code/services/control-plane
# venv already created at ./.venv (Python 3.12); install was:
#   py -3.12 -m venv .venv && .venv/Scripts/python -m pip install -e .
APP_ENV=development \
DATABASE_URL="sqlite+aiosqlite:///C:/Users/23157/CODE/00CCF/tmp/cp-dev.db" \
REDIS_QUOTA_MODE=memory \
.venv/Scripts/python -m uvicorn app.main:app --host 127.0.0.1 --port 8080
```
Environment used by the running instance: `APP_ENV=development`,
`DATABASE_URL=sqlite+aiosqlite:///C:/Users/23157/CODE/00CCF/tmp/cp-dev.db`.
Restart recipe is printed in `tmp/cp-examples/README.md`. Development DB can
be reset by stopping the server and deleting
`C:/Users/23157/CODE/00CCF/tmp/cp-dev.db` (never delete repo DBs).

## 8. Production auth (JWT) — how to exercise locally

Production requires `Authorization: Bearer <HS256 JWT>` and refuses
`APP_ENV=production` with dev defaults (`VAULT_TOKEN`, `ACCESS_TOKEN_SECRET`
length ≥32, `KEY_PROVIDER_MODE=memory`, `DEV_ALLOW_UNSIGNED_EVENTS=true` all
must be changed). To mint a token matching `app/auth.py`:

```python
import base64, hashlib, hmac, json, os, time
secret = os.environ["ACCESS_TOKEN_SECRET"]  # set to the dev default from app/config.py (prod: your own ≥32-char secret)
b64 = lambda b: base64.urlsafe_b64encode(b).rstrip(b"=").decode()
header = b64(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
claims = b64(json.dumps({"sub": "did:trust:payments.example:subject-01",
                         "exp": int(time.time()) + 3600}).encode())
sig = b64(hmac.new(secret.encode(), f"{header}.{claims}".encode(),
                   hashlib.sha256).digest())
print(f"{header}.{claims}.{sig}")
```
Send as `Authorization: Bearer <jwt>`; `X-Actor-DID` must be omitted or
equal the `sub`. Production startup additionally flips on outbox dispatcher
and ChainMaker reconciler; keep the long-running dev server on
`APP_ENV=development`.

## 9. Artifacts

- `C:/Users/23157/CODE/00CCF/tmp/cp-openapi.json` — server OpenAPI snapshot
  (56 operations, 52 schemas) captured from the live dev server.
- `C:/Users/23157/CODE/00CCF/tmp/cp-examples/` — real-HTTP captures:
  - `run-happy-path.py` → `happy-path-results.json`, `context.json`,
    `step-NN-<name>.json` (63 steps, all green, run `1793111802-bd4c6d`);
  - `run-negative-cases.py` → `negative-cases-results.json`,
    `negative/NN-<case>.json` (30 cases, 0 unexpected results);
  - `README.md` — restart recipe for the dev server.
- Dev server runs on `http://127.0.0.1:8080` from
  `code/services/control-plane` with
  `DATABASE_URL=sqlite+aiosqlite:///C:/Users/23157/CODE/00CCF/tmp/cp-dev.db`.

## 10. Idempotency matrix (consolidated)

`Idempotency-Key` is a **header**. All values below are verified against the
live server; "required" means omitting it on a write returns 400
`IDEMPOTENCY_KEY_REQUIRED` (before body validation — see §2).

| Requirement | Operations |
|---|---|
| **Required** | `POST /v1/dids/{did}/rotate`, `POST /v1/dids/{did}/status`, `POST /v1/dids/admission`, `POST /v1/credentials/issue`, `POST /v1/credentials/{id}/status`, `POST /v1/tasks`, `POST /v1/tasks/{id}/transition`, `POST /v1/delegations`, `POST /v1/delegations/{id}/revoke`, `POST /v1/events` (header **or** body `idempotency_key`), `POST /v1/evidence`, `POST /v1/evidence/{id}/anchor`, `POST /v1/interventions/decide`, `POST /v1/cases/{case_id}/report`, `POST /v1/feedback`, `POST /v1/feedback/policies`, `POST /v1/feedback/models`, `POST /v1/knowledge`, `POST /v1/knowledge/{id}/publish` |
| **Optional** (server derives a stable key when absent) | `POST /v1/dids/register` (idempotent replay returns same DID+key), `POST /v1/risk/evaluate`, `POST /v1/events/{id}/verify` (`legacy-verify-<event_id>`), `POST /v1/interventions/{id}/execute`, `POST /v1/cases/trace/{task_id}` (`legacy-trace-<task_id>`), `POST /v1/assistant/query` (**but** `tool:"draft_report"` requires the header) |
| **Not used** | all `GET`s, `POST /v1/credentials/verify`, `POST /v1/knowledge/search` |

Semantics: same key + same request hash → cached resource replayed with the
endpoint's normal success status; same key + different body → 409
`IDEMPOTENCY_CONFLICT`. For events, header and body key must agree when both
are present, else 409 `IDEMPOTENCY_KEY_CONFLICT`.

## 11. Verified request/response examples

Trimmed real payloads from the green runs (ids shortened to `…`; not every
date is shown). Exact field lists are in §4.

### 11.1 Health

```
GET /health            → 200
{"status":"ok","service":"cross-border-agent-trust-platform",
 "environment":"development","schema_revision":"b7c8d9e0f1a2"}
GET /ready             → 200
{"status":"ready","checks":{"database":"ok","quota":"ok"}}
```

### 11.2 Identity (DIDs)

```jsonc
// POST /v1/dids/register   (no actor header required)
{"domain_id":"payments.example","subject_id":"issuer-01",
 "display_name":"Payments Issuer","jurisdiction":"CN"}
// → 201
{"did":"did:trust:payments.example:issuer-01","domain_id":"payments.example",
 "document":{"id":"did:trust:…:issuer-01","controller":"did:trust:…:issuer-01",
   "verificationMethod":[{"id":"…:issuer-01#key-1",
     "type":"Ed25519VerificationKey2020","controller":"did:trust:…:issuer-01",
     "publicKeyMultibase":"z…"}],
   "authentication":["…:issuer-01#key-1"],
   "assertionMethod":["…:issuer-01#key-1"],
   "service":[{"id":"…:issuer-01#api","type":"TrustPlatformApi",
               "serviceEndpoint":"/v1"}],
   "domain_id":"payments.example","updated_at":"2026-10-27T14:34:48.6+00:00"},
 "status":"ACTIVE","dev_private_key":"z…"}   // dev_private_key only in development
```
```jsonc
// GET /v1/dids/did:trust:payments.example:issuer-01  → 200
{"did":"…","domain_id":"payments.example","document":{…},
 "public_key":"z…","status":"ACTIVE","updated_at":"2026-10-27T14:34:48.6"}
// POST /v1/dids/{did}/rotate {"reason":"routine key rotation"} → 200
{"did":…,"domain_id":…,"document":{ …verificationMethod includes "#key-2"… },
 "status":"ACTIVE","dev_private_key":"z…"}   // no top-level public_key
// POST /v1/dids/{did}/status {"status":"SUSPENDED","reason":"compliance hold"} → 200 DIDResponse
// POST /v1/dids/admission {"did":"did:trust:payments.example:subject-01",
//   "required_actions":["PAYREQ"],"jurisdiction":"CN"} → 201
{"id":"admit_…","did":"…","domain_id":"payments.example","status":"ALLOW",
 "trust_score":0.95,"allowed_actions":["PAYREQ"],
 "limits":{"single_amount":"1000000","daily_amount":"5000000"},
 "evidence_refs":["<sha256 hex>"],"policy_version":"policy-2026-10-25-001",
 "created_at":"2026-10-27T14:34:48.6"}
```

### 11.3 Credentials

```jsonc
// POST /v1/credentials/issue
{"credential_type":"AgentRegistrationCredential",
 "issuer_did":"did:trust:payments.example:issuer-01",
 "subject_did":"did:trust:payments.example:subject-01",
 "claims":{"capabilities":["PAYREQ","RESULT"],"jurisdiction":"CN"},
 "valid_to":"2027-10-27T00:00:00+00:00"}                       // → 201
{"id":"vc_…","credential_type":"AgentRegistrationCredential",
 "issuer_did":…,"subject_did":…,"claims":{…},
 "proof":{"type":"Ed25519Signature2020","proofValue":"z…"},
 "valid_from":"2026-10-27T14:34:48.6","valid_to":"2027-10-27T00:00:00",
 "status":"ACTIVE",
 "credential":{"@context":["https://www.w3.org/2018/credentials/v1"],
   "id":"vc_…","type":["VerifiableCredential","AgentRegistrationCredential"],
   "issuer":"did:trust:…","issuanceDate":"2026-10-27T14:34:48.6",
   "expirationDate":"2027-10-27T00:00:00",
   "credentialSubject":{"id":"did:trust:…","capabilities":["PAYREQ","RESULT"],
                        "jurisdiction":"CN"},
   "proof":{"type":"Ed25519Signature2020","proofValue":"z…"}}}
// POST /v1/credentials/verify  {"credential":<credential above>,"required_claims":[]} → 200
{"valid":true,"status":"VALID","issuer_did":"…","subject_did":"…",
 "evidence_refs":["<sha256 hex>"],"reasons":[]}
// tampered credentialSubject.id → 200
{"valid":false,"status":"INVALID","reasons":[]}
// POST /v1/credentials/{id}/status
{"status":"SUSPENDED","reason":"compliance hold","actor_did":"<issuer did>"} → 200
{"credential_id":"vc_…","status":"SUSPENDED","reason":"compliance hold",
 "effective_at":"2026-10-27T14:34:48.6","evidence_refs":["<sha256 hex>"]}
// GET /v1/credentials/{id}/status → 200 [CredentialStatusResponse]
```

### 11.4 Tasks

```jsonc
// POST /v1/tasks
{"domain_id":"payments.example",
 "requester_did":"did:trust:payments.example:subject-01",
 "asset_id":"USD","amount":"1000.00","beneficiary":"beneficiary-entity-001",
 "metadata":{"purpose":"cross-border settlement"}}                 // → 201
{"id":"task_…","domain_id":"payments.example","requester_did":"…",
 "asset_id":"USD","amount":"1000.00000000","beneficiary":"beneficiary-entity-001",
 "status":"CREATED","policy_version":"policy-2026-10-25-001",
 "metadata":{…},"created_at":"2026-10-27T14:34:48.6","updated_at":"…"}
// POST /v1/tasks/{id}/transition {"status":"AUTHORIZED","reason":"delegation validated"} → 200
// GET /v1/tasks → 200 [PaymentTaskResponse]
```

### 11.5 Delegations

```jsonc
// POST /v1/delegations
{"task_id":"task_…",
 "issuer_did":"did:trust:payments.example:subject-01",
 "subject_did":"did:trust:payments.example:agent-02",
 "actions":["PAYREQ","RESULT"],"asset_id":"USD",
 "amount_limit":"900.00","daily_limit":"2000.00",
 "valid_from":"2026-10-27T00:00:00+00:00","valid_to":"2026-11-27T00:00:00+00:00"} → 201
{"id":"del_…","task_id":"task_…","issuer_did":"…","subject_did":"…",
 "actions":["PAYREQ","RESULT"],"asset_id":"USD",
 "amount_limit":"900.00000000","daily_limit":"2000.00000000",
 "valid_from":"2026-10-27T00:00:00","valid_to":"2026-11-27T00:00:00",
 "parent_id":null,"can_redelegate":false,"status":"ACTIVE"}
// POST /v1/delegations/{id}/revoke {"status":"CLOSED","reason":"revoked by policy"} → 200
//   → DelegationResponse with status:"REVOKED" (status body value is ignored
//     but must be a valid task-status enum; "REVOKED" → 422)
```

### 11.6 Operation events

```jsonc
// POST /v1/events
{"task_id":"task_…","event_type":"PAYREQ",
 "actor_did":"did:trust:payments.example:agent-02",
 "source_ref":"ledger:tx:run-…-001",
 "payload":{"amount":"100.00","beneficiary":"beneficiary-entity-001"},
 "finality":"OBSERVED","observed_at":"2026-10-27T14:34:48+00:00"} → 201
{"id":"evt_…","task_id":"task_…","event_type":"PAYREQ","actor_did":"…",
 "payload":{…},"signature":null,"signature_detail":null,
 "source_ref":"ledger:tx:run-…-001","finality":"OBSERVED","status":"OBSERVED",
 "event_time":"2026-10-27T14:34:48.684307Z","observed_at":"2026-10-27T14:34:48.684307Z",
 "idempotency_key":"<echoed key>","verification":null,
 "schema_version":"operation-event.v1","trace_id":null,"counterparty_did":null,
 "predecessors":[],"evidence_refs":[],"source_ledger":{},"message_id":null,
 "policy_version":"policy-2026-10-25-001"}
// POST /v1/events/{id}/verify  {} → 200
{"id":1,"event_id":"evt_…","identity_status":"UNKNOWN",
 "authorization_status":"VALID","ledger_status":"UNKNOWN",
 "overall_status":"UNKNOWN","evidence_refs":[],
 "policy_version":"policy-2026-10-25-001",
 "details":{"signature_ok":false,"invariant_errors":[],"ledger":{}}}
// unsigned dev event → overall_status never VALID
// malformed signature string → 201 on ingest; verify → overall_status:"INVALID",
//   identity/authorization "INVALID", details.signature_ok:false
```

### 11.7 Risk

```jsonc
// POST /v1/risk/evaluate
{"task_id":"task_…","subject_did":"did:trust:payments.example:agent-02",
 "event_id":"evt_…",
 "features":{"velocity":0.3,"amount_deviation":0.9,"new_counterparty":true,
             "cross_chain_hops":0.2}} → 200
{"evidence_id":"risk_…","trust_snapshot_id":"trust_…","score":0.68,
 "trust_score":0.32,"decision":"DEFER","reasons":["…中文…"],
 "feature":{"velocity":0.3,"amount_deviation":0.9,"new_counterparty":true,
            "cross_chain_hops":0.2,"_evaluation_status":"UNKNOWN","_decision":"DEFER"},
 "evaluation_status":"UNKNOWN","policy_version":"policy-2026-10-25-001",
 "model_version":"rules-2026-10-25-001"}
// GET /v1/risk/evidence?task_id=… → 200 [RiskEvidenceResponse]
```

### 11.8 Interventions + execution receipt

```jsonc
// POST /v1/interventions/decide
{"task_id":"task_…","event_id":"evt_…","action":"STEP_UP",
 "rationale":{"reason":"amount above threshold","risk_evidence":"risk_…"}} → 201
{"id":"dec_…","task_id":"task_…","event_id":"evt_…","action":"STEP_UP",
 "rationale":{"reason":"…","requested_action":"STEP_UP","effective_action":"STEP_UP",
              "decision_reasons":[…],"opa":{}},
 "status":"DECIDED","created_at":"2026-10-27T14:34:48.6"}
// POST /v1/interventions/{decision_id}/execute  {} → 200
{"id":"rcpt_…","decision_id":"dec_…","task_id":"task_…","action":"STEP_UP",
 "status":"APPLIED","external_ref":"gateway:…","amount_reserved":"100.00000000",
 "applied_state":"PENDING_STEP_UP","target_system":"execution-gateway",
 "operation_id":"evt_…","applied_at":"2026-10-27T14:34:48.7",   // naive
 "target_tx_hash":"gateway:…","error_code":null,"signature":"sha256:…",
 "quota_key":"domain:did:…:PAYREQ:USD:2026-10-27",
 "details":{"deterministic":true,"policy_version":"policy-2026-10-25-001",
            "applied_state":"PENDING_STEP_UP","transfer_id":"transfer_…",
            "applied_at":"2026-10-27T14:34:48.7+00:00",
            "target_system":"execution-gateway","operation_id":"evt_…",
            "target_tx_hash":"gateway:…","signature_algorithm":"SHA-256/Ed25519-boundary",
            "quota_key":"…","quota_reservation_id":"<sha256 hex>"}}
// note: receipt body has no `created_at` in the verified response
// side effect: task.status becomes the applied_state (STEP_UP → PENDING_STEP_UP)
```

### 11.9 Cases (traceability)

```jsonc
// POST /v1/cases/trace/{task_id}    (no body) → 201 CaseResponse
{"id":"case_…","task_id":"task_…","status":"OPEN",
 "scope":{"task_id":"task_…","asset_id":"USD"},
 "policy_version":"policy-2026-10-25-001",
 "model_version":"trace-rules-2026-10-25-001",
 "created_at":"2026-10-27T14:34:48.6",
 "snapshot":{"id":"snapshot_…","graph_version":"…",
   "evidence_ids":[],
   "paths":[{"event_id":"evt_…","from":"…","to":"…","asset_id":"USD",
             "amount":"100.00","confidence":0.6,"evidence_refs":[]}],
   "residuals":[{"asset_id":"USD","reason":"未达到最终性"}],
   "coverage":0.5,"filters":{},"created_at":"…"}}
// GET /v1/cases, GET /v1/cases/{id}, GET /v1/cases/{id}/trace → CaseResponse
// GET /v1/cases/{id}/graph → {case_id, snapshot_id, nodes[], edges[]}
```

### 11.10 Evidence

```jsonc
// POST /v1/evidence
{"case_id":"case_…","source_type":"BANK_STATEMENT",
 "source_ref":"statement:2026-10-27:001",
 "content_hash":"<sha256 hex of content>","content":"raw text",
 "metadata":{"jurisdiction":"CN"}} → 201
{"id":"evidence_…","evidence_type":"BANK_STATEMENT","source_ref":"…",
 "content_hash":"<sha256 hex>","status":"REGISTERED",
 "details":{"case_id":"case_…","storage_uri":…,"sm3_hash":"…","metadata":{…}},
 "created_at":"…"}
// POST /v1/evidence/{id}/anchor {} → 200
{"id":"anchor_…","evidence_id":"evidence_…","chain_id":"local-chain",
 "tx_id":"local:<hex>","anchor_hash":"…","sha256_hash":"…","sm3_hash":"…",
 "source_ref":"…","captured_at":"…","status":"CONFIRMED","attempts":0,
 "last_error":null,"created_at":"…"}   // dev simulates the anchor
// GET /v1/evidence/{id}/anchors → [AnchorResponse]
```

### 11.11 Reports

```jsonc
// POST /v1/cases/{case_id}/report   (no body) → 201
{"id":"report_…","case_id":"case_…","case_snapshot_id":"snapshot_…",
 "content":{"verified_facts":[{"event_id":"evt_…",
              "statement":"事件已登记并进入追踪快照","evidence_refs":["evt_…"]}],
            "algorithmic_candidates":[{"event_id":"evt_…","from":"…","to":"…",
              "asset_id":"USD","amount":"100.00","confidence":0.6,
              "evidence_refs":["evt_…"]}],
            "unresolved_items":[{"asset_id":"USD","reason":"未达到最终性"}],
            "human_findings":[],"coverage":0.5},
 "evidence_refs":["evt_…"],"policy_version":"policy-2026-10-25-001",
 "model_version":"trace-rules-2026-10-25-001",
 "generated_by":"system:console","created_at":"…"}
// GET /v1/reports/{report_id} → ReportResponse (404 REPORT_NOT_FOUND)
// GET /v1/cases/{case_id}/reports → [ReportResponse]
```

### 11.12 Governance / feedback

```jsonc
// POST /v1/feedback
{"case_id":"case_…","subject_did":"did:trust:…:agent-02","label":"CONFIRMED",
 "reason":"risk decision validated by analyst","evidence_refs":[],
 "submitted_by":"system:console"} → 201
{"feedback_id":"feedback_…","status":"RECORDED"}     // resolves the case
// POST /v1/feedback/policies {"policy_id":"risk-policy","domain_id":"payments.example",
//   "version":"2026-10-27.1","package":{…},"signed_by":"system:console"} → 201
// GET /v1/feedback/policies?domain_id= → [PolicyResponse]
// POST /v1/feedback/models {"model_id":"rules-2026-10-25-001",
//   "model_name":"rules","digest":"<16+ chars>","artifact_uri":"inline://…",
//   "signed_by":"system:console"} → 201
// GET /v1/feedback/models?model_name= → [ModelResponse]
```

### 11.13 Dashboard

```jsonc
// GET /v1/dashboard/summary → 200
{"tasks_total":1,"tasks_by_status":{"CREATED":1},"events_total":1,
 "risks_total":1,"open_cases":1,"decisions_by_action":{"STEP_UP":1},
 "recent_events":[{"id":"evt_…","task_id":"task_…","event_type":"PAYREQ",
                   "actor_did":"…","observed_at":"…","finality":"OBSERVED"}]}
```

### 11.14 Knowledge

```jsonc
// POST /v1/knowledge  {"title":"Cross-border payments rule",
//   "content":"…text…","jurisdiction":"CN","access_level":"PUBLIC"} → 201
{"id":"knowledge_…","evidence_id":null,"owner_domain_id":null,
 "title":"…","content_hash":"<sha256 hex>","jurisdiction":"CN",
 "effective_from":null,"effective_to":null,"access_level":"PUBLIC",
 "review_status":"DRAFT",
 "chunks":[{"id":"chunk_…","document_id":"knowledge_…","chunk_index":0,
            "text":"…","source_offset":0,"review_status":"DRAFT",
            "embedding_status":"NOT_CONFIGURED","metadata":{…}}]}
// POST /v1/knowledge/{id}/publish {"review_note":""} → 200 (review_status PUBLISHED)
// POST /v1/knowledge/search {"query":"cross-border payments requires verified delegation",
//   "limit":5} → 200
{"query":"…","results":[{"id":"chunk_…","document_id":"knowledge_…",
  "chunk_index":0,"text":"…","source_offset":0,"review_status":"PUBLISHED",
  "embedding_status":"NOT_CONFIGURED",
  "metadata":{"title":"…","jurisdiction":"CN","source_evidence_id":null,
    "document_id":"knowledge_…","evidence_id":null,"access_level":"PUBLIC",
    "retrieval_mode":"lexical","match_score":1}}]}
```

### 11.15 Assistant

```jsonc
// POST /v1/assistant/query  {"tool":"get_timeline","arguments":{"task_id":"task_…"}} → 200
{"events":[{"id":"evt_…","event_type":"PAYREQ","actor_did":"…",
            "observed_at":"2026-10-27T14:34:48.684307+00:00","finality":"OBSERVED"}]}
// trace_asset → {"case_id":"case_…","snapshot":[…paths…],"coverage":0.5}
// rank_nodes → {"risk_evidence":[{"id":"risk_…","score":0.68,"reasons":[…]}],"status":"VALID"}
// replay_rule → {"status":"VALID","policy_version":"policy-2026-10-25-001",
//   "model_version":"rules-2026-10-25-001","score":0.5,"trust_score":0.5,
//   "decision":"THROTTLE","deterministic":true}
// match_pattern → {"matches":[{"id":"chunk_…","document_id":"…","text":"…","metadata":{…}}]}
// draft_report (requires Idempotency-Key header) → {"report_id":"report_…","content":{…},"evidence_refs":[]}
```

## 12. Verified error catalog (30 negative cases, all green)

Reproduced with `tmp/cp-examples/run-negative-cases.py` against the live dev
server. All bodies are flat (§2) with `request_id` echoed in
`X-Request-ID` **except** the last row.

| # | Case | Request | HTTP | `error_code` |
|---|---|---|---|---|
| 1 | missing idempotency (valid body) | `POST /v1/tasks` | 400 | `IDEMPOTENCY_KEY_REQUIRED` |
| 2 | missing idempotency + invalid body | `POST /v1/tasks {}` | 400 | `IDEMPOTENCY_KEY_REQUIRED` (dependency runs before validation) |
| 3 | idempotency key reused with different body | `POST /v1/tasks` | 409 | `IDEMPOTENCY_CONFLICT` |
| 4 | unknown actor | `GET /v1/tasks` `X-Actor-DID: …ghost-999` | 403 | `ACTOR_NOT_FOUND` |
| 5 | actor header ≠ body actor_did | `POST /v1/events` | 403 | `ACTOR_MISMATCH` |
| 6 | cross-domain task read | `GET /v1/tasks/{id}` actor from `other.example` | 403 | `ACCESS_DENIED` |
| 7 | body validation | `POST /v1/tasks` missing `asset_id` | 422 | `VALIDATION_ERROR` (+`details[]`) |
| 8 | unknown task | `GET /v1/tasks/task_does_not_exist` | 404 | `TASK_NOT_FOUND` |
| 9 | task domain ≠ requester domain | `POST /v1/tasks` | 403 | `REQUESTER_DOMAIN_MISMATCH` |
| 10 | delegation amount over task amount | `POST /v1/delegations` | 409 | `QUOTA_SCOPE_EXCEEDED` |
| 11 | unsupported delegation action | `actions:["SEND"]` | 422 | `ACTION_NOT_SUPPORTED` |
| 12 | delegation asset ≠ task asset | `asset_id:"EUR"` | 400 | `ASSET_SCOPE_MISMATCH` |
| 13 | root delegation issuer ≠ requester | `POST /v1/delegations` | 403 | `ROOT_DELEGATION_ISSUER_INVALID` |
| 14 | naive `valid_from` | `POST /v1/delegations` | **500** | *(plain text `"Internal Server Error"`, no flat body — bug, §2.1)* |
| 15 | duplicate event `source_ref` | `POST /v1/events` | 409 | `SOURCE_REF_CONFLICT` |
| 16 | malformed event signature | ingest | 201 | *(accepted in dev; verify → INVALID)* |
| 17 | finality/status mismatch | `finality:"FINAL"`, `status:"OBSERVED"` | 422 | `FINALITY_CONFLICT` |
| 18 | tampered credential | `POST /v1/credentials/verify` | 200 | *(no error: `valid:false,status:"INVALID"`)* |
| 19 | malformed verify body | `POST /v1/credentials/verify {}` | 422 | `VALIDATION_ERROR` |
| 20 | evidence content/hash mismatch | `POST /v1/evidence` | 422 | `CONTENT_HASH_MISMATCH` |
| 21 | evidence source_ref conflict | same ref, different hash | 409 | `EVIDENCE_CONTENT_CONFLICT` |
| 22 | unknown report | `GET /v1/reports/report_does_not_exist` | 404 | `REPORT_NOT_FOUND` |
| 23 | report for unknown case | `POST /v1/cases/case_does_not_exist/report` | 404 | `CASE_NOT_FOUND` |
| 24 | invalid task transition | `PENDING_STEP_UP` → `CREATED` | 409 | `TASK_STATE_TRANSITION_INVALID` |
| 25 | invalid transition enum | `status:"DONE"` | 422 | `VALIDATION_ERROR` |
| 26 | admission for unknown DID | `POST /v1/dids/admission` | 404 | `DID_NOT_FOUND` |
| 27 | execute unknown decision | `POST /v1/interventions/dec_does_not_exist/execute` | 404 | `DECISION_NOT_FOUND` |
| 28 | unknown delegation | `GET /v1/delegations/del_does_not_exist` | 404 | `DELEGATION_NOT_FOUND` |
| 29 | INTERNAL knowledge not searchable by console actor | `POST /v1/knowledge/search` | 200 | *(no error, `results:[]`)* |
| 30 | non-contiguous phrase in search | `query:"cross-border settlement"` | 200 | *(no error, `results:[]` — lexical substring only)* |

Exact request/response JSON for every row:
`tmp/cp-examples/negative/NN-<case>.json`.

## 13. Source-vs-verified corrections (change log)

Doc v1 was written from source before the server ran. Verified against
`/openapi.json` + 63-step happy path + 30 negative cases on 2026-10-27 with
`APP_ENV=development`. Corrections folded in:

1. Money in responses is a **string with 8 decimals**, not a JSON number
   (`"1000.00000000"`). Requests accept `"1000.00"`.
2. Most response timestamps are **naive ISO**; only event
   `observed_at`/`event_time` end with `Z`; assistant timeline uses `+00:00`.
3. Idempotency dependency runs **before** body validation → missing key wins
   over invalid body (400 beats 422).
4. `POST /v1/dids/{did}/rotate` returns **200** `DIDRegisterResponse` with the
   new document (`#key-2`) and dev private key; no top-level `public_key`.
5. Delegation revoke `status` must be a **valid task-status enum** value even
   though ignored (`REVOKED` → 422); verified working value `"CLOSED"`.
6. Dev anchor is reported `status:"CONFIRMED"`, `chain_id:"local-chain"`,
   `tx_id:"local:<hex>"` (locally simulated; not a real chain).
7. Knowledge search is **lexical contiguous substring** matching on PUBLISHED
   chunks; non-PUBLIC documents are invisible to `system:*` actors; result
   metadata carries `retrieval_mode`/`match_score`.
8. Report `content` keys verified (`verified_facts`, `algorithmic_candidates`,
   `unresolved_items`, `human_findings`, `coverage`); `generated_by` = actor.
9. `FINALITY_CONFLICT` applies only when `status` is present, `finality ≠
   OBSERVED`, and they differ — `finality:"OBSERVED"` + `status:"FINAL"` is
   accepted.
10. Executing an unknown intervention is `404 DECISION_NOT_FOUND` (no
    `INTERVENTION_NOT_FOUND` exists).
11. `POST /v1/cases/trace/{task_id}` and `POST /v1/cases/{case_id}/report`
    take **no body** and return **201**.
12. `assistant` `draft_report` requires `Idempotency-Key`; `match_pattern`
    uses the same lexical search rules as knowledge.
13. Known bug: timezone-naive datetime in the delegation validator throws an
    unhandled `TypeError` → plain-text 500 with no flat error body (§2.1).
14. New in v2: consolidated idempotency matrix (§10), per-group verified
    examples (§11), verified error catalog (§12).
