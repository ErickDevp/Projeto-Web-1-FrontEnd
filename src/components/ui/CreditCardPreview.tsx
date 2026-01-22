import visaLogo from '../../assets/brands/bandeiras/visa.svg'
import mastercardLogo from '../../assets/brands/bandeiras/mastercard.svg'
import amexLogo from '../../assets/brands/bandeiras/amex.svg'
import eloLogo from '../../assets/brands/bandeiras/elo.svg'
import hipercardLogo from '../../assets/brands/bandeiras/hipercard.svg'

export type CardVariant = 'black' | 'platinum' | 'gold' | 'silver' | 'mastercard' | 'elo' | 'hipercard'
export type CardSize = 'default' | 'mini'

interface CreditCardPreviewProps {
    holderName: string
    lastDigits: string
    cardType?: string // e.g. "Black", "Gold"
    cardTier?: string // e.g. "Infinite", "Platinum"
    variant?: CardVariant
    bandeira?: string // e.g. "VISA", "MASTERCARD"
    size?: CardSize
    className?: string
}

const variantStyles: Record<CardVariant, {
    card: string
    tierColor: string
    textPrimary: string
    textSecondary: string
    numberColor: string
    shadow: string
    isLight: boolean
    chipStyle: 'gold' | 'silver' | 'gold-bordered'
    hasShine: boolean
    logo: string
    logoClass: string
}> = {
    // Visa Black - Premium escuro neutro (Prata Fosco / Branco Gelo)
    black: {
        card: 'from-zinc-800 via-neutral-900 to-zinc-950',
        tierColor: 'text-amber-400',
        textPrimary: 'text-gray-200',
        textSecondary: 'text-gray-400',
        numberColor: 'text-gray-300/80',
        shadow: 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
        isLight: false,
        chipStyle: 'gold',
        hasShine: false,
        logo: visaLogo,
        logoClass: 'h-6 w-auto opacity-90',
    },
    // Generic Platinum - Gunmetal/Titânio (Branco + Ciano sutil)
    platinum: {
        card: 'from-slate-500 via-slate-600 to-slate-700',
        tierColor: 'text-cyan-300',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        numberColor: 'text-white/80',
        shadow: 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
        isLight: false,
        chipStyle: 'gold',
        hasShine: true,
        logo: visaLogo,
        logoClass: 'h-6 w-auto opacity-90',
    },
    // Amex Gold - Azul Marinho / Cinza Carvão para contraste elegante
    gold: {
        card: 'from-amber-500 via-yellow-600 to-amber-700',
        tierColor: 'text-blue-900',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-amber-900/70',
        numberColor: 'text-slate-700/90',
        shadow: 'drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]',
        isLight: true,
        chipStyle: 'gold-bordered',
        hasShine: true,
        logo: amexLogo,
        logoClass: 'h-8 w-auto',
    },
    // Generic Silver - Prata claro (texto escuro)
    silver: {
        card: 'from-gray-300 via-gray-400 to-gray-500',
        tierColor: 'text-gray-700',
        textPrimary: 'text-gray-800',
        textSecondary: 'text-gray-600',
        numberColor: 'text-gray-700/90',
        shadow: 'drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]',
        isLight: true,
        chipStyle: 'silver',
        hasShine: true,
        logo: visaLogo,
        logoClass: 'h-6 w-auto invert',
    },
    // Mastercard Platinum - Grafite escuro (Branco + Laranja Pálido)
    mastercard: {
        card: 'from-gray-800 via-gray-900 to-black',
        tierColor: 'text-orange-400',
        textPrimary: 'text-white',
        textSecondary: 'text-orange-200/60',
        numberColor: 'text-white/80',
        shadow: 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
        isLight: false,
        chipStyle: 'gold',
        hasShine: false,
        logo: mastercardLogo,
        logoClass: 'h-8 w-auto',
    },
    // Hipercard - Vermelho Rubi (Branco / Prata metálico)
    hipercard: {
        card: 'from-red-600 via-rose-700 to-red-800',
        tierColor: 'text-red-100',
        textPrimary: 'text-white',
        textSecondary: 'text-red-200/70',
        numberColor: 'text-white/85',
        shadow: 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
        isLight: false,
        chipStyle: 'gold',
        hasShine: false,
        logo: hipercardLogo,
        logoClass: 'h-6 w-auto',
    },
    // Elo - Prata com azul (Preto / Azul Petróleo escuro)
    elo: {
        card: 'from-slate-200 via-blue-100 to-slate-300',
        tierColor: 'text-blue-700',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-blue-800/60',
        numberColor: 'text-slate-700/90',
        shadow: 'drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]',
        isLight: true,
        chipStyle: 'silver',
        hasShine: true,
        logo: eloLogo,
        logoClass: 'h-7 w-auto',
    },
}

