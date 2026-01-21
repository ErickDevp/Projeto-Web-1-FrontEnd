import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cartaoUsuarioService } from '../../services/cartaoUsuario/cartaoUsuario.service'
import { programaFidelidadeService } from '../../services/programaFidelidade/programaFidelidade.service'
import { movimentacaoPontosService } from '../../services/movimentacaoPontos/movimentacaoPontos.service'
import { comprovanteService } from '../../services/comprovante/comprovante.service'
import { notify } from '../../utils/notify'
import { formatCurrency } from '../../utils/format'
import { BANDEIRA_COLORS } from '../../utils/cardConstants'
import type { CartaoResponseDTO } from '../../interfaces/cartaoUsuario'
import type { MovimentacaoRequestDTO } from '../../interfaces/movimentacaoPontos'

export default function RegistrarPontos() {
  const [cards, setCards] = useState<CartaoResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [cartaoId, setCartaoId] = useState<string>('')
  const [programaId, setProgramaId] = useState<string>('')
  const [valor, setValor] = useState<string>('')
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0])
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Load cards and programs
  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      try {
        const [cardData] = await Promise.all([
          cartaoUsuarioService.list(),
          programaFidelidadeService.list(),
        ])
        if (!isActive) return
        setCards(Array.isArray(cardData) ? cardData : [])
      } catch (error) {
        notify.apiError(error, { fallback: 'Não foi possível carregar os dados.' })
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadData()
    return () => { isActive = false }
  }, [])

  // Selected card
  const selectedCard = useMemo(() => {
    if (!cartaoId) return null
    return cards.find((c) => c.id === Number(cartaoId)) ?? null
  }, [cartaoId, cards])

  // Available programs - only from selected card
  const availablePrograms = useMemo(() => {
    return selectedCard?.programas ?? []
  }, [selectedCard])

  // Reset programa when card changes
  useEffect(() => {
    setProgramaId('')
  }, [cartaoId])

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
      if (validTypes.includes(droppedFile.type)) {
        setFile(droppedFile)
      } else {
        notify.error('Arquivo inválido. Use PDF, PNG ou JPG.')
      }
    }
  }, [])

  // Handle form submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cartaoId) {
      notify.warn('Selecione um cartão.')
      return
    }

    if (!programaId) {
      notify.warn('Selecione um programa de fidelidade.')
      return
    }

    if (!valor || parseFloat(valor.replace(',', '.')) <= 0) {
      notify.warn('Informe um valor válido.')
      return
    }

    if (!data) {
      notify.warn('Informe a data da compra.')
      return
    }

    setSaving(true)

    const payload: MovimentacaoRequestDTO = {
      cartaoId: Number(cartaoId),
      programaId: Number(programaId),
      valor: parseFloat(valor.replace(',', '.')),
      data: data,
    }

    try {
      const movimentacaoId = await movimentacaoPontosService.create(payload)

      if (file) {
        try {
          await comprovanteService.create({ movimentacaoId: Number(movimentacaoId), file })
        } catch (fileError) {
          notify.warn('Movimentação registrada, mas houve erro ao enviar o comprovante.')
        }
      }

      notify.success('Movimentação registrada com sucesso!')

      // Reset form
      setCartaoId('')
      setProgramaId('')
      setValor('')
      setData(new Date().toISOString().split('T')[0])
      setFile(null)
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível registrar a movimentação.' })
    } finally {
      setSaving(false)
    }
  }, [cartaoId, programaId, valor, data, file])

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="titulo-grafico text-2xl font-bold">Registrar pontos</h1>
          <p className="mt-1 text-sm text-fg-secondary">
            Registre uma compra e acumule pontos automaticamente.
          </p>
        </div>
        <NavLink
          to="/dashboard/movimentacoes"
          className="btn-secondary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Ver movimentações
        </NavLink>
      </header>

      {loading ? (
        <div className="dashboard-card !min-h-0 flex items-center justify-center gap-4 py-12">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-2 border-accent-pool/20" />
            <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-transparent border-t-accent-pool animate-spin" />
          </div>
          <span className="text-sm text-fg-secondary">Carregando dados...</span>
        </div>
      ) : cards.length === 0 ? (
        <div className="dashboard-card !min-h-0 flex flex-col items-center justify-center gap-4 py-12">
          <div className="rounded-full bg-white/5 p-6">
            <svg className="h-12 w-12 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-medium text-fg-primary">Nenhum cartão cadastrado</p>
            <p className="mt-1 text-sm text-fg-secondary">
              Cadastre um cartão antes de registrar pontos.
            </p>
          </div>
          <NavLink to="/dashboard/cartoes" className="btn-primary mt-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Cadastrar cartão
          </NavLink>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid items-stretch gap-6 lg:grid-cols-3">
          {/* Left column - Form */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Card Selection */}
            <div className="dashboard-card !min-h-0 p-5">
              <div className="section-header mb-4">
                <div className="card-icon">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="section-title text-base">Selecione o cartão</h2>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))]">
                {cards.map((card) => {
                  const isSelected = cartaoId === String(card.id)
                  const bandeiraColor = BANDEIRA_COLORS[card.bandeira] ?? '#6366f1'

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setCartaoId(String(card.id))}
                      className={`relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-300 ${isSelected
                        ? 'border-accent-pool bg-accent-pool/10 shadow-lg shadow-accent-pool/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                    >
                      {/* Bandeira accent */}
                      <div
                        className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 blur-xl"
                        style={{ backgroundColor: bandeiraColor }}
                      />

                      <div className="relative flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-white font-bold text-[0.625rem]"
                          style={{ backgroundColor: bandeiraColor }}
                        >
                          {card.bandeira?.slice(0, 2).toUpperCase() ?? 'CC'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-fg-primary truncate">{card.nome}</p>
                          <p className="text-[0.625rem] text-fg-secondary">
                            {card.tipo?.replace('_', ' ')}
                          </p>
                        </div>
                        {isSelected && (
                          <svg className="h-4 w-4 text-accent-pool" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Program + Value + Date */}
            <div className="dashboard-card p-5 flex-1">
              <div className="section-header mb-4">
                <div className="card-icon">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="section-title text-base">Dados da compra</h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Programa */}
                <div className="space-y-1.5">
                  <label htmlFor="programa" className="block text-xs font-medium text-fg-primary">
                    Programa de fidelidade
                  </label>
                  <select
                    id="programa"
                    value={programaId}
                    onChange={(e) => setProgramaId(e.target.value)}
                    disabled={!cartaoId}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all disabled:opacity-50"
                  >
                    <option value="">{cartaoId ? 'Selecione o programa' : 'Selecione cartão'}</option>
                    {availablePrograms.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Data */}
                <div className="space-y-1.5">
                  <label htmlFor="data" className="block text-xs font-medium text-fg-primary">
                    Data da compra
                  </label>
                  <input
                    id="data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
                  />
                </div>

                {/* Valor */}
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="valor" className="block text-xs font-medium text-fg-primary">
                    Valor da compra (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-secondary text-sm">R$</span>
                    <input
                      id="valor"
                      type="text"
                      inputMode="decimal"
                      value={valor}
                      onChange={(e) => {
                        // Allow only numbers, comma and dot
                        const val = e.target.value.replace(/[^0-9.,]/g, '')
                        setValor(val)
                      }}
                      placeholder="0,00"
                      className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Preview & File Upload */}
          <div className="space-y-4 self-start">
            {/* Points Preview */}
            <div className="dashboard-card stat-card !min-h-0 p-5">
              <div className="section-header mb-4">
                <div className="card-icon">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="section-title text-base">Previsão</h2>
                </div>
              </div>

              <div className="text-center">
                {/* Info about backend calculation */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[0.625rem] font-bold uppercase tracking-wider text-fg-secondary">
                    Informação
                  </p>
                  <div className="mt-3 space-y-2">
                    <svg className="mx-auto h-8 w-8 text-accent-pool/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <p className="text-xs text-fg-secondary">
                      Os pontos serão calculados automaticamente pelo servidor com base nas regras do programa selecionado.
                    </p>
                  </div>
                </div>

                {/* Purchase summary when data is filled */}
                {selectedCard && valor && (
                  <div className="mt-4 space-y-2 text-xs text-fg-secondary">
                    <div className="flex items-center justify-between">
                      <span>Cartão</span>
                      <span className="font-medium text-fg-primary truncate max-w-[60%]">
                        {selectedCard.nome}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Valor</span>
                      <span className="font-medium text-fg-primary">
                        {formatCurrency(parseFloat(valor.replace(',', '.')) || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving || !cartaoId || !programaId || !valor}
                className="mt-5 w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed py-3"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Registrar pontos
                  </>
                )}
              </button>
            </div>

            {/* File Upload - Moved to Right Column */}
            <div className="dashboard-card !min-h-0 p-4">
              <div className="section-header mb-3">
                <div className="card-icon !h-8 !w-8">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="section-title text-sm">Comprovante</h2>
                  <p className="text-[0.625rem] text-fg-secondary">Opcional</p>
                </div>
              </div>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`rounded-xl border border-dashed text-center transition-all ${dragActive
                  ? 'border-accent-pool bg-accent-pool/10 py-6'
                  : file
                    ? 'border-accent-pool/50 bg-accent-pool/5 py-3'
                    : 'border-fg-secondary/20 hover:border-fg-secondary/40 py-6'
                  }`}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="h-4 w-4 text-accent-pool" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-left min-w-0 max-w-[7.5rem]">
                      <p className="truncate font-medium text-xs text-fg-primary">{file.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="rounded p-1 text-fg-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-[0.625rem] text-fg-secondary">
                      Arraste ou
                      <label className="mx-1 cursor-pointer font-semibold text-accent-pool hover:underline">
                        selecione
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                          className="hidden"
                        />
                      </label>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </section>
  )
}
