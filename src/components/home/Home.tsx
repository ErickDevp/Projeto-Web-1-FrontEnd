import { useRef } from 'react'
import logoUrl from '../../assets/logo/logo.png'

type Props = {
  onNext: () => void
}

export default function Home({ onNext }: Props) {
  const wheelLockRef = useRef(false)

  return (
    <section
      className="relative h-screen bg-bg-primary text-fg-primary"
      onWheel={(e) => {
        if (wheelLockRef.current) return
        if (e.deltaY <= 0) return

        wheelLockRef.current = true
        onNext()

        // Evita disparos repetidos em trackpad/scroll contínuo
        setTimeout(() => {
          wheelLockRef.current = false
        }, 600)
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(55%_55%_at_50%_40%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      <div className="relative flex h-screen flex-col items-center justify-center px-6 text-center">
        <img src={logoUrl} alt="Logo" className="h-44 w-44 md:h-50 md:w-50" />

        <h1 className="mt-8 text-5xl font-bold uppercase leading-none tracking-tight md:text-7xl">
          POINTS &amp; MILES
        </h1>

        <p className="mt-4 max-w-2xl text-xs font-light uppercase tracking-[0.35em] text-fg-secondary md:text-sm">
          GERENCIADOR DE PONTOS E MILHAS
        </p>

        <button
          type="button"
          onClick={onNext}
          aria-label="Ir para o conteúdo"
          className="mt-16 rounded-full border border-white/20 bg-white/5 p-3 text-fg-primary transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-pool/60 focus-visible:border-accent-pool active:border-accent-pool active:bg-white/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </section>
  )
}
