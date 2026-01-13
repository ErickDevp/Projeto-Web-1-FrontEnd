import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'

export const comprovanteService = {
  // GET /comprovante/{id} retorna List<Comprovante> (entity)
  async getById<T = unknown[]>(id: string | number): Promise<T> {
    const { data } = await apiClient.get<T>(`${endpoints.comprovante.base}/${id}`)
    return data
  },

  // POST /comprovante/criar (multipart/form-data)
  async create(payload: { movimentacaoId: number; file: File }): Promise<string> {
    const formData = new FormData()
    formData.append('movimentacaoId', String(payload.movimentacaoId))
    formData.append('file', payload.file)

    const { data } = await apiClient.post<string>(endpoints.comprovante.create, formData)
    return data
  },

  async remove(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.comprovante.base}/${id}`)
  },
}
