import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import {
  ArrowLeft, BriefcaseBusiness, FileSignature, Zap, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useListContractsApiV1ContractsGet } from '../../shared/api/generated/contracts/contracts';
import { customAxiosInstance } from '../../shared/api/axios';
import { toast } from 'sonner';

type BadgeVariant = 'default' | 'outline' | 'liquid' | 'glass' | 'success';
const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  DRAFT:              { label: 'Rascunho',           variant: 'outline' },
  WAITING_SIGNATURE:  { label: 'Aguard. Assinatura', variant: 'liquid' },
  ACTIVE:             { label: 'Ativo',              variant: 'success' },
  SUSPENDED:          { label: 'Suspenso',           variant: 'outline' },
  EXPIRED:            { label: 'Expirado',           variant: 'glass' },
  CANCELLED:          { label: 'Cancelado',          variant: 'outline' },
};

export function ContractDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isActioning, setIsActioning] = useState(false);

  const { data: contractsData, isLoading, isError, refetch } = useListContractsApiV1ContractsGet();
  const contracts: any[] = Array.isArray(contractsData) ? contractsData : [];
  const contract = contracts.find((c: any) => c.id === id);

  const handleSendForSignature = async () => {
    if (!id) return;
    setIsActioning(true);
    try {
      await customAxiosInstance({
        url: `/api/v1/contracts/${id}/send-for-signature`,
        method: 'POST',
      });
      toast.success('Contrato enviado para assinatura!');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erro ao enviar para assinatura.');
    } finally {
      setIsActioning(false);
    }
  };

  const handleActivate = async () => {
    if (!id) return;
    setIsActioning(true);
    try {
      await customAxiosInstance({
        url: `/api/v1/contracts/${id}/activate`,
        method: 'POST',
      });
      toast.success('Contrato ativado! Plano de serviço será gerado em breve.');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erro ao ativar contrato.');
    } finally {
      setIsActioning(false);
    }
  };

  if (isLoading) {
    return <div className="p-16 flex items-center justify-center text-text-secondary">Carregando detalhes do contrato...</div>;
  }

  if (isError || !contract) {
    return (
      <div className="flex-1 bg-background p-8">
        <Button variant="ghost" onClick={() => navigate('/admin/contracts')} className="pl-0 gap-2 mb-6">
          <ArrowLeft size={16} /> Voltar para Contratos
        </Button>
        <EmptyState
          title="Contrato não encontrado"
          description="O contrato buscado não existe ou você não tem permissão para acessá-lo."
          action={
            <Button onClick={() => navigate('/admin/contracts')} className="mt-4 gap-2">
              <ArrowLeft size={16} /> Voltar
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = STATUS_MAP[contract.status] ?? { label: contract.status, variant: 'outline' as BadgeVariant };
  const canSendForSignature = contract.status === 'DRAFT';
  const canActivate = contract.status === 'WAITING_SIGNATURE' || contract.status === 'DRAFT';
  const isActive = contract.status === 'ACTIVE';

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/contracts')} className="p-2 h-10 w-10 shrink-0 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 mt-1">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                Contrato {contract.id.split('-')[0]}
              </h1>
              <Badge variant={statusInfo.variant} className={statusInfo.variant === 'outline' || statusInfo.variant === 'glass' ? 'variant-glass' : ''}>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Criado em {new Date(contract.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {canSendForSignature && (
              <Button
                variant="liquid"
                onClick={handleSendForSignature}
                disabled={isActioning}
                className="gap-2"
              >
                <FileSignature size={16} />
                {isActioning ? 'Enviando...' : 'Enviar para Assinatura'}
              </Button>
            )}
            {canActivate && (
              <Button
                onClick={handleActivate}
                disabled={isActioning}
                className="gap-2"
              >
                <Zap size={16} />
                {isActioning ? 'Ativando...' : 'Ativar Contrato'}
              </Button>
            )}
            {isActive && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success-500/10 text-success-500 text-sm font-medium border border-success-500/20">
                <CheckCircle size={16} />
                Contrato Ativo
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        {isActive && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-success-500/10 border border-success-500/20">
            <CheckCircle className="h-5 w-5 text-success-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-success-500">Contrato Ativado com Sucesso</p>
              <p className="text-xs text-success-500/70 mt-0.5">
                Um Plano de Serviço foi gerado automaticamente. Acesse Operação → Planos de Serviço para visualizar.
              </p>
            </div>
          </div>
        )}

        {canSendForSignature && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-500">Ação Necessária</p>
              <p className="text-xs text-amber-500/70 mt-0.5">
                Este contrato está em rascunho. Envie para assinatura e em seguida ative-o para iniciar as operações.
              </p>
            </div>
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-xl border border-border">
            <div className="flex items-center gap-2 text-text-primary font-semibold border-b border-border/50 pb-4 mb-4">
              <BriefcaseBusiness size={18} className="text-brand-500" />
              Informações do Contrato
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">ID Completo</span>
                <span className="font-mono text-xs text-text-primary">{contract.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">ID da Cotação</span>
                <Button
                  variant="ghost"
                  className="h-auto p-0 text-xs font-mono text-brand-500 hover:text-brand-400"
                  onClick={() => navigate(`/admin/quotations/${contract.quotation_id}`)}
                >
                  {contract.quotation_id.split('-')[0]}...
                </Button>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Data Efetiva</span>
                <span className="text-text-primary">{new Date(contract.effective_date).toLocaleDateString('pt-BR')}</span>
              </div>
              {contract.expiration_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Data de Expiração</span>
                  <span className="text-text-primary">{new Date(contract.expiration_date).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-border">
            <div className="flex items-center gap-2 text-text-primary font-semibold border-b border-border/50 pb-4 mb-4">
              <Zap size={18} className="text-brand-500" />
              Resumo Financeiro
            </div>
            {contract.items && contract.items.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Total de Serviços</span>
                  <span className="font-medium text-text-primary">{contract.items.length}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t border-border/50 pt-4 mt-2">
                  <span className="text-text-primary">Valor Total Mensal Estimado</span>
                  <span className="text-brand-500 text-lg">
                    R$ {contract.items
                      .reduce((sum: number, item: any) => sum + parseFloat(item.final_price || '0'), 0)
                      .toFixed(2)
                    }
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">Nenhum item com preço calculado.</p>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <BriefcaseBusiness size={18} className="text-brand-500" />
              Serviços Acordados
            </div>
          </div>
          <div className="p-0 overflow-x-auto">
            {contract.items && contract.items.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Serviço</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Quantidade</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Preço Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contract.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-text-primary">
                        {item.service_name || 'Serviço não identificado'}
                      </td>
                      <td className="p-4 text-right text-text-secondary tabular-nums">{item.quantity}</td>
                      <td className="p-4 text-right font-mono font-semibold text-brand-500">
                        {item.final_price
                          ? `R$ ${parseFloat(item.final_price).toFixed(2)}`
                          : <span className="text-text-secondary opacity-50">—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-text-secondary">Nenhum item neste contrato.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
