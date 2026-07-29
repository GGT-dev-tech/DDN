import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'
import { cn } from './Button'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  side?: 'left' | 'right'
}

export function Drawer({ isOpen, onClose, title, children, side = 'right' }: DrawerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Drawer Panel */}
      <div
        className={cn(
          'relative w-full max-w-md bg-background-primary shadow-xl transition-transform duration-300 flex flex-col',
          side === 'right' ? 'ml-auto' : 'mr-auto',
          // Note: In a real app we'd use robust animation classes (e.g. framer-motion or tailwind-animate)
          // For simplicity here, we assume it's mounted/unmounted, though slide animations would require delay before unmount
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <Button variant="ghost" onClick={onClose} className="p-2 h-auto w-auto rounded-full">
              <X size={20} />
            </Button>
          </div>
        )}
        <div className="overflow-y-auto p-6 flex-1 text-text-primary">
          {children}
        </div>
      </div>
    </div>
  )
}
