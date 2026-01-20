import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { cartaoUsuarioService } from '../../services/cartaoUsuario/cartaoUsuario.service'
import { relatorioService } from '../../services/relatorio/relatorio.service'
import { saldoUsuarioProgramaService } from '../../services/saldoUsuarioPrograma/saldoUsuarioPrograma.service'
import type { RelatorioResponseDTO } from '../../interfaces/relatorio'
import type { SaldoUsuarioPrograma } from '../../interfaces/saldoUsuarioPrograma'
import type { Cartao } from '../../interfaces/cardTypes'
import { notify } from '../../utils/notify'
import SensitiveValue from '../../components/ui/SensitiveValue'

// Brand logos for compact card list
import visaLogo from '../../assets/brands/visa.svg'
import mastercardLogo from '../../assets/brands/mastercard.svg'
import amexLogo from '../../assets/brands/amex.svg'
import eloLogo from '../../assets/brands/elo.svg'
import hipercardLogo from '../../assets/brands/hipercard.svg'

// Get brand logo based on bandeira
const getBrandLogo = (bandeira?: string): string | null => {
  switch (bandeira) {
    case 'VISA': return visaLogo
    case 'MASTERCARD': return mastercardLogo
    case 'AMERICAN_EXPRESS': return amexLogo
    case 'ELO': return eloLogo
    case 'HIPERCARD': return hipercardLogo
    default: return null
  }
}

type OutletContext = {
  searchTerm: string
}

type Block = {
  id: string
  title: string
  keywords: string
  content: ReactNode
}

const chartWidth = 240
const chartHeight = 80

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value.replace(',', '.'))
  return 0
}

const buildLinePoints = (values: number[]) => {
  if (!values.length) return ''
  const maxValue = Math.max(...values, 1)
  const step = values.length > 1 ? chartWidth / (values.length - 1) : chartWidth
  return values
    .map((value, index) => {
      const x = Math.round(index * step)
      const y = Math.round(chartHeight - (value / maxValue) * (chartHeight - 18) - 6)
      return `${x},${y}`
    })
    .join(' ')
}

const buildAreaPolygon = (values: number[]) => {
  if (!values.length) return ''
  const points = buildLinePoints(values)
  return `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`
}

