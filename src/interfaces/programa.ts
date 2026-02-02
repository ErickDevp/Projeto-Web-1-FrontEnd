import type { PromocaoProgramaResponseDTO } from './programaFidelidade'

export type Promocao = PromocaoProgramaResponseDTO

export type CategoriaPrograma = 'AEREA' | 'BANCO' | 'VAREJO' | 'FINANCEIRO' | 'OUTRO'

export type Programa = {
    id: number
    nome: string
    descricao: string
    categoria?: CategoriaPrograma
    url?: string
    promocoes?: Promocao[] | null
}

export type SaldoPrograma = {
    id?: number
    pontos?: number
    programaId?: number
    programa?: Programa
    cartao?: {
        id?: number
        nome?: string
    }
}

export type ViewMode = 'all' | 'mine'

export type ProgramCardProps = {
    programa: Programa
    mode: ViewMode
    saldo?: number
    cartaoNome?: string | null
    isAdmin?: boolean
    onEdit?: (programa: Programa) => void
    onDelete?: (id: number) => void
}

export type ProgramFormModalProps = {
    isOpen: boolean
    mode: 'create' | 'edit'
    programa?: Programa | null
    onClose: () => void
    onSubmit: (data: { nome: string; descricao: string; categoria?: CategoriaPrograma }) => Promise<void>
    loading: boolean
}

export type DeleteConfirmModalProps = {
    isOpen: boolean
    programa: Programa | null
    onClose: () => void
    onConfirm: (id: number) => Promise<void>
    loading: boolean
}
