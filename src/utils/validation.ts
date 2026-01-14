type FieldErrors<TFields extends string> = Partial<Record<TFields, string>>

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export function validateEmail(value: string): string | null {
  const email = normalizeEmail(value)
  if (!email) return 'Informe seu email.'

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Informe um email válido.'

  return null
}

export function validatePassword(value: string): string | null {
  const password = value.trim()
  if (!password) return 'Informe sua senha.'
  if (password.length < 6) return 'A senha deve ter no mínimo 6 caracteres.'
  return null
}

export function validateName(value: string): string | null {
  const name = value.trim()
  if (!name) return 'Informe seu nome.'
  if (name.length < 2) return 'O nome deve ter pelo menos 2 caracteres.'
  return null
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean)
}

export function validateLogin(values: { email: string; senha: string }) {
  const errors: FieldErrors<'email' | 'senha'> = {}

  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(values.senha)
  if (passwordError) errors.senha = passwordError

  return errors
}

export function validateRegister(values: { nome: string; email: string; senha: string }) {
  const errors: FieldErrors<'nome' | 'email' | 'senha'> = {}

  const nameError = validateName(values.nome)
  if (nameError) errors.nome = nameError

  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(values.senha)
  if (passwordError) errors.senha = passwordError

  return errors
}

export function validateForgotPassword(values: { email: string }) {
  const errors: FieldErrors<'email'> = {}

  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError

  return errors
}

export function validateResetPassword(values: { token: string; novaSenha: string }) {
  const errors: FieldErrors<'token' | 'novaSenha'> = {}

  if (!values.token.trim()) errors.token = 'Informe o token.'

  const passwordError = validatePassword(values.novaSenha)
  if (passwordError) errors.novaSenha = passwordError

  return errors
}
