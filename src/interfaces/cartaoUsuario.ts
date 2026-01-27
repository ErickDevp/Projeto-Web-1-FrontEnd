import type { BandeiraEnum, TipoCartaoEnum, ValidoEnum } from './enums'
import type { ProgramaResponseDTO } from './programaFidelidade'

/** DTO para criar/atualizar cartão */
export interface CartaoRequestDTO {
  nome: string
  bandeira: BandeiraEnum
  tipo: TipoCartaoEnum
  numero: string
  dataValidade: string
  programaIds: number[]
}

/** DTO de resposta do cartão */
export interface CartaoResponseDTO {
  id: number
  nome: string
  bandeira: BandeiraEnum
  tipo: TipoCartaoEnum
  numero: string
  dataValidade: string
  valido: ValidoEnum
  programas: ProgramaResponseDTO[]
}
