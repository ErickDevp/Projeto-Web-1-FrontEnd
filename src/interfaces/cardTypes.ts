import type { BandeiraEnum, TipoCartaoEnum, ValidoEnum } from './enums'

/**
 * Tipos compartilhados para cartões e programas
 */

/** Interface base para Programa de Fidelidade */
export type Programa = {
    id: number
    nome: string
    descricao?: string
}

/** Interface base para Cartão (usado em listas e visualização) */
export type CartaoBase = {
    id?: number
    nome?: string
    bandeira?: BandeiraEnum | string
    tipo?: TipoCartaoEnum | string
    numero?: string
    dataValidade?: string
    valido?: ValidoEnum | string
    programa?: Programa | null
    programas?: Programa[]
}

/** Interface completa para Cartão com campos opcionais extras */
export type Cartao = CartaoBase & {
    aparencia?: string
    [key: string]: unknown
}
