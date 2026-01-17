export default function Notificacoes() {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Notificações</h1>
        <p className="mt-1 text-sm text-fg-secondary">Histórico de alertas e promoções.</p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <ul className="space-y-3 text-sm text-fg-secondary">
          <li>• Promoção de transferência bonificada disponível.</li>
          <li>• Seu saldo foi atualizado há 2 horas.</li>
          <li>• Novo relatório mensal pronto para visualização.</li>
        </ul>
      </div>
    </section>
  )
}
