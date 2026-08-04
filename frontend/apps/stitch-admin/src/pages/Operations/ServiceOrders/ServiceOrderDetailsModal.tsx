import { Modal } from '../../../shared/ui/components/Modal'
import { Button } from '../../../shared/ui/components/Button'
import { Badge } from '../../../shared/ui/components/Badge'
import { Truck, MapPin, CircleDot, User, FileText, Check, Weight } from 'lucide-react'

interface ServiceOrderDetailsModalProps {
  order: any
  isOpen: boolean
  onClose: () => void
  onGenerateMtr: (orderId: string) => void
  isGenerating: boolean
}

export function ServiceOrderDetailsModal({ order, isOpen, onClose, onGenerateMtr, isGenerating }: ServiceOrderDetailsModalProps) {
  if (!order) return null

  // We could fetch companies, drivers, vehicles here using standard fetch or generated hooks.
  // For now, we will show IDs if names are not immediately available, 
  // but a typical flow would use `useListCompaniesApiV1CommercialCompaniesGet` etc.

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Ordem de Serviço (MTR)">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">OS #{order.id.split('-')[0].toUpperCase()}</h3>
            <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
              <CircleDot size={14} className="text-brand-500" />
              Agendado para: <span className="font-medium text-text-primary">{order.scheduled_date}</span>
            </p>
          </div>
          <Badge variant="glass" className={
            order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
            order.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
            'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }>
            {order.status}
          </Badge>
        </div>

        {/* Entities (Gerador, Transportador, Destinador) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border/50 bg-black/5 dark:bg-white/5 space-y-2">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <User size={14} /> Gerador
            </div>
            <div className="font-medium text-text-primary truncate" title={order.company_id}>
              ID: {order.company_id.split('-')[0]}...
            </div>
            <div className="text-xs text-text-secondary">Cliente / Origem</div>
          </div>

          <div className="p-4 rounded-xl border border-border/50 bg-black/5 dark:bg-white/5 space-y-2">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <Truck size={14} /> Transportador
            </div>
            <div className="font-medium text-text-primary truncate">
              DDN Gestão de Resíduos
            </div>
            <div className="text-xs text-text-secondary">Nossa Frota</div>
          </div>

          <div className="p-4 rounded-xl border border-border/50 bg-black/5 dark:bg-white/5 space-y-2">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <MapPin size={14} /> Destinador
            </div>
            <div className="font-medium text-text-primary truncate">
              {order.destination_id ? `ID: ${order.destination_id.split('-')[0]}...` : 'A definir / Aterro Central'}
            </div>
            <div className="text-xs text-text-secondary">Local de Descarte</div>
          </div>
        </div>

        {/* Fleet Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="p-4 rounded-xl border border-border/50 bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Veículo (Placa)</div>
              <div className="font-medium text-text-primary mt-1">
                {order.vehicle_id ? `ID: ${order.vehicle_id.split('-')[0]}` : 'Não atribuído'}
              </div>
            </div>
            <Truck className="text-brand-500/50" size={24} />
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Motorista</div>
              <div className="font-medium text-text-primary mt-1">
                {order.driver_id ? `ID: ${order.driver_id.split('-')[0]}` : 'Não atribuído'}
              </div>
            </div>
            <User className="text-brand-500/50" size={24} />
          </div>
        </div>

        {/* Items List */}
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Weight size={16} className="text-brand-500" />
            Resíduos / Serviços (MTR)
          </h4>
          <div className="border border-border/50 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-border/50">
                <tr>
                  <th className="p-3 font-medium text-text-secondary">Serviço/Resíduo</th>
                  <th className="p-3 font-medium text-text-secondary text-right">Quantidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {order.items?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-text-primary">{item.service_name}</td>
                    <td className="p-3 text-right font-mono text-brand-500 font-medium">{item.quantity}</td>
                  </tr>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-text-secondary">Nenhum item vinculado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          {order.status === 'COMPLETED' ? (
            <Button 
              variant="liquid"
              onClick={() => onGenerateMtr(order.id)}
              disabled={isGenerating}
              className="gap-2"
            >
              <FileText size={16} />
              {isGenerating ? 'Gerando...' : 'Gerar MTR Oficial'}
            </Button>
          ) : (
             <Button variant="ghost" disabled className="gap-2">
              <Check size={16} /> Complete a OS para gerar MTR
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
