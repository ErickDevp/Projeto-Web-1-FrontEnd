import type { StatusMovimentacaoEnum } from '../../interfaces/enums'

export type StatusType = 'PENDENTE' | 'CREDITADO' | 'EXPIRADO' | 'CANCELADO' | StatusMovimentacaoEnum | string

type StatusConfig = {
    label: string
    bg: string
    text: string
    border: string
    dot: string
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
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

const DEFAULT_STATUS: StatusConfig = STATUS_CONFIG.PENDENTE

/**
 * Função auxiliar para extrair string de status de vários formatos
 */
function getStatusString(status: StatusType | { status?: string } | undefined): string {
    if (!status) return 'PENDENTE'
    if (typeof status === 'string') return status.toUpperCase()
    if (typeof status === 'object' && 'status' in status) {
        return (status.status ?? 'PENDENTE').toUpperCase()
    }
    return 'PENDENTE'
}

type StatusBadgeProps = {
    /** O valor do status - pode ser uma string ou um objeto com uma propriedade status */
    status: StatusType | { status?: string } | undefined
    /** className opcional para estilização adicional */
    className?: string
    /** Variante de tamanho */
    size?: 'sm' | 'md'
}

/**
 * Componente StatusBadge para exibir indicadores de status com cores semânticas.
 * 
 * @example
 * // Com status string
 * <StatusBadge status="CREDITADO" />
 * 
 * @example
 * // Com status objeto
 * <StatusBadge status={{ status: 'PENDENTE' }} />
 */
export default function StatusBadge({ status, className = '', size = 'sm' }: StatusBadgeProps) {
    const statusKey = getStatusString(status)
    const config = STATUS_CONFIG[statusKey] ?? DEFAULT_STATUS

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[0.625rem]',
        md: 'px-2.5 py-1 text-xs',
    }

    const dotSizeClasses = {
        sm: 'h-1.5 w-1.5',
        md: 'h-2 w-2',
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${className}`}
        >
            <span className={`rounded-full ${config.dot} ${dotSizeClasses[size]}`} />
            {config.label}
        </span>
    )
}

// Exporta config para uso em cards de estatísticas
export { STATUS_CONFIG, getStatusString }
export type { StatusConfig }
