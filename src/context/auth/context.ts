import { createContext } from 'react'
import type { LoginDTO, RegisterDTO } from '../../interfaces/auth'

export type AuthContextValue = {
  token: string | null
  isAuthenticated: boolean
  login: (payload: LoginDTO) => Promise<void>
  register: (payload: RegisterDTO) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
