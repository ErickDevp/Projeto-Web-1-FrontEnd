import { Link } from 'react-router-dom'

export default function HomeFooter() {
    return (
        <footer className="mx-auto w-full max-w-6xl px-6 pb-8">
            <div className="flex flex-col items-center gap-4 border-t border-white/10 pt-6 text-center">
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-fg-secondary">
                    <Link
                        to="/terms"
                        className="transition-colors hover:text-accent-pool"
                    >
                        Termos de Uso
                    </Link>
                    <span className="opacity-30">•</span>
                    <Link
                        to="/privacy"
                        className="transition-colors hover:text-accent-pool"
                    >
                        Política de Privacidade
                    </Link>
                </div>

                <p className="text-xs text-fg-secondary/60">
                    © {new Date().getFullYear()} Points & Miles — {' '}
                    <a
                        href="https://github.com/ErickDevp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-pool/80 transition-colors hover:text-accent-pool"
                    >
                        Repositório GitHub
                    </a>
                </p>
            </div>
        </footer>
    )
}
