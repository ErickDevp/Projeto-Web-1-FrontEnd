import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usuarioService } from '../../services/usuario/usuario.service'
import { notificacaoService } from '../../services/notificacao/notificacao.service'

type Props = {
  unreadNotifications?: number
  userName?: string
  userEmail?: string
  searchTerm?: string
  onSearchChange?: (value: string) => void
}

export default function TopBar({
  unreadNotifications,
  userName,
  userEmail,
  searchTerm = '',
  onSearchChange,
}: Props) {
  const [openMenu, setOpenMenu] = useState<'notifications' | 'settings' | 'profile' | null>(null)
  const [user, setUser] = useState<{ nome: string; email: string } | null>(null)
  const [notifications, setNotifications] = useState<Array<{ id?: number; titulo?: string; mensagem?: string }>>([])
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement | null>(null)

  const pageTitle = useMemo(() => {
    if (!location.pathname.startsWith('/dashboard')) return 'Dashboard'

    const section = location.pathname.split('/')[2] || 'home'
    const titleMap: Record<string, string> = {
      home: 'Home',
      perfil: 'Meu perfil',
      cartoes: 'Cartões',
      'registrar-pontos': 'Registrar pontos',
      notificacoes: 'Notificações',
      movimentacoes: 'Movimentações',
      relatorios: 'Relatórios',
      configuracoes: 'Configurações',
    }

    return titleMap[section] ?? 'Dashboard'
  }, [location.pathname])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!containerRef.current || !target) return
      if (!containerRef.current.contains(target)) {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [])

  useEffect(() => {
    let isActive = true
    let objectUrl: string | null = null

    const loadData = async () => {
      try {
        const [userData, notificationData, photoBlob] = await Promise.all([
          usuarioService.getMe(),
          notificacaoService.list<Array<{ id?: number; titulo?: string; mensagem?: string }>>(),
          usuarioService.getFoto(),
        ])

        if (!isActive) return

        setUser({ nome: userData.nome, email: userData.email })

        if (Array.isArray(notificationData)) {
          setNotifications(notificationData)
        }

        if (photoBlob) {
          objectUrl = URL.createObjectURL(photoBlob)
          setUserPhotoUrl(objectUrl)
        }
      } catch {
        // Silencioso: falhas de rede não devem quebrar a TopBar
      }
    }

    loadData()

    return () => {
      isActive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [])

  const displayName = userName ?? user?.nome ?? 'Usuário'
  const displayEmail = userEmail ?? user?.email ?? ''
  const unreadCount = unreadNotifications ?? notifications.length
  const recentNotifications = notifications.slice(0, 3)

  return (
    <div
      ref={containerRef}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-bg-secondary/60 px-5 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
    >
      <div className="min-w-[120px] text-sm font-semibold uppercase tracking-[0.2em] text-fg-secondary">
        {pageTitle}
      </div>

      <div className="flex flex-1 justify-center">
        <label className="relative w-full max-w-md">
          <span className="sr-only">Pesquisar no dashboard</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Pesquisar cartões, saldos e gráficos..."
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-fg-primary placeholder:text-fg-secondary focus:outline-none focus:ring-2 focus:ring-accent-pool/40"
          />
        </label>
      </div>

      <div className="relative flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((prev) => (prev === 'notifications' ? null : 'notifications'))}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-fg-primary hover:bg-white/10"
            aria-label="Notificações"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-pool px-1 text-[10px] font-bold text-bg-primary">
                {unreadCount}
              </span>
            ) : null}
          </button>
          {openMenu === 'notifications' ? (
            <div className="absolute right-0 top-12 w-64 rounded-2xl border border-white/10 bg-bg-secondary p-4 text-sm text-fg-primary shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-fg-secondary">
                Últimas notificações
              </p>
              {recentNotifications.length ? (
                <ul className="space-y-2 text-xs text-fg-secondary">
                  {recentNotifications.map((item) => (
                    <li key={item.id ?? item.titulo ?? item.mensagem}>• {item.titulo ?? item.mensagem}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-fg-secondary">Nenhuma notificação recente.</p>
              )}
              <NavLink
                to="/dashboard/notificacoes"
                className="mt-3 inline-flex text-xs font-semibold text-accent-pool hover:underline"
              >
                Ver todas
              </NavLink>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <NavLink
            to="/dashboard/configuracoes"
            onClick={(e) => {
              e.preventDefault()
              setOpenMenu((prev) => (prev === 'settings' ? null : 'settings'))
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-fg-primary hover:bg-white/10"
            aria-label="Configurações"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 6.93l1.41-1.41 2.12 1.22a7.96 7.96 0 016.08 0l2.12-1.22 1.41 1.41-1.22 2.12a7.96 7.96 0 010 6.08l1.22 2.12-1.41 1.41-2.12-1.22a7.96 7.96 0 01-6.08 0l-2.12 1.22-1.41-1.41 1.22-2.12a7.96 7.96 0 010-6.08z" />
            </svg>
          </NavLink>
          {openMenu === 'settings' ? (
            <div className="absolute right-0 top-12 w-60 rounded-2xl border border-white/10 bg-bg-secondary p-4 text-sm text-fg-primary shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-fg-secondary">
                Atalhos de configuração
              </p>
              <ul className="space-y-2 text-xs text-fg-secondary">
                <li>• Preferências do painel</li>
                <li>• Segurança da conta</li>
                <li>• Integrações</li>
              </ul>
              <NavLink
                to="/dashboard/configuracoes"
                className="mt-3 inline-flex text-xs font-semibold text-accent-pool hover:underline"
              >
                Ir para configurações
              </NavLink>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-fg-primary hover:bg-white/10"
          aria-label="Alternar tema"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20v2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 4.93l1.41 1.41" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.66 17.66l1.41 1.41" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12h2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 19.07l1.41-1.41" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.66 6.34l1.41-1.41" />
          </svg>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((prev) => (prev === 'profile' ? null : 'profile'))}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5"
            aria-label="Perfil do usuário"
          >
            <img
              src={userPhotoUrl ?? 'https://i.pravatar.cc/64?img=15'}
              alt="Foto do usuário"
              className="h-full w-full object-cover"
            />
          </button>
          {openMenu === 'profile' ? (
            <div className="absolute right-0 top-12 w-64 rounded-2xl border border-white/10 bg-bg-secondary p-4 text-sm text-fg-primary shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-fg-primary">{displayName}</p>
                <p className="text-xs text-fg-secondary">{displayEmail}</p>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <NavLink
                  to="/dashboard/perfil"
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-fg-primary hover:bg-white/10"
                >
                  Meu perfil
                  <span className="text-fg-secondary">›</span>
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/', { replace: true })
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-fg-primary hover:bg-white/10"
                >
                  Sair
                  <span className="text-fg-secondary">↩</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
