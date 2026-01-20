import { useCallback, useEffect, useMemo, useState } from 'react'
import { programaFidelidadeService } from '../../services/programaFidelidade/programaFidelidade.service'
import { saldoUsuarioProgramaService } from '../../services/saldoUsuarioPrograma/saldoUsuarioPrograma.service'
import { useAuth } from '../../hooks/useAuth'
import { notify } from '../../utils/notify'
import CategoryBadge from '../../components/ui/CategoryBadge'
import type { RoleEnum } from '../../interfaces/enums'

// ==================== TYPES ====================

type Programa = {
    id: number
    nome: string
    descricao?: string
    categoria?: string
    url?: string
}

type SaldoPrograma = {
    id?: number
    pontos?: number
    programaId?: number
    programa?: Programa
    cartao?: {
        id?: number
        nome?: string
    }
}

type ViewMode = 'all' | 'mine'

// ==================== HELPERS ====================

// Decode JWT to get user role
function getUserRoleFromToken(token: string | null): RoleEnum | null {
    if (!token) return null
    try {
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload))
        return decoded.role ?? decoded.roles?.[0] ?? null
    } catch {
        return null
    }
}

// Format points
function formatPoints(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value)
}

// Generate initials for avatar
function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

// ==================== COMPONENTS ====================

// Tab Button Component
function TabButton({
    active,
    onClick,
    children,
    count,
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
    count?: number
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${active
                    ? 'bg-gradient-to-r from-accent-sky/10 to-accent-pool/10 text-accent-pool border border-accent-pool/30'
                    : 'text-fg-secondary hover:text-fg-primary hover:bg-white/5'
                }`}
        >
            {children}
            {count !== undefined && (
                <span
                    className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${active ? 'bg-accent-pool/20 text-accent-pool' : 'bg-white/10 text-fg-secondary'
                        }`}
                >
                    {count}
                </span>
            )}
        </button>
    )
}

