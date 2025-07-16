import * as React from "react"

const MOBILE_BREAKPOINT = 640 // Tailwind's sm breakpoint

// Create a shared state that can be used across the app
let globalIsMobile: boolean | undefined = undefined
const listeners = new Set<(isMobile: boolean) => void>()

function checkMobile(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT
}

// Update global state and notify all listeners
function updateMobileState() {
  const newState = checkMobile()
  if (globalIsMobile !== newState) {
    globalIsMobile = newState
    listeners.forEach(listener => listener(newState))
  }
}

// Initialize once at module level if in browser environment
if (typeof window !== 'undefined') {
  globalIsMobile = checkMobile()
  window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    .addEventListener("change", updateMobileState)
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    // Use the global value or false as fallback for SSR
    typeof globalIsMobile !== 'undefined' ? globalIsMobile : false
  )

  React.useEffect(() => {
    // Subscribe to changes
    const listener = (value: boolean) => setIsMobile(value)
    listeners.add(listener)
    
    // If the value was undefined before (SSR), update it now
    if (typeof globalIsMobile === 'undefined') {
      updateMobileState()
    } else if (isMobile !== globalIsMobile) {
      // Make sure we're in sync with the global value
      setIsMobile(globalIsMobile)
    }
    
    return () => {
      listeners.delete(listener)
    }
  }, [isMobile])

  return isMobile
}
