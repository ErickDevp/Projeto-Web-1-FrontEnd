import { useEffect, useState } from 'react'
import { notify } from '../../../utils/notify'
import type { ProgramFormModalProps } from '../../../interfaces/programa'

export default function ProgramFormModal({
    isOpen,
    mode,
    programa,
    onClose,
    onSubmit,
    loading,
}: ProgramFormModalProps) {
    const [form, setForm] = useState({
        nome: '',
        descricao: '',
    })

    // Sincroniza formulário com programa quando em modo de edição
    useEffect(() => {
        if (mode === 'edit' && programa) {
            setForm(prev => {
                if (prev.nome === (programa.nome || '') && prev.descricao === (programa.descricao || '')) {
                    return prev
                }
                return {
                    nome: programa.nome || '',
                    descricao: programa.descricao || '',
                }
            })
        } else if (mode === 'create') {
            setForm(prev => {
                if (prev.nome === '' && prev.descricao === '') return prev
                return { nome: '', descricao: '' }
            })
        }
    }, [mode, programa])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.nome.trim()) {
            notify.error('Informe o nome do programa.')
            return
        }

        if (!form.descricao.trim()) {
            notify.error('Informe a descrição do programa.')
            return
        }

        if (form.nome.length > 100) {
            notify.error('O nome deve ter no máximo 100 caracteres.')
            return
        }

        if (form.descricao.length > 500) {
            notify.error('A descrição deve ter no máximo 500 caracteres.')
            return
        }

        await onSubmit(form)

        // Reseta o formulário apenas após sucesso na criação
        if (mode === 'create') {
            setForm({ nome: '', descricao: '' })
        }
    }

    if (!isOpen) return null
    if (mode === 'edit' && !programa) return null

    const isEditMode = mode === 'edit'
    const title = isEditMode ? 'Editar Programa' : 'Novo Programa de Fidelidade'
    const submitText = isEditMode ? 'Salvar Alterações' : 'Criar Programa'
    const loadingText = isEditMode ? 'Salvando...' : 'Criando...'
    const inputIdPrefix = isEditMode ? 'edit-' : ''

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-bg-secondary p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-fg-primary">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-fg-secondary hover:text-fg-primary hover:bg-white/10 transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor={`${inputIdPrefix}nome`} className="block text-sm font-medium text-fg-primary">
                                Nome do Programa *
                            </label>
                            <span className={`text-xs ${form.nome.length > 100 ? 'text-red-400' : 'text-fg-secondary'}`}>
                                {form.nome.length}/100
                            </span>
                        </div>
                        <input
                            id={`${inputIdPrefix}nome`}
                            type="text"
                            value={form.nome}
                            maxLength={100}
                            onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                            placeholder="Ex: Smiles, Livelo, Esfera"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor={`${inputIdPrefix}descricao`} className="block text-sm font-medium text-fg-primary">
                                Descrição *
                            </label>
                            <span className={`text-xs ${form.descricao.length > 500 ? 'text-red-400' : 'text-fg-secondary'}`}>
                                {form.descricao.length}/500
                            </span>
                        </div>
                        <textarea
                            id={`${inputIdPrefix}descricao`}
                            value={form.descricao}
                            maxLength={500}
                            rows={3}
                            onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
                            placeholder="Descrição do programa de fidelidade"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    {loadingText}
                                </>
                            ) : (
                                submitText
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
