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
    const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme())

    // Ouve alterações do tema do sistema (sempre ativo para manter o estado atualizado)
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
        const handler = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'light' : 'dark')
        }

        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [])

    // Calcula o tema resolvido
    const resolvedTheme = theme === 'system' ? systemTheme : theme

    // Aplica o tema ao documento e persiste
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme)
        localStorage.setItem(STORAGE_KEY, theme)
    }, [theme, resolvedTheme])

    const setTheme = useCallback((newTheme: ThemePreference) => {
        setThemeState(newTheme)
    }, [])

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => {
            // Se estiver em modo sistema, inverte o tema atual resolvido
            if (prev === 'system') {
                return resolvedTheme === 'dark' ? 'light' : 'dark'
            }
            // Caso contrário, apenas alterna entre claro e escuro
            return prev === 'dark' ? 'light' : 'dark'
        })
    }, [resolvedTheme])

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
    }
    return context
}
