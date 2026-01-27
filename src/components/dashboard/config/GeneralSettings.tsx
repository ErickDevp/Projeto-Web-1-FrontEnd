
import { usePreferences } from '../../../hooks/usePreferences'
import { Toggle } from '../../ui/Toggle'

export function GeneralSettings() {
    const { preferences, setPreference } = usePreferences()

    return (
        <div className="space-y-6">
            {/* Accessibility */}
            <div className="dashboard-card">
                <div className="section-header">
                    <div className="card-icon">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h2 className="section-title">Acessibilidade</h2>
                        <p className="text-xs text-fg-secondary">Ajuste a experiência visual</p>
                    </div>
                </div>

                <div className="mt-4 divide-y divide-white/10">
                    <Toggle
                        enabled={preferences.reduceMotion}
                        onToggle={() => setPreference('reduceMotion', !preferences.reduceMotion)}
                        label="Reduzir efeitos visuais"
                        description="Desabilita animações, transições e efeitos de blur para melhor desempenho"
                    />
                </div>
            </div>

            {/* Privacy */}
            <div className="dashboard-card">
                <div className="section-header">
                    <div className="card-icon">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h2 className="section-title">Privacidade</h2>
                        <p className="text-xs text-fg-secondary">Controle a visibilidade dos seus dados</p>
                    </div>
                </div>

                <div className="mt-4 divide-y divide-white/10">
                    <Toggle
                        enabled={preferences.hideValues}
                        onToggle={() => setPreference('hideValues', !preferences.hideValues)}
                        label="Ocultar valores monetários/pontos"
                        description="Mascara os valores exibidos na Dashboard"
                    />
                </div>
            </div>
        </div>
    )
}
