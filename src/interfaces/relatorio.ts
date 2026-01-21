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

// Espelha EvolucaoMensalDTO
export interface EvolucaoMensalDTO {
  ano: number
  mes: number
  totalPontos: number
}

// Espelha RelatorioResponseDTO
export interface RelatorioResponseDTO {
  pontosPorCartao: PontosPorCartaoDTO[]
  historico: HistoricoMovimentacaoDTO[]
  evolucaoMensal: EvolucaoMensalDTO[]
  saldoGlobal: number
  prazoMedio: number  // Novo campo
}
