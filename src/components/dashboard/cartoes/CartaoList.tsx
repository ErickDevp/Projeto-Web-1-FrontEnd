import { useState } from 'react'
import type { CartaoResponseDTO } from '../../../interfaces/cartaoUsuario'
import { getTipoLabel } from '../../../utils/cardConstants'
import CreditCardPreview, { type CardVariant } from './CreditCardPreview'

interface CartaoListProps {
    cards: CartaoResponseDTO[]
    loading: boolean
    onEdit: (card: CartaoResponseDTO) => void
    onDelete: (id: number) => Promise<void>
}

// Helper para converter bandeira em variante visual
const getCardVariant = (bandeira?: string): CardVariant => {
    switch (bandeira) {
        case 'VISA':
            return 'black'
        case 'MASTERCARD':
            return 'mastercard'
        case 'AMERICAN_EXPRESS':
            return 'gold'
        case 'ELO':
            return 'elo'
        case 'HIPERCARD':
            return 'hipercard'
        default:
            return 'platinum'
    }
}

export function CartaoList({ cards, loading, onEdit, onDelete }: CartaoListProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

    const handleDeleteClick = (id: number) => {
        setConfirmDeleteId(id)
    }

    const handleDeleteCancel = () => {
        setConfirmDeleteId(null)
    }

    const handleConfirmDelete = async (id: number) => {
        setDeletingId(id)
        setConfirmDeleteId(null)
        try {
            await onDelete(id)
        } finally {
            setDeletingId(null)
        }
    }

    if (loading) {
        return (
            <div className="dashboard-card flex items-center justify-center gap-4 py-12">
                <div className="relative">
                    <div className="h-10 w-10 rounded-full border-2 border-accent-pool/20" />
                    <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-transparent border-t-accent-pool animate-spin" />
                </div>
                <span className="text-sm text-fg-secondary">Carregando cartões...</span>
            </div>
        )
    }

    if (cards.length === 0) {
        return (
            <div className="dashboard-card flex flex-col items-center justify-center gap-4 py-12">
                <div className="rounded-full bg-white/5 p-6">
                    <svg className="h-12 w-12 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                </div>
                <div className="text-center">
                    <p className="font-medium text-fg-primary">Nenhum cartão cadastrado</p>
                    <p className="mt-1 text-sm text-fg-secondary">
                        Cadastre seu primeiro cartão para começar a acompanhar seus pontos.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]">
            {cards.map((card, index) => {
                const programasList = card.programas ?? []
                const variant = getCardVariant(card.bandeira)

                return (
                    <div
                        key={card.id ?? `${card.nome}-${index}`}
                        className="group relative flex flex-col"
                    >
                        <div className="relative">
                            <CreditCardPreview
                                holderName={card.nome ?? `Cartão ${index + 1}`}
                                lastDigits={card.numero ? card.numero.slice(-4) : '****'}
                                cardTier={getTipoLabel(card.tipo) ?? 'Crédito'}
                                variant={variant}
                                className="transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl"
                            />

                            {/* Ações (Editar/Excluir) */}
                            <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onEdit(card)
                                    }}
                                    className="rounded-lg bg-black/50 p-2 text-white/80 backdrop-blur-sm hover:bg-black/70 hover:text-white transition-colors"
                                    title="Editar"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (card.id) handleDeleteClick(card.id)
                                    }}
                                    disabled={deletingId === card.id}
                                    className="rounded-lg bg-black/50 p-2 text-white/80 backdrop-blur-sm hover:bg-red-500/80 hover:text-white transition-colors disabled:opacity-50"
                                    title="Excluir"
                                >
                                    {deletingId === card.id ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Confirmação de Exclusão */}
                            {confirmDeleteId === card.id && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/80 backdrop-blur-sm">
                                    <div className="text-center p-4">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                                            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-white">Excluir este cartão?</p>
                                        <p className="mt-1 text-xs text-white/60">Esta ação não pode ser desfeita.</p>
                                        <div className="mt-4 flex justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteCancel()
                                                }}
                                                className="rounded-lg border border-white/20 bg-gray-600 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-500 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (card.id) handleConfirmDelete(card.id)
                                                }}
                                                className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Informações do Cartão */}
                        <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-fg-secondary">
                                    Validade
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-fg-primary">
                                        {card.dataValidade
                                            ? new Date(card.dataValidade + 'T00:00:00').toLocaleDateString('pt-BR', {
                                                month: '2-digit',
                                                year: 'numeric',
                                            })
                                            : '—'}
                                    </span>
                                    {card.valido && (
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase ${card.valido === 'ATIVO'
                                                ? 'bg-green-500/20 text-green-400'
                                                : card.valido === 'VENCIDO'
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                }`}
                                        >
                                            {card.valido === 'ATIVO' ? 'Válido' : card.valido === 'VENCIDO' ? 'Expirado' : 'Bloqueado'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {programasList.length > 0 && (
                                <div className="border-t border-white/10 pt-3">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-secondary">
                                        Pontua em
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {programasList.map((prog) => (
                                            <span
                                                key={prog.id}
                                                className="rounded-full bg-accent-pool/10 px-3 py-1 text-xs font-medium text-accent-pool"
                                            >
                                                {prog.nome}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
