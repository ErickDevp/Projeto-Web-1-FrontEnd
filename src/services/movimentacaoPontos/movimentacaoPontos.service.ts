import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { MovimentacaoRequestDTO, MovimentacaoResponseDTO } from '../../interfaces/movimentacaoPontos'

export const movimentacaoPontosService = {
  async list(): Promise<MovimentacaoResponseDTO[]> {
    const { data } = await apiClient.get<MovimentacaoResponseDTO[]>(endpoints.movimentacaoPontos.base)
    return data
  },

  async create(payload: MovimentacaoRequestDTO): Promise<MovimentacaoResponseDTO> {
    const { data } = await apiClient.post<MovimentacaoResponseDTO>(endpoints.movimentacaoPontos.create, payload)
    return data
  },

  async update(id: string | number, payload: MovimentacaoRequestDTO): Promise<MovimentacaoResponseDTO> {
    const { data } = await apiClient.put<MovimentacaoResponseDTO>(`${endpoints.movimentacaoPontos.base}/${id}`, payload)
    return data
  },

  async remove(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.movimentacaoPontos.base}/${id}`)
  },
}
