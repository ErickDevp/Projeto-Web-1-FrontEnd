import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { BandeiraEnum, TipoCartaoEnum } from '../../interfaces/enums'
import type { CartaoUsuarioDTO } from '../../interfaces/cartaoUsuario'
import type { Programa, Cartao } from '../../interfaces/cardTypes'
import { cartaoUsuarioService } from '../../services/cartaoUsuario/cartaoUsuario.service'
import { programaFidelidadeService } from '../../services/programaFidelidade/programaFidelidade.service'
import { notify } from '../../utils/notify'
import { BANDEIRAS, TIPOS, getTipoLabel } from '../../utils/cardConstants'
import CreditCardPreview, { type CardVariant } from '../../components/ui/CreditCardPreview'

// Get card visual variant based on bandeira
const getCardVariant = (bandeira?: string): CardVariant => {
  switch (bandeira) {
    case 'VISA':
      return 'black'
    case 'MASTERCARD':
      return 'mastercard'
    case 'AMERICAN_EXPRESS':
      return 'gold'
    case 'ELO':
      return 'elo'
    case 'HIPERCARD':
      return 'hipercard'
    default:
      return 'platinum'
  }
}



export default function Cartoes() {
  const location = useLocation()
  const [cards, setCards] = useState<Cartao[]>([])
  const [programas, setProgramas] = useState<Programa[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState<Cartao | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  // Form state
  const [form, setForm] = useState<{
    nome: string
    bandeira: BandeiraEnum
    tipo: TipoCartaoEnum
    multiplicadorPontos: number
    programaIds: number[]
  }>({
    nome: '',
    bandeira: 'VISA',
    tipo: 'CREDITO',
    multiplicadorPontos: 1,
    programaIds: [],
  })

  const loadData = useCallback(async () => {
    try {
      const [cardData, programaData] = await Promise.all([
        cartaoUsuarioService.list<Cartao[]>(),
        programaFidelidadeService.list<Programa[]>(),
      ])

      setCards(Array.isArray(cardData) ? cardData : [])
      setProgramas(Array.isArray(programaData) ? programaData : [])
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível carregar os cartões.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Check for editCardId in navigation state and open edit form
  useEffect(() => {
    const state = location.state as { editCardId?: number } | null
    if (state?.editCardId && cards.length > 0 && !loading) {
      const cardToEdit = cards.find((c) => c.id === state.editCardId)
      if (cardToEdit) {
        setEditingCard(cardToEdit)
        setForm({
          nome: cardToEdit.nome ?? '',
          bandeira: (cardToEdit.bandeira as BandeiraEnum) ?? 'VISA',
          tipo: (cardToEdit.tipo as TipoCartaoEnum) ?? 'CREDITO',
          multiplicadorPontos: cardToEdit.multiplicadorPontos ?? 1,
          programaIds: cardToEdit.programas?.map((p) => p.id) ?? (cardToEdit.programa ? [cardToEdit.programa.id] : []),
        })
        setShowForm(true)
        // Clear the state to prevent re-opening on subsequent navigations
        window.history.replaceState({}, document.title)
      }
    }
  }, [location.state, cards, loading])

  // Reset form
  const resetForm = useCallback(() => {
    setForm({
      nome: '',
      bandeira: 'VISA',
      tipo: 'CREDITO',
      multiplicadorPontos: 1,
      programaIds: [],
    })
    setEditingCard(null)
    setShowForm(false)
  }, [])

  // Open form for editing
  const openEditForm = useCallback((card: Cartao) => {
    setEditingCard(card)
    setForm({
      nome: card.nome ?? '',
      bandeira: (card.bandeira as BandeiraEnum) ?? 'VISA',
      tipo: (card.tipo as TipoCartaoEnum) ?? 'CREDITO',
      multiplicadorPontos: card.multiplicadorPontos ?? 1,
      programaIds: card.programas?.map((p) => p.id) ?? (card.programa ? [card.programa.id] : []),
    })
    setShowForm(true)
  }, [])

  // Toggle program selection
  const togglePrograma = useCallback((programaId: number) => {
    setForm((prev) => {
      const exists = prev.programaIds.includes(programaId)
      return {
        ...prev,
        programaIds: exists
          ? prev.programaIds.filter((id) => id !== programaId)
          : [...prev.programaIds, programaId],
      }
    })
  }, [])

  // Selected programs display
  const selectedProgramNames = useMemo(() => {
    return programas.filter((p) => form.programaIds.includes(p.id)).map((p) => p.nome)
  }, [form.programaIds, programas])

  // Handle form submit
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.nome.trim()) {
      notify.warn('Informe o nome do cartão.')
      return
    }

    if (!form.programaIds.length) {
      notify.warn('Selecione ao menos um programa de fidelidade.')
      return
    }

    setSaving(true)
    const payload: CartaoUsuarioDTO = {
      nome: form.nome.trim(),
      bandeira: form.bandeira,
      tipo: form.tipo,
      multiplicadorPontos: form.multiplicadorPontos,
      programaIds: form.programaIds,
    }

    try {
      if (editingCard?.id) {
        await cartaoUsuarioService.update(editingCard.id, payload)
        notify.success('Cartão atualizado com sucesso.')
      } else {
        await cartaoUsuarioService.create(payload)
        notify.success('Cartão cadastrado com sucesso.')
      }
      resetForm()
      await loadData()
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível salvar o cartão.' })
    } finally {
      setSaving(false)
    }
  }, [form, editingCard, resetForm, loadData])

  // Handle delete with confirmation
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
      await cartaoUsuarioService.remove(id)
      notify.success('Cartão excluído com sucesso.')
      await loadData()
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível excluir o cartão.' })
    } finally {
      setDeletingId(null)
    }
  }, [loadData])

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="titulo-grafico text-2xl font-bold">Cartões</h1>
          <p className="mt-1 text-sm text-fg-secondary">
            Cadastre e acompanhe seus cartões e programas de fidelidade.
          </p>
        </div>
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
          Novo cartão
        </button>
      </header>

      {/* Form Modal/Panel */}
      {showForm && (
        <div className="dashboard-card">
          <div className="section-header">
            <div className="card-icon">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="section-title">{editingCard ? 'Editar cartão' : 'Novo cartão'}</h2>
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

              {/* Pontos */}
              <div className="space-y-2">
                <label htmlFor="card-pontos" className="block text-sm font-medium text-fg-primary">
                  Fator de conversão <span className="text-fg-secondary">(pts/R$)</span>
                </label>
                <input
                  id="card-pontos"
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.multiplicadorPontos}
                  onChange={(e) => setForm((prev) => ({ ...prev, multiplicadorPontos: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
                />
                <p className="text-xs text-fg-secondary">
                  Quantos pontos você ganha para cada R$ gasto.
                </p>
              </div>
            </div>

            {/* Programas - Multi-select with chips */}
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
                    {editingCard ? 'Atualizar' : 'Cadastrar'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards Grid */}
      {loading ? (
        <div className="dashboard-card flex items-center justify-center gap-4 py-12">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-2 border-accent-pool/20" />
            <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-transparent border-t-accent-pool animate-spin" />
          </div>
          <span className="text-sm text-fg-secondary">Carregando cartões...</span>
        </div>
      ) : cards.length === 0 ? (
        <div className="dashboard-card flex flex-col items-center justify-center gap-4 py-12">
          <div className="rounded-full bg-white/5 p-6">
            <svg className="h-12 w-12 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-medium text-fg-primary">Nenhum cartão cadastrado</p>
            <p className="mt-1 text-sm text-fg-secondary">
              Cadastre seu primeiro cartão para começar a acompanhar seus pontos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn-primary mt-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Cadastrar cartão
          </button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]">
          {cards.map((card, index) => {
            const programasList = card.programas ?? (card.programa ? [card.programa] : [])
            const variant = getCardVariant(card.bandeira)

            return (
              <div
                key={card.id ?? `${card.nome}-${index}`}
                className="group relative flex flex-col"
              >
                {/* Credit Card Visual */}
                <div className="relative">
                  <CreditCardPreview
                    holderName={card.nome ?? `Cartão ${index + 1}`}
                    lastDigits={String(card.id ?? 1234).padStart(4, '0').slice(-4)}
                    cardTier={getTipoLabel(card.tipo) ?? 'Crédito'}
                    variant={variant}
                    className="transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl"
                  />

                  {/* Action Buttons Overlay */}
                  <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditForm(card)
                      }}
                      className="rounded-lg bg-black/50 p-2 text-white/80 backdrop-blur-sm hover:bg-black/70 hover:text-white transition-colors"
                      title="Editar"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        card.id && handleDeleteConfirm(card.id)
                      }}
                      disabled={deletingId === card.id}
                      className="rounded-lg bg-black/50 p-2 text-white/80 backdrop-blur-sm hover:bg-red-500/80 hover:text-white transition-colors disabled:opacity-50"
                      title="Excluir"
                    >
                      {deletingId === card.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Delete Confirmation Modal */}
                  {confirmDeleteId === card.id && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/80 backdrop-blur-sm">
                      <div className="text-center p-4">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-white">Excluir este cartão?</p>
                        <p className="mt-1 text-xs text-white/60">Esta ação não pode ser desfeita.</p>
                        <div className="mt-4 flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteCancel()
                            }}
                            className="rounded-lg border border-white/20 bg-gray-600 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-500 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              card.id && handleDelete(card.id)
                            }}
                            className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Info Section */}
                <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  {/* Points Factor */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-fg-secondary">
                      Fator de conversão
                    </span>
                    <span className="text-lg font-bold">
                      <span className="titulo-grafico">{card.multiplicadorPontos ?? 1}</span>
                      <span className="ml-1 text-xs font-normal text-fg-secondary">pts/R$</span>
                    </span>
                  </div>

                  {/* Programas */}
                  {programasList.length > 0 && (
                    <div className="border-t border-white/10 pt-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-secondary">
                        Pontua em
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {programasList.map((prog) => (
                          <span
                            key={prog.id}
                            className="rounded-full bg-accent-pool/10 px-3 py-1 text-xs font-medium text-accent-pool"
                          >
                            {prog.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
