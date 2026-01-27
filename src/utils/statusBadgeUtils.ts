import type { StatusMovimentacaoEnum } from '../interfaces/enums'

export type StatusType = 'PENDENTE' | 'CREDITADO' | 'EXPIRADO' | 'CANCELADO' | StatusMovimentacaoEnum | string

export type StatusConfig = {
    label: string
    bg: string
    text: string
    border: string
    dot: string
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
    CREDITADO: {
        label: 'Creditado',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
    },
    PENDENTE: {
        label: 'Pendente',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
    },
    EXPIRADO: {
        label: 'Expirado',
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        dot: 'bg-red-400',
    },
    CANCELADO: {
        label: 'Cancelado',
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
        dot: 'bg-gray-400',
    },
}

export const DEFAULT_STATUS: StatusConfig = STATUS_CONFIG.PENDENTE

/**
 * Função auxiliar para extrair string de status de vários formatos
 */
export function getStatusString(status: StatusType | { status?: string } | undefined): string {
    if (!status) return 'PENDENTE'
    if (typeof status === 'string') return status.toUpperCase()
    if (typeof status === 'object' && 'status' in status) {
        return (status.status ?? 'PENDENTE').toUpperCase()
    }
    return 'PENDENTE'
}
