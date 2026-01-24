import React, { useState, useCallback } from 'react'
import { notify } from '../../../utils/notify'

export function SecuritySettings() {
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [changingPassword, setChangingPassword] = useState(false)

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
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))
            notify.success('Senha alterada com sucesso!')
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
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
}
