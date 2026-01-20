import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

type ThemePreference = 'dark' | 'light' | 'system'
type ResolvedTheme = 'dark' | 'light'

type ThemeContextValue = {
    theme: ThemePreference
    resolvedTheme: ResolvedTheme
    toggleTheme: () => void
    setTheme: (theme: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'app-theme'

function getSystemTheme(): ResolvedTheme {
    if (typeof window === 'undefined') return 'dark'
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function getInitialTheme(): ThemePreference {
    if (typeof window === 'undefined') return 'dark'

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored

    return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemePreference>(getInitialTheme)
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
        const initial = getInitialTheme()
        return initial === 'system' ? getSystemTheme() : initial
    })

    // Update resolved theme when theme preference changes
    useEffect(() => {
        if (theme === 'system') {
            setResolvedTheme(getSystemTheme())
        } else {
            setResolvedTheme(theme)
        }
    }, [theme])

    // Listen for system theme changes when in 'system' mode
    useEffect(() => {
        if (theme !== 'system') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
        const handler = (e: MediaQueryListEvent) => {
            setResolvedTheme(e.matches ? 'light' : 'dark')
        }

        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [theme])

    // Apply theme to document and persist
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme)
        localStorage.setItem(STORAGE_KEY, theme)
    }, [theme, resolvedTheme])

    const setTheme = useCallback((newTheme: ThemePreference) => {
        setThemeState(newTheme)
    }, [])

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => {
            if (prev === 'dark') return 'light'
            if (prev === 'light') return 'system'
            return 'dark'
        })
    }, [])

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

