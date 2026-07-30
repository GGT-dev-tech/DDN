import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/ui/components/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/components/Table'
import { Badge } from '../../../shared/ui/components/Badge'
import { Button } from '../../../shared/ui/components/Button'
import { EmptyState } from '../../../shared/ui/components/EmptyState'
import { Plus, ListChecks } from 'lucide-react'

const MOCK_REQS: any[] = []

export function RequirementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requisitos de Coleta</h1>
          <p className="text-muted-foreground mt-1">Visão individualizada de cada coleta agendada ou sob demanda.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Requisitos Abertos</CardTitle>
            </div>
            <CardDescription>
              Demandas que precisam ser roteirizadas e executadas.
            </CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova Coleta Avulsa
          </Button>
        </CardHeader>
        <CardContent>
          {MOCK_REQS.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Limite</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Resíduo/Serviço</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_REQS.map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.due_date}</TableCell>
                    <TableCell>{req.customer_name}</TableCell>
                    <TableCell>{req.service_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{req.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhum requisito pendente"
              description="Você não possui coletas pendentes para roteirização no momento."
              action={
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Criar Coleta Avulsa
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
