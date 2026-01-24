import SensitiveValue from '../../ui/SensitiveValue'

function formatPoints(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value)
}

interface Stats {
    totalPoints: number
    totalCards: number
    totalMovements: number
    mediaPorMovimentacao: number
    totalEntradas: number
    totalSaidas: number
    saldoLiquido: number
    growthRate: number
    topPrograms: {
        name: string
        points: number
        percent: number
    }[]
}

interface RelatorioSummaryProps {
    stats: Stats
}

export function RelatorioSummary({ stats }: RelatorioSummaryProps) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="dashboard-card !min-h-0 !p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-pool/10">
                            <svg className="h-5 w-5 text-accent-pool" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-fg-primary"><SensitiveValue>{formatPoints(stats.totalPoints)}</SensitiveValue></p>
                            <p className="text-xs text-fg-secondary">Total de Pontos</p>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card !min-h-0 !p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-fg-primary">{stats.totalCards}</p>
                            <p className="text-xs text-fg-secondary">Cartões Ativos</p>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card !min-h-0 !p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-fg-primary">{stats.totalMovements}</p>
                            <p className="text-xs text-fg-secondary">Movimentações</p>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card !min-h-0 !p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                            <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-fg-primary"><SensitiveValue>{formatPoints(stats.mediaPorMovimentacao)}</SensitiveValue> pts</p>
                            <p className="text-xs text-fg-secondary">Média por Movimentação</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Card 1: Acúmulo vs Resgates */}
                <div className="dashboard-card flex flex-col justify-between">
                    <div className="section-header mb-4">
                        <div className="card-icon">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="section-title">Acúmulo vs Resgates</h2>
                            <p className="text-xs text-fg-secondary">Fluxo total de pontos</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-xs text-fg-secondary">Entradas</span>
                                <p className="text-lg font-bold text-green-400">+<SensitiveValue>{formatPoints(stats.totalEntradas)}</SensitiveValue></p>
                            </div>
                            <div>
                                <span className="text-xs text-fg-secondary">Saídas</span>
                                <p className="text-lg font-bold text-red-400">-<SensitiveValue>{formatPoints(stats.totalSaidas)}</SensitiveValue></p>
                            </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden relative flex">
                            {stats.totalEntradas > 0 && (
                                <div
                                    className="h-full bg-green-500/20 relative"
                                    style={{ width: '100%' }}
                                >
                                    <div className="absolute inset-y-0 left-0 bg-green-500/40" style={{ width: '100%' }}></div>
                                    {/* Overlay for Saídas (assuming saídas reduce from entries visually) */}
                                    <div
                                        className="absolute inset-y-0 left-0 bg-red-500/50"
                                        style={{ width: `${Math.min((stats.totalSaidas / (stats.totalEntradas || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                            )}
                            {stats.totalEntradas === 0 && stats.totalSaidas > 0 && (
                                <div className="h-full w-full bg-red-500/50" />
                            )}
                        </div>
                        <p className="text-xs text-fg-secondary text-center">
                            {stats.totalEntradas > 0
                                ? `${Math.min((stats.totalSaidas / stats.totalEntradas) * 100, 100).toFixed(1)}% dos ganhos foram utilizados`
                                : 'Sem entradas registradas'}
                        </p>
                    </div>
                </div>

                {/* Card 2: Resultado Líquido */}
                <div className="dashboard-card flex flex-col justify-between">
                    <div className="section-header mb-4">
                        <div className="card-icon">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="section-title">Balanço do Período</h2>
                            <p className="text-xs text-fg-secondary">Saldo final das operações</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center flex-1 space-y-2">
                        <p className={`text-3xl font-bold ${stats.saldoLiquido >= 0 ? 'text-fg-primary' : 'text-red-400'}`}>
                            <SensitiveValue>{formatPoints(stats.saldoLiquido)}</SensitiveValue>
                        </p>

                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${stats.growthRate >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                            {stats.growthRate >= 0 ? '▲' : '▼'} {Math.abs(stats.growthRate).toFixed(1)}% vs mês anterior
                        </div>
                    </div>
                </div>

                {/* Card 3: Top Programas */}
                <div className="dashboard-card flex flex-col">
                    <div className="section-header mb-4">
                        <div className="card-icon">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.25m-5.007 0V5.25m0 0h5.007v3.375M9.497 5.25v3.375M12 15v3.75m0-12v3.75" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="section-title">Maior Pontuador</h2>
                            <p className="text-xs text-fg-secondary">Principais fontes de pontos</p>
                        </div>
                    </div>

                    <div className="space-y-4 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                        {stats.topPrograms.length > 0 ? (
                            stats.topPrograms.map((prog, i) => (
                                <div key={prog.name} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-fg-primary font-medium">{i + 1}. {prog.name}</span>
                                        <span className="text-fg-secondary">{prog.percent.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-accent-pool"
                                            style={{ width: `${prog.percent}%`, opacity: 1 - (i * 0.2) }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-fg-secondary text-xs">
                                Sem dados de entrada
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
