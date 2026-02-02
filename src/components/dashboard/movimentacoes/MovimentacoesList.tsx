import React, { memo } from 'react'
import { formatDate, formatCurrency, formatPoints } from '../../../utils/format'
import SensitiveValue from '../../ui/SensitiveValue'
import StatusBadge, { getStatusString, STATUS_CONFIG } from '../../ui/StatusBadge'
import { type Movimentacao, type Cartao, getId, getComprovanteUrl } from '../../../hooks/useMovimentacoes'
import type { ProgramaResponseDTO } from '../../../interfaces/programaFidelidade'

interface MovimentacoesListProps {
    movimentacoes: Movimentacao[]
    editingId: number | null
    form: { cartaoId: string; programaId: string; valor: string }
    setForm: React.Dispatch<React.SetStateAction<{ cartaoId: string; programaId: string; valor: string }>>
    cards: Cartao[]
    programas: ProgramaResponseDTO[]
    cardMap: Map<number, string>
    programMap: Map<number, string>
    startEdit: (item: Movimentacao) => void
    cancelEdit: () => void
    handleSave: () => void
    handleDelete: (item: Movimentacao) => void
}

const MovimentacoesList: React.FC<MovimentacoesListProps> = ({
    movimentacoes,
    editingId,
    form,
    setForm,
    cards,
    programas,
    cardMap,
    programMap,
    startEdit,
    cancelEdit,
    handleSave,
    handleDelete
}) => {
    return (
        <div className="lg:hidden space-y-3">
            {movimentacoes.map((item) => {
                const id = getId(item)
                const isEditing = editingId === id
                const comprovanteUrl = getComprovanteUrl(item)
                const cartaoNome = item.cartaoNome ?? item.cartao?.nome ?? (item.cartaoId ? cardMap.get(item.cartaoId) : '-')
                const programaNome = item.programaNome ?? item.saldo?.programa?.nome ?? (item.programaId ? programMap.get(item.programaId) : '-')
                const statusKey = getStatusString(item.status)
                const statusConfig = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.PENDENTE

                return (
                    <div key={id} className={`rounded-xl border p-4 ${statusConfig.bg} ${statusConfig.border}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <select
                                            value={form.cartaoId}
                                            onChange={(e) => setForm((prev) => ({ ...prev, cartaoId: e.target.value }))}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-primary focus:border-accent-pool focus:outline-none"
                                        >
                                            <option value="">Selecione cartão</option>
                                            {cards.map((card) => (
                                                <option key={card.id} value={card.id}>{card.nome}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={form.programaId}
                                            onChange={(e) => setForm((prev) => ({ ...prev, programaId: e.target.value }))}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-primary focus:border-accent-pool focus:outline-none"
                                        >
                                            <option value="">Selecione programa</option>
                                            {programas.map((p) => (
                                                <option key={p.id} value={p.id}>{p.nome}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Valor"
                                            value={form.valor}
                                            onChange={(e) => setForm((prev) => ({ ...prev, valor: e.target.value }))}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-primary focus:border-accent-pool focus:outline-none"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleSave} className="btn-primary text-xs flex-1">Salvar</button>
                                            <button onClick={cancelEdit} className="btn-secondary text-xs flex-1">Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <StatusBadge status={item.status} pontosCalculados={item.pontosCalculados} />
                                            <span className="text-xs text-fg-secondary">{formatDate(item.dataOcorrencia ?? item.data)}</span>
                                        </div>
                                        <p className="font-semibold text-fg-primary truncate">{cartaoNome}</p>
                                        <p className="text-xs text-fg-secondary">{programaNome}</p>
                                        <div className="flex items-baseline gap-4 mt-2">
                                            <div>
                                                <p className="text-xs text-fg-secondary">Valor</p>
                                                <p className="font-medium text-fg-primary"><SensitiveValue>{formatCurrency(item.valor)}</SensitiveValue></p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-fg-secondary">Pontos</p>
                                                <p className={`font-semibold ${(item.pontosCalculados ?? 0) < 0 ? 'text-red-400' : 'text-accent-pool'}`}><SensitiveValue>{formatPoints(item.pontosCalculados)}</SensitiveValue></p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            {!isEditing && (
                                <div className="flex flex-col gap-1">
                                    {comprovanteUrl && (
                                        <a
                                            href={comprovanteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg text-accent-pool hover:bg-accent-pool/10 transition-colors"
                                            title="Ver comprovante"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                            </svg>
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => startEdit(item)}
                                        className="p-2 rounded-lg text-fg-secondary hover:text-accent-pool hover:bg-accent-pool/10 transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item)}
                                        className="p-2 rounded-lg text-fg-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default memo(MovimentacoesList)
