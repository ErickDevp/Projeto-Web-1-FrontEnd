import { usePreferences } from '../../hooks/usePreferences'

type SensitiveValueProps = {
    /** O valor real para exibir (ou ocultar) */
    children: React.ReactNode
    /** Opcional: placeholder personalizado quando oculto (padrão: "••••••") */
    placeholder?: string
    /** Opcional: classes CSS adicionais */
    className?: string
}


export default function SensitiveValue({
    children,
    placeholder = '••••••',
    className = '',
}: SensitiveValueProps) {
    const { preferences } = usePreferences()

    if (preferences.hideValues) {
        return (
            <span className={`select-none ${className}`} aria-label="Valor oculto">
                {placeholder}
            </span>
        )
    }

    return <>{children}</>
}
