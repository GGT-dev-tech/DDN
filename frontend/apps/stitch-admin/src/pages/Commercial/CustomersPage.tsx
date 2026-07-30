import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table'
import { Badge } from '../../shared/ui/components/Badge'
import { Button } from '../../shared/ui/components/Button'
import { Modal } from '../../shared/ui/components/Modal'
import { EmptyState } from '../../shared/ui/components/EmptyState'
import { CustomerForm } from './components/CustomerForm'
import { Plus, Building2 } from 'lucide-react'

// TODO: Replace with useListLeads hook when backend endpoint is available
const MOCK_LEADS: any[] = [] 

export function CustomersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie leads e empresas cadastradas.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Lista de Clientes</CardTitle>
            </div>
            <CardDescription>
              Visualize e gerencie todos os clientes em prospecção e base ativa.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </CardHeader>
        <CardContent>
          {MOCK_LEADS && MOCK_LEADS.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_LEADS.map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.company_name}</TableCell>
                    <TableCell>{lead.contact_name}</TableCell>
                    <TableCell>{lead.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {lead.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhum cliente encontrado"
              description="Você ainda não possui clientes ou leads cadastrados no sistema. Adicione o primeiro para começar a cotar serviços."
              action={
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Novo Cliente"
      >
        <CustomerForm 
          onSuccess={() => setIsAddModalOpen(false)} 
          onCancel={() => setIsAddModalOpen(false)} 
        />
      </Modal>
    </div>
  )
}
