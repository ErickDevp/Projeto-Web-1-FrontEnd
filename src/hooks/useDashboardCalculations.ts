import { useMemo } from 'react'
import type { RelatorioResponseDTO } from '../interfaces/relatorio'
import type { SaldoResponseDTO } from '../interfaces/saldoUsuarioPrograma'
import { toNumber } from '../pages/Dashboard/utils'

interface UseDashboardCalculationsProps {
    relatorio: RelatorioResponseDTO | null
    saldo: SaldoResponseDTO[]
}

export function useDashboardCalculations({ relatorio, saldo }: UseDashboardCalculationsProps) {
    const totalPoints = useMemo(() => {
        return toNumber(relatorio?.saldoGlobal ?? 0)
    }, [relatorio])

    const programSummary = useMemo(() => {
        return saldo.map((item) => ({
            label: item.programaId.nome,
            value: toNumber(item.pontos),
        }))
    }, [saldo])

    const pontosPorCartao = useMemo(() => {
        return relatorio?.pontosPorCartao ?? []
    }, [relatorio])

    const historico = useMemo(() => {
        return relatorio?.historico ?? []
    }, [relatorio])

    const monthlyPoints = useMemo(() => {
        const evolucao = relatorio?.evolucaoMensal ?? []
        const sorted = [...evolucao]
            .filter((item) => item.ano != null && item.mes != null)
            .sort((a, b) => {
                const aDate = new Date(a.ano, a.mes - 1, 1)
                const bDate = new Date(b.ano, b.mes - 1, 1)
                return aDate.getTime() - bDate.getTime()
            })
            .map((item) => {
                const date = new Date(item.ano, item.mes - 1, 1)
                return {
                    label: date.toLocaleDateString('pt-BR', { month: 'short' }),
                    value: toNumber(item.totalPontos),
                    date,
                }
            })

        return sorted.slice(-7)
    }, [relatorio])

    const historySeries = useMemo(() => {
        const sorted = [...historico]
            .filter((item) => !Number.isNaN(new Date(item.data).getTime()))
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

        return sorted.map((item) => ({
            label: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            value: toNumber(item.pontosCalculados),
        }))
    }, [historico])

    return {
        totalPoints,
        programSummary,
        pontosPorCartao,
        historico,
        monthlyPoints,
        historySeries,
    }
}
