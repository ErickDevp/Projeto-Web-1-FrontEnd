import type { FC } from 'react'
import SensitiveValue from '../../ui/SensitiveValue'
import { buildLinePoints, chartHeight, chartWidth } from '../../../pages/Dashboard/utils'

interface PointsPerMonthChartProps {
    monthlyPoints: { label: string; value: number; date: Date }[]
}

export const PointsPerMonthChart: FC<PointsPerMonthChartProps> = ({ monthlyPoints }) => {
    const TrendingUpIcon = (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
    )

    const monthlyValues = monthlyPoints.map((item) => item.value)
    const maxMonthly = Math.max(...monthlyValues, 1)
    const linePoints = buildLinePoints(monthlyValues)

    // Format point values for Y-axis labels
    const formatYLabel = (value: number) => {
        if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
        return value.toString()
    }

    return (
        <div className="dashboard-card">
            {/* Section Header */}
            <div className="section-header">
                <div className="card-icon">
                    {TrendingUpIcon}
                </div>
                <div className="flex-1">
                    <h2 className="section-title">Pontos por mês</h2>
                </div>
                <span className="badge">Últimos 7 meses</span>
            </div>
            {/* Chart Container */}
            <div className="chart-container mt-4">
                {monthlyPoints.length ? (
                    <>
                        <div className="flex gap-2">
                            {/* Y-axis labels - 5 values */}
                            <div className="flex flex-col justify-between text-[0.625rem] h-28 py-1 pr-1 text-right min-w-[2rem]">
                                <span className="titulo-grafico font-semibold"><SensitiveValue>{formatYLabel(maxMonthly)}</SensitiveValue></span>
                                <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxMonthly * 0.75))}</SensitiveValue></span>
                                <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxMonthly * 0.5))}</SensitiveValue></span>
                                <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxMonthly * 0.25))}</SensitiveValue></span>
                                <span className="text-fg-secondary">0</span>
                            </div>
                            {/* Chart SVG */}
                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-28 flex-1" aria-hidden="true">
                                {/* Grid lines - 4 lines for 5 sections */}
                                <line x1="0" y1={chartHeight * 0.2} x2={chartWidth} y2={chartHeight * 0.2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <line x1="0" y1={chartHeight * 0.4} x2={chartWidth} y2={chartHeight * 0.4} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <line x1="0" y1={chartHeight * 0.6} x2={chartWidth} y2={chartHeight * 0.6} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <line x1="0" y1={chartHeight * 0.8} x2={chartWidth} y2={chartHeight * 0.8} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                {/* Definição de gradiente */}
                                <defs>
                                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="rgb(39, 121, 167)" />
                                        <stop offset="100%" stopColor="rgb(73, 197, 182)" />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                {/* Line */}
                                <polyline
                                    fill="none"
                                    stroke="url(#lineGradient)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={linePoints}
                                    filter="url(#glow)"
                                />
                                {/* Points */}
                                {linePoints.split(' ').map((point, idx) => {
                                    const [x, y] = point.split(',')
                                    const isLast = idx === linePoints.split(' ').length - 1
                                    return (
                                        <g key={point}>
                                            {isLast && <circle cx={x} cy={y} r="8" fill="rgba(73,197,182,0.2)" />}
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r={isLast ? "5" : "3"}
                                                fill={isLast ? "rgb(73, 197, 182)" : "rgb(39, 121, 167)"}
                                            />
                                        </g>
                                    )
                                })}
                            </svg>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-fg-secondary pl-9">
                            {monthlyPoints.map((item, idx) => (
                                <span key={item.label} className={idx === monthlyPoints.length - 1 ? 'titulo-grafico font-semibold' : ''}>
                                    {item.label}
                                </span>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-fg-secondary">Sem dados mensais disponíveis.</p>
                )}
            </div>
        </div>
    )
}
