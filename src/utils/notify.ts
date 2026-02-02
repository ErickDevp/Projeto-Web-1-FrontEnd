import { toast, type ToastOptions } from 'react-toastify'
import { getApiErrorMessage } from '../services/http/httpError'

const DEFAULT_TOAST_OPTIONS: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  closeButton: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
}

export const notify = {
  success(message: string, options?: ToastOptions) {
    toast.success(message, { ...DEFAULT_TOAST_OPTIONS, ...options })
  },

  info(message: string, options?: ToastOptions) {
    toast.info(message, { ...DEFAULT_TOAST_OPTIONS, ...options })
  },

  warn(message: string, options?: ToastOptions) {
    toast.warn(message, { ...DEFAULT_TOAST_OPTIONS, ...options })
  },

  error(message: string, options?: ToastOptions) {
    toast.error(message, { ...DEFAULT_TOAST_OPTIONS, ...options })
  },

  apiError(error: unknown, options?: { fallback?: string; toast?: ToastOptions }) {
    const message = getApiErrorMessage(error, { fallback: options?.fallback })
    toast.error(message, { ...DEFAULT_TOAST_OPTIONS, ...options?.toast })
  },
}
