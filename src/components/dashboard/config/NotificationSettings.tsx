
import { usePreferences } from '../../../hooks/usePreferences'
import { Toggle } from '../../ui/Toggle'

export function NotificationSettings() {
    const { preferences, setNotificationPreference } = usePreferences()

    return (
        <div className="space-y-6">
            <div className="dashboard-card">
                <div className="section-header">
                    <div className="card-icon">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h2 className="section-title">Preferências de Notificação</h2>
                        <p className="text-xs text-fg-secondary">Escolha quais alertas deseja receber</p>
                    </div>
                </div>

                <div className="mt-4 divide-y divide-white/10">
                    <Toggle
                        enabled={preferences.notifications.expirationAlerts}
                        onToggle={() => setNotificationPreference('expirationAlerts', !preferences.notifications.expirationAlerts)}
                        label="Alertas de expiração de pontos"
                        description="Receba avisos quando seus pontos estiverem próximos de expirar"
                    />
                    <Toggle
                        enabled={preferences.notifications.newPromotions}
                        onToggle={() => setNotificationPreference('newPromotions', !preferences.notifications.newPromotions)}
                        label="Novas promoções"
                        description="Seja notificado sobre promoções de milhas e pontos"
                    />
                    <Toggle
                        enabled={preferences.notifications.weeklySummary}
                        onToggle={() => setNotificationPreference('weeklySummary', !preferences.notifications.weeklySummary)}
                        label="Resumo semanal"
                        description="Receba um resumo semanal das suas atividades"
                    />
                </div>
            </div>
        </div>
    )
}
