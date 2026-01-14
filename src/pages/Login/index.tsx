import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import type { LoginDTO } from '../../interfaces/auth'
import { useAuth } from '../../hooks/useAuth'
import { notify } from '../../utils/notify'
import { hasErrors, normalizeEmail, validateLogin } from '../../utils/validation'
import {
  AuthField,
  AuthPanel,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  PrimaryAuthButton,
} from '../../components/auth/AuthUI'

type Props = {
  embedded?: boolean
}

export default function Login({ embedded }: Props) {
  const formRef = useRef<HTMLFormElement | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const modalState = (location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation
    ? location.state
    : undefined

  useEffect(() => {
    const reason = sessionStorage.getItem('auth:redirectReason')
    if (reason) {
      sessionStorage.removeItem('auth:redirectReason')
      notify.info(reason)
    }
  }, [])

  const [formData, setFormData] = useState<LoginDTO>({
    email: '',
    senha: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof LoginDTO, string>>>({})

  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    const name = e.target.name as keyof LoginDTO
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const nextErrors = validateLogin(formData)
    if (hasErrors(nextErrors)) {
      setErrors(nextErrors)
      setLoading(false)

      setTimeout(() => {
        const form = formRef.current
        const firstInvalid = (['email', 'senha'] as const).find((key) => nextErrors[key])
        if (!form || !firstInvalid) return
        const el = form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
        el?.focus()
      }, 0)

      return
    }

    const payload: LoginDTO = {
      email: normalizeEmail(formData.email),
      senha: formData.senha,
    }

    try {
      await login(payload)
      notify.success('Login realizado com sucesso.')
      if (embedded) {
        navigate(-1)
      } else {
        navigate('/')
      }
    } catch (error) {
      notify.apiError(error)
    } finally {
      setLoading(false)
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
          <h1 className="text-center text-2xl font-bold text-fg-primary">Entrar</h1>
          <p className="mt-2 text-center text-sm text-fg-secondary">
            Acesse sua conta para gerenciar seus pontos e milhas.
          </p>

          <div className="mt-8 space-y-4">
            <AuthField
              label="Email"
              name="email"
              type="email"
              placeholder="Digite seu email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              leftIcon={<IconMail />}
              error={errors.email}
            />

            <AuthField
              label="Senha"
              name="senha"
              type={embedded ? 'text' : showPassword ? 'text' : 'password'}
              placeholder="Digite sua senha"
              value={formData.senha}
              onChange={handleChange}
              autoComplete={embedded ? 'off' : rememberMe ? 'current-password' : 'off'}
              leftIcon={<IconLock />}
              rightIcon={showPassword ? <IconEyeOff /> : <IconEye />}
              rightIconLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              onRightIconClick={() => setShowPassword((v) => !v)}
              error={errors.senha}
              inputStyle={
                embedded
                  ? ({ WebkitTextSecurity: showPassword ? 'none' : 'disc' } as React.CSSProperties)
                  : undefined
              }
            />

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-fg-secondary">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-bg-primary/40 text-accent-sky focus:ring-accent-sky/30"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Lembrar-me
              </label>
              <Link
                className="text-sm font-semibold text-accent-sky hover:underline"
                to="/forgot-password"
                state={modalState}
              >
                Esqueci a senha
              </Link>
            </div>

            <PrimaryAuthButton disabled={loading || hasErrors(errors as Record<string, string | undefined>)}>
              {loading ? 'Carregando...' : 'Entrar'}
            </PrimaryAuthButton>
          </div>

          <div className="mt-5 text-center text-sm text-fg-secondary">
            Não tem uma conta?{' '}
            <Link className="font-semibold text-accent-sky hover:underline" to="/register" state={modalState}>
              Criar conta
            </Link>
          </div>
        </AuthPanel>
      </form>
    </div>
  )
}
