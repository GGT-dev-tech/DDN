import { useState } from 'react'
import { Modal } from '../../../../shared/ui/components/Modal'
import { Button } from '../../../../shared/ui/components/Button'
import { MapPin, Truck, CheckCircle2, ChevronRight, PackageSearch } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '../../../../shared/ui/components/Badge'

interface DispatchWizardProps {
  isOpen: boolean
  onClose: () => void
  route: any
}

export function DispatchWizard({ isOpen, onClose, route }: DispatchWizardProps) {
  const [step, setStep] = useState(1)
  const [workflow, setWorkflow] = useState<'WAREHOUSE_STORAGE' | 'DIRECT_TO_LANDFILL'>('WAREHOUSE_STORAGE')

  const nearbyLeads = [
    { id: '1', name: 'Padaria Central', distance: '1.2 km', lat: -23.5510, lng: -46.6340 },
    { id: '2', name: 'Supermercado Vida', distance: '2.5 km', lat: -23.5550, lng: -46.6400 }
  ]

  const handleNext = () => {
    if (step === 3) {
      toast.success(`Despacho concluído com fluxo: ${workflow === 'WAREHOUSE_STORAGE' ? 'Galpão DDN' : 'Aterro'}`)
      onClose()
      setStep(1)
      return
    }
    setStep(step + 1)
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Fluxo da Rota</h3>
            <p className="text-sm text-text-secondary mb-4">
              Defina para onde os resíduos desta rota serão levados ao final do dia.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`cursor-pointer rounded-xl border-2 transition-all p-6 flex flex-col items-center justify-center text-center gap-3 ${workflow === 'WAREHOUSE_STORAGE' ? 'border-brand-500 bg-brand-500/10' : 'border-border hover:border-text-secondary glass-panel'}`}
                onClick={() => setWorkflow('WAREHOUSE_STORAGE')}
              >
                <PackageSearch className={`h-10 w-10 ${workflow === 'WAREHOUSE_STORAGE' ? 'text-brand-500' : 'text-text-secondary'}`} />
                <span className="font-semibold text-text-primary">Galpão DDN</span>
                <span className="text-xs text-text-secondary">Descarregar na base para triagem</span>
              </div>

              <div 
                className={`cursor-pointer rounded-xl border-2 transition-all p-6 flex flex-col items-center justify-center text-center gap-3 ${workflow === 'DIRECT_TO_LANDFILL' ? 'border-brand-500 bg-brand-500/10' : 'border-border hover:border-text-secondary glass-panel'}`}
                onClick={() => setWorkflow('DIRECT_TO_LANDFILL')}
              >
                <Truck className={`h-10 w-10 ${workflow === 'DIRECT_TO_LANDFILL' ? 'text-brand-500' : 'text-text-secondary'}`} />
                <span className="font-semibold text-text-primary">Aterro Parceiro</span>
                <span className="text-xs text-text-secondary">Descarregar direto em local final</span>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Radar de Clientes</h3>
                <p className="text-sm text-text-secondary">
                  Clientes próximos que poderiam ser atendidos nesta rota.
                </p>
              </div>
              <Badge variant="outline" className="variant-glass text-brand-500 border-brand-500/20">
                Oportunidade
              </Badge>
            </div>
            
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-border space-y-3">
              {nearbyLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between bg-surface p-3 rounded-lg border border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-500/10 p-2 rounded-full">
                      <MapPin className="h-4 w-4 text-brand-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-text-primary">{lead.name}</p>
                      <p className="text-xs text-text-secondary">{lead.distance}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-sm">Adicionar</Button>
                </div>
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4 text-center py-6">
            <div className="mx-auto w-16 h-16 bg-success-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-success-500" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Tudo Pronto!</h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              O motorista foi notificado. Fluxo definido para: <strong>{workflow === 'WAREHOUSE_STORAGE' ? 'Galpão DDN' : 'Aterro Parceiro'}</strong>
            </p>
          </div>
        )
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Gerenciar Despacho - Rota ${route?.id?.split('-')[0] || ''}`}>
      <div className="py-2">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex flex-col gap-2">
              <div className={`h-1.5 rounded-full ${s <= step ? 'bg-brand-500' : 'bg-black/10 dark:bg-white/10'}`} />
              <span className={`text-[10px] uppercase font-bold tracking-wider text-center ${s <= step ? 'text-brand-500' : 'text-text-secondary'}`}>
                {s === 1 ? 'Fluxo' : s === 2 ? 'Radar' : 'Confirmação'}
              </span>
            </div>
          ))}
        </div>

        <div className="min-h-[250px]">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t border-border">
          {step > 1 && step < 3 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          ) : <div></div>}
          
          <Button variant={step === 3 ? "liquid" : "glass"} onClick={handleNext}>
            {step === 3 ? 'Finalizar Despacho' : 'Continuar'}
            {step !== 3 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
