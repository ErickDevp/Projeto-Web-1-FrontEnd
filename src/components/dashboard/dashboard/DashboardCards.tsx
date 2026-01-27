import type { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getBrandLogo } from '../../../pages/Dashboard/utils'
import type { CartaoResponseDTO } from '../../../interfaces/cartaoUsuario'

interface DashboardCardsProps {
    cards: CartaoResponseDTO[]
}

export const DashboardCards: FC<DashboardCardsProps> = ({ cards }) => {
    const navigate = useNavigate()

    const CardIcon = (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
    )

    return (
        <div className="dashboard-card">
            {/* Section Header */}
            <div className="section-header">
                <div className="card-icon">
                    {CardIcon}
                </div>
                <div className="flex-1">
                    <h2 className="section-title">Cartões cadastrados</h2>
                </div>
                <span className="badge">{cards.length} ativos</span>
            </div>
            {/* Lista Compacta de Cartões */}
            <div className={`mt-4 flex-1 flex flex-col ${cards.length > 4 ? 'overflow-y-auto max-h-[16rem]' : ''}`}>
                {cards.length ? (
                    <div className="space-y-2">
                        {cards.map((card, index) => {
                            const brandLogo = getBrandLogo(card.bandeira as string)
                            return (
                                <div
                                    key={card.id ?? `${card.nome}-${index}`}
                                    onClick={() => navigate('/dashboard/cartoes', { state: { editCardId: card.id } })}
                                    className="group flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-pool/30 transition-all duration-200 cursor-pointer"
                                >
                                    {/* Logo da Bandeira ou Ícone de Fallback */}
                                    <div className="flex-shrink-0 w-10 h-7 flex items-center justify-center rounded bg-white/10">
                                        {brandLogo ? (
                                            <img src={brandLogo} alt={card.bandeira ?? 'Card'} className="h-5 w-auto" />
                                        ) : (
                                            <svg className="h-4 w-4 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                            </svg>
                                        )}
                                    </div>
                                    {/* Info do Cartão */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-fg-primary truncate group-hover:text-accent-pool transition-colors">
                                            {card.nome ?? `Cartão ${index + 1}`}
                                        </p>
                                        <p className="text-xs text-fg-secondary truncate">
                                            {card.tipo?.replace('_', ' ') ?? 'Crédito'} • •••• {card.numero?.slice(-4) ?? '****'}
                                        </p>
                                    </div>
                                    {/* Indicador de seta ao passar mouse */}
                                    <svg className="h-4 w-4 text-fg-secondary opacity-0 group-hover:opacity-100 group-hover:text-accent-pool transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </div>
                            )
                        })}
                    </div>
                ) : null}

                {/* Botão CTA - Mostra quando há poucos ou nenhum cartão */}
                {cards.length < 3 && (
                    <Link
                        to="/dashboard/cartoes"
                        className="mt-3 flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-fg-secondary/30 hover:border-accent-pool/50 hover:bg-accent-pool/5 transition-all duration-200 group"
                    >
                        <svg className="h-5 w-5 text-fg-secondary group-hover:text-accent-pool transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span className="text-sm font-medium text-fg-secondary group-hover:text-accent-pool transition-colors">
                            Adicionar novo cartão
                        </span>
                    </Link>
                )}
            </div>
        </div>
    )
}
