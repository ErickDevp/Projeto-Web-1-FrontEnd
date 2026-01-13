// DTOs do pacote br.edu.ifs.academico.DTO.relatorio

// Espelha PontosPorCartaoDTO
export interface PontosPorCartaoDTO {
  cartaoId: number
  nomeCartao: string
  totalPontos: number
}

// Espelha HistoricoMovimentacaoDTO
export interface HistoricoMovimentacaoDTO {
  movimentacaoId: number
  programa: string
  pontosCalculados: number
  data: string
  status: string
}

// Espelha RelatorioResponseDTO
export interface RelatorioResponseDTO {
  pontosPorCartao: PontosPorCartaoDTO[]
  historico: HistoricoMovimentacaoDTO[]
  prazoMedio: number
}
