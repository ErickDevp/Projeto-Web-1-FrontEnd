import type { FC } from 'react'
import SensitiveValue from '../../ui/SensitiveValue'
import { toNumber } from '../../../pages/Dashboard/utils'
import type { RelatorioResponseDTO } from '../../../interfaces/relatorio'

interface DashboardStatsProps {
    totalPoints: number
    programSummary: { label: string; value: number }[]
    relatorio: RelatorioResponseDTO | null
}

export const DashboardStats: FC<DashboardStatsProps> = ({ totalPoints, programSummary, relatorio }) => {
    // Cálculos financeiros
    const avgPointValue = 0.02 // R$ 0,02 per point (average)
    const estimatedValue = totalPoints * avgPointValue

    // Calcula crescimento mensal real via evolucaoMensal
    const evolucao = relatorio?.evolucaoMensal ?? []
    let monthlyGrowth = 0
    let hasGrowthData = false

    if (evolucao.length >= 2) {
        // Ordena por data para obter os dois últimos meses
        const sorted = [...evolucao]
            .filter((item) => item.ano != null && item.mes != null)
            .sort((a, b) => {
                const aDate = new Date(a.ano, a.mes - 1, 1)
                const bDate = new Date(b.ano, b.mes - 1, 1)
                return aDate.getTime() - bDate.getTime()
            })

        if (sorted.length >= 2) {
            const currentMonth = sorted[sorted.length - 1]
            const previousMonth = sorted[sorted.length - 2]
            const currentTotal = toNumber(currentMonth.totalPontos)
            const previousTotal = toNumber(previousMonth.totalPontos)

            if (previousTotal > 0) {
                monthlyGrowth = ((currentTotal - previousTotal) / previousTotal) * 100
                hasGrowthData = true
            }
        }
    }

    // Cores dos programas para barra de distribuição
    const programColors = [
        'bg-accent-pool', 'bg-accent-sky', 'bg-purple-500',
        'bg-amber-500', 'bg-rose-500', 'bg-emerald-500'
    ]

    // Define estilo do badge baseado na direção do crescimento
    const isPositiveGrowth = monthlyGrowth >= 0
    const badgeBgClass = isPositiveGrowth ? 'bg-emerald-500/20' : 'bg-red-500/20'
    const badgeTextClass = isPositiveGrowth ? 'text-emerald-400' : 'text-red-400'
    const growthSign = isPositiveGrowth ? '+' : ''

    const WalletIcon = (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
    )

    return (
        <div className="dashboard-card stat-card">
            {/* ===== MEIO: Seção Financeira Principal ===== */}
            <div className="flex flex-wrap gap-6 mb-6">
                {/* Esquerda: Total de Pontos */}
                <div className="flex-1 min-w-[12rem]">
                    <div className="flex items-start gap-3">
                        <div className="card-icon">
                            {WalletIcon}
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-secondary">
                                Saldo Total
                            </p>
                            <p className="stat-value mt-1">
                                <SensitiveValue>{totalPoints.toLocaleString('pt-BR')}</SensitiveValue> <span className="text-lg">pts</span>
                            </p>
                            {/* Badge de Tendência */}
                            {hasGrowthData && (
                                <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${badgeBgClass} ${badgeTextClass}`}>
                                    {isPositiveGrowth ? (
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                        </svg>
                                    ) : (
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25M4.5 19.5V8.25" />
                                        </svg>
                                    )}
                                    <span className="text-xs font-semibold">{growthSign}{monthlyGrowth.toFixed(1)}% este mês</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Direita: Valor Estimado */}
                <div className="flex-1 min-w-[12rem]">
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-secondary mb-1">
                            Conversão Estimada
                        </p>
                        <p className="text-3xl font-bold titulo-grafico">
                            <SensitiveValue placeholder="R$ ••••••">R$ {estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</SensitiveValue>
                        </p>
                        <p className="mt-1 text-xs text-fg-secondary">
                            Cotação média: R$ {avgPointValue.toFixed(2)}/pt
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== ABAIXO: Distribuição por Programa ===== */}
            {programSummary.length > 0 && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-secondary mb-3">
                        Distribuição por Programa
                    </p>

                    {/* Barra de Distribuição Segmentada */}
                    <div className="h-3 rounded-full overflow-hidden flex bg-white/10">
                        {programSummary.map((item, idx) => {
                            const percentage = totalPoints > 0 ? (item.value / totalPoints) * 100 : 0
                            return (
                                <div
                                    key={item.label}
                                    className={`${programColors[idx % programColors.length]} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                                    style={{ width: `${percentage}%` }}
                                    title={`${item.label}: ${item.value.toLocaleString('pt-BR')} pts (${percentage.toFixed(1)}%)`}
                                />
                            )
                        })}
                    </div>

                    {/* Grade de Legenda */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {programSummary.map((item, idx) => {
                            const percentage = totalPoints > 0 ? (item.value / totalPoints) * 100 : 0
                            return (
                                <div
                                    key={item.label}
                                    className="flex items-center gap-2 p-2 rounded-lg border border-white/10 bg-white/5"
                                >
                                    <div className={`h-3 w-3 rounded-full ${programColors[idx % programColors.length]}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-fg-primary truncate">{item.label}</p>
                                        <p className="text-[10px] text-fg-secondary">
                                            <SensitiveValue>{item.value.toLocaleString('pt-BR')}</SensitiveValue> pts • {percentage.toFixed(0)}%
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {programSummary.length === 0 && (
                <p className="text-sm text-fg-secondary text-center py-4">
                    Nenhum programa conectado ainda.
                </p>
            )}
        </div>
    )
}
