import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { UsuarioRequestDTO, UsuarioResponseDTO } from '../../interfaces/auth'

export const usuarioService = {
  // GET /usuario/me
  async getMe(): Promise<UsuarioResponseDTO> {
    const { data } = await apiClient.get<UsuarioResponseDTO>(endpoints.usuario.me)
    return data
  },

  // PUT /usuario/me
  async updateMe(payload: UsuarioRequestDTO): Promise<UsuarioResponseDTO> {
    const { data } = await apiClient.put<UsuarioResponseDTO>(endpoints.usuario.me, payload)
    return data
  },

  // DELETE /usuario/me
  async deleteMe(): Promise<void> {
    await apiClient.delete(endpoints.usuario.me)
  },

  // GET /usuario/foto
  async getFoto(): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(endpoints.usuario.foto, {
      responseType: 'blob',
    })
    return data
  },

  // POST /usuario/foto (multipart/form-data)
  async uploadFoto(file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    await apiClient.post(endpoints.usuario.foto, formData)
  },
}
