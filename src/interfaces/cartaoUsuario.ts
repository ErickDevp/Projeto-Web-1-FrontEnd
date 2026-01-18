import type { BandeiraEnum, TipoCartaoEnum } from './enums'

// Espelha CartaoUsuarioDTO (para criar/atualizar)
export interface CartaoUsuarioDTO {
  nome: string
  bandeira: BandeiraEnum
  tipo: TipoCartaoEnum
  multiplicadorPontos: number
  programaIds: number[]
}

// Espelha CartaoUsuarioResponseDTO (resposta do backend)
export interface CartaoUsuarioResponseDTO {
  id: number
  nome: string
  bandeira: BandeiraEnum
  tipo: TipoCartaoEnum
  multiplicadorPontos: number
  pontos: number
  programaIds: number[]
}
