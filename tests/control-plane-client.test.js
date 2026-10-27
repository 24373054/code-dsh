import test from 'node:test'
import assert from 'node:assert/strict'
import { createControlPlaneClient } from '../src/control-plane-client.js'

test('uses only fixed control-plane routes and security headers', async () => {
  let captured
  const client = createControlPlaneClient({ baseUrl: 'https://trust.example/', token: 'token', actorDid: 'did:example:a', requestId: 'req-1', fetchImpl: async (url, init) => { captured = { url, init }; return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }) } })
  await client.request('eventIngest', { event_type: 'RESULT' }, { idempotencyKey: 'idem-1' })
  assert.equal(captured.url, 'https://trust.example/v1/events')
  assert.equal(captured.init.headers.Authorization, 'Bearer token')
  assert.equal(captured.init.headers['X-Actor-DID'], 'did:example:a')
  assert.equal(captured.init.headers['X-Request-ID'], 'req-1')
  assert.equal(captured.init.headers['Idempotency-Key'], 'idem-1')
  await assert.rejects(() => client.request('arbitraryUrl', {}), /Unsupported control-plane operation/)
})

test('does not expose execution or mutation routes', () => {
  const client = createControlPlaneClient({ baseUrl: 'http://localhost:8080', fetchImpl: async () => new Response('{}') })
  assert.equal('executeIntervention' in client.routes, false)
  assert.equal('sendMoney' in client.routes, false)
})
