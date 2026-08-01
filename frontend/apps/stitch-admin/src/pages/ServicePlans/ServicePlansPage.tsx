import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { useListAllPlansApiV1ServicePlansGet } from '../../shared/api/generated/service-plans/service-plans';
import { useListLeadsApiV1CommercialLeadsGet } from '../../shared/api/generated/commercial/commercial';

export function ServicePlansPage() {
  const { data: servicePlans, isLoading, isError } = useListAllPlansApiV1ServicePlansGet();
  const { data: leads } = useListLeadsApiV1CommercialLeadsGet();

  const getCompanyName = (id: string) => {
    const lead = leads?.find((l: any) => l.id === id);
    return lead ? lead.company_name : id;
  };

  if (isLoading) return <div className="p-4">Carregando planos de serviço...</div>;
  if (isError) return <div className="p-4 text-red-500">Erro ao carregar planos de serviço.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Planos de Serviço</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planos de Operação Ativos</CardTitle>
          <CardDescription>
            Planejamento das coletas e recorrências por contrato.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Plano</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Efetiva</TableHead>
                <TableHead>Agendamentos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicePlans?.map((plan: any) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium text-xs font-mono">{plan.id.split('-')[0]}</TableCell>
                  <TableCell className="text-sm">{getCompanyName(plan.company_id)}</TableCell>
                  <TableCell>
                    <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'outline'}>
                      {plan.status === 'DRAFT' ? 'Rascunho' : plan.status === 'ACTIVE' ? 'Ativo' : plan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{plan.effective_date ? new Date(plan.effective_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{plan.schedules?.length || 0} agendamentos</TableCell>
                </TableRow>
              ))}
              {!servicePlans?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-text-secondary">
                    Nenhum plano de serviço encontrado.
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
