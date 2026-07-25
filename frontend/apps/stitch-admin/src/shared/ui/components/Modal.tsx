import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'
import { cn } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  // Prevent click inside dialog from closing it, while clicking backdrop closes it
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className={cn(
        'backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        'fixed inset-0 m-auto w-full max-w-lg rounded-2xl bg-background-primary p-0 shadow-lg text-text-primary',
        'transition-all duration-300 ease-out',
        'open:animate-in open:fade-in-0 open:zoom-in-95',
        'closed:animate-out closed:fade-out-0 closed:zoom-out-95',
        className
      )}
    >
      <div className="flex flex-col w-full h-full max-h-[80vh]">
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button variant="ghost" onClick={onClose} className="p-2 h-auto w-auto rounded-full">
              <X size={20} />
            </Button>
          </div>
        )}
        <div className="overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </dialog>
  )
}
