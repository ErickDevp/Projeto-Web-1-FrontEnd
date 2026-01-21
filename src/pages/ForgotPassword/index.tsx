import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import axios from 'axios'
import { Link, useLocation } from 'react-router-dom'
import { authService } from '../../services/auth/auth.service'
import type { ForgotPasswordDTO } from '../../interfaces/auth'
import { notify } from '../../utils/notify'
import { hasErrors, normalizeEmail, validateForgotPassword } from '../../utils/validation'
import { AuthField, AuthPanel, IconMail, PrimaryAuthButton } from '../../components/auth/AuthUI'

type Props = {
  embedded?: boolean
}

export default function ForgotPassword({ embedded }: Props) {
  const formRef = useRef<HTMLFormElement | null>(null)
  const location = useLocation()

  const modalState = (location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation
    ? location.state
    : undefined

  const [formData, setFormData] = useState<ForgotPasswordDTO>({
    email: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordDTO, string>>>({})

  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [requestSent, setRequestSent] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  const shouldExposeToken = import.meta.env.DEV

  const genericSuccessMessage =
    'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'

  useEffect(() => {
    if (cooldownSeconds <= 0) return

    const id = window.setInterval(() => {
      setCooldownSeconds((s) => (s > 1 ? s - 1 : 0))
    }, 1000)

    return () => window.clearInterval(id)
  }, [cooldownSeconds])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    const name = e.target.name as keyof ForgotPasswordDTO
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (loading || cooldownSeconds > 0) return

    const nextErrors = validateForgotPassword(formData)
    if (hasErrors(nextErrors)) {
      setErrors(nextErrors)

      setTimeout(() => {
        const form = formRef.current
        if (!form) return
        const el = form.querySelector<HTMLElement>('[name="email"]')
        el?.focus()
      }, 0)

      return
    }

    setLoading(true)
    setResetToken(null)
    setRequestSent(true)

    const payload: ForgotPasswordDTO = {
      email: normalizeEmail(formData.email),
    }

    try {
      const response = await authService.forgotPassword(payload)
      setResetToken(response.token)
      notify.success(genericSuccessMessage)
      setCooldownSeconds(10)
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined

      // Comportamento mais seguro: não revela se o email existe
      if (status === 404) {
        notify.success(genericSuccessMessage)
        setCooldownSeconds(10)
        return
      }

      notify.apiError(error)
    } finally {
      setLoading(false)
    }
  }

  const copyToken = async () => {
    if (!resetToken) return

    try {
      await navigator.clipboard.writeText(resetToken)
      notify.success('Token copiado.')
    } catch {
      notify.error('Não foi possível copiar o token.')
    }
  }

  return (
    <div className={embedded ? 'w-full' : 'flex min-h-screen items-center justify-center bg-bg-primary px-4'}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        autoComplete={embedded ? 'off' : 'on'}
        className="w-full"
      >
        <AuthPanel embedded={embedded}>
          <h1 className="text-center text-2xl font-bold text-fg-primary">Esqueci minha senha</h1>
          <p className="mt-2 text-center text-sm text-fg-secondary">
            Informe seu email para gerar um token de redefinição.
          </p>

          <div className="mt-8 space-y-4">
            <AuthField
              label="Email"
              name="email"
              type="email"
              placeholder="Digite seu email"
              value={formData.email}
              onChange={handleChange}
              autoComplete={embedded ? 'off' : 'email'}
              leftIcon={<IconMail />}
              error={errors.email}
              required
            />

            {!requestSent ? (
              <PrimaryAuthButton
                disabled={
                  loading ||
                  cooldownSeconds > 0 ||
                  hasErrors(errors as Record<string, string | undefined>)
                }
              >
                {loading
                  ? 'Carregando...'
                  : cooldownSeconds > 0
                    ? `Aguarde ${cooldownSeconds}s...`
                    : 'Gerar token de reset'}
              </PrimaryAuthButton>
            ) : null}
          </div>

          {requestSent && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-bg-primary/20 p-4">
              <p className="text-sm font-semibold text-fg-primary mb-2">Próximos passos</p>
              <p className="text-sm text-fg-secondary">
                {genericSuccessMessage} Se você não receber nada, verifique o spam/lixeira.
              </p>

              {shouldExposeToken && resetToken ? (
                <>
                  <p className="mt-4 text-sm font-semibold text-fg-primary mb-2">Token (apenas DEV):</p>
                  <code className="block text-xs break-all rounded-xl border border-white/10 bg-bg-primary/40 p-3 text-fg-primary">
                    {resetToken}
                  </code>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-fg-primary hover:bg-white/10"
                      onClick={copyToken}
                    >
                      Copiar
                    </button>
                    <Link
                      className="flex-1 rounded-2xl bg-accent-pool px-4 py-3 text-center text-sm font-semibold text-black hover:opacity-90"
                      to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                      state={modalState}
                    >
                      Resetar Senha
                    </Link>
                  </div>
                </>
              ) : (
                <div className="mt-4">
                  <Link
                    className="block w-full rounded-2xl bg-accent-pool px-4 py-3 text-center text-sm font-semibold text-black hover:opacity-90"
                    to="/reset-password"
                    state={modalState}
                  >
                    Ir para redefinir senha
                  </Link>
                </div>
              )}

              <div className="mt-4 text-center">
                <button
                  type="button"
                  disabled={
                    loading ||
                    cooldownSeconds > 0 ||
                    hasErrors(errors as Record<string, string | undefined>)
                  }
                  className="text-sm font-semibold text-accent-sky hover:underline disabled:cursor-not-allowed disabled:opacity-60 disabled:no-underline"
                  onClick={() => formRef.current?.requestSubmit()}
                >
                  {cooldownSeconds > 0 ? `Gerar novo token (${cooldownSeconds}s)` : 'Gerar novo token'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 text-center text-sm text-fg-secondary">
            <Link className="font-semibold text-accent-sky hover:underline" to="/login" state={modalState}>
              Voltar para login
            </Link>
          </div>
        </AuthPanel>
      </form>
    </div>
  )
}
