import axios, { AxiosError } from 'axios'

type MessageLike = { message?: unknown }

const isMessageLike = (value: unknown): value is MessageLike => {
  return typeof value === 'object' && value !== null && 'message' in value
}

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError

    const data = axiosError.response?.data
    if (typeof data === 'string' && data.trim()) return data

    if (isMessageLike(data) && typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }

    if (axiosError.response?.status) {
      return `Erro HTTP ${axiosError.response.status}`
    }

    if (axiosError.message) return axiosError.message
  }

  if (error instanceof Error && error.message) return error.message
  return 'Erro inesperado'
}
