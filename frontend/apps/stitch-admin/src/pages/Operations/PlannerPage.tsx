import { useState } from 'react'
import { Map, Zap, RefreshCw, CalendarCheck, Truck, Users, AlertCircle, Plus } from 'lucide-react'
import { Button } from '../../shared/ui/components/Button'
import { Badge } from '../../shared/ui/components/Badge'
import { EmptyState } from '../../shared/ui/components/EmptyState'
import { AddRouteModal } from './Routes/components/AddRouteModal'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { 
  useListRoutesApiV1RoutingRoutesGet, 
  useListRequirementsApiV1RoutingRequirementsGet, 
  useTriggerRouteOptimizationApiV1RoutingOptimizePost, 
  getListRoutesApiV1RoutingRoutesGetQueryKey, 
  getListRequirementsApiV1RoutingRequirementsGetQueryKey 
} from '../../shared/api/generated/routing/routing'
import { useListVehiclesApiV1FleetVehiclesGet, useListDriversApiV1FleetDriversGet } from '../../shared/api/generated/fleet/fleet'

function requirementStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':    return { label: 'Pendente', variant: 'warning' as const }
    case 'SCHEDULED':  return { label: 'Agendado', variant: 'default' as const }
    case 'COMPLETED':  return { label: 'Concluído', variant: 'success' as const }
    case 'CANCELLED':  return { label: 'Cancelado', variant: 'destructive' as const }
    default:           return { label: status, variant: 'default' as const }
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length === 3) {
    const [y, m, d] = parts
    return `${d}/${m}/${y}`
  }
  return dateStr
}

