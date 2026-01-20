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
 * Helper function to extract status string from various formats
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
    /** The status value - can be a string or an object with a status property */
    status: StatusType | { status?: string } | undefined
    /** Optional className for additional styling */
    className?: string
    /** Size variant */
    size?: 'sm' | 'md'
}

/**
 * StatusBadge component for displaying status indicators with semantic colors.
 * 
 * @example
 * // With string status
 * <StatusBadge status="CREDITADO" />
 * 
 * @example
 * // With object status
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

// Export config for use in stat cards
export { STATUS_CONFIG, getStatusString }
export type { StatusConfig }
