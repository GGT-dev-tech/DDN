import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './Button'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  glass?: boolean
}

export function Card({ children, glass = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-200',
        glass ? 'glass-panel' : 'bg-background-primary border border-border shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
