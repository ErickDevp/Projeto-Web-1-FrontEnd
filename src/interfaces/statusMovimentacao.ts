import type { StatusMovimentacaoEnum } from './enums'

// Espelha StatusMovimentacaoDTO
export interface StatusMovimentacaoDTO {
  movimentacaoId: number
  status: StatusMovimentacaoEnum
  motivo: string
}

// Retorno do backend (entity). Campos podem variar; tipamos o essencial e mantemos flexível.
export type StatusMovimentacao = {
  id?: number
  movimentacaoId?: number
  status?: StatusMovimentacaoEnum
  motivo?: string
  movimentacao?: unknown
  [key: string]: unknown
}
