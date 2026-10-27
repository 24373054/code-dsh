import assert from 'node:assert/strict'
import test from 'node:test'

import { ControlPlaneError, ROUTES, createControlPlaneClient, validateBaseUrl } from '../src/control-plane-client.js'

/** JSON response helper. */
function jsonResponse(body, { status = 200, headers = {} } = {}) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

/** Fetch stub recording every call and delegating to `handler`. */
function stubFetch(handler) {
  const calls = []
  const fetchImpl = async (url, init) => {
    calls.push({ url, init })
    return handler(url, init)
  }
  return { fetchImpl, calls }
}

test('baseUrl validation rejects missing, relative, non-http and credential URLs', () => {
  assert.equal(validateBaseUrl('http://127.0.0.1:8080/'), 'http://127.0.0.1:8080')
  assert.throws(() => createControlPlaneClient({ baseUrl: '', fetchImpl: async () => jsonResponse({}) }), /baseUrl/)
  assert.throws(() => createControlPlaneClient({ baseUrl: '/relative', fetchImpl: async () => jsonResponse({}) }), /baseUrl/)
  assert.throws(() => createControlPlaneClient({ baseUrl: 'ftp://host', fetchImpl: async () => jsonResponse({}) }), /baseUrl/)
  assert.throws(
    () => createControlPlaneClient({ baseUrl: 'http://user:secret@host', fetchImpl: async () => jsonResponse({}) }),
    /baseUrl/,
  )
  assert.throws(
    () => createControlPlaneClient({ baseUrl: 'http://host', fetchImpl: async () => jsonResponse({}), timeoutMs: 0 }),
    /timeoutMs/,
  )
})

test('routes are frozen, named, fixed and use the real report paths', () => {
  assert.equal(Object.isFrozen(ROUTES), true)
  assert.ok(Object.keys(ROUTES).length >= 50)
  for (const [operation, route] of Object.entries(ROUTES)) {
    assert.equal(route.method === 'GET' || route.method === 'POST', true, `${operation} method`)
    assert.equal(route.path.startsWith('/'), true, `${operation} path is absolute`)
    assert.doesNotMatch(route.path, /^https?:/, `${operation} must not contain a URL`)
    assert.ok(['required', 'optional', 'none'].includes(route.idempotency), `${operation} idempotency`)
  }
  assert.deepEqual(ROUTES.reportCreate, { method: 'POST', path: '/v1/cases/{case_id}/report', idempotency: 'required' })
  assert.deepEqual(ROUTES.reportGet, { method: 'GET', path: '/v1/reports/{report_id}', idempotency: 'none' })
  assert.deepEqual(ROUTES.eventCreate, { method: 'POST', path: '/v1/events', idempotency: 'required' })
  assert.equal('sendMoney' in ROUTES, false)
})

test('unknown operations are rejected without issuing a request', async () => {
  const { fetchImpl, calls } = stubFetch(() => jsonResponse({}))
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', fetchImpl })
  await assert.rejects(() => client.request('arbitraryUrl', {}), (error) => {
    assert.ok(error instanceof ControlPlaneError)
    assert.equal(error.code, 'TRUST_UNKNOWN_OPERATION')
    return true
  })
  assert.equal(calls.length, 0)
})

test('reads send no idempotency key and omit empty actor and auth headers', async () => {
  const { fetchImpl, calls } = stubFetch((url, init) =>
    jsonResponse({ status: 'ok' }, { headers: { 'x-request-id': init.headers['X-Request-ID'] } }),
  )
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', fetchImpl })
  const response = await client.request('health')
  assert.equal(calls.length, 1)
  const { url, init } = calls[0]
  assert.equal(url, 'http://127.0.0.1:8080/health')
  assert.equal(init.method, 'GET')
  assert.equal(init.body, undefined)
  assert.equal(init.headers['Idempotency-Key'], undefined)
  assert.equal(init.headers.Authorization, undefined)
  assert.equal(init.headers['X-Actor-DID'], undefined)
  assert.equal(typeof init.headers['X-Request-ID'], 'string')
  assert.deepEqual(response.data, { status: 'ok' })
  assert.equal(response.status, 200)
  assert.equal(response.requestId, init.headers['X-Request-ID'])
})

test('writes send JSON, idempotency and identity headers', async () => {
  const { fetchImpl, calls } = stubFetch(() => jsonResponse({ id: 'evt-1' }, { status: 201 }))
  const client = createControlPlaneClient({
    baseUrl: 'https://trust.example',
    token: 'token-1',
    actorDid: 'did:trust:demo:agent',
    fetchImpl,
  })
  const response = await client.request('eventCreate', { event_type: 'PAYREQ', task_id: 'task-1' })
  assert.equal(calls.length, 1)
  const { url, init } = calls[0]
  assert.equal(url, 'https://trust.example/v1/events')
  assert.equal(init.method, 'POST')
  assert.equal(init.headers.Authorization, 'Bearer token-1')
  assert.equal(init.headers['X-Actor-DID'], 'did:trust:demo:agent')
  assert.equal(init.headers['Content-Type'], 'application/json')
  assert.match(init.headers['Idempotency-Key'], /^dsh-/)
  assert.deepEqual(JSON.parse(init.body), { event_type: 'PAYREQ', task_id: 'task-1' })
  assert.equal(response.status, 201)
  assert.deepEqual(response.data, { id: 'evt-1' })
})

