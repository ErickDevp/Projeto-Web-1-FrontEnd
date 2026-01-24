import { useCallback, useEffect, useMemo, useState } from 'react'
import { programaFidelidadeService } from '../../services/programaFidelidade/programaFidelidade.service'
import { saldoUsuarioProgramaService } from '../../services/saldoUsuarioPrograma/saldoUsuarioPrograma.service'
import { usuarioService } from '../../services/usuario/usuario.service'
import { notify } from '../../utils/notify'
import { formatPoints } from '../../utils/programaHelpers'
import { ProgramCard, ProgramFormModal, DeleteConfirmModal } from '../../components/dashboard/programas'
import TabButton from '../../components/ui/TabButton'
import SensitiveValue from '../../components/ui/SensitiveValue'
import type { Programa, SaldoPrograma, ViewMode } from '../../interfaces/programa'
import type { UsuarioDTO } from '../../interfaces/auth'

export default function Programas() {
    // State
    const [programas, setProgramas] = useState<Programa[]>([])
    const [saldos, setSaldos] = useState<SaldoPrograma[]>([])
    const [user, setUser] = useState<UsuarioDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>('all')

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
    const displayedProgramas = viewMode === 'all' ? programas : meusProgramas

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

    const handleFormSubmit = useCallback(async (data: { nome: string; descricao: string }) => {
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

    // Loading state
    if (loading) {
        return (
            <section className="space-y-6">
                <header>
                    <h1 className="titulo-grafico text-2xl font-bold">Programas de Fidelidade</h1>
                    <p className="mt-1 text-sm text-fg-secondary">Explore e gerencie seus programas de pontos.</p>
                </header>
                <div className="dashboard-card flex items-center justify-center gap-4 py-12">
                    <div className="relative">
                        <div className="h-10 w-10 rounded-full border-2 border-accent-pool/20" />
                        <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-transparent border-t-accent-pool animate-spin" />
                    </div>
                    <span className="text-sm text-fg-secondary">Carregando programas...</span>
                </div>
            </section>
        )
    }

    return (
        <section className="space-y-6">
            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="titulo-grafico text-2xl font-bold">Programas de Fidelidade</h1>
                    <p className="mt-1 text-sm text-fg-secondary">
                        Explore e gerencie seus programas de pontos e milhas.
                    </p>
                </div>

                {isAdmin && (
                    <button type="button" onClick={openCreateModal} className="btn-primary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Novo Programa
                    </button>
                )}
            </header>

            {/* View Mode Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 w-fit">
                <TabButton active={viewMode === 'all'} onClick={() => setViewMode('all')} count={programas.length}>
                    Todos os Programas
                </TabButton>
                <TabButton active={viewMode === 'mine'} onClick={() => setViewMode('mine')} count={meusProgramas.length}>
                    Meus Associados
                </TabButton>
            </div>

            {/* Stats (mine mode only) */}
            {viewMode === 'mine' && meusProgramas.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div className="dashboard-card !min-h-0 !p-4">
                        <p className="text-xs text-fg-secondary">Programas Associados</p>
                        <p className="text-2xl font-bold text-fg-primary">{meusProgramas.length}</p>
                    </div>
                    <div className="dashboard-card !min-h-0 !p-4">
                        <p className="text-xs text-fg-secondary">Total de Pontos</p>
                        <p className="text-2xl font-bold text-accent-pool">
                            <SensitiveValue>{formatPoints(Array.from(saldoMap.values()).reduce((acc, s) => acc + s.pontos, 0))}</SensitiveValue>
                        </p>
                    </div>
                    <div className="dashboard-card !min-h-0 !p-4">
                        <p className="text-xs text-fg-secondary">Disponíveis para Associar</p>
                        <p className="text-2xl font-bold text-fg-primary">{programas.length - meusProgramas.length}</p>
                    </div>
                </div>
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
                <div className="dashboard-card flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-white/5 p-6 mb-4">
                        <svg className="h-12 w-12 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                    </div>
                    <p className="text-fg-primary font-medium">
                        {viewMode === 'all' ? 'Nenhum programa cadastrado' : 'Nenhum programa associado'}
                    </p>
                    <p className="text-sm text-fg-secondary mt-1">
                        {viewMode === 'all'
                            ? 'Aguarde o administrador cadastrar novos programas.'
                            : 'Registre pontos em um cartão para associar um programa automaticamente.'}
                    </p>
                </div>
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
