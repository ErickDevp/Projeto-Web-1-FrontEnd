import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cartaoUsuarioService } from '../../services/cartaoUsuario/cartaoUsuario.service'
import { programaFidelidadeService } from '../../services/programaFidelidade/programaFidelidade.service'
import { movimentacaoPontosService } from '../../services/movimentacaoPontos/movimentacaoPontos.service'
import { comprovanteService } from '../../services/comprovante/comprovante.service'
import { saldoUsuarioProgramaService } from '../../services/saldoUsuarioPrograma/saldoUsuarioPrograma.service'
import { notify } from '../../utils/notify'
import { formatCurrency, formatPoints } from '../../utils/format'
import { getTipoLabel } from '../../utils/cardConstants'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import TextInput from '../../components/ui/TextInput'
import TabButton from '../../components/ui/TabButton'
import SensitiveValue from '../../components/ui/SensitiveValue'
import CreditCardPreview, { type CardVariant } from '../../components/dashboard/cartoes/CreditCardPreview'
import type { CartaoResponseDTO } from '../../interfaces/cartaoUsuario'
import type { MovimentacaoRequestDTO } from '../../interfaces/movimentacaoPontos'
import type { ProgramaComPromocoesResponseDTO } from '../../interfaces/programaFidelidade'
import type { SaldoResponseDTO } from '../../interfaces/saldoUsuarioPrograma'

type ModoMovimentacao = 'acumular' | 'resgatar'

// Helper para converter bandeira em variante visual do cartão
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

