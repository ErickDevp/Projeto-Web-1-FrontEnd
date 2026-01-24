import type { FC } from 'react'

interface DashboardHeaderProps {
    onExportCsv: () => void
    onExportPdf: () => void
}

export const DashboardHeader: FC<DashboardHeaderProps> = ({ onExportCsv, onExportPdf }) => {
    return (
        <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="titulo-grafico text-3xl font-bold">
                    Resumo geral
                </h1>
                <p className="mt-2 text-sm text-fg-secondary">
                    Acompanhe seus pontos e milhas em um só lugar.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onExportCsv}
                    className="btn-secondary group"
                >
                    <svg className="h-4 w-4 text-fg-secondary group-hover:text-accent-pool transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Exportar CSV
                </button>
                <button
                    type="button"
                    onClick={onExportPdf}
                    className="btn-primary group"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Exportar PDF
                </button>
            </div>
        </header>
    )
}
