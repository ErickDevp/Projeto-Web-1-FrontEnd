import type { StatusResponseDTO } from './statusMovimentacao'

// Espelha MovimentacaoRequestDTO
export interface MovimentacaoRequestDTO {
  cartaoId: number
  programaId: number
  promocaoId?: number    // Opcional
  valor: number | string // BigDecimal pode vir como número ou string
  data: string           // ISO date string (YYYY-MM-DD)
}

// Espelha MovimentacaoResponseDTO
export interface MovimentacaoResponseDTO {
  id: number
  valor: number | string
  pontosCalculados: number
  dataOcorrencia: string
  cartaoId: number
  cartaoNome: string
  programaId: number
  programaNome: string
  status: StatusResponseDTO
  comprovantes: ComprovanteResponseDTO[]
}

import type { ComprovanteResponseDTO } from './comprovante'

// =====================
// Aliases (compatibilidade)
// =====================

export type MovimentacaoPontosDTO = MovimentacaoRequestDTO
