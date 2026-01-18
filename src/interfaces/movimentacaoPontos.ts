// Espelha MovimentacaoPontosDTO
// BigDecimal (backend) pode chegar como número ou string em JSON dependendo da serialização.
export interface MovimentacaoPontosDTO {
  cartaoId: number
  programaId: number
  valor: number | string
  data?: string // ISO date string (YYYY-MM-DD)
}
