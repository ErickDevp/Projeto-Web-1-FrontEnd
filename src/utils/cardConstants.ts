/**
 * Constantes e helpers relacionados a cartões
 * Consolidado de: Cartoes.tsx, RegistrarPontos.tsx, Movimentacoes.tsx
 */

import type { BandeiraEnum, TipoCartaoEnum } from '../interfaces/enums'

// Bandeiras de cartão com cores e labels
export const BANDEIRAS: { value: BandeiraEnum; label: string; color: string }[] = [
    { value: 'VISA', label: 'Visa', color: '#1A1F71' },
    { value: 'MASTERCARD', label: 'Mastercard', color: '#EB001B' },
    { value: 'ELO', label: 'Elo', color: '#00A4E0' },
    { value: 'AMERICAN_EXPRESS', label: 'American Express', color: '#006FCF' },
    { value: 'HIPERCARD', label: 'Hipercard', color: '#B3131B' },
]

// Mapa simplificado de cores por bandeira
export const BANDEIRA_COLORS: Record<string, string> = Object.fromEntries(
    BANDEIRAS.map((b) => [b.value, b.color])
)

// Tipos de cartão
export const TIPOS: { value: TipoCartaoEnum; label: string }[] = [
    { value: 'CREDITO', label: 'Crédito' },
    { value: 'DEBITO', label: 'Débito' },
]

// Estilos de status de movimentação
export const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
    PENDENTE: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Pendente' },
    CREDITADO: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', label: 'Creditado' },
    EXPIRADO: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', label: 'Expirado' },
    CANCELADO: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Cancelado' },
}

/**
 * Retorna informações da bandeira (label, color) dado o valor
 */
export const getBandeiraInfo = (bandeira?: string) => {
    return BANDEIRAS.find((b) => b.value === bandeira) ?? BANDEIRAS[0]
}

/**
 * Retorna o label do tipo de cartão
 */
export const getTipoLabel = (tipo?: string) => {
    return TIPOS.find((t) => t.value === tipo)?.label ?? tipo
}
