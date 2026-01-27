import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { UsuarioRequestDTO, UsuarioResponseDTO } from '../../interfaces/auth'

export const usuarioService = {
  async getMe(): Promise<UsuarioResponseDTO> {
    const { data } = await apiClient.get<UsuarioResponseDTO>(endpoints.usuario.me)
    return data
  },

  async updateMe(payload: UsuarioRequestDTO): Promise<UsuarioResponseDTO> {
    const { data } = await apiClient.put<UsuarioResponseDTO>(endpoints.usuario.me, payload)
    return data
  },

  async deleteMe(): Promise<void> {
    await apiClient.delete(endpoints.usuario.me)
  },

  async getFoto(): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(endpoints.usuario.foto, {
      responseType: 'blob',
    })
    return data
  },

  async uploadFoto(file: File): Promise<void> {
    const formData = new FormData()
    formData.append('foto', file)
    await apiClient.post(endpoints.usuario.fotoPerfil, formData)
  },
}