test('idempotency policy follows the server: optional routes still keyed, none routes not', async () => {
  const { fetchImpl, calls } = stubFetch(() => jsonResponse({}))
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', fetchImpl })
  await client.request('didRegister', { domain_id: 'demo', subject_id: 'a', display_name: 'A' })
  assert.match(calls[0].init.headers['Idempotency-Key'], /^dsh-/, 'optional writes get a generated key')
  await client.request('credentialVerify', { credential: {} })
  assert.equal(calls[1].init.headers['Idempotency-Key'], undefined, 'routes without an idempotency dependency omit the key')
  await client.request('eventCreate', {}, { idempotencyKey: 'idem-explicit' })
  assert.equal(calls[2].init.headers['Idempotency-Key'], 'idem-explicit')
})

test('query parameters are appended and undefined values skipped', async () => {
  const { fetchImpl, calls } = stubFetch(() => jsonResponse([]))
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', fetchImpl })
  await client.request('taskList', undefined, { query: { status: 'OPEN', limit: 5, missing: undefined } })
  const url = new URL(calls[0].url)
  assert.equal(url.pathname, '/v1/tasks')
  assert.equal(url.searchParams.get('status'), 'OPEN')
  assert.equal(url.searchParams.get('limit'), '5')
  assert.equal(url.searchParams.has('missing'), false)
})

test('path placeholders are validated and percent-encoded', async () => {
  const { fetchImpl, calls } = stubFetch(() => jsonResponse({}))
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', fetchImpl })
  await client.request('didGet', undefined, { path: { did: 'did:trust:demo:agent' } })
  assert.equal(calls[0].url, 'http://127.0.0.1:8080/v1/dids/did%3Atrust%3Ademo%3Aagent')
  await assert.rejects(() => client.request('didGet', undefined, { path: {} }), (error) => {
    assert.equal(error.code, 'TRUST_PATH_PARAMETER_MISSING')
    return true
  })
})

test('flat service errors map onto ControlPlaneError fields', async () => {
  const { fetchImpl } = stubFetch(() =>
    jsonResponse(
      {
        error_code: 'DELEGATION_NOT_FOUND',
        message: 'delegation not found',
        request_id: 'req-404',
        retryable: false,
        evidence_refs: ['evidence-1'],
        policy_version: 'policy-2026-10-25-001',
      },
      { status: 404 },
    ),
  )
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', fetchImpl })
  await assert.rejects(() => client.request('delegationGet', undefined, { path: { delegation_id: 'd-1' } }), (error) => {
    assert.ok(error instanceof ControlPlaneError)
    assert.equal(error.code, 'DELEGATION_NOT_FOUND')
    assert.equal(error.message, 'delegation not found')
    assert.equal(error.status, 404)
    assert.equal(error.requestId, 'req-404')
    assert.equal(error.retryable, false)
    assert.deepEqual(error.evidenceRefs, ['evidence-1'])
    assert.equal(error.policyVersion, 'policy-2026-10-25-001')
    return true
  })
})

test('validation errors keep details and server retryability', async () => {
  const { fetchImpl } = stubFetch(() =>
    jsonResponse(
      {
        error_code: 'VALIDATION_ERROR',
        message: 'request validation failed',
        request_id: 'req-422',
        retryable: false,
        evidence_refs: [],
        policy_version: 'policy-2026-10-25-001',
        details: [{ location: ['body', 'subject_did'], message: 'field required' }],
      },
      { status: 422 },
    ),
  )
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', fetchImpl })
  await assert.rejects(() => client.request('riskEvaluate', { task_id: 't-1' }), (error) => {
    assert.equal(error.code, 'VALIDATION_ERROR')
    assert.equal(error.status, 422)
    assert.deepEqual(error.details, [{ location: ['body', 'subject_did'], message: 'field required' }])
    return true
  })
})

test('failures without a service body still produce retryable HTTP errors', async () => {
  const { fetchImpl } = stubFetch(() => new Response('gateway down', { status: 503 }))
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', fetchImpl })
  await assert.rejects(() => client.request('health'), (error) => {
    assert.equal(error.code, 'TRUST_HTTP_503')
    assert.equal(error.status, 503)
    assert.equal(error.retryable, true)
    assert.match(error.message, /503/)
    return true
  })
})

test('successful responses with invalid JSON are rejected', async () => {
  const { fetchImpl } = stubFetch(() => new Response('<html>not json</html>', { status: 200 }))
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', fetchImpl })
  await assert.rejects(() => client.request('health'), (error) => {
    assert.equal(error.code, 'TRUST_INVALID_RESPONSE')
    return true
  })
})

test('transport failures are reported as retryable', async () => {
  const { fetchImpl } = stubFetch(() => {
    throw new Error('connection refused')
  })
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', fetchImpl })
  await assert.rejects(() => client.request('health'), (error) => {
    assert.equal(error.code, 'TRUST_TRANSPORT_ERROR')
    assert.equal(error.retryable, true)
    assert.match(error.message, /connection refused/)
    return true
  })
})

test('per-request timeouts abort the fetch and map to TRUST_TIMEOUT', async () => {
  const fetchImpl = (_url, init) =>
    new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
    })
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', fetchImpl, timeoutMs: 20 })
  await assert.rejects(() => client.request('health'), (error) => {
    assert.equal(error.code, 'TRUST_TIMEOUT')
    assert.equal(error.retryable, true)
    return true
  })
})

test('caller cancellation maps to TRUST_ABORTED', async () => {
  const fetchImpl = (_url, init) =>
    new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
    })
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', fetchImpl, timeoutMs: 5000 })
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(() => client.request('health', undefined, { signal: controller.signal }), (error) => {
    assert.equal(error.code, 'TRUST_ABORTED')
    return true
  })
})

test('the client never exposes the configured token', () => {
  const { fetchImpl } = stubFetch(() => jsonResponse({}))
  const client = createControlPlaneClient({ baseUrl: 'http://127.0.0.1:8080', token: 'top-secret', fetchImpl })
  assert.equal(JSON.stringify(client).includes('top-secret'), false)
  assert.equal('token' in client, false)
})
