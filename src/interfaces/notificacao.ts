// Espelha NotificacaoDTO (para criação)
export interface NotificacaoDTO {
  titulo: string
  mensagem: string
  tipo: string
}

// Espelha a entidade Notificacao do backend
export interface Notificacao {
  id: number
  titulo: string
  mensagem: string
  tipo: string
  lida: boolean
  dataCriacao: string
}
