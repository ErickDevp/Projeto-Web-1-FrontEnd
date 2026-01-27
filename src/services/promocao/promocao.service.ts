import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { PromocaoRequestDTO, PromocaoResponseDTO } from '../../interfaces/promocao'

export const promocaoService = {
  async list(): Promise<PromocaoResponseDTO[]> {
    const { data } = await apiClient.get<PromocaoResponseDTO[]>(endpoints.promocao.base)
    return data
  },

  async create(payload: PromocaoRequestDTO): Promise<PromocaoResponseDTO> {
    const { data } = await apiClient.post<PromocaoResponseDTO>(endpoints.promocao.create, payload)
    return data
  },

  async update(id: string | number, payload: PromocaoRequestDTO): Promise<PromocaoResponseDTO> {
    const { data } = await apiClient.put<PromocaoResponseDTO>(`${endpoints.promocao.base}/${id}`, payload)
    return data
  },

  async remove(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.promocao.base}/${id}`)
  },
}
