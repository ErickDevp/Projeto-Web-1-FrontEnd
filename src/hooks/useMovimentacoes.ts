import { useCallback, useEffect, useMemo, useState } from 'react'
import { cartaoUsuarioService } from '../services/cartaoUsuario/cartaoUsuario.service'
import { programaFidelidadeService } from '../services/programaFidelidade/programaFidelidade.service'
import { movimentacaoPontosService } from '../services/movimentacaoPontos/movimentacaoPontos.service'
import { relatorioService } from '../services/relatorio/relatorio.service'
import { notify } from '../utils/notify'
import type { ProgramaResponseDTO } from '../interfaces/programaFidelidade'
import type { MovimentacaoRequestDTO } from '../interfaces/movimentacaoPontos'
import type { ComprovanteResponseDTO } from '../interfaces/comprovante'
import type { StatusResponseDTO } from '../interfaces/statusMovimentacao'
import { endpoints } from '../services/endpoints'
import { getStatusString, STATUS_CONFIG } from '../components/ui/StatusBadge'

// Types
export type Cartao = {
    id?: number
    nome?: string
    bandeira?: string
}

export type Movimentacao = {
    id?: number
    movimentacaoId?: number
    cartaoId?: number
    cartaoNome?: string
    cartao?: { id?: number; nome?: string; bandeira?: string }
    programaId?: number
    programaNome?: string
    saldo?: { programa?: { id?: number; nome?: string } }
    valor?: number
    pontosCalculados?: number
    dataOcorrencia?: string
    data?: string
    status?: StatusResponseDTO | { status?: string } | string
    comprovantes?: ComprovanteResponseDTO[]
    comprovante?: { id?: number } | null  // Legacy support
}

export const getId = (item: Movimentacao) => item.id ?? item.movimentacaoId ?? 0

export const getStatus = (item: Movimentacao): string => {
    if (typeof item.status === 'string') return item.status
    if (item.status && typeof item.status === 'object' && 'status' in item.status) {
        return item.status.status ?? 'PENDENTE'
    }
    return 'PENDENTE'
}

export const getStatusMotivo = (item: Movimentacao): string | null => {
    if (typeof item.status === 'object' && item.status && 'motivo' in item.status) {
        return (item.status as StatusResponseDTO).motivo || null
    }
    return null
}

export const getComprovanteUrl = (item: Movimentacao): string | null => {
    // First try new array format
    if (item.comprovantes && item.comprovantes.length > 0) {
        return endpoints.comprovante.arquivo(item.comprovantes[0].id)
    }
    // Fallback to legacy single object format
    if (item.comprovante?.id) {
        return endpoints.comprovante.arquivo(item.comprovante.id)
    }
    return null
}

export const useMovimentacoes = () => {
    const [cards, setCards] = useState<Cartao[]>([])
    const [programas, setProgramas] = useState<ProgramaResponseDTO[]>([])
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
    const [saldoGlobal, setSaldoGlobal] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<{ cartaoId: string; programaId: string; valor: string }>({
        cartaoId: '',
        programaId: '',
        valor: '',
    })

    const loadData = useCallback(async () => {
        try {
            const [cardData, programaData, movData, relatorioData] = await Promise.all([
                cartaoUsuarioService.list(),
                programaFidelidadeService.list(),
                movimentacaoPontosService.list(),
                relatorioService.get(),
            ])

            setCards(Array.isArray(cardData) ? cardData.map(c => ({ id: c.id, nome: c.nome, bandeira: c.bandeira })) : [])
            setProgramas(Array.isArray(programaData) ? programaData.map(p => ({ id: p.id, nome: p.nome, descricao: p.descricao })) : [])
            setMovimentacoes(Array.isArray(movData) ? movData.map(m => ({
                id: m.id,
                cartaoId: m.cartaoId,
                cartaoNome: m.cartaoNome,
                programaId: m.programaId,
                programaNome: m.programaNome,
                valor: Number(m.valor),
                pontosCalculados: m.pontosCalculados,
                dataOcorrencia: m.dataOcorrencia,
                status: m.status,
                comprovantes: m.comprovantes,
            })) : [])
            setSaldoGlobal(relatorioData?.saldoGlobal ? Number(relatorioData.saldoGlobal) : 0)
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível carregar as movimentações.' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    const cardMap = useMemo(() => {
        const map = new Map<number, string>()
        cards.forEach((card) => {
            if (card.id) map.set(card.id, card.nome ?? `Cartão ${card.id}`)
        })
        return map
    }, [cards])

    const programMap = useMemo(() => {
        const map = new Map<number, string>()
        programas.forEach((programa) => map.set(programa.id, programa.nome))
        return map
    }, [programas])

    const startEdit = useCallback((item: Movimentacao) => {
        const id = getId(item)
        const cartaoId = item.cartaoId ?? item.cartao?.id ?? ''
        const programaId = item.programaId ?? item.saldo?.programa?.id ?? ''
        setEditingId(id)
        setForm({
            cartaoId: String(cartaoId),
            programaId: String(programaId),
            valor: item.valor ? String(item.valor) : '',
        })
    }, [])

    const cancelEdit = useCallback(() => {
        setEditingId(null)
        setForm({ cartaoId: '', programaId: '', valor: '' })
    }, [])

    const handleSave = useCallback(async () => {
        if (!editingId) return
        if (!form.cartaoId || !form.programaId || !form.valor) {
            notify.warn('Preencha todos os campos para salvar.')
            return
        }

        const payload: MovimentacaoRequestDTO = {
            cartaoId: Number(form.cartaoId),
            programaId: Number(form.programaId),
            valor: Number(form.valor),
            data: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        }

        try {
            await movimentacaoPontosService.update(editingId, payload)
            notify.success('Movimentação atualizada com sucesso.')
            setEditingId(null)
            await loadData()
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível atualizar a movimentação.' })
        }
    }, [editingId, form, loadData])

    const handleDelete = useCallback(async (item: Movimentacao) => {
        const id = getId(item)
        if (!id) return
        if (!confirm('Tem certeza que deseja excluir esta movimentação?')) return

        try {
            await movimentacaoPontosService.remove(id)
            notify.success('Movimentação removida.')
            await loadData()
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível remover a movimentação.' })
        }
    }, [loadData])

    const totalValor = useMemo(() => {
        return movimentacoes.reduce((sum, m) => sum + (Number(m.valor) || 0), 0)
    }, [movimentacoes])

    const statusCounts = useMemo(() => {
        const counts = {
            PENDENTE: 0,
            CREDITADO: 0,
            EXPIRADO: 0,
            CANCELADO: 0
        }
        movimentacoes.forEach(m => {
            const status = getStatus(m) as keyof typeof counts
            if (counts[status] !== undefined) {
                counts[status]++
            }
        })
        return counts
    }, [movimentacoes])

    return {
        cards,
        programas,
        movimentacoes,
        saldoGlobal,
        loading,
        editingId,
        form,
        setForm,
        cardMap,
        programMap,
        startEdit,
        cancelEdit,
        handleSave,
        handleDelete,
        totalValor,
        statusCounts
    }
}
