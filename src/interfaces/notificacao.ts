// Espelha NotificacaoRequestDTO
export interface NotificacaoRequestDTO {
  titulo: string
  mensagem: string
  tipo: string
}

// Espelha NotificacaoResponseDTO
export interface NotificacaoResponseDTO {
  id: number
  titulo: string
  mensagem: string
  tipo: string
  dataCriacao: string
  lida: boolean
}

// =====================
// Aliases (compatibilidade)
// =====================

export type NotificacaoDTO = NotificacaoRequestDTO
export type Notificacao = NotificacaoResponseDTO
