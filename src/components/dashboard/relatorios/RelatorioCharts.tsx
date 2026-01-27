import { usePreferences } from '../../../hooks/usePreferences'
import type { EvolucaoMensalDTO, PontosPorCartaoDTO } from '../../../interfaces/relatorio'

// Month names in Portuguese
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// Colors for charts - Vibrant and distinct palette
const CHART_COLORS = [
    '#3B82F6', // blue
    '#8B5CF6', // violet/purple
    '#10B981', // emerald
    '#F97316', // orange
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#6366F1', // indigo
    '#14B8A6', // teal
    '#F59E0B', // amber
]

function formatPoints(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value)
}

// Line Chart Component (SVG)
export function LineChart({ data }: { data: EvolucaoMensalDTO[] }) {
    const { preferences } = usePreferences()
    const hideValues = preferences.hideValues

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-fg-secondary">
                <p className="text-sm">Sem dados de evolução disponíveis</p>
            </div>
        )
    }

    const sortedData = [...data].sort((a, b) => {
        if (a.ano !== b.ano) return a.ano - b.ano
        return a.mes - b.mes
    })

    const maxValue = Math.max(...sortedData.map((d) => d.totalPontos))
    const minValue = Math.min(...sortedData.map((d) => d.totalPontos))
    const range = maxValue - minValue || 1

    // Increased dimensions with left padding for Y-axis labels
    const width = 110
    const height = 60
    const paddingLeft = 15
    const paddingRight = 5
    const paddingTop = 5
    const paddingBottom = 5

    const chartWidth = width - paddingLeft - paddingRight
    const chartHeight = height - paddingTop - paddingBottom

    const points = sortedData.map((d, i) => {
        const x = paddingLeft + (i / (sortedData.length - 1 || 1)) * chartWidth
        const y = paddingTop + (1 - (d.totalPontos - minValue) / range) * chartHeight
        return { x, y, data: d }
    })

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`

    // Y-axis values (percentages of range)
    const yAxisValues = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
        ratio,
        value: Math.round(maxValue - ratio * range),
        y: paddingTop + ratio * chartHeight,
    }))

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64" preserveAspectRatio="none">
                {/* Y-axis labels */}
                {yAxisValues.map((item) => (
                    <text
                        key={item.ratio}
                        x={paddingLeft - 2}
                        y={item.y}
                        textAnchor="end"
                        dominantBaseline="middle"
                        className="fill-current text-fg-secondary"
                        style={{ fontSize: '2.5px' }}
                    >
                        {hideValues ? '••••' : formatPoints(item.value)}
                    </text>
                ))}

                {/* Grid lines */}
                {yAxisValues.map((item) => (
                    <line
                        key={item.ratio}
                        x1={paddingLeft}
                        y1={item.y}
                        x2={width - paddingRight}
                        y2={item.y}
                        stroke="currentColor"
                        strokeOpacity={0.1}
                        strokeWidth={0.2}
                    />
                ))}

                {/* Gradient area */}
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <path d={areaD} fill="url(#areaGradient)" />

                {/* Main line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="#00B4D8"
                    strokeWidth={0.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={1}
                        fill="#00B4D8"
                        className="hover:r-2 transition-all"
                    />
                ))}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-[0.625rem] text-fg-secondary px-1" style={{ paddingLeft: '12%' }}>
                {sortedData.map((d, i) => (
                    <span key={i}>{MONTH_NAMES[d.mes - 1]}/{String(d.ano).slice(-2)}</span>
                ))}
            </div>

            {/* Legend values */}
            <div className="flex justify-between mt-1 text-xs text-fg-secondary px-1">
                <span>Mín: {hideValues ? '••••••' : formatPoints(minValue)}</span>
                <span>Máx: {hideValues ? '••••••' : formatPoints(maxValue)}</span>
            </div>
        </div>
    )
}

// Donut Chart Component (SVG)
export function DonutChart({ data }: { data: PontosPorCartaoDTO[] }) {
    const { preferences } = usePreferences()
    const hideValues = preferences.hideValues

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-fg-secondary">
                <p className="text-sm">Sem dados de cartões disponíveis</p>
            </div>
        )
    }

    const total = data.reduce((acc, d) => acc + d.totalPontos, 0)
    const size = 120
    const strokeWidth = 20
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const center = size / 2

    const segments = data.reduce<{
        items: (PontosPorCartaoDTO & { percent: number; offset: number; length: number; color: string })[],
        currentAngle: number
    }>((acc, d, i) => {
        const percent = total > 0 ? d.totalPontos / total : 0
        const segmentLength = circumference * percent
        const offset = circumference - acc.currentAngle

        acc.items.push({
            ...d,
            percent,
            offset,
            length: segmentLength,
            color: CHART_COLORS[i % CHART_COLORS.length],
        })

        acc.currentAngle += segmentLength
        return acc
    }, { items: [], currentAngle: 0 }).items

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <svg width={size} height={size} className="transform -rotate-90">
                    {segments.map((seg, i) => (
                        <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${seg.length} ${circumference - seg.length}`}
                            strokeDashoffset={seg.offset}
                            className="transition-all duration-500"
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-fg-primary">{hideValues ? '••••••' : formatPoints(total)}</span>
                    <span className="text-[0.625rem] text-fg-secondary">Total</span>
                </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-2">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: seg.color }}
                        />
                        <span className="flex-1 text-fg-secondary truncate">{seg.nomeCartao}</span>
                        <span className="font-medium text-fg-primary">{hideValues ? '••••••' : formatPoints(seg.totalPontos)}</span>
                        <span className="text-fg-secondary">({(seg.percent * 100).toFixed(0)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
