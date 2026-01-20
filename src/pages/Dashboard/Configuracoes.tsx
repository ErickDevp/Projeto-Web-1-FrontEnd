import { useCallback, useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { usePreferences } from '../../hooks/usePreferences'
import { notify } from '../../utils/notify'

// Types
type TabId = 'appearance' | 'general' | 'notifications' | 'security'

type Tab = {
  id: TabId
  label: string
  icon: React.ReactNode
}

// Tab definitions
const tabs: Tab[] = [
  {
    id: 'appearance',
    label: 'Aparência',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
      </svg>
    ),
  },
  {
    id: 'general',
    label: 'Geral',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Notificações',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Segurança',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
]

// Toggle Switch Component
function Toggle({
  enabled,
  onToggle,
  label,
  description,
}: {
  enabled: boolean
  onToggle: () => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1">
        <span className="text-sm font-medium text-fg-primary">{label}</span>
        {description && (
          <p className="mt-0.5 text-xs text-fg-secondary">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent-pool/50 ${enabled ? 'bg-gradient-to-r from-accent-sky to-accent-pool' : 'bg-white/10'
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
    </div>
  )
}

// Theme Card Component
function ThemeCard({
  theme: _theme,
  label,
  icon,
  isSelected,
  onClick,
}: {
  theme: 'light' | 'dark' | 'system'
  label: string
  icon: React.ReactNode
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-300 ${isSelected
        ? 'border-accent-pool/50 bg-gradient-to-br from-accent-sky/10 to-accent-pool/10 shadow-lg shadow-accent-pool/20'
        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
        }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${isSelected
          ? 'bg-gradient-to-br from-accent-sky to-accent-pool text-white'
          : 'bg-white/10 text-fg-secondary group-hover:text-fg-primary'
          }`}
      >
        {icon}
      </div>
      <span
        className={`text-sm font-medium transition-colors ${isSelected ? 'text-accent-pool' : 'text-fg-secondary group-hover:text-fg-primary'
          }`}
      >
        {label}
      </span>
      {isSelected && (
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-pool">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      )}
    </button>
  )
}

// Main Component
export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState<TabId>('appearance')
  const { theme, setTheme } = useTheme()
  const { preferences, setPreference, setNotificationPreference } = usePreferences()

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)

  // Handle password change
  const handlePasswordChange = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordForm.currentPassword) {
      notify.error('Informe a senha atual.')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      notify.error('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify.error('As senhas não coincidem.')
      return
    }

    setChangingPassword(true)
    try {
      // Simulate API call - replace with actual API integration
      await new Promise((resolve) => setTimeout(resolve, 1000))
      notify.success('Senha alterada com sucesso!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível alterar a senha.' })
    } finally {
      setChangingPassword(false)
    }
  }, [passwordForm])

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-6">
            {/* Theme Selection */}
            <div className="dashboard-card">
              <div className="section-header">
                <div className="card-icon">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="section-title">Tema da Interface</h2>
                  <p className="text-xs text-fg-secondary">Escolha como a interface será exibida</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <ThemeCard
                  theme="light"
                  label="Claro"
                  isSelected={theme === 'light'}
                  onClick={() => setTheme('light')}
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  }
                />
                <ThemeCard
                  theme="dark"
                  label="Escuro"
                  isSelected={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                  }
                />
                <ThemeCard
                  theme="system"
                  label="Sistema"
                  isSelected={theme === 'system'}
                  onClick={() => setTheme('system')}
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        )

      case 'general':
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

      case 'notifications':
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
                <span className="badge">Simulação</span>
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

      case 'security':
        return (
          <div className="space-y-6">
            <div className="dashboard-card">
              <div className="section-header">
                <div className="card-icon">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="section-title">Alterar Senha</h2>
                  <p className="text-xs text-fg-secondary">Atualize sua senha de acesso</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-fg-primary">
                    Senha atual
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Digite sua senha atual"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-fg-primary">
                    Nova senha
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Digite a nova senha"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-fg-primary">
                    Confirmar nova senha
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a nova senha"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn-primary group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Alterando...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Alterar senha
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="titulo-grafico text-2xl font-bold">Configurações</h1>
        <p className="mt-1 text-sm text-fg-secondary">Personalize sua experiência no painel.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar Navigation */}
        <nav className="dashboard-card !p-4 lg:!min-h-0 lg:h-fit">
          <ul className="space-y-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-accent-sky/20 to-accent-pool/20 text-accent-pool'
                    : 'text-fg-secondary hover:bg-white/5 hover:text-fg-primary'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content Area */}
        <div className="flex-1">{renderTabContent()}</div>
      </div>
    </section>
  )
}
