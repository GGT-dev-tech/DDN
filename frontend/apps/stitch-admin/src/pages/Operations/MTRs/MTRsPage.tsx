import { useEffect, useState } from 'react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/components/Table'
import { Badge } from '../../../shared/ui/components/Badge'
import { Button } from '../../../shared/ui/components/Button'
import { EmptyState } from '../../../shared/ui/components/EmptyState'
import { FileText, RefreshCw, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function MTRsPage() {
  const [mtrs, setMtrs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchMtrs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/compliance/mtrs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setMtrs(data)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar MTRs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMtrs()
  }, [])

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Manifesto de Transporte (MTR)</h1>
              <p className="text-sm text-text-secondary mt-1">
                Documentação de conformidade ambiental gerada a partir das ordens de serviço.
              </p>
            </div>
          </div>
          <Button onClick={fetchMtrs} variant="glass" className="gap-2">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Atualizar
          </Button>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-border">
          {isLoading ? (
            <div className="py-12 flex justify-center items-center text-brand-500">
              <RefreshCw className="animate-spin h-8 w-8" />
            </div>
          ) : mtrs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-text-secondary font-semibold uppercase tracking-wider text-xs">MTR ID</TableHead>
                    <TableHead className="text-text-secondary font-semibold uppercase tracking-wider text-xs">Emissão</TableHead>
                    <TableHead className="text-text-secondary font-semibold uppercase tracking-wider text-xs">Itens</TableHead>
                    <TableHead className="text-text-secondary font-semibold uppercase tracking-wider text-xs">Placa do Veículo</TableHead>
                    <TableHead className="text-text-secondary font-semibold uppercase tracking-wider text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mtrs.map((mtr: any) => (
                    <TableRow key={mtr.id} className="border-border/50 hover:bg-white/5 transition-colors group">
                      <TableCell className="font-medium text-text-primary">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand-500/50" />
                          {mtr.id.substring(0, 8).toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell className="text-text-secondary">{mtr.issue_date}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {mtr.items?.map((i: any, idx: number) => (
                            <span key={idx} className="text-xs text-text-secondary bg-black/20 px-2 py-1 rounded w-max">
                              {i.quantity}x {i.waste_type}
                            </span>
                          )) || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-text-secondary font-mono text-sm">{mtr.vehicle_plate || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="glass" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5">
                          <CheckCircle2 size={12} />
                          {mtr.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              title="Nenhum MTR Encontrado"
              description="Você ainda não possui nenhum Manifesto de Transporte de Resíduos gerado."
              action={
                <Button onClick={fetchMtrs} variant="liquid">
                  Atualizar
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
