import { useCallback, useState, type FormEvent } from 'react'
import { notify } from '../../../utils/notify'
import { usuarioService } from '../../../services/usuario/usuario.service'
import { useAuth } from '../../../hooks/useAuth'

export function SecuritySettings() {
    const { logout } = useAuth()
    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: '',
    })
    const [changingPassword, setChangingPassword] = useState(false)

    const passwordStrength = (() => {
        const value = passwordForm.newPassword
        if (!value) {
            return { score: 0, label: 'Digite uma senha', color: 'bg-white/10', text: 'text-fg-secondary' }
        }

        const rules = [
            value.length >= 8,
            /[a-z]/.test(value),
            /[A-Z]/.test(value),
            /\d/.test(value),
            /[^A-Za-z0-9]/.test(value),
        ]

        const score = rules.filter(Boolean).length

        if (score <= 2) {
            return { score, label: 'Fraca', color: 'bg-red-500/70', text: 'text-red-400' }
        }
        if (score <= 4) {
            return { score, label: 'Média', color: 'bg-yellow-400/80', text: 'text-yellow-300' }
        }
        return { score, label: 'Forte', color: 'bg-emerald-400/80', text: 'text-emerald-300' }
    })()

    const handlePasswordChange = useCallback(async (e: FormEvent) => {
        e.preventDefault()

        if (!passwordForm.newPassword) {
            notify.error('Informe a nova senha.')
            return
        }

        if (passwordForm.newPassword.length < 8) {
            notify.error('A nova senha deve ter pelo menos 8 caracteres.')
            return
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            notify.error('As senhas não coincidem.')
            return
        }

        setChangingPassword(true)
        try {
            await usuarioService.updateMe({ novaSenha: passwordForm.newPassword })
            notify.success('Senha alterada com sucesso!')
            setPasswordForm({ newPassword: '', confirmPassword: '' })
            logout()
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível alterar a senha.' })
        } finally {
            setChangingPassword(false)
        }
    }, [passwordForm])

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
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className={passwordStrength.text}>Força: {passwordStrength.label}</span>
                                <span className="text-fg-secondary">Mínimo 8 caracteres</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                                <div
                                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                />
                            </div>
                            <ul className="grid gap-1 text-xs text-fg-secondary sm:grid-cols-2">
                                <li className={passwordForm.newPassword.length >= 8 ? 'text-emerald-300' : undefined}>• 8+ caracteres</li>
                                <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-emerald-300' : undefined}>• letra maiúscula</li>
                                <li className={/[a-z]/.test(passwordForm.newPassword) ? 'text-emerald-300' : undefined}>• letra minúscula</li>
                                <li className={/\d/.test(passwordForm.newPassword) ? 'text-emerald-300' : undefined}>• número</li>
                                <li className={/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? 'text-emerald-300' : undefined}>• caractere especial</li>
                            </ul>
                        </div>
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
}
