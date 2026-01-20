import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

// Types
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

// Constants
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

// Context
const PreferencesContext = createContext<PreferencesContextValue | null>(null)

// Helper to get initial preferences from localStorage
function getInitialPreferences(): Preferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            // Merge with defaults to ensure all keys exist
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
        // Invalid JSON, use defaults
    }

    return DEFAULT_PREFERENCES
}

// Provider Component
export function PreferencesProvider({ children }: { children: ReactNode }) {
    const [preferences, setPreferences] = useState<Preferences>(getInitialPreferences)

    // Persist to localStorage and apply reduce-motion attribute
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))

        // Apply reduce-motion to body
        if (preferences.reduceMotion) {
            document.body.setAttribute('data-reduce-motion', 'true')
        } else {
            document.body.removeAttribute('data-reduce-motion')
        }
    }, [preferences])

    // Set a single preference
    const setPreference = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: value,
        }))
    }, [])

    // Set a notification preference
    const setNotificationPreference = useCallback(<K extends keyof NotificationPreferences>(key: K, value: boolean) => {
        setPreferences((prev) => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: value,
            },
        }))
    }, [])

    // Reset all preferences to defaults
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

// Custom Hook
export function usePreferences(): PreferencesContextValue {
    const context = useContext(PreferencesContext)
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider')
    }
    return context
}
