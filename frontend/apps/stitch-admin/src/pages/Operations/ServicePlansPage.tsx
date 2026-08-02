import { useNavigate } from 'react-router-dom'
import { CalendarDays, Plus, Search, Filter } from 'lucide-react'
import { Badge } from '../../shared/ui/components/Badge'
import { Button } from '../../shared/ui/components/Button'
import { EmptyState } from '../../shared/ui/components/EmptyState'
import { useListAllPlansApiV1ServicePlansGet } from '../../shared/api/generated/service-plans/service-plans'

export function ServicePlansPage() {
  const navigate = useNavigate()
  const { data: plansData, isLoading } = useListAllPlansApiV1ServicePlansGet()
  const plans = plansData as any[] | undefined

  const formatStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { label: 'Ativo', variant: 'success' as const }
      case 'DRAFT': return { label: 'Rascunho', variant: 'default' as const }
      case 'SUSPENDED': return { label: 'Suspenso', variant: 'warning' as const }
      case 'COMPLETED': return { label: 'Concluído', variant: 'default' as const }
      default: return { label: status, variant: 'default' as const }
    }
  }

  const formatFrequency = (freq: string) => {
    switch (freq) {
      case 'DAILY': return 'Diário'
      case 'WEEKLY': return 'Semanal'
      case 'BIWEEKLY': return 'Quinzenal'
      case 'MONTHLY': return 'Mensal'
      case 'ON_DEMAND': return 'Sob Demanda'
      default: return freq
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <CalendarDays size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Planos de Serviço</h1>
              <p className="text-sm text-text-secondary mt-1">Gerencie os cronogramas de coleta e requisitos operacionais</p>
            </div>
          </div>
          <Button variant="liquid" className="gap-2">
            <Plus size={20} />
            Novo Plano
          </Button>
        </div>

        {/* Filters/Search */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
            <input 
              type="text" 
              placeholder="Buscar planos por contrato ou ID..." 
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <Button variant="ghost" className="gap-2 text-text-secondary">
            <Filter size={20} />
            Filtros
          </Button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="glass-panel p-12 text-center text-text-secondary">
            Carregando planos...
          </div>
        ) : plans?.length === 0 ? (
          <EmptyState
            title="Nenhum plano de serviço encontrado"
            description="Os planos de serviço são gerados automaticamente ao ativar contratos, ou podem ser criados manualmente sob demanda."
            action={
              <Button variant="liquid" className="gap-2">
                <Plus size={20} />
                Criar Plano Manual
              </Button>
            }
          />
        ) : (
          <div className="glass-panel rounded-xl overflow-hidden border border-border shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                  <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">ID / Contrato</th>
                  <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Frequência</th>
                  <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Próxima Execução</th>
                  <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans?.map((plan: any) => (
                  <tr 
                    key={plan.id} 
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">
                          Contrato {plan.contract_id?.substring(0, 8).toUpperCase() || 'Manual'}
                        </span>
                        <span className="text-xs text-text-secondary font-mono">{String(plan.id).substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-text-primary">
                        {formatFrequency(plan.frequency)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-text-primary">
                        {plan.next_execution_date 
                          ? new Date(plan.next_execution_date).toLocaleDateString('pt-BR')
                          : 'Aguardando agendamento'}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={formatStatus(plan.status).variant} className="variant-glass">
                        {formatStatus(plan.status).label}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="ghost" 
                        onClick={() => navigate(`/admin/service-plans/${plan.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
