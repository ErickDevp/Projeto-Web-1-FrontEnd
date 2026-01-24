const features = [
    {
        icon: (
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <circle cx="12" cy="16" r="2" />
            </svg>
        ),
        title: 'Controle de Validade',
        description: 'Nunca mais perca milhas expiradas.',
    },
    {
        icon: (
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
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        ),
        title: 'Gestão de Cartões',
        description: 'Vincule múltiplos cartões e programas.',
    },
    {
        icon: (
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
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
            </svg>
        ),
        title: 'Cotação Atualizada',
        description: 'Saiba quanto valem seus pontos hoje.',
    },
]

export default function HomeFeatures() {
    return (
        <section id="home-content" className="mx-auto w-full max-w-6xl px-6 pt-16 pb-10">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                    <div
                        key={feature.title}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent-pool/30 hover:bg-white/10 hover:shadow-[0_0_1.5rem_rgba(73,197,182,0.15)]"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Brilho de gradiente ao passar o mouse */}
                        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-accent-pool/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

                        <div className="relative">
                            <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-accent-sky/20 to-accent-pool/20 p-3 text-accent-pool transition-transform duration-300 group-hover:scale-110">
                                {feature.icon}
                            </div>

                            <h3 className="text-lg font-semibold text-fg-primary">
                                {feature.title}
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
