/**
 * React bindings for the demo world.
 *
 * `useSyncExternalStore` keeps every page in step with the store; actions are
 * stable because the store instance is a singleton for the panel's lifetime.
 */
import { useSyncExternalStore } from 'react'
import { getDemoStore } from './mock/store.js'

const store = () => getDemoStore()

/**
 * Subscribe to the whole demo world.
 * @returns {object} world snapshot
 */
export function useWorld() {
  return useSyncExternalStore(
    listener => store().subscribe(listener),
    () => store().getSnapshot(),
    () => store().getServerSnapshot()
  )
}

/**
 * The mutating actions of the demo world.
 * @returns {object}
 */
export function useActions() {
  return store().actions
}

/**
 * Reset the demo world (exposed from the settings page).
 */
export function resetDemoWorld() {
  store().actions.resetDemo()
}
