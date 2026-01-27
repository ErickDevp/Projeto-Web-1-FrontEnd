
import { useTheme } from '../../../hooks/useTheme'
import { ThemeCard } from './ThemeCard'

export function AppearanceSettings() {
    const { theme, setTheme } = useTheme()

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
}
