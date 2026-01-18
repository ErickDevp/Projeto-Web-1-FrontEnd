import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { NotificacaoDTO } from '../../interfaces/notificacao'

export const notificacaoService = {
  // GET /notificacao retorna List<Notificacao> (entity)
  async list<T = unknown[]>(): Promise<T> {
    const { data } = await apiClient.get<T>(endpoints.notificacao.base)
    return data
  },

  async listPublicas<T = unknown[]>(): Promise<T> {
    const { data } = await apiClient.get<T>(endpoints.notificacao.publicas)
    return data
  },

  async create(payload: NotificacaoDTO): Promise<string> {
    const { data } = await apiClient.post<string>(endpoints.notificacao.create, payload)
    return data
  },

  async update(id: string | number, payload: NotificacaoDTO): Promise<void> {
    await apiClient.put(`${endpoints.notificacao.base}/${id}`, payload)
  },

  // Dismiss notification for current user only
  async dismiss(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.notificacao.base}/${id}`)
  },

  // Remove notification for all users (admin only)
  async removeForAll(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.notificacao.base}/${id}/all`)
  },

  async markAsRead(id: string | number): Promise<void> {
    await apiClient.put(`${endpoints.notificacao.base}/${id}/lida`)
  },
}
