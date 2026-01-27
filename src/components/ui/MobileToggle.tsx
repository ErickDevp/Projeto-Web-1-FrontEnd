type MobileToggleProps = {
    isOpen: boolean
    onToggle: () => void
}

export function MobileToggle({ isOpen, onToggle }: MobileToggleProps) {
    return (
        <div className="md:hidden fixed z-[60] top-4 left-4">
            <button
                onClick={onToggle}
                className="p-2 rounded-xl bg-bg-secondary/80 backdrop-blur-md border border-white/10 shadow-lg text-fg-primary"
            >
                {isOpen ? (
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
    )
}
