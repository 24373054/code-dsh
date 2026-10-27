/**
 * Fixed-route JSON client for the legacy FastAPI trust control plane.
 *
 * The route table is the complete set of callable endpoints. Operations are
 * named; URLs are never accepted from tool arguments, so model output cannot
 * redirect a request to an arbitrary host or path.
 *
 * @module dsh-trust-platform/client
 */

/** Reserved path-parameter placeholders, substituted from `request` options. */
const PLACEHOLDER = /\{([a-z_]+)\}/g

/** Max client-side request identifier length retained in error values. */
const isFinitePositive = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0

/**
 * Client failure carrying the control plane's structured error fields.
 *
 * The legacy service returns a flat error body (`error_code`, `message`,
 * `request_id`, `retryable`, `evidence_refs`, `policy_version`), which is mapped
 * one-to-one onto this error object.
 */
export class ControlPlaneError extends Error {
  /**
   * @param fields - error fields; `code` and `message` are always present.
   */
  constructor(fields) {
    super(fields.message)
    this.name = 'ControlPlaneError'
    this.code = fields.code ?? 'TRUST_CONTROL_PLANE_ERROR'
    this.status = fields.status ?? 0
    this.requestId = fields.requestId ?? ''
    this.retryable = fields.retryable === true
    this.evidenceRefs = fields.evidenceRefs ?? []
    this.policyVersion = fields.policyVersion ?? ''
    this.details = fields.details ?? null
    this.operation = fields.operation ?? ''
    if (fields.cause !== undefined) this.cause = fields.cause
  }
}

/**
 * Validate and normalize one control-plane base URL.
 *
 * @param baseUrl - absolute `http(s)` URL, optionally with a path prefix.
 * @returns the URL without trailing slashes.
 * @throws TypeError with an actionable message for missing or non-http URLs.
 */
export function validateBaseUrl(baseUrl) {
  const raw = typeof baseUrl === 'string' ? baseUrl.trim() : ''
  const reject = (reason) => {
    throw new TypeError(
      `[dsh-trust-platform] mode "control-plane" requires config.baseUrl to be ${reason} (got "${raw}")`,
    )
  }
  if (raw === '') reject('a non-empty absolute http(s) URL')
  let url
  try {
    url = new URL(raw)
  } catch {
    reject('a non-empty absolute http(s) URL')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    reject('an absolute http(s) URL')
  }
  if (url.username !== '' || url.password !== '') {
    reject('an absolute http(s) URL without embedded credentials')
  }
  return raw.replace(/\/+$/, '')
}

/** One immutable route: HTTP method, path template, and idempotency policy. */
const route = (method, path, idempotency) => Object.freeze({ method, path, idempotency })

/**
 * Every supported control-plane operation.
 *
 * `idempotency` is the server-side requirement: `required` writes must send an
 * `Idempotency-Key`, `optional` writes accept one (the client sends a generated
 * key by default, which also satisfies the assistant `draft_report` path), and
 * `none` covers reads plus handlers without an idempotency dependency.
 */
