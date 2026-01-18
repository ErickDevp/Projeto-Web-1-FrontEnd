import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { UsuarioDTO } from '../../interfaces/auth'

export const usuarioService = {
  async getMe(): Promise<UsuarioDTO> {
    const { data } = await apiClient.get<UsuarioDTO>(endpoints.usuario.me)
    return data
  },

  async getFoto(): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(endpoints.usuario.foto, {
      responseType: 'blob',
    })
    return data
  },

  async uploadFoto(file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    await apiClient.post(endpoints.usuario.foto, formData)
  },

  async updateMe(payload: UsuarioDTO): Promise<void> {
    await apiClient.put(endpoints.usuario.me, payload)
  },

  async deleteMe(): Promise<void> {
    await apiClient.delete(endpoints.usuario.me)
  },
}
