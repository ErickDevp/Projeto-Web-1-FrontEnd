import { NavLink } from 'react-router-dom'
import type { NavItem } from '../../constants/navigation'

type SidebarNavItemProps = {
    item: NavItem
    onNavigate: () => void
}

export function SidebarNavItem({ item, onNavigate }: SidebarNavItemProps) {
    return (
        <NavLink
            to={item.to}
            onClick={onNavigate}
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
            {/* Faixa Indicadora Ativa */}
            {({ isActive }) => (
                <>
                    <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-accent-pool transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                    <div className="relative z-10 transition-transform duration-300 group-hover:scale-110 md:group-hover:translate-y-[-0.125rem]">
                        {item.icon}
                    </div>
                    <span className="relative z-10 font-medium md:text-center leading-tight truncate w-full md:w-auto">
                        {item.label}
                    </span>
                </>
            )}
        </NavLink>
    )
}
