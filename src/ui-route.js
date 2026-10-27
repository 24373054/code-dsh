/**
 * Host HTTP API for the browser half.
 *
 * The client bundle cannot call tools directly, so the Host registers one JSON
 * route with the DSH web server. Every request is fenced with the Connection
 * service: the shipped web composition rejects requests that do not come from an
 * authenticated browser session, and this route refuses anything the fence
 * rejects before reading or mutating any plugin state.
 *
 * The route is registered through `ctx.inject(['webServer', 'connection'], ...)`
 * so it only exists when both services are available (headless deployments have
 * no web server and simply skip the browser half).
 *
 * @module dsh-trust-platform/ui-route
 */

/** Prefix shared by every browser-facing route. */
export const API_PREFIX = '/trust-platform/api'

/** Maximum accepted JSON body size for settings updates. */
const MAX_BODY_BYTES = 128 * 1024

/**
 * Register the browser API.
 *
 * @param ctx - plugin context.
 * @param api - `{ getOverview, getHealth, getSettings, updateSettings, reset }`
 *   providers backed by the embedded trust plane. All are optional; a missing
 *   provider yields `503 NOT_CONFIGURED` for that route.
 * @returns the injection fiber, or `undefined` when the surface is unavailable.
 */
export function registerUiRoute(ctx, api = {}) {
  if (ctx === null || typeof ctx !== 'object') return undefined
  if (typeof ctx.inject !== 'function') return undefined
  return ctx.inject(['webServer', 'connection'], (scoped) => {
    const webServer = serviceOf(scoped, 'webServer')
    const connection = serviceOf(scoped, 'connection')
    if (webServer === undefined || typeof webServer.register !== 'function') return
    const handler = (req, res) => handleRequest(req, res, { connection, api })
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

/** Error carrying an HTTP status and a stable error code. */
class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * Handle one HTTP request for the browser API.
 */
async function handleRequest(req, res, { connection, api }) {
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
    const pathname = new URL(typeof req.url === 'string' ? req.url : '/', 'http://dsh.internal').pathname

    if (pathname === `${API_PREFIX}/overview`) {
      requireMethod(method, ['GET', 'HEAD'])
      const overview = await provide(api.getOverview)
      respond(res, method, 200, { ok: true, ...asObject(overview) })
      return
    }
    if (pathname === `${API_PREFIX}/health`) {
      requireMethod(method, ['GET', 'HEAD'])
      const health = await provide(api.getHealth)
      respond(res, method, 200, { ok: true, ...asObject(health) })
      return
    }
    if (pathname === `${API_PREFIX}/settings`) {
      if (method === 'GET' || method === 'HEAD') {
        const settings = await provide(api.getSettings)
        respond(res, method, 200, { ok: true, editable: true, ...asObject(settings) })
        return
      }
      if (method === 'PUT') {
        const body = await readJsonBody(req)
        const settings = await provide(() => api.updateSettings?.(body))
        respond(res, method, 200, { ok: true, ...asObject(settings) })
        return
      }
      throw new HttpError(405, 'METHOD_NOT_ALLOWED', 'settings accepts GET and PUT', { allow: 'GET, HEAD, PUT' })
    }
    if (pathname === `${API_PREFIX}/reset`) {
      requireMethod(method, ['POST'])
      const body = await readJsonBody(req)
      if (body.confirm !== true) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'reset requires {"confirm": true}')
      }
      const counts = await provide(() => api.reset?.())
      respond(res, method, 200, { ok: true, counts: asObject(counts) })
      return
    }
    sendJson(res, 404, { ok: false, error_code: 'NOT_FOUND', message: 'unknown trust-platform route' })
  } catch (error) {
    const status = error instanceof HttpError ? error.status : typeof error?.status === 'number' ? error.status : 500
    const body = {
      ok: false,
      error_code: error instanceof HttpError ? error.code : typeof error?.code === 'string' ? error.code : 'INTERNAL_ERROR',
      message: typeof error?.message === 'string' ? error.message : 'trust-platform route failed',
    }
    if (error?.details !== undefined) body.details = error.details
    if (status >= 500) body.error_code = body.error_code === 'INTERNAL_ERROR' ? 'INTERNAL_ERROR' : body.error_code
    if (!res.headersSent) {
      try {
        sendJson(res, status, body)
      } catch {
        res.destroy?.()
      }
    } else {
      res.destroy?.()
    }
  }
}

/** Reject methods that the route does not implement. */
function requireMethod(method, allowed) {
  if (!allowed.includes(method)) {
    throw new HttpError(405, 'METHOD_NOT_ALLOWED', `${method} is not allowed on this route`, { allow: allowed.join(', ') })
  }
}

/** Resolve an optional provider; a missing provider is a configuration error. */
async function provide(provider) {
  if (typeof provider !== 'function') {
    throw new HttpError(503, 'NOT_CONFIGURED', 'this browser route is not available in the current plugin mode')
  }
  return provider()
}

/** Plain object or empty object. */
function asObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

/** Read and parse a bounded JSON request body. */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'PAYLOAD_TOO_LARGE', 'request body is too large'))
        req.destroy?.()
        return
      }
      chunks.push(chunk)
    })
    req.on('error', (error) => reject(new HttpError(400, 'INVALID_REQUEST', error?.message ?? 'request stream failed')))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (raw.trim() === '') return resolve({})
      try {
        const parsed = JSON.parse(raw)
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          reject(new HttpError(400, 'INVALID_JSON', 'request body must be a JSON object'))
          return
        }
        resolve(parsed)
      } catch {
        reject(new HttpError(400, 'INVALID_JSON', 'request body is not valid JSON'))
      }
    })
  })
}

/**
 * Ask the Connection service whether the request may reach Host routes.
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

/** Write one response, honoring HEAD semantics. */
function respond(res, method, status, body) {
  if (method === 'HEAD') {
    const payload = JSON.stringify(body)
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(payload),
      'cache-control': 'no-store',
    })
    res.end()
    return
  }
  sendJson(res, status, body)
}

/**
 * Write one JSON response.
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
