import esferaLogo from '../assets/brands/programas/esfera.svg'
import latamLogo from '../assets/brands/programas/latam.svg'
import liveloLogo from '../assets/brands/programas/livelo.svg'
import type { CategoryType } from '../components/ui/CategoryBadge'

export type BrandConfig = {
    gradient: string
    textColor: string
    bgColor: string
}

export function getBrandConfig(nome: string): BrandConfig {
    const lower = nome.toLowerCase()
    if (lower.includes('livelo')) return { gradient: 'from-pink-500 to-purple-600', textColor: 'text-pink-400', bgColor: 'bg-pink-500/20' }
    if (lower.includes('smiles')) return { gradient: 'from-orange-500 to-amber-500', textColor: 'text-orange-400', bgColor: 'bg-orange-500/20' }
    if (lower.includes('latam')) return { gradient: 'from-red-500 to-blue-600', textColor: 'text-red-400', bgColor: 'bg-red-500/20' }
    if (lower.includes('azul') || lower.includes('tudoazul')) return { gradient: 'from-blue-500 to-cyan-500', textColor: 'text-blue-400', bgColor: 'bg-blue-500/20' }
    if (lower.includes('esfera')) return { gradient: 'from-emerald-500 to-green-500', textColor: 'text-emerald-400', bgColor: 'bg-emerald-500/20' }
    if (lower.includes('multiplus') || lower.includes('pontos')) return { gradient: 'from-violet-500 to-indigo-600', textColor: 'text-violet-400', bgColor: 'bg-violet-500/20' }
    // Default
    return { gradient: 'from-accent-sky to-accent-pool', textColor: 'text-accent-pool', bgColor: 'bg-accent-pool/20' }
}

const PROGRAM_LOGOS: Record<string, string> = {
    livelo: liveloLogo,
    latam: latamLogo,
    esfera: esferaLogo,
}

export function getProgramLogo(nome: string): string | null {
    const lower = nome.toLowerCase().replace(/\s/g, '')
    for (const [key, logo] of Object.entries(PROGRAM_LOGOS)) {
        if (lower.includes(key)) return logo
    }
    return null
}


const AEREA_KEYWORDS = ['smiles', 'latam', 'azul', 'tudoazul', 'tap', 'miles', 'gol', 'avianca']
const BANCO_KEYWORDS = ['livelo', 'esfera', 'iupp', 'átomos', 'curtaí', 'c6', 'inter', 'nubank', 'itaú', 'bradesco']


export function inferCategory(nome: string, currentCategory?: string): CategoryType | null {
    const lower = nome.toLowerCase()

    // Check known program keywords
    if (AEREA_KEYWORDS.some(kw => lower.includes(kw))) return 'AEREA'
    if (BANCO_KEYWORDS.some(kw => lower.includes(kw))) return 'BANCO'

    // Return current category if it's not "Outro" or empty
    if (currentCategory && currentCategory !== 'Outro' && currentCategory.trim() !== '') {
        return currentCategory as CategoryType
    }

    return null
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}
