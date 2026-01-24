import type { StatusMovimentacaoEnum } from './enums'

/** DTO de resposta do status (usado aninhado em MovimentacaoResponseDTO) */
export interface StatusResponseDTO {
  status: StatusMovimentacaoEnum
  motivo: string
}
