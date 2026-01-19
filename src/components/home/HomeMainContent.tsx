import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoUrl from '../../assets/logo/logo.png'
import { useAuth } from '../../hooks/useAuth'
import { notify } from '../../utils/notify'
import HomeFeatures from './HomeFeatures'
import HomeFooter from './HomeFooter'
import CreditCardPreview from '../ui/CreditCardPreview'
import { saldoUsuarioProgramaService } from '../../services/saldoUsuarioPrograma/saldoUsuarioPrograma.service'
import { cartaoUsuarioService } from '../../services/cartaoUsuario/cartaoUsuario.service'
import { programaFidelidadeService } from '../../services/programaFidelidade/programaFidelidade.service'

type UserStats = {
  totalPontos: number
  totalCartoes: number
  totalProgramas: number
  loading: boolean
}

export default function HomeMainContent() {
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()

  const modalState = { backgroundLocation: location }

  const [stats, setStats] = useState<UserStats>({
    totalPontos: 0,
    totalCartoes: 0,
    totalProgramas: 0,
    loading: true,
  })

  // Fetch user stats when authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    let isActive = true

    const loadStats = async () => {
      try {
        const [saldos, cartoes, programas] = await Promise.all([
          saldoUsuarioProgramaService.list().catch(() => []),
          cartaoUsuarioService.list<{ id: number }[]>().catch(() => []),
          programaFidelidadeService.list<{ id: number }[]>().catch(() => []),
        ])

        if (!isActive) return

        // Calculate total points from all saldos
        const totalPontos = Array.isArray(saldos)
          ? saldos.reduce((sum, s) => sum + (s.pontos ?? 0), 0)
          : 0

        setStats({
          totalPontos,
          totalCartoes: Array.isArray(cartoes) ? cartoes.length : 0,
          totalProgramas: Array.isArray(programas) ? programas.length : 0,
          loading: false,
        })
      } catch {
        if (isActive) {
          setStats((prev) => ({ ...prev, loading: false }))
        }
      }
    }

    loadStats()

    return () => {
      isActive = false
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
    notify.info('Você saiu da sua conta.')
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString('pt-BR')
  }

  return (
    <main className="flex min-h-screen w-full flex-col justify-center">
      <HomeFeatures />
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
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
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent-pool/30 hover:shadow-[0_0_2rem_rgba(73,197,182,0.2)]"
                >
                  {/* Animated gradient background */}
                  <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br from-accent-pool/30 to-accent-sky/20 blur-3xl transition-transform duration-500 group-hover:scale-125" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-sky/20 to-accent-pool/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />

                  <div className="relative text-center">
                    {/* Dashboard icon */}
                    <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-pool/20 to-accent-sky/20 transition-transform duration-300 group-hover:scale-110">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-8 w-8 text-accent-pool"
                      >
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                    </div>

                    {/* Welcome text */}
                    <h3 className="text-lg font-semibold text-fg-primary">
                      Bem-vindo de volta!
                    </h3>
                    <p className="mt-2 text-sm text-fg-secondary">
                      Acesse seu painel para gerenciar seus pontos e milhas.
                    </p>

                    {/* CTA Button */}
                    <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-pool to-accent-sky px-6 py-3 text-sm font-semibold text-black transition-all duration-300 group-hover:gap-3 group-hover:shadow-[0_0_1.5rem_rgba(73,197,182,0.4)]">
                      <span>Ir para o Dashboard</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Stats preview */}
                    <div className="mt-6 flex justify-center gap-6 border-t border-white/10 pt-5">
                      <div className="text-center">
                        <p className="text-2xl font-bold bg-gradient-to-r from-accent-pool to-accent-sky bg-clip-text text-transparent">
                          {stats.loading ? '...' : formatNumber(stats.totalPontos)}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-fg-secondary/60">Pontos</p>
                      </div>
                      <div className="h-8 w-px bg-white/10" />
                      <div className="text-center">
                        <p className="text-2xl font-bold bg-gradient-to-r from-accent-pool to-accent-sky bg-clip-text text-transparent">
                          {stats.loading ? '...' : stats.totalCartoes}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-fg-secondary/60">Cartões</p>
                      </div>
                      <div className="h-8 w-px bg-white/10" />
                      <div className="text-center">
                        <p className="text-2xl font-bold bg-gradient-to-r from-accent-pool to-accent-sky bg-clip-text text-transparent">
                          {stats.loading ? '...' : stats.totalProgramas}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-fg-secondary/60">Programas</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 p-6 backdrop-blur-sm">
                  {/* Premium card background effects */}
                  <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/10 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-gradient-to-tr from-accent-pool/20 to-accent-sky/10 blur-2xl" />

                  {/* Credit card mockup */}
                  <CreditCardPreview
                    holderName="SEU NOME"
                    lastDigits="1234"
                    cardTier="INFINITE"
                    variant="black"
                    className="mb-6"
                  />

                  {/* Balance display */}
                  <div className="relative">
                    <p className="text-xs font-semibold uppercase tracking-wider text-fg-secondary">Saldo Total</p>
                    <p className="mt-1 bg-gradient-to-r from-accent-pool to-accent-sky bg-clip-text text-3xl font-bold text-transparent">
                      1.450.000 <span className="text-lg">pts</span>
                    </p>

                    {/* Mini sparkline chart */}
                    <div className="mt-4 flex h-10 items-end gap-1">
                      {[40, 55, 45, 70, 60, 80, 65, 90, 75, 100, 85, 95].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-accent-pool/60 to-accent-sky/60 transition-all duration-300 hover:from-accent-pool hover:to-accent-sky"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-fg-secondary/60">Evolução dos últimos 12 meses</p>
                  </div>

                  {/* CTA hint */}
                  <p className="mt-4 text-center text-xs text-fg-secondary/80">
                    Registre-se para começar a gerenciar seu saldo real!
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
  )
}