export const ROUTES = Object.freeze({
  health: route('GET', '/health', 'none'),
  ready: route('GET', '/ready', 'none'),

  didRegister: route('POST', '/v1/dids/register', 'optional'),
  didList: route('GET', '/v1/dids', 'none'),
  didGet: route('GET', '/v1/dids/{did}', 'none'),
  didKeys: route('GET', '/v1/dids/{did}/keys', 'none'),
  didRotate: route('POST', '/v1/dids/{did}/rotate', 'required'),
  didStatus: route('POST', '/v1/dids/{did}/status', 'required'),
  admission: route('POST', '/v1/dids/admission', 'required'),

  credentialIssue: route('POST', '/v1/credentials/issue', 'required'),
  credentialGet: route('GET', '/v1/credentials/{credential_id}', 'none'),
  credentialVerify: route('POST', '/v1/credentials/verify', 'none'),
  credentialStatusGet: route('GET', '/v1/credentials/{credential_id}/status', 'none'),
  credentialStatusSet: route('POST', '/v1/credentials/{credential_id}/status', 'required'),

  delegationCreate: route('POST', '/v1/delegations', 'required'),
  delegationList: route('GET', '/v1/delegations', 'none'),
  delegationGet: route('GET', '/v1/delegations/{delegation_id}', 'none'),
  delegationRevoke: route('POST', '/v1/delegations/{delegation_id}/revoke', 'required'),

  taskCreate: route('POST', '/v1/tasks', 'required'),
  taskList: route('GET', '/v1/tasks', 'none'),
  taskGet: route('GET', '/v1/tasks/{task_id}', 'none'),
  taskTransition: route('POST', '/v1/tasks/{task_id}/transition', 'required'),

  eventCreate: route('POST', '/v1/events', 'required'),
  eventList: route('GET', '/v1/events', 'none'),
  eventGet: route('GET', '/v1/events/{event_id}', 'none'),
  eventVerify: route('POST', '/v1/events/{event_id}/verify', 'optional'),

  evidenceCreate: route('POST', '/v1/evidence', 'required'),
  evidenceGet: route('GET', '/v1/evidence/{evidence_id}', 'none'),
  evidenceAnchor: route('POST', '/v1/evidence/{evidence_id}/anchor', 'required'),
  evidenceAnchors: route('GET', '/v1/evidence/{evidence_id}/anchors', 'none'),

  riskEvaluate: route('POST', '/v1/risk/evaluate', 'optional'),
  riskEvidence: route('GET', '/v1/risk/evidence', 'none'),

  interventionDecide: route('POST', '/v1/interventions/decide', 'required'),
  interventionList: route('GET', '/v1/interventions', 'none'),
  interventionExecute: route('POST', '/v1/interventions/{decision_id}/execute', 'optional'),

  caseTrace: route('POST', '/v1/cases/trace/{task_id}', 'optional'),
  caseList: route('GET', '/v1/cases', 'none'),
  caseGet: route('GET', '/v1/cases/{case_id}', 'none'),
  caseTraceGet: route('GET', '/v1/cases/{case_id}/trace', 'none'),
  caseGraph: route('GET', '/v1/cases/{case_id}/graph', 'none'),

  reportCreate: route('POST', '/v1/cases/{case_id}/report', 'required'),
  reportGet: route('GET', '/v1/reports/{report_id}', 'none'),
  reportList: route('GET', '/v1/cases/{case_id}/reports', 'none'),

  feedbackCreate: route('POST', '/v1/feedback', 'required'),
  governancePolicies: route('GET', '/v1/feedback/policies', 'none'),
  governancePolicyPublish: route('POST', '/v1/feedback/policies', 'required'),
  governanceModels: route('GET', '/v1/feedback/models', 'none'),
  governanceModelPublish: route('POST', '/v1/feedback/models', 'required'),

  dashboardSummary: route('GET', '/v1/dashboard/summary', 'none'),

  knowledgeIngest: route('POST', '/v1/knowledge', 'required'),
  knowledgeSearch: route('POST', '/v1/knowledge/search', 'none'),
  knowledgePublish: route('POST', '/v1/knowledge/{document_id}/publish', 'required'),
  knowledgeGet: route('GET', '/v1/knowledge/{document_id}', 'none'),

  assistantQuery: route('POST', '/v1/assistant/query', 'optional'),
})

/** Substitute `{name}` placeholders from `parameters`, percent-encoding values. */
function resolvePath(template, parameters = {}) {
  const missing = []
  const resolved = template.replace(PLACEHOLDER, (_match, name) => {
    const value = parameters[name]
    if (value === undefined || value === null || String(value).trim() === '') {
      missing.push(name)
      return _match
    }
    return encodeURIComponent(String(value).trim())
  })
  if (missing.length > 0) {
    throw new ControlPlaneError({
      code: 'TRUST_PATH_PARAMETER_MISSING',
      message: `missing path parameter${missing.length > 1 ? 's' : ''} for ${template}: ${missing.join(', ')}`,
      operation: template,
    })
  }
  return resolved
}

/** Append defined query parameters, preserving arrays as repeated fields. */
function appendQuery(target, query) {
  if (!query || typeof query !== 'object') return target
  const url = new URL(target)
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item === undefined || item === null) continue
      url.searchParams.append(key, typeof item === 'string' ? item : String(item))
    }
  }
  return url.toString()
}

