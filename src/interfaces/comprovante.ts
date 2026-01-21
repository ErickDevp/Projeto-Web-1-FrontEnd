// Espelha ComprovanteResponseDTO
export interface ComprovanteResponseDTO {
  id: number
  caminho: string
  tipo_arq: string
  tamanho_bytes: number
}

// =====================
// Aliases (compatibilidade)
// =====================

// Legacy: ComprovanteDTO (para requisições internas)
export interface ComprovanteDTO {
  movimentacaoId: number
  caminho?: string
  tipo_arq?: string
  tamanho_bytes?: number
}
