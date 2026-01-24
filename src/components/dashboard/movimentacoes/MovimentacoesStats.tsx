import React, { memo } from 'react'
import { STATUS_CONFIG } from '../../ui/StatusBadge'

interface MovimentacoesStatsProps {
    counts: Record<string, number>
}

const MovimentacoesStats: React.FC<MovimentacoesStatsProps> = ({ counts }) => {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(['PENDENTE', 'CREDITADO', 'EXPIRADO', 'CANCELADO'] as const).map((status) => {
                const count = counts[status] ?? 0
                const config = STATUS_CONFIG[status]
                return (
                    <div key={status} className={`dashboard-card !min-h-0 p-4 ${config.bg} border ${config.border}`}>
                        <p className={`text-xs font-medium ${config.text}`}>{config.label}</p>
                        <p className="text-2xl font-bold text-fg-primary">{count}</p>
                    </div>
                )
            })}
        </div>
    )
}

export default memo(MovimentacoesStats)
