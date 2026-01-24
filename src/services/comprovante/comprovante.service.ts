import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { ComprovanteResponseDTO } from '../../interfaces/comprovante'

export const comprovanteService = {
  async getById(id: string | number): Promise<ComprovanteResponseDTO[]> {
    const { data } = await apiClient.get<ComprovanteResponseDTO[]>(`${endpoints.comprovante.base}/${id}`)
    return data
  },

  async getArquivo(id: string | number): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(endpoints.comprovante.arquivo(id), {
      responseType: 'blob',
    })
    return data
  },

  async create(payload: { movimentacaoId: number; file: File }): Promise<ComprovanteResponseDTO> {
    const formData = new FormData()
    formData.append('movimentacaoId', String(payload.movimentacaoId))
    formData.append('file', payload.file)

    const { data } = await apiClient.post<ComprovanteResponseDTO>(endpoints.comprovante.create, formData)
    return data
  },

  async remove(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.comprovante.base}/${id}`)
  },
}
