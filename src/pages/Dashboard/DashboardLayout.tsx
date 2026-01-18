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
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-primary text-fg-primary">
      <div className="flex min-h-screen">
        <aside className="flex w-24 flex-col items-center gap-5 bg-bg-secondary/80 py-6 shadow-[6px_0_24px_rgba(0,0,0,0.35)] md:w-28 lg:w-32">
          <NavLink to="/dashboard/home" className="flex items-center justify-center">
            <img src={logoUrl} alt="Logo" className="h-16 w-16" />
          </NavLink>

          <nav className="flex w-full flex-col items-center gap-2.5 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[9px] font-semibold uppercase tracking-wide transition',
                    isActive
                      ? 'bg-white/10 text-accent-pool shadow-[0_0_0_1px_rgba(73,197,182,0.3)]'
                      : 'text-fg-secondary hover:bg-white/5 hover:text-fg-primary',
                  ].join(' ')
                }
              >
                {item.icon}
                <span className="text-center leading-tight">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/', { replace: true })
            }}
            className="flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[9px] font-semibold uppercase tracking-wide text-fg-secondary transition hover:bg-white/5 hover:text-fg-primary"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
            </svg>
            <span className="text-center leading-tight">Sair</span>
          </button>
        </aside>

        <main className="flex-1 px-6 py-1 md:px-10">
          <div className="mb-6 -mx-6 md:-mx-10">
            <TopBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
          <Outlet context={{ searchTerm }} />
        </main>
      </div>
    </div>
  )
}
