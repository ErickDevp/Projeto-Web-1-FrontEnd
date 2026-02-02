import { useCallback, useEffect, useMemo, useState } from 'react'
import { promocaoService } from '../../services/promocao/promocao.service'
import { programaFidelidadeService } from '../../services/programaFidelidade/programaFidelidade.service'
import { usuarioService } from '../../services/usuario/usuario.service'
import { notify } from '../../utils/notify'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import TextInput from '../../components/ui/TextInput'
import type { PromocaoRequestDTO } from '../../interfaces/promocao'
import type { Programa } from '../../interfaces/cardTypes'
import type { UsuarioDTO } from '../../interfaces/auth'

// Promocao entity type (response from backend - using camelCase)
type Promocao = {
    id: number
    programaId: number | { id: number; nome: string } // Can be number or object
    programa?: { id: number; nome: string }
    titulo: string
    descricao: string
    dataInicio: string  // camelCase
    dataFim: string     // camelCase
    pontosPorReal?: number
    ativo: boolean | string // Can be boolean or 'ATIVO'/'VENCIDO'
}

// Calculate days until expiration
function getDaysUntilExpiration(dateStr: string): number {
    const expirationDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expirationDate.setHours(0, 0, 0, 0)
    const diffTime = expirationDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Format date for display
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export default function Promocoes() {
    const [promocoes, setPromocoes] = useState<Promocao[]>([])
    const [programas, setProgramas] = useState<Programa[]>([])
    const [user, setUser] = useState<UsuarioDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingPromo, setEditingPromo] = useState<Promocao | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

    const [form, setForm] = useState<{
        titulo: string
        descricao: string
        programaId: string
        dataInicio: string  // camelCase
        dataFim: string     // camelCase
        pontosPorReal: string
        ativo: boolean
    }>({
        titulo: '',
        descricao: '',
        programaId: '',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim: '',
        pontosPorReal: '1',
        ativo: true,
    })

    // Check if user is admin
    const isAdmin = user?.role === 'ADMIN'

    // Load data
    const loadData = useCallback(async () => {
        try {
            const [promoData, programaData, userData] = await Promise.all([
                promocaoService.list(),
                programaFidelidadeService.list(),
                usuarioService.getMe(),
            ])

            // Map promoData to local Promocao type
            setPromocoes(Array.isArray(promoData) ? promoData.map(p => ({
                id: p.id,
                programaId: typeof p.programaId === 'object' ? p.programaId.id : p.programaId,
                programa: typeof p.programaId === 'object' ? p.programaId : undefined,
                titulo: p.titulo,
                descricao: p.descricao,
                dataInicio: p.dataInicio,
                dataFim: p.dataFim,
                pontosPorReal: p.pontosPorReal,
                ativo: p.ativo === 'ATIVO',
            })) : [])
            setProgramas(Array.isArray(programaData) ? programaData.map(p => ({ id: p.id, nome: p.nome })) : [])
            setUser(userData)
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível carregar as promoções.' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()

        // Polling: refresh data every 15 seconds for real-time updates
        const pollingInterval = setInterval(async () => {
            try {
                const promoData = await promocaoService.list()
                setPromocoes(Array.isArray(promoData) ? promoData.map(p => ({
                    id: p.id,
                    programaId: typeof p.programaId === 'object' ? p.programaId.id : p.programaId,
                    programa: typeof p.programaId === 'object' ? p.programaId : undefined,
                    titulo: p.titulo,
                    descricao: p.descricao,
                    dataInicio: p.dataInicio,
                    dataFim: p.dataFim,
                    pontosPorReal: p.pontosPorReal,
                    ativo: p.ativo === 'ATIVO',
                })) : [])
            } catch {
                // Silent failure for polling
            }
        }, 15000)

        // Listen for promotion-created events (from same browser session)
        const handlePromotionCreated = async () => {
            try {
                const promoData = await promocaoService.list()
                setPromocoes(Array.isArray(promoData) ? promoData.map(p => ({
                    id: p.id,
                    programaId: typeof p.programaId === 'object' ? p.programaId.id : p.programaId,
                    programa: typeof p.programaId === 'object' ? p.programaId : undefined,
                    titulo: p.titulo,
                    descricao: p.descricao,
                    dataInicio: p.dataInicio,
                    dataFim: p.dataFim,
                    pontosPorReal: p.pontosPorReal,
                    ativo: p.ativo === 'ATIVO',
                })) : [])
            } catch {
                // Silent failure
            }
        }
        window.addEventListener('promotion-created', handlePromotionCreated)

        return () => {
            clearInterval(pollingInterval)
            window.removeEventListener('promotion-created', handlePromotionCreated)
        }
    }, [loadData])

    // Program name lookup
    const programaMap = useMemo(() => {
        const map = new Map<number, string>()
        programas.forEach((p) => map.set(p.id, p.nome))
        return map
    }, [programas])

    // Reset form
    const resetForm = useCallback(() => {
        setForm({
            titulo: '',
            descricao: '',
            programaId: '',
            dataInicio: new Date().toISOString().split('T')[0],
            dataFim: '',
            pontosPorReal: '1',
            ativo: true,
        })
        setEditingPromo(null)
        setShowForm(false)
    }, [])

    // Open form for editing
    const openEditForm = useCallback((promo: Promocao) => {
        setEditingPromo(promo)
        setForm({
            titulo: promo.titulo ?? '',
            descricao: promo.descricao ?? '',
            programaId: String(typeof promo.programaId === 'object' ? promo.programaId.id : promo.programaId ?? promo.programa?.id ?? ''),
            dataInicio: promo.dataInicio?.split('T')[0] ?? '',
            dataFim: promo.dataFim?.split('T')[0] ?? '',
            pontosPorReal: String(promo.pontosPorReal ?? '1'),
            ativo: typeof promo.ativo === 'boolean' ? promo.ativo : promo.ativo === 'ATIVO',
        })
        setShowForm(true)
    }, [])

    // Handle form submit
    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault()

        if (!form.titulo.trim()) {
            notify.warn('Informe o título da promoção.')
            return
        }

        if (!form.programaId) {
            notify.warn('Selecione um programa de fidelidade.')
            return
        }

        if (!form.dataFim) {
            notify.warn('Informe a data de validade.')
            return
        }

        setSaving(true)
        const payload: PromocaoRequestDTO = {
            titulo: form.titulo.trim(),
            descricao: form.descricao.trim(),
            programaId: Number(form.programaId),
            dataInicio: form.dataInicio,
            dataFim: form.dataFim,
            pontosPorReal: Number(form.pontosPorReal) || 1,
        }

        try {
            if (editingPromo?.id) {
                await promocaoService.update(editingPromo.id, payload)
                notify.success('Promoção atualizada com sucesso.')
            } else {
                await promocaoService.create(payload)
                notify.success('Promoção criada com sucesso.')
            }
            resetForm()
            await loadData()
            // Dispatch event to notify other users' pages
            window.dispatchEvent(new CustomEvent('promotion-created'))
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível salvar a promoção.' })
        } finally {
            setSaving(false)
        }
    }, [form, editingPromo, resetForm, loadData])

    // Handle delete
    const handleDeleteConfirm = useCallback((id: number) => {
        setConfirmDeleteId(id)
    }, [])

    const handleDeleteCancel = useCallback(() => {
        setConfirmDeleteId(null)
    }, [])

    const handleDelete = useCallback(async (id: number) => {
        setDeletingId(id)
        setConfirmDeleteId(null)
        try {
            await promocaoService.remove(id)
            notify.success('Promoção excluída com sucesso.')
            await loadData()
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível excluir a promoção.' })
        } finally {
            setDeletingId(null)
        }
    }, [loadData])

    // Count active promotions
    const activeCount = useMemo(() => {
        return promocoes.filter((p) => p.ativo && getDaysUntilExpiration(p.dataFim) >= 0).length
    }, [promocoes])

    return (
        <section className="space-y-6">
            <PageHeader
                title="Promoções"
                description={
                    activeCount > 0
                        ? `${activeCount} ${activeCount === 1 ? 'promoção ativa' : 'promoções ativas'} disponíveis.`
                        : 'Nenhuma promoção ativa no momento.'
                }
            >
                {isAdmin && (
                    <button
                        type="button"
                        onClick={() => {
                            resetForm()
                            setShowForm(true)
                        }}
                        className="btn-primary"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Nova promoção
                    </button>
                )}
            </PageHeader>

            {/* Form Modal/Panel - Admin only */}
            {isAdmin && showForm && (
                <div className="dashboard-card">
                    <div className="section-header">
                        <div className="card-icon">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="section-title">{editingPromo ? 'Editar promoção' : 'Nova promoção'}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-lg p-2 text-fg-secondary hover:bg-white/10 hover:text-fg-primary transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div className="grid gap-5 md:grid-cols-2">
                            {/* Título */}
                            <div className="space-y-2">
                                <TextInput
                                    id="promo-titulo"
                                    label="Título"
                                    value={form.titulo}
                                    onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
                                    placeholder="Ex: Bônus de 50% em transferências"
                                />
                            </div>

                            {/* Programa */}
                            <div className="space-y-2">
                                <label htmlFor="promo-programa" className="block text-sm font-medium text-fg-primary">
                                    Programa de fidelidade
                                </label>
                                <select
                                    id="promo-programa"
                                    value={form.programaId}
                                    onChange={(e) => setForm((prev) => ({ ...prev, programaId: e.target.value }))}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
                                >
                                    <option value="">Selecione um programa</option>
                                    {programas.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Descrição */}
                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="promo-descricao" className="block text-sm font-medium text-fg-primary">
                                    Descrição
                                </label>
                                <textarea
                                    id="promo-descricao"
                                    rows={3}
                                    value={form.descricao}
                                    onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
                                    placeholder="Descreva os detalhes da promoção..."
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all resize-none"
                                />
                            </div>

                            {/* Data Início */}
                            <div className="space-y-2">
                                <TextInput
                                    id="promo-inicio"
                                    label="Data de início"
                                    type="date"
                                    value={form.dataInicio}
                                    onChange={(e) => setForm((prev) => ({ ...prev, dataInicio: e.target.value }))}
                                />
                            </div>

                            {/* Data Fim */}
                            <div className="space-y-2">
                                <TextInput
                                    id="promo-fim"
                                    label="Data de validade"
                                    type="date"
                                    value={form.dataFim}
                                    onChange={(e) => setForm((prev) => ({ ...prev, dataFim: e.target.value }))}
                                    min={form.dataInicio}
                                />
                            </div>
                        </div>

                        {/* Ativo checkbox */}
                        <div className="flex items-center gap-3">
                            <input
                                id="promo-ativo"
                                type="checkbox"
                                checked={form.ativo}
                                onChange={(e) => setForm((prev) => ({ ...prev, ativo: e.target.checked }))}
                                className="h-4 w-4 rounded border-white/10 bg-white/5 text-accent-pool focus:ring-accent-pool/20"
                            />
                            <label htmlFor="promo-ativo" className="text-sm text-fg-primary">
                                Promoção ativa
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                                {saving ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        {editingPromo ? 'Atualizar' : 'Criar promoção'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Promotions Grid */}
            {loading ? (
                <div className="dashboard-card">
                    <LoadingSpinner message="Carregando promoções..." />
                </div>
            ) : promocoes.length === 0 ? (
                <EmptyState
                    className="dashboard-card gap-4"
                    icon={(
                        <svg className="h-12 w-12 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                    )}
                    title="Nenhuma promoção disponível"
                    description={isAdmin ? 'Cadastre a primeira promoção.' : 'Volte mais tarde para conferir novas ofertas.'}
                    action={
                        isAdmin ? (
                            <button
                                type="button"
                                onClick={() => setShowForm(true)}
                                className="btn-primary mt-2"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Criar promoção
                            </button>
                        ) : null
                    }
                />
            ) : (
                <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]">
                    {promocoes.map((promo) => {
                        const daysLeft = getDaysUntilExpiration(promo.dataFim)
                        const isExpired = daysLeft < 0
                        const isUrgent = daysLeft >= 0 && daysLeft <= 3
                        const programaIdNum = typeof promo.programaId === 'object' ? promo.programaId.id : promo.programaId
                        const programaNome = promo.programa?.nome ?? programaMap.get(programaIdNum) ?? 'Programa'

                        return (
                            <div
                                key={promo.id}
                                className={`dashboard-card relative overflow-hidden transition-all duration-300 ${isExpired ? 'opacity-60' : ''
                                    } ${isUrgent && !isExpired ? 'border-yellow-500/30' : ''}`}
                            >
                                {/* Urgency Badge */}
                                {isUrgent && !isExpired && (
                                    <div className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${daysLeft <= 1 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {daysLeft === 0 ? 'Último dia!' : `${daysLeft} dia${daysLeft > 1 ? 's' : ''}`}
                                    </div>
                                )}

                                {/* Expired Badge */}
                                {isExpired && (
                                    <div className="absolute right-3 top-3 z-10 rounded-full bg-fg-secondary/20 px-2.5 py-1 text-xs font-semibold text-fg-secondary">
                                        Expirada
                                    </div>
                                )}

                                {/* Header */}
                                <div className="section-header mb-4">
                                    <div className="card-icon">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="badge">{programaNome}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-fg-primary line-clamp-2">
                                        {promo.titulo}
                                    </h3>
                                    <p className="mt-2 text-sm text-fg-secondary line-clamp-3">
                                        {promo.descricao || 'Sem descrição disponível.'}
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    {/* Date info */}
                                    <div className="flex items-center gap-2 text-xs text-fg-secondary mb-4">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>
                                        <span>Válido até {formatDate(promo.dataFim)}</span>
                                    </div>

                                    {/* Admin Actions */}
                                    {isAdmin && (
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEditForm(promo)}
                                                className="p-2 rounded-lg text-fg-secondary hover:text-accent-pool hover:bg-accent-pool/10 transition-colors"
                                                title="Editar"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteConfirm(promo.id)}
                                                disabled={deletingId === promo.id}
                                                className="p-2 rounded-lg text-fg-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                                title="Excluir"
                                            >
                                                {deletingId === promo.id ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                                                ) : (
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Delete Confirmation */}
                                {confirmDeleteId === promo.id && (
                                    <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                        <p className="text-xs text-red-400 mb-2">Excluir esta promoção?</p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleDeleteCancel}
                                                className="flex-1 rounded-lg border border-white/20 bg-gray-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-500 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(promo.id)}
                                                className="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}
