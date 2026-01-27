import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'

// Hooks
import { useDashboardData } from '../../hooks/useDashboardData'
import { useDashboardCalculations } from '../../hooks/useDashboardCalculations'
import { useDashboardExport } from '../../hooks/useDashboardExport'

// Components
import { DashboardHeader } from '../../components/dashboard/dashboard/DashboardHeader'
import { DashboardStats } from '../../components/dashboard/dashboard/DashboardStats'
import { DashboardCards } from '../../components/dashboard/dashboard/DashboardCards'
import { PointsPerCardChart } from '../../components/dashboard/dashboard/PointsPerCardChart'
import { PointsPerMonthChart } from '../../components/dashboard/dashboard/PointsPerMonthChart'
import { PointsPerProgramChart } from '../../components/dashboard/dashboard/PointsPerProgramChart'
import { HistoryChart } from '../../components/dashboard/dashboard/HistoryChart'

type OutletContext = {
  searchTerm: string
}

type Block = {
  id: string
  title: string
  keywords: string
  content: ReactNode
}

export default function Dashboard() {
  const { searchTerm } = useOutletContext<OutletContext>()
  const normalizedSearch = searchTerm.trim().toLowerCase()

  const { cards, saldo, relatorio, loading } = useDashboardData()
  const {
    totalPoints,
    programSummary,
    pontosPorCartao,
    historico,
    monthlyPoints,
    historySeries,
  } = useDashboardCalculations({ relatorio, saldo })
  const { handleDownload } = useDashboardExport()

  const blocks = useMemo<Block[]>(() => {
    return [
      {
        id: 'saldo',
        title: 'Patrimônio & Metas',
        keywords: `saldo total pontos milhas patrimonio metas ${programSummary.map((item) => item.label).join(' ')}`,
        content: (
          <DashboardStats
            totalPoints={totalPoints}
            programSummary={programSummary}
            relatorio={relatorio}
          />
        ),
      },
      {
        id: 'cartoes',
        title: 'Cartões cadastrados',
        keywords: `cartoes cartões ${cards.map((card) => card.nome ?? '').join(' ')}`,
        content: <DashboardCards cards={cards} />,
      },
      {
        id: 'pontos-cartao',
        title: 'Pontos por cartão',
        keywords: `pontos cartao cartão grafico barras ${pontosPorCartao.map((item) => item.nomeCartao).join(' ')}`,
        content: <PointsPerCardChart pontosPorCartao={pontosPorCartao} />,
      },
      {
        id: 'pontos-mes',
        title: 'Pontos por mês',
        keywords: 'pontos mes grafico linha',
        content: <PointsPerMonthChart monthlyPoints={monthlyPoints} />,
      },
      {
        id: 'pontos-programa',
        title: 'Pontos por programa',
        keywords: `pontos programa grafico ${programSummary.map((item) => item.label).join(' ')}`,
        content: <PointsPerProgramChart programSummary={programSummary} />,
      },
      {
        id: 'historico',
        title: 'Histórico de acúmulo',
        keywords: 'historico acumulo area grafico',
        content: <HistoryChart historySeries={historySeries} />,
      },
    ]
  }, [cards, historySeries, monthlyPoints, pontosPorCartao, programSummary, relatorio, totalPoints, historico])

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
      <DashboardHeader
        onExportCsv={() => handleDownload('csv')}
        onExportPdf={() => handleDownload('pdf')}
      />

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

        {/* Linha 1-2: Cartões + Pontos por cartão (lado a lado, ambos podem ocupar 2 linhas) */}
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

        {/* Linha 2 (se cartões não ocupar) ou Linha 3: Pontos por programa + Pontos por mês */}
        {getBlock('pontos-programa') ? <div>{getBlock('pontos-programa')?.content}</div> : null}
        {getBlock('pontos-mes') ? <div>{getBlock('pontos-mes')?.content}</div> : null}

        {/* Largura total: Histórico */}
        {getBlock('historico') ? <div className="full-width">{getBlock('historico')?.content}</div> : null}
      </div>
    </section>
  )
}
