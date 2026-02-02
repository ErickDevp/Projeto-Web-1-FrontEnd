import { useMovimentacoes } from '../../hooks/useMovimentacoes'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import MovimentacoesHeader from '../../components/dashboard/movimentacoes/MovimentacoesHeader'
import MovimentacoesStats from '../../components/dashboard/movimentacoes/MovimentacoesStats'
import MovimentacoesTable from '../../components/dashboard/movimentacoes/MovimentacoesTable'
import MovimentacoesList from '../../components/dashboard/movimentacoes/MovimentacoesList'

export default function Movimentacoes() {
  const {
    cards,
    programas,
    movimentacoes,
    saldoGlobal,
    loading,
    editingId,
    form,
    setForm,
    cardMap,
    programMap,
    startEdit,
    cancelEdit,
    handleSave,
    handleDelete,
    totalValor,
    statusCounts
  } = useMovimentacoes()

  return (
    <section className="space-y-6">
      <MovimentacoesHeader totalValor={totalValor} saldoGlobal={saldoGlobal} />

      <MovimentacoesStats counts={statusCounts} />

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
          <LoadingSpinner message="Carregando movimentações..." />
        ) : movimentacoes.length === 0 ? (
          <EmptyState
            className="gap-4"
            icon={(
              <svg className="h-12 w-12 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            title=""
            description="Nenhuma movimentação registrada."
          />
        ) : (
          <>
            <MovimentacoesTable
              movimentacoes={movimentacoes}
              editingId={editingId}
              form={form}
              setForm={setForm}
              cards={cards}
              programas={programas}
              cardMap={cardMap}
              programMap={programMap}
              startEdit={startEdit}
              cancelEdit={cancelEdit}
              handleSave={handleSave}
              handleDelete={handleDelete}
            />
            <MovimentacoesList
              movimentacoes={movimentacoes}
              editingId={editingId}
              form={form}
              setForm={setForm}
              cards={cards}
              programas={programas}
              cardMap={cardMap}
              programMap={programMap}
              startEdit={startEdit}
              cancelEdit={cancelEdit}
              handleSave={handleSave}
              handleDelete={handleDelete}
            />
          </>
        )}
      </div>
    </section>
  )
}
