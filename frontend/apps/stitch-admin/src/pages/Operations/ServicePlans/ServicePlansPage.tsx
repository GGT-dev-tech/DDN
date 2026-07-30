import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/ui/components/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/components/Table'
import { Badge } from '../../../shared/ui/components/Badge'
import { Button } from '../../../shared/ui/components/Button'
import { EmptyState } from '../../../shared/ui/components/EmptyState'
import { Plus, CalendarDays } from 'lucide-react'
import { useListAllPlansApiV1ServicePlansGet } from '../../../shared/api/generated/service-plans/service-plans'
import { AddServicePlanModal } from './components/AddServicePlanModal'
import { useState } from 'react'

export function ServicePlansPage() {
  const { data: plans = [], isLoading } = useListAllPlansApiV1ServicePlansGet()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos de Serviço</h1>
          <p className="text-muted-foreground mt-1">Gerencie os planos operacionais e recorrências de coleta.</p>
        </div>
      </div>

      <AddServicePlanModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Planos Ativos</CardTitle>
            </div>
            <CardDescription>
              Planos gerados a partir de contratos para definir as regras de coleta.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Plano Manual
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-zinc-500">Carregando planos de serviço...</div>
          ) : plans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contrato Ref.</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan: any) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.customer_name || plan.company_id}</TableCell>
                    <TableCell>{plan.contract_id}</TableCell>
                    <TableCell>{plan.effective_date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{plan.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhum plano de serviço"
              description="Os planos de serviço são gerados automaticamente quando um contrato é fechado, ou podem ser criados manualmente."
              action={
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Criar Plano Manualmente
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
