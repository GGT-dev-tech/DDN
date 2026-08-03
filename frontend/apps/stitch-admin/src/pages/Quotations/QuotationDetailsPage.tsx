import { useParams, useNavigate } from 'react-router-dom';
import { useGetQuotationApiV1QuotationsQuotationIdGet, useApproveQuotationApiV1QuotationsQuotationIdApprovePost, getGetQuotationApiV1QuotationsQuotationIdGetQueryKey, useCalculateQuotationApiV1QuotationsQuotationIdCalculatePost } from '../../shared/api/generated/quotations/quotations';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { ArrowLeft, CheckCircle, FileText, Plus, Calculator } from 'lucide-react';
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
  const { mutateAsync: calculateQuotation, isPending: isCalculating } = useCalculateQuotationApiV1QuotationsQuotationIdCalculatePost();

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
    return <div className="p-16 flex items-center justify-center text-text-secondary">Carregando detalhes da cotação...</div>;
  }

  if (isError || !quotation) {
    return (
      <div className="flex-1 bg-background p-8">
        <Button variant="ghost" onClick={() => navigate('/admin/quotations')} className="pl-0 gap-2 mb-6">
          <ArrowLeft size={16} /> Voltar para Cotações
        </Button>
        <div className="p-8 text-center text-red-500 bg-red-500/10 rounded-xl max-w-lg mx-auto border border-red-500/20">
          Erro ao carregar detalhes da cotação. Verifique se o ID está correto.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/quotations')} className="p-2 h-10 w-10 shrink-0 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 mt-1">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text-primary">Cotação {quotation.id.split('-')[0]}</h1>
              <Badge variant={quotation.status === 'APPROVED' ? 'success' : 'outline'} className="variant-glass">
                {quotation.status === 'DRAFT' ? 'Rascunho' : quotation.status === 'APPROVED' ? 'Aprovada' : quotation.status}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Criada em {new Date(quotation.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {quotation.status === 'DRAFT' && quotation.items.length > 0 && (
              <Button onClick={async () => {
                try {
                  await calculateQuotation({ quotationId: id!, data: { reference_date: new Date().toISOString().split('T')[0] } });
                  queryClient.invalidateQueries({ queryKey: getGetQuotationApiV1QuotationsQuotationIdGetQueryKey(id!) });
                } catch (error) {
                  console.error('Failed to calculate quotation:', error);
                }
              }} disabled={isCalculating} variant="liquid" className="gap-2">
                <Calculator size={16} />
                {isCalculating ? 'Calculando...' : 'Calcular Preços'}
              </Button>
            )}
            
            {quotation.status !== 'APPROVED' && (
              <Button onClick={handleApprove} disabled={isApproving || quotation.items.length === 0 || quotation.status === 'DRAFT'} className="gap-2">
                <CheckCircle size={16} />
                {isApproving ? 'Aprovando...' : 'Aprovar Cotação'}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Items List */}
          <div className="glass-panel rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-primary font-semibold">
                <FileText size={18} className="text-brand-500" />
                Itens da Cotação
              </div>
              {quotation.status !== 'APPROVED' && (
                <Button variant="liquid" onClick={() => setIsAddItemModalOpen(true)} className="gap-2 h-8 text-xs">
                  <Plus size={14} /> Adicionar Serviço
                </Button>
              )}
            </div>
            
            <div className="p-0 overflow-x-auto">
              {quotation.items && quotation.items.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                      <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Serviço</th>
                      <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Quantidade</th>
                      <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Preço Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quotation.items.map((item) => (
                      <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium text-text-primary">
                          {item.service_name || 'Serviço não nomeado'}
                        </td>
                        <td className="p-4 text-right tabular-nums text-text-secondary">
                          {item.quantity}
                        </td>
                        <td className="p-4 text-right font-mono font-semibold text-brand-500">
                          {item.final_price ? `R$ ${parseFloat(item.final_price).toFixed(2)}` : 'Pendente cálculo'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8">
                  <EmptyState 
                    title="Nenhum item adicionado" 
                    description="Adicione serviços para calcular o valor desta cotação."
                    action={
                      quotation.status !== 'APPROVED' ? (
                        <Button onClick={() => setIsAddItemModalOpen(true)} className="gap-2 mt-4">
                          <Plus size={16} /> Adicionar Serviço
                        </Button>
                      ) : undefined
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {isAddItemModalOpen && (
          <AddQuotationItemModal 
            isOpen={isAddItemModalOpen} 
            onClose={() => setIsAddItemModalOpen(false)}
            quotationId={quotation.id}
          />
        )}
      </div>
    </div>
  );
}