// Program Card Component - Handles both "All" and "Mine" modes
function ProgramCard({
    programa,
    mode,
    saldo,
    cartaoNome,
}: {
    programa: Programa
    mode: ViewMode
    saldo?: number
    cartaoNome?: string | null
}) {
    const initials = getInitials(programa.nome)

    return (
        <div className="dashboard-card flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start gap-4">
                {/* Logo/Initials Avatar */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-sky/20 to-accent-pool/20 text-lg font-bold text-accent-pool shrink-0">
                    {initials}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-fg-primary truncate">{programa.nome}</h3>
                    <div className="mt-1">
                        <CategoryBadge category={programa.categoria ?? 'Outro'} />
                    </div>
                </div>
            </div>

            {/* Description (if available) */}
            {programa.descricao && (
                <p className="mt-3 text-sm text-fg-secondary line-clamp-2">{programa.descricao}</p>
            )}

            {/* URL Link (if available) */}
            {programa.url && (
                <a
                    href={programa.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-accent-pool hover:underline truncate block"
                >
                    {programa.url}
                </a>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Balance Section - Only shown in "mine" mode */}
            {mode === 'mine' && saldo !== undefined && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs text-fg-secondary">Seu saldo</p>
                            <p className="text-2xl font-bold text-accent-pool">
                                {formatPoints(saldo)} <span className="text-sm font-normal text-fg-secondary">pts</span>
                            </p>
                        </div>
                    </div>

                    {/* Associated Card */}
                    {cartaoNome && (
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

// Create Program Modal (Admin Only)
function CreateProgramModal({
    isOpen,
    onClose,
    onSubmit,
    loading,
}: {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: { nome: string; categoria: string; url: string }) => Promise<void>
    loading: boolean
}) {
    const [form, setForm] = useState({
        nome: '',
        categoria: '',
        url: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.nome.trim()) {
            notify.error('Informe o nome do programa.')
            return
        }

        await onSubmit(form)
        setForm({ nome: '', categoria: '', url: '' })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-bg-secondary p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-fg-primary">Novo Programa de Fidelidade</h2>
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
                        <label htmlFor="nome" className="block text-sm font-medium text-fg-primary">
                            Nome do Programa *
                        </label>
                        <input
                            id="nome"
                            type="text"
                            value={form.nome}
                            onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                            placeholder="Ex: Smiles, Livelo, Esfera"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="categoria" className="block text-sm font-medium text-fg-primary">
                            Categoria
                        </label>
                        <select
                            id="categoria"
                            value={form.categoria}
                            onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value }))}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20"
                        >
                            <option value="">Selecione uma categoria</option>
                            <option value="AEREA">Aérea</option>
                            <option value="BANCO">Banco</option>
                            <option value="FINANCEIRA">Financeira</option>
                            <option value="VAREJO">Varejo</option>
                            <option value="OUTRA">Outra</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="url" className="block text-sm font-medium text-fg-primary">
                            URL do Programa
                        </label>
                        <input
                            id="url"
                            type="url"
                            value={form.url}
                            onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                            placeholder="https://exemplo.com.br"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20"
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
                                    Criando...
                                </>
                            ) : (
                                'Criar Programa'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ==================== MAIN COMPONENT ====================

export default function Programas() {
    const { token } = useAuth()
    const [programas, setProgramas] = useState<Programa[]>([])
    const [saldos, setSaldos] = useState<SaldoPrograma[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>('all')
    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    // Check if user is admin
    const userRole = useMemo(() => getUserRoleFromToken(token), [token])
    const isAdmin = userRole === 'ADMIN'

    // Load data
    const loadData = useCallback(async () => {
        try {
            const [programasData, saldosData] = await Promise.all([
                programaFidelidadeService.list<Programa[]>(),
                saldoUsuarioProgramaService.list(),
            ])
            setProgramas(Array.isArray(programasData) ? programasData : [])
            setSaldos(Array.isArray(saldosData) ? (saldosData as SaldoPrograma[]) : [])
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível carregar os programas.' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Build saldo map for quick lookup
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

    // "Meus Associados" - programs where user has balance
    const meusProgramas = useMemo(() => {
        return programas.filter((p) => saldoMap.has(p.id))
    }, [programas, saldoMap])

    // Create program handler (admin only)
    const handleCreateProgram = useCallback(
        async (data: { nome: string; categoria: string; url: string }) => {
            if (!isAdmin) {
                notify.error('Apenas administradores podem criar programas.')
                return
            }

            setSaving(true)
            try {
                await programaFidelidadeService.create({
                    nome: data.nome,
                    descricao: data.categoria ? `Categoria: ${data.categoria}` : '',
                })
                notify.success('Programa criado com sucesso!')
                setModalOpen(false)
                await loadData()
            } catch (error) {
                notify.apiError(error, { fallback: 'Não foi possível criar o programa.' })
            } finally {
                setSaving(false)
            }
        },
        [isAdmin, loadData]
    )

    // Get programs to display based on view mode
    const displayedProgramas = viewMode === 'all' ? programas : meusProgramas

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

                {/* Admin: Create Program Button */}
                {isAdmin && (
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="btn-primary"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Novo Programa
                    </button>
                )}
            </header>

            {/* View Mode Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 w-fit">
                <TabButton
                    active={viewMode === 'all'}
                    onClick={() => setViewMode('all')}
                    count={programas.length}
                >
                    Todos os Programas
                </TabButton>
                <TabButton
                    active={viewMode === 'mine'}
                    onClick={() => setViewMode('mine')}
                    count={meusProgramas.length}
                >
                    Meus Associados
                </TabButton>
            </div>

            {/* Stats */}
            {viewMode === 'mine' && meusProgramas.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div className="dashboard-card !min-h-0 !p-4">
                        <p className="text-xs text-fg-secondary">Programas Associados</p>
                        <p className="text-2xl font-bold text-fg-primary">{meusProgramas.length}</p>
                    </div>
                    <div className="dashboard-card !min-h-0 !p-4">
                        <p className="text-xs text-fg-secondary">Total de Pontos</p>
                        <p className="text-2xl font-bold text-accent-pool">
                            {formatPoints(Array.from(saldoMap.values()).reduce((acc, s) => acc + s.pontos, 0))}
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
                            />
                        )
                    })}
                </div>
            ) : (
                <div className="dashboard-card flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-white/5 p-6 mb-4">
                        <svg
                            className="h-12 w-12 text-fg-secondary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                            />
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

            {/* Create Program Modal (Admin Only) */}
            <CreateProgramModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreateProgram}
                loading={saving}
            />
        </section>
    )
}
