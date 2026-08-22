import { useState } from 'react'
import { Modal } from '../../../../shared/ui/components/Modal'
import { Button } from '../../../../shared/ui/components/Button'
import { Truck, CheckCircle2, ChevronRight, PackageSearch, User } from 'lucide-react'
import { toast } from 'sonner'
import { useListServiceOrdersApiV1LogisticsOrdersGet } from '../../../../shared/api/generated/logistics/logistics'
import { useListVehiclesApiV1FleetVehiclesGet, useListDriversApiV1FleetDriversGet } from '../../../../shared/api/generated/fleet/fleet'
import { logisticsApi } from '../../../../shared/api/logistics'
import { useQueryClient } from '@tanstack/react-query'

interface DispatchWizardProps {
  isOpen: boolean
  onClose: () => void
  route?: any // keeping optional for compatibility if RouteMap is passed
}

export function DispatchWizard({ isOpen, onClose, route }: DispatchWizardProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  
  // Selection state
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [selectedDriver, setSelectedDriver] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch data
  const { data: orders, isLoading: loadingOrders } = useListServiceOrdersApiV1LogisticsOrdersGet({ status: 'PENDING' })
  const { data: vehicles, isLoading: loadingVehicles } = useListVehiclesApiV1FleetVehiclesGet()
  const { data: drivers, isLoading: loadingDrivers } = useListDriversApiV1FleetDriversGet()

  const toggleOrder = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(o => o !== id))
    } else {
      setSelectedOrders([...selectedOrders, id])
    }
  }

  const handleNext = async () => {
    if (step === 1 && selectedOrders.length === 0) {
      toast.error('Selecione pelo menos uma Ordem de Serviço')
      return
    }
    if (step === 2 && (!selectedVehicle || !selectedDriver)) {
      toast.error('Selecione um veículo e um motorista')
      return
    }

    if (step === 3) {
      setIsSubmitting(true)
      try {
        await logisticsApi.dispatchOrders({
          service_order_ids: selectedOrders,
          execution_date: new Date().toISOString().split('T')[0], // Hoje
          vehicle_id: selectedVehicle,
          driver_id: selectedDriver
        })
        toast.success(`Despacho concluído com sucesso!`)
        // Invalidate queries to refresh lists
        queryClient.invalidateQueries({ queryKey: ['/api/v1/logistics/orders'] })
        queryClient.invalidateQueries({ queryKey: ['/api/v1/routing/routes'] })
        onClose()
        setStep(1)
        setSelectedOrders([])
        setSelectedVehicle('')
        setSelectedDriver('')
      } catch (error: any) {
        toast.error('Erro ao roteirizar ordens', { description: error.response?.data?.detail || error.message })
      } finally {
        setIsSubmitting(false)
      }
      return
    }
    setStep(step + 1)
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Selecionar Ordens (Aguardando Roteirização)</h3>
            <p className="text-sm text-text-secondary mb-4">
              Escolha as ordens de serviço que farão parte desta rota.
            </p>
            
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-border space-y-3 max-h-[300px] overflow-y-auto">
              {loadingOrders ? (
                <div className="text-center text-text-secondary py-4">Carregando ordens...</div>
              ) : orders?.length === 0 ? (
                <div className="text-center text-text-secondary py-4">Nenhuma ordem aguardando roteirização.</div>
              ) : (
                orders?.map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => toggleOrder(order.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border shadow-sm cursor-pointer transition-colors ${selectedOrders.includes(order.id) ? 'bg-brand-500/10 border-brand-500' : 'bg-surface border-border hover:border-brand-500/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-500/10 p-2 rounded-full">
                        <PackageSearch className="h-4 w-4 text-brand-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-text-primary">Data: {new Date(order.scheduled_date).toLocaleDateString('pt-BR')} (ID: {order.id.split('-')[0]})</p>
                        <p className="text-xs text-text-secondary">{order.items?.length || 0} itens</p>
                      </div>
                    </div>
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center ${selectedOrders.includes(order.id) ? 'bg-brand-500 border-brand-500' : 'border-text-secondary/30'}`}>
                      {selectedOrders.includes(order.id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Atribuir Frota</h3>
            <p className="text-sm text-text-secondary">
              Selecione o veículo e o motorista para executar esta rota.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">Veículo</label>
                <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto">
                  {loadingVehicles ? <span className="text-sm">Carregando...</span> : vehicles?.map(v => (
                    <div 
                      key={v.id} 
                      onClick={() => setSelectedVehicle(v.id)}
                      className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer ${selectedVehicle === v.id ? 'bg-brand-500/10 border-brand-500' : 'border-border hover:bg-black/5'}`}
                    >
                      <Truck className="h-4 w-4 text-text-secondary" />
                      <span className="text-sm font-medium">{v.license_plate} - {v.vehicle_type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">Motorista</label>
                <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto">
                  {loadingDrivers ? <span className="text-sm">Carregando...</span> : drivers?.map(d => (
                    <div 
                      key={d.id} 
                      onClick={() => setSelectedDriver(d.id)}
                      className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer ${selectedDriver === d.id ? 'bg-brand-500/10 border-brand-500' : 'border-border hover:bg-black/5'}`}
                    >
                      <User className="h-4 w-4 text-text-secondary" />
                      <span className="text-sm font-medium">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4 text-center py-6">
            <div className="mx-auto w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-brand-500" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Pronto para Despachar</h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              Você selecionou <strong>{selectedOrders.length} ordens</strong> de serviço. 
              Ao confirmar, uma nova rota será gerada e o motorista será notificado para execução hoje.
            </p>
          </div>
        )
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Gerenciar Despacho (Roteirização)`}>
      <div className="py-2">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex flex-col gap-2">
              <div className={`h-1.5 rounded-full ${s <= step ? 'bg-brand-500' : 'bg-black/10 dark:bg-white/10'}`} />
              <span className={`text-[10px] uppercase font-bold tracking-wider text-center ${s <= step ? 'text-brand-500' : 'text-text-secondary'}`}>
                {s === 1 ? 'Ordens' : s === 2 ? 'Recursos' : 'Confirmação'}
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
          
          <Button variant={step === 3 ? "liquid" : "glass"} onClick={handleNext} disabled={isSubmitting}>
            {step === 3 ? (isSubmitting ? 'Gerando...' : 'Finalizar Despacho') : 'Continuar'}
            {step !== 3 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
