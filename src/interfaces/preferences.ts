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
