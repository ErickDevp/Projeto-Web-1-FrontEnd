

interface ToggleProps {
    enabled: boolean
    onToggle: () => void
    label: string
    description?: string
}

export function Toggle({ enabled, onToggle, label, description }: ToggleProps) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex-1">
                <span className="text-sm font-medium text-fg-primary">{label}</span>
                {description && (
                    <p className="mt-0.5 text-xs text-fg-secondary">{description}</p>
                )}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent-pool/50 ${enabled ? 'bg-gradient-to-r from-accent-sky to-accent-pool' : 'bg-white/10'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    )
}
