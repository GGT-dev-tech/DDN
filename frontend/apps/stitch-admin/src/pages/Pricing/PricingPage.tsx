import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table'
import { Badge } from '../../shared/ui/components/Badge'
import { Button } from '../../shared/ui/components/Button'
import { Modal } from '../../shared/ui/components/Modal'
import { EmptyState } from '../../shared/ui/components/EmptyState'
import { PriceTableForm } from './components/PriceTableForm'
import { PricingRuleForm } from './components/PricingRuleForm'
import { PriceTableItemForm } from './components/PriceTableItemForm'
import { Plus, CircleDollarSign, ChevronDown, ChevronRight, Package } from 'lucide-react'

import {
  useListPriceTablesApiV1PricingTablesGet,
} from '../../shared/api/generated/pricing/pricing'

export function PricingPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false)
  const [addItemTableId, setAddItemTableId] = useState<string | null>(null)
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null)
  const { data: tables = [], isLoading, refetch } = useListPriceTablesApiV1PricingTablesGet()

  const toggleExpand = (id: string) => {
    setExpandedTableId(prev => prev === id ? null : id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Precificação</h1>
          <p className="text-muted-foreground mt-1">Gerencie matrizes e regras de preços.</p>
        </div>
      </div>

      {/* Price Tables */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Tabelas de Preços</CardTitle>
            </div>
            <CardDescription>
              Defina o preço unitário de cada serviço por tabela. Você pode criar tabelas globais ou por cliente.
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
            <div className="space-y-2">
              {tables.map((table: any) => (
                <div key={table.id} className="border border-border rounded-xl overflow-hidden">
                  {/* Table row header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    onClick={() => toggleExpand(table.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedTableId === table.id
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      }
                      <span className="font-medium text-sm">{table.name}</span>
                      <Badge variant={table.is_active ? 'default' : 'outline'} className="text-xs">
                        {table.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                      {table.customer_id && (
                        <Badge variant="liquid" className="text-xs">Cliente Específico</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {table.items?.length ?? 0} itens
                      </span>
                      <span>{table.effective_date}</span>
                      <Button
                        variant="liquid"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => { e.stopPropagation(); setAddItemTableId(table.id); }}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Item
                      </Button>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {expandedTableId === table.id && (
                    <div className="border-t border-border bg-black/2 dark:bg-white/2 px-4 py-3">
                      {table.items && table.items.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Serviço</TableHead>
                              <TableHead>Unidade</TableHead>
                              <TableHead className="text-right">Preço Unitário</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {table.items.map((item: any) => (
                              <TableRow key={item.id}>
                                <TableCell className="text-sm">{item.service_offering_id}</TableCell>
                                <TableCell className="text-sm">{item.unit_of_measure_id}</TableCell>
                                <TableCell className="text-right font-mono text-sm">
                                  R$ {parseFloat(item.unit_price_amount || item.unit_price?.amount || 0).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          Nenhum item nesta tabela.{' '}
                          <button
                            className="text-brand-400 underline"
                            onClick={() => setAddItemTableId(table.id)}
                          >
                            Adicionar item
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
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

      {/* Pricing Rules */}
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

      {/* Modals */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Nova Tabela de Preços"
      >
        <PriceTableForm
          onSuccess={() => { setIsAddModalOpen(false); refetch(); }}
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

      <Modal
        isOpen={!!addItemTableId}
        onClose={() => setAddItemTableId(null)}
        title="Adicionar Item à Tabela"
      >
        {addItemTableId && (
          <PriceTableItemForm
            tableId={addItemTableId}
            onSuccess={() => { setAddItemTableId(null); refetch(); }}
            onCancel={() => setAddItemTableId(null)}
          />
        )}
      </Modal>
    </div>
  )
}
