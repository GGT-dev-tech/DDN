import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import { BriefcaseBusiness, FileSignature, Zap, ExternalLink } from 'lucide-react';
import { useListContractsApiV1ContractsGet } from '../../shared/api/generated/contracts/contracts';
import { useListLeadsApiV1CommercialLeadsGet } from '../../shared/api/generated/commercial/commercial';

type BadgeVariant = 'default' | 'outline' | 'liquid' | 'glass';
const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  DRAFT:              { label: 'Rascunho',           variant: 'outline' },
  WAITING_SIGNATURE:  { label: 'Aguard. Assinatura', variant: 'liquid' },
  ACTIVE:             { label: 'Ativo',              variant: 'default' },
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-black/5 dark:bg-white/5 rounded animate-pulse" />
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-black/5 dark:bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-red-500 bg-red-500/10 rounded-lg">Erro ao carregar contratos.</div>;
  }

  const draftCount = contracts?.filter((c: any) => c.status === 'DRAFT').length ?? 0;
  const waitingCount = contracts?.filter((c: any) => c.status === 'WAITING_SIGNATURE').length ?? 0;
  const activeCount = contracts?.filter((c: any) => c.status === 'ACTIVE').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
          <p className="text-muted-foreground mt-1">
            Contratos gerados automaticamente após aprovação de cotações.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Rascunho', count: draftCount, color: 'text-zinc-400' },
          { label: 'Aguard. Assinatura', count: waitingCount, color: 'text-amber-400' },
          { label: 'Ativos', count: activeCount, color: 'text-green-400' },
        ].map(({ label, count, color }) => (
          <div key={label} className="glass-panel rounded-xl p-4 flex items-center gap-4">
            <Zap className={`h-8 w-8 shrink-0 ${color}`} />
            <div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Todos os Contratos</CardTitle>
            </div>
            <CardDescription>
              Gerencie o ciclo de vida: Rascunho → Assinatura → Ativo.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {contracts && contracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data Efetiva</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Itens</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract: any) => {
                  const statusInfo = STATUS_MAP[contract.status] ?? { label: contract.status, variant: 'outline' as BadgeVariant };
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium font-mono text-xs">
                        {contract.id.split('-')[0]}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {getCompanyName(contract.company_id)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {contract.effective_date
                          ? new Date(contract.effective_date).toLocaleDateString('pt-BR')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {contract.items?.length ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/admin/contracts/${contract.id}`)}
                          className="gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhum contrato encontrado"
              description="Contratos são criados automaticamente quando uma Cotação é aprovada. Vá até Cotações e aprove uma para gerar o primeiro contrato."
              action={
                <Button onClick={() => navigate('/admin/quotations')}>
                  <FileSignature className="mr-2 h-4 w-4" />
                  Ir para Cotações
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
