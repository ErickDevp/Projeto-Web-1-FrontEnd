import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { cartaoUsuarioService } from '../../services/cartaoUsuario/cartaoUsuario.service'
import { relatorioService } from '../../services/relatorio/relatorio.service'
import { saldoUsuarioProgramaService } from '../../services/saldoUsuarioPrograma/saldoUsuarioPrograma.service'
import type { RelatorioResponseDTO } from '../../interfaces/relatorio'
import type { SaldoUsuarioPrograma } from '../../interfaces/saldoUsuarioPrograma'
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

type Cartao = {
  id?: number
  nome?: string
  bandeira?: string
  tipo?: string
  programa?: { nome?: string } | null
  [key: string]: unknown
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

export default function DashboardHome() {
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

    return [
      {
        id: 'saldo',
        title: 'Saldo do usuário',
        keywords: `saldo total pontos milhas ${programSummary.map((item) => item.label).join(' ')}`,
        content: (
          <div className="min-h-[220px] rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fg-secondary">
                  Saldo total
                </p>
                <p className="titulo-grafico mt-2 text-3xl font-semibold">
                  {totalPoints.toLocaleString('pt-BR')} pts
                </p>
                <p className="mt-1 text-xs text-fg-secondary">Atualizado agora</p>
              </div>
              <div className="text-right text-xs text-fg-secondary">
                <p className="titulo-grafico font-semibold">{programSummary.length}</p>
                <p>programas conectados</p>
              </div>
            </div>
            <div className="mt-5 grid gap-2 text-xs text-fg-secondary md:grid-cols-3">
              {programSummary.length ? (
                programSummary.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <span className="truncate">{item.label}</span>
                    <span className="titulo-grafico font-semibold">{item.value.toLocaleString('pt-BR')}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-fg-secondary">Sem saldo registrado.</span>
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
          <div className="min-h-[240px] rounded-2xl border border-white/10 bg-bg-secondary/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="titulo-grafico text-lg font-semibold">Cartões cadastrados</h2>
              <span className="text-xs text-fg-secondary">{cards.length} ativos</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {cards.length ? (
                cards.map((card, index) => (
                  <div
                    key={card.id ?? `${card.nome}-${index}`}
                    className="rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 text-sm text-fg-primary"
                  >
                    <p className="font-semibold">{card.nome ?? `Cartão ${card.id ?? index + 1}`}</p>
                    <p className="mt-1 text-xs text-fg-secondary">
                      {[card.bandeira, card.tipo].filter(Boolean).join(' • ') || 'Sem detalhes'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-fg-secondary">Nenhum cartão cadastrado ainda.</p>
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
          <div className="min-h-[240px] rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="titulo-grafico text-lg font-semibold">Pontos por cartão</h2>
              <span className="text-xs text-fg-secondary">Comparativo</span>
            </div>
            <div className="mt-4 space-y-3">
              {pontosPorCartao.length ? (
                pontosPorCartao.map((item) => {
                  const value = toNumber(item.totalPontos)
                  const percent = Math.round((value / maxCardPoints) * 100)
                  return (
                    <div key={item.cartaoId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-fg-secondary">
                        <span>{item.nomeCartao}</span>
                        <span className="titulo-grafico font-semibold">{value.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-accent-pool" style={{ width: `${percent}%` }} />
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
          <div className="min-h-[240px] rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="titulo-grafico text-lg font-semibold">Pontos por mês</h2>
              <span className="text-xs text-fg-secondary">Últimos 7 meses</span>
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-bg-secondary/60 p-4">
              {monthlyPoints.length ? (
                <>
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-24 w-full" aria-hidden="true">
                    <polyline
                      fill="none"
                      stroke="rgb(73, 197, 182)"
                      strokeWidth="3"
                      points={linePoints}
                    />
                    {linePoints
                      .split(' ')
                      .slice(-1)
                      .map((point) => {
                        const [x, y] = point.split(',')
                        return <circle key={point} cx={x} cy={y} r="4" fill="rgb(73, 197, 182)" />
                      })}
                  </svg>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-fg-secondary">
                    {monthlyPoints.map((item) => (
                      <span key={item.label}>{item.label}</span>
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
          <div className="min-h-[240px] rounded-2xl border border-white/10 bg-bg-secondary/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="titulo-grafico text-lg font-semibold">Pontos por programa</h2>
              <span className="text-xs text-fg-secondary">Distribuição</span>
            </div>
            <div className="mt-4 space-y-3 text-xs text-fg-secondary">
              {programSummary.length ? (
                programSummary.map((item) => {
                  const percent = Math.round((item.value / programTotal) * 100)
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>{item.label}</span>
                        <span className="titulo-grafico font-semibold">{percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-accent-sky" style={{ width: `${percent}%` }} />
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
          <div className="min-h-[240px] rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="titulo-grafico text-lg font-semibold">Histórico de acúmulo</h2>
              <span className="text-xs text-fg-secondary">Últimas 7 movimentações</span>
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-bg-secondary/60 p-4">
              {historySeries.length ? (
                <>
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-24 w-full" aria-hidden="true">
                    <polygon points={areaPolygon} fill="rgba(39, 121, 167, 0.35)" />
                    <polyline
                      fill="none"
                      stroke="rgb(39, 121, 167)"
                      strokeWidth="2.5"
                      points={historyLine}
                    />
                  </svg>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-fg-secondary">
                    {historySeries.map((item) => (
                      <span key={item.label}>{item.label}</span>
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
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Resumo geral</h1>
          <p className="mt-1 text-sm text-fg-secondary">Acompanhe seus pontos e milhas em um só lugar.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDownload('csv')}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-fg-primary hover:bg-white/10"
          >
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => handleDownload('pdf')}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-fg-primary hover:bg-white/10"
          >
            Exportar PDF
          </button>
        </div>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-secondary">
          Carregando dados do dashboard...
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {getBlock('saldo') ? <div className="lg:col-span-2">{getBlock('saldo')?.content}</div> : null}

        {getBlock('cartoes') ? <div>{getBlock('cartoes')?.content}</div> : null}
        {getBlock('pontos-programa') ? <div>{getBlock('pontos-programa')?.content}</div> : null}

        {getBlock('pontos-cartao') ? <div>{getBlock('pontos-cartao')?.content}</div> : null}
        {getBlock('pontos-mes') ? <div>{getBlock('pontos-mes')?.content}</div> : null}

        {getBlock('historico') ? <div className="lg:col-span-2">{getBlock('historico')?.content}</div> : null}
      </div>
    </section>
  )
}
