import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon = <Inbox size={48} className="text-text-tertiary" />,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px]", className)}>
      <div className="mb-4 bg-black/5 dark:bg-white/5 rounded-full p-6">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-text-secondary max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
