import { useState, useEffect } from 'react'
import { cartaoUsuarioService } from '../services/cartaoUsuario/cartaoUsuario.service'
import { relatorioService } from '../services/relatorio/relatorio.service'
import { saldoUsuarioProgramaService } from '../services/saldoUsuarioPrograma/saldoUsuarioPrograma.service'
import type { RelatorioResponseDTO } from '../interfaces/relatorio'
import type { SaldoResponseDTO } from '../interfaces/saldoUsuarioPrograma'
import type { CartaoResponseDTO } from '../interfaces/cartaoUsuario'
import { notify } from '../utils/notify'

export function useDashboardData() {
    const [cards, setCards] = useState<CartaoResponseDTO[]>([])
    const [saldo, setSaldo] = useState<SaldoResponseDTO[]>([])
    const [relatorio, setRelatorio] = useState<RelatorioResponseDTO | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isActive = true

        const loadData = async () => {
            try {
                const [cardsData, saldoData, relatorioData] = await Promise.all([
                    cartaoUsuarioService.list(),
                    saldoUsuarioProgramaService.list(),
                    relatorioService.get(),
                ])

                if (!isActive) return

                setCards(Array.isArray(cardsData) ? cardsData : [])
                setSaldo(Array.isArray(saldoData) ? saldoData : [])
                setRelatorio(relatorioData ?? null)
            } catch (error) {
                notify.apiError(error, { fallback: 'Não foi possível carregar os dados do dashboard.' })
            } finally {
                if (isActive) setLoading(false)
            }
        }

        loadData()

        return () => {
            isActive = false
        }
    }, [])

    return { cards, saldo, relatorio, loading }
}
