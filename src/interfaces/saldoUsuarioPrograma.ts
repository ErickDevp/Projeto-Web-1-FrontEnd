import type { ProgramaResponseDTO } from './programaFidelidade'

// Espelha SaldoResponseDTO
export interface SaldoResponseDTO {
  id: number
  pontos: number
  programaId: ProgramaResponseDTO  // Objeto aninhado
}

// =====================
// Aliases (compatibilidade)
// =====================

// Legacy: SaldoUsuarioProgramaDTO
export interface SaldoUsuarioProgramaDTO {
  programaId: number
  pontos: number
}

// Legacy: SaldoUsuarioPrograma (entity)
export type SaldoUsuarioPrograma = {
  id?: number
  pontos?: number
  programaId?: number | ProgramaResponseDTO
  programa?: unknown
  usuario?: unknown
  [key: string]: unknown
}
