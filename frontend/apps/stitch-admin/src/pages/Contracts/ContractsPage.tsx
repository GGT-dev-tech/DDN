import { useNavigate } from 'react-router-dom';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import { BriefcaseBusiness, FileSignature, Zap, ExternalLink, Calendar } from 'lucide-react';
import { useListContractsApiV1ContractsGet } from '../../shared/api/generated/contracts/contracts';
import { useListLeadsApiV1CommercialLeadsGet } from '../../shared/api/generated/commercial/commercial';

type BadgeVariant = 'default' | 'outline' | 'liquid' | 'glass' | 'success';
const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  DRAFT:              { label: 'Rascunho',           variant: 'outline' },
  WAITING_SIGNATURE:  { label: 'Aguard. Assinatura', variant: 'liquid' },
  ACTIVE:             { label: 'Ativo',              variant: 'success' },
  SUSPENDED:          { label: 'Suspenso',           variant: 'outline' },
  EXPIRED:            { label: 'Expirado',           variant: 'glass' },
  CANCELLED:          { label: 'Cancelado',          variant: 'outline' },
};

export function ContractsPage() {
  const navigate = useNavigate();
  const { data: contracts, isLoading, isError } = useListContractsApiV1ContractsGet();
  const { data: leads } = useListLeadsApiV1CommercialLeadsGet();

  const getCompanyName = (id: string) => {
    const lead = leads?.find((l: any) => l.id === id);
    return lead ? lead.company_name : `${id.split('-')[0]}...`;
  };

  const draftCount = contracts?.filter((c: any) => c.status === 'DRAFT').length ?? 0;
  const waitingCount = contracts?.filter((c: any) => c.status === 'WAITING_SIGNATURE').length ?? 0;
  const activeCount = contracts?.filter((c: any) => c.status === 'ACTIVE').length ?? 0;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <BriefcaseBusiness size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Contratos</h1>
              <p className="text-sm text-text-secondary mt-1">
                Acompanhe o ciclo de vida dos contratos gerados automaticamente pelas cotações.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Rascunho', count: draftCount, color: 'text-text-secondary', icon: FileSignature },
            { label: 'Aguard. Assinatura', count: waitingCount, color: 'text-brand-500', icon: Zap },
            { label: 'Ativos', count: activeCount, color: 'text-success-500', icon: BriefcaseBusiness },
          ].map(({ label, count, color, icon: Icon }) => (
            <div key={label} className="glass-panel p-6 rounded-xl border border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">{label}</p>
                <p className="text-3xl font-bold text-text-primary">{count}</p>
              </div>
              <Icon size={32} className={`${color} opacity-50`} />
            </div>
          ))}
        </div>

        {/* Lista de Contratos */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <BriefcaseBusiness size={18} className="text-brand-500" />
              Todos os Contratos
            </div>
          </div>
          
          <div className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-text-secondary">Carregando contratos...</div>
            ) : isError ? (
              <div className="p-12 text-center text-red-500">Erro ao carregar contratos.</div>
            ) : contracts && contracts.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Contrato & Cliente</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Data Efetiva</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contracts.map((contract: any) => {
                    const statusInfo = STATUS_MAP[contract.status] ?? { label: contract.status, variant: 'outline' as BadgeVariant };
                    return (
                      <tr key={contract.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-text-primary">{getCompanyName(contract.company_id)}</div>
                          <div className="text-xs font-mono text-text-secondary mt-1">
                            ID: {contract.id.split('-')[0]} • {contract.items?.length ?? 0} item(s)
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={statusInfo.variant} className={statusInfo.variant === 'outline' || statusInfo.variant === 'glass' ? 'variant-glass' : ''}>
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                            <Calendar size={14} className="opacity-70" />
                            {contract.effective_date
                              ? new Date(contract.effective_date).toLocaleDateString('pt-BR')
                              : '—'}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" onClick={() => navigate(`/admin/contracts/${contract.id}`)} className="text-xs h-8 gap-2">
                            <ExternalLink size={14} /> Detalhes
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="Nenhum contrato encontrado"
                  description="Contratos são criados automaticamente quando uma Cotação é aprovada. Vá até Cotações e aprove uma para gerar o primeiro contrato."
                  action={
                    <Button onClick={() => navigate('/admin/quotations')} className="mt-4 gap-2">
                      <FileSignature size={16} /> Ir para Cotações
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
