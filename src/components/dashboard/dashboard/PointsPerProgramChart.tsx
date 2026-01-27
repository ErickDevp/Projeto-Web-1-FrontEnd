import type { FC } from 'react'

interface PointsPerProgramChartProps {
    programSummary: { label: string; value: number }[]
}

export const PointsPerProgramChart: FC<PointsPerProgramChartProps> = ({ programSummary }) => {
    const PieChartIcon = (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
    )

    const programTotal = Math.max(1, programSummary.reduce((acc, item) => acc + item.value, 0))

    return (
        <div className="dashboard-card">
            {/* Section Header */}
            <div className="section-header">
                <div className="card-icon">
                    {PieChartIcon}
                </div>
                <div className="flex-1">
                    <h2 className="section-title">Pontos por programa</h2>
                </div>
                <span className="badge">Distribuição</span>
            </div>
            {/* Barras de Progresso */}
            <div className="mt-4 space-y-4">
                {programSummary.length ? (
                    programSummary.map((item, idx) => {
                        const percent = Math.round((item.value / programTotal) * 100)
                        return (
                            <div key={item.label} className="group" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-fg-secondary group-hover:text-fg-primary transition-colors">{item.label}</span>
                                    <span className="titulo-grafico font-bold">{percent}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar-fill"
                                        style={{
                                            width: `${percent}%`,
                                            animationDelay: `${idx * 150}ms`,
                                            background: 'linear-gradient(90deg, rgb(39, 121, 167), rgb(73, 197, 182))'
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-sm text-fg-secondary">Sem dados por programa.</p>
                )}
            </div>
        </div>
    )
}
