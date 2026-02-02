import type { ReactNode } from 'react'

type PageHeaderProps = {
    /** Título principal da página */
    title: string
    /** Descrição opcional abaixo do título */
    description?: string
    /** Botões de ação ou outros elementos à direita */
    children?: ReactNode
}

/**
 * Componente de cabeçalho de página reutilizável.
 * Mantém o layout padrão: título + descrição à esquerda, ações à direita.
 */
export default function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="titulo-grafico text-2xl font-bold">{title}</h1>
                {description && (
                    <p className="mt-1 text-sm text-fg-secondary">{description}</p>
                )}
            </div>
            {children}
        </header>
    )
}
