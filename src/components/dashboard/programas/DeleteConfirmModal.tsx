import type { DeleteConfirmModalProps } from '../../../interfaces/programa'

export default function DeleteConfirmModal({
    isOpen,
    programa,
    onClose,
    onConfirm,
    loading,
}: DeleteConfirmModalProps) {
    if (!isOpen || !programa) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-bg-secondary p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-fg-primary">Excluir Programa</h2>
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

                <div className="mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                        <svg className="h-6 w-6 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-red-400">Atenção!</p>
                            <p className="text-xs text-fg-secondary">Esta ação não pode ser desfeita.</p>
                        </div>
                    </div>
                    <p className="text-sm text-fg-secondary">
                        Tem certeza que deseja excluir o programa <span className="font-semibold text-fg-primary">"{programa.nome}"</span>?
                    </p>
                    <p className="text-xs text-fg-secondary mt-2">
                        Todos os dados associados a este programa serão removidos permanentemente.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary flex-1"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(programa.id)}
                        disabled={loading}
                        className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Excluindo...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                                Excluir Programa
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
