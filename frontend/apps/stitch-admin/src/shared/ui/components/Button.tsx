import { ButtonHTMLAttributes } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'liquid' | 'glass' | 'ghost'
}

export function Button({ variant = 'liquid', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'liquid-button': variant === 'liquid',
          'bg-surface-glass backdrop-blur-glass border border-border text-text-primary hover:bg-black/5 dark:hover:bg-white/5': variant === 'glass',
          'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5': variant === 'ghost',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