export function PlannerPage() {
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: routes = [], isLoading: loadingRoutes } = useListRoutesApiV1RoutingRoutesGet()
  const { data: requirements = [], isLoading: loadingRequirements } = useListRequirementsApiV1RoutingRequirementsGet()
  const { data: vehicles = [] } = useListVehiclesApiV1FleetVehiclesGet()
  const { data: drivers = [] } = useListDriversApiV1FleetDriversGet()
  
  const { mutateAsync: optimizeRoutes, isPending: isOptimizing } = useTriggerRouteOptimizationApiV1RoutingOptimizePost()

  const pendingRequirements = (requirements as any[]).filter(r => r.status === 'PENDING')
  const availableVehicles = (vehicles as any[]).filter(v => v.status === 'ACTIVE')
  const availableDrivers = (drivers as any[]).filter(d => d.status === 'AVAILABLE' || d.status === 'ACTIVE')
  const todayRoutes = (routes as any[]).filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED')

  const handleAutoRoute = async () => {
    if (pendingRequirements.length === 0) {
      toast.info('Não há requisitos pendentes para otimizar.')
      return
    }
    try {
      const today = new Date().toISOString().split('T')[0]
      await optimizeRoutes({ data: { target_date: today } })
      toast.success('Otimização iniciada. Acompanhe a lista de rotas.')
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: getListRoutesApiV1RoutingRoutesGetQueryKey() })
        queryClient.invalidateQueries({ queryKey: getListRequirementsApiV1RoutingRequirementsGetQueryKey() })
      }, 5000)
    } catch (error) {
      toast.error('Erro ao iniciar roteirização automática.')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <Map size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Planejador de Rotas</h1>
              <p className="text-sm text-text-secondary mt-1">
                Acompanhe requisitos pendentes e despache rotas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleAutoRoute} disabled={isOptimizing || pendingRequirements.length === 0} className="gap-2">
              <Zap size={18} className={isOptimizing ? 'animate-pulse text-brand-500' : 'text-text-secondary'} />
              {isOptimizing ? 'Otimizando...' : 'Auto-Roteirizar'}
            </Button>
            <Button variant="liquid" onClick={() => setIsAddRouteOpen(true)} className="gap-2">
              <Plus size={18} />
              Criar Rota Manual
            </Button>
          </div>
        </div>

        {/* Resumo de Recursos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`glass-panel p-6 rounded-xl border ${pendingRequirements.length > 0 ? 'border-warning-500/30 bg-warning-500/5' : 'border-border'}`}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Pendentes</p>
              <AlertCircle size={20} className={pendingRequirements.length > 0 ? 'text-warning-500' : 'text-text-secondary'} />
            </div>
            <p className={`text-4xl font-bold ${pendingRequirements.length > 0 ? 'text-warning-500' : 'text-text-primary'}`}>
              {loadingRequirements ? '-' : pendingRequirements.length}
            </p>
            <p className="text-xs text-text-secondary mt-2">coletas aguardando rota</p>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Veículos</p>
              <Truck size={20} className="text-success-500" />
            </div>
            <p className="text-4xl font-bold text-success-500">
              {availableVehicles.length}
            </p>
            <p className="text-xs text-text-secondary mt-2">disponíveis de {(vehicles as any[]).length}</p>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Motoristas</p>
              <Users size={20} className="text-brand-500" />
            </div>
            <p className="text-4xl font-bold text-brand-500">
              {availableDrivers.length}
            </p>
            <p className="text-xs text-text-secondary mt-2">disponíveis de {(drivers as any[]).length}</p>
          </div>
        </div>

        {/* Tabelas Lado a Lado */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Requisitos */}
          <div className="glass-panel rounded-xl border border-border overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-primary font-semibold">
                <CalendarCheck size={18} className="text-text-secondary" />
                Requisitos a Roteirizar
              </div>
            </div>
            <div className="flex-1 p-0">
              {loadingRequirements ? (
                <div className="p-8 text-center text-text-secondary text-sm">Carregando...</div>
              ) : pendingRequirements.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                      <th className="p-3 text-xs font-semibold text-text-secondary uppercase">OS Ref</th>
                      <th className="p-3 text-xs font-semibold text-text-secondary uppercase">Data Limite</th>
                      <th className="p-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingRequirements.map((req: any) => {
                      const st = requirementStatusBadge(req.status);
                      return (
                        <tr key={req.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="p-3 text-sm font-medium text-text-primary">
                            OS {req.id?.substring(0, 8).toUpperCase()}
                          </td>
                          <td className="p-3 text-sm text-text-secondary">
                            {formatDate(req.scheduled_date || req.due_date)}
                          </td>
                          <td className="p-3">
                            <Badge variant={st.variant} className="variant-glass">{st.label}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-8">
                  <EmptyState
                    title="Tudo Roteirizado"
                    description="Não há serviços pendentes de roteirização no momento."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Rotas Ativas */}
          <div className="glass-panel rounded-xl border border-border overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-primary font-semibold">
                <Map size={18} className="text-brand-500" />
                Rotas Ativas (Hoje)
              </div>
              <Button variant="ghost" onClick={() => window.location.reload()} className="h-8 w-8 p-0 rounded-full">
                <RefreshCw size={16} />
              </Button>
            </div>
            <div className="flex-1 p-0">
              {loadingRoutes ? (
                <div className="p-8 text-center text-text-secondary text-sm">Carregando...</div>
              ) : todayRoutes.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                      <th className="p-3 text-xs font-semibold text-text-secondary uppercase">Rota</th>
                      <th className="p-3 text-xs font-semibold text-text-secondary uppercase">Data</th>
                      <th className="p-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {todayRoutes.map((route: any) => (
                      <tr key={route.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3 text-sm font-medium text-text-primary">
                          ROTA-{route.id?.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="p-3 text-sm text-text-secondary">
                          {formatDate(route.execution_date)}
                        </td>
                        <td className="p-3">
                          <Badge variant={route.status === 'PLANNED' ? 'outline' : 'default'} className="variant-glass">
                            {route.status === 'PLANNED' ? 'Planejada' : route.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8">
                  <EmptyState
                    title="Nenhuma Rota Ativa"
                    description="Não há rotas para o dia de hoje."
                    action={
                      <Button variant="ghost" onClick={() => setIsAddRouteOpen(true)} className="gap-2 mt-4">
                        <Plus size={16} /> Criar Rota
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <AddRouteModal
        isOpen={isAddRouteOpen}
        onClose={() => setIsAddRouteOpen(false)}
      />
    </div>
  )
}
