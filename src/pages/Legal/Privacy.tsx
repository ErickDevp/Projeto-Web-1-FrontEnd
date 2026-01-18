type Props = {
  embedded?: boolean
}

export default function Privacy({ embedded }: Props) {
  return (
    <div className={embedded ? 'w-full' : 'min-h-screen bg-bg-primary px-4 py-10'}>
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-bg-secondary p-8 shadow-[0_1.5rem_3.75rem_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-fg-primary">Política de Privacidade</h1>
        </div>

        <div className="mt-6 space-y-3 text-sm text-fg-secondary">
          <p>
            1) Coleta: podemos coletar informações necessárias para autenticação e funcionamento do
            serviço.
          </p>
          <p>
            2) Uso: os dados são usados para operar a plataforma, melhorar a experiência e manter
            a segurança.
          </p>
          <p>
            3) Segurança: adotamos medidas técnicas para proteger informações, mas nenhum sistema
            é 100% infalível.
          </p>
        </div>
      </div>
    </div>
  )
}
