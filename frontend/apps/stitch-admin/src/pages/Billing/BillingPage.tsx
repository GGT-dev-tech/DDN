import { useState } from 'react'
import { Badge } from '../../shared/ui/components/Badge'
import { Button } from '../../shared/ui/components/Button'
import { EmptyState } from '../../shared/ui/components/EmptyState'
import { useListInvoicesApiV1BillingInvoicesGet, useGenerateDailyBillingApiV1BillingGenerateDailyPost } from '../../shared/api/generated/billing/billing'
import { FileText, Play, CheckCircle2, ChevronDown, ChevronRight, Calculator } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

function statusBadge(status: string) {
  switch (status) {
    case 'DRAFT': return { label: 'Rascunho', variant: 'outline' as const }
    case 'ISSUED': return { label: 'Emitida', variant: 'default' as const }
    case 'PAID': return { label: 'Paga', variant: 'success' as const }
    case 'CANCELLED': return { label: 'Cancelada', variant: 'destructive' as const }
    default: return { label: status, variant: 'outline' as const }
  }
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export function BillingPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  const { data: invoices = [], isLoading, refetch } = useListInvoicesApiV1BillingInvoicesGet()
  const { mutate: generateBilling, isPending: isGenerating } = useGenerateDailyBillingApiV1BillingGenerateDailyPost()

  const handleGenerateDaily = () => {
    generateBilling({
      data: {
        reference_date: format(new Date(), 'yyyy-MM-dd')
      }
    }, {
      onSuccess: (res: any) => {
        toast.success(`Faturamento diário executado! ${res.invoice_ids.length} faturas geradas.`)
        refetch()
      },
      onError: () => {
        toast.error('Erro ao gerar faturamento diário.')
      }
    })
  }

  const totalAmount = (invoices as any[]).reduce((acc, inv) => acc + (inv.total_amount || 0), 0)

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Faturamento Diário</h1>
              <p className="text-sm text-text-secondary mt-1">
                Feche o dia consolidando os serviços realizados e gerando as faturas lógicas.
              </p>
            </div>
          </div>
          <Button variant="liquid" onClick={handleGenerateDaily} disabled={isGenerating} className="gap-2">
            <Play size={18} /> 
            {isGenerating ? 'Processando...' : 'Rodar Fechamento de Hoje'}
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Total Faturado</p>
              <p className="text-3xl font-bold text-text-primary">{formatCurrency(totalAmount)}</p>
            </div>
            <FileText size={32} className="text-text-secondary opacity-50" />
          </div>
          <div className="glass-panel p-6 rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Faturas Geradas</p>
              <p className="text-3xl font-bold text-brand-500">{(invoices as any[]).length}</p>
            </div>
            <FileText size={32} className="text-brand-500 opacity-50" />
          </div>
          <div className="glass-panel p-6 rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Status Hoje</p>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 size={24} className="text-success-500" />
                <span className="text-xl font-bold text-success-500">Pronto</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Faturas */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <FileText size={18} className="text-brand-500" />
              Faturas Emitidas
            </div>
          </div>

          <div className="p-5">
            {isLoading ? (
              <div className="py-8 text-center text-text-secondary">Carregando faturas...</div>
            ) : (invoices as any[]).length > 0 ? (
              <div className="space-y-4">
                {(invoices as any[]).map((invoice: any) => {
                  const isExpanded = expandedId === invoice.id;
                  const items = invoice.items || [];
                  const st = statusBadge(invoice.status);
                  return (
                    <div key={invoice.id} className="border border-border/50 bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden transition-colors hover:bg-black/10 dark:hover:bg-white/10">
                      <div
                        className="flex items-center justify-between px-5 py-4 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : invoice.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-text-secondary">
                            {items.length > 0
                              ? (isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />)
                              : <div className="w-[18px]"></div>
                            }
                          </div>
                          <div>
                            <span className="font-semibold text-text-primary">Fatura {invoice.id?.split('-')[0]}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={st.variant} className="variant-glass text-xs">
                                {st.label}
                              </Badge>
                              <span className="text-xs text-text-secondary">Ref: {invoice.reference_date}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-text-secondary">
                          <span className="font-mono text-xs opacity-70">Cliente: {invoice.company_id?.split('-')[0]}</span>
                          <span className="font-mono font-bold text-brand-500 text-lg">
                            {formatCurrency(invoice.total_amount)}
                          </span>
                        </div>
                      </div>

                      {/* Expanded items */}
                      {isExpanded && items.length > 0 && (
                        <div className="border-t border-border/50 bg-background/50 px-5 py-4">
                          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                            Itens Faturados ({items.length})
                          </p>
                          <div className="space-y-2">
                            {items.map((item: any, idx: number) => (
                              <div
                                key={item.id || idx}
                                className="flex items-center justify-between text-sm glass-panel p-3 rounded-lg border border-border/30"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 rounded-md bg-brand-500/20 text-brand-500 flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium text-text-primary">{item.description}</p>
                                    <p className="text-xs text-text-secondary">Ordem de Serviço: {item.service_order_id?.split('-')[0]}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-text-primary tabular-nums text-xs opacity-80">{item.quantity} x {formatCurrency(item.unit_price)}</p>
                                  <p className="text-sm font-bold text-brand-500 tabular-nums">{formatCurrency(item.total_price)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Nenhuma fatura gerada hoje"
                description="Rode o Fechamento de Hoje para consolidar os serviços e emitir faturas lógicas para os clientes."
                action={
                  <Button onClick={handleGenerateDaily} disabled={isGenerating} className="mt-4 gap-2">
                    <Play size={16} /> Fechar o Dia
                  </Button>
                }
              />
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
