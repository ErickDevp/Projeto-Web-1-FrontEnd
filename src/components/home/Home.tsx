import logoUrl from '../../assets/logo/logo.png'

export default function Home() {
  return (
    <section className="relative h-screen bg-bg-primary text-fg-primary">
      <div className="pointer-events-none absolute inset-0">
        {/* Subtle flight routes pattern */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* World map simplified dots */}
          <g fill="currentColor" className="text-white">
            {/* Americas */}
            <circle cx="180" cy="200" r="2" />
            <circle cx="200" cy="250" r="2" />
            <circle cx="160" cy="280" r="2" />
            <circle cx="220" cy="320" r="2" />
            <circle cx="190" cy="380" r="2" />
            {/* Europe */}
            <circle cx="400" cy="180" r="2" />
            <circle cx="420" cy="200" r="2" />
            <circle cx="440" cy="190" r="2" />
            <circle cx="380" cy="210" r="2" />
            {/* Asia */}
            <circle cx="550" cy="200" r="2" />
            <circle cx="600" cy="220" r="2" />
            <circle cx="650" cy="250" r="2" />
            <circle cx="580" cy="280" r="2" />
            {/* Africa */}
            <circle cx="420" cy="300" r="2" />
            <circle cx="450" cy="340" r="2" />
            {/* Australia */}
            <circle cx="680" cy="400" r="2" />
            <circle cx="700" cy="380" r="2" />
          </g>
          {/* Flight routes */}
          <g stroke="currentColor" strokeWidth="0.5" fill="none" className="text-accent-pool">
            {/* Route 1: Americas to Europe */}
            <path d="M200,250 Q300,150 400,180" strokeDasharray="4,4" />
            {/* Route 2: Europe to Asia */}
            <path d="M420,200 Q500,180 580,220" strokeDasharray="4,4" />
            {/* Route 3: Asia to Australia */}
            <path d="M600,280 Q650,340 680,400" strokeDasharray="4,4" />
            {/* Route 4: Americas to Asia (trans-pacific) */}
            <path d="M180,280 Q400,100 600,220" strokeDasharray="4,4" />
            {/* Route 5: Europe to Africa */}
            <path d="M400,210 Q410,250 420,300" strokeDasharray="4,4" />
          </g>
          {/* Airplane icons at route midpoints */}
          <g fill="currentColor" className="text-white">
            <text x="300" y="165" fontSize="12" transform="rotate(-20 300 165)">✈</text>
            <text x="500" y="185" fontSize="12" transform="rotate(5 500 185)">✈</text>
            <text x="400" y="140" fontSize="10" transform="rotate(-10 400 140)">✈</text>
          </g>
        </svg>
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
          onClick={() => {
            const target = document.getElementById('home-content')
            if (target) target.scrollIntoView({ behavior: 'smooth' })
          }}
          aria-label="Ir para o conteúdo"
          className="mt-16 rounded-full border border-white/20 bg-white/5 p-3 text-fg-primary transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-pool/60 focus-visible:border-accent-pool active:border-accent-pool active:bg-white/10 animate-bounce"
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