// Chip component with color and size variants
function CardChip({ style, size = 'default' }: { style: 'gold' | 'silver' | 'gold-bordered'; size?: CardSize }) {
    const isMini = size === 'mini'
    const baseClasses = isMini
        ? 'h-4 w-6 rounded-sm shadow-inner'
        : 'h-8 w-11 rounded shadow-inner'
    const gridClasses = isMini ? 'p-0.5 gap-[1px]' : 'p-1 gap-px'

    if (style === 'silver') {
        return (
            <div className={`${baseClasses} bg-gradient-to-br from-slate-300 via-gray-400 to-slate-500`}>
                <div className={`grid h-full grid-cols-3 ${gridClasses}`}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-sm bg-slate-600/40" />
                    ))}
                </div>
            </div>
        )
    }

    if (style === 'gold-bordered') {
        return (
            <div className={`${baseClasses} bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 ring-1 ring-amber-900/30`}>
                <div className={`grid h-full grid-cols-3 ${gridClasses}`}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-sm bg-amber-700/40" />
                    ))}
                </div>
            </div>
        )
    }

    // Default gold
    return (
        <div className={`${baseClasses} bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600`}>
            <div className={`grid h-full grid-cols-3 ${gridClasses}`}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-sm bg-amber-700/40" />
                ))}
            </div>
        </div>
    )
}

export default function CreditCardPreview({
    holderName = 'SEU NOME',
    lastDigits = '1234',
    cardTier = 'INFINITE',
    variant = 'black',
    size = 'default',
    className = '',
}: CreditCardPreviewProps) {
    const styles = variantStyles[variant]
    const isMini = size === 'mini'

    // Mini card - compact version for dashboards
    if (isMini) {
        return (
            <div
                className={`relative h-20 w-full overflow-hidden rounded-lg bg-gradient-to-br ${styles.card} p-2.5 shadow-md ${className}`}
            >
                {/* Card holographic stripe */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent ${styles.isLight ? 'via-black/10' : 'via-white/20'} to-transparent`} />

                {/* Header: Chip + Brand Logo */}
                <div className="flex items-center justify-between">
                    <CardChip style={styles.chipStyle} size="mini" />
                    <img
                        src={styles.logo}
                        alt="Card Brand"
                        className="h-4 w-auto opacity-90"
                    />
                </div>

                {/* Card footer - name and last digits */}
                <div className="mt-2 flex items-end justify-between">
                    <p className={`text-[10px] font-medium ${styles.textPrimary} truncate max-w-[60%] ${styles.shadow}`}>{holderName}</p>
                    <span className={`font-mono text-[11px] ${styles.numberColor}`}>•••• {lastDigits}</span>
                </div>
            </div>
        )
    }

    // Default full size card
    return (
        <div
            className={`relative h-44 w-full overflow-hidden rounded-xl bg-gradient-to-br ${styles.card} p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${className}`}
        >
            {/* Animated shine effect for metallic cards - Only visible on hover */}
            {styles.hasShine && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute -inset-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                </div>
            )}

            {/* Card holographic stripe */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent ${styles.isLight ? 'via-black/10' : 'via-white/20'} to-transparent`} />

            {/* Header: Chip + Brand Logo */}
            <div className="flex items-start justify-between">
                <CardChip style={styles.chipStyle} />
                <img
                    src={styles.logo}
                    alt="Card Brand"
                    className={styles.logoClass}
                />
            </div>

            {/* Card number - Monospace font for realism */}
            <div className={`mt-4 flex gap-3 font-mono text-lg font-medium tracking-widest ${styles.numberColor} ${styles.shadow}`}>
                <span>••••</span>
                <span>••••</span>
                <span>••••</span>
                <span>{lastDigits}</span>
            </div>

            {/* Card footer */}
            <div className="mt-4 flex items-end justify-between">
                <div>
                    <p className={`text-[10px] uppercase tracking-wider ${styles.textSecondary}`}>Titular</p>
                    <p className={`text-sm font-medium ${styles.textPrimary} ${styles.shadow}`}>{holderName}</p>
                </div>
                <div className="text-right">
                    <p className={`text-xs font-semibold tracking-wide ${styles.tierColor} ${styles.shadow}`}>{cardTier}</p>
                </div>
            </div>
        </div>
    )
}

