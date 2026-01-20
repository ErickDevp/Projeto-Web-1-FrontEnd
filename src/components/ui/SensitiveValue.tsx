import { usePreferences } from '../../hooks/usePreferences'

type SensitiveValueProps = {
    /** The actual value to display (or hide) */
    children: React.ReactNode
    /** Optional: custom placeholder when hidden (default: "••••••") */
    placeholder?: string
    /** Optional: additional CSS classes */
    className?: string
}

/**
 * SensitiveValue - Component to wrap monetary values and points
 * 
 * When the "hideValues" preference is enabled, this component
 * replaces the content with a placeholder (default: "••••••").
 * 
 * Usage:
 * ```tsx
 * <SensitiveValue>1.234.567</SensitiveValue>
 * <SensitiveValue placeholder="R$ ****">R$ 1.234,00</SensitiveValue>
 * ```
 */
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
