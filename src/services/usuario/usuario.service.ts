import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { UsuarioDTO } from '../../interfaces/auth'

export const usuarioService = {
  async getMe(): Promise<UsuarioDTO> {
    const { data } = await apiClient.get<UsuarioDTO>(endpoints.usuario.me)
    return data
  },

  async updateMe(payload: UsuarioDTO): Promise<void> {
    await apiClient.put(endpoints.usuario.me, payload)
  },

  async deleteMe(): Promise<void> {
    await apiClient.delete(endpoints.usuario.me)
  },
}
