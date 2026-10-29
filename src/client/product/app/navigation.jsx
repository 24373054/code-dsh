/**
 * In-panel navigation for the trust-platform console.
 *
 * The console is one DSH main panel, so it owns its own page stack without
 * touching the DSH address bar. Pages are plain strings plus optional params
 * (a task id, an agent id); `back()` pops the stack.
 */
import { createContext, useContext, useMemo, useState } from 'react'

/** Context carrying the current route and navigation helpers. */
const NavigationContext = createContext(null)

/**
 * Route provider for the console.
 * @param {{children: any}} props
 */
export function NavigationProvider({ children }) {
  const [stack, setStack] = useState([{ page: 'dashboard', params: {} }])

  const value = useMemo(() => {
    const current = stack[stack.length - 1]
    return {
      route: current,
      /**
       * Push a page. Re-using the top page for the same page+id replaces it
       * instead of duplicating history.
       * @param {string} page
       * @param {object} [params]
       */
      navigate(page, params = {}) {
        setStack(currentStack => {
          const top = currentStack[currentStack.length - 1]
          const same = top.page === page && (top.params?.taskId || top.params?.agentId || '') === (params?.taskId || params?.agentId || '')
          return same ? currentStack : [...currentStack, { page, params }]
        })
      },
      back() {
        setStack(currentStack => (currentStack.length > 1 ? currentStack.slice(0, -1) : currentStack))
      },
      /** Jump to a top-level tab, clearing the stack. */
      go(page) {
        setStack([{ page, params: {} }])
      }
    }
  }, [stack])

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

/** Read the console navigation face. */
export function useNavigation() {
  const value = useContext(NavigationContext)
  if (!value) throw new Error('useNavigation must be used inside NavigationProvider')
  return value
}
