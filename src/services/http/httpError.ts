import axios, { AxiosError } from 'axios'

type ApiErrorMessageOptions = {
  fallback?: string
}

type ValidationItemLike = {
  field?: unknown
  message?: unknown
  defaultMessage?: unknown
}

type ErrorBodyLike = {
  message?: unknown
  error?: unknown
  detail?: unknown
  title?: unknown
  errors?: unknown
  fieldErrors?: unknown
}

const normalizeForMatch = (value: string) => value.trim().toLowerCase()

const looksLikeGenericNotFound = (value: string) => {
  const v = normalizeForMatch(value)
  return v === 'not found' || v === '404' || v === 'resource not found'
}

const looksLikeBadCredentials = (value: string) => {
  const v = normalizeForMatch(value)
  return (
    v.includes('bad credentials') ||
    v.includes('invalid credentials') ||
    v.includes('invalid username or password') ||
    v.includes('senha incorreta') ||
    v.includes('credenciais')
  )
}

const looksLikeUserNotFound = (value: string) => {
  const v = normalizeForMatch(value)
  return v.includes('user not found') || v.includes('email not found') || v.includes('usuário não encontrado')
}

const looksLikeInvalidOrExpiredToken = (value: string) => {
  const v = normalizeForMatch(value)
  return (
    (v.includes('token') && (v.includes('invalid') || v.includes('inval') || v.includes('expir'))) ||
    v.includes('jwt')
  )
}

const authFriendlyMessage = (status: number, url: unknown, bodyMessage: string | null): string | null => {
  const path = typeof url === 'string' ? url : ''
  const msg = bodyMessage ? normalizeForMatch(bodyMessage) : ''

  const isLogin = path.includes('/auth/login')
  const isRegister = path.includes('/auth/register')
  const isForgot = path.includes('/auth/forgot-password')
  const isReset = path.includes('/auth/reset-password')

  if (isLogin) {
    if (status === 401 || status === 404 || status === 400) return 'Email ou senha incorretos.'
    if (bodyMessage && (looksLikeBadCredentials(bodyMessage) || looksLikeGenericNotFound(bodyMessage))) {
      return 'Email ou senha incorretos.'
    }
  }

  if (isRegister) {
    if (status === 409) return 'Este email já está cadastrado. Faça login ou use outro email.'
  }

  if (isForgot) {
    if (status === 404) return 'Não encontramos uma conta com esse email.'
    if (bodyMessage && (looksLikeUserNotFound(bodyMessage) || looksLikeGenericNotFound(bodyMessage))) {
      return 'Não encontramos uma conta com esse email.'
    }
  }

  if (isReset) {
    if (status === 400 || status === 404) return 'Token inválido ou expirado. Gere um novo token e tente novamente.'
    if (bodyMessage && looksLikeInvalidOrExpiredToken(bodyMessage)) {
      return 'Token inválido ou expirado. Gere um novo token e tente novamente.'
    }
  }

  // Evita respostas estranhas (ex.: bodyMessage técnico) em rotas /auth
  if ((isLogin || isRegister || isForgot || isReset) && bodyMessage) {
    if (looksLikeGenericNotFound(bodyMessage)) return messageForStatus(status)
    if (isReset && msg.includes('token')) return 'Token inválido ou expirado. Gere um novo token e tente novamente.'
  }

  return null
}

const toCleanString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const extractValidationMessages = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []

  const messages: string[] = []
  for (const item of value) {
    if (!isRecord(item)) continue
    const candidate = item as ValidationItemLike

    const msg = toCleanString(candidate.message) ?? toCleanString(candidate.defaultMessage)
    if (!msg) continue

    const field = toCleanString(candidate.field)
    messages.push(field ? `${field}: ${msg}` : msg)
  }

  return messages
}

const extractMessageFromBody = (data: unknown): string | null => {
  const asString = toCleanString(data)
  if (asString) return asString

  if (!isRecord(data)) return null

  const body = data as ErrorBodyLike

  // Alguns backends usam message/detail/title/error
  const direct =
    toCleanString(body.message) ??
    toCleanString(body.detail) ??
    toCleanString(body.title) ??
    toCleanString(body.error)

  if (direct) return direct

  // Erros de validação (formatos comuns)
  const validationMessages = [
    ...extractValidationMessages(body.errors),
    ...extractValidationMessages(body.fieldErrors),
  ]

  if (validationMessages.length > 0) {
    // Mantém curto e legível no toast
    return validationMessages.slice(0, 3).join(' • ')
  }

  return null
}

const messageForStatus = (status: number): string => {
  if (status === 400) return 'Não foi possível concluir. Verifique os dados e tente novamente.'
  if (status === 401) return 'Sua sessão expirou. Faça login novamente.'
  if (status === 403) return 'Você não tem permissão para realizar esta ação.'
  if (status === 404) return 'Não encontramos o recurso solicitado.'
  if (status === 409) return 'Conflito ao processar a solicitação. Tente novamente.'
  if (status === 422) return 'Alguns dados são inválidos. Revise os campos e tente novamente.'
  if (status === 429) return 'Muitas solicitações em pouco tempo. Aguarde e tente novamente.'
  if (status >= 500) return 'Ocorreu um erro no servidor. Tente novamente mais tarde.'
  return 'Não foi possível concluir a solicitação. Tente novamente.'
}

export const getApiErrorMessage = (error: unknown, options?: ApiErrorMessageOptions): string => {
  const fallback = options?.fallback ?? 'Algo deu errado. Tente novamente.'

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError

    // Timeout
    if (axiosError.code === 'ECONNABORTED') {
      return 'A requisição demorou mais do que o esperado. Verifique sua conexão e tente novamente.'
    }

    // Sem response => erro de rede / CORS / servidor fora
    if (!axiosError.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
    }

    const status = axiosError.response.status
    const bodyMessage = extractMessageFromBody(axiosError.response.data)

    const authMessage = authFriendlyMessage(status, axiosError.config?.url, bodyMessage)
    if (authMessage) return authMessage

    if (bodyMessage) return bodyMessage

    return messageForStatus(status)
  }

  if (error instanceof Error) {
    const msg = toCleanString(error.message)
    if (msg) return msg
  }

  return fallback
}
