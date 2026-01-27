import type { FC } from 'react'
import SensitiveValue from '../../ui/SensitiveValue'
import { toNumber } from '../../../pages/Dashboard/utils'
import type { RelatorioResponseDTO } from '../../../interfaces/relatorio'

interface PointsPerCardChartProps {
    pontosPorCartao: NonNullable<RelatorioResponseDTO['pontosPorCartao']>
}

export const PointsPerCardChart: FC<PointsPerCardChartProps> = ({ pontosPorCartao }) => {
    const ChartBarIcon = (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    )

    const maxCardPoints = Math.max(
        1,
        ...pontosPorCartao.map((item) => toNumber(item.totalPontos))
    )

    // Format point values for Y-axis labels
    const formatYLabel = (value: number) => {
        if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
        return value.toString()
    }

    // Usa layout de barras verticais para 6 ou menos cartões, horizontal para mais
    const useVerticalBars = pontosPorCartao.length <= 6 && pontosPorCartao.length > 0

    return (
        <div className="dashboard-card h-full">
            {/* Cabeçalho da Seção */}
            <div className="section-header">
                <div className="card-icon">
                    {ChartBarIcon}
                </div>
                <div className="flex-1">
                    <h2 className="section-title">Pontos por cartão</h2>
                </div>
                <span className="badge">Comparativo</span>
            </div>

            {/* Conteúdo do Gráfico */}
            {useVerticalBars ? (
                /* Layout de Barras Verticais */
                <div className="mt-4 flex-1 flex flex-col justify-end">
                    <div className="flex gap-3">
                        {/* Rótulos do eixo Y */}
                        <div className="flex flex-col justify-between text-xs h-[16rem] py-1 text-right min-w-[3rem]">
                            <span className="titulo-grafico font-semibold"><SensitiveValue>{formatYLabel(maxCardPoints)}</SensitiveValue></span>
                            <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxCardPoints * 0.75))}</SensitiveValue></span>
                            <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxCardPoints * 0.5))}</SensitiveValue></span>
                            <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxCardPoints * 0.25))}</SensitiveValue></span>
                            <span className="text-fg-secondary">0</span>
                        </div>
                        {/* Container das barras */}
                        <div className="flex-1 flex items-end justify-around gap-3" style={{ height: '16rem' }}>
                            {pontosPorCartao.map((item) => {
                                const value = toNumber(item.totalPontos)
                                const percent = Math.round((value / maxCardPoints) * 100)
                                const barHeight = (percent / 100) * 16
                                return (
                                    <div key={item.cartaoId} className="flex flex-col items-center group flex-1 h-full justify-end">
                                        {/* Valor ao passar mouse */}
                                        <span className="titulo-grafico text-sm font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            <SensitiveValue>{value.toLocaleString('pt-BR')}</SensitiveValue>
                                        </span>
                                        {/* Barra Vertical */}
                                        <div
                                            className="w-full max-w-[3.5rem] rounded-t-lg bg-gradient-to-t from-accent-sky to-accent-pool relative overflow-hidden transition-all duration-500 group-hover:shadow-lg group-hover:shadow-accent-pool/30"
                                            style={{ height: `${barHeight}rem`, minHeight: percent > 0 ? '0.5rem' : '0' }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    {/* Rótulos do eixo X */}
                    <div className="flex gap-3 mt-3 pt-3 border-t border-white/5">
                        <div className="min-w-[3rem]" /> {/* Spacer for Y-axis */}
                        <div className="flex-1 flex justify-around gap-3">
                            {pontosPorCartao.map((item) => (
                                <span key={item.cartaoId} className="text-xs text-fg-secondary text-center flex-1 leading-tight">
                                    {item.nomeCartao}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Layout de Barras Horizontais (original) */
                <div className="mt-4 space-y-4 flex-1">
                    {pontosPorCartao.length ? (
                        pontosPorCartao.map((item, idx) => {
                            const value = toNumber(item.totalPontos)
                            const percent = Math.round((value / maxCardPoints) * 100)
                            return (
                                <div key={item.cartaoId} className="group" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-fg-secondary group-hover:text-fg-primary transition-colors">{item.nomeCartao}</span>
                                        <span className="titulo-grafico font-bold"><SensitiveValue>{value.toLocaleString('pt-BR')}</SensitiveValue></span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${percent}%`, animationDelay: `${idx * 150}ms` }}
                                        />
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-sm text-fg-secondary">Sem dados de pontos por cartão.</p>
                    )}
                </div>
            )}
        </div>
    )
}
