// Espelha ProgramaRequestDTO
export interface ProgramaRequestDTO {
  nome: string
  descricao: string
}

// Espelha ProgramaResponseDTO
export interface ProgramaResponseDTO {
  id: number
  nome: string
  descricao: string
}

// Espelha PromocaoProgramaResponseDTO (promoções aninhadas no programa)
export interface PromocaoProgramaResponseDTO {
  id: number
  titulo: string
  descricao: string
  pontosPorReal: number
  dataInicio: string
  dataFim: string
  ativo: import('./enums').ValidoEnum
}

// Espelha ProgramaComPromocoesResponseDTO (GET /programa)
export interface ProgramaComPromocoesResponseDTO {
  id: number
  nome: string
  descricao: string
  promocoes: PromocaoProgramaResponseDTO[]
}

// =====================
// Aliases (compatibilidade)
// =====================

export type ProgramaFidelidadeDTO = ProgramaRequestDTO
