import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import test from 'node:test'

import { Config, apply } from '../src/index.js'

/**
 * Minimal Cordis-like host context: captures tools, services and the injected
 * browser surface, and exposes one fake registration route per browser route.
 */
function createHost({ requestRejection } = {}) {
  const tools = new Map()
  const services = new Map()
  const routes = []
  const effects = []
  const scoped = {
    webServer: {
      register(route) {
        routes.push(route)
        return () => {
          const index = routes.indexOf(route)
          if (index >= 0) routes.splice(index, 1)
        }
      },
    },
    connection: {
      requestRejection(req) {
        return typeof requestRejection === 'function' ? requestRejection(req) : undefined
      },
    },
    effect(create) {
      effects.push(create)
      const dispose = create()
      return () => {
        try {
          dispose?.()
        } catch {
          // disposal is best effort in this fake scope
        }
      }
    },
    get(name) {
      return scoped[name]
    },
  }
  const ctx = {
    tools: {
      register(definition) {
        tools.set(definition.name, definition)
        return definition
      },
    },
    provide(service, value) {
      services.set(service, value)
      return () => services.delete(service)
    },
    get(service) {
      return services.get(service)
    },
    effect(create) {
      effects.push(create)
      const dispose = create()
      return () => dispose?.()
    },
    inject(names, callback) {
      assert.deepEqual(names, ['webServer', 'connection'])
      return callback(scoped)
    },
    registeredTools: tools,
    services,
    routes,
  }
  return ctx
}

/** Execute one registered tool directly. */
function run(context, toolName, args = {}) {
  const definition = context.registeredTools.get(toolName)
  assert.ok(definition, `tool ${toolName} should be registered`)
  return definition.execute(args, {})
}

/** Invoke the registered browser route and resolve with the fake response. */
function request(route, { method = 'GET', url = '/trust-platform/api/overview', body } = {}) {
  return new Promise((resolve) => {
    const req = new EventEmitter()
    req.method = method
    req.url = url
    req.headers = {}
    const res = {
      statusCode: 0,
      headers: {},
      body: '',
      headersSent: false,
      writeHead(status, responseHeaders) {
        this.statusCode = status
        this.headers = responseHeaders
        this.headersSent = true
      },
      end(payload) {
        this.body = payload === undefined ? '' : String(payload)
        resolve(this)
      },
      destroy() {
        resolve(this)
      },
    }
    route.handler(req, res)
    if (method !== 'GET' && method !== 'HEAD') {
      if (body !== undefined) req.emit('data', Buffer.from(JSON.stringify(body)))
      req.emit('end')
    }
  })
}

/** Host with a sandbox trust plane and one registered browser route. */
function startHost(options = {}) {
  const ctx = createHost(options)
  apply(ctx, Config({ mode: 'sandbox' }))
  assert.equal(ctx.routes.length, 1)
  return { ctx, route: ctx.routes[0] }
}

/** Parse one JSON response body. */
function json(response) {
  return JSON.parse(response.body)
}

test('browser API registers one fenced prefix route', () => {
  const { ctx, route } = startHost()
  assert.equal(route.kind, 'prefix')
  assert.equal(route.path, '/trust-platform/api')
  assert.equal(typeof route.handler, 'function')
  assert.equal(ctx.registeredTools.size, 58)
})

test('overview reports embedded engine state and counts', async () => {
  const { ctx, route } = startHost()
  await run(ctx, 'register_identity', {
    domain_id: 'bank.example',
    subject_id: 'agent-1',
    display_name: 'Agent One',
  })
  const response = await request(route)
  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['cache-control'], 'no-store')
  const body = json(response)
  assert.equal(body.ok, true)
  assert.equal(body.plugin.name, '@sealwax/dsh-trust-platform')
  assert.equal(body.plugin.mode, 'sandbox')
  assert.equal(body.plugin.source, 'in-memory-sandbox')
  assert.equal(body.plugin.authoritative, false)
  assert.equal(body.counts.identities, 1)
  assert.equal(body.health.engine, 'embedded')
})

test('health reports the embedded engine revision', async () => {
  const { route } = startHost()
  const response = await request(route, { url: '/trust-platform/api/health' })
  assert.equal(response.statusCode, 200)
  const body = json(response)
  assert.equal(body.ok, true)
  assert.equal(body.status, 'ok')
  assert.equal(body.engine, 'embedded')
  assert.equal(body.mode, 'sandbox')
  assert.equal(typeof body.schema_revision, 'string')
  assert.equal(typeof body.started_at, 'string')
})

