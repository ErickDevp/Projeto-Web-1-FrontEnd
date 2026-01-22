import type { PromocaoProgramaResponseDTO } from '../interfaces/programaFidelidade'

export type Promocao = PromocaoProgramaResponseDTO

export function formatPoints(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value)
}
export function getActivePromotions(promocoes?: Promocao[] | null): Promocao[] {
    if (!promocoes || !Array.isArray(promocoes)) return []
    return promocoes.filter(p => p.ativo === 'ATIVO')
}
export function isPromotionEndingSoon(promocao: Promocao): boolean {
    const endDate = new Date(promocao.dataFim)
    const today = new Date()
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0
}
export function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
