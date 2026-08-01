import { useState } from 'react'
import { Modal } from '../../../shared/ui/components/Modal'
import { Button } from '../../../shared/ui/components/Button'
import { Card, CardContent } from '../../../shared/ui/components/Card'
import { MapPin, Truck, CheckCircle2, ChevronRight, PackageSearch } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '../../../shared/ui/components/Badge'

interface DispatchWizardProps {
  isOpen: boolean
  onClose: () => void
  route: any
}

export function DispatchWizard({ isOpen, onClose, route }: DispatchWizardProps) {
  const [step, setStep] = useState(1)
  const [workflow, setWorkflow] = useState<'WAREHOUSE_STORAGE' | 'DIRECT_TO_LANDFILL'>('WAREHOUSE_STORAGE')

  // Mock Radar data - in reality, this would fetch from API based on route coords
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
            <h3 className="text-lg font-medium">Fluxo da Rota</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Defina para onde os resíduos desta rota serão levados ao final.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer border-2 transition-all ${workflow === 'WAREHOUSE_STORAGE' ? 'border-brand-500 bg-brand-500/5' : 'hover:border-zinc-300'}`}
                onClick={() => setWorkflow('WAREHOUSE_STORAGE')}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-full">
                  <PackageSearch className={`h-8 w-8 ${workflow === 'WAREHOUSE_STORAGE' ? 'text-brand-500' : 'text-zinc-400'}`} />
                  <span className="font-medium">Galpão DDN</span>
                  <span className="text-xs text-muted-foreground">Descarregar na base para triagem</span>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer border-2 transition-all ${workflow === 'DIRECT_TO_LANDFILL' ? 'border-brand-500 bg-brand-500/5' : 'hover:border-zinc-300'}`}
                onClick={() => setWorkflow('DIRECT_TO_LANDFILL')}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-full">
                  <Truck className={`h-8 w-8 ${workflow === 'DIRECT_TO_LANDFILL' ? 'text-brand-500' : 'text-zinc-400'}`} />
                  <span className="font-medium">Aterro Parceiro</span>
                  <span className="text-xs text-muted-foreground">Descarregar direto em local final</span>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Radar de Clientes</h3>
                <p className="text-sm text-muted-foreground">
                  Clientes próximos que poderiam ser atendidos nesta rota.
                </p>
              </div>
              <Badge variant="outline" className="bg-brand-500/10 text-brand-600 border-brand-500/20">
                Oportunidade
              </Badge>
            </div>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              {nearbyLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between bg-card p-3 rounded-md border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.distance}</p>
                    </div>
                  </div>
                  <Button variant="ghost">Adicionar à Rota</Button>
                </div>
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4 text-center py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium">Tudo Pronto!</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
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
        <div className="flex items-center gap-2 mb-8 px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex flex-col gap-2">
              <div className={`h-1.5 rounded-full ${s <= step ? 'bg-brand-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
              <span className={`text-[10px] uppercase font-bold tracking-wider text-center ${s <= step ? 'text-brand-500' : 'text-muted-foreground'}`}>
                {s === 1 ? 'Fluxo' : s === 2 ? 'Radar' : 'Confirmação'}
              </span>
            </div>
          ))}
        </div>

        <div className="px-1 min-h-[250px]">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t">
          {step > 1 && step < 3 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          ) : <div></div>}
          
          <Button onClick={handleNext}>
            {step === 3 ? 'Finalizar Despacho' : 'Continuar'}
            {step !== 3 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
