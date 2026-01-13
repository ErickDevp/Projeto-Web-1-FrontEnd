import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { MovimentacaoPontosDTO } from '../../interfaces/movimentacaoPontos'

export const movimentacaoPontosService = {
  // Normalmente o retorno aqui é uma entity, não o DTO de criação.
  async list<T = unknown[]>(): Promise<T> {
    const { data } = await apiClient.get<T>(endpoints.movimentacaoPontos.base)
    return data
  },

  async create(payload: MovimentacaoPontosDTO): Promise<string> {
    const { data } = await apiClient.post<string>(endpoints.movimentacaoPontos.create, payload)
    return data
  },

  async update(id: string | number, payload: MovimentacaoPontosDTO): Promise<void> {
    await apiClient.put(`${endpoints.movimentacaoPontos.base}/${id}`, payload)
  },

  async remove(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.movimentacaoPontos.base}/${id}`)
  },
}
