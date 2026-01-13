import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { SaldoUsuarioPrograma } from '../../interfaces/saldoUsuarioPrograma'

export const saldoUsuarioProgramaService = {
  // Backend: GET /saldo
  async list(): Promise<SaldoUsuarioPrograma[]> {
    const { data } = await apiClient.get<SaldoUsuarioPrograma[]>(endpoints.saldoUsuarioPrograma.base)
    return data
  },
}
