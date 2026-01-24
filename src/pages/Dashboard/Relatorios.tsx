import { useRelatoriosDashboard } from '../../hooks/useRelatoriosDashboard'
import { LineChart, DonutChart } from '../../components/relatorios/RelatorioCharts'
import { RelatorioSummary } from '../../components/relatorios/RelatorioSummary'
import { RelatorioHistory } from '../../components/relatorios/RelatorioHistory'

export default function Relatorios() {
  const {
    data,
    loading,
    stats,
    exportingPdf,
    exportingCsv,
    handleExportPdf,
    handleExportCsv
  } = useRelatoriosDashboard()

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
      {stats && <RelatorioSummary stats={stats} />}

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
      <RelatorioHistory historico={data?.historico ?? []} />
    </section>
  )
}
