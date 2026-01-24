import { useEffect, useMemo, useState } from 'react'
import type { CartaoRequestDTO, CartaoResponseDTO } from '../../../interfaces/cartaoUsuario'
import type { BandeiraEnum, TipoCartaoEnum } from '../../../interfaces/enums'
import type { ProgramaResponseDTO } from '../../../interfaces/programaFidelidade'
import { BANDEIRAS, TIPOS } from '../../../utils/cardConstants'
import { notify } from '../../../utils/notify'

interface CartaoFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: CartaoRequestDTO) => Promise<void>
    initialData: CartaoResponseDTO | null
    programas: ProgramaResponseDTO[]
    isSaving: boolean
}

export function CartaoFormModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    programas,
    isSaving,
}: CartaoFormModalProps) {
    const [form, setForm] = useState<{
        nome: string
        bandeira: BandeiraEnum
        tipo: TipoCartaoEnum
        numero: string
        dataValidade: string
        programaIds: number[]
    }>({
        nome: '',
        bandeira: 'VISA',
        tipo: 'CREDITO',
        numero: '',
        dataValidade: '',
        programaIds: [],
    })

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setForm({
                    nome: initialData.nome ?? '',
                    bandeira: initialData.bandeira ?? 'VISA',
                    tipo: initialData.tipo ?? 'CREDITO',
                    numero: initialData.numero ?? '',
                    dataValidade: initialData.dataValidade ?? '',
                    programaIds: initialData.programas?.map((p) => p.id) ?? [],
                })
            } else {
                setForm({
                    nome: '',
                    bandeira: 'VISA',
                    tipo: 'CREDITO',
                    numero: '',
                    dataValidade: '',
                    programaIds: [],
                })
            }
        }
    }, [isOpen, initialData])

    const togglePrograma = (programaId: number) => {
        setForm((prev) => {
            const exists = prev.programaIds.includes(programaId)
            return {
                ...prev,
                programaIds: exists
                    ? prev.programaIds.filter((id) => id !== programaId)
                    : [...prev.programaIds, programaId],
            }
        })
    }

    const selectedProgramNames = useMemo(() => {
        return programas.filter((p) => form.programaIds.includes(p.id)).map((p) => p.nome)
    }, [form.programaIds, programas])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!form.nome.trim()) {
            notify.warn('Informe o nome do cartão.')
            return
        }

        if (!form.programaIds.length) {
            notify.warn('Selecione ao menos um programa de fidelidade.')
            return
        }

        const cleanedNumero = form.numero.replace(/\s/g, '')
        if (cleanedNumero.length !== 16) {
            notify.warn('O número do cartão deve conter 16 dígitos.')
            return
        }

        if (!form.dataValidade) {
            notify.warn('Informe a data de validade do cartão.')
            return
        }

        const payload: CartaoRequestDTO = {
            nome: form.nome.trim(),
            bandeira: form.bandeira,
            tipo: form.tipo,
            numero: cleanedNumero,
            dataValidade: form.dataValidade,
            programaIds: form.programaIds,
        }

        await onSave(payload)
    }

    if (!isOpen) return null

    return (
        <div className="dashboard-card mb-6">
            <div className="section-header">
                <div className="card-icon">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h2 className="section-title">{initialData ? 'Editar cartão' : 'Novo cartão'}</h2>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-fg-secondary hover:bg-white/10 hover:text-fg-primary transition-colors"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                    {/* Nome */}
                    <div className="space-y-2">
                        <label htmlFor="card-nome" className="block text-sm font-medium text-fg-primary">
                            Nome do cartão
                        </label>
                        <input
                            id="card-nome"
                            value={form.nome}
                            onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                            placeholder="Ex: Nubank Platinum"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
                        />
                    </div>

                    {/* Bandeira */}
                    <div className="space-y-2">
                        <label htmlFor="card-bandeira" className="block text-sm font-medium text-fg-primary">
                            Bandeira
                        </label>
                        <select
                            id="card-bandeira"
                            value={form.bandeira}
                            onChange={(e) => setForm((prev) => ({ ...prev, bandeira: e.target.value as BandeiraEnum }))}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
                        >
                            {BANDEIRAS.map((b) => (
                                <option key={b.value} value={b.value}>
                                    {b.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo */}
                    <div className="space-y-2">
                        <label htmlFor="card-tipo" className="block text-sm font-medium text-fg-primary">
                            Tipo
                        </label>
                        <select
                            id="card-tipo"
                            value={form.tipo}
                            onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value as TipoCartaoEnum }))}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
                        >
                            {TIPOS.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Número do Cartão */}
                    <div className="space-y-2">
                        <label htmlFor="card-numero" className="block text-sm font-medium text-fg-primary">
                            Número do cartão
                        </label>
                        <input
                            id="card-numero"
                            type="text"
                            maxLength={19}
                            value={form.numero.replace(/(\d{4})(?=\d)/g, '$1 ')}
                            onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 16)
                                setForm((prev) => ({ ...prev, numero: onlyNumbers }))
                            }}
                            placeholder="0000 0000 0000 0000"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary font-mono tracking-wider placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
                        />
                        <p className="text-xs text-fg-secondary">
                            Os 12 primeiros dígitos serão ocultados por segurança.
                        </p>
                    </div>

                    {/* Data de Validade */}
                    <div className="space-y-2">
                        <label htmlFor="card-validade" className="block text-sm font-medium text-fg-primary">
                            Validade
                        </label>
                        <input
                            id="card-validade"
                            type="date"
                            value={form.dataValidade}
                            onChange={(e) => setForm((prev) => ({ ...prev, dataValidade: e.target.value }))}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
                        />
                    </div>
                </div>

                {/* Programas */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-fg-primary">
                        Programas de fidelidade vinculados
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {programas.map((programa) => {
                            const isSelected = form.programaIds.includes(programa.id)
                            return (
                                <button
                                    key={programa.id}
                                    type="button"
                                    onClick={() => togglePrograma(programa.id)}
                                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${isSelected
                                        ? 'bg-gradient-to-r from-accent-sky to-accent-pool text-white shadow-lg shadow-accent-pool/25'
                                        : 'border border-white/10 bg-white/5 text-fg-secondary hover:bg-white/10 hover:text-fg-primary'
                                        }`}
                                >
                                    {isSelected && (
                                        <svg className="mr-1.5 inline h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    )}
                                    {programa.nome}
                                </button>
                            )
                        })}
                    </div>
                    {programas.length === 0 && (
                        <p className="text-sm text-fg-secondary">Nenhum programa disponível.</p>
                    )}
                    {selectedProgramNames.length > 0 && (
                        <p className="text-xs text-fg-secondary">
                            Selecionados: {selectedProgramNames.join(', ')}
                        </p>
                    )}
                </div>

                {/* Ações */}
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-50">
                        {isSaving ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                {initialData ? 'Atualizar' : 'Cadastrar'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
