import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { NotificacaoRequestDTO, NotificacaoResponseDTO } from '../../interfaces/notificacao'

export const notificacaoService = {
  async list(): Promise<NotificacaoResponseDTO[]> {
    const { data } = await apiClient.get<NotificacaoResponseDTO[]>(endpoints.notificacao.base)
    return data
  },

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

  async markAsRead(id: string | number): Promise<void> {
    await apiClient.put(`${endpoints.notificacao.base}/${id}/lida`)
  },

  /** Dispensa notificação apenas para o usuário atual */
  async dismiss(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.notificacao.base}/${id}`)
  },

  /** Remove notificação para todos os usuários (apenas admin) */
  async removeForAll(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.notificacao.base}/${id}/all`)
  },
}
