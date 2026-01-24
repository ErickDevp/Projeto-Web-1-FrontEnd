import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { SaldoResponseDTO } from '../../interfaces/saldoUsuarioPrograma'

export const saldoUsuarioProgramaService = {
  async list(): Promise<SaldoResponseDTO[]> {
    const { data } = await apiClient.get<SaldoResponseDTO[]>(endpoints.saldoUsuarioPrograma.base)
    return data
  },
}
