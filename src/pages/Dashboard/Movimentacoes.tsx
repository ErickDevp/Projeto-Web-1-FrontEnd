import { useCallback, useEffect, useMemo, useState } from 'react'
import { cartaoUsuarioService } from '../../services/cartaoUsuario/cartaoUsuario.service'
import { programaFidelidadeService } from '../../services/programaFidelidade/programaFidelidade.service'
import { movimentacaoPontosService } from '../../services/movimentacaoPontos/movimentacaoPontos.service'
import { notify } from '../../utils/notify'
import { formatCurrency, formatDate, formatPoints } from '../../utils/format'
import StatusBadge, { STATUS_CONFIG, getStatusString } from '../../components/ui/StatusBadge'
import SensitiveValue from '../../components/ui/SensitiveValue'
import type { ProgramaResponseDTO } from '../../interfaces/programaFidelidade'
import type { MovimentacaoRequestDTO } from '../../interfaces/movimentacaoPontos'
import type { ComprovanteResponseDTO } from '../../interfaces/comprovante'
import type { StatusResponseDTO } from '../../interfaces/statusMovimentacao'
import { endpoints } from '../../services/endpoints'

// Types
type Cartao = {
  id?: number
  nome?: string
  bandeira?: string
}

type Movimentacao = {
  id?: number
  movimentacaoId?: number
  cartaoId?: number
  cartaoNome?: string
  cartao?: { id?: number; nome?: string; bandeira?: string }
  programaId?: number
  programaNome?: string
  saldo?: { programa?: { id?: number; nome?: string } }
  valor?: number
  pontosCalculados?: number
  dataOcorrencia?: string
  data?: string
  status?: StatusResponseDTO | { status?: string } | string
  comprovantes?: ComprovanteResponseDTO[]
  comprovante?: { id?: number } | null  // Legacy support
}

const getId = (item: Movimentacao) => item.id ?? item.movimentacaoId ?? 0

const getStatus = (item: Movimentacao): string => {
  if (typeof item.status === 'string') return item.status
  if (item.status && typeof item.status === 'object' && 'status' in item.status) {
    return item.status.status ?? 'PENDENTE'
  }
  return 'PENDENTE'
}

