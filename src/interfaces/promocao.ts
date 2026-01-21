import type { ValidoEnum } from './enums'
import type { ProgramaResponseDTO } from './programaFidelidade'

// Espelha PromocaoRequestDTO
export interface PromocaoRequestDTO {
  titulo: string
  descricao: string
  dataInicio: string     // ISO date (YYYY-MM-DD)
  dataFim: string        // ISO date (YYYY-MM-DD)
  programaId: number
  pontosPorReal: number  // Multiplicador de pontos por real
}

// Espelha PromocaoResponseDTO
export interface PromocaoResponseDTO {
  id: number
  titulo: string
  descricao: string
  pontosPorReal: number
  dataInicio: string
  dataFim: string
  ativo: ValidoEnum
  programaId: ProgramaResponseDTO  // Objeto aninhado
}

// =====================
// Aliases (compatibilidade)
// =====================

// Legacy: PromocaoDTO (campos antigos)
export interface PromocaoDTO {
  programaId: number
  titulo: string
  descricao: string
  data_inicio?: string   // Deprecated: usar dataInicio
  data_fim?: string      // Deprecated: usar dataFim
  dataInicio?: string
  dataFim?: string
  pontosPorReal?: number
  ativo?: boolean | ValidoEnum
}
