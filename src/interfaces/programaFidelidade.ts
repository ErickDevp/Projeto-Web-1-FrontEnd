import type { ValidoEnum } from './enums'

/** DTO para requisição de programa */
export interface ProgramaRequestDTO {
  nome: string
  descricao: string
}

/** DTO de resposta do programa */
export interface ProgramaResponseDTO {
  id: number
  nome: string
  descricao: string
}

/** DTO de promoção aninhada no programa */
export interface PromocaoProgramaResponseDTO {
  id: number
  titulo: string
  descricao: string
  pontosPorReal: number
  dataInicio: string
  dataFim: string
  ativo: ValidoEnum
}

/** DTO de programa com promoções (GET /programa) */
export interface ProgramaComPromocoesResponseDTO {
  id: number
  nome: string
  descricao: string
  promocoes: PromocaoProgramaResponseDTO[]
}
