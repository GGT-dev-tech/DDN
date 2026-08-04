import { useState } from 'react'
import { Badge } from '../../../shared/ui/components/Badge'
import { Button } from '../../../shared/ui/components/Button'
import { EmptyState } from '../../../shared/ui/components/EmptyState'
import { useListInvoicesApiV1BillingInvoicesGet } from '../../../shared/api/generated/billing/billing'
import { FileText, Play, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react'
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

export function BillingInvoicesTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const { data: invoices = [], isLoading, refetch } = useListInvoicesApiV1BillingInvoicesGet()

  const handleGenerateDaily = async () => {
    try {
      setIsGenerating(true)
      const currentMonth = format(new Date(), 'yyyy-MM')
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/billing/invoices/generate?reference_month=${currentMonth}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ddn_auth_token')}`
        }
      })
      
      if (res.ok) {
        const data = await res.json()
        toast.success(`Sucesso! ${data.count} faturas geradas.`)
        refetch()
      } else {
        toast.error('Erro ao gerar faturas.')
      }
    } catch (error) {
      toast.error('Erro de conexão ao gerar faturas.')
    } finally {
      setIsGenerating(false)
    }
  }

  const totalAmount = (invoices as any[]).reduce((acc, inv) => acc + (inv.total_amount || 0), 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Faturamento de Clientes</h2>
          <p className="text-sm text-text-secondary mt-1">Gere as faturas a partir das Ordens de Serviço (Pesagem finalizada).</p>
        </div>
        <Button variant="liquid" onClick={handleGenerateDaily} disabled={isGenerating} className="gap-2">
          <Play size={16} /> 
          {isGenerating ? 'Processando...' : 'Rodar Fechamento'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-border flex items-center justify-between bg-brand-500/5">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Total a Receber</p>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalAmount)}</p>
          </div>
          <FileText size={24} className="text-brand-500 opacity-80" />
        </div>
        <div className="glass-panel p-5 rounded-xl border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Faturas Geradas</p>
            <p className="text-2xl font-bold text-text-primary">{(invoices as any[]).length}</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Status Emissão (NF-e)</p>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 size={18} className="text-success-500" />
              <span className="font-semibold text-success-500">Pronto</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
            <FileText size={16} className="text-brand-500" />
            Faturas Lógicas
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="py-8 text-center text-text-secondary">Carregando faturas...</div>
          ) : (invoices as any[]).length > 0 ? (
            <div className="space-y-3">
              {(invoices as any[]).map((invoice: any) => {
                const isExpanded = expandedId === invoice.id;
                const items = invoice.items || [];
                const st = statusBadge(invoice.status);
                return (
                  <div key={invoice.id} className="border border-border/50 bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden transition-colors hover:bg-black/10 dark:hover:bg-white/10">
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer"
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
                          <span className="font-semibold text-text-primary text-sm">Fatura {invoice.id?.split('-')[0]}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={st.variant} className="variant-glass px-1.5 py-0 text-[10px]">
                              {st.label}
                            </Badge>
                            <span className="text-[10px] text-text-secondary uppercase">Ref: {invoice.reference_month}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <span className="font-mono text-xs opacity-70">Cliente: {invoice.company_id?.split('-')[0]}</span>
                        <span className="font-mono font-bold text-brand-500">
                          {formatCurrency(invoice.total_amount)}
                        </span>
                      </div>
                    </div>

                    {isExpanded && items.length > 0 && (
                      <div className="border-t border-border/50 bg-background/50 px-4 py-3">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                          Detalhamento (Ordens e MTRs)
                        </p>
                        <div className="space-y-2">
                          {items.map((item: any, idx: number) => (
                            <div
                              key={item.id || idx}
                              className="flex items-center justify-between text-sm glass-panel p-2.5 rounded-lg border border-border/30"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded bg-brand-500/20 text-brand-500 flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-text-primary text-xs">{item.description}</p>
                                  <p className="text-[10px] text-text-secondary mt-0.5">OS: {item.service_order_id?.split('-')[0]}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-text-primary tabular-nums text-[10px] opacity-80">{item.quantity} x {formatCurrency(item.unit_price)}</p>
                                <p className="text-xs font-bold text-brand-500 tabular-nums">{formatCurrency(item.total_price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                           <Button variant="liquid" className="h-8 text-xs px-3">Emitir NF-e</Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma fatura pendente"
              description="Aguarde novas OSs concluídas para gerar o faturamento."
              action={
                <Button onClick={handleGenerateDaily} disabled={isGenerating} className="mt-2 gap-2">
                  <Play size={14} /> Fechar o Dia
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
