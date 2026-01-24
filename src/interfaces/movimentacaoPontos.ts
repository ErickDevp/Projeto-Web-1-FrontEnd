import type { StatusResponseDTO } from './statusMovimentacao'
import type { ComprovanteResponseDTO } from './comprovante'

/** DTO para requisição de movimentação */
export interface MovimentacaoRequestDTO {
  cartaoId: number
  programaId: number
  promocaoId?: number
  valor: number | string
  data: string
}

/** DTO de resposta da movimentação */
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