export default function Movimentacoes() {
  const [cards, setCards] = useState<Cartao[]>([])
  const [programas, setProgramas] = useState<ProgramaResponseDTO[]>([])
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<{ cartaoId: string; programaId: string; valor: string }>({
    cartaoId: '',
    programaId: '',
    valor: '',
  })

  const loadData = useCallback(async () => {
    try {
      const [cardData, programaData, movData] = await Promise.all([
        cartaoUsuarioService.list(),
        programaFidelidadeService.list(),
        movimentacaoPontosService.list(),
      ])

      setCards(Array.isArray(cardData) ? cardData.map(c => ({ id: c.id, nome: c.nome, bandeira: c.bandeira })) : [])
      setProgramas(Array.isArray(programaData) ? programaData.map(p => ({ id: p.id, nome: p.nome, descricao: p.descricao })) : [])
      setMovimentacoes(Array.isArray(movData) ? movData.map(m => ({
        id: m.id,
        cartaoId: m.cartaoId,
        cartaoNome: m.cartaoNome,
        programaId: m.programaId,
        programaNome: m.programaNome,
        valor: Number(m.valor),
        pontosCalculados: m.pontosCalculados,
        dataOcorrencia: m.dataOcorrencia,
        status: m.status,
        comprovantes: m.comprovantes,
      })) : [])
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível carregar as movimentações.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const cardMap = useMemo(() => {
    const map = new Map<number, string>()
    cards.forEach((card) => {
      if (card.id) map.set(card.id, card.nome ?? `Cartão ${card.id}`)
    })
    return map
  }, [cards])

  const programMap = useMemo(() => {
    const map = new Map<number, string>()
    programas.forEach((programa) => map.set(programa.id, programa.nome))
    return map
  }, [programas])

  const startEdit = useCallback((item: Movimentacao) => {
    const id = getId(item)
    const cartaoId = item.cartaoId ?? item.cartao?.id ?? ''
    const programaId = item.programaId ?? item.saldo?.programa?.id ?? ''
    setEditingId(id)
    setForm({
      cartaoId: String(cartaoId),
      programaId: String(programaId),
      valor: item.valor ? String(item.valor) : '',
    })
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setForm({ cartaoId: '', programaId: '', valor: '' })
  }, [])

  const handleSave = useCallback(async () => {
    if (!editingId) return
    if (!form.cartaoId || !form.programaId || !form.valor) {
      notify.warn('Preencha todos os campos para salvar.')
      return
    }

    const payload: MovimentacaoRequestDTO = {
      cartaoId: Number(form.cartaoId),
      programaId: Number(form.programaId),
      valor: Number(form.valor),
      data: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    }

    try {
      await movimentacaoPontosService.update(editingId, payload)
      notify.success('Movimentação atualizada com sucesso.')
      setEditingId(null)
      await loadData()
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível atualizar a movimentação.' })
    }
  }, [editingId, form, loadData])

  const handleDelete = useCallback(async (item: Movimentacao) => {
    const id = getId(item)
    if (!id) return
    if (!confirm('Tem certeza que deseja excluir esta movimentação?')) return

    try {
      await movimentacaoPontosService.remove(id)
      notify.success('Movimentação removida.')
      await loadData()
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível remover a movimentação.' })
    }
  }, [loadData])

  const getComprovanteUrl = (item: Movimentacao): string | null => {
    // First try new array format
    if (item.comprovantes && item.comprovantes.length > 0) {
      return endpoints.comprovante.arquivo(item.comprovantes[0].id)
    }
    // Fallback to legacy single object format
    if (item.comprovante?.id) {
      return endpoints.comprovante.arquivo(item.comprovante.id)
    }
    return null
  }

  // Get status motivo for tooltip
  const getStatusMotivo = (item: Movimentacao): string | null => {
    if (typeof item.status === 'object' && item.status && 'motivo' in item.status) {
      return (item.status as StatusResponseDTO).motivo || null
    }
    return null
  }

  const totalPontos = useMemo(() => {
    return movimentacoes.reduce((sum, m) => sum + (m.pontosCalculados ?? 0), 0)
  }, [movimentacoes])

  const totalValor = useMemo(() => {
    return movimentacoes.reduce((sum, m) => sum + (Number(m.valor) || 0), 0)
  }, [movimentacoes])

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="titulo-grafico text-2xl font-bold">Movimentações</h1>
          <p className="mt-1 text-sm text-fg-secondary">
            Histórico completo de pontos e compras registradas.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-fg-secondary">Total movimentado</p>
            <p className="text-lg font-bold text-fg-primary"><SensitiveValue>{formatCurrency(totalValor)}</SensitiveValue></p>
          </div>
          <div className="text-right">
            <p className="text-xs text-fg-secondary">Pontos gerados</p>
            <p className="text-lg font-bold text-accent-pool"><SensitiveValue>{formatPoints(totalPontos)}</SensitiveValue></p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(['PENDENTE', 'CREDITADO', 'EXPIRADO', 'CANCELADO'] as const).map((status) => {
          const count = movimentacoes.filter((m) => getStatus(m) === status).length
          const config = STATUS_CONFIG[status]
          return (
            <div key={status} className={`dashboard-card !min-h-0 p-4 ${config.bg} border ${config.border}`}>
              <p className={`text-xs font-medium ${config.text}`}>{config.label}</p>
              <p className="text-2xl font-bold text-fg-primary">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Main Table */}
      <div className="dashboard-card !min-h-0 p-6">
        <div className="section-header mb-4">
          <div className="card-icon">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="section-title text-base">Histórico de Movimentações</h2>
            <p className="text-xs text-fg-secondary">{movimentacoes.length} registro{movimentacoes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-4 py-12">
            <div className="relative">
              <div className="h-10 w-10 rounded-full border-2 border-accent-pool/20" />
              <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-transparent border-t-accent-pool animate-spin" />
            </div>
            <span className="text-sm text-fg-secondary">Carregando movimentações...</span>
          </div>
        ) : movimentacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="rounded-full bg-white/5 p-6">
              <svg className="h-12 w-12 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-fg-secondary">Nenhuma movimentação registrada.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
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

            {/* Mobile Cards */}
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
                              <StatusBadge status={item.status} />
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
                                <p className="font-semibold text-accent-pool"><SensitiveValue>{formatPoints(item.pontosCalculados)}</SensitiveValue></p>
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
          </>
        )}
      </div>
    </section>
  )
}
