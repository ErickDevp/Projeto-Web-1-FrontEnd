// Espelha SaldoUsuarioProgramaDTO
export interface SaldoUsuarioProgramaDTO {
  programaId: number
  pontos: number
}

// Retorno do backend (entity). Campos podem variar; tipamos o essencial e mantemos flexível.
export type SaldoUsuarioPrograma = {
  id?: number
  pontos?: number
  programaId?: number
  programa?: unknown
  usuario?: unknown
  [key: string]: unknown
}
