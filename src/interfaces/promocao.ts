import type { ValidoEnum } from './enums'
import type { ProgramaResponseDTO } from './programaFidelidade'

/** DTO para requisição de promoção */
export interface PromocaoRequestDTO {
  titulo: string
  descricao: string
  dataInicio: string
  dataFim: string
  programaId: number
  pontosPorReal: number
}

/** DTO de resposta da promoção */
export interface PromocaoResponseDTO {
  id: number
  titulo: string
  descricao: string
  pontosPorReal: number
  dataInicio: string
  dataFim: string
  ativo: ValidoEnum
  programaId: ProgramaResponseDTO
}
