import React from 'react'

interface ThemeCardProps {
    label: string
    icon: React.ReactNode
    isSelected: boolean
    onClick: () => void
    theme?: 'light' | 'dark' | 'system'
}

export function ThemeCard({ label, icon, isSelected, onClick }: ThemeCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-300 ${isSelected
                    ? 'border-accent-pool/50 bg-gradient-to-br from-accent-sky/10 to-accent-pool/10 shadow-lg shadow-accent-pool/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
        >
            <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${isSelected
                        ? 'bg-gradient-to-br from-accent-sky to-accent-pool text-white'
                        : 'bg-white/10 text-fg-secondary group-hover:text-fg-primary'
                    }`}
            >
                {icon}
            </div>
            <span
                className={`text-sm font-medium transition-colors ${isSelected ? 'text-accent-pool' : 'text-fg-secondary group-hover:text-fg-primary'
                    }`}
            >
                {label}
            </span>
            {isSelected && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-pool">
                    <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
            )}
        </button>
    )
}
