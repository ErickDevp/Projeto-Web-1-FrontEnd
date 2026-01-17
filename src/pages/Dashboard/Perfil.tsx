export default function Perfil() {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Meu perfil</h1>
        <p className="mt-1 text-sm text-fg-secondary">Gerencie seus dados pessoais e preferências.</p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-fg-secondary">
          Em breve: edição de dados, preferências de comunicação e segurança da conta.
        </p>
      </div>
    </section>
  )
}
