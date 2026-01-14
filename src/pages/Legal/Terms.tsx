type Props = {
  embedded?: boolean
}

export default function Terms({ embedded }: Props) {
  return (
    <div className={embedded ? 'w-full' : 'min-h-screen bg-bg-primary px-4 py-10'}>
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-bg-secondary p-8 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-fg-primary">Termos de Serviço</h1>
        </div>

        <div className="mt-6 space-y-3 text-sm text-fg-secondary">
          <p>
            1) Uso do serviço: ao utilizar a plataforma, você concorda em fornecer informações
            verdadeiras e manter suas credenciais seguras.
          </p>
          <p>
            2) Responsabilidades: esta aplicação pode integrar com serviços de terceiros; não nos
            responsabilizamos por indisponibilidade externa.
          </p>
          <p>
            3) Alterações: podemos atualizar estes termos periodicamente. Verifique esta página
            para acompanhar mudanças.
          </p>
        </div>
      </div>
    </div>
  )
}
