import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background-primary group-[.toaster]:text-text-primary group-[.toaster]:border-border group-[.toaster]:shadow-lg glass-panel',
          description: 'group-[.toast]:text-text-secondary',
          actionButton:
            'group-[.toast]:bg-brand-500 group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-black/5 group-[.toast]:text-text-primary dark:group-[.toast]:bg-white/5',
        },
      }}
      {...props}
    />
  )
}

export { toast } from 'sonner'