/** Parse a JSON body without throwing; malformed or empty bodies become `null`. */
function parseJson(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Create a client bound to one control plane.
 *
 * @param options.baseUrl - absolute `http(s)` URL of the control plane.
 * @param options.fetchImpl - fetch implementation; defaults to the global fetch.
 * @param options.token - optional bearer token. The dev server ignores it.
 * @param options.actorDid - optional `X-Actor-DID`; omitted when empty so the
 *   dev server applies its `system:console` default.
 * @param options.timeoutMs - per-request budget in milliseconds (default 30000).
 * @returns frozen client exposing `request(operation, payload, options)`.
 */
export function createControlPlaneClient({
  baseUrl,
  fetchImpl = globalThis.fetch,
  token = '',
  actorDid = '',
  timeoutMs = 30000,
}) {
  const base = validateBaseUrl(baseUrl)
  if (typeof fetchImpl !== 'function') {
    throw new TypeError('[dsh-trust-platform] a fetch implementation is required')
  }
  if (!isFinitePositive(timeoutMs)) {
    throw new TypeError('[dsh-trust-platform] timeoutMs must be a positive number of milliseconds')
  }
  const requestToken = typeof token === 'string' ? token.trim() : ''
  const requestActor = typeof actorDid === 'string' ? actorDid.trim() : ''

  /**
   * Execute one named control-plane operation.
   *
   * @param operation - key of {@link ROUTES}.
   * @param payload - JSON body for writes; ignored by GET operations.
   * @param options.query - query parameters (undefined values are skipped).
   * @param options.path - values for path placeholders, e.g. `{ task_id }`.
   * @param options.idempotencyKey - override the generated idempotency key.
   * @param options.signal - caller cancellation signal (forwarded by tools).
   * @param options.timeoutMs - per-call budget override.
   * @returns `{ data, status, requestId }` for a successful response.
   * @throws ControlPlaneError for HTTP failures, transport failures and timeouts.
   */
  async function request(operation, payload, options = {}) {
    const entry = ROUTES[operation]
    if (!entry) {
      throw new ControlPlaneError({
        code: 'TRUST_UNKNOWN_OPERATION',
        message: `unsupported control-plane operation "${String(operation)}"`,
        operation: String(operation),
      })
    }
    const requestId = crypto.randomUUID()
    const isWrite = entry.method !== 'GET'
    const idempotencyKey =
      isWrite && entry.idempotency !== 'none'
        ? optionalKey(options.idempotencyKey) ?? `dsh-${crypto.randomUUID()}`
        : undefined
    const headers = {
      Accept: 'application/json',
      'X-Request-ID': requestId,
    }
    if (requestActor !== '') headers['X-Actor-DID'] = requestActor
    if (requestToken !== '') headers.Authorization = `Bearer ${requestToken}`
    if (isWrite) headers['Content-Type'] = 'application/json'
    if (idempotencyKey !== undefined) headers['Idempotency-Key'] = idempotencyKey

    const target = appendQuery(`${base}${resolvePath(entry.path, options.path)}`, options.query)
    const body = isWrite ? JSON.stringify(payload ?? {}) : undefined
    if (options.signal?.aborted) {
      throw new ControlPlaneError({
        code: 'TRUST_ABORTED',
        message: `control-plane request "${operation}" was aborted before it was sent`,
        operation,
      })
    }
    const budget = options.timeoutMs ?? timeoutMs
    const timeoutSignal = AbortSignal.timeout(budget)
    const signals = options.signal ? [timeoutSignal, options.signal] : [timeoutSignal]
    const signal = signals.length === 1 ? timeoutSignal : AbortSignal.any(signals)

    let response
    try {
      response = await fetchImpl(target, { method: entry.method, headers, body, signal })
    } catch (error) {
      if (timeoutSignal.aborted) {
        throw new ControlPlaneError({
          code: 'TRUST_TIMEOUT',
          message: `control-plane request "${operation}" timed out after ${budget}ms`,
          retryable: true,
          operation,
          cause: error,
        })
      }
      if (options.signal?.aborted) {
        throw new ControlPlaneError({
          code: 'TRUST_ABORTED',
          message: `control-plane request "${operation}" was aborted`,
          operation,
          cause: error,
        })
      }
      throw new ControlPlaneError({
        code: 'TRUST_TRANSPORT_ERROR',
        message: `control-plane request "${operation}" failed: ${error?.message ?? String(error)}`,
        retryable: true,
        operation,
        cause: error,
      })
    }

    const rawBody = await response.text().catch(() => '')
    const data = parseJson(rawBody)
    if (!response.ok) {
      const flat = data !== null && typeof data === 'object' && !Array.isArray(data) ? data : {}
      const headerRequestId = response.headers?.get?.('x-request-id')
      throw new ControlPlaneError({
        code: typeof flat.error_code === 'string' && flat.error_code !== '' ? flat.error_code : `TRUST_HTTP_${response.status}`,
        message:
          typeof flat.message === 'string' && flat.message !== ''
            ? flat.message
            : `control plane returned HTTP ${response.status} for "${operation}"`,
        status: response.status,
        requestId: typeof flat.request_id === 'string' ? flat.request_id : headerRequestId ?? requestId,
        retryable: typeof flat.retryable === 'boolean' ? flat.retryable : response.status >= 500 || response.status === 429,
        evidenceRefs: Array.isArray(flat.evidence_refs) ? flat.evidence_refs : [],
        policyVersion: typeof flat.policy_version === 'string' ? flat.policy_version : '',
        details: Array.isArray(flat.details) ? flat.details : null,
        operation,
      })
    }
    if (rawBody.trim() !== '' && data === null) {
      throw new ControlPlaneError({
        code: 'TRUST_INVALID_RESPONSE',
        message: `control-plane response for "${operation}" was not valid JSON`,
        status: response.status,
        requestId: response.headers?.get?.('x-request-id') ?? requestId,
        operation,
      })
    }
    return {
      data,
      status: response.status,
      requestId: response.headers?.get?.('x-request-id') ?? requestId,
    }
  }

  return Object.freeze({
    baseUrl: base,
    actorDid: requestActor,
    timeoutMs,
    routes: ROUTES,
    request,
  })
}

/** Trimmed non-empty idempotency key override, or `undefined`. */
function optionalKey(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}
