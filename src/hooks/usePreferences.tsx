import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type NotificationPreferences = {
    expirationAlerts: boolean
    newPromotions: boolean
    weeklySummary: boolean
}

export type Preferences = {
    reduceMotion: boolean
    hideValues: boolean
    notifications: NotificationPreferences
}

type PreferencesContextValue = {
    preferences: Preferences
    setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
    setNotificationPreference: <K extends keyof NotificationPreferences>(key: K, value: boolean) => void
    resetPreferences: () => void
}

const STORAGE_KEY = 'app-preferences'

const DEFAULT_PREFERENCES: Preferences = {
    reduceMotion: false,
    hideValues: false,
    notifications: {
        expirationAlerts: true,
        newPromotions: true,
        weeklySummary: false,
    },
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

// Helper para obter preferências iniciais do localStorage
function getInitialPreferences(): Preferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            // Mescla com os padrões para garantir que todas as chaves existam
            return {
                ...DEFAULT_PREFERENCES,
                ...parsed,
                notifications: {
                    ...DEFAULT_PREFERENCES.notifications,
                    ...parsed.notifications,
                },
            }
        }
    } catch {
        // JSON inválido, usa padrões
    }

    return DEFAULT_PREFERENCES
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const [preferences, setPreferences] = useState<Preferences>(getInitialPreferences)

    // Persiste no localStorage e aplica o atributo reduce-motion
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))

        // Aplica reduce-motion no body
        if (preferences.reduceMotion) {
            document.body.setAttribute('data-reduce-motion', 'true')
        } else {
            document.body.removeAttribute('data-reduce-motion')
        }
    }, [preferences])

    // Define uma única preferência
    const setPreference = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: value,
        }))
    }, [])

    // Define uma preferência de notificação
    const setNotificationPreference = useCallback(<K extends keyof NotificationPreferences>(key: K, value: boolean) => {
        setPreferences((prev) => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: value,
            },
        }))
    }, [])

    // Reseta todas as preferências para os padrões
    const resetPreferences = useCallback(() => {
        setPreferences(DEFAULT_PREFERENCES)
    }, [])

    return (
        <PreferencesContext.Provider
            value={{
                preferences,
                setPreference,
                setNotificationPreference,
                resetPreferences,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    )
}

export function usePreferences(): PreferencesContextValue {
    const context = useContext(PreferencesContext)
    if (!context) {
        throw new Error('usePreferences deve ser usado dentro de um PreferencesProvider')
    }
    return context
}
