import { useParams, useNavigate } from 'react-router-dom';
import { useGetLeadApiV1CommercialLeadsLeadIdGet } from '../../shared/api/generated/commercial/commercial';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { ArrowLeft, Building2, Mail, Phone, MapPin, User, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import { useListQuotationsApiV1QuotationsGet } from '../../shared/api/generated/quotations/quotations';

export function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch customer details
  const { data: customer, isLoading, isError } = useGetLeadApiV1CommercialLeadsLeadIdGet(id as string, {
    query: { enabled: !!id }
  });

  // Fetch quotations for this customer
  // Since the generated hook might not have a company_id filter yet, we fetch all and filter in frontend for now.
  // In a real scenario, we'd pass { company_id: id } to the query if the API supports it.
  const { data: allQuotations } = useListQuotationsApiV1QuotationsGet();
  const customerQuotations = allQuotations?.filter(q => q.company_id === id) || [];

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500">Carregando detalhes do cliente...</div>;
  }

  if (isError || !customer) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/customers')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Clientes
        </Button>
        <div className="p-8 text-center text-red-500 bg-red-500/10 rounded-lg">
          Erro ao carregar detalhes do cliente. Verifique se o ID está correto.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/customers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{customer.company_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs uppercase">
              {customer.status === 'new' ? 'Novo' : customer.status}
            </Badge>
            <span className="text-muted-foreground text-sm">Cadastrado em {new Date(customer.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-brand-500" /> Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.legal_name && (
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Razão Social</p>
                  <p className="text-sm text-muted-foreground">{customer.legal_name}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Contato Principal</p>
                <p className="text-sm text-muted-foreground">{customer.contact_name}</p>
              </div>
            </div>
            {customer.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a href={`mailto:${customer.email}`} className="text-sm text-brand-500 hover:underline">{customer.email}</a>
                </div>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <a href={`tel:${customer.phone}`} className="text-sm text-brand-500 hover:underline">{customer.phone}</a>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Segmento</p>
                <p className="text-sm text-muted-foreground capitalize">{customer.industry || 'Não especificado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotations Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Cotações e Propostas</CardTitle>
              <CardDescription>Histórico de propostas comerciais enviadas para este cliente.</CardDescription>
            </div>
            <Button onClick={() => navigate('/admin/quotations', { state: { customerId: customer.id } })}>
              Nova Cotação
            </Button>
          </CardHeader>
          <CardContent>
            {customerQuotations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID da Cotação</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerQuotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium text-xs font-mono">{quotation.id.split('-')[0]}</TableCell>
                      <TableCell>{new Date(quotation.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={quotation.status === 'APPROVED' ? 'default' : 'outline'}>
                          {quotation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/quotations/${quotation.id}`)}>
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState 
                title="Nenhuma cotação" 
                description="Este cliente ainda não possui nenhuma cotação ou proposta comercial vinculada."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
