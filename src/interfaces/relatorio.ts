/** DTOs de relatório */

export interface PontosPorCartaoDTO {
  cartaoId: number
  nomeCartao: string
  totalPontos: number
}

export interface HistoricoMovimentacaoDTO {
  movimentacaoId: number
  programa: string
  pontosCalculados: number
  data: string
  status: string
}

export interface EvolucaoMensalDTO {
  ano: number
  mes: number
  totalPontos: number
}

export interface RelatorioResponseDTO {
  pontosPorCartao: PontosPorCartaoDTO[]
  historico: HistoricoMovimentacaoDTO[]
  evolucaoMensal: EvolucaoMensalDTO[]
  saldoGlobal: number
  prazoMedio: number
}
