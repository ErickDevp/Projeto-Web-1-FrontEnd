/**
 * Funções de formatação centralizadas
 * Consolidado de: Movimentacoes.tsx, RegistrarPontos.tsx
 */

/**
 * Formata valor monetário em Real brasileiro
 */
export const formatCurrency = (value?: number): string => {
    if (value == null) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/**
 * Formata data para formato brasileiro (DD/MM/YYYY)
 */
export const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR')
}

/**
 * Formata número de pontos com separadores de milhar
 */
export const formatPoints = (value?: number): string => {
    if (value == null) return '-'
    return new Intl.NumberFormat('pt-BR').format(value)
}
