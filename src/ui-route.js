/**
 * Host HTTP API for the browser half.
 *
 * The client bundle cannot call tools directly, so the Host registers one
 * read-only JSON route with the DSH web server. Every request is fenced with the
 * Connection service: the shipped web composition rejects requests that do not
 * come from an authenticated browser session, and this route refuses anything
 * the fence rejects before reading any plugin state.
 *
 * The route is registered through `ctx.inject(['webServer', 'connection'], ...)`
 * so it only exists when both services are available (headless deployments have
 * no web server and simply skip the browser half).
 *
 * @module dsh-trust-platform/ui-route
 */

/** Prefix shared by every browser-facing route. */
export const API_PREFIX = '/trust-platform/api'

/**
 * Register the read-only browser API.
 *
 * @param ctx - plugin context.
 * @param options.getOverview - async provider returning `buildOverview` output.
 * @returns the injection fiber, or `undefined` when the surface is unavailable.
 */
export function registerUiRoute(ctx, { getOverview }) {
  if (ctx === null || typeof ctx !== 'object') return undefined
  if (typeof ctx.inject !== 'function' || typeof getOverview !== 'function') return undefined
  return ctx.inject(['webServer', 'connection'], (scoped) => {
    const webServer = serviceOf(scoped, 'webServer')
    const connection = serviceOf(scoped, 'connection')
    if (webServer === undefined || typeof webServer.register !== 'function') return
    const handler = (req, res) => handleRequest(req, res, { connection, getOverview })
    scoped.effect(() => webServer.register({ kind: 'prefix', path: API_PREFIX, handler }), 'trust-platform: browser API')
  })
}

/**
 * Resolve a required service from an injected scope.
 *
 * @param scoped - context created by `ctx.inject`.
 * @param name - service name.
 * @returns the service value, or `undefined` when absent.
 */
function serviceOf(scoped, name) {
  if (scoped === null || typeof scoped !== 'object') return undefined
  try {
    const direct = scoped[name]
    if (direct !== undefined) return direct
  } catch {
    // Missing optional services throw on property access; fall back to get().
  }
  try {
    return typeof scoped.get === 'function' ? scoped.get(name) : undefined
  } catch {
    return undefined
  }
}

/**
 * Handle one HTTP request for the browser API.
 *
 * @param req - Node incoming request.
 * @param res - Node server response.
 * @param options.connection - Connection service (browser-trust fence).
 * @param options.getOverview - overview provider.
 */
async function handleRequest(req, res, { connection, getOverview }) {
  try {
    const rejection = fence(connection, req)
    if (rejection !== undefined) {
      sendJson(res, rejection, {
        ok: false,
        error_code: rejection === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        message: 'the browser session is not allowed to call this route',
      })
      return
    }
    const method = typeof req.method === 'string' ? req.method.toUpperCase() : 'GET'
    if (method !== 'GET' && method !== 'HEAD') {
      res.writeHead(405, { allow: 'GET, HEAD', 'cache-control': 'no-store' })
      res.end()
      return
    }
    const pathname = new URL(typeof req.url === 'string' ? req.url : '/', 'http://dsh.internal').pathname
    if (pathname === `${API_PREFIX}/overview`) {
      const overview = await getOverview()
      // Flattened contract: the snapshot fields sit beside `ok` so the browser
      // half does not depend on a nested envelope.
      sendJson(res, 200, { ok: true, ...(overview !== null && typeof overview === 'object' ? overview : {}) })
      return
    }
    if (pathname === `${API_PREFIX}/health`) {
      const overview = await getOverview()
      sendJson(res, 200, { ok: true, plugin: overview?.plugin ?? null, health: overview?.health ?? null })
      return
    }
    sendJson(res, 404, { ok: false, error_code: 'NOT_FOUND', message: 'unknown trust-platform route' })
  } catch (error) {
    if (!res.headersSent) {
      try {
        sendJson(res, 500, { ok: false, error_code: 'INTERNAL_ERROR', message: 'trust-platform overview failed' })
      } catch {
        res.destroy?.()
      }
    } else {
      res.destroy?.()
    }
  }
}

/**
 * Ask the Connection service whether the request may reach Host routes.
 *
 * @param connection - Connection service; may be absent in custom compositions.
 * @param req - Node incoming request.
 * @returns 401/403 when rejected, `undefined` when allowed.
 */
function fence(connection, req) {
  if (connection === undefined || typeof connection.requestRejection !== 'function') return undefined
  try {
    const rejection = connection.requestRejection(req)
    return rejection === 401 || rejection === 403 ? rejection : undefined
  } catch {
    return 403
  }
}

/**
 * Write one JSON response.
 *
 * @param res - Node server response.
 * @param status - HTTP status code.
 * @param body - JSON-serializable body.
 */
function sendJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  })
  res.end(payload)
}
