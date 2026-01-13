import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { StatusMovimentacao, StatusMovimentacaoDTO } from '../../interfaces/statusMovimentacao'

export const statusMovimentacaoService = {
  async getById(id: string | number): Promise<StatusMovimentacao> {
    const { data } = await apiClient.get<StatusMovimentacao>(`${endpoints.statusMovimentacao.base}/${id}`)
    return data
  },

  // Backend: POST /status/criar
  async create(payload: StatusMovimentacaoDTO): Promise<string> {
    const { data } = await apiClient.post<string>(endpoints.statusMovimentacao.create, payload)
    return data
  },

  // Backend: PUT /status/{id} -> 204
  async update(id: string | number, payload: StatusMovimentacaoDTO): Promise<void> {
    await apiClient.put(`${endpoints.statusMovimentacao.base}/${id}`, payload)
  },

  // Backend: DELETE /status/{id} -> 204
  async remove(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.statusMovimentacao.base}/${id}`)
  },

  // Não existe list no controller atual; deixo aqui caso você adicione depois.
  async list<T = unknown>(): Promise<T> {
    const { data } = await apiClient.get<T>(endpoints.statusMovimentacao.base)
    return data
  },
}
