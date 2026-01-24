import StatusBadge from '../ui/StatusBadge'
import SensitiveValue from '../ui/SensitiveValue'
import type { HistoricoMovimentacaoDTO } from '../../interfaces/relatorio'

// Format date for display
function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

// Format points with thousand separators
function formatPoints(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value)
}

interface RelatorioHistoryProps {
    historico: HistoricoMovimentacaoDTO[]
}

export function RelatorioHistory({ historico }: RelatorioHistoryProps) {
    return (
        <div className="dashboard-card">
            <div className="section-header mb-6">
                <div className="card-icon">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h2 className="section-title">Histórico de Movimentações</h2>
                    <p className="text-xs text-fg-secondary">Todas as transações registradas</p>
                </div>
                <span className="badge">{historico?.length ?? 0} registros</span>
            </div>

            {historico && historico.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-fg-secondary uppercase tracking-wider">Data</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-fg-secondary uppercase tracking-wider">Programa</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-fg-secondary uppercase tracking-wider">Status</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-fg-secondary uppercase tracking-wider">Pontos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {historico.map((item) => {
                                const isPositive = item.pontosCalculados >= 0

                                return (
                                    <tr key={item.movimentacaoId} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 text-fg-secondary">
                                            {formatDate(item.data)}
                                        </td>
                                        <td className="py-3 px-4 text-fg-primary font-medium">
                                            {item.programa}
                                        </td>
                                        <td className="py-3 px-4">
                                            <StatusBadge status={item.status || (isPositive ? 'CREDITADO' : 'CANCELADO')} />
                                        </td>
                                        <td className={`py-3 px-4 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'
                                            }`}>
                                            {isPositive ? '+' : '-'}<SensitiveValue>{formatPoints(Math.abs(item.pontosCalculados))}</SensitiveValue>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-white/5 p-6 mb-4">
                        <svg className="h-12 w-12 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <p className="text-sm text-fg-secondary">Nenhuma movimentação registrada ainda.</p>
                </div>
            )}
        </div>
    )
}
