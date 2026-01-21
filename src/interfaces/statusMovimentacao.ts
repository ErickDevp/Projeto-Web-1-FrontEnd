import type { StatusMovimentacaoEnum } from './enums'

// Espelha StatusResponseDTO (usado aninhado em MovimentacaoResponseDTO)
export interface StatusResponseDTO {
  status: StatusMovimentacaoEnum
  motivo: string
}

// =====================
// Aliases (compatibilidade - deprecated)
// =====================

// Legacy: StatusMovimentacaoDTO (não mais usado como endpoint independente)
export interface StatusMovimentacaoDTO {
  movimentacaoId: number
  status: StatusMovimentacaoEnum
  motivo: string
}

// Legacy: StatusMovimentacao (entity)
export type StatusMovimentacao = {
  id?: number
  movimentacaoId?: number
  status?: StatusMovimentacaoEnum
  motivo?: string
  movimentacao?: unknown
  [key: string]: unknown
}
