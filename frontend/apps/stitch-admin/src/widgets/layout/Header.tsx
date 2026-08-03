import { useState } from 'react'
import type { HTMLAttributes } from 'react'
import { Bell, Search } from 'lucide-react'
import { Button } from '../../shared/ui/components/Button'
import { CommandPalette } from './CommandPalette'
import { cn } from '../../shared/ui/components/Button'
import { useTour } from '../../app/providers/TourProvider'
import { HelpCircle } from 'lucide-react'

interface HeaderProps extends HTMLAttributes<HTMLElement> {}

export function Header({ className, ...props }: HeaderProps) {
  const [isCommandOpen, setCommandOpen] = useState(false)
  const { startTour } = useTour()

  return (
    <>
      <header
        className={cn(
          'h-16 border-b border-border glass-panel flex items-center justify-between px-6',
          className
        )}
        {...props}
      >
        <div className="flex-1" />
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-text-secondary w-64 justify-start border border-border/50 bg-black/5 dark:bg-white/5"
            onClick={() => setCommandOpen(true)}
          >
            <Search size={16} />
            <span>Search...</span>
            <kbd className="ml-auto text-xs opacity-50">⌘K</kbd>
          </Button>

          <Button variant="ghost" className="p-2 h-auto rounded-full" onClick={startTour} title="Iniciar Tour Guiado">
            <HelpCircle size={20} className="text-text-secondary" />
          </Button>
          
          <Button variant="ghost" className="p-2 h-auto rounded-full">
            <Bell size={20} />
          </Button>
        </div>
      </header>

      <CommandPalette isOpen={isCommandOpen} onClose={() => setCommandOpen(false)} />
    </>
  )
}
