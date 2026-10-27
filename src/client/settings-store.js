/**
 * Polling state machine for the trust-platform settings page.
 *
 * The page needs two snapshots per refresh — the editable settings and the
 * embedded engine health — so the hook loads both together, skips overlapped
 * polls, aborts the in-flight request on unmount and keeps the last good
 * settings when a refresh fails. The component derives its form draft from the
 * returned snapshot; a failed refresh never clears what the user sees.
 */
import { useEffect, useState } from 'react'
import { requestHealth, requestSettings } from './settings-data.js'

/** Poll cadence while the settings page is mounted. */
export const DEFAULT_SETTINGS_REFRESH_MS = 10000

/**
 * @param {number} intervalMs poll cadence in milliseconds.
 * @returns {[{
 *   data: ReturnType<typeof import('./settings-data.js').normalizeSettingsPayload> | null,
 *   health: ReturnType<typeof import('./settings-data.js').normalizeHealthPayload> | null,
 *   error: { kind: string, status?: number, code?: string, message?: string, details?: unknown } | null,
 *   healthError: { kind: string } | null,
 *   loading: boolean,
 *   refreshedAt: number,
 * }, () => void]} state plus a reload trigger for the manual refresh button.
 */
export function useSettings(intervalMs = DEFAULT_SETTINGS_REFRESH_MS) {
  const [state, setState] = useState({
    data: null,
    health: null,
    error: null,
    healthError: null,
    loading: false,
    refreshedAt: 0
  })
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
      const signal = controller ? controller.signal : undefined
      setState((previous) => ({ ...previous, loading: true }))
      Promise.all([requestSettings(signal), requestHealth(signal)]).then(([settingsOutcome, healthOutcome]) => {
        if (disposed) return
        inFlight = false
        setState((previous) => {
          const next = { ...previous, loading: false }
          if (healthOutcome && healthOutcome.data) next.health = healthOutcome.data
          else if (healthOutcome && healthOutcome.error) next.healthError = healthOutcome.error
          if (settingsOutcome && settingsOutcome.data) {
            next.data = settingsOutcome.data
            next.error = null
            next.refreshedAt = Date.now()
          } else if (settingsOutcome && settingsOutcome.error) {
            next.error = settingsOutcome.error
          }
          return next
        })
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
