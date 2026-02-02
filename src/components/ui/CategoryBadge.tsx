type CategoryType = 'AEREA' | 'BANCO' | 'FINANCEIRO' | 'FINANCEIRA' | 'VAREJO' | 'OUTRO' | string

type CategoryConfig = {
    label: string
    bg: string
    text: string
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
    AEREA: {
        label: 'Aérea',
        bg: 'bg-sky-500/10',
        text: 'text-sky-400',
    },
    BANCO: {
        label: 'Banco',
        bg: 'bg-violet-500/10',
        text: 'text-violet-400',
    },
    FINANCEIRO: {
        label: 'Financeiro',
        bg: 'bg-violet-500/10',
        text: 'text-violet-400',
    },
    FINANCEIRA: {
        label: 'Financeira',
        bg: 'bg-violet-500/10',
        text: 'text-violet-400',
    },
    VAREJO: {
        label: 'Varejo',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
    },
    OUTRO: {
        label: 'Outro',
        bg: 'bg-white/5',
        text: 'text-fg-secondary',
    },
}

const DEFAULT_CATEGORY: CategoryConfig = {
    label: 'Outro',
    bg: 'bg-white/5',
    text: 'text-fg-secondary',
}

type CategoryBadgeProps = {
    /** Nome da categoria */
    category: CategoryType
    /** className opcional para estilização adicional */
    className?: string
}

export default function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
    const normalizedCategory = category?.toUpperCase() ?? ''
    const config = CATEGORY_CONFIG[normalizedCategory] ?? {
        ...DEFAULT_CATEGORY,
        label: category || 'Outro',
    }

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text} ${className}`}
        >
            {config.label}
        </span>
    )
}

export { CATEGORY_CONFIG }
export type { CategoryType }
