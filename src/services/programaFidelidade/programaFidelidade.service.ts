import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { ProgramaFidelidadeDTO } from '../../interfaces/programaFidelidade'

export const programaFidelidadeService = {
  // GET /programa retorna List<ProgramaFidelidade> (entity)
  async list<T = unknown[]>(): Promise<T> {
    const { data } = await apiClient.get<T>(endpoints.programaFidelidade.base)
    return data
  },

  async create(payload: ProgramaFidelidadeDTO): Promise<string> {
    const { data } = await apiClient.post<string>(endpoints.programaFidelidade.create, payload)
    return data
  },

  async update(id: string | number, payload: ProgramaFidelidadeDTO): Promise<void> {
    await apiClient.put(`${endpoints.programaFidelidade.base}/${id}`, payload)
  },

  async remove(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.programaFidelidade.base}/${id}`)
  },
}
