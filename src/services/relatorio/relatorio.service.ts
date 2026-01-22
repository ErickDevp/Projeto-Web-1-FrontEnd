import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { RelatorioResponseDTO } from '../../interfaces/relatorio'

export const relatorioService = {

  async get<T = RelatorioResponseDTO>(): Promise<T> {
    const { data } = await apiClient.get<T>(endpoints.relatorio.base)
    return data
  },

  async exportCsv(): Promise<ArrayBuffer> {
    const { data } = await apiClient.get<ArrayBuffer>(endpoints.relatorio.csv, {
      responseType: 'arraybuffer',
    })
    return data
  },

  async exportPdf(): Promise<ArrayBuffer> {
    const { data } = await apiClient.get<ArrayBuffer>(endpoints.relatorio.pdf, {
      responseType: 'arraybuffer',
    })
    return data
  },
}
