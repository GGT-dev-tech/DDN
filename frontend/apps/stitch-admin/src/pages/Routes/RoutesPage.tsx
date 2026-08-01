import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import { useListRoutesApiV1RoutingRoutesGet } from '../../shared/api/generated/routing/routing';
import { AddRouteModal } from './components/AddRouteModal';
import { DispatchWizard } from './components/DispatchWizard';
import { Route, Plus, MapPin, Calendar, Truck, ChevronDown, ChevronRight, Send } from 'lucide-react';

function routeStatusBadge(status: string) {
  switch (status) {
    case 'PLANNED':
      return <Badge variant="outline">Planejada</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="default">Em Andamento</Badge>;
    case 'COMPLETED':
      return <Badge variant="success">Concluída</Badge>;
    case 'CANCELLED':
      return <Badge variant="destructive">Cancelada</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  // Se for somente data (YYYY-MM-DD), parse diretamente para evitar timezone shift
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  }
  return dateStr;
}

export function RoutesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
  const [dispatchRoute, setDispatchRoute] = useState<any | null>(null);
  const { data: routes = [], isLoading, isError, refetch } = useListRoutesApiV1RoutingRoutesGet();

  if (isLoading) return (
    <div className="flex items-center justify-center p-16 text-zinc-400">
      Carregando rotas...
    </div>
  );

  if (isError) return (
    <div className="p-4 text-red-500 bg-red-500/10 rounded-lg">
      Erro ao carregar rotas. Verifique a conexão com a API.
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rotas</h1>
          <p className="text-muted-foreground mt-1">Visualize e gerencie as rotas de coleta planejadas.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Rota
        </Button>
      </div>

      {/* Summary stats */}
      {(routes as any[]).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: (routes as any[]).length, color: 'text-text-primary' },
            { label: 'Planejadas',    value: (routes as any[]).filter((r:any) => r.status === 'PLANNED').length,     color: 'text-zinc-400'  },
            { label: 'Em Andamento',  value: (routes as any[]).filter((r:any) => r.status === 'IN_PROGRESS').length, color: 'text-blue-400'  },
            { label: 'Concluídas',    value: (routes as any[]).filter((r:any) => r.status === 'COMPLETED').length,   color: 'text-green-400' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Routes table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Rotas Cadastradas</CardTitle>
          </div>
          <CardDescription>
            Clique em uma rota para ver os pontos de coleta (stops).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(routes as any[]).length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>ID da Rota</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Data</div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Veículo</div>
                  </TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Paradas</div>
                  </TableHead>
                  <TableHead>Distância</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(routes as any[]).map((route: any) => {
                  const isExpanded = expandedRouteId === route.id;
                  const stops = route.stops || [];
                  return (
                    <>
                      <TableRow
                        key={route.id}
                        className={`cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 ${isExpanded ? 'bg-black/5 dark:bg-white/5' : ''}`}
                        onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                      >
                        <TableCell>
                          {stops.length > 0
                            ? (isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />)
                            : null
                          }
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {route.id?.split('-')[0]}
                        </TableCell>
                        <TableCell className="font-medium">{formatDate(route.execution_date)}</TableCell>
                        <TableCell className="font-mono">{route.vehicle_id ? route.vehicle_id.split('-')[0] + '...' : <span className="text-muted-foreground text-xs">Não alocado</span>}</TableCell>
                        <TableCell>{route.driver_id ? route.driver_id.split('-')[0] + '...' : <span className="text-muted-foreground text-xs">Não alocado</span>}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {stops.length}
                          </span>
                        </TableCell>
                        <TableCell>
                          {route.planned_distance_km
                            ? `${Number(route.planned_distance_km).toFixed(1)} km`
                            : route.planned_distance
                            ? `${(route.planned_distance / 1000).toFixed(1)} km`
                            : '—'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-between gap-4">
                            {routeStatusBadge(route.status)}
                            {route.status === 'PLANNED' && (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setDispatchRoute(route); }}>
                                    <Send className="mr-1.5 h-3 w-3" />
                                    Despachar
                                </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded stops */}
                      {isExpanded && stops.length > 0 && (
                        <TableRow key={`${route.id}-stops`}>
                          <TableCell colSpan={8} className="p-0">
                            <div className="bg-black/5 dark:bg-white/5 px-8 py-4">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Pontos de Coleta ({stops.length})
                              </p>
                              <div className="space-y-2">
                                {stops.map((stop: any, idx: number) => (
                                  <div
                                    key={stop.id || idx}
                                    className="flex items-start gap-3 text-sm"
                                  >
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center text-xs font-bold">
                                      {idx + 1}
                                    </div>
                                    <div>
                                      <p className="font-medium">{stop.address || stop.location || `Parada #${idx + 1}`}</p>
                                      {stop.scheduled_time && (
                                        <p className="text-xs text-muted-foreground">{stop.scheduled_time}</p>
                                      )}
                                      {stop.status && (
                                        <span className="text-xs text-muted-foreground">{stop.status}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhuma rota cadastrada"
              description="Crie a primeira rota selecionando a data de execução, o veículo e o motorista responsável."
              action={
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Nova Rota
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <AddRouteModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); refetch(); }}
      />
      
      <DispatchWizard
        isOpen={!!dispatchRoute}
        onClose={() => { setDispatchRoute(null); refetch(); }}
        route={dispatchRoute}
      />
    </div>
  );
}
