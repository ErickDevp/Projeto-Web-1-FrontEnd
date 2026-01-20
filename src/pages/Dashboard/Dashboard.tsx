import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { cartaoUsuarioService } from '../../services/cartaoUsuario/cartaoUsuario.service'
import { relatorioService } from '../../services/relatorio/relatorio.service'
import { saldoUsuarioProgramaService } from '../../services/saldoUsuarioPrograma/saldoUsuarioPrograma.service'
import type { RelatorioResponseDTO } from '../../interfaces/relatorio'
import type { SaldoUsuarioPrograma } from '../../interfaces/saldoUsuarioPrograma'
import type { Cartao } from '../../interfaces/cardTypes'
import { notify } from '../../utils/notify'

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
      .slice(-7)

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

    const linePoints = buildLinePoints(monthlyPoints.map((item) => item.value))
    const areaPolygon = buildAreaPolygon(historySeries.map((item) => item.value))
    const historyLine = buildLinePoints(historySeries.map((item) => item.value))

    const programTotal = Math.max(1, programSummary.reduce((acc, item) => acc + item.value, 0))

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
        title: 'Saldo do usuário',
        keywords: `saldo total pontos milhas ${programSummary.map((item) => item.label).join(' ')}`,
        content: (
          <div className="dashboard-card stat-card">
            {/* Header with icon */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="card-icon">
                  {WalletIcon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fg-secondary">
                    Saldo total
                  </p>
                  <p className="stat-value mt-2">
                    {totalPoints.toLocaleString('pt-BR')} <span className="text-lg">pts</span>
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="badge">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-pool animate-pulse" />
                      Atualizado agora
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex flex-col items-end rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                  <p className="stat-value text-2xl">{programSummary.length}</p>
                  <p className="text-xs text-fg-secondary">programas conectados</p>
                </div>
              </div>
            </div>
            {/* Program list */}
            <div className="mini-card-grid mt-6">
              {programSummary.length ? (
                programSummary.map((item) => (
                  <div key={item.label} className="mini-card flex items-center justify-between">
                    <span className="truncate text-sm text-fg-secondary">{item.label}</span>
                    <span className="titulo-grafico font-bold">{item.value.toLocaleString('pt-BR')}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-fg-secondary">Sem saldo registrado.</span>
              )}
            </div>
          </div>
        ),
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
            {/* Card Grid */}
            <div className="mini-card-grid mt-4">
              {cards.length ? (
                cards.map((card, index) => (
                  <div
                    key={card.id ?? `${card.nome}-${index}`}
                    className="mini-card group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-sky/20 to-accent-pool/20">
                        {CardIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-fg-primary truncate">{card.nome ?? `Cartão ${card.id ?? index + 1}`}</p>
                        <p className="text-xs text-fg-secondary truncate">
                          {[card.bandeira, card.tipo].filter(Boolean).join(' • ') || 'Sem detalhes'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-fg-secondary col-span-2">Nenhum cartão cadastrado ainda.</p>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'pontos-cartao',
        title: 'Pontos por cartão',
        keywords: `pontos cartao cartão grafico barras ${pontosPorCartao.map((item) => item.nomeCartao).join(' ')}`,
        content: (
          <div className="dashboard-card">
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
            {/* Progress Bars */}
            <div className="mt-4 space-y-4">
              {pontosPorCartao.length ? (
                pontosPorCartao.map((item, idx) => {
                  const value = toNumber(item.totalPontos)
                  const percent = Math.round((value / maxCardPoints) * 100)
                  return (
                    <div key={item.cartaoId} className="group" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-fg-secondary group-hover:text-fg-primary transition-colors">{item.nomeCartao}</span>
                        <span className="titulo-grafico font-bold">{value.toLocaleString('pt-BR')}</span>
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
          </div>
        ),
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
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-28 w-full" aria-hidden="true">
                    {/* Grid lines */}
                    <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
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
                  <div className="mt-3 flex items-center justify-between text-xs text-fg-secondary">
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
              <span className="badge">Últimas 7 movimentações</span>
            </div>
            {/* Chart Container */}
            <div className="chart-container mt-4">
              {historySeries.length ? (
                <>
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-28 w-full" aria-hidden="true">
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
                    {/* Grid lines */}
                    <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
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
                  <div className="mt-3 flex items-center justify-between text-xs text-fg-secondary">
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
  }, [cards, historySeries, monthlyPoints, pontosPorCartao, programSummary, totalPoints])

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

        {getBlock('cartoes') ? <div>{getBlock('cartoes')?.content}</div> : null}
        {getBlock('pontos-programa') ? <div>{getBlock('pontos-programa')?.content}</div> : null}

        {getBlock('pontos-cartao') ? <div>{getBlock('pontos-cartao')?.content}</div> : null}
        {getBlock('pontos-mes') ? <div>{getBlock('pontos-mes')?.content}</div> : null}

        {getBlock('historico') ? <div className="full-width">{getBlock('historico')?.content}</div> : null}
      </div>
    </section>
  )
}
