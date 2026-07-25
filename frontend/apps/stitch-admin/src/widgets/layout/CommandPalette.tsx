import { useEffect, useState } from 'react'
import { Search, Route, Truck } from 'lucide-react'
import { Modal } from '../../../shared/ui/components/Modal'
import { Input } from '../../../shared/ui/components/Input'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        isOpen ? onClose() : document.dispatchEvent(new CustomEvent('open-command'))
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [isOpen, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="p-0 max-w-2xl bg-background-primary/90">
      <div className="flex flex-col h-[400px]">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search size={20} className="text-text-tertiary mr-3" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-tertiary"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-text-tertiary">Quick Actions</div>
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-brand-500 hover:text-white transition-colors text-text-secondary text-sm">
            <Route size={18} />
            <span>Create Route</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-brand-500 hover:text-white transition-colors text-text-secondary text-sm">
            <Truck size={18} />
            <span>Assign Vehicle</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}
