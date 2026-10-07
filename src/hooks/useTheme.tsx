import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export type VisualMode = 'heist' | 'professional'

export interface ThemeContextValue {
  mode: VisualMode
  isHeist: boolean
  isProfessional: boolean
  isDark: boolean // backward compatibility
  isTransitioning: boolean
  transitionDirection: 'to-professional' | 'to-heist' | null
  targetMode: VisualMode | null
  setMode: (mode: VisualMode) => void
  toggleMode: () => void
  toggleTheme: () => void // backward compatibility
  completeTransition: () => void
  applyRoleDefaultTheme: (role?: string | null) => VisualMode
  resetThemeOnSignOut: () => void
}

const STORAGE_KEY = 'lcdr_visual_mode'
const LEGACY_STORAGE_KEY = 'theme'

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Centralized Role -> Default Theme Resolver.
 * Sources of truth:
 * - CANDIDATE -> HEIST MODE
 * - RECRUITER (and enterprise roles) -> PROFESSIONAL MODE
 * - Other roles / unauthenticated -> HEIST MODE
 *
 * Normalizes case and whitespace.
 */
export function resolveDefaultTheme(role?: string | null): VisualMode {
  if (!role) return 'heist'
  const normalized = role.trim().toLowerCase()
  if (normalized === 'candidate') {
    return 'heist'
  }
  if (
    normalized === 'recruiter' ||
    normalized === 'employer_admin' ||
    normalized === 'employer'
  ) {
    return 'professional'
  }
  return 'heist'
}

export function applyDomTheme(mode: VisualMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  root.removeAttribute('data-page')
  root.setAttribute('data-theme', mode)

  if (mode === 'professional') {
    root.classList.add('light', 'theme-professional')
    root.classList.remove('theme-heist', 'dark')
  } else {
    root.classList.remove('light', 'theme-professional')
    root.classList.add('theme-heist', 'dark')
  }
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<VisualMode>(() => {
    if (typeof window === 'undefined') return 'heist'
    // 1. Check primary persistent key
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'heist' || saved === 'professional') {
      return saved
    }
    // 2. Check legacy key
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy === 'light') return 'professional'
    if (legacy === 'dark') return 'heist'
    // 3. Fallback to system preference (defaulting to heist if dark)
    if (window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'heist' : 'professional'
    }
    return 'heist'
  })

  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'to-professional' | 'to-heist' | null>(null)
  const [targetMode, setTargetMode] = useState<VisualMode | null>(null)

  const transitionTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialize DOM on mount & when mode changes
  useEffect(() => {
    applyDomTheme(mode)
  }, [mode])

  // Cleanup any lingering timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  const completeTransition = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    setIsTransitioning(false)
    setTransitionDirection(null)
    setTargetMode(null)
  }, [])

  const setMode = useCallback(
    (newMode: VisualMode) => {
      if (newMode === mode) return

      // 1. Immediately apply theme to state and persistent storage
      setModeState(newMode)
      applyDomTheme(newMode)
      try {
        localStorage.setItem(STORAGE_KEY, newMode)
        localStorage.setItem(LEGACY_STORAGE_KEY, newMode === 'heist' ? 'dark' : 'light')
      } catch {
        // Safe fallback if local storage is restricted
      }

      // 2. Clear any existing transition timer
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }

      // 3. Trigger lightweight non-blocking sweep animation
      const direction = newMode === 'professional' ? 'to-professional' : 'to-heist'
      setIsTransitioning(true)
      setTransitionDirection(direction)
      setTargetMode(newMode)

      // 4. Snappy auto-complete after 260ms (smooth, lightweight sweep)
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false)
        setTransitionDirection(null)
        setTargetMode(null)
        transitionTimeoutRef.current = null
      }, 260)
    },
    [mode]
  )

  const toggleMode = useCallback(() => {
    const nextMode: VisualMode = mode === 'heist' ? 'professional' : 'heist'
    setMode(nextMode)
  }, [mode, setMode])

  /**
   * Applies the role-based default theme upon new successful login/registration.
   * Resets any stale theme state from a previous user or role default.
   */
  const applyRoleDefaultTheme = useCallback((role?: string | null): VisualMode => {
    const defaultTheme = resolveDefaultTheme(role)

    // 1. Set mode state immediately
    setModeState(defaultTheme)

    // 2. Persist to storage for the authenticated session
    try {
      localStorage.setItem(STORAGE_KEY, defaultTheme)
      localStorage.setItem(LEGACY_STORAGE_KEY, defaultTheme === 'heist' ? 'dark' : 'light')
    } catch {
      // Safe fallback
    }

    // 3. Reset any active transition animation so there is no animation sweep flash during login redirect
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    setIsTransitioning(false)
    setTransitionDirection(null)
    setTargetMode(null)

    return defaultTheme
  }, [])

  /**
   * Cleans up authentication-specific theme state on sign out.
   * Guarantees the login page returns strictly to Heist mode and prevents theme leakage to the next session.
   */
  const resetThemeOnSignOut = useCallback(() => {
    setModeState('heist')
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // Safe fallback
    }

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    setIsTransitioning(false)
    setTransitionDirection(null)
    setTargetMode(null)

    // Ensure DOM root is immediately strictly set to Heist for the login page
    applyDomTheme('heist', true)
  }, [])

  const contextValue: ThemeContextValue = {
    mode,
    isHeist: mode === 'heist',
    isProfessional: mode === 'professional',
    isDark: mode === 'heist',
    isTransitioning,
    transitionDirection,
    targetMode,
    setMode,
    toggleMode,
    toggleTheme: toggleMode,
    completeTransition,
    applyRoleDefaultTheme,
    resetThemeOnSignOut,
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    // Graceful fallback for components mounted outside provider
    const isDark = typeof document !== 'undefined' && !document.documentElement.classList.contains('light')
    return {
      mode: (isDark ? 'heist' : 'professional') as VisualMode,
      isHeist: isDark,
      isProfessional: !isDark,
      isDark,
      isTransitioning: false,
      transitionDirection: null,
      targetMode: null,
      setMode: () => {},
      toggleMode: () => {},
      toggleTheme: () => {},
      completeTransition: () => {},
      applyRoleDefaultTheme: (role?: string | null) => resolveDefaultTheme(role),
      resetThemeOnSignOut: () => {},
    }
  }
  return context
}

export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollPosition
}

export { useWindowSize } from './useWindowSize'
