import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, CheckCircle2, Play, Pause, FileText, Truck } from 'lucide-react'
import { Badge } from '../../shared/ui/components/Badge'
import { Button } from '../../shared/ui/components/Button'
import { useGetPlanApiV1ServicePlansPlanIdGet } from '../../shared/api/generated/service-plans/service-plans'

export function ServicePlanDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: rawPlan, isLoading } = useGetPlanApiV1ServicePlansPlanIdGet(id!)
  const plan = rawPlan as any

  const formatStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { label: 'Ativo', variant: 'success' as const }
      case 'DRAFT': return { label: 'Rascunho', variant: 'default' as const }
      case 'SUSPENDED': return { label: 'Suspenso', variant: 'warning' as const }
      case 'COMPLETED': return { label: 'Concluído', variant: 'default' as const }
      default: return { label: status, variant: 'default' as const }
    }
  }

  if (isLoading) {
    return <div className="p-12 text-center text-text-secondary">Carregando plano de serviço...</div>
  }

  if (!plan) {
    return <div className="p-12 text-center text-red-500">Plano não encontrado.</div>
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <button 
            onClick={() => navigate('/admin/service-plans')}
            className="flex items-center text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar para Planos
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
                <CalendarDays size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  Plano de Serviço {String(plan.id).substring(0, 8).toUpperCase()}
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Contrato Referência: {plan.contract_id || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {plan.status === 'ACTIVE' ? (
                <Button variant="ghost" className="text-warning-500 hover:text-warning-600 hover:bg-warning-500/10 gap-2">
                  <Pause size={18} />
                  Suspender
                </Button>
              ) : (
                <Button variant="liquid" className="gap-2">
                  <Play size={18} />
                  Ativar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-border space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-lg font-semibold text-text-primary">Detalhes da Execução</h3>
                <Badge variant={formatStatus(plan.status).variant} className="variant-glass">
                  {formatStatus(plan.status).label}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider block mb-1">
                    Frequência
                  </label>
                  <p className="text-sm font-medium text-text-primary">{plan.frequency}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider block mb-1">
                    Próxima Execução
                  </label>
                  <p className="text-sm font-medium text-text-primary">
                    {plan.next_execution_date 
                      ? new Date(plan.next_execution_date).toLocaleDateString('pt-BR')
                      : 'Não agendada'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider block mb-1">
                    Data de Início
                  </label>
                  <p className="text-sm font-medium text-text-primary">
                    {plan.start_date ? new Date(plan.start_date).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider block mb-1">
                    Data de Fim (Estimada)
                  </label>
                  <p className="text-sm font-medium text-text-primary">
                    {plan.end_date ? new Date(plan.end_date).toLocaleDateString('pt-BR') : 'Indeterminado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Cronogramas e Serviços */}
            <div className="glass-panel p-6 rounded-xl border border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Cronogramas (Schedules)</h3>
              {plan.schedules && plan.schedules.length > 0 ? (
                <div className="space-y-4">
                  {plan.schedules.map((schedule: any, idx: number) => (
                    <div key={idx} className="p-4 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{schedule.day_of_week}</p>
                          <p className="text-xs text-text-secondary">Janela: {schedule.start_time} - {schedule.end_time}</p>
                        </div>
                      </div>
                      <Badge variant="default" className="variant-glass">Cronograma Ativo</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">Nenhum cronograma definido ainda.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-border">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
                <Truck size={16} className="text-brand-500" />
                Requisitos do Plano
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Tipo de Veículo</span>
                  <span className="font-medium text-text-primary">Padrão</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Acondicionamento</span>
                  <span className="font-medium text-text-primary">Caçamba 5m³</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-border bg-brand-500/5 border-brand-500/20">
              <h3 className="text-sm font-semibold text-brand-500 flex items-center gap-2 mb-4">
                <FileText size={16} />
                Ordens de Serviço Relacionadas
              </h3>
              <p className="text-xs text-text-secondary mb-4">
                As ordens de serviço (OS) são geradas automaticamente pelo Dispatch Worker com base nas janelas de execução deste plano.
              </p>
              <Button variant="ghost" className="w-full text-xs" onClick={() => navigate('/admin/service-orders')}>
                Ver Ordens de Serviço
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