test('settings are readable and never expose secrets', async () => {
  const { route } = startHost()
  const response = await request(route, { url: '/trust-platform/api/settings' })
  assert.equal(response.statusCode, 200)
  const body = json(response)
  assert.equal(body.ok, true)
  assert.equal(body.editable, true)
  assert.equal(body.mode, 'sandbox')
  assert.equal(body.settings.actorDid, 'system:dsh-web')
  assert.equal(body.settings.allowInterventionExecution, false)
  assert.equal(typeof body.settings.policy.riskDeferThreshold, 'number')
  assert.equal(typeof body.defaults.actorDid, 'string')
  assert.equal(response.body.includes('token'), false)
})

test('settings updates apply immediately and persist in the engine', async () => {
  const { ctx, route } = startHost()
  const response = await request(route, {
    method: 'PUT',
    url: '/trust-platform/api/settings',
    body: { actorDid: 'system:edited', allowInterventionExecution: true, policy: { riskDeferThreshold: 0.55 } },
  })
  assert.equal(response.statusCode, 200)
  const body = json(response)
  assert.equal(body.ok, true)
  assert.equal(body.settings.actorDid, 'system:edited')
  assert.equal(body.settings.allowInterventionExecution, true)
  assert.equal(body.settings.policy.riskDeferThreshold, 0.55)
  assert.equal(typeof body.saved_at, 'string')
  assert.equal(ctx.services.get('trustPlane').settingsSnapshot().settings.actorDid, 'system:edited')
})

test('invalid settings patches are rejected with 422 details', async () => {
  const { route } = startHost()
  const response = await request(route, {
    method: 'PUT',
    url: '/trust-platform/api/settings',
    body: { policy: { riskBlockThreshold: 0.2 } },
  })
  assert.equal(response.statusCode, 422)
  const body = json(response)
  assert.equal(body.ok, false)
  assert.equal(body.error_code, 'VALIDATION_ERROR')
  assert.equal(typeof body.message, 'string')
})

test('reset clears records but keeps settings', async () => {
  const { ctx, route } = startHost()
  await run(ctx, 'register_identity', {
    domain_id: 'bank.example',
    subject_id: 'agent-1',
    display_name: 'Agent One',
  })
  const missingConfirm = await request(route, {
    method: 'POST',
    url: '/trust-platform/api/reset',
    body: { confirm: false },
  })
  assert.equal(missingConfirm.statusCode, 400)
  assert.equal(json(missingConfirm).error_code, 'VALIDATION_ERROR')

  const response = await request(route, { method: 'POST', url: '/trust-platform/api/reset', body: { confirm: true } })
  assert.equal(response.statusCode, 200)
  const body = json(response)
  assert.equal(body.ok, true)
  assert.equal(body.counts.identities, 0)
  assert.equal(ctx.services.get('trustPlane').settingsSnapshot().settings.actorDid, 'system:dsh-web')
})

test('requests rejected by the browser-session fence never reach the engine', async () => {
  const { route } = startHost({ requestRejection: () => 403 })
  const response = await request(route)
  assert.equal(response.statusCode, 403)
  const body = json(response)
  assert.equal(body.ok, false)
  assert.equal(body.error_code, 'FORBIDDEN')
  assert.equal(response.body.includes('plugin'), false)
})

test('unsupported methods and unknown routes are refused', async () => {
  const { route } = startHost()
  const postOverview = await request(route, { method: 'POST', url: '/trust-platform/api/overview' })
  assert.equal(postOverview.statusCode, 405)
  const methodBody = json(postOverview)
  assert.equal(methodBody.error_code, 'METHOD_NOT_ALLOWED')
  assert.equal(methodBody.details.allow, 'GET, HEAD')

  const unknown = await request(route, { url: '/trust-platform/api/nope' })
  assert.equal(unknown.statusCode, 404)
  assert.equal(json(unknown).error_code, 'NOT_FOUND')
})

test('HEAD health responses carry headers without a body', async () => {
  const { route } = startHost()
  const response = await request(route, { method: 'HEAD', url: '/trust-platform/api/health' })
  assert.equal(response.statusCode, 200)
  assert.equal(response.body, '')
  assert.equal(Number(response.headers['content-length']) > 0, true)
})
