import type { BandeiraEnum, TipoCartaoEnum } from './enums'

// Espelha CartaoUsuarioDTO
export interface CartaoUsuarioDTO {
  nome: string
  bandeira: BandeiraEnum
  tipo: TipoCartaoEnum
  pontos: number
  programaIds: number[]
}
