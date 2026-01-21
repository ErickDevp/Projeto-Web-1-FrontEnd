import type { BandeiraEnum, TipoCartaoEnum, ValidoEnum } from './enums'
import type { ProgramaResponseDTO } from './programaFidelidade'

// Espelha CartaoRequestDTO (para criar/atualizar)
export interface CartaoRequestDTO {
  nome: string
  bandeira: BandeiraEnum
  tipo: TipoCartaoEnum
  numero: string           // 16 dígitos numéricos
  dataValidade: string     // ISO date (YYYY-MM-DD)
  programaIds: number[]    // IDs dos programas vinculados
}

// Espelha CartaoResponseDTO (resposta do backend)
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

// =====================
// Aliases (compatibilidade)
// =====================

// Legacy: CartaoUsuarioDTO
export type CartaoUsuarioDTO = CartaoRequestDTO

// Legacy: CartaoUsuarioResponseDTO (campos antigos)
export interface CartaoUsuarioResponseDTO {
  id: number
  nome: string
  bandeira: BandeiraEnum
  tipo: TipoCartaoEnum
  numero?: string
  dataValidade?: string
  valido?: ValidoEnum
  multiplicadorPontos?: number  // Deprecated
  pontos?: number               // Deprecated
  programaIds?: number[]        // Deprecated
  programas?: ProgramaResponseDTO[]
}
