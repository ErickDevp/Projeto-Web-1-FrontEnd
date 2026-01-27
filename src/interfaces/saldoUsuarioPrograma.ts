import type { ProgramaResponseDTO } from './programaFidelidade'

/** DTO de resposta do saldo */
export interface SaldoResponseDTO {
  id: number
  pontos: number
  programaId: ProgramaResponseDTO
}
