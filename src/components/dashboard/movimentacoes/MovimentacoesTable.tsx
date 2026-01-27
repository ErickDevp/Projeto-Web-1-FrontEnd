import React, { memo } from 'react'
import { formatDate, formatCurrency, formatPoints } from '../../../utils/format'
import SensitiveValue from '../../ui/SensitiveValue'
import StatusBadge from '../../ui/StatusBadge'
import { type Movimentacao, type Cartao, getId, getComprovanteUrl, getStatusMotivo } from '../../../hooks/useMovimentacoes'
import type { ProgramaResponseDTO } from '../../../interfaces/programaFidelidade'

interface MovimentacoesTableProps {
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

const MovimentacoesTable: React.FC<MovimentacoesTableProps> = ({
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
        <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-fg-secondary">
                        <th className="px-4 py-3 text-left font-medium">Data</th>
                        <th className="px-4 py-3 text-left font-medium">Cartão</th>
                        <th className="px-4 py-3 text-left font-medium">Programa</th>
                        <th className="px-4 py-3 text-right font-medium">Valor (R$)</th>
                        <th className="px-4 py-3 text-right font-medium">Pontos</th>
                        <th className="px-4 py-3 text-center font-medium">Status</th>
                        <th className="px-4 py-3 text-center font-medium">Comprov.</th>
                        <th className="px-4 py-3 text-right font-medium">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {movimentacoes.map((item) => {
                        const id = getId(item)
                        const isEditing = editingId === id
                        const comprovanteUrl = getComprovanteUrl(item)
                        const cartaoNome = item.cartaoNome ?? item.cartao?.nome ?? (item.cartaoId ? cardMap.get(item.cartaoId) : '-')
                        const programaNome = item.programaNome ?? item.saldo?.programa?.nome ?? (item.programaId ? programMap.get(item.programaId) : '-')
                        const statusMotivo = getStatusMotivo(item)
                        const comprovantesCount = item.comprovantes?.length ?? (item.comprovante?.id ? 1 : 0)

                        return (
                            <tr key={id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3 text-fg-secondary">
                                    {formatDate(item.dataOcorrencia ?? item.data)}
                                </td>
                                <td className="px-4 py-3">
                                    {isEditing ? (
                                        <select
                                            value={form.cartaoId}
                                            onChange={(e) => setForm((prev) => ({ ...prev, cartaoId: e.target.value }))}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-fg-primary focus:border-accent-pool focus:outline-none"
                                        >
                                            <option value="">Selecione</option>
                                            {cards.map((card) => (
                                                <option key={card.id} value={card.id}>
                                                    {card.nome ?? `Cartão ${card.id}`}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-fg-primary">{cartaoNome}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {isEditing ? (
                                        <select
                                            value={form.programaId}
                                            onChange={(e) => setForm((prev) => ({ ...prev, programaId: e.target.value }))}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-fg-primary focus:border-accent-pool focus:outline-none"
                                        >
                                            <option value="">Selecione</option>
                                            {programas.map((programa) => (
                                                <option key={programa.id} value={programa.id}>
                                                    {programa.nome}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-fg-primary">{programaNome}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={form.valor}
                                            onChange={(e) => setForm((prev) => ({ ...prev, valor: e.target.value }))}
                                            className="w-24 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-fg-primary text-right focus:border-accent-pool focus:outline-none"
                                        />
                                    ) : (
                                        <span className="text-fg-primary font-medium"><SensitiveValue>{formatCurrency(item.valor)}</SensitiveValue></span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="font-semibold text-accent-pool"><SensitiveValue>{formatPoints(item.pontosCalculados)}</SensitiveValue></span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="inline-flex items-center" title={statusMotivo || undefined}>
                                        <StatusBadge status={item.status} />
                                        {statusMotivo && (
                                            <svg className="ml-1 h-3 w-3 text-fg-secondary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                            </svg>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {comprovanteUrl ? (
                                        <a
                                            href={comprovanteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1 p-1.5 rounded-lg text-accent-pool hover:bg-accent-pool/10 transition-colors"
                                            title={comprovantesCount > 1 ? `${comprovantesCount} comprovantes` : 'Ver comprovante'}
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                            </svg>
                                            {comprovantesCount > 1 && (
                                                <span className="text-[0.625rem] font-medium">{comprovantesCount}</span>
                                            )}
                                        </a>
                                    ) : (
                                        <span className="text-fg-secondary/40">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {isEditing ? (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={handleSave}
                                                className="btn-primary text-xs !px-3 !py-1.5"
                                            >
                                                Salvar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="btn-secondary text-xs !px-3 !py-1.5"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(item)}
                                                className="p-1.5 rounded-lg text-fg-secondary hover:text-accent-pool hover:bg-accent-pool/10 transition-colors"
                                                title="Editar"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item)}
                                                className="p-1.5 rounded-lg text-fg-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Excluir"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default memo(MovimentacoesTable)
