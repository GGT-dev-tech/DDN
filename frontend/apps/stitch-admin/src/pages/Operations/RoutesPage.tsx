import React, { useState } from 'react'
import { Route, Plus, Calendar, Truck, ChevronDown, ChevronRight, Play } from 'lucide-react'
import { Button } from '../../shared/ui/components/Button'
import { Badge } from '../../shared/ui/components/Badge'
import { EmptyState } from '../../shared/ui/components/EmptyState'
import { useListRoutesApiV1RoutingRoutesGet } from '../../shared/api/generated/routing/routing'
import { AddRouteModal } from './Routes/components/AddRouteModal'
import { DispatchWizard } from './Routes/components/DispatchWizard'
import { RouteMapModal } from './Routes/components/RouteMapModal'
import { Map as MapIcon } from 'lucide-react'

function routeStatusBadge(status: string) {
  switch (status) {
    case 'PLANNED':
      return { label: 'Planejada', variant: 'default' as const }
    case 'IN_PROGRESS':
      return { label: 'Em Andamento', variant: 'warning' as const }
    case 'COMPLETED':
      return { label: 'Concluída', variant: 'success' as const }
    case 'CANCELLED':
      return { label: 'Cancelada', variant: 'destructive' as const }
    default:
      return { label: status, variant: 'default' as const }
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

export function RoutesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null)
  const [dispatchRoute, setDispatchRoute] = useState<any | null>(null)
  const [mapRoute, setMapRoute] = useState<any | null>(null)
  
  const { data: routes = [], isLoading, isError } = useListRoutesApiV1RoutingRoutesGet()

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <Route size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Gestão de Rotas</h1>
              <p className="text-sm text-text-secondary mt-1">
                Visualize e gerencie as rotas de coleta operacionais.
              </p>
            </div>
          </div>
          <Button variant="liquid" onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus size={18} />
            Nova Rota Manual
          </Button>
        </div>

        {/* Estatísticas */}
        {(routes as any[]).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-xl border border-border">
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Total</p>
              <p className="text-3xl font-bold text-text-primary">{(routes as any[]).length}</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-border">
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Planejadas</p>
              <p className="text-3xl font-bold text-text-secondary">{(routes as any[]).filter(r => r.status === 'PLANNED').length}</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-border">
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Em Andamento</p>
              <p className="text-3xl font-bold text-warning-500">{(routes as any[]).filter(r => r.status === 'IN_PROGRESS').length}</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-border">
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Concluídas</p>
              <p className="text-3xl font-bold text-success-500">{(routes as any[]).filter(r => r.status === 'COMPLETED').length}</p>
            </div>
          </div>
        )}

        {/* Tabela de Rotas */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <Route size={18} className="text-text-secondary" />
              Rotas Cadastradas
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-text-secondary">Carregando rotas...</div>
            ) : isError ? (
              <div className="p-8 text-center text-red-500">Erro ao carregar rotas.</div>
            ) : (routes as any[]).length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                    <th className="w-8 p-4"></th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">ID Rota</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Data</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Veículo / Motorista</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Paradas</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Status</th>
                    <th className="p-4 w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(routes as any[]).map((route) => {
                    const isExpanded = expandedRouteId === route.id;
                    const stops = route.stops || [];
                    const st = routeStatusBadge(route.status);
                    
                    return (
                      <React.Fragment key={route.id}>
                        <tr 
                          className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group ${isExpanded ? 'bg-black/5 dark:bg-white/5' : ''}`}
                          onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                        >
                          <td className="p-4">
                            {stops.length > 0 && (
                              <button className="text-text-secondary hover:text-brand-500 transition-colors">
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                              </button>
                            )}
                          </td>
                          <td className="p-4 font-medium text-text-primary">
                            ROTA-{route.id?.substring(0, 8).toUpperCase()}
                          </td>
                          <td className="p-4 text-sm text-text-secondary">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              {formatDate(route.execution_date)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-text-primary flex items-center gap-2">
                                <Truck size={14} className="text-text-secondary" />
                                {route.vehicle_id ? route.vehicle_id.substring(0, 8).toUpperCase() : 'Não Atribuído'}
                              </span>
                              <span className="text-xs text-text-secondary">
                                Motorista: {route.driver_id ? route.driver_id.substring(0, 8).toUpperCase() : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-text-primary font-medium">
                            {stops.length} paradas
                          </td>
                          <td className="p-4 text-right">
                            <Badge variant={st.variant} className="variant-glass">{st.label}</Badge>
                          </td>
                          <td className="p-4 text-right flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              onClick={(e) => { e.stopPropagation(); setMapRoute(route); }}
                              className="text-brand-500 hover:text-brand-600 hover:bg-brand-500/10 p-2 h-auto"
                              title="Ver Mapa"
                            >
                              <MapIcon size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              onClick={(e) => { e.stopPropagation(); setDispatchRoute(route); }}
                              className="text-brand-500 hover:text-brand-600 hover:bg-brand-500/10 p-2 h-auto"
                              title="Despachar Rota"
                            >
                              <Play size={18} />
                            </Button>
                          </td>
                        </tr>

                        {isExpanded && stops.length > 0 && (
                          <tr className="bg-black/5 dark:bg-white/5">
                            <td colSpan={7} className="p-0 border-t border-border">
                              <div className="p-6 ml-8">
                                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
                                  Pontos de Parada da Rota
                                </p>
                                <div className="space-y-3">
                                  {stops.map((stop: any, idx: number) => (
                                    <div key={stop.id || idx} className="flex items-center gap-4 bg-surface p-3 rounded-lg border border-border shadow-sm">
                                      <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 font-bold flex items-center justify-center text-sm">
                                        {idx + 1}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-text-primary">
                                          {stop.address || 'Endereço não especificado'}
                                        </p>
                                        <p className="text-xs text-text-secondary mt-1">
                                          Req ID: {stop.requirement_id?.substring(0, 8).toUpperCase()}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <Badge variant="outline" className="text-xs border-border">
                                          {stop.status || 'PENDING'}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="Nenhuma Rota Encontrada"
                  description="Você ainda não tem rotas operacionais cadastradas."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <AddRouteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      {dispatchRoute && (
        <DispatchWizard
          isOpen={!!dispatchRoute}
          onClose={() => setDispatchRoute(null)}
          route={dispatchRoute}
        />
      )}

      {mapRoute && (
        <RouteMapModal
          isOpen={!!mapRoute}
          onClose={() => setMapRoute(null)}
          route={mapRoute}
        />
      )}
    </div>
  )
}
