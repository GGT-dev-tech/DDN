import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/ui/components/Card'
import { Button } from '../../../shared/ui/components/Button'
import { EmptyState } from '../../../shared/ui/components/EmptyState'
import { Map, Zap } from 'lucide-react'
import { Badge } from '../../../shared/ui/components/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/components/Table'
import { useListRoutesApiV1RoutingRoutesGet } from '../../../shared/api/generated/routing/routing'

export function PlannerPage() {
  const { data: routes = [], isLoading } = useListRoutesApiV1RoutingRoutesGet()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planejador (Planner)</h1>
          <p className="text-muted-foreground mt-1">Geração automática e manual de rotas para o dia seguinte.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Painel de Roteirização</CardTitle>
            </div>
            <CardDescription>
              Selecione os requisitos de coleta e aloque em veículos disponíveis.
            </CardDescription>
          </div>
          <Button variant="glass" className="bg-brand-500 text-white hover:bg-brand-600 border-none">
            <Zap className="mr-2 h-4 w-4" /> Roteirização Automática
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-zinc-500">Carregando rotas...</div>
          ) : routes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data de Execução</TableHead>
                  <TableHead>Placa/Veículo</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route: any) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.execution_date}</TableCell>
                    <TableCell>{route.vehicle_id || 'Não alocado'}</TableCell>
                    <TableCell>{route.driver_id || 'Não alocado'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{route.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Planejador em construção"
              description="Nenhuma rota gerada ainda. A interface de roteirização visual interativa será habilitada na próxima fase."
              action={
                <Button disabled variant="glass">
                  Módulo Indisponível
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
