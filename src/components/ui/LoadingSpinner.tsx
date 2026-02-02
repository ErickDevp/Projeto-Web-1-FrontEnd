type LoadingSpinnerProps = {
    /** Mensagem exibida ao lado do spinner */
    message?: string
    /** Tamanho do spinner */
    size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
}

/**
 * Componente de loading spinner reutilizável.
 * Mantém o mesmo visual usado nas páginas do dashboard.
 */
export default function LoadingSpinner({ message = 'Carregando...', size = 'md' }: LoadingSpinnerProps) {
    const spinnerSize = sizeClasses[size]

    return (
        <div className="flex items-center justify-center gap-4 py-12">
            <div className="relative">
                <div className={`${spinnerSize} rounded-full border-2 border-accent-pool/20`} />
                <div className={`absolute inset-0 ${spinnerSize} rounded-full border-2 border-transparent border-t-accent-pool animate-spin`} />
            </div>
            <span className="text-sm text-fg-secondary">{message}</span>
        </div>
    )
}
