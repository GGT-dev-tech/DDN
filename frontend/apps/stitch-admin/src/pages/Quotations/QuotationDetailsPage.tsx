import { useParams, useNavigate } from 'react-router-dom';
import { useGetQuotationApiV1QuotationsQuotationIdGet, useApproveQuotationApiV1QuotationsQuotationIdApprovePost, getGetQuotationApiV1QuotationsQuotationIdGetQueryKey } from '../../shared/api/generated/quotations/quotations';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { ArrowLeft, CheckCircle, FileText, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import { useState } from 'react';
import { AddQuotationItemModal } from './components/AddQuotationItemModal';

export function QuotationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Fetch quotation details
  const { data: quotation, isLoading, isError } = useGetQuotationApiV1QuotationsQuotationIdGet(id as string, {
    query: { enabled: !!id }
  });

  const { mutateAsync: approveQuotation, isPending: isApproving } = useApproveQuotationApiV1QuotationsQuotationIdApprovePost();

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveQuotation({ quotationId: id });
      queryClient.invalidateQueries({ queryKey: getGetQuotationApiV1QuotationsQuotationIdGetQueryKey(id) });
    } catch (error) {
      console.error('Failed to approve quotation:', error);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500">Carregando detalhes da cotação...</div>;
  }

  if (isError || !quotation) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/quotations')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Cotações
        </Button>
        <div className="p-8 text-center text-red-500 bg-red-500/10 rounded-lg">
          Erro ao carregar detalhes da cotação.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/quotations')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Cotação {quotation.id.split('-')[0]}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={quotation.status === 'APPROVED' ? 'default' : 'outline'} className="text-xs uppercase">
              {quotation.status === 'DRAFT' ? 'Rascunho' : quotation.status === 'APPROVED' ? 'Aprovada' : quotation.status}
            </Badge>
            <span className="text-muted-foreground text-sm">Criada em {new Date(quotation.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        {quotation.status !== 'APPROVED' && (
          <Button onClick={handleApprove} disabled={isApproving || quotation.items.length === 0} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            {isApproving ? 'Aprovando...' : 'Aprovar Cotação'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-500" /> Itens da Cotação
              </CardTitle>
              <CardDescription>Serviços cotados para este cliente.</CardDescription>
            </div>
            {quotation.status !== 'APPROVED' && (
              <Button variant="outline" onClick={() => setIsAddItemModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Serviço
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {quotation.items && quotation.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Preço Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotation.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.service_name || 'Serviço não nomeado'}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-mono">
                        {item.final_price ? `R$ ${parseFloat(item.final_price).toFixed(2)}` : 'Pendente cálculo'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState 
                title="Nenhum item adicionado" 
                description="Adicione serviços para calcular o valor desta cotação."
                action={
                  quotation.status !== 'APPROVED' ? (
                    <Button onClick={() => setIsAddItemModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Serviço
                    </Button>
                  ) : undefined
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      {isAddItemModalOpen && (
        <AddQuotationItemModal 
          isOpen={isAddItemModalOpen} 
          onClose={() => setIsAddItemModalOpen(false)}
          quotationId={quotation.id}
        />
      )}
    </div>
  );
}
