import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from './Button'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options: { label: string; value: string | number }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-border bg-background-primary px-3 py-2 text-sm text-text-primary transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    )
  }
)
Select.displayName = 'Select'
