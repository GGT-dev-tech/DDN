import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table'
import { Badge } from '../../shared/ui/components/Badge'
import { Button } from '../../shared/ui/components/Button'
import { EmptyState } from '../../shared/ui/components/EmptyState'
import { Inbox, CheckCircle2, Building2 } from 'lucide-react'

import { 
  useListLeadsApiV1CommercialLeadsGet, 
  useQualifyLeadApiV1CommercialLeadsLeadIdQualifyPost,
  useMatchLeadToCompanyApiV1CommercialLeadsLeadIdMatchPost
} from '../../shared/api/generated/commercial/commercial'
import { Modal } from '../../shared/ui/components/Modal'
import { Input } from '../../shared/ui/components/Input'
import { toast } from 'sonner'

export function LeadsPage() {
  const { data: leads = [], isLoading, refetch } = useListLeadsApiV1CommercialLeadsGet()
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false)
  const [documentNumber, setDocumentNumber] = useState('')
  const [corporateName, setCorporateName] = useState('')

  const { mutate: qualifyLead } = useQualifyLeadApiV1CommercialLeadsLeadIdQualifyPost({
    mutation: {
      onSuccess: () => {
        toast.success('Lead qualificado com sucesso!')
        refetch()
      }
    }
  })

  const { mutate: matchLead } = useMatchLeadToCompanyApiV1CommercialLeadsLeadIdMatchPost({
    mutation: {
      onSuccess: () => {
        toast.success('Lead convertido em Cliente com sucesso!')
        setIsMatchModalOpen(false)
        setSelectedLead(null)
        refetch()
      }
    }
  })

  const handleQualify = (leadId: string) => {
    qualifyLead({ leadId })
  }

  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead) return
    matchLead({
      leadId: selectedLead.id,
      data: {
        trade_name: selectedLead.company_name,
        corporate_name: corporateName || selectedLead.company_name,
        document_number: documentNumber
      }
    })
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads (Oportunidades)</h1>
          <p className="text-muted-foreground mt-1">Gerencie potenciais clientes interessados nos seus serviços.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Caixa de Entrada Comercial</CardTitle>
            </div>
            <CardDescription>
              Leads vindos do site e outras fontes que aguardam qualificação.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-zinc-500">Carregando leads...</div>
          ) : leads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {lead.company_name}
                    </TableCell>
                    <TableCell>{lead.contact_name}</TableCell>
                    <TableCell>{lead.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.status === 'new' ? 'Novo' : lead.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {lead.status === 'NEW' && (
                        <Button onClick={() => handleQualify(lead.id)}>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Qualificar
                        </Button>
                      )}
                      {lead.status === 'QUALIFIED' && (
                        <Button variant="ghost" onClick={() => {
                          setSelectedLead(lead)
                          setIsMatchModalOpen(true)
                          setCorporateName(lead.company_name)
                        }}>
                          <Building2 className="w-4 h-4 mr-2" /> Converter em Cliente
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhum lead encontrado"
              description="Ainda não há solicitações de clientes interessados no momento."
              action={<Button variant="ghost">Atualizar</Button>}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Match / Convert Modal */}
      <Modal 
        isOpen={isMatchModalOpen} 
        onClose={() => setIsMatchModalOpen(false)}
        title="Converter Lead em Cliente"
      >
        <form onSubmit={handleMatchSubmit} className="space-y-4">
          <p className="text-sm text-zinc-400">
            Você está convertendo o lead <strong>{selectedLead?.company_name}</strong> em um Cliente.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Razão Social</label>
            <Input 
              value={corporateName} 
              onChange={(e: any) => setCorporateName(e.target.value)} 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">CNPJ / Documento</label>
            <Input 
              value={documentNumber} 
              onChange={(e: any) => setDocumentNumber(e.target.value)} 
              required
              placeholder="00.000.000/0001-00"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsMatchModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Converter</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
