import type { FC } from 'react'
import SensitiveValue from '../../ui/SensitiveValue'
import { buildAreaPolygon, buildLinePoints, chartHeight, chartWidth } from '../../../pages/Dashboard/utils'

interface HistoryChartProps {
    historySeries: { label: string; value: number }[]
}

export const HistoryChart: FC<HistoryChartProps> = ({ historySeries }) => {
    const ClockIcon = (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )

    const historyValues = historySeries.map((item) => item.value)
    const maxHistory = Math.max(...historyValues, 1)
    const areaPolygon = buildAreaPolygon(historyValues)
    const historyLine = buildLinePoints(historyValues)

    const formatYLabel = (value: number) => {
        if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
        return value.toString()
    }

    return (
        <div className="dashboard-card">
            {/* Section Header */}
            <div className="section-header">
                <div className="card-icon">
                    {ClockIcon}
                </div>
                <div className="flex-1">
                    <h2 className="section-title">Histórico de acúmulo</h2>
                </div>
                <span className="badge">{historySeries.length} movimentações</span>
            </div>
            {/* Chart Container */}
            <div className="chart-container mt-4">
                {historySeries.length ? (
                    <>
                        <div className="flex gap-2">
                            {/* Y-axis labels - 5 values */}
                            <div className="flex flex-col justify-between text-[0.625rem] h-28 py-1 pr-1 text-right min-w-[2rem]">
                                <span className="titulo-grafico font-semibold"><SensitiveValue>{formatYLabel(maxHistory)}</SensitiveValue></span>
                                <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxHistory * 0.75))}</SensitiveValue></span>
                                <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxHistory * 0.5))}</SensitiveValue></span>
                                <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxHistory * 0.25))}</SensitiveValue></span>
                                <span className="text-fg-secondary">0</span>
                            </div>
                            {/* Chart SVG */}
                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-28 flex-1" aria-hidden="true">
                                {/* Definições de gradiente */}
                                <defs>
                                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(39, 121, 167, 0.4)" />
                                        <stop offset="100%" stopColor="rgba(39, 121, 167, 0)" />
                                    </linearGradient>
                                    <linearGradient id="historyLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="rgb(39, 121, 167)" />
                                        <stop offset="100%" stopColor="rgb(73, 197, 182)" />
                                    </linearGradient>
                                </defs>
                                {/* Grid lines - 4 lines for 5 sections */}
                                <line x1="0" y1={chartHeight * 0.2} x2={chartWidth} y2={chartHeight * 0.2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <line x1="0" y1={chartHeight * 0.4} x2={chartWidth} y2={chartHeight * 0.4} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <line x1="0" y1={chartHeight * 0.6} x2={chartWidth} y2={chartHeight * 0.6} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <line x1="0" y1={chartHeight * 0.8} x2={chartWidth} y2={chartHeight * 0.8} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                {/* Área */}
                                <polygon points={areaPolygon} fill="url(#areaGradient)" />
                                {/* Line */}
                                <polyline
                                    fill="none"
                                    stroke="url(#historyLineGradient)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={historyLine}
                                />
                                {/* Points */}
                                {historyLine.split(' ').map((point, idx) => {
                                    const [x, y] = point.split(',')
                                    const isLast = idx === historyLine.split(' ').length - 1
                                    return (
                                        <g key={`hist-${point}`}>
                                            {isLast && <circle cx={x} cy={y} r="8" fill="rgba(73,197,182,0.2)" />}
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r={isLast ? "4" : "2.5"}
                                                fill={isLast ? "rgb(73, 197, 182)" : "rgb(39, 121, 167)"}
                                            />
                                        </g>
                                    )
                                })}
                            </svg>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-fg-secondary pl-9">
                            {historySeries.map((item, idx) => (
                                <span key={item.label} className={idx === historySeries.length - 1 ? 'titulo-grafico font-semibold' : ''}>
                                    {item.label}
                                </span>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-fg-secondary">Nenhuma movimentação registrada.</p>
                )}
            </div>
        </div>
    )
}
