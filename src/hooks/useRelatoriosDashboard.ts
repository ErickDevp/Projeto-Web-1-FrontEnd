import { useCallback, useEffect, useMemo, useState } from 'react'
import { relatorioService } from '../services/relatorio/relatorio.service'
import { notify } from '../utils/notify'
import type { RelatorioResponseDTO } from '../interfaces/relatorio'

export function useRelatoriosDashboard() {
    const [data, setData] = useState<RelatorioResponseDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [exportingPdf, setExportingPdf] = useState(false)
    const [exportingCsv, setExportingCsv] = useState(false)

    // Load data
    useEffect(() => {
        let isActive = true

        const loadData = async () => {
            try {
                const response = await relatorioService.get()
                if (isActive) setData(response)
            } catch (error) {
                notify.apiError(error, { fallback: 'Não foi possível carregar os relatórios.' })
            } finally {
                if (isActive) setLoading(false)
            }
        }

        loadData()
        return () => { isActive = false }
    }, [])

    // Export PDF
    const handleExportPdf = useCallback(async () => {
        setExportingPdf(true)
        try {
            const buffer = await relatorioService.exportPdf()
            const blob = new Blob([buffer], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
            a.download = `relatorio-pontos-${date}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            notify.success('PDF baixado com sucesso!')
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível exportar o PDF.' })
        } finally {
            setExportingPdf(false)
        }
    }, [])

    // Export CSV
    const handleExportCsv = useCallback(async () => {
        setExportingCsv(true)
        try {
            const buffer = await relatorioService.exportCsv()
            const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
            a.download = `relatorio-pontos-${date}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            notify.success('CSV baixado com sucesso!')
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível exportar o CSV.' })
        } finally {
            setExportingCsv(false)
        }
    }, [])

    // Summary stats
    const stats = useMemo(() => {
        if (!data) return null

        // Basic stats
        const totalPoints = data.saldoGlobal ?? 0
        const totalCards = data.pontosPorCartao?.length ?? 0
        const totalMovements = data.historico?.length ?? 0

        // Advanced metrics
        // Entradas/Saidas
        // Entradas: Filtrar apenas o que já foi CREDITADO
        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()

        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const prevMonth = prevDate.getMonth() + 1
        const prevYear = prevDate.getFullYear()

        // Entradas: Filtrar apenas o que já foi CREDITADO e do Mês Atual
        const entradasMes = data.historico?.filter(h => {
            const d = new Date(h.data)
            return h.pontosCalculados > 0 &&
                h.status === 'CREDITADO' &&
                (d.getMonth() + 1) === currentMonth &&
                d.getFullYear() === currentYear
        }) ?? []

        const totalEntradasMes = entradasMes.reduce((acc, h) => acc + h.pontosCalculados, 0)

        // Saídas: Filtrar apenas o que já foi processado/creditado e do Mês Atual
        const saidasMes = data.historico?.filter(h => {
            const d = new Date(h.data)
            return h.pontosCalculados < 0 &&
                h.status === 'CREDITADO' &&
                (d.getMonth() + 1) === currentMonth &&
                d.getFullYear() === currentYear
        }) ?? []

        const totalSaidasMes = Math.abs(saidasMes.reduce((acc, h) => acc + h.pontosCalculados, 0))

        const saldoLiquido = totalEntradasMes - totalSaidasMes

        // Previous Month Balance for Comparison
        const prevEntradas = data.historico?.filter(h => {
            const d = new Date(h.data)
            return h.pontosCalculados > 0 &&
                h.status === 'CREDITADO' &&
                (d.getMonth() + 1) === prevMonth &&
                d.getFullYear() === prevYear
        }) ?? []
        const totalPrevEntradas = prevEntradas.reduce((acc, h) => acc + h.pontosCalculados, 0)

        const prevSaidas = data.historico?.filter(h => {
            const d = new Date(h.data)
            return h.pontosCalculados < 0 &&
                h.status === 'CREDITADO' &&
                (d.getMonth() + 1) === prevMonth &&
                d.getFullYear() === prevYear
        }) ?? []
        const totalPrevSaidas = Math.abs(prevSaidas.reduce((acc, h) => acc + h.pontosCalculados, 0))

        const prevBalance = totalPrevEntradas - totalPrevSaidas

        // Growth Rate (Net Flow Variation vs Prev Month)
        let growthRate = 0
        if (prevBalance === 0) {
            growthRate = saldoLiquido !== 0 ? 100 : 0
        } else {
            growthRate = ((saldoLiquido - prevBalance) / Math.abs(prevBalance)) * 100
        }

        // Create safe fallback
        if (!isFinite(growthRate) || isNaN(growthRate)) {
            growthRate = 0
        }

        // Top Programs (All Time - filtered by CREDITADO for consistency with general logic)
        const entradasGeral = data.historico?.filter(h =>
            h.pontosCalculados > 0 && h.status === 'CREDITADO'
        ) ?? []
        const totalEntradasGeral = entradasGeral.reduce((acc, h) => acc + h.pontosCalculados, 0)

        const programMap = new Map<string, number>()
        entradasGeral.forEach(h => {
            const current = programMap.get(h.programa) || 0
            programMap.set(h.programa, current + h.pontosCalculados)
        })

        const topPrograms = Array.from(programMap.entries())
            .map(([name, points]) => ({ name, points, percent: totalEntradasGeral > 0 ? (points / totalEntradasGeral) * 100 : 0 }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 3)

        const mediaPorMovimentacao = totalMovements > 0 ? Math.round(totalEntradasGeral / totalMovements) : 0

        return {
            totalPoints,
            totalCards,
            totalMovements,
            mediaPorMovimentacao,
            totalEntradas: totalEntradasMes, // Export specific to monthly balance card
            totalSaidas: totalSaidasMes,     // Export specific to monthly balance card
            saldoLiquido,
            growthRate,
            topPrograms
        }
    }, [data])

    return {
        data,
        loading,
        stats,
        exportingPdf,
        exportingCsv,
        handleExportPdf,
        handleExportCsv
    }
}
