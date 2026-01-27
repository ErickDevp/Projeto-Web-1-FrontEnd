import React, { memo } from 'react'
import SensitiveValue from '../../ui/SensitiveValue'
import { formatCurrency, formatPoints } from '../../../utils/format'

interface MovimentacoesHeaderProps {
    totalValor: number
    saldoGlobal: number
}

const MovimentacoesHeader: React.FC<MovimentacoesHeaderProps> = ({ totalValor, saldoGlobal }) => {
    return (
        <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="titulo-grafico text-2xl font-bold">Movimentações</h1>
                <p className="mt-1 text-sm text-fg-secondary">
                    Histórico completo de pontos e compras registradas.
                </p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-xs text-fg-secondary">Total movimentado</p>
                    <p className="text-lg font-bold text-fg-primary"><SensitiveValue>{formatCurrency(totalValor)}</SensitiveValue></p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-fg-secondary">Saldo Global</p>
                    <p className="text-lg font-bold text-accent-pool"><SensitiveValue>{formatPoints(saldoGlobal)}</SensitiveValue></p>
                </div>
            </div>
        </header>
    )
}

export default memo(MovimentacoesHeader)
