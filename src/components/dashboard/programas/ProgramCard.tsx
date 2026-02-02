import { getBrandConfig, getProgramLogo, inferCategory, getInitials } from '../../../utils/brandHelpers'
import { formatPoints, getActivePromotions, isPromotionEndingSoon, formatDate } from '../../../utils/programaHelpers'
import CategoryBadge from '../../ui/CategoryBadge'
import SensitiveValue from '../../ui/SensitiveValue'
import type { ProgramCardProps } from '../../../interfaces/programa'

export default function ProgramCard({
    programa,
    mode,
    saldo,
    cartaoNome,
    isAdmin,
    onEdit,
    onDelete,
}: ProgramCardProps) {
    const initials = getInitials(programa.nome)
    const brandConfig = getBrandConfig(programa.nome)
    const logo = getProgramLogo(programa.nome)
    const category = inferCategory(programa.nome, programa.categoria)
    const activePromotions = getActivePromotions(programa.promocoes)
    const hasEndingSoon = activePromotions.some(isPromotionEndingSoon)
    const maxMultiplicador = activePromotions.length > 0
        ? Math.max(...activePromotions.map((promo) => promo.pontosPorReal))
        : null

    const handleCardClick = (e: React.MouseEvent) => {
        // Previne navegação se clicar em botões ou links
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
            return
        }
        if (programa.url) {
            window.open(programa.url, '_blank', 'noopener,noreferrer')
        }
    }

    return (
        <div
            onClick={handleCardClick}
            className={`dashboard-card flex flex-col h-full relative overflow-hidden group transition-all duration-300 ${programa.url ? 'cursor-pointer hover:shadow-lg hover:translate-y-[-2px] hover:border-accent-pool/30' : ''
                }`}
        >
            {/* Logo d'água */}
            {logo && (
                <img
                    src={logo}
                    alt=""
                    className="absolute -bottom-4 -right-4 w-32 h-32 opacity-[0.05] pointer-events-none grayscale transition-opacity duration-300 group-hover:opacity-10"
                />
            )}

            {/* Ações de Admin */}
            {isAdmin && (
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(programa)
                        }}
                        className="p-1.5 rounded-lg bg-black/50 text-white/80 hover:bg-black/70 hover:text-white backdrop-blur-sm transition-colors"
                        title="Editar"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.(programa.id)
                        }}
                        className="p-1.5 rounded-lg bg-black/50 text-white/80 hover:bg-red-500/80 hover:text-white backdrop-blur-sm transition-colors"
                        title="Excluir"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Alerta de Expiração Próxima */}
            {hasEndingSoon && (
                <div className={`absolute top-3 ${isAdmin ? 'right-20' : 'right-3'} z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30 transition-all`}>
                    <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span className="text-xs font-medium text-red-400">Expira em breve</span>
                </div>
            )}

            {/* Cabeçalho */}
            <div className="flex items-start gap-4 relative z-10">
                {/* Logo/Avatar de Iniciais */}
                {logo ? (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white p-2 shadow-lg shrink-0">
                        <img src={logo} alt={programa.nome} className="h-full w-full object-contain" />
                    </div>
                ) : (
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${brandConfig.gradient} text-lg font-bold text-white shrink-0 shadow-lg`}>
                        {initials}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-fg-primary truncate">{programa.nome}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        {category && <CategoryBadge category={category} />}
                        {maxMultiplicador !== null && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${brandConfig.bgColor} ${brandConfig.textColor}`}>
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                {maxMultiplicador}x
                            </span>
                        )}
                        {activePromotions.length > 0 && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${brandConfig.bgColor} ${brandConfig.textColor}`}>
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                                </svg>
                                {activePromotions.length} promo{activePromotions.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Descrição */}
            {programa.descricao && (!saldo || programa.descricao.length < 50) && (
                <p className="mt-3 text-sm text-fg-secondary line-clamp-2 relative z-10">{programa.descricao}</p>
            )}

            {/* Link URL */}
            {programa.url && (
                <div className={`mt-2 text-xs ${brandConfig.textColor} hover:underline truncate block relative z-10 pointer-events-none`}>
                    {programa.url} <span className="text-fg-secondary ml-1">(clique no card)</span>
                </div>
            )}

            {/* Seção de Promoções Ativas */}
            {activePromotions.length > 0 && (
                <div className="mt-4 space-y-2 relative z-10">
                    <div className="flex items-center gap-2 text-xs text-fg-secondary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                        </svg>
                        <span className="font-medium">Promoções Ativas</span>
                    </div>
                    <div className="space-y-1.5">
                        {activePromotions.map((promo) => (
                            <div
                                key={promo.id}
                                className={`flex items-center justify-between p-2 rounded-lg ${brandConfig.bgColor} ${isPromotionEndingSoon(promo) ? 'ring-1 ring-red-500/30' : ''}`}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-fg-primary truncate">{promo.titulo}</p>
                                    <p className="text-xs text-fg-secondary">
                                        até {formatDate(promo.dataFim)}
                                        {isPromotionEndingSoon(promo) && (
                                            <span className="ml-1 text-red-400">⚠</span>
                                        )}
                                    </p>
                                </div>
                                <div className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${brandConfig.textColor} bg-white/10`}>
                                    {promo.pontosPorReal}x
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Espaçador */}
            <div className="flex-1" />

            {/* Seção de Saldo */}
            {saldo !== undefined && (
                <div className={`mt-4 pt-4 border-t border-white/10 ${mode === 'all' ? 'opacity-80' : ''} relative z-10`}>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs text-fg-secondary">Seu saldo</p>
                            <p className={`${mode === 'mine' ? 'text-2xl' : 'text-lg'} font-bold ${brandConfig.textColor}`}>
                                <SensitiveValue>{formatPoints(saldo)}</SensitiveValue> <span className="text-sm font-normal text-fg-secondary">pts</span>
                            </p>
                        </div>
                    </div>

                    {/* Cartão Associado - Apenas no modo meu */}
                    {mode === 'mine' && cartaoNome && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-fg-secondary">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                            </svg>
                            <span>Associado via: <span className="text-fg-primary font-medium">{cartaoNome}</span></span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
