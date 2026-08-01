import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { useListContractsApiV1ContractsGet } from '../../shared/api/generated/contracts/contracts';
import { useListLeadsApiV1CommercialLeadsGet } from '../../shared/api/generated/commercial/commercial';

export function ContractsPage() {
  const { data: contracts, isLoading, isError } = useListContractsApiV1ContractsGet();
  const { data: leads } = useListLeadsApiV1CommercialLeadsGet();

  const getCompanyName = (id: string) => {
    const lead = leads?.find((l: any) => l.id === id);
    return lead ? lead.company_name : id;
  };

  if (isLoading) return <div className="p-4">Carregando contratos...</div>;
  if (isError) return <div className="p-4 text-red-500">Erro ao carregar contratos.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contratos Ativos</CardTitle>
          <CardDescription>
            Contratos gerados a partir de propostas comerciais aprovadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Contrato</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data Efetiva</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Serviços</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts?.map((contract: any) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium text-xs font-mono">{contract.id.split('-')[0]}</TableCell>
                  <TableCell className="text-sm">{getCompanyName(contract.company_id)}</TableCell>
                  <TableCell>{contract.effective_date ? new Date(contract.effective_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={contract.status === 'ACTIVE' ? 'default' : 'outline'}>
                      {contract.status === 'DRAFT' ? 'Rascunho' : contract.status === 'ACTIVE' ? 'Ativo' : contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{contract.items?.length || 0} itens</TableCell>
                </TableRow>
              ))}
              {!contracts?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-text-secondary">
                    Nenhum contrato encontrado. Aprovação de cotações gera contratos automaticamente.
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
