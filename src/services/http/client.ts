import axios from 'axios'
import { env } from '../../config/env'
import { tokenStorage } from '../../utils/storage'
import { getApiErrorMessage } from './httpError'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  withCredentials: env.apiWithCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isHandling401 = false

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url: string | undefined = error?.config?.url

    const isAuthRoute = typeof url === 'string' && url.startsWith('/auth/')

    if (status === 401 && !isAuthRoute && !isHandling401) {
      isHandling401 = true

      tokenStorage.clear()

      const message = getApiErrorMessage(error, {
        fallback: 'Sua sessão expirou. Faça login novamente.',
      })

      sessionStorage.setItem('auth:redirectReason', message)

      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }

      setTimeout(() => {
        isHandling401 = false
      }, 500)
    }

    return Promise.reject(error)
  },
)
