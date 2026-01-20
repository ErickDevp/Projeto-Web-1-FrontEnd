import { useCallback, useEffect, useMemo, useState } from 'react'
import { relatorioService } from '../../services/relatorio/relatorio.service'
import { notify } from '../../utils/notify'
import type {
  RelatorioResponseDTO,
  EvolucaoMensalDTO,
  PontosPorCartaoDTO,
  HistoricoMovimentacaoDTO,
} from '../../interfaces/relatorio'

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Format points with thousand separators
function formatPoints(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

// Month names in Portuguese
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// Colors for charts
const CHART_COLORS = [
  '#00B4D8', // accent-pool
  '#38BDF8', // accent-sky
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
]

// Line Chart Component (SVG)
function LineChart({ data }: { data: EvolucaoMensalDTO[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-fg-secondary">
        <p className="text-sm">Sem dados de evolução disponíveis</p>
      </div>
    )
  }

  const sortedData = [...data].sort((a, b) => {
    if (a.ano !== b.ano) return a.ano - b.ano
    return a.mes - b.mes
  })

  const maxValue = Math.max(...sortedData.map((d) => d.totalPontos))
  const minValue = Math.min(...sortedData.map((d) => d.totalPontos))
  const range = maxValue - minValue || 1

  const width = 100
  const height = 60
  const padding = 5

  const points = sortedData.map((d, i) => {
    const x = padding + (i / (sortedData.length - 1 || 1)) * (width - padding * 2)
    const y = height - padding - ((d.totalPontos - minValue) / range) * (height - padding * 2)
    return { x, y, data: d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            y1={padding + ratio * (height - padding * 2)}
            x2={width - padding}
            y2={padding + ratio * (height - padding * 2)}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={0.2}
          />
        ))}

        {/* Gradient area */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Main line */}
        <path
          d={pathD}
          fill="none"
          stroke="#00B4D8"
          strokeWidth={0.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={1}
            fill="#00B4D8"
            className="hover:r-2 transition-all"
          />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-[0.625rem] text-fg-secondary px-1">
        {sortedData.map((d, i) => (
          <span key={i}>{MONTH_NAMES[d.mes - 1]}/{String(d.ano).slice(-2)}</span>
        ))}
      </div>

      {/* Legend values */}
      <div className="flex justify-between mt-1 text-xs text-fg-secondary px-1">
        <span>Mín: {formatPoints(minValue)}</span>
        <span>Máx: {formatPoints(maxValue)}</span>
      </div>
    </div>
  )
}

// Donut Chart Component (SVG)
function DonutChart({ data }: { data: PontosPorCartaoDTO[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-fg-secondary">
        <p className="text-sm">Sem dados de cartões disponíveis</p>
      </div>
    )
  }

  const total = data.reduce((acc, d) => acc + d.totalPontos, 0)
  const size = 120
  const strokeWidth = 20
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  let currentAngle = 0
  const segments = data.map((d, i) => {
    const percent = total > 0 ? d.totalPontos / total : 0
    const segmentLength = circumference * percent
    const offset = circumference - currentAngle
    currentAngle += segmentLength
    return {
      ...d,
      percent,
      offset,
      length: segmentLength,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={seg.offset}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-fg-primary">{formatPoints(total)}</span>
          <span className="text-[0.625rem] text-fg-secondary">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="flex-1 text-fg-secondary truncate">{seg.nomeCartao}</span>
            <span className="font-medium text-fg-primary">{formatPoints(seg.totalPontos)}</span>
            <span className="text-fg-secondary">({(seg.percent * 100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}



export default function Relatorios() {
  const [data, setData] = useState<RelatorioResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingCsv, setExportingCsv] = useState(false)

  // Load data
  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      try {
        const response = await relatorioService.get()
        if (isActive) setData(response)
      } catch (error) {
        notify.apiError(error, { fallback: 'Não foi possível carregar os relatórios.' })
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadData()
    return () => { isActive = false }
  }, [])

  // Export PDF
  const handleExportPdf = useCallback(async () => {
    setExportingPdf(true)
    try {
      const buffer = await relatorioService.exportPdf()
      const blob = new Blob([buffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
      a.download = `relatorio-pontos-${date}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      notify.success('PDF baixado com sucesso!')
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível exportar o PDF.' })
    } finally {
      setExportingPdf(false)
    }
  }, [])

  // Export CSV
  const handleExportCsv = useCallback(async () => {
    setExportingCsv(true)
    try {
      const buffer = await relatorioService.exportCsv()
      const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
      a.download = `relatorio-pontos-${date}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      notify.success('CSV baixado com sucesso!')
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível exportar o CSV.' })
    } finally {
      setExportingCsv(false)
    }
  }, [])

  // Summary stats
  const stats = useMemo(() => {
    if (!data) return null

    // Basic stats
    const totalPoints = data.saldoGlobal ?? 0
    const totalCards = data.pontosPorCartao?.length ?? 0
    const totalMovements = data.historico?.length ?? 0

    // Advanced metrics
    // Entradas/Saidas
    const entradas = data.historico?.filter(h => h.pontosCalculados > 0) ?? []
    const totalEntradas = entradas.reduce((acc, h) => acc + h.pontosCalculados, 0)

    const saidas = data.historico?.filter(h => h.pontosCalculados < 0) ?? []
    const totalSaidas = Math.abs(saidas.reduce((acc, h) => acc + h.pontosCalculados, 0))

    const saldoLiquido = totalEntradas - totalSaidas

    // Growth Rate
    let growthRate = 0
    if (data.evolucaoMensal && data.evolucaoMensal.length >= 2) {
      const sortedEvolution = [...data.evolucaoMensal].sort((a, b) => {
        if (a.ano !== b.ano) return a.ano - b.ano
        return a.mes - b.mes
      })
      const currentMonth = sortedEvolution[sortedEvolution.length - 1].totalPontos
      const prevMonth = sortedEvolution[sortedEvolution.length - 2].totalPontos

      if (prevMonth === 0) {
        growthRate = currentMonth > 0 ? 100 : 0
      } else {
        growthRate = ((currentMonth - prevMonth) / prevMonth) * 100
      }
    }

    // Top Programs
    const programMap = new Map<string, number>()
    entradas.forEach(h => {
      const current = programMap.get(h.programa) || 0
      programMap.set(h.programa, current + h.pontosCalculados)
    })

    const topPrograms = Array.from(programMap.entries())
      .map(([name, points]) => ({ name, points, percent: totalEntradas > 0 ? (points / totalEntradas) * 100 : 0 }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 3)

    const mediaPorMovimentacao = totalMovements > 0 ? Math.round(totalEntradas / totalMovements) : 0

    return {
      totalPoints,
      totalCards,
      totalMovements,
      mediaPorMovimentacao,
      totalEntradas,
      totalSaidas,
      saldoLiquido,
      growthRate,
      topPrograms
    }
  }, [data])

  if (loading) {
    return (
      <section className="space-y-6">
        <header>
          <h1 className="titulo-grafico text-2xl font-bold">Relatórios de Desempenho</h1>
          <p className="mt-1 text-sm text-fg-secondary">Analise a evolução dos seus pontos.</p>
        </header>
        <div className="dashboard-card flex items-center justify-center gap-4 py-12">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-2 border-accent-pool/20" />
            <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-transparent border-t-accent-pool animate-spin" />
          </div>
          <span className="text-sm text-fg-secondary">Carregando relatórios...</span>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="titulo-grafico text-2xl font-bold">Relatórios de Desempenho</h1>
          <p className="mt-1 text-sm text-fg-secondary">Analise a evolução dos seus pontos e cartões.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="btn-secondary disabled:opacity-50"
          >
            {exportingPdf ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-fg-primary border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            )}
            Baixar PDF
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className="btn-secondary disabled:opacity-50"
          >
            {exportingCsv ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-fg-primary border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125" />
              </svg>
            )}
            Baixar CSV
          </button>
        </div>
      </header>

      {/* Summary Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="dashboard-card !min-h-0 !p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-pool/10">
                <svg className="h-5 w-5 text-accent-pool" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-fg-primary">{formatPoints(stats.totalPoints)}</p>
                <p className="text-xs text-fg-secondary">Total de Pontos</p>
              </div>
            </div>
          </div>
          <div className="dashboard-card !min-h-0 !p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-fg-primary">{stats.totalCards}</p>
                <p className="text-xs text-fg-secondary">Cartões Ativos</p>
              </div>
            </div>
          </div>
          <div className="dashboard-card !min-h-0 !p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-fg-primary">{stats.totalMovements}</p>
                <p className="text-xs text-fg-secondary">Movimentações</p>
              </div>
            </div>
          </div>
          <div className="dashboard-card !min-h-0 !p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-fg-primary">{formatPoints(stats.mediaPorMovimentacao)} pts</p>
                <p className="text-xs text-fg-secondary">Média por Movimentação</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fluxo e Saúde Section */}
      {stats && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Card 1: Acúmulo vs Resgates */}
          <div className="dashboard-card flex flex-col justify-between">
            <div className="section-header mb-4">
              <div className="card-icon">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="section-title">Acúmulo vs Resgates</h2>
                <p className="text-xs text-fg-secondary">Fluxo total de pontos</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs text-fg-secondary">Entradas</span>
                  <p className="text-lg font-bold text-green-400">+{formatPoints(stats.totalEntradas)}</p>
                </div>
                <div>
                  <span className="text-xs text-fg-secondary">Saídas</span>
                  <p className="text-lg font-bold text-red-400">-{formatPoints(stats.totalSaidas)}</p>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden relative flex">
                {stats.totalEntradas > 0 && (
                  <div
                    className="h-full bg-green-500/20 relative"
                    style={{ width: '100%' }}
                  >
                    <div className="absolute inset-y-0 left-0 bg-green-500/40" style={{ width: '100%' }}></div>
                    {/* Overlay for Saídas (assuming saídas reduce from entries visually) */}
                    <div
                      className="absolute inset-y-0 left-0 bg-red-500/50"
                      style={{ width: `${Math.min((stats.totalSaidas / (stats.totalEntradas || 1)) * 100, 100)}%` }}
                    />
                  </div>
                )}
                {stats.totalEntradas === 0 && stats.totalSaidas > 0 && (
                  <div className="h-full w-full bg-red-500/50" />
                )}
              </div>
              <p className="text-xs text-fg-secondary text-center">
                {stats.totalEntradas > 0
                  ? `${Math.min((stats.totalSaidas / stats.totalEntradas) * 100, 100).toFixed(1)}% dos ganhos foram utilizados`
                  : 'Sem entradas registradas'}
              </p>
            </div>
          </div>

          {/* Card 2: Resultado Líquido */}
          <div className="dashboard-card flex flex-col justify-between">
            <div className="section-header mb-4">
              <div className="card-icon">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="section-title">Resultado Líquido</h2>
                <p className="text-xs text-fg-secondary">Saldo final das operações</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 space-y-2">
              <p className={`text-3xl font-bold ${stats.saldoLiquido >= 0 ? 'text-fg-primary' : 'text-red-400'}`}>
                {formatPoints(stats.saldoLiquido)}
              </p>

              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${stats.growthRate >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                {stats.growthRate >= 0 ? '▲' : '▼'} {Math.abs(stats.growthRate).toFixed(1)}% vs mês anterior
              </div>
            </div>
          </div>

          {/* Card 3: Top Programas */}
          <div className="dashboard-card flex flex-col">
            <div className="section-header mb-4">
              <div className="card-icon">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.25m-5.007 0V5.25m0 0h5.007v3.375M9.497 5.25v3.375M12 15v3.75m0-12v3.75" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="section-title">Maior Pontuador</h2>
                <p className="text-xs text-fg-secondary">Principais fontes de pontos</p>
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
              {stats.topPrograms.length > 0 ? (
                stats.topPrograms.map((prog, i) => (
                  <div key={prog.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-fg-primary font-medium">{i + 1}. {prog.name}</span>
                      <span className="text-fg-secondary">{prog.percent.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent-pool"
                        style={{ width: `${prog.percent}%`, opacity: 1 - (i * 0.2) }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-fg-secondary text-xs">
                  Sem dados de entrada
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Evolution Chart */}
        <div className="dashboard-card">
          <div className="section-header mb-6">
            <div className="card-icon">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="section-title">Evolução Mensal</h2>
              <p className="text-xs text-fg-secondary">Crescimento dos pontos ao longo do tempo</p>
            </div>
          </div>
          <LineChart data={data?.evolucaoMensal ?? []} />
        </div>

        {/* Distribution Chart */}
        <div className="dashboard-card">
          <div className="section-header mb-6">
            <div className="card-icon">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="section-title">Distribuição por Cartão</h2>
              <p className="text-xs text-fg-secondary">Pontos acumulados em cada cartão</p>
            </div>
          </div>
          <DonutChart data={data?.pontosPorCartao ?? []} />
        </div>
      </div>

      {/* History Table */}
      <div className="dashboard-card">
        <div className="section-header mb-6">
          <div className="card-icon">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="section-title">Histórico de Movimentações</h2>
            <p className="text-xs text-fg-secondary">Todas as transações registradas</p>
          </div>
          <span className="badge">{data?.historico?.length ?? 0} registros</span>
        </div>

        {data?.historico && data.historico.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-fg-secondary uppercase tracking-wider">Data</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-fg-secondary uppercase tracking-wider">Programa</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-fg-secondary uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-fg-secondary uppercase tracking-wider">Pontos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.historico.map((item) => {
                  const isCredit = item.status?.toUpperCase() === 'CREDITO' || item.status?.toUpperCase() === 'ENTRADA' || item.pontosCalculados >= 0

                  return (
                    <tr key={item.movimentacaoId} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-fg-secondary">
                        {formatDate(item.data)}
                      </td>
                      <td className="py-3 px-4 text-fg-primary font-medium">
                        {item.programa}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isCredit
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                          }`}>
                          {isCredit ? (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                            </svg>
                          ) : (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                            </svg>
                          )}
                          {item.status || (isCredit ? 'Entrada' : 'Saída')}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${isCredit ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {isCredit ? '+' : '-'}{formatPoints(Math.abs(item.pontosCalculados))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-white/5 p-6 mb-4">
              <svg className="h-12 w-12 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-sm text-fg-secondary">Nenhuma movimentação registrada ainda.</p>
          </div>
        )}
      </div>
    </section>
  )
}
