import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import logoUrl from '../../assets/logo/logo.png'
import TopBar from '../../components/dashboard/TopBar'
import { useAuth } from '../../hooks/useAuth'

type NavItem = {
  label: string
  to: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard/home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Meu perfil',
    to: '/dashboard/perfil',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <circle cx="12" cy="8" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
  {
    label: 'Cartões',
    to: '/dashboard/cartoes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
      </svg>
    ),
  },
  {
    label: 'Registrar pontos',
    to: '/dashboard/registrar-pontos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      </svg>
    ),
  },
  {
    label: 'Notificações',
    to: '/dashboard/notificacoes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    label: 'Movimentações',
    to: '/dashboard/movimentacoes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 20v-6h-6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 8a8 8 0 00-14.31-4.31" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16a8 8 0 0014.31 4.31" />
      </svg>
    ),
  },
  {
    label: 'Relatórios',
    to: '/dashboard/relatorios',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16v-6" />
      </svg>
    ),
  },
  {
    label: 'Configurações',
    to: '/dashboard/configuracoes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 6.93l1.41-1.41 2.12 1.22a7.96 7.96 0 016.08 0l2.12-1.22 1.41 1.41-1.22 2.12a7.96 7.96 0 010 6.08l1.22 2.12-1.41 1.41-2.12-1.22a7.96 7.96 0 01-6.08 0l-2.12 1.22-1.41-1.41 1.22-2.12a7.96 7.96 0 010-6.08z" />
      </svg>
    ),
  },
]

export default function DashboardLayout() {
  const { logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  // Fechar menu ao navegar
  const handleNavigation = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-bg-primary text-fg-primary font-sans selection:bg-accent-pool/30">
      {/* Mobile Menu Button - Floating or Top Bar */}
      <div className="md:hidden fixed z-[60] top-4 left-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-bg-secondary/80 backdrop-blur-md border border-white/10 shadow-lg text-fg-primary"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-h-screen">
        {/* Sidebar - Fixed on all screen sizes */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-[100dvh]
            flex w-64 md:w-28 lg:w-32 flex-col items-center gap-5
            bg-bg-secondary/95 backdrop-blur-xl md:bg-bg-secondary/80
            border-r border-white/5 shadow-2xl md:shadow-[0.375rem_0_1.5rem_rgba(0,0,0,0.35)]
            transition-transform duration-300 ease-out will-change-transform
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="flex w-full items-center justify-center py-6 md:py-6 relative">
            {/* Logo */}
            <NavLink to="/dashboard/home" onClick={handleNavigation} className="flex items-center justify-center">
              <img src={logoUrl} alt="Logo" className="h-16 w-16 md:h-14 md:w-14 object-contain filter drop-shadow-[0_0_0.9375rem_rgba(73,197,182,0.3)] transition-all hover:scale-105" />
            </NavLink>
          </div>

          <nav className="flex w-full flex-1 flex-col items-center gap-2 px-4 md:px-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavigation}
                end={item.to === '/dashboard/home'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 group relative overflow-hidden',
                    'md:w-full md:flex-col md:justify-center md:gap-1 md:px-2 md:py-2.5',
                    'w-full text-sm md:text-[0.5625rem] md:font-bold md:uppercase md:tracking-wider',
                    isActive
                      ? 'bg-gradient-to-r from-accent-sky/10 to-accent-sea/10 text-accent-pool shadow-[0_0_0_0.0625rem_rgba(73,197,182,0.3)]'
                      : 'text-fg-secondary hover:bg-white/5 hover:text-fg-primary hover:shadow-[0_0_0.9375rem_rgba(0,0,0,0.2)]',
                  ].join(' ')
                }
              >
                {/* Active Indicator Strip */}
                {({ isActive }) => (
                  <>
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-accent-pool transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                    <div className="relative z-10 transition-transform duration-300 group-hover:scale-110 md:group-hover:translate-y-[-0.125rem]">
                      {item.icon}
                    </div>
                    <span className="relative z-10 font-medium md:text-center leading-tight truncate w-full md:w-auto">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="w-full px-4 md:px-2 pb-6 pt-2">
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/', { replace: true })
              }}
              className="group relative w-full overflow-hidden rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 md:px-2 md:py-2 text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:shadow-[0_0_1.25rem_rgba(239,68,68,0.15)] flex items-center md:flex-col justify-center gap-3 md:gap-1"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 transition-transform group-hover:-translate-x-1 md:group-hover:translate-x-0 md:group-hover:translate-y-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
              </svg>
              <span className="text-sm md:text-[0.5625rem] font-bold uppercase tracking-wider">Sair</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 w-full min-w-0 transition-all duration-300 md:ml-28 lg:ml-32">
          {/* Limitador de largura para telas ultra-wide */}
          <div className="mx-auto max-w-[100rem] px-4 py-4 md:px-8 md:py-6 lg:px-10">
            <div className="mb-6 md:mb-8 pt-12 md:pt-0">
              <TopBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            </div>
            <div className="animate-fadeIn">
              <Outlet context={{ searchTerm }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
