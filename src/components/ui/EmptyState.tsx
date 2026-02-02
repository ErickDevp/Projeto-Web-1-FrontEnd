import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const hasGap = className.includes('gap-')
  const iconClassName = `rounded-full bg-white/5 p-6${hasGap ? '' : ' mb-4'}`
  const descriptionClassName = `text-sm text-fg-secondary${title ? ' mt-1' : ''}`

  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`.trim()}>
      <div className={iconClassName}>{icon}</div>
      {title && <p className="text-fg-primary font-medium">{title}</p>}
      {description && <p className={descriptionClassName}>{description}</p>}
      {action}
    </div>
  )
}
