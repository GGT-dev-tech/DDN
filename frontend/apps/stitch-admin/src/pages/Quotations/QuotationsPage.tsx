import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { useListQuotationsApiV1QuotationsGet } from '../../shared/api/generated/quotations/quotations';
import { useListLeadsApiV1CommercialLeadsGet } from '../../shared/api/generated/commercial/commercial';
import { AddQuotationModal } from './components/AddQuotationModal';
import { useNavigate } from 'react-router-dom';

export function QuotationsPage() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: quotations, isLoading, isError } = useListQuotationsApiV1QuotationsGet();
  const { data: leads } = useListLeadsApiV1CommercialLeadsGet();

  const getCompanyName = (id: string) => {
    const lead = leads?.find((l: any) => l.id === id);
    return lead ? lead.company_name : id;
  };

  if (isLoading) return <div className="p-4">Carregando cotações...</div>;
  if (isError) return <div className="p-4 text-red-500">Erro ao carregar cotações.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cotações</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Nova Cotação</Button>
      </div>

      <AddQuotationModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Propostas Comerciais</CardTitle>
          <CardDescription>
            Gerencie e acompanhe todas as cotações enviadas aos clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID da Cotação</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations?.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium text-xs font-mono">{q.id.split('-')[0]}</TableCell>
                  <TableCell className="text-sm">{getCompanyName(q.company_id)}</TableCell>
                  <TableCell>
                    <Badge variant={q.status === 'APPROVED' ? 'default' : 'outline'}>
                      {q.status === 'DRAFT' ? 'Rascunho' : q.status === 'APPROVED' ? 'Aprovada' : q.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{q.expires_at ? new Date(q.expires_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{q.created_at ? new Date(q.created_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => navigate(`/admin/quotations/${q.id}`)}>
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!quotations?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-text-secondary">
                    Nenhuma cotação encontrada. Crie uma para começar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
