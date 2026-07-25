import { HTMLAttributes } from 'react'
import { cn } from './Button'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline'
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        {
          'border-transparent bg-brand-500 text-white shadow hover:bg-brand-600': variant === 'default',
          'border-transparent bg-green-500/10 text-green-700 dark:text-green-400': variant === 'success',
          'border-transparent bg-yellow-500/10 text-yellow-700 dark:text-yellow-400': variant === 'warning',
          'border-transparent bg-red-500/10 text-red-700 dark:text-red-400': variant === 'destructive',
          'text-text-primary': variant === 'outline',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
