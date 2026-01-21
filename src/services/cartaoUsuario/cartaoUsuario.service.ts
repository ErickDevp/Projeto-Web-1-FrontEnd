import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { CartaoRequestDTO, CartaoResponseDTO } from '../../interfaces/cartaoUsuario'

export const cartaoUsuarioService = {
  async list(): Promise<CartaoResponseDTO[]> {
    const { data } = await apiClient.get<CartaoResponseDTO[]>(endpoints.cartaoUsuario.base)
    return data
  },

  async create(payload: CartaoRequestDTO): Promise<CartaoResponseDTO> {
    const { data } = await apiClient.post<CartaoResponseDTO>(endpoints.cartaoUsuario.create, payload)
    return data
  },

  async update(id: string | number, payload: CartaoRequestDTO): Promise<CartaoResponseDTO> {
    const { data } = await apiClient.put<CartaoResponseDTO>(`${endpoints.cartaoUsuario.base}/${id}`, payload)
    return data
  },

  async remove(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.cartaoUsuario.base}/${id}`)
  },
}
