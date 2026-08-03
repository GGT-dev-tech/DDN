import { useParams, useNavigate } from 'react-router-dom';
import { useListLeadsApiV1CommercialLeadsGet } from '../../shared/api/generated/commercial/commercial';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { ArrowLeft, Building2, Mail, Phone, MapPin, User, FileText, ClipboardList, Plus } from 'lucide-react';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import { useListQuotationsApiV1QuotationsGet } from '../../shared/api/generated/quotations/quotations';

export function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch customer details from the list
  const { data: leads, isLoading, isError } = useListLeadsApiV1CommercialLeadsGet();
  const customerResult = leads?.find(l => l.id === id);
  const customer = customerResult as any;

  // Fetch quotations for this customer
  const { data: allQuotations } = useListQuotationsApiV1QuotationsGet();
  const customerQuotations = allQuotations?.filter(q => q.company_id === id) || [];

  if (isLoading) {
    return <div className="p-16 flex items-center justify-center text-text-secondary">Carregando detalhes do cliente...</div>;
  }

  if (isError || !customer) {
    return (
      <div className="flex-1 bg-background p-8">
        <Button variant="ghost" onClick={() => navigate('/admin/customers')} className="pl-0 gap-2 mb-6">
          <ArrowLeft size={16} /> Voltar para Clientes
        </Button>
        <div className="p-8 text-center text-red-500 bg-red-500/10 rounded-xl max-w-lg mx-auto border border-red-500/20">
          Erro ao carregar detalhes do cliente. Verifique se o ID está correto.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/customers')} className="p-2 h-10 w-10 shrink-0 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 mt-1">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text-primary">{customer.company_name}</h1>
              <Badge variant={customer.status === 'new' ? 'default' : 'outline'} className={customer.status === 'new' ? 'bg-brand-500/20 text-brand-500' : 'variant-glass'}>
                {customer.status === 'new' ? 'Novo Lead' : customer.status}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Cadastrado em {new Date(customer.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button onClick={() => navigate('/admin/quotations', { state: { customerId: customer.id } })} className="gap-2 shrink-0">
            <Plus size={16} /> Nova Cotação
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Customer Info Card */}
          <div className="glass-panel p-6 rounded-xl border border-border h-fit space-y-6">
            <div className="flex items-center gap-2 text-text-primary font-semibold border-b border-border/50 pb-4">
              <Building2 size={18} className="text-brand-500" />
              Informações do Cliente
            </div>
            
            <div className="space-y-4">
              {customer.legal_name && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Razão Social</p>
                    <p className="text-sm text-text-primary font-medium">{customer.legal_name}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <User size={16} className="text-text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Contato Principal</p>
                  <p className="text-sm text-text-primary font-medium">{customer.contact_name}</p>
                </div>
              </div>
              
              {customer.email && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Email</p>
                    <a href={`mailto:${customer.email}`} className="text-sm text-brand-500 hover:text-brand-400 font-medium transition-colors">{customer.email}</a>
                  </div>
                </div>
              )}
              
              {customer.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Telefone</p>
                    <a href={`tel:${customer.phone}`} className="text-sm text-brand-500 hover:text-brand-400 font-medium transition-colors">{customer.phone}</a>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Segmento / Endereço</p>
                  <p className="text-sm text-text-primary capitalize mb-1">{customer.industry || 'Segmento não especificado'}</p>
                  <p className="text-xs text-text-secondary">{customer.address || 'Endereço não cadastrado'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quotations List */}
          <div className="lg:col-span-2 glass-panel rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-primary font-semibold">
                <ClipboardList size={18} className="text-brand-500" />
                Histórico de Cotações
              </div>
            </div>
            
            <div className="p-0 overflow-x-auto">
              {customerQuotations.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                      <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">ID da Cotação</th>
                      <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Data</th>
                      <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customerQuotations.map((quotation) => (
                      <tr key={quotation.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-xs font-semibold text-text-primary">
                          {quotation.id.split('-')[0]}
                        </td>
                        <td className="p-4 text-sm text-text-secondary">
                          {new Date(quotation.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Badge variant={quotation.status === 'APPROVED' ? 'success' : 'outline'} className="variant-glass text-xs">
                            {quotation.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" onClick={() => navigate(`/admin/quotations/${quotation.id}`)} className="text-xs h-8">
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
                    title="Nenhuma cotação vinculada" 
                    description="Este cliente ainda não possui nenhuma proposta comercial. Crie a primeira cotação para enviar ao cliente."
                    action={
                      <Button onClick={() => navigate('/admin/quotations', { state: { customerId: customer.id } })} className="mt-4 gap-2">
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
    </div>
  );
}
