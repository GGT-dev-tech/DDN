import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table'
import { Badge } from '../../shared/ui/components/Badge'
import { Button } from '../../shared/ui/components/Button'
import { Modal } from '../../shared/ui/components/Modal'
import { EmptyState } from '../../shared/ui/components/EmptyState'
import { PriceTableForm } from './components/PriceTableForm'
import { PricingRuleForm } from './components/PricingRuleForm'
import { Plus, CircleDollarSign } from 'lucide-react'

import { useListPriceTablesApiV1PricingTablesGet } from '../../shared/api/generated/pricing/pricing'

export function PricingPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false)
  const { data: tables = [], isLoading, refetch } = useListPriceTablesApiV1PricingTablesGet()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Precificação</h1>
          <p className="text-muted-foreground mt-1">Gerencie matrizes e regras de preços.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Tabelas de Preços</CardTitle>
            </div>
            <CardDescription>
              Crie tabelas padrão ou específicas por cliente.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Tabela
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-zinc-500">Carregando...</div>
          ) : tables.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Escopo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table: any) => (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium">{table.name}</TableCell>
                    <TableCell>
                      {table.effective_date} 
                      {table.end_date ? ` até ${table.end_date}` : ' (Atual)'}
                    </TableCell>
                    <TableCell>
                      {table.customer_id ? 'Cliente Específico' : 'Global'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={table.is_active ? 'default' : 'outline'}>
                        {table.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhuma tabela de preços"
              description="Você precisa criar uma tabela de preços base antes de emitir Cotações."
              action={
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Nova Tabela
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Regras de Preços</CardTitle>
            </div>
            <CardDescription>
              Regras que aplicam descontos ou acréscimos dinamicamente.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddRuleModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Regra
          </Button>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Nenhuma regra configurada"
            description="Crie regras de precificação para aplicar multiplicadores automaticamente nas cotações."
            action={
              <Button onClick={() => setIsAddRuleModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nova Regra
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Nova Tabela de Preços"
      >
        <PriceTableForm 
          onSuccess={() => {
            setIsAddModalOpen(false)
            refetch()
          }} 
          onCancel={() => setIsAddModalOpen(false)} 
        />
      </Modal>

      <Modal 
        isOpen={isAddRuleModalOpen} 
        onClose={() => setIsAddRuleModalOpen(false)}
        title="Nova Regra de Precificação"
      >
        <PricingRuleForm 
          onSuccess={() => setIsAddRuleModalOpen(false)} 
          onCancel={() => setIsAddRuleModalOpen(false)} 
        />
      </Modal>
    </div>
  )
}
