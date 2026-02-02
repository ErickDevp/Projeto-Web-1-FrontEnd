import { useCallback, useEffect, useMemo, useState } from 'react'
import { programaFidelidadeService } from '../../services/programaFidelidade/programaFidelidade.service'
import { saldoUsuarioProgramaService } from '../../services/saldoUsuarioPrograma/saldoUsuarioPrograma.service'
import { usuarioService } from '../../services/usuario/usuario.service'
import { notify } from '../../utils/notify'
import { formatPoints } from '../../utils/programaHelpers'
import { ProgramCard, ProgramFormModal, DeleteConfirmModal } from '../../components/dashboard/programas'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import SensitiveValue from '../../components/ui/SensitiveValue'
import type { CategoriaPrograma, Programa, SaldoPrograma, ViewMode } from '../../interfaces/programa'
import type { UsuarioDTO } from '../../interfaces/auth'

const CATEGORY_OPTIONS = [
    { value: '', label: 'Todas as categorias' },
    { value: 'AEREA', label: 'Aérea' },
    { value: 'BANCO', label: 'Banco' },
    { value: 'FINANCEIRO', label: 'Financeiro' },
    { value: 'VAREJO', label: 'Varejo' },
    { value: 'OUTRO', label: 'Outro' },
]

export default function Programas() {
    // State
    const [programas, setProgramas] = useState<Programa[]>([])
    const [saldos, setSaldos] = useState<SaldoPrograma[]>([])
    const [user, setUser] = useState<UsuarioDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')

    // Modal states
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [formModalMode, setFormModalMode] = useState<'create' | 'edit'>('create')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedPrograma, setSelectedPrograma] = useState<Programa | null>(null)
    const [saving, setSaving] = useState(false)

    const isAdmin = user?.role === 'ADMIN'

    // Load data
    const loadData = useCallback(async () => {
        try {
            const [programasData, saldosData, userData] = await Promise.all([
                programaFidelidadeService.list(),
                saldoUsuarioProgramaService.list(),
                usuarioService.getMe(),
            ])
            setUser(userData)
            setProgramas(Array.isArray(programasData) ? programasData.map(p => ({
                id: p.id,
                nome: p.nome,
                descricao: p.descricao,
                categoria: p.categoria,
                multiplicadorPontos: p.multiplicadorPontos,
                promocoes: p.promocoes
            })) : [])
            setSaldos(Array.isArray(saldosData) ? saldosData.map(s => ({
                id: s.id,
                pontos: s.pontos,
                programaId: typeof s.programaId === 'object' ? s.programaId?.id : s.programaId,
                programa: typeof s.programaId === 'object' ? s.programaId : undefined,
            })) : [])
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível carregar os programas.' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Computed data
    const saldoMap = useMemo(() => {
        const map = new Map<number, { pontos: number; cartaoNome?: string }>()
        saldos.forEach((s) => {
            const programaId = s.programaId ?? s.programa?.id
            if (programaId !== undefined) {
                const existing = map.get(programaId)
                map.set(programaId, {
                    pontos: (existing?.pontos ?? 0) + (s.pontos ?? 0),
                    cartaoNome: s.cartao?.nome ?? existing?.cartaoNome,
                })
            }
        })
        return map
    }, [saldos])

    const meusProgramas = useMemo(() => programas.filter((p) => saldoMap.has(p.id)), [programas, saldoMap])

    const totalPontos = useMemo(() =>
        Array.from(saldoMap.values()).reduce((acc, s) => acc + s.pontos, 0),
        [saldoMap])

    // Apply all filters
    const displayedProgramas = useMemo(() => {
        let result = viewMode === 'all' ? programas : meusProgramas

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            result = result.filter(p => p.nome.toLowerCase().includes(term))
        }

        // Category filter
        if (categoryFilter) {
            result = result.filter(p => p.categoria === categoryFilter)
        }

        return result
    }, [viewMode, programas, meusProgramas, searchTerm, categoryFilter])

    // Handlers
    const openCreateModal = useCallback(() => {
        setFormModalMode('create')
        setSelectedPrograma(null)
        setFormModalOpen(true)
    }, [])

    const openEditModal = useCallback((prog: Programa) => {
        setFormModalMode('edit')
        setSelectedPrograma(prog)
        setFormModalOpen(true)
    }, [])

    const openDeleteModal = useCallback((id: number) => {
        const prog = programas.find(p => p.id === id)
        if (prog) {
            setSelectedPrograma(prog)
            setDeleteModalOpen(true)
        }
    }, [programas])

    const closeFormModal = useCallback(() => {
        setFormModalOpen(false)
        setSelectedPrograma(null)
    }, [])

    const closeDeleteModal = useCallback(() => {
        setDeleteModalOpen(false)
        setSelectedPrograma(null)
    }, [])

    const handleFormSubmit = useCallback(async (data: { nome: string; descricao: string; categoria?: CategoriaPrograma; multiplicadorPontos?: number }) => {
        if (!isAdmin) {
            notify.error('Apenas administradores podem gerenciar programas.')
            return
        }

        setSaving(true)
        try {
            if (formModalMode === 'create') {
                await programaFidelidadeService.create(data)
                notify.success('Programa criado com sucesso!')
            } else if (selectedPrograma) {
                await programaFidelidadeService.update(selectedPrograma.id, data)
                notify.success('Programa atualizado com sucesso!')
            }
            closeFormModal()
            await loadData()
        } catch (error) {
            const action = formModalMode === 'create' ? 'criar' : 'atualizar'
            notify.apiError(error, { fallback: `Não foi possível ${action} o programa.` })
        } finally {
            setSaving(false)
        }
    }, [isAdmin, formModalMode, selectedPrograma, closeFormModal, loadData])

    const handleConfirmDelete = useCallback(async (id: number) => {
        if (!isAdmin) {
            notify.error('Apenas administradores podem excluir programas.')
            return
        }

        setSaving(true)
        try {
            await programaFidelidadeService.remove(id)
            notify.success('Programa excluído com sucesso!')
            closeDeleteModal()
            await loadData()
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível excluir o programa.' })
        } finally {
            setSaving(false)
        }
    }, [isAdmin, closeDeleteModal, loadData])

    if (loading) {
        return (
            <section className="space-y-6">
                <header>
                    <h1 className="titulo-grafico text-2xl font-bold">Programas de Fidelidade</h1>
                    <p className="mt-1 text-sm text-fg-secondary">Explore e gerencie seus programas de pontos.</p>
                </header>
                <div className="dashboard-card">
                    <LoadingSpinner message="Carregando programas..." />
                </div>
            </section>
        )
    }

    return (
        <section className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Programas de Fidelidade"
                description="Explore e gerencie seus programas de pontos e milhas."
            >
                {isAdmin && (
                    <button type="button" onClick={openCreateModal} className="btn-primary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Novo Programa
                    </button>
                )}
            </PageHeader>

            {/* View Mode Tabs */}
            {/* Stats - Always visible */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="dashboard-card !min-h-0 !p-4">
                    <p className="text-xs text-fg-secondary">Total de Programas</p>
                    <p className="text-2xl font-bold text-fg-primary">{programas.length}</p>
                </div>
                <div className="dashboard-card !min-h-0 !p-4">
                    <p className="text-xs text-fg-secondary">Meus Programas</p>
                    <p className="text-2xl font-bold text-fg-primary">{meusProgramas.length}</p>
                </div>
                <div className="dashboard-card !min-h-0 !p-4 col-span-2 sm:col-span-1">
                    <p className="text-xs text-fg-secondary">Total de Pontos</p>
                    <p className="text-2xl font-bold text-accent-pool">
                        <SensitiveValue>{formatPoints(totalPontos)}</SensitiveValue>
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-secondary pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar programa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-border-primary bg-bg-secondary py-2 pl-10 pr-4 text-sm text-fg-primary placeholder-fg-secondary focus:border-accent-pool focus:ring-1 focus:ring-accent-pool focus:outline-none transition-colors"
                    />
                </div>

                {/* Category Filter */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-lg border border-border-primary bg-bg-secondary py-2 px-3 text-sm text-fg-primary focus:border-accent-pool focus:ring-1 focus:ring-accent-pool focus:outline-none transition-colors cursor-pointer"
                >
                    {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                {/* View Mode Pills */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
                    <button
                        type="button"
                        onClick={() => setViewMode('all')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'all'
                            ? 'bg-accent-pool text-white'
                            : 'text-fg-secondary hover:text-fg-primary'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('mine')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'mine'
                            ? 'bg-accent-pool text-white'
                            : 'text-fg-secondary hover:text-fg-primary'
                            }`}
                    >
                        Meus
                    </button>
                </div>

                {/* Clear Filters */}
                {(searchTerm || categoryFilter) && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchTerm('')
                            setCategoryFilter('')
                        }}
                        className="text-xs text-fg-secondary hover:text-accent-pool transition-colors"
                    >
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Results count */}
            {(searchTerm || categoryFilter) && (
                <p className="text-sm text-fg-secondary">
                    {displayedProgramas.length} {displayedProgramas.length === 1 ? 'programa encontrado' : 'programas encontrados'}
                </p>
            )}

            {/* Programs Grid */}
            {displayedProgramas.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {displayedProgramas.map((programa) => {
                        const saldoInfo = saldoMap.get(programa.id)
                        return (
                            <ProgramCard
                                key={programa.id}
                                programa={programa}
                                mode={viewMode}
                                saldo={saldoInfo?.pontos}
                                cartaoNome={saldoInfo?.cartaoNome}
                                isAdmin={isAdmin}
                                onEdit={openEditModal}
                                onDelete={openDeleteModal}
                            />
                        )
                    })}
                </div>
            ) : (
                <EmptyState
                    className="dashboard-card"
                    icon={(
                        <svg className="h-12 w-12 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                    )}
                    title={(searchTerm || categoryFilter)
                        ? 'Nenhum programa encontrado'
                        : viewMode === 'all'
                            ? 'Nenhum programa cadastrado'
                            : 'Nenhum programa associado'}
                    description={(searchTerm || categoryFilter)
                        ? 'Tente ajustar os filtros de busca.'
                        : viewMode === 'all'
                            ? 'Aguarde o administrador cadastrar novos programas.'
                            : 'Registre pontos em um cartão para associar um programa automaticamente.'}
                />
            )}

            {/* Modals */}
            <ProgramFormModal
                isOpen={formModalOpen}
                mode={formModalMode}
                programa={selectedPrograma}
                onClose={closeFormModal}
                onSubmit={handleFormSubmit}
                loading={saving}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                programa={selectedPrograma}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                loading={saving}
            />
        </section>
    )
}
