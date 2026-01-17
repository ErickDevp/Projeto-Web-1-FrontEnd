import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { RegisterDTO } from '../../interfaces/auth'
import { useAuth } from '../../hooks/useAuth'
import { notify } from '../../utils/notify'
import { hasErrors, normalizeEmail, validateRegister } from '../../utils/validation'
import {
  AuthField,
  AuthPanel,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconUser,
  PrimaryAuthButton,
} from '../../components/auth/AuthUI'

type Props = {
  embedded?: boolean
}

export default function Register({ embedded }: Props) {
  const formRef = useRef<HTMLFormElement | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { register } = useAuth()

  const incomingDraft = (location.state as { draft?: Partial<RegisterDTO> } | null)?.draft
  const incomingAcceptedTerms = (location.state as { acceptedTerms?: boolean } | null)?.acceptedTerms

  const modalState = (location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation
    ? location.state
    : undefined
  
  const [formData, setFormData] = useState<RegisterDTO>({
    nome: incomingDraft?.nome ?? '',
    email: incomingDraft?.email ?? '',
    senha: incomingDraft?.senha ?? '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterDTO | 'terms', string>>>({})

  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(Boolean(incomingAcceptedTerms))
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    const name = e.target.name as keyof RegisterDTO
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const nextErrors = {
      ...validateRegister(formData),
      ...(acceptedTerms
        ? null
        : { terms: 'Você precisa aceitar os Termos de Serviço e a Política de Privacidade.' }),
    } as Partial<Record<keyof RegisterDTO | 'terms', string>>

    if (hasErrors(nextErrors as Record<string, string | undefined>)) {
      setErrors(nextErrors)
      setTimeout(() => {
        const form = formRef.current
        const firstInvalid = (['nome', 'email', 'senha', 'terms'] as const).find((key) => nextErrors[key])
        if (!form || !firstInvalid) return
        const el = form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
        el?.focus()
      }, 0)
      return
    }

    setLoading(true)

    const payload: RegisterDTO = {
      nome: formData.nome.trim(),
      email: normalizeEmail(formData.email),
      senha: formData.senha,
    }

    try {
      await register(payload)
      notify.success('Conta criada com sucesso.')
      navigate('/dashboard/home', { replace: true })
    } catch (error) {
      notify.apiError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={embedded ? 'w-full' : 'flex min-h-screen items-center justify-center bg-bg-primary px-4'}>
      <form ref={formRef} onSubmit={handleSubmit} autoComplete={embedded ? 'off' : 'on'} className="w-full">
        <AuthPanel embedded={embedded}>
          <h1 className="text-center text-2xl font-bold text-fg-primary">Criar conta</h1>
          <p className="mt-2 text-center text-sm text-fg-secondary">
            Comece a centralizar seus programas em poucos passos.
          </p>

          <div className="mt-8 space-y-4">
            <AuthField
              label="Nome"
              name="nome"
              placeholder="Digite seu nome"
              value={formData.nome}
              onChange={handleChange}
              autoComplete="name"
              leftIcon={<IconUser />}
              error={errors.nome}
            />

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
              placeholder="Crie uma senha"
              value={formData.senha}
              onChange={handleChange}
              autoComplete={embedded ? 'off' : 'new-password'}
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

            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-bg-primary/20 p-4 text-sm text-fg-secondary">
              <input
                name="terms"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-white/20 bg-bg-primary/40 text-accent-sky focus:ring-accent-sky/30"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked)
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }))
                }}
                required
              />
              <span>
                Eu aceito os{' '}
                <Link
                  className="font-semibold text-accent-sky hover:underline"
                  to="/terms"
                  state={{
                    backgroundLocation: (location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation ?? location,
                    returnTo: '/register',
                    draft: formData,
                    acceptedTerms,
                  }}
                >
                  Termos de Serviço
                </Link>{' '}
                e a{' '}
                <Link
                  className="font-semibold text-accent-sky hover:underline"
                  to="/privacy"
                  state={{
                    backgroundLocation: (location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation ?? location,
                    returnTo: '/register',
                    draft: formData,
                    acceptedTerms,
                  }}
                >
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>

            {errors.terms ? (
              <span className="-mt-2 block text-xs font-semibold text-red-300">{errors.terms}</span>
            ) : null}

            <PrimaryAuthButton disabled={loading || hasErrors(errors as Record<string, string | undefined>)}>
              {loading ? 'Carregando...' : 'Cadastrar'}
            </PrimaryAuthButton>
          </div>

          <div className="mt-5 text-center text-sm text-fg-secondary">
            Já tem uma conta?{' '}
            <Link className="font-semibold text-accent-sky hover:underline" to="/login" state={modalState}>
              Entrar
            </Link>
          </div>
        </AuthPanel>
      </form>
    </div>
  )
}