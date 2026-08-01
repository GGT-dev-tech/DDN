import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/ui/components/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/components/Table'
import { Badge } from '../../../shared/ui/components/Badge'
import { Button } from '../../../shared/ui/components/Button'
import { EmptyState } from '../../../shared/ui/components/EmptyState'
import { FileText } from 'lucide-react'

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
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMtrs()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manifesto de Transporte (MTR)</h1>
          <p className="text-muted-foreground mt-1">Acompanhe os MTRs emitidos para cada coleta.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle>MTRs</CardTitle>
            </div>
            <CardDescription>
              Documentação de conformidade ambiental gerada a partir das ordens de serviço.
            </CardDescription>
          </div>
          <Button onClick={fetchMtrs}>
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-zinc-500">Carregando MTRs...</div>
          ) : mtrs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MTR ID</TableHead>
                  <TableHead>Emissão</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mtrs.map((mtr: any) => (
                  <TableRow key={mtr.id}>
                    <TableCell className="font-medium">{mtr.id.substring(0, 8)}</TableCell>
                    <TableCell>{mtr.issue_date}</TableCell>
                    <TableCell>
                      {mtr.items?.map((i: any) => `${i.quantity}x ${i.waste_type}`).join(', ') || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{mtr.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhum MTR"
              description="Você ainda não possui nenhum Manifesto de Transporte de Resíduos gerado."
              action={
                <Button onClick={fetchMtrs}>
                  Atualizar
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
