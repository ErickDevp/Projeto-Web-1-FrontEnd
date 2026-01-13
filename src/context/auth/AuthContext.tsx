import { useCallback, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { LoginDTO, RegisterDTO } from '../../interfaces/auth'
import { authService } from '../../services/auth/auth.service'
import { tokenStorage } from '../../utils/storage'
import { AuthContext, type AuthContextValue } from './context'

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get())

  const login = useCallback(async (payload: LoginDTO) => {
    const result = await authService.login(payload)
    tokenStorage.set(result.token)
    setToken(result.token)
  }, [])

  const register = useCallback(async (payload: RegisterDTO) => {
    const result = await authService.register(payload)
    tokenStorage.set(result.token)
    setToken(result.token)
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    return {
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }
  }, [login, logout, register, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
