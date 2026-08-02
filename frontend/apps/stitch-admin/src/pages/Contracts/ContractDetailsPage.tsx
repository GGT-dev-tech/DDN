import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import {
  ArrowLeft, BriefcaseBusiness, FileSignature, Zap, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useListContractsApiV1ContractsGet } from '../../shared/api/generated/contracts/contracts';
import { customAxiosInstance } from '../../shared/api/axios';
import { toast } from 'sonner';

type BadgeVariant = 'default' | 'outline' | 'liquid' | 'glass';
const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  DRAFT:              { label: 'Rascunho',           variant: 'outline' },
  WAITING_SIGNATURE:  { label: 'Aguard. Assinatura', variant: 'liquid' },
  ACTIVE:             { label: 'Ativo',              variant: 'default' },
  SUSPENDED:          { label: 'Suspenso',           variant: 'outline' },
  EXPIRED:            { label: 'Expirado',           variant: 'glass' },
  CANCELLED:          { label: 'Cancelado',          variant: 'outline' },
};

export function ContractDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isActioning, setIsActioning] = useState(false);

  const { data: contracts, isLoading, isError, refetch } = useListContractsApiV1ContractsGet();
  const contract = contracts?.find((c: any) => c.id === id);

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
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-black/5 dark:bg-white/5 rounded animate-pulse" />
        <div className="glass-panel rounded-2xl p-6 h-48 animate-pulse bg-black/5 dark:bg-white/5" />
      </div>
    );
  }

  if (isError || !contract) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/admin/contracts')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Contratos
        </Button>
        <EmptyState
          title="Contrato não encontrado"
          description="O contrato buscado não existe ou você não tem permissão para acessá-lo."
          action={
            <Button onClick={() => navigate('/admin/contracts')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/contracts')} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Contrato {contract.id.split('-')[0]}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <span className="text-muted-foreground text-sm">
              Criado em {new Date(contract.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {canSendForSignature && (
            <Button
              variant="liquid"
              onClick={handleSendForSignature}
              disabled={isActioning}
              className="gap-2"
            >
              <FileSignature className="h-4 w-4" />
              {isActioning ? 'Enviando...' : 'Enviar para Assinatura'}
            </Button>
          )}
          {canActivate && (
            <Button
              onClick={handleActivate}
              disabled={isActioning}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              {isActioning ? 'Ativando...' : 'Ativar Contrato'}
            </Button>
          )}
          {isActive && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Contrato Ativo
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      {isActive && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-400">Contrato Ativado com Sucesso</p>
            <p className="text-xs text-green-400/70 mt-0.5">
              Um Plano de Serviço foi gerado automaticamente. Acesse Operação → Planos de Serviço para visualizar.
            </p>
          </div>
        </div>
      )}

      {canSendForSignature && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-400">Ação Necessária</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Este contrato está em rascunho. Envie para assinatura e em seguida ative-o para iniciar as operações.
            </p>
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
              Informações do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ID Completo</span>
              <span className="font-mono text-xs">{contract.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ID da Cotação</span>
              <Button
                variant="ghost"
                className="h-auto p-0 text-xs font-mono text-brand-400 hover:text-brand-300"
                onClick={() => navigate(`/admin/quotations/${contract.quotation_id}`)}
              >
                {contract.quotation_id.split('-')[0]}...
              </Button>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Data Efetiva</span>
              <span>{new Date(contract.effective_date).toLocaleDateString('pt-BR')}</span>
            </div>
            {contract.expiration_date && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data de Expiração</span>
                <span>{new Date(contract.expiration_date).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo Financeiro</CardTitle>
            <CardDescription>Valores consolidados dos itens do contrato.</CardDescription>
          </CardHeader>
          <CardContent>
            {contract.items && contract.items.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total de Serviços</span>
                  <span className="font-medium">{contract.items.length}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t border-border pt-2 mt-2">
                  <span>Valor Total</span>
                  <span className="text-green-400">
                    R$ {contract.items
                      .reduce((sum: number, item: any) => sum + parseFloat(item.final_price || '0'), 0)
                      .toFixed(2)
                    }
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum item com preço calculado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens do Contrato</CardTitle>
          <CardDescription>Serviços acordados neste contrato.</CardDescription>
        </CardHeader>
        <CardContent>
          {contract.items && contract.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Preço Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contract.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.service_name || 'Serviço não identificado'}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono">
                      {item.final_price
                        ? `R$ ${parseFloat(item.final_price).toFixed(2)}`
                        : <span className="text-muted-foreground">—</span>
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum item neste contrato.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
