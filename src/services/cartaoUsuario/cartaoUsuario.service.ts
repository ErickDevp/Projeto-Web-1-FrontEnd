import { apiClient } from '../http/client'
import { endpoints } from '../endpoints'
import type { CartaoUsuarioDTO } from '../../interfaces/cartaoUsuario'

export const cartaoUsuarioService = {
  async list<T = unknown[]>(): Promise<T> {
    const { data } = await apiClient.get<T>(endpoints.cartaoUsuario.base)
    return data
  },

  async create(payload: CartaoUsuarioDTO): Promise<string> {
    const { data } = await apiClient.post<string>(endpoints.cartaoUsuario.create, payload)
    return data
  },

  async update(id: string | number, payload: CartaoUsuarioDTO): Promise<void> {
    await apiClient.put(`${endpoints.cartaoUsuario.base}/${id}`, payload)
  },

  async remove(id: string | number): Promise<void> {
    await apiClient.delete(`${endpoints.cartaoUsuario.base}/${id}`)
  },
}
