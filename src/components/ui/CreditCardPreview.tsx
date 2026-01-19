type CardVariant = 'black' | 'platinum' | 'gold' | 'silver'

export type CreditCardPreviewProps = {
    /** Card holder name displayed on the card */
    holderName?: string
    /** Last 4 digits of card number */
    lastDigits?: string
    /** Card type label (e.g., "Black", "Platinum") */
    cardType?: string
    /** Card tier label (e.g., "INFINITE", "SIGNATURE") */
    cardTier?: string
    /** Visual variant of the card */
    variant?: CardVariant
    /** Custom class for the container */
    className?: string
}

const variantStyles: Record<CardVariant, {
    card: string
    tierColor: string
}> = {
    black: {
        card: 'from-zinc-800 via-neutral-900 to-zinc-950',
        tierColor: 'text-amber-400/90',
    },
    platinum: {
        card: 'from-slate-400 via-slate-500 to-slate-600',
        tierColor: 'text-slate-200',
    },
    gold: {
        card: 'from-amber-600 via-yellow-700 to-amber-800',
        tierColor: 'text-yellow-300',
    },
    silver: {
        card: 'from-gray-400 via-gray-500 to-gray-600',
        tierColor: 'text-gray-200',
    },
}

export default function CreditCardPreview({
    holderName = 'SEU NOME',
    lastDigits = '1234',
    cardType = 'Black',
    cardTier = 'INFINITE',
    variant = 'black',
    className = '',
}: CreditCardPreviewProps) {
    const styles = variantStyles[variant]

    return (
        <div
            className={`relative h-44 w-full overflow-hidden rounded-xl bg-gradient-to-br ${styles.card} p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${className}`}
        >
            {/* Card holographic stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Card chip */}
            <div className="h-8 w-11 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-inner">
                <div className="grid h-full grid-cols-3 gap-px p-1">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-sm bg-amber-700/40" />
                    ))}
                </div>
            </div>

            {/* Card number placeholder */}
            <div className="mt-4 flex gap-3 text-lg font-medium tracking-widest text-white/70">
                <span>••••</span>
                <span>••••</span>
                <span>••••</span>
                <span>{lastDigits}</span>
            </div>

            {/* Card footer */}
            <div className="mt-4 flex items-end justify-between">
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/40">Titular</p>
                    <p className="text-sm font-medium text-white/80">{holderName}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">{cardType}</p>
                    <p className={`text-xs font-semibold tracking-wide ${styles.tierColor}`}>{cardTier}</p>
                </div>
            </div>
        </div>
    )
}
