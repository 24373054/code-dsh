import assert from 'node:assert/strict'
import test from 'node:test'

import { Config, apply } from '../src/index.js'
import { API_PREFIX, registerUiRoute } from '../src/ui-route.js'

/**
 * Minimal Cordis-like context for the in-memory mode plus the browser surface.
 *
 * @param options.rejection - value returned by the Connection fence.
 * @returns capture object with registered tools, routes and injections.
 */
function createHostContext({ rejection } = {}) {
  const tools = new Map()
  const routes = []
  const injections = []
  return {
    tools: {
      register(definition) {
        tools.set(definition.name, definition)
        return definition
      },
    },
    inject(deps, callback) {
      injections.push(deps)
      const scoped = {
        webServer: {
          register(route) {
            routes.push(route)
            return () => routes.splice(routes.indexOf(route), 1)
          },
        },
        connection: { requestRejection: () => rejection },
        effect(effect) {
          return effect()
        },
      }
      callback(scoped)
      return { dispose() {} }
    },
    registeredTools: tools,
    routes,
    injections,
  }
}

/** Run one registered tool directly. */
function run(context, toolName, args = {}) {
  const definition = context.registeredTools.get(toolName)
  assert.ok(definition, `tool ${toolName} should be registered`)
  return definition.execute(args, {})
}

/** Build a fake Node request. */
function createRequest({ method = 'GET', url = '/' } = {}) {
  return { method, url, headers: {} }
}

/** Build a fake Node response capturing the written status, headers and body. */
function createResponse() {
  const captured = { status: 0, headers: {}, body: '', headersSent: false }
  return {
    captured,
    writeHead(status, headers) {
      captured.status = status
      captured.headers = headers ?? {}
      captured.headersSent = true
    },
    end(body) {
      captured.body = body ?? ''
      captured.headersSent = true
    },
  }
}

/** Register the route through apply and invoke it once. */
async function callRoute(context, request, handlerOptions) {
  const route = context.routes[0]
  assert.ok(route, 'the trust-platform route should be registered')
  const response = createResponse()
  await route.handler(request, response)
  return { route, response, payload: response.captured.body === '' ? null : JSON.parse(response.captured.body) }
}

test('browser API registers one web-server prefix route guarded by connection', () => {
  const ctx = createHostContext()
  apply(ctx, Config({}))
  assert.deepEqual(ctx.injections, [['webServer', 'connection']])
  assert.equal(ctx.routes.length, 1)
  const route = ctx.routes[0]
  assert.equal(route.kind, 'prefix')
  assert.equal(route.path, API_PREFIX)
  assert.equal(typeof route.handler, 'function')
})

test('overview reports sandbox records and recent operation events', async () => {
  const ctx = createHostContext()
  apply(ctx, Config({}))
  const identity = await run(ctx, 'register_identity', {
    did: 'did:trust:demo:ui-agent',
    domain: 'demo',
    display_name: 'UI Agent',
  })
  assert.equal(identity.ok, true)
  const authorization = await run(ctx, 'check_authorization', {
    did: 'did:trust:demo:ui-agent',
    beneficiary: 'shop.example',
    amount: 25,
    currency: 'USD',
  })
  assert.equal(authorization.ok, true)
  const task = await run(ctx, 'create_payment_task', {
    authorization_id: authorization.authorization.id,
    purpose: 'UI overview test',
  })
  assert.equal(task.ok, true)
  const event = await run(ctx, 'submit_operation_event', {
    task_id: task.task.id,
    event_type: 'PAYREQ',
    event_ref: 'external-ui-1',
  })
  assert.equal(event.ok, true)

  const { response, payload } = await callRoute(ctx, createRequest({ url: `${API_PREFIX}/overview` }))
  assert.equal(response.captured.status, 200)
  assert.equal(response.captured.headers['cache-control'], 'no-store')
  assert.equal(payload.ok, true)
  const overview = payload
  assert.equal(overview.plugin.name, '@sealwax/dsh-trust-platform')
  assert.equal(overview.plugin.mode, 'in-memory')
  assert.equal(overview.plugin.source, 'in-memory-sandbox')
  assert.equal(overview.plugin.authoritative, false)
  assert.match(overview.plugin.version, /^\d+\.\d+\.\d+/)
  assert.equal(overview.health.status, 'sandbox')
  assert.deepEqual(overview.counts, {
    identities: 1,
    credentials: 0,
    authorizations: 1,
    tasks: 1,
    events: 1,
    receipts: 0,
  })
  assert.equal(overview.recent_events.length, 1)
  assert.equal(overview.recent_events[0].event_type, 'PAYREQ')
  assert.equal(overview.recent_events[0].task_id, task.task.id)
  assert.equal(typeof overview.recent_events[0].occurred_at, 'string')
})

test('health endpoint returns the plugin snapshot without the record counts', async () => {
  const ctx = createHostContext()
  apply(ctx, Config({}))
  const { response, payload } = await callRoute(ctx, createRequest({ url: `${API_PREFIX}/health` }))
  assert.equal(response.captured.status, 200)
  assert.equal(payload.ok, true)
  assert.equal(payload.plugin.mode, 'in-memory')
  assert.equal(payload.health.status, 'sandbox')
  assert.equal(payload.overview, undefined)
})

test('requests rejected by the browser-session fence never reach plugin state', async () => {
  const ctx = createHostContext({ rejection: 403 })
  apply(ctx, Config({}))
  const { response, payload } = await callRoute(ctx, createRequest({ url: `${API_PREFIX}/overview` }))
  assert.equal(response.captured.status, 403)
  assert.equal(payload.ok, false)
  assert.equal(payload.error_code, 'FORBIDDEN')
  assert.equal(payload.overview, undefined)
})

test('non-GET methods and unknown routes are refused', async () => {
  const ctx = createHostContext()
  apply(ctx, Config({}))
  const post = await callRoute(ctx, createRequest({ method: 'POST', url: `${API_PREFIX}/overview` }))
  assert.equal(post.response.captured.status, 405)
  assert.equal(post.response.captured.headers.allow, 'GET, HEAD')
  const unknown = await callRoute(ctx, createRequest({ url: `${API_PREFIX}/wallet` }))
  assert.equal(unknown.response.captured.status, 404)
  assert.equal(unknown.payload.error_code, 'NOT_FOUND')
})

test('registerUiRoute is a no-op when the context has no inject surface', () => {
  const ctx = { tools: { register() {} } }
  assert.equal(registerUiRoute(ctx, { getOverview: async () => ({}) }), undefined)
  apply(ctx, Config({}))
})
