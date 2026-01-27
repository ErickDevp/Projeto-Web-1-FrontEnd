import { relatorioService } from '../services/relatorio/relatorio.service'
import { notify } from '../utils/notify'

export function useDashboardExport() {
    const handleDownload = async (type: 'pdf' | 'csv') => {
        try {
            const data = type === 'pdf' ? await relatorioService.exportPdf() : await relatorioService.exportCsv()
            const mimeType = type === 'pdf' ? 'application/pdf' : 'text/csv'
            const blob = new Blob([data], { type: mimeType })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `relatorio.${type}`
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(url)
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível baixar o relatório.' })
        }
    }

    return { handleDownload }
}
