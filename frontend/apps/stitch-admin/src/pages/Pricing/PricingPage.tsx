import { useState } from 'react'
import { Badge } from '../../shared/ui/components/Badge'
import { Button } from '../../shared/ui/components/Button'
import { Modal } from '../../shared/ui/components/Modal'
import { EmptyState } from '../../shared/ui/components/EmptyState'
import { PriceTableForm } from './components/PriceTableForm'
import { PricingRuleForm } from './components/PricingRuleForm'
import { PriceTableItemForm } from './components/PriceTableItemForm'
import { Plus, CircleDollarSign, ChevronDown, ChevronRight, Package, Calculator } from 'lucide-react'

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
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <CircleDollarSign size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Precificação</h1>
              <p className="text-sm text-text-secondary mt-1">
                Gerencie matrizes, tabelas e regras de preços para as cotações.
              </p>
            </div>
          </div>
        </div>

        {/* Price Tables */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <CircleDollarSign size={18} className="text-brand-500" />
              Tabelas de Preços Base
            </div>
            <Button variant="liquid" onClick={() => setIsAddModalOpen(true)} className="gap-2 h-8 text-xs">
              <Plus size={14} /> Nova Tabela
            </Button>
          </div>
          
          <div className="p-5">
            {isLoading ? (
              <div className="py-8 text-center text-text-secondary">Carregando tabelas...</div>
            ) : tables.length > 0 ? (
              <div className="space-y-4">
                {tables.map((table: any) => (
                  <div key={table.id} className="border border-border/50 bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden transition-colors hover:bg-black/10 dark:hover:bg-white/10">
                    <div
                      className="flex items-center justify-between px-5 py-4 cursor-pointer"
                      onClick={() => toggleExpand(table.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-text-secondary">
                          {expandedTableId === table.id
                            ? <ChevronDown size={18} />
                            : <ChevronRight size={18} />
                          }
                        </div>
                        <div>
                          <span className="font-semibold text-text-primary">{table.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={table.is_active ? 'success' : 'outline'} className="variant-glass text-xs">
                              {table.is_active ? 'Ativa' : 'Inativa'}
                            </Badge>
                            {table.customer_id && (
                              <Badge variant="liquid" className="text-xs">Cliente Específico</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-text-secondary">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Package size={14} />
                          {table.items?.length ?? 0} itens
                        </span>
                        <span className="font-mono text-xs opacity-70">{table.effective_date}</span>
                        <Button
                          variant="liquid"
                          className="h-8 px-3 text-xs"
                          onClick={(e) => { e.stopPropagation(); setAddItemTableId(table.id); }}
                        >
                          <Plus size={12} className="mr-1.5" /> Item
                        </Button>
                      </div>
                    </div>

                    {/* Expanded items */}
                    {expandedTableId === table.id && (
                      <div className="border-t border-border/50 bg-background/50 px-5 py-4">
                        {table.items && table.items.length > 0 ? (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-border/30 text-xs text-text-secondary">
                                <th className="pb-2 font-medium">Serviço ID</th>
                                <th className="pb-2 font-medium">Unidade de Medida</th>
                                <th className="pb-2 font-medium text-right">Preço Unitário (R$)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30 text-sm">
                              {table.items.map((item: any) => (
                                <tr key={item.id} className="hover:bg-white/5">
                                  <td className="py-2.5 font-mono text-xs text-text-secondary">{item.service_offering_id}</td>
                                  <td className="py-2.5 text-text-primary">{item.unit_of_measure_id}</td>
                                  <td className="py-2.5 text-right font-mono font-semibold text-brand-500">
                                    R$ {parseFloat(item.unit_price_amount || item.unit_price?.amount || 0).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-sm text-text-secondary text-center py-6">
                            Nenhum item nesta tabela.{' '}
                            <button
                              className="text-brand-400 underline font-medium hover:text-brand-300"
                              onClick={() => setAddItemTableId(table.id)}
                            >
                              Adicionar primeiro item
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
                description="Você precisa criar uma tabela de preços base antes de emitir Cotações comerciais."
                action={
                  <Button onClick={() => setIsAddModalOpen(true)} className="mt-4 gap-2">
                    <Plus size={16} /> Nova Tabela
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Pricing Rules */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <Calculator size={18} className="text-brand-500" />
              Regras de Modificação de Preço
            </div>
            <Button variant="liquid" onClick={() => setIsAddRuleModalOpen(true)} className="gap-2 h-8 text-xs">
              <Plus size={14} /> Nova Regra
            </Button>
          </div>
          <div className="p-5">
            <EmptyState
              title="Nenhuma regra configurada"
              description="Crie regras de precificação para aplicar multiplicadores (ex: descontos por cliente, acréscimo por distância) automaticamente nas cotações."
              action={
                <Button onClick={() => setIsAddRuleModalOpen(true)} className="mt-4 gap-2">
                  <Plus size={16} /> Nova Regra
                </Button>
              }
            />
          </div>
        </div>

      </div>

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
