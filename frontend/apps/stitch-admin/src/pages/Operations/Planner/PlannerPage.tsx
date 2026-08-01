import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/ui/components/Card'
import { Button } from '../../../shared/ui/components/Button'
import { EmptyState } from '../../../shared/ui/components/EmptyState'
import { Badge } from '../../../shared/ui/components/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/components/Table'
import { Map, Zap, RefreshCw, CalendarCheck, Truck, Users, AlertCircle } from 'lucide-react'
import { useListRoutesApiV1RoutingRoutesGet, useListRequirementsApiV1RoutingRequirementsGet, useTriggerRouteOptimizationApiV1RoutingOptimizePost, getListRoutesApiV1RoutingRoutesGetQueryKey, getListRequirementsApiV1RoutingRequirementsGetQueryKey } from '../../../shared/api/generated/routing/routing'
import { useListVehiclesApiV1FleetVehiclesGet, useListDriversApiV1FleetDriversGet } from '../../../shared/api/generated/fleet/fleet'
import { AddRouteModal } from '../../Routes/components/AddRouteModal'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

function requirementStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':    return <Badge variant="warning">Pendente</Badge>
    case 'SCHEDULED':  return <Badge variant="default">Agendado</Badge>
    case 'COMPLETED':  return <Badge variant="success">Concluído</Badge>
    case 'CANCELLED':  return <Badge variant="destructive">Cancelado</Badge>
    default:           return <Badge variant="outline">{status}</Badge>
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

  const { data: routes       = [], isLoading: loadingRoutes }       = useListRoutesApiV1RoutingRoutesGet()
  const { data: requirements = [], isLoading: loadingRequirements } = useListRequirementsApiV1RoutingRequirementsGet()
  const { data: vehicles     = [] }                                  = useListVehiclesApiV1FleetVehiclesGet()
  const { data: drivers      = [] }                                  = useListDriversApiV1FleetDriversGet()
  
  const queryClient = useQueryClient()
  const { mutateAsync: optimizeRoutes, isPending: isOptimizing } = useTriggerRouteOptimizationApiV1RoutingOptimizePost()

  const pendingRequirements  = (requirements as any[]).filter(r => r.status === 'PENDING')
  const availableVehicles    = (vehicles     as any[]).filter(v => v.status === 'ACTIVE')
  const availableDrivers     = (drivers      as any[]).filter(d => d.status === 'AVAILABLE')
  const todayRoutes          = (routes       as any[]).filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED')

  const handleAutoRoute = async () => {
    if (pendingRequirements.length === 0) {
      toast.info('Não há requisitos pendentes para otimizar.')
      return
    }
    try {
      const today = new Date().toISOString().split('T')[0]
      await optimizeRoutes({ data: { target_date: today } })
      toast.success('Otimização de rotas iniciada com sucesso! As rotas aparecerão em breve.')
      
      // Optativamente invalidar depois de um tempo
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: getListRoutesApiV1RoutingRoutesGetQueryKey() })
        queryClient.invalidateQueries({ queryKey: getListRequirementsApiV1RoutingRequirementsGetQueryKey() })
      }, 5000)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao iniciar a roteirização automática.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planejador</h1>
          <p className="text-muted-foreground mt-1">Geração automática e manual de rotas para execução.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" onClick={handleAutoRoute} disabled={isOptimizing || pendingRequirements.length === 0}>
            {isOptimizing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />} 
            {isOptimizing ? 'Roteirizando...' : 'Roteirização Automática'}
          </Button>
          <Button onClick={() => setIsAddRouteOpen(true)}>
            <Map className="mr-2 h-4 w-4" /> Nova Rota Manual
          </Button>
        </div>
      </div>

      {/* Resource availability cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={pendingRequirements.length > 0 ? 'border-yellow-500/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Requisitos Pendentes</p>
              {pendingRequirements.length > 0 && (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <p className={`text-3xl font-bold ${pendingRequirements.length > 0 ? 'text-yellow-500' : 'text-text-primary'}`}>
              {loadingRequirements ? '...' : pendingRequirements.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">coletas a serem roteirizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Veículos Disponíveis</p>
              <Truck className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-500">{availableVehicles.length}</p>
            <p className="text-xs text-muted-foreground mt-1">de {(vehicles as any[]).length} veículos no total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Motoristas Disponíveis</p>
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">{availableDrivers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">de {(drivers as any[]).length} motoristas no total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pending requirements */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Requisitos Pendentes de Roteirização</CardTitle>
            </div>
            <CardDescription>
              Serviços agendados que ainda precisam ser alocados em rotas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRequirements ? (
              <div className="py-8 text-center text-zinc-500">Carregando requisitos...</div>
            ) : pendingRequirements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Data Prevista</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequirements.map((req: any) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium text-sm">
                        {req.service_name || req.service_offering_id?.split('-')[0] || 'Serviço'}
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(req.scheduled_date || req.due_date)}</TableCell>
                      <TableCell>{requirementStatusBadge(req.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Nenhum requisito pendente"
                description="Todos os requisitos de serviço já foram roteirizados, ou ainda não há planos de serviço ativos gerando requisitos."
              />
            )}
          </CardContent>
        </Card>

        {/* Active routes */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Rotas Ativas / Planejadas</CardTitle>
              </div>
              <CardDescription>
                Rotas criadas aguardando ou em execução.
              </CardDescription>
            </div>
            <Button variant="ghost" className="p-2" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingRoutes ? (
              <div className="py-8 text-center text-zinc-500">Carregando rotas...</div>
            ) : todayRoutes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Paradas</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayRoutes.map((route: any) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{formatDate(route.execution_date)}</TableCell>
                      <TableCell>{(route.stops || []).length} paradas</TableCell>
                      <TableCell>
                        <Badge variant={route.status === 'PLANNED' ? 'outline' : 'default'}>
                          {route.status === 'PLANNED' ? 'Planejada' : route.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Nenhuma rota ativa"
                description="Crie uma rota manual ou use a roteirização automática para gerar rotas a partir dos requisitos pendentes."
                action={
                  <Button onClick={() => setIsAddRouteOpen(true)}>
                    <Map className="mr-2 h-4 w-4" /> Criar Rota
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <AddRouteModal
        isOpen={isAddRouteOpen}
        onClose={() => setIsAddRouteOpen(false)}
      />
    </div>
  )
}
