import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from './Button'
import { cn } from './Button'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Ocorreu um erro',
  message,
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-red-500/5 rounded-2xl border border-red-500/10 min-h-[200px]", className)}>
      <AlertTriangle size={40} className="text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-md mb-6">{message}</p>
      
      {onRetry && (
        <Button variant="liquid" onClick={onRetry} className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 ring-red-500">
          <RefreshCcw size={16} />
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
