import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type {
  ProgramaRequestDTO,
  ProgramaResponseDTO,
  ProgramaComPromocoesResponseDTO
} from '../../interfaces/programaFidelidade'

export const programaFidelidadeService = {
  async list(): Promise<ProgramaComPromocoesResponseDTO[]> {
    const { data } = await apiClient.get<ProgramaComPromocoesResponseDTO[]>(endpoints.programaFidelidade.base)
    return data
  },

  async create(payload: ProgramaRequestDTO): Promise<ProgramaResponseDTO> {
    const { data } = await apiClient.post<ProgramaResponseDTO>(endpoints.programaFidelidade.create, payload)
    return data
  },

  async update(id: string | number, payload: ProgramaRequestDTO): Promise<ProgramaResponseDTO> {
    const { data } = await apiClient.put<ProgramaResponseDTO>(`${endpoints.programaFidelidade.base}/${id}`, payload)
    return data
  },

  async remove(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.programaFidelidade.base}/${id}`)
  },
}
