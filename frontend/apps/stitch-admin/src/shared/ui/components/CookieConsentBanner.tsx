import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if the user has already consented
    const hasConsented = localStorage.getItem('ddn_cookie_consent')
    if (!hasConsented) {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('ddn_cookie_consent', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-sm w-[calc(100%-2rem)]">
      <div className="glass-panel p-4 rounded-xl border border-border/50 shadow-xl relative">
        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 text-text-secondary hover:text-text-primary transition-colors p-1"
          aria-label="Close consent banner"
        >
          <X size={16} />
        </button>
        
        <div className="pr-6">
          <p className="text-sm text-text-primary font-medium mb-1">Proteção de Dados & Privacidade</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            Ao continuar utilizando o sistema, você concorda com nossos Termos de Uso e Política de Privacidade.
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="glass" className="h-7 text-xs px-3" onClick={handleClose}>
              Concordar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
