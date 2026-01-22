type TabButtonProps = {
    active: boolean
    onClick: () => void
    children: React.ReactNode
    count?: number
}

export default function TabButton({ active, onClick, children, count }: TabButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${active
                ? 'bg-gradient-to-r from-accent-sky/10 to-accent-pool/10 text-accent-pool border border-accent-pool/30'
                : 'text-fg-secondary hover:text-fg-primary hover:bg-white/5'
                }`}
        >
            {children}
            {count !== undefined && (
                <span
                    className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${active ? 'bg-accent-pool/20 text-accent-pool' : 'bg-white/10 text-fg-secondary'
                        }`}
                >
                    {count}
                </span>
            )}
        </button>
    )
}
