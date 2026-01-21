import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { NotificacaoRequestDTO, NotificacaoResponseDTO } from '../../interfaces/notificacao'

export const notificacaoService = {
  // GET /notificacao retorna List<NotificacaoResponseDTO>
  async list(): Promise<NotificacaoResponseDTO[]> {
    const { data } = await apiClient.get<NotificacaoResponseDTO[]>(endpoints.notificacao.base)
    return data
  },

  // GET /notificacao/publicas retorna List<NotificacaoResponseDTO>
  async listPublicas(): Promise<NotificacaoResponseDTO[]> {
    const { data } = await apiClient.get<NotificacaoResponseDTO[]>(endpoints.notificacao.publicas)
    return data
  },

  async create(payload: NotificacaoRequestDTO): Promise<NotificacaoResponseDTO> {
    const { data } = await apiClient.post<NotificacaoResponseDTO>(endpoints.notificacao.create, payload)
    return data
  },

  async update(id: string | number, payload: NotificacaoRequestDTO): Promise<NotificacaoResponseDTO> {
    const { data } = await apiClient.put<NotificacaoResponseDTO>(`${endpoints.notificacao.base}/${id}`, payload)
    return data
  },

  // PUT /notificacao/{id}/lida - Marcar como lida
  async markAsRead(id: string | number): Promise<void> {
    await apiClient.put(`${endpoints.notificacao.base}/${id}/lida`)
  },

  // DELETE /notificacao/{id} - Dismiss notification for current user only
  async dismiss(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.notificacao.base}/${id}`)
  },

  // DELETE /notificacao/{id}/all - Remove notification for all users (admin only)
  async removeForAll(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.notificacao.base}/${id}/all`)
  },
}
