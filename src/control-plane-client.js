const ROUTES = Object.freeze({
  health: ['GET', '/health'],
  ready: ['GET', '/ready'],
  identityAdmission: ['POST', '/v1/dids/admission'],
  verifyCredential: ['POST', '/v1/credentials/verify'],
  task: ['GET', '/v1/tasks/{id}'],
  tasks: ['GET', '/v1/tasks'],
  delegation: ['GET', '/v1/delegations/{id}'],
  delegations: ['GET', '/v1/delegations'],
  eventIngest: ['POST', '/v1/events'],
  eventVerify: ['POST', '/v1/events/{id}/verify'],
  riskEvaluate: ['POST', '/v1/risk/evaluate'],
  riskEvidence: ['GET', '/v1/risk/evidence'],
  interventionDecide: ['POST', '/v1/interventions/decide'],
  interventions: ['GET', '/v1/interventions'],
  traceCase: ['GET', '/v1/cases/{id}/trace'],
  caseGraph: ['GET', '/v1/cases/{id}/graph'],
  evidence: ['GET', '/v1/evidence/{id}'],
  evidenceIngest: ['POST', '/v1/evidence'],
  caseCreate: ['POST', '/v1/cases/trace/{id}'],
  reportCreate: ['POST', '/v1/reports/cases/{id}/report'],
  reportRead: ['GET', '/v1/reports/reports/{id}'],
  feedback: ['POST', '/v1/feedback'],
  dashboard: ['GET', '/v1/dashboard/summary'],
  assistantQuery: ['POST', '/v1/assistant/query'],
  knowledgeSearch: ['POST', '/v1/knowledge/search'],
})

const idempotency = () => `dsh-${crypto.randomUUID()}`
const path = (template, id) => template.replace('{id}', encodeURIComponent(id))

export function createControlPlaneClient({ baseUrl, fetchImpl = globalThis.fetch, token, actorDid, requestId = crypto.randomUUID() }) {
  if (!baseUrl || !fetchImpl) throw new Error('baseUrl and fetchImpl are required')
  const base = baseUrl.replace(/\/$/, '')
  async function request(operation, payload = {}, options = {}) {
    const route = ROUTES[operation]
    if (!route) throw new Error(`Unsupported control-plane operation: ${operation}`)
    const [method, template] = route
    const target = path(template, options.id)
    const headers = { Accept: 'application/json', 'X-Request-ID': requestId, 'X-Actor-DID': actorDid || '' }
    if (token) headers.Authorization = `Bearer ${token}`
    if (method !== 'GET') { headers['Content-Type'] = 'application/json'; headers['Idempotency-Key'] = options.idempotencyKey || idempotency() }
    const response = await fetchImpl(`${base}${target}`, { method, headers, ...(method === 'GET' ? {} : { body: JSON.stringify(payload) }) })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) { const error = body.error || {}; const failure = new Error(error.message || `control plane returned ${response.status}`); failure.status = response.status; failure.code = error.error_code || 'CONTROL_PLANE_ERROR'; failure.retryable = Boolean(error.retryable); throw failure }
    return body
  }
  return Object.freeze({ request, routes: ROUTES })
}

export { ROUTES }
