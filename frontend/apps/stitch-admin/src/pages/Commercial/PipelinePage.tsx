import { useNavigate } from 'react-router-dom'
import { Badge } from '../../shared/ui/components/Badge'
import { Button } from '../../shared/ui/components/Button'
import { LayoutDashboard, Plus, DollarSign, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { 
  useListOpportunitiesApiV1CommercialOpportunitiesGet,
  useUpdateOpportunityStageApiV1CommercialOpportunitiesOpportunityIdStagePatch,
  getListOpportunitiesApiV1CommercialOpportunitiesGetQueryKey
} from '../../shared/api/generated/commercial/commercial'

export function PipelinePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const { data: opportunities = [], isLoading } = useListOpportunitiesApiV1CommercialOpportunitiesGet()
  const { mutateAsync: updateStage } = useUpdateOpportunityStageApiV1CommercialOpportunitiesOpportunityIdStagePatch()

  // Kanban logic
  const stages = ['DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']
  const stageNames: Record<string, string> = {
    DISCOVERY: 'Descoberta',
    PROPOSAL: 'Proposta',
    NEGOTIATION: 'Negociação',
    CLOSED_WON: 'Ganho',
    CLOSED_LOST: 'Perdido',
  }

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities.filter((opp: any) => opp.stage === stage)
  }

  const handleDragStart = (e: React.DragEvent, opportunityId: string) => {
    e.dataTransfer.setData('opportunityId', opportunityId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Required to allow dropping
  }

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault()
    const opportunityId = e.dataTransfer.getData('opportunityId')
    if (!opportunityId) return

    // Optimistic UI update could be done here, but we will rely on react-query invalidate
    try {
      await updateStage({
        opportunityId,
        data: { stage: newStage }
      })
      toast.success('Fase atualizada com sucesso!')
      queryClient.invalidateQueries({ queryKey: getListOpportunitiesApiV1CommercialOpportunitiesGetQueryKey() })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao atualizar fase.')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background flex flex-col">
      <div className="p-8 max-w-[1400px] w-full mx-auto space-y-8 flex-1 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Funil de Vendas</h1>
              <p className="text-sm text-text-secondary mt-1">
                Acompanhe o pipeline de oportunidades e negócios em andamento.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="liquid" onClick={() => navigate('/admin/leads')} className="gap-2">
              <Plus size={18} /> Nova Oportunidade
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
          {stages.map((stage) => {
            const opps = getOpportunitiesByStage(stage)
            return (
              <div 
                key={stage} 
                className="min-w-[300px] w-[300px] bg-black/5 dark:bg-white/5 rounded-xl border border-border flex flex-col max-h-full"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-text-primary">{stageNames[stage]}</span>
                  <Badge variant="outline" className="variant-glass text-xs">{opps.length}</Badge>
                </div>

                {/* Column Content */}
                <div className="p-3 overflow-y-auto flex flex-col gap-3 flex-1 min-h-[200px]">
                  {isLoading ? (
                    <div className="text-center text-sm text-text-secondary py-4">Carregando...</div>
                  ) : opps.length === 0 ? (
                    <div className="text-center text-sm text-text-secondary opacity-50 py-4">
                      Arraste oportunidades para cá
                    </div>
                  ) : (
                    opps.map((opp: any) => (
                      <div 
                        key={opp.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, opp.id)}
                        className="bg-surface border border-border p-3 rounded-lg shadow-sm hover:border-brand-500/50 cursor-grab active:cursor-grabbing transition-colors"
                      >
                        <div className="font-medium text-sm text-text-primary mb-1">{opp.title}</div>
                        <div className="text-xs text-text-secondary mb-3 flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px] py-0">{opp.company_id.substring(0, 8)}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          {opp.estimated_value && (
                            <span className="text-green-500 font-semibold flex items-center gap-1">
                              <DollarSign size={12} /> {opp.estimated_value.toLocaleString('pt-BR')}
                            </span>
                          )}
                          {opp.expected_close_date && (
                            <span className="text-text-secondary flex items-center gap-1">
                              <Calendar size={12} /> {new Date(opp.expected_close_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
