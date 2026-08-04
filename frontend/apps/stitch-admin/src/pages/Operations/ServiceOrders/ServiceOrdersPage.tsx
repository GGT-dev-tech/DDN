import { useEffect, useState } from 'react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/components/Table'
import { Badge } from '../../../shared/ui/components/Badge'
import { Button } from '../../../shared/ui/components/Button'
import { EmptyState } from '../../../shared/ui/components/EmptyState'
import { ClipboardList, RefreshCw, CheckCircle2, Play, CircleDot, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { ServiceOrderDetailsModal } from './ServiceOrderDetailsModal'

export function ServiceOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [generatingMtr, setGeneratingMtr] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/logistics/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setOrders(data)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar Ordens de Serviço')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateMtr = async (orderId: string) => {
    setGeneratingMtr(orderId)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/compliance/mtrs/${orderId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao gerar MTR')
      }
      toast.success('MTR gerado com sucesso!')
      fetchOrders()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setGeneratingMtr(null)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Ordens de Serviço</h1>
              <p className="text-sm text-text-secondary mt-1">
                Gerencie as coletas programadas e gere os documentos ambientais (MTR).
              </p>
            </div>
          </div>
          <Button onClick={fetchOrders} variant="glass" className="gap-2">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Atualizar
          </Button>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-border">
          {isLoading ? (
            <div className="py-12 flex justify-center items-center text-brand-500">
              <RefreshCw className="animate-spin h-8 w-8" />
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-text-secondary font-semibold uppercase tracking-wider text-xs">Data Prog.</TableHead>
                    <TableHead className="text-text-secondary font-semibold uppercase tracking-wider text-xs">Itens</TableHead>
                    <TableHead className="text-text-secondary font-semibold uppercase tracking-wider text-xs">Status</TableHead>
                    <TableHead className="text-text-secondary font-semibold uppercase tracking-wider text-xs text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id} className="border-border/50 hover:bg-white/5 transition-colors group">
                      <TableCell className="font-medium text-text-primary">
                        <div className="flex items-center gap-2">
                          <CircleDot className="w-4 h-4 text-brand-500/50" />
                          {order.scheduled_date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {order.items?.map((i: any, idx: number) => (
                            <span key={idx} className="text-xs text-text-secondary bg-black/20 px-2 py-1 rounded w-max">
                              {i.quantity}x {i.service_name}
                            </span>
                          )) || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.status === 'COMPLETED' ? (
                          <Badge variant="glass" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5">
                            <CheckCircle2 size={12} /> COMPLETED
                          </Badge>
                        ) : order.status === 'IN_PROGRESS' ? (
                          <Badge variant="glass" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5">
                            <Play size={12} /> IN_PROGRESS
                          </Badge>
                        ) : (
                          <Badge variant="glass" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5">
                            {order.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          className="gap-2 text-xs h-8 px-3 py-1"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye size={14} />
                          Ver Detalhes MTR
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              title="Nenhuma Ordem Encontrada"
              description="As Ordens de Serviço (OS) são geradas diariamente pelo sistema."
              action={
                <Button onClick={fetchOrders} variant="liquid">
                  Atualizar
                </Button>
              }
            />
          )}
        </div>
      </div>

      <ServiceOrderDetailsModal 
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onGenerateMtr={(id) => {
          handleGenerateMtr(id)
          setSelectedOrder(null)
        }}
        isGenerating={generatingMtr === selectedOrder?.id}
      />
    </div>
  )
}
