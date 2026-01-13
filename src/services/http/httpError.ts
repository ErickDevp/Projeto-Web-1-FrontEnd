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
    if (bodyMessage) return bodyMessage

    return messageForStatus(status)
  }

  if (error instanceof Error) {
    const msg = toCleanString(error.message)
    if (msg) return msg
  }

  return fallback
}
