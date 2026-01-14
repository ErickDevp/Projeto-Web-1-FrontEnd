import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../services/auth/auth.service'
import type { ResetPasswordDTO } from '../../interfaces/auth'
import { notify } from '../../utils/notify'
import { hasErrors, validateResetPassword } from '../../utils/validation'
import { AuthField, AuthPanel, IconEye, IconEyeOff, IconLock, PrimaryAuthButton } from '../../components/auth/AuthUI'

type Props = {
  embedded?: boolean
}

export default function ResetPassword({ embedded }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const modalState = (location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation
    ? location.state
    : undefined

  const [formData, setFormData] = useState<ResetPasswordDTO>({
    token: '',
    novaSenha: '',
  })

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [errors, setErrors] = useState<Partial<Record<'token' | 'novaSenha', string>>>({})
  const tokenRef = useRef<HTMLInputElement | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token')
    if (tokenFromQuery) {
      setFormData((prev) => ({ ...prev, token: tokenFromQuery }))
    }
  }, [searchParams])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value } as ResetPasswordDTO
      setErrors(validateResetPassword(next))
      return next
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const nextErrors = validateResetPassword(formData)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) {
      if (nextErrors.token) {
        tokenRef.current?.focus()
      } else if (nextErrors.novaSenha) {
        passwordRef.current?.focus()
      }
      return
    }

    setLoading(true)

    try {
      const message = await authService.resetPassword(formData)
      notify.success(message || 'Senha alterada com sucesso.')
      if (embedded && modalState) {
        navigate('/login', { state: modalState, replace: true })
      } else {
        navigate('/login')
      }
    } catch (error) {
      notify.apiError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={embedded ? 'w-full' : 'flex min-h-screen items-center justify-center bg-bg-primary px-4'}>
      <form onSubmit={handleSubmit} autoComplete={embedded ? 'off' : 'on'} className="w-full">
        <AuthPanel embedded={embedded}>
          <h1 className="text-center text-2xl font-bold text-fg-primary">Redefinir senha</h1>
          <p className="mt-2 text-center text-sm text-fg-secondary">
            Informe o token e defina uma nova senha.
          </p>

          <div className="mt-8 space-y-4">
            <AuthField
              label="Token"
              name="token"
              placeholder="Cole o token aqui"
              value={formData.token}
              onChange={handleChange}
              required
              error={errors.token}
              inputRef={tokenRef}
            />

            <AuthField
              label="Nova senha"
              name="novaSenha"
              type={embedded ? 'text' : showPassword ? 'text' : 'password'}
              placeholder="Crie uma nova senha"
              value={formData.novaSenha}
              onChange={handleChange}
              required
              autoComplete={embedded ? 'off' : 'new-password'}
              leftIcon={<IconLock />}
              rightIcon={showPassword ? <IconEyeOff /> : <IconEye />}
              rightIconLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              onRightIconClick={() => setShowPassword((v) => !v)}
              error={errors.novaSenha}
              inputRef={passwordRef}
              inputStyle={
                embedded
                  ? ({ WebkitTextSecurity: showPassword ? 'none' : 'disc' } as React.CSSProperties)
                  : undefined
              }
            />

            <PrimaryAuthButton disabled={loading || hasErrors(errors)}>
              {loading ? 'Carregando...' : 'Salvar nova senha'}
            </PrimaryAuthButton>
          </div>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link className="font-semibold text-accent-sky hover:underline" to="/forgot-password" state={modalState}>
              Gerar token
            </Link>
            <Link className="font-semibold text-accent-sky hover:underline" to="/login" state={modalState}>
              Login
            </Link>
          </div>
        </AuthPanel>
      </form>
    </div>
  )
}
