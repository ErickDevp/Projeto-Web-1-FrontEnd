import visaLogo from '../../assets/brands/bandeiras/visa.svg'
import mastercardLogo from '../../assets/brands/bandeiras/mastercard.svg'
import amexLogo from '../../assets/brands/bandeiras/amex.svg'
import eloLogo from '../../assets/brands/bandeiras/elo.svg'
import hipercardLogo from '../../assets/brands/bandeiras/hipercard.svg'

// Constants
export const chartWidth = 240
export const chartHeight = 80

// Helpers
export const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return Number(value.replace(',', '.'))
    return 0
}

export const buildLinePoints = (values: number[]): string => {
    if (!values.length) return ''
    const maxValue = Math.max(...values, 1)
    const step = values.length > 1 ? chartWidth / (values.length - 1) : chartWidth
    return values
        .map((value, index) => {
            const x = Math.round(index * step)
            const y = Math.round(chartHeight - (value / maxValue) * (chartHeight - 18) - 6)
            return `${x},${y}`
        })
        .join(' ')
}

export const buildAreaPolygon = (values: number[]): string => {
    if (!values.length) return ''
    const points = buildLinePoints(values)
    return `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`
}

export const getBrandLogo = (bandeira?: string): string | null => {
    switch (bandeira) {
        case 'VISA': return visaLogo
        case 'MASTERCARD': return mastercardLogo
        case 'AMERICAN_EXPRESS': return amexLogo
        case 'ELO': return eloLogo
        case 'HIPERCARD': return hipercardLogo
        default: return null
    }
}
