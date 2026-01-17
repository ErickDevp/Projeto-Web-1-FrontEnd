export default function DashboardHome() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Resumo geral</h1>
        <p className="mt-1 text-sm text-fg-secondary">Acompanhe seus pontos e milhas em um só lugar.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { title: 'Saldo total', value: '32.450 pts', helper: 'Última atualização: hoje' },
          { title: 'Programas conectados', value: '4', helper: 'Smiles, Latam Pass, TudoAzul...' },
          { title: 'Notificações', value: '3 novas', helper: 'Promoções e alertas recentes' },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
          >
            <p className="text-sm text-fg-secondary">{card.title}</p>
            <p className="mt-2 text-2xl font-semibold text-fg-primary">{card.value}</p>
            <p className="mt-3 text-xs text-fg-secondary">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-bg-secondary/60 p-6">
        <h2 className="text-lg font-semibold">Atalhos rápidos</h2>
        <p className="mt-1 text-sm text-fg-secondary">
          Cadastre pontos, consulte relatórios e mantenha suas notificações sempre atualizadas.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {['Registrar pontos', 'Ver relatórios', 'Atualizar perfil'].map((action) => (
            <button
              key={action}
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-fg-primary transition hover:bg-white/10"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
