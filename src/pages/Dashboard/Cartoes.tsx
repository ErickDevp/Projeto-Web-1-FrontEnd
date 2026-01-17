export default function Cartoes() {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Cartões</h1>
        <p className="mt-1 text-sm text-fg-secondary">Cadastre e acompanhe seus cartões e programas.</p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-fg-secondary">Nenhum cartão cadastrado ainda.</p>
      </div>
    </section>
  )
}
