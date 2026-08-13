import { useState } from 'react'
import { Badge } from '../../shared/ui/components/Badge'
import { Button } from '../../shared/ui/components/Button'
import { Modal } from '../../shared/ui/components/Modal'
import { EmptyState } from '../../shared/ui/components/EmptyState'
import { CustomerForm } from './components/CustomerForm'
import { Plus, Target, MapPin, Users, Mail, Phone, CheckCircle2 } from 'lucide-react'

import { 
  useListLeadsApiV1CommercialLeadsGet,
  useMatchLeadToCompanyApiV1CommercialLeadsLeadIdMatchPost 
} from '../../shared/api/generated/commercial/commercial'
import { toast } from 'sonner'

export function LeadsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { data: leads = [], isLoading, refetch } = useListLeadsApiV1CommercialLeadsGet()
  const convertMutation = useMatchLeadToCompanyApiV1CommercialLeadsLeadIdMatchPost()

  const handleConvert = async (leadId: string, companyName: string) => {
    try {
      await convertMutation.mutateAsync({
        leadId,
        data: {
          trade_name: companyName,
          corporate_name: companyName,
          document_number: Date.now().toString() // Generates a unique stub for now
        }
      })
      toast.success('Lead convertido em Cliente e Oportunidade gerada!')
      refetch()
    } catch (e) {
      toast.error('Erro ao converter Lead.')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <Target size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Prospecção (Leads)</h1>
              <p className="text-sm text-text-secondary mt-1">
                Gerencie seus leads comerciais e converta-os em clientes.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="liquid" onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus size={18} /> Novo Lead
            </Button>
          </div>
        </div>

        {/* Lista de Leads */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <Target size={18} className="text-brand-500" />
              Base de Leads Ativos
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-text-secondary">Carregando leads...</div>
            ) : leads.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Empresa & Contato</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Localização</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Origem</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-text-primary">{lead.company_name}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-text-secondary flex items-center gap-1">
                            <Users size={12} /> {lead.contact_name}
                          </span>
                          {lead.email && (
                            <span className="text-xs text-text-secondary flex items-center gap-1">
                              <Mail size={12} /> {lead.email}
                            </span>
                          )}
                          {lead.phone && (
                            <span className="text-xs text-text-secondary flex items-center gap-1">
                              <Phone size={12} /> {lead.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                          <MapPin size={14} className="opacity-70" />
                          <span className="truncate max-w-[200px]">{lead.address || 'Não informado'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {lead.source_id ? (
                          <Badge variant="outline" className="variant-glass text-xs">{lead.source_id}</Badge>
                        ) : (
                          <span className="text-sm text-text-secondary opacity-50">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={lead.status === 'NEW' ? 'default' : 'outline'} className={lead.status === 'NEW' ? 'bg-brand-500/20 text-brand-500' : 'variant-glass'}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {lead.status !== 'CONVERTED' && (
                          <Button variant="liquid" onClick={() => handleConvert(lead.id, lead.company_name)} className="text-xs h-8 gap-1">
                            <CheckCircle2 size={14} /> Converter
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="Nenhum lead encontrado"
                  description="Você ainda não possui leads na base. Adicione o primeiro para iniciar a prospecção."
                  action={
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 mt-4">
                      <Plus size={16} /> Novo Lead
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>

        <Modal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          title="Novo Lead"
        >
          <CustomerForm 
            onSuccess={() => {
              setIsAddModalOpen(false)
              refetch()
            }} 
            onCancel={() => setIsAddModalOpen(false)} 
          />
        </Modal>
      </div>
    </div>
  )
}