export default function Dashboard() {
  const { searchTerm } = useOutletContext<OutletContext>()
  const navigate = useNavigate()
  const normalizedSearch = searchTerm.trim().toLowerCase()

  const [cards, setCards] = useState<Cartao[]>([])
  const [saldo, setSaldo] = useState<SaldoUsuarioPrograma[]>([])
  const [relatorio, setRelatorio] = useState<RelatorioResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      try {
        const [cardsData, saldoData, relatorioData] = await Promise.all([
          cartaoUsuarioService.list<Cartao[]>(),
          saldoUsuarioProgramaService.list(),
          relatorioService.get(),
        ])

        if (!isActive) return

        setCards(Array.isArray(cardsData) ? cardsData : [])
        setSaldo(Array.isArray(saldoData) ? saldoData : [])
        setRelatorio(relatorioData ?? null)
      } catch (error) {
        notify.apiError(error, { fallback: 'Não foi possível carregar os dados do dashboard.' })
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [])

  const totalPoints = useMemo(() => {
    if (relatorio?.saldoGlobal != null) return toNumber(relatorio.saldoGlobal)
    return saldo.reduce((acc, item) => acc + toNumber(item.pontos), 0)
  }, [relatorio, saldo])

  const programSummary = useMemo(() => {
    return saldo.map((item) => {
      const programaNome =
        (typeof item.programa === 'object' && item.programa ? (item.programa as { nome?: string }).nome : undefined) ??
        (item.programaId ? `Programa #${item.programaId}` : 'Programa')
      return {
        label: programaNome,
        value: toNumber(item.pontos),
      }
    })
  }, [saldo])

  const pontosPorCartao = useMemo(() => {
    return relatorio?.pontosPorCartao ?? []
  }, [relatorio])

  const historico = useMemo(() => {
    return relatorio?.historico ?? []
  }, [relatorio])

  const monthlyPoints = useMemo(() => {
    const evolucao = relatorio?.evolucaoMensal ?? []
    const sorted = [...evolucao]
      .filter((item) => item.ano != null && item.mes != null)
      .sort((a, b) => {
        const aDate = new Date(a.ano, a.mes - 1, 1)
        const bDate = new Date(b.ano, b.mes - 1, 1)
        return aDate.getTime() - bDate.getTime()
      })
      .map((item) => {
        const date = new Date(item.ano, item.mes - 1, 1)
        return {
          label: date.toLocaleDateString('pt-BR', { month: 'short' }),
          value: toNumber(item.totalPontos),
          date,
        }
      })

    return sorted.slice(-7)
  }, [relatorio])

  const historySeries = useMemo(() => {
    const sorted = [...historico]
      .filter((item) => !Number.isNaN(new Date(item.data).getTime()))
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

    return sorted.map((item) => ({
      label: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      value: toNumber(item.pontosCalculados),
    }))
  }, [historico])

  const handleDownload = async (type: 'pdf' | 'csv') => {
    try {
      const data = type === 'pdf' ? await relatorioService.exportPdf() : await relatorioService.exportCsv()
      const mimeType = type === 'pdf' ? 'application/pdf' : 'text/csv'
      const blob = new Blob([data], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio.${type}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível baixar o relatório.' })
    }
  }

  const blocks = useMemo<Block[]>(() => {
    const maxCardPoints = Math.max(
      1,
      ...pontosPorCartao.map((item) => toNumber(item.totalPontos))
    )

    const monthlyValues = monthlyPoints.map((item) => item.value)
    const historyValues = historySeries.map((item) => item.value)
    const maxMonthly = Math.max(...monthlyValues, 1)
    const maxHistory = Math.max(...historyValues, 1)

    const linePoints = buildLinePoints(monthlyValues)
    const areaPolygon = buildAreaPolygon(historyValues)
    const historyLine = buildLinePoints(historyValues)

    const programTotal = Math.max(1, programSummary.reduce((acc, item) => acc + item.value, 0))

    // Format point values for Y-axis labels
    const formatYLabel = (value: number) => {
      if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
      return value.toString()
    }

    // SVG Icons
    const WalletIcon = (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
      </svg>
    )
    const CardIcon = (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    )
    const ChartBarIcon = (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    )
    const TrendingUpIcon = (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    )
    const PieChartIcon = (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    )
    const ClockIcon = (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    return [
      {
        id: 'saldo',
        title: 'Patrimônio & Metas',
        keywords: `saldo total pontos milhas patrimonio metas ${programSummary.map((item) => item.label).join(' ')}`,
        content: (() => {
          // Financial calculations
          const avgPointValue = 0.02 // R$ 0,02 per point (average)
          const estimatedValue = totalPoints * avgPointValue

          // Calculate real monthly growth from evolucaoMensal
          const evolucao = relatorio?.evolucaoMensal ?? []
          let monthlyGrowth = 0
          let hasGrowthData = false

          if (evolucao.length >= 2) {
            // Sort by date to get the last two months
            const sorted = [...evolucao]
              .filter((item) => item.ano != null && item.mes != null)
              .sort((a, b) => {
                const aDate = new Date(a.ano, a.mes - 1, 1)
                const bDate = new Date(b.ano, b.mes - 1, 1)
                return aDate.getTime() - bDate.getTime()
              })

            if (sorted.length >= 2) {
              const currentMonth = sorted[sorted.length - 1]
              const previousMonth = sorted[sorted.length - 2]
              const currentTotal = toNumber(currentMonth.totalPontos)
              const previousTotal = toNumber(previousMonth.totalPontos)

              if (previousTotal > 0) {
                monthlyGrowth = ((currentTotal - previousTotal) / previousTotal) * 100
                hasGrowthData = true
              }
            }
          }

          // Program colors for distribution bar
          const programColors = [
            'bg-accent-pool', 'bg-accent-sky', 'bg-purple-500',
            'bg-amber-500', 'bg-rose-500', 'bg-emerald-500'
          ]

          // Determine badge styling based on growth direction
          const isPositiveGrowth = monthlyGrowth >= 0
          const badgeBgClass = isPositiveGrowth ? 'bg-emerald-500/20' : 'bg-red-500/20'
          const badgeTextClass = isPositiveGrowth ? 'text-emerald-400' : 'text-red-400'
          const growthSign = isPositiveGrowth ? '+' : ''

          return (
            <div className="dashboard-card stat-card">

              {/* ===== MIDDLE: Core Financial Section ===== */}
              <div className="flex flex-wrap gap-6 mb-6">
                {/* Left: Total Points */}
                <div className="flex-1 min-w-[12rem]">
                  <div className="flex items-start gap-3">
                    <div className="card-icon">
                      {WalletIcon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-secondary">
                        Saldo Total
                      </p>
                      <p className="stat-value mt-1">
                        <SensitiveValue>{totalPoints.toLocaleString('pt-BR')}</SensitiveValue> <span className="text-lg">pts</span>
                      </p>
                      {/* Trend Badge */}
                      {hasGrowthData && (
                        <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${badgeBgClass} ${badgeTextClass}`}>
                          {isPositiveGrowth ? (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                            </svg>
                          ) : (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25M4.5 19.5V8.25" />
                            </svg>
                          )}
                          <span className="text-xs font-semibold">{growthSign}{monthlyGrowth.toFixed(1)}% este mês</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Estimated Value */}
                <div className="flex-1 min-w-[12rem]">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-secondary mb-1">
                      Conversão Estimada
                    </p>
                    <p className="text-3xl font-bold titulo-grafico">
                      <SensitiveValue placeholder="R$ ••••••">R$ {estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</SensitiveValue>
                    </p>
                    <p className="mt-1 text-xs text-fg-secondary">
                      Cotação média: R$ {avgPointValue.toFixed(2)}/pt
                    </p>
                  </div>
                </div>
              </div>

              {/* ===== BOTTOM: Program Distribution ===== */}
              {programSummary.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-secondary mb-3">
                    Distribuição por Programa
                  </p>

                  {/* Segmented Distribution Bar */}
                  <div className="h-3 rounded-full overflow-hidden flex bg-white/10">
                    {programSummary.map((item, idx) => {
                      const percentage = totalPoints > 0 ? (item.value / totalPoints) * 100 : 0
                      return (
                        <div
                          key={item.label}
                          className={`${programColors[idx % programColors.length]} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                          style={{ width: `${percentage}%` }}
                          title={`${item.label}: ${item.value.toLocaleString('pt-BR')} pts (${percentage.toFixed(1)}%)`}
                        />
                      )
                    })}
                  </div>

                  {/* Legend Grid */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {programSummary.map((item, idx) => {
                      const percentage = totalPoints > 0 ? (item.value / totalPoints) * 100 : 0
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-2 p-2 rounded-lg border border-white/10 bg-white/5"
                        >
                          <div className={`h-3 w-3 rounded-full ${programColors[idx % programColors.length]}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-fg-primary truncate">{item.label}</p>
                            <p className="text-[10px] text-fg-secondary">
                              <SensitiveValue>{item.value.toLocaleString('pt-BR')}</SensitiveValue> pts • {percentage.toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {programSummary.length === 0 && (
                <p className="text-sm text-fg-secondary text-center py-4">
                  Nenhum programa conectado ainda.
                </p>
              )}
            </div>
          )
        })(),
      },
      {
        id: 'cartoes',
        title: 'Cartões cadastrados',
        keywords: `cartoes cartões ${cards.map((card) => card.nome ?? '').join(' ')}`,
        content: (
          <div className="dashboard-card">
            {/* Section Header */}
            <div className="section-header">
              <div className="card-icon">
                {CardIcon}
              </div>
              <div className="flex-1">
                <h2 className="section-title">Cartões cadastrados</h2>
              </div>
              <span className="badge">{cards.length} ativos</span>
            </div>
            {/* Compact Card List */}
            <div className={`mt-4 flex-1 flex flex-col ${cards.length > 4 ? 'overflow-y-auto max-h-[16rem]' : ''}`}>
              {cards.length ? (
                <div className="space-y-2">
                  {cards.map((card, index) => {
                    const brandLogo = getBrandLogo(card.bandeira as string)
                    return (
                      <div
                        key={card.id ?? `${card.nome}-${index}`}
                        onClick={() => navigate('/dashboard/cartoes', { state: { editCardId: card.id } })}
                        className="group flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-pool/30 transition-all duration-200 cursor-pointer"
                      >
                        {/* Brand Logo or Fallback Icon */}
                        <div className="flex-shrink-0 w-10 h-7 flex items-center justify-center rounded bg-white/10">
                          {brandLogo ? (
                            <img src={brandLogo} alt={card.bandeira ?? 'Card'} className="h-5 w-auto" />
                          ) : (
                            <svg className="h-4 w-4 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                            </svg>
                          )}
                        </div>
                        {/* Card Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-fg-primary truncate group-hover:text-accent-pool transition-colors">
                            {card.nome ?? `Cartão ${index + 1}`}
                          </p>
                          <p className="text-xs text-fg-secondary truncate">
                            {card.tipo?.replace('_', ' ') ?? 'Crédito'} • •••• {String(card.id ?? index + 1).slice(-4).padStart(4, '0')}
                          </p>
                        </div>
                        {/* Arrow indicator on hover */}
                        <svg className="h-4 w-4 text-fg-secondary opacity-0 group-hover:opacity-100 group-hover:text-accent-pool transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    )
                  })}
                </div>
              ) : null}

              {/* CTA Button - Show when few cards or no cards */}
              {cards.length < 3 && (
                <Link
                  to="/dashboard/cartoes"
                  className="mt-3 flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-fg-secondary/30 hover:border-accent-pool/50 hover:bg-accent-pool/5 transition-all duration-200 group"
                >
                  <svg className="h-5 w-5 text-fg-secondary group-hover:text-accent-pool transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-sm font-medium text-fg-secondary group-hover:text-accent-pool transition-colors">
                    Adicionar novo cartão
                  </span>
                </Link>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'pontos-cartao',
        title: 'Pontos por cartão',
        keywords: `pontos cartao cartão grafico barras ${pontosPorCartao.map((item) => item.nomeCartao).join(' ')}`,
        content: (() => {
          // Use vertical bars layout when 6 or fewer cards, horizontal when more
          const useVerticalBars = pontosPorCartao.length <= 6 && pontosPorCartao.length > 0

          return (
            <div className="dashboard-card h-full">
              {/* Section Header */}
              <div className="section-header">
                <div className="card-icon">
                  {ChartBarIcon}
                </div>
                <div className="flex-1">
                  <h2 className="section-title">Pontos por cartão</h2>
                </div>
                <span className="badge">Comparativo</span>
              </div>

              {/* Chart Content */}
              {useVerticalBars ? (
                /* Vertical Bars Layout */
                <div className="mt-4 flex-1 flex flex-col justify-end">
                  <div className="flex gap-3">
                    {/* Y-axis labels */}
                    <div className="flex flex-col justify-between text-xs h-[16rem] py-1 text-right min-w-[3rem]">
                      <span className="titulo-grafico font-semibold"><SensitiveValue>{formatYLabel(maxCardPoints)}</SensitiveValue></span>
                      <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxCardPoints * 0.75))}</SensitiveValue></span>
                      <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxCardPoints * 0.5))}</SensitiveValue></span>
                      <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxCardPoints * 0.25))}</SensitiveValue></span>
                      <span className="text-fg-secondary">0</span>
                    </div>
                    {/* Bars container */}
                    <div className="flex-1 flex items-end justify-around gap-3" style={{ height: '16rem' }}>
                      {pontosPorCartao.map((item) => {
                        const value = toNumber(item.totalPontos)
                        const percent = Math.round((value / maxCardPoints) * 100)
                        const barHeight = (percent / 100) * 16
                        return (
                          <div key={item.cartaoId} className="flex flex-col items-center group flex-1 h-full justify-end">
                            {/* Value on hover */}
                            <span className="titulo-grafico text-sm font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              <SensitiveValue>{value.toLocaleString('pt-BR')}</SensitiveValue>
                            </span>
                            {/* Vertical Bar */}
                            <div
                              className="w-full max-w-[3.5rem] rounded-t-lg bg-gradient-to-t from-accent-sky to-accent-pool relative overflow-hidden transition-all duration-500 group-hover:shadow-lg group-hover:shadow-accent-pool/30"
                              style={{ height: `${barHeight}rem`, minHeight: percent > 0 ? '0.5rem' : '0' }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {/* X-axis Labels */}
                  <div className="flex gap-3 mt-3 pt-3 border-t border-white/5">
                    <div className="min-w-[3rem]" /> {/* Spacer for Y-axis */}
                    <div className="flex-1 flex justify-around gap-3">
                      {pontosPorCartao.map((item) => (
                        <span key={item.cartaoId} className="text-xs text-fg-secondary text-center flex-1 leading-tight">
                          {item.nomeCartao}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Horizontal Bars Layout (original) */
                <div className="mt-4 space-y-4 flex-1">
                  {pontosPorCartao.length ? (
                    pontosPorCartao.map((item, idx) => {
                      const value = toNumber(item.totalPontos)
                      const percent = Math.round((value / maxCardPoints) * 100)
                      return (
                        <div key={item.cartaoId} className="group" style={{ animationDelay: `${idx * 100}ms` }}>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-fg-secondary group-hover:text-fg-primary transition-colors">{item.nomeCartao}</span>
                            <span className="titulo-grafico font-bold"><SensitiveValue>{value.toLocaleString('pt-BR')}</SensitiveValue></span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${percent}%`, animationDelay: `${idx * 150}ms` }}
                            />
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-fg-secondary">Sem dados de pontos por cartão.</p>
                  )}
                </div>
              )}
            </div>
          )
        })(),
      },
      {
        id: 'pontos-mes',
        title: 'Pontos por mês',
        keywords: 'pontos mes grafico linha',
        content: (
          <div className="dashboard-card">
            {/* Section Header */}
            <div className="section-header">
              <div className="card-icon">
                {TrendingUpIcon}
              </div>
              <div className="flex-1">
                <h2 className="section-title">Pontos por mês</h2>
              </div>
              <span className="badge">Últimos 7 meses</span>
            </div>
            {/* Chart Container */}
            <div className="chart-container mt-4">
              {monthlyPoints.length ? (
                <>
                  <div className="flex gap-2">
                    {/* Y-axis labels - 5 values */}
                    <div className="flex flex-col justify-between text-[0.625rem] h-28 py-1 pr-1 text-right min-w-[2rem]">
                      <span className="titulo-grafico font-semibold"><SensitiveValue>{formatYLabel(maxMonthly)}</SensitiveValue></span>
                      <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxMonthly * 0.75))}</SensitiveValue></span>
                      <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxMonthly * 0.5))}</SensitiveValue></span>
                      <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxMonthly * 0.25))}</SensitiveValue></span>
                      <span className="text-fg-secondary">0</span>
                    </div>
                    {/* Chart SVG */}
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-28 flex-1" aria-hidden="true">
                      {/* Grid lines - 4 lines for 5 sections */}
                      <line x1="0" y1={chartHeight * 0.2} x2={chartWidth} y2={chartHeight * 0.2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="0" y1={chartHeight * 0.4} x2={chartWidth} y2={chartHeight * 0.4} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="0" y1={chartHeight * 0.6} x2={chartWidth} y2={chartHeight * 0.6} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="0" y1={chartHeight * 0.8} x2={chartWidth} y2={chartHeight * 0.8} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgb(39, 121, 167)" />
                          <stop offset="100%" stopColor="rgb(73, 197, 182)" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Line */}
                      <polyline
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={linePoints}
                        filter="url(#glow)"
                      />
                      {/* Points */}
                      {linePoints.split(' ').map((point, idx) => {
                        const [x, y] = point.split(',')
                        const isLast = idx === linePoints.split(' ').length - 1
                        return (
                          <g key={point}>
                            {isLast && <circle cx={x} cy={y} r="8" fill="rgba(73,197,182,0.2)" />}
                            <circle
                              cx={x}
                              cy={y}
                              r={isLast ? "5" : "3"}
                              fill={isLast ? "rgb(73, 197, 182)" : "rgb(39, 121, 167)"}
                            />
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-fg-secondary pl-9">
                    {monthlyPoints.map((item, idx) => (
                      <span key={item.label} className={idx === monthlyPoints.length - 1 ? 'titulo-grafico font-semibold' : ''}>
                        {item.label}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-fg-secondary">Sem dados mensais disponíveis.</p>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'pontos-programa',
        title: 'Pontos por programa',
        keywords: `pontos programa grafico ${programSummary.map((item) => item.label).join(' ')}`,
        content: (
          <div className="dashboard-card">
            {/* Section Header */}
            <div className="section-header">
              <div className="card-icon">
                {PieChartIcon}
              </div>
              <div className="flex-1">
                <h2 className="section-title">Pontos por programa</h2>
              </div>
              <span className="badge">Distribuição</span>
            </div>
            {/* Progress Bars */}
            <div className="mt-4 space-y-4">
              {programSummary.length ? (
                programSummary.map((item, idx) => {
                  const percent = Math.round((item.value / programTotal) * 100)
                  return (
                    <div key={item.label} className="group" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-fg-secondary group-hover:text-fg-primary transition-colors">{item.label}</span>
                        <span className="titulo-grafico font-bold">{percent}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${percent}%`,
                            animationDelay: `${idx * 150}ms`,
                            background: 'linear-gradient(90deg, rgb(39, 121, 167), rgb(73, 197, 182))'
                          }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-fg-secondary">Sem dados por programa.</p>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'historico',
        title: 'Histórico de acúmulo',
        keywords: 'historico acumulo area grafico',
        content: (
          <div className="dashboard-card">
            {/* Section Header */}
            <div className="section-header">
              <div className="card-icon">
                {ClockIcon}
              </div>
              <div className="flex-1">
                <h2 className="section-title">Histórico de acúmulo</h2>
              </div>
              <span className="badge">{historySeries.length} movimentações</span>
            </div>
            {/* Chart Container */}
            <div className="chart-container mt-4">
              {historySeries.length ? (
                <>
                  <div className="flex gap-2">
                    {/* Y-axis labels - 5 values */}
                    <div className="flex flex-col justify-between text-[0.625rem] h-28 py-1 pr-1 text-right min-w-[2rem]">
                      <span className="titulo-grafico font-semibold"><SensitiveValue>{formatYLabel(maxHistory)}</SensitiveValue></span>
                      <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxHistory * 0.75))}</SensitiveValue></span>
                      <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxHistory * 0.5))}</SensitiveValue></span>
                      <span className="text-fg-secondary"><SensitiveValue>{formatYLabel(Math.round(maxHistory * 0.25))}</SensitiveValue></span>
                      <span className="text-fg-secondary">0</span>
                    </div>
                    {/* Chart SVG */}
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-28 flex-1" aria-hidden="true">
                      {/* Gradient definitions */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgba(39, 121, 167, 0.4)" />
                          <stop offset="100%" stopColor="rgba(39, 121, 167, 0)" />
                        </linearGradient>
                        <linearGradient id="historyLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgb(39, 121, 167)" />
                          <stop offset="100%" stopColor="rgb(73, 197, 182)" />
                        </linearGradient>
                      </defs>
                      {/* Grid lines - 4 lines for 5 sections */}
                      <line x1="0" y1={chartHeight * 0.2} x2={chartWidth} y2={chartHeight * 0.2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="0" y1={chartHeight * 0.4} x2={chartWidth} y2={chartHeight * 0.4} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="0" y1={chartHeight * 0.6} x2={chartWidth} y2={chartHeight * 0.6} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="0" y1={chartHeight * 0.8} x2={chartWidth} y2={chartHeight * 0.8} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      {/* Area */}
                      <polygon points={areaPolygon} fill="url(#areaGradient)" />
                      {/* Line */}
                      <polyline
                        fill="none"
                        stroke="url(#historyLineGradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={historyLine}
                      />
                      {/* Points */}
                      {historyLine.split(' ').map((point, idx) => {
                        const [x, y] = point.split(',')
                        const isLast = idx === historyLine.split(' ').length - 1
                        return (
                          <g key={`hist-${point}`}>
                            {isLast && <circle cx={x} cy={y} r="8" fill="rgba(73,197,182,0.2)" />}
                            <circle
                              cx={x}
                              cy={y}
                              r={isLast ? "4" : "2.5"}
                              fill={isLast ? "rgb(73, 197, 182)" : "rgb(39, 121, 167)"}
                            />
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-fg-secondary pl-9">
                    {historySeries.map((item, idx) => (
                      <span key={item.label} className={idx === historySeries.length - 1 ? 'titulo-grafico font-semibold' : ''}>
                        {item.label}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-fg-secondary">Nenhuma movimentação registrada.</p>
              )}
            </div>
          </div>
        ),
      },
    ]
  }, [cards, historySeries, monthlyPoints, navigate, pontosPorCartao, programSummary, relatorio, totalPoints])

  const filteredBlocks = useMemo(() => {
    if (!normalizedSearch) return blocks
    return blocks.filter((block) => {
      const target = `${block.title} ${block.keywords}`.toLowerCase()
      return target.includes(normalizedSearch)
    })
  }, [blocks, normalizedSearch])

  const blockMap = useMemo(() => {
    return new Map(filteredBlocks.map((block) => [block.id, block]))
  }, [filteredBlocks])

  const getBlock = (id: string) => blockMap.get(id)

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="titulo-grafico text-3xl font-bold">
            Resumo geral
          </h1>
          <p className="mt-2 text-sm text-fg-secondary">
            Acompanhe seus pontos e milhas em um só lugar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleDownload('csv')}
            className="btn-secondary group"
          >
            <svg className="h-4 w-4 text-fg-secondary group-hover:text-accent-pool transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => handleDownload('pdf')}
            className="btn-primary group"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Exportar PDF
          </button>
        </div>
      </header>

      {loading ? (
        <div className="dashboard-card flex items-center justify-center gap-4 py-12">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-2 border-accent-pool/20" />
            <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-transparent border-t-accent-pool animate-spin" />
          </div>
          <span className="text-sm text-fg-secondary">Carregando dados do dashboard...</span>
        </div>
      ) : null}

      <div className="dashboard-grid">
        {getBlock('saldo') ? <div className="full-width">{getBlock('saldo')?.content}</div> : null}

        {/* Row 1-2: Cards + Pontos por cartão (side by side, both can span 2 rows) */}
        {getBlock('cartoes') ? (
          <div className={cards.length > 2 ? 'lg:row-span-2' : ''}>
            {getBlock('cartoes')?.content}
          </div>
        ) : null}
        {getBlock('pontos-cartao') ? (
          <div className="lg:row-span-2">
            {getBlock('pontos-cartao')?.content}
          </div>
        ) : null}

        {/* Row 2 (if cartoes doesn't span) or Row 3: Pontos por programa + Pontos por mês */}
        {getBlock('pontos-programa') ? <div>{getBlock('pontos-programa')?.content}</div> : null}
        {getBlock('pontos-mes') ? <div>{getBlock('pontos-mes')?.content}</div> : null}

        {/* Full width: Histórico */}
        {getBlock('historico') ? <div className="full-width">{getBlock('historico')?.content}</div> : null}
      </div>
    </section>
  )
}
