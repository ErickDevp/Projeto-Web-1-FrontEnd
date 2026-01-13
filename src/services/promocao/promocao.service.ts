import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { PromocaoDTO } from '../../interfaces/promocao'

export const promocaoService = {
  // GET /promocao retorna List<Promocao> (entity)
  async list<T = unknown[]>(): Promise<T> {
    const { data } = await apiClient.get<T>(endpoints.promocao.base)
    return data
  },

  async create(payload: PromocaoDTO): Promise<string> {
    const { data } = await apiClient.post<string>(endpoints.promocao.create, payload)
    return data
  },

  async update(id: string | number, payload: PromocaoDTO): Promise<void> {
    await apiClient.put(`${endpoints.promocao.base}/${id}`, payload)
  },

  async remove(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.promocao.base}/${id}`)
  },
}
