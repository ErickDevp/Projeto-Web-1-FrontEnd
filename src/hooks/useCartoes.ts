import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { CartaoRequestDTO, CartaoResponseDTO } from '../interfaces/cartaoUsuario'
import type { ProgramaResponseDTO } from '../interfaces/programaFidelidade'
import { cartaoUsuarioService } from '../services/cartaoUsuario/cartaoUsuario.service'
import { programaFidelidadeService } from '../services/programaFidelidade/programaFidelidade.service'
import { notify } from '../utils/notify'

export interface UseCartoesResult {
    cards: CartaoResponseDTO[]
    programas: ProgramaResponseDTO[]
    loading: boolean
    isSaving: boolean
    isFormOpen: boolean
    editingCard: CartaoResponseDTO | null
    openNewForm: () => void
    openEditForm: (card: CartaoResponseDTO) => void
    closeForm: () => void
    saveCard: (card: CartaoRequestDTO) => Promise<void>
    deleteCard: (id: number) => Promise<void>
}

export function useCartoes(): UseCartoesResult {
    const location = useLocation()
    const navigate = useNavigate()
    const [cards, setCards] = useState<CartaoResponseDTO[]>([])
    const [programas, setProgramas] = useState<ProgramaResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setSaving] = useState(false)

    // Estado do Modal
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCard, setEditingCard] = useState<CartaoResponseDTO | null>(null)

    const loadData = useCallback(async () => {
        try {
            const [cardData, programaData] = await Promise.all([
                cartaoUsuarioService.list(),
                programaFidelidadeService.list(),
            ])
            setCards(Array.isArray(cardData) ? cardData : [])
            setProgramas(Array.isArray(programaData) ? programaData : [])
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível carregar os cartões.' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Lógica de "Deep Linking" para abrir edição via navegação
    useEffect(() => {
        const state = location.state as { editCardId?: number } | null
        if (state?.editCardId && cards.length > 0 && !loading) {
            const cardToEdit = cards.find((c) => c.id === state.editCardId)
            if (cardToEdit) {
                setEditingCard(cardToEdit)
                setIsFormOpen(true)
                navigate(location.pathname, { replace: true, state: {} })
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        }
    }, [location.state, cards, loading])

    const openNewForm = useCallback(() => {
        setEditingCard(null)
        setIsFormOpen(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const openEditForm = useCallback((card: CartaoResponseDTO) => {
        setEditingCard(card)
        setIsFormOpen(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const closeForm = useCallback(() => {
        setIsFormOpen(false)
        setEditingCard(null)
    }, [])

    const saveCard = useCallback(async (payload: CartaoRequestDTO) => {
        setSaving(true)
        try {
            if (editingCard?.id) {
                await cartaoUsuarioService.update(editingCard.id, payload)
                notify.success('Cartão atualizado com sucesso.')
            } else {
                await cartaoUsuarioService.create(payload)
                notify.success('Cartão cadastrado com sucesso.')
            }
            closeForm()
            await loadData()
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível salvar o cartão.' })
            throw error
        } finally {
            setSaving(false)
        }
    }, [editingCard, loadData, closeForm])

    const deleteCard = useCallback(async (id: number) => {
        try {
            await cartaoUsuarioService.remove(id)
            notify.success('Cartão excluído com sucesso.')
            await loadData()
        } catch (error) {
            notify.apiError(error, { fallback: 'Não foi possível excluir o cartão.' })
            throw error
        }
    }, [loadData])

    return {
        cards,
        programas,
        loading,
        isSaving,
        isFormOpen,
        editingCard,
        openNewForm,
        openEditForm,
        closeForm,
        saveCard,
        deleteCard,
    }
}
