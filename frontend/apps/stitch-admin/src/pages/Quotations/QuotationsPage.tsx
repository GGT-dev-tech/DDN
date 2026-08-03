import { useState } from 'react';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { useListQuotationsApiV1QuotationsGet } from '../../shared/api/generated/quotations/quotations';
import { useListLeadsApiV1CommercialLeadsGet } from '../../shared/api/generated/commercial/commercial';
import { AddQuotationModal } from './components/AddQuotationModal';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar } from 'lucide-react';
import { EmptyState } from '../../shared/ui/components/EmptyState';

export function QuotationsPage() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: quotations, isLoading, isError } = useListQuotationsApiV1QuotationsGet();
  const { data: leads } = useListLeadsApiV1CommercialLeadsGet();

  const getCompanyName = (id: string) => {
    const lead = leads?.find((l: any) => l.id === id);
    return lead ? lead.company_name : id;
  };

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
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Cotações</h1>
              <p className="text-sm text-text-secondary mt-1">
                Gerencie e acompanhe as propostas comerciais enviadas aos clientes.
              </p>
            </div>
          </div>
          <Button variant="liquid" onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus size={18} /> Nova Cotação
          </Button>
        </div>

        <AddQuotationModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />
        
        {/* Lista de Cotações */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <FileText size={18} className="text-brand-500" />
              Propostas Comerciais
            </div>
          </div>
          
          <div className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-text-secondary">Carregando cotações...</div>
            ) : isError ? (
              <div className="p-12 text-center text-red-500">Erro ao carregar cotações.</div>
            ) : quotations && quotations.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Cotação & Cliente</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Validade</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-text-primary">{getCompanyName(q.company_id)}</div>
                        <div className="text-xs font-mono text-text-secondary mt-1">
                          ID: {q.id.split('-')[0]}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={q.status === 'APPROVED' ? 'success' : 'outline'} className="variant-glass">
                          {q.status === 'DRAFT' ? 'Rascunho' : q.status === 'APPROVED' ? 'Aprovada' : q.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                          <Calendar size={14} className="opacity-70" />
                          {q.expires_at ? new Date(q.expires_at).toLocaleDateString() : 'Indeterminado'}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" onClick={() => navigate(`/admin/quotations/${q.id}`)} className="text-xs h-8">
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="Nenhuma cotação encontrada"
                  description="Você ainda não enviou propostas comerciais."
                  action={
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 mt-4">
                      <Plus size={16} /> Nova Cotação
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
