/** DTO para requisição de notificação */
export interface NotificacaoRequestDTO {
  titulo: string
  mensagem: string
  tipo: string
}

/** DTO de resposta da notificação */
export interface NotificacaoResponseDTO {
  id: number
  titulo: string
  mensagem: string
  tipo: string
  dataCriacao: string
  lida: boolean
}

// Alias de compatibilidade
export type Notificacao = NotificacaoResponseDTO
