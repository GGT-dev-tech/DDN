import { Loader2 } from 'lucide-react'
import { cn } from './Button'

interface SpinnerProps {
  className?: string
  size?: number
}

export function Spinner({ className, size = 24 }: SpinnerProps) {
  return (
    <Loader2 
      size={size} 
      className={cn('animate-spin text-brand-500', className)} 
    />
  )
}
