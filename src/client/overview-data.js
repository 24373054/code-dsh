/**
 * Shared overview transport for the two browser surfaces.
 *
 * The plugin-manager panel and the settings page both render the same
 * same-origin Host snapshot, so the fetch, its error vocabulary, and the
 * poll-while-mounted state machine live here instead of being copied. Every
 * helper is defensive: a missing route, a 403, a 500, malformed JSON, or a
 * transport failure becomes a typed error the caller localizes, never an
 * exception.
 */
import { useEffect, useState } from 'react'
import { normalizeOverviewBody, translate } from './format.js'

/** Same-origin Host route that joins the configured mode and the live stores. */
export const OVERVIEW_URL = '/trust-platform/api/overview'

/** Default poll cadence while a surface is mounted. */
export const DEFAULT_POLL_INTERVAL_MS = 5000

/** Describe an unreachable transport without assuming an Error instance. */
function errorMessage(error) {
  if (error && typeof error === 'object') {
    if (typeof error.message === 'string' && error.message) return error.message
    return String(error)
  }
  return String(error)
}

/**
 * Fetch one overview snapshot.
 *
 * @param {AbortSignal | undefined} signal
 * @returns {Promise<
 *   { data: Record<string, unknown> } |
 *   { aborted: true } |
 *   { error: {
 *     kind: 'unavailable' | 'forbidden' | 'invalid' | 'http' | 'network' | 'host',
 *     status?: number, code?: string, message?: string
 *   } }
 * >}
 */
export async function requestOverview(signal) {
  if (typeof fetch !== 'function') return { error: { kind: 'unavailable' } }

  let response
  try {
    response = await fetch(OVERVIEW_URL, {
      credentials: 'same-origin',
      headers: { accept: 'application/json' },
      signal: signal || undefined
    })
  } catch (error) {
    if (error && (error.name === 'AbortError' || error.code === 'ABORT_ERR')) return { aborted: true }
    return { error: { kind: 'network', message: errorMessage(error) } }
  }

  if (response.status === 401 || response.status === 403) return { error: { kind: 'forbidden' } }
  if (response.status === 404) return { error: { kind: 'unavailable' } }
  if (!response.ok) return { error: { kind: 'http', status: response.status } }

  let body
  try {
    body = await response.json()
  } catch {
    return { error: { kind: 'invalid' } }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body) || body.ok !== true) {
    return {
      error: {
        kind: 'host',
        code: body && typeof body.error_code === 'string' ? body.error_code : 'UNKNOWN',
        message: body && typeof body.message === 'string' ? body.message : ''
      }
    }
  }
  const overview = normalizeOverviewBody(body)
  if (overview === null) return { error: { kind: 'invalid' } }
  return { data: overview }
}

/**
 * Localized one-line explanation for a failed request. `prefix` selects the
 * dictionary family: the plugin-manager panel says `overview`, the settings
 * page says `settings`, so each surface keeps its own copy while sharing the
 * transport.
 *
 * @param {{ kind: string, status?: number, code?: string, message?: string, details?: unknown }} error
 * @param {((key: string, params?: Record<string, unknown>) => string) | undefined} t
 * @param {'overview' | 'settings'} prefix
 */
export function describeError(error, t, prefix = 'overview') {
  switch (error.kind) {
    case 'forbidden':
      return translate(t, `${prefix}.error.forbidden`)
    case 'http':
      return translate(t, `${prefix}.error.http`, { status: error.status })
    case 'network':
      return translate(t, `${prefix}.error.network`, { message: error.message })
    case 'validation':
      return translate(t, `${prefix}.error.validation`, { message: error.message || '—' })
    case 'host':
      return translate(t, `${prefix}.error.host`, { code: error.code, message: error.message || '—' })
    case 'unavailable':
      return translate(t, `${prefix}.unavailable`)
    default:
      return translate(t, `${prefix}.error.invalid`)
  }
}

/**
 * Overview state machine: load on mount, then poll; overlapped polls are
 * skipped, unmount aborts the in-flight request, and a failed refresh keeps the
 * last good snapshot.
 *
 * @param {number} intervalMs poll cadence in milliseconds.
 * @returns {[{
 *   data: Record<string, unknown> | null,
 *   error: { kind: string, status?: number, code?: string, message?: string } | null,
 *   loading: boolean,
 *   refreshedAt: number,
 * }, () => void]} state plus a reload trigger for the manual refresh button.
 */
export function useOverview(intervalMs = DEFAULT_POLL_INTERVAL_MS) {
  const [state, setState] = useState({ data: null, error: null, loading: false, refreshedAt: 0 })
  const [generation, setGeneration] = useState(0)
  const reload = () => setGeneration((value) => value + 1)

  useEffect(() => {
    let disposed = false
    let inFlight = false
    let controller = null

    const load = () => {
      if (disposed || inFlight) return
      inFlight = true
      controller = typeof AbortController === 'function' ? new AbortController() : null
      setState((previous) => ({ ...previous, loading: true }))
      requestOverview(controller ? controller.signal : undefined).then((outcome) => {
        if (disposed) return
        inFlight = false
        if (outcome.data) {
          setState({ data: outcome.data, error: null, loading: false, refreshedAt: Date.now() })
        } else if (outcome.error) {
          setState((previous) => ({ ...previous, loading: false, error: outcome.error }))
        } else {
          setState((previous) => ({ ...previous, loading: false }))
        }
      })
    }

    load()
    const timer = setInterval(load, intervalMs)
    return () => {
      disposed = true
      clearInterval(timer)
      if (controller) controller.abort()
    }
  }, [generation, intervalMs])

  return [state, reload]
}