export default function RegistrarPontos() {
  const [cards, setCards] = useState<CartaoResponseDTO[]>([])
  const [programasComPromocoes, setProgramasComPromocoes] = useState<ProgramaComPromocoesResponseDTO[]>([])
  const [saldos, setSaldos] = useState<SaldoResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Estado do modo ativo
  const [modoAtivo, setModoAtivo] = useState<ModoMovimentacao>('acumular')
  const isResgate = modoAtivo === 'resgatar'

  // Estado do formulário - Acumular
  const [cartaoId, setCartaoId] = useState<string>('')
  const [programaId, setProgramaId] = useState<string>('')
  const [promocaoId, setPromocaoId] = useState<string>('')
  const [valor, setValor] = useState<string>('')
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0])
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Estado do formulário - Resgatar
  const [quantidadePontos, setQuantidadePontos] = useState<string>('')

  // Carrega cartões e programas
  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      try {
        const [cardData, programasData, saldosData] = await Promise.all([
          cartaoUsuarioService.list(),
          programaFidelidadeService.list(),
          saldoUsuarioProgramaService.list(),
        ])
        if (!isActive) return
        setCards(Array.isArray(cardData) ? cardData : [])
        setProgramasComPromocoes(Array.isArray(programasData) ? programasData : [])
        setSaldos(Array.isArray(saldosData) ? saldosData : [])
      } catch (error) {
        notify.apiError(error, { fallback: 'Não foi possível carregar os dados.' })
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadData()
    return () => { isActive = false }
  }, [])

  // Cartão selecionado
  const selectedCard = useMemo(() => {
    if (!cartaoId) return null
    return cards.find((c) => c.id === Number(cartaoId)) ?? null
  }, [cartaoId, cards])

  // Programas disponíveis - do cartão (acúmulo) ou todos (resgate)
  const availablePrograms = useMemo(() => {
    if (isResgate) {
      // Para resgate: mostrar todos os programas disponíveis
      return programasComPromocoes.map(p => ({ id: p.id, nome: p.nome, descricao: p.descricao }))
    }
    // Para acúmulo: apenas programas do cartão selecionado
    return selectedCard?.programas ?? []
  }, [isResgate, selectedCard, programasComPromocoes])

  // Promoções disponíveis - obtém de programasComPromocoes baseado no programa selecionado
  const availablePromocoes = useMemo(() => {
    if (!programaId) return []
    const programaCompleto = programasComPromocoes.find(p => p.id === Number(programaId))
    if (!programaCompleto?.promocoes) return []
    // Filtra apenas promoções ativas (ativo === 'ATIVO' e dataFim >= hoje)
    const today = new Date().toISOString().split('T')[0]
    return programaCompleto.promocoes.filter(
      p => p.ativo === 'ATIVO' && p.dataFim >= today
    )
  }, [programaId, programasComPromocoes])

  // Promoção selecionada (para exibir multiplicador)
  const promocaoSelecionada = useMemo(() => {
    if (!promocaoId) return null
    return availablePromocoes.find(p => p.id === Number(promocaoId)) ?? null
  }, [promocaoId, availablePromocoes])

  // Saldo disponível do programa selecionado (para modo Resgate)
  const saldoDisponivelPrograma = useMemo(() => {
    if (!programaId) return null
    const saldo = saldos.find(s => s.programaId?.id === Number(programaId))
    return saldo?.pontos ?? 0
  }, [programaId, saldos])

  // Cálculo de previsão de pontos (apenas para modo Acumular)
  const previsaoPontos = useMemo(() => {
    if (isResgate || !valor || !promocaoId) return null
    if (!promocaoSelecionada) return null
    const valorNumerico = parseFloat(valor.replace(',', '.')) || 0
    return Math.floor(valorNumerico * promocaoSelecionada.pontosPorReal)
  }, [isResgate, valor, promocaoId, promocaoSelecionada])

  // Reseta programa e promoção quando cartão muda
  useEffect(() => {
    setProgramaId('')
    setPromocaoId('')
  }, [cartaoId])

  // Reseta promoção quando programa muda
  useEffect(() => {
    setPromocaoId('')
  }, [programaId])

  // Lida com eventos de arrastar
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  // Lida com soltar
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

  // Lida com envio do formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    // Para acúmulo, cartão é obrigatório
    if (!isResgate && !cartaoId) {
      notify.warn('Selecione um cartão.')
      return
    }

    if (!programaId) {
      notify.warn('Selecione um programa de fidelidade.')
      return
    }

    if (isResgate) {
      // Validações específicas para resgate
      if (!quantidadePontos || parseInt(quantidadePontos) <= 0) {
        notify.warn('Informe uma quantidade de pontos válida.')
        return
      }
    } else {
      // Validações específicas para acúmulo
      if (!promocaoId) {
        notify.warn('Selecione uma promoção.')
        return
      }

      if (!valor || parseFloat(valor.replace(',', '.')) <= 0) {
        notify.warn('Informe um valor válido.')
        return
      }
    }

    if (!data) {
      notify.warn('Informe a data.')
      return
    }

    setSaving(true)

    const payload: MovimentacaoRequestDTO = {
      programaId: Number(programaId),
      data: data,
      ...(isResgate
        ? { quantidadePontos: parseInt(quantidadePontos) }
        : {
          cartaoId: Number(cartaoId),
          promocaoId: Number(promocaoId),
          valor: parseFloat(valor.replace(',', '.'))
        }
      ),
    }

    try {
      const response = await movimentacaoPontosService.create(payload)

      if (file && !isResgate) {
        try {
          await comprovanteService.create({ movimentacaoId: response.id, file })
        } catch {
          notify.warn('Movimentação registrada, mas houve erro ao enviar o comprovante.')
        }
      }

      notify.success(isResgate ? 'Resgate registrado com sucesso!' : 'Movimentação registrada com sucesso!')

      // Reseta formulário
      setCartaoId('')
      setProgramaId('')
      setPromocaoId('')
      setValor('')
      setQuantidadePontos('')
      setData(new Date().toISOString().split('T')[0])
      setFile(null)
    } catch (error) {
      notify.apiError(error, { fallback: isResgate ? 'Não foi possível registrar o resgate.' : 'Não foi possível registrar a movimentação.' })
    } finally {
      setSaving(false)
    }
  }, [cartaoId, programaId, promocaoId, valor, data, file, isResgate, quantidadePontos])

  return (
    <section className="space-y-6">
      <PageHeader
        title={isResgate ? 'Resgatar pontos' : 'Registrar pontos'}
        description={
          isResgate
            ? 'Registre o uso dos seus pontos acumulados.'
            : 'Registre uma compra e acumule pontos automaticamente.'
        }
      >
        <NavLink
          to="/dashboard/movimentacoes"
          className="btn-secondary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Ver movimentações
        </NavLink>
      </PageHeader>

      {/* Navegação por abas */}
      <div className="flex gap-2">
        <TabButton active={modoAtivo === 'acumular'} onClick={() => setModoAtivo('acumular')}>
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Acumular Pontos
        </TabButton>
        <TabButton active={modoAtivo === 'resgatar'} onClick={() => setModoAtivo('resgatar')}>
          <svg className={`h-4 w-4 mr-1.5 ${isResgate ? 'text-red-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
          <span className={isResgate ? 'text-red-400' : ''}>Resgatar/Utilizar</span>
        </TabButton>
      </div>

      {loading ? (
        <div className="dashboard-card !min-h-0">
          <LoadingSpinner message="Carregando dados..." />
        </div>
      ) : cards.length === 0 ? (
        <EmptyState
          className="dashboard-card !min-h-0 gap-4"
          icon={(
            <svg className="h-12 w-12 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          )}
          title="Nenhum cartão cadastrado"
          description="Cadastre um cartão antes de registrar pontos."
          action={(
            <NavLink to="/dashboard/cartoes" className="btn-primary mt-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Cadastrar cartão
            </NavLink>
          )}
        />
      ) : (
        <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-3">
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Alerta visual para resgate */}
            {isResgate && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-red-300">
                  <strong>Atenção:</strong> Você está registrando uma saída de pontos do seu saldo.
                </p>
              </div>
            )}

            {/* Seleção de Cartão - apenas para Acumular */}
            {!isResgate && (
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

                <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]">
                  {cards.map((card, index) => {
                    const isSelected = cartaoId === String(card.id)
                    const variant = getCardVariant(card.bandeira)

                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setCartaoId(String(card.id))}
                        className={`group relative rounded-xl transition-all duration-300 ${isSelected
                          ? 'ring-2 ring-accent-pool ring-offset-2 ring-offset-bg-primary scale-[1.02]'
                          : 'hover:scale-[1.01] hover:shadow-lg'
                          }`}
                      >
                        <CreditCardPreview
                          holderName={card.nome ?? `Cartão ${index + 1}`}
                          lastDigits={card.numero ? card.numero.slice(-4) : '****'}
                          cardTier={getTipoLabel(card.tipo) ?? 'Crédito'}
                          variant={variant}
                          size="mini"
                        />
                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-pool shadow-lg">
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Programa + Valor/Pontos + Data */}
            <div className="dashboard-card !min-h-0 p-5 !h-fit w-full">
              <div className="section-header mb-4">
                <div className={`card-icon ${isResgate ? '!bg-red-500/20' : ''}`}>
                  <svg className={`h-5 w-5 ${isResgate ? 'text-red-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="section-title text-base">
                    {isResgate ? 'Dados do resgate' : 'Dados da compra'}
                  </h2>
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
                    disabled={!isResgate && !cartaoId}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all disabled:opacity-50"
                  >
                    <option value="">
                      {isResgate
                        ? 'Selecione o programa'
                        : cartaoId
                          ? 'Selecione o programa'
                          : 'Selecione cartão primeiro'}
                    </option>
                    {availablePrograms.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Promoção - apenas para Acumular */}
                {!isResgate && (
                  <div className="space-y-1.5">
                    <label htmlFor="promocao" className="block text-xs font-medium text-fg-primary">
                      Promoção ativa
                    </label>
                    <select
                      id="promocao"
                      value={promocaoId}
                      onChange={(e) => setPromocaoId(e.target.value)}
                      disabled={!programaId || availablePromocoes.length === 0}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all disabled:opacity-50"
                    >
                      <option value="">
                        {!programaId
                          ? 'Selecione programa primeiro'
                          : availablePromocoes.length === 0
                            ? 'Nenhuma promoção ativa'
                            : 'Selecione a promoção'}
                      </option>
                      {availablePromocoes.map((promo) => (
                        <option key={promo.id} value={promo.id}>
                          {promo.titulo} ({promo.pontosPorReal}pts/R$)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Data */}
                <div className="space-y-1.5">
                  <label htmlFor="data" className="block text-xs font-medium text-fg-primary">
                    {isResgate ? 'Data do resgate' : 'Data da compra'}
                  </label>
                  <TextInput
                    id="data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2.5"
                  />
                </div>

                {/* Valor (Acumular) ou Quantidade de Pontos (Resgatar) */}
                {isResgate ? (
                  <div className="space-y-1.5">
                    <label htmlFor="quantidadePontos" className="block text-xs font-medium text-fg-primary">
                      Quantidade de pontos
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 text-sm">pts</span>
                      <TextInput
                        id="quantidadePontos"
                        type="text"
                        inputMode="numeric"
                        value={quantidadePontos}
                        onChange={(e) => {
                          // Allow only numbers
                          const val = e.target.value.replace(/[^0-9]/g, '')
                          setQuantidadePontos(val)
                        }}
                        placeholder="0"
                        className="border-red-500/30 bg-red-500/5 pl-10 pr-4 py-2.5 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label htmlFor="valor" className="block text-xs font-medium text-fg-primary">
                      Valor da compra (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-secondary text-sm">R$</span>
                      <TextInput
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
                        className="pl-10 pr-4 py-2.5 font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Direita - Prévia e Upload de Arquivo */}
          <div className="space-y-4 self-start">
            {/* Prévia de Pontos - apenas para Acumular */}
            {!isResgate ? (
              <div className="dashboard-card stat-card !min-h-0 p-5">
                <div className="section-header mb-4">
                  <div className="card-icon">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="section-title text-base">Previsão de pontos</h2>
                  </div>
                </div>

                <div className="text-center">
                  {previsaoPontos !== null ? (
                    <>
                      <p className="text-4xl font-bold text-accent-pool">
                        +<SensitiveValue>{formatPoints(previsaoPontos)}</SensitiveValue>
                      </p>
                      <p className="mt-1 text-xs text-fg-secondary">pontos a acumular</p>
                      {/* Destaque do multiplicador */}
                      {promocaoSelecionada && (
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-pool/10 px-3 py-1">
                          <svg className="h-3.5 w-3.5 text-accent-pool" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <span className="text-xs font-semibold text-accent-pool">
                            {promocaoSelecionada.pontosPorReal}x pts/R$
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <svg className="mx-auto h-8 w-8 text-fg-secondary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                      <p className="mt-2 text-xs text-fg-secondary">
                        Preencha o valor e selecione uma promoção para ver a previsão.
                      </p>
                    </div>
                  )}

                  {/* Resumo da compra quando dados preenchidos */}
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
                          <SensitiveValue>{formatCurrency(parseFloat(valor.replace(',', '.')) || 0)}</SensitiveValue>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão de Enviar */}
                <button
                  type="submit"
                  disabled={saving || !cartaoId || !programaId || !promocaoId || !valor}
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
            ) : (
              // Card de confirmação para Resgate
              <div className="dashboard-card stat-card !min-h-0 p-5 border-red-500/30">
                <div className="section-header mb-4">
                  <div className="card-icon !bg-red-500/20">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="section-title text-base">Confirmar resgate</h2>
                  </div>
                </div>

                <div className="text-center">
                  {quantidadePontos && parseInt(quantidadePontos) > 0 ? (
                    <>
                      <p className="text-4xl font-bold text-red-400">
                        -<SensitiveValue>{formatPoints(parseInt(quantidadePontos))}</SensitiveValue>
                      </p>
                      <p className="mt-1 text-xs text-fg-secondary">pontos a resgatar</p>
                    </>
                  ) : (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                      <svg className="mx-auto h-8 w-8 text-red-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                      </svg>
                      <p className="mt-2 text-xs text-fg-secondary">
                        Informe a quantidade de pontos que deseja resgatar.
                      </p>
                    </div>
                  )}

                  {/* Saldo disponível do programa */}
                  {programaId && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-fg-secondary">Saldo disponível</span>
                        <span className={`font-semibold ${quantidadePontos && parseInt(quantidadePontos) > (saldoDisponivelPrograma ?? 0)
                          ? 'text-red-400'
                          : 'text-accent-pool'
                          }`}>
                          <SensitiveValue>{formatPoints(saldoDisponivelPrograma ?? 0)}</SensitiveValue> pts
                        </span>
                      </div>
                      {quantidadePontos && parseInt(quantidadePontos) > (saldoDisponivelPrograma ?? 0) && (
                        <p className="mt-2 text-[0.625rem] text-red-400">
                          ⚠️ Saldo insuficiente para este resgate
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Botão de Resgatar */}
                <button
                  type="submit"
                  disabled={saving || !programaId || !quantidadePontos || (parseInt(quantidadePontos) > (saldoDisponivelPrograma ?? 0))}
                  className="mt-5 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed py-3 inline-flex items-center gap-2 px-4 font-medium rounded-xl transition-all duration-200 bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02]"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Resgatando...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                      </svg>
                      Resgatar pontos
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Upload de Arquivo - apenas para Acumular */}
            {!isResgate && (
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
            )}
          </div>
        </form>
      )}
    </section>
  )
}
