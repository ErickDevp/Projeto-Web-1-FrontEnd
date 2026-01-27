import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../constants/navigation'
import logoUrl from '../../assets/logo/logo.png'
import { SidebarNavItem } from './SidebarNavItem'

type SidebarProps = {
    mobileMenuOpen: boolean
    onNavigate: () => void
    onLogout: () => void
}

export function Sidebar({ mobileMenuOpen, onNavigate, onLogout }: SidebarProps) {
    return (
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
                <NavLink to="/dashboard/home" onClick={onNavigate} className="flex items-center justify-center">
                    <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-16 w-16 md:h-14 md:w-14 object-contain filter drop-shadow-[0_0_0.9375rem_rgba(73,197,182,0.3)] transition-all hover:scale-105"
                    />
                </NavLink>
            </div>

            <nav className="flex w-full flex-1 flex-col items-center gap-2 px-4 md:px-2 overflow-y-auto custom-scrollbar">
                {NAV_ITEMS.map((item) => (
                    <SidebarNavItem key={item.to} item={item} onNavigate={onNavigate} />
                ))}
            </nav>

            <div className="w-full px-4 md:px-2 pb-6 pt-2">
                <button
                    type="button"
                    onClick={onLogout}
                    className="group relative w-full overflow-hidden rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 md:px-2 md:py-2 text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:shadow-[0_0_1.25rem_rgba(239,68,68,0.15)] flex items-center md:flex-col justify-center gap-3 md:gap-1"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5 transition-transform group-hover:-translate-x-1 md:group-hover:translate-x-0 md:group-hover:translate-y-0.5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
                    </svg>
                    <span className="text-sm md:text-[0.5625rem] font-bold uppercase tracking-wider">Sair</span>
                </button>
            </div>
        </aside>
    )
}
