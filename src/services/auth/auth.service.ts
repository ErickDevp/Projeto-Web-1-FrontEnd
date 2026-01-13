import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type {
  AuthResponse,
  ForgotPasswordDTO,
  ForgotPasswordResponse,
  LoginDTO,
  RegisterDTO,
  ResetPasswordDTO,
} from '../../interfaces/auth'

export const authService = {
  async register(payload: RegisterDTO): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(endpoints.auth.register, payload)
    return data
  },

  async login(payload: LoginDTO): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(endpoints.auth.login, payload)
    return data
  },

  async forgotPassword(payload: ForgotPasswordDTO): Promise<ForgotPasswordResponse> {
    const { data } = await apiClient.post<ForgotPasswordResponse>(endpoints.auth.forgotPassword, payload)
    return data
  },

  async resetPassword(payload: ResetPasswordDTO): Promise<string> {
    const { data } = await apiClient.post<string>(endpoints.auth.resetPassword, payload)
    return data
  },
}
