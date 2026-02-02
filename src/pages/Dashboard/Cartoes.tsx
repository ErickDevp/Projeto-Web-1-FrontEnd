import { useCartoes } from '../../hooks/useCartoes'
import PageHeader from '../../components/ui/PageHeader'
import { CartaoList } from '../../components/dashboard/cartoes/CartaoList'
import { CartaoFormModal } from '../../components/dashboard/cartoes/CartaoFormModal'

export default function Cartoes() {
  const {
    cards,
    programas,
    loading,
    isSaving,
    isFormOpen,
    editingCard,
    openNewForm,
    openEditForm,
    closeForm,
    saveCard,
    deleteCard,
  } = useCartoes()

  return (
    <section className="space-y-6">
      <PageHeader
        title="Cartões"
        description="Cadastre e acompanhe seus cartões e programas de fidelidade."
      >
        <button
          type="button"
          onClick={openNewForm}
          className="btn-primary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo cartão
        </button>
      </PageHeader>

      {/* Modal de Formulário */}
      <CartaoFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={saveCard}
        initialData={editingCard}
        programas={programas}
        isSaving={isSaving}
      />

      {/* Grid de Cartões */}
      <CartaoList
        cards={cards} // Mantenha "cards" se sua API retornar isso
        loading={loading}
        onEdit={openEditForm}
        onDelete={deleteCard}
      />
    </section>
  )
}
