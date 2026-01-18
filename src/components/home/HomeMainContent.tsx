import { Link, useLocation } from 'react-router-dom'
import logoUrl from '../../assets/logo/logo.png'
import { useAuth } from '../../hooks/useAuth'
import { notify } from '../../utils/notify'

export default function HomeMainContent() {
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()

  const modalState = { backgroundLocation: location }

  const handleLogout = () => {
    logout()
    notify.info('Você saiu da sua conta.')
  }

  return (
    <main className="flex min-h-screen w-full items-center">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-bg-secondary shadow-[0_0_0_0.0625rem_rgba(255,255,255,0.04),0_1.5rem_3.75rem_rgba(0,0,0,0.55)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-accent-pool/20 blur-3xl" />
            <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-accent-sky/20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_0%,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_65%)]" />
          </div>

          <div className="relative flex flex-col gap-10 p-8 md:flex-row md:items-center md:justify-between md:gap-12 md:p-12">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-12 w-12 rounded-xl bg-white/5 p-1.5 ring-1 ring-white/10"
                />
                <span className="text-xs font-semibold tracking-[0.35em] text-fg-secondary">
                  POINTS &amp; MILES
                </span>
              </div>

              <h1 className="mt-6 text-3xl font-bold leading-tight text-fg-primary md:text-5xl">
                GERENCIADOR DE PONTOS E MILHAS
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg-secondary md:text-base">
                Centralize seus programas, acompanhe movimentações e otimize seus pontos com uma
                experiência simples, rápida e segura.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <button
                    type="button"
                    className="rounded-xl bg-accent-pool px-5 py-2.5 text-sm font-semibold text-black shadow hover:opacity-90"
                    onClick={handleLogout}
                  >
                    Sair
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      state={modalState}
                      className="rounded-xl bg-accent-pool px-5 py-2.5 text-sm font-semibold text-black shadow hover:opacity-90"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/register"
                      state={modalState}
                      className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-fg-primary hover:bg-white/10"
                    >
                      Criar conta
                    </Link>

                    <Link
                      to="/forgot-password"
                      state={modalState}
                      className="rounded-xl border border-white/10 bg-transparent px-5 py-2.5 text-sm font-semibold text-fg-secondary hover:bg-white/5"
                    >
                      Recuperar senha
                    </Link>
                  </>
                )}
              </div>
            </div>

            <aside className="w-full max-w-md">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-fg-primary">Status</h2>
                  <span
                    className={
                      isAuthenticated
                        ? 'rounded-full bg-accent-pool/20 px-3 py-1 text-xs font-semibold text-accent-pool'
                        : 'rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-fg-secondary'
                    }
                  >
                    {isAuthenticated ? 'Autenticado' : 'Visitante'}
                  </span>
                </div>

                <p className="mt-3 text-sm text-fg-secondary">
                  {isAuthenticated
                    ? 'Você já pode acessar suas funcionalidades quando elas forem habilitadas.'
                    : 'Faça login para acessar seus dados e acompanhar seus pontos.'}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-bg-primary/40 p-4">
                    <p className="text-xs font-semibold text-fg-secondary">Destaque</p>
                    <p className="mt-2 text-sm font-semibold text-fg-primary">Alertas &amp; status</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-bg-primary/40 p-4">
                    <p className="text-xs font-semibold text-fg-secondary">Ações</p>
                    <p className="mt-2 text-sm font-semibold text-fg-primary">Relatórios</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
