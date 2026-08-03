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

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
    
    return () => {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [isOpen])

  // Prevent click inside dialog from closing it, while clicking backdrop closes it
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    // A native dialog's backdrop is considered part of the dialog element.
    // If we click exactly on the dialog (the backdrop area), close it.
    // However, since we added padding/content inside the dialog, clicking inside will target those children.
    // BUT to be absolutely safe, we check if the click coordinates are outside the dialog box.
    const dialog = dialogRef.current
    if (!dialog) return
    
    const rect = dialog.getBoundingClientRect()
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    )
    
    if (!isInDialog) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className={cn(
        'backdrop:bg-black/60 backdrop:backdrop-blur-md',
        'm-auto w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 p-0 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100',
        'open:animate-in open:fade-in-0 open:zoom-in-95',
        className
      )}
    >
      <div className="flex flex-col w-full max-h-[85vh]">
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
