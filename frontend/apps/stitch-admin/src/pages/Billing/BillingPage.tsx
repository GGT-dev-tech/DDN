import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table'
import { Badge } from '../../shared/ui/components/Badge'
import { Button } from '../../../../shared/ui/components/Button' // using proper path later if needed, we'll use relative
import { EmptyState } from '../../shared/ui/components/EmptyState'
import { useListInvoicesApiV1BillingInvoicesGet, useGenerateDailyBillingApiV1BillingGenerateDailyPost } from '../../shared/api/generated/billing/billing'
import { FileText, Play, CheckCircle2, ChevronDown, ChevronRight, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

function statusBadge(status: string) {
  switch (status) {
    case 'DRAFT': return <Badge variant="outline">Rascunho</Badge>
    case 'ISSUED': return <Badge className="bg-blue-500">Emitida</Badge>
    case 'PAID': return <Badge variant="success">Paga</Badge>
    case 'CANCELLED': return <Badge variant="destructive">Cancelada</Badge>
    default: return <Badge variant="outline">{status}</Badge>
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
    // Generate for today
    generateBilling({
      data: {
        reference_date: format(new Date(), 'yyyy-MM-dd')
      }
    }, {
      onSuccess: (res) => {
        toast.success(`Faturamento diário executado! ${res.invoice_ids.length} faturas geradas.`)
        refetch()
      },
      onError: () => {
        toast.error('Erro ao gerar faturamento diário.')
      }
    })
  }

  if (isLoading) return (
    <div className="flex items-center justify-center p-16 text-zinc-400">
      Carregando faturas...
    </div>
  )

  const totalAmount = (invoices as any[]).reduce((acc, inv) => acc + (inv.total_amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faturamento Diário</h1>
          <p className="text-muted-foreground mt-1">Feche o dia consolidando os serviços realizados e gerando as faturas.</p>
        </div>
        <Button onClick={handleGenerateDaily} disabled={isGenerating}>
          <Play className="mr-2 h-4 w-4" /> 
          {isGenerating ? 'Processando...' : 'Rodar Fechamento de Hoje'}
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Faturado</p>
            <p className="text-3xl font-bold text-text-primary">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Faturas Geradas</p>
            <p className="text-3xl font-bold text-blue-400">{(invoices as any[]).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Status do Fechamento (Hoje)</p>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <span className="text-xl font-bold text-green-500">Pronto</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Faturas Emitidas</CardTitle>
          </div>
          <CardDescription>
            Lista de faturas consolidadas por cliente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(invoices as any[]).length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>ID Fatura</TableHead>
                  <TableHead>Data (Ref)</TableHead>
                  <TableHead>ID Cliente (Company)</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(invoices as any[]).map((invoice: any) => {
                  const isExpanded = expandedId === invoice.id;
                  const items = invoice.items || [];
                  return (
                    <>
                      <TableRow
                        key={invoice.id}
                        className={`cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 ${isExpanded ? 'bg-black/5 dark:bg-white/5' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : invoice.id)}
                      >
                        <TableCell>
                          {items.length > 0
                            ? (isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />)
                            : null
                          }
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {invoice.id?.split('-')[0]}
                        </TableCell>
                        <TableCell className="font-medium">{invoice.reference_date}</TableCell>
                        <TableCell className="font-mono">{invoice.company_id?.split('-')[0]}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(invoice.total_amount)}</TableCell>
                        <TableCell>{statusBadge(invoice.status)}</TableCell>
                      </TableRow>

                      {/* Expanded items */}
                      {isExpanded && items.length > 0 && (
                        <TableRow key={`${invoice.id}-items`}>
                          <TableCell colSpan={6} className="p-0">
                            <div className="bg-black/5 dark:bg-white/5 px-8 py-4">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Itens Faturados ({items.length})
                              </p>
                              <div className="space-y-2">
                                {items.map((item: any, idx: number) => (
                                  <div
                                    key={item.id || idx}
                                    className="flex items-center justify-between text-sm bg-card p-2 rounded border"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                      </div>
                                      <div>
                                        <p className="font-medium">{item.description}</p>
                                        <p className="text-xs text-muted-foreground">OS: {item.service_order_id.split('-')[0]}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">{item.quantity} x {formatCurrency(item.unit_price)}</p>
                                      <p className="text-xs font-bold text-brand-500">{formatCurrency(item.total_price)}</p>
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
              title="Nenhuma fatura gerada hoje"
              description="Rode o Fechamento de Hoje para consolidar os serviços e emitir faturas."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
