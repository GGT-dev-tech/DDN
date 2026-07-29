import { useListOfferingsApiV1CatalogOfferingsGet } from "../../../shared/api/generated/catalog/catalog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/ui/components/Table";
import { Badge } from "../../../shared/ui/components/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/components/Card";
import { Tags } from "lucide-react";

export function OfferingsTable() {
  const { data: offerings, isLoading, error } = useListOfferingsApiV1CatalogOfferingsGet();

  if (isLoading) return <div>Carregando Ofertas de Serviço...</div>;
  if (error) return <div className="text-red-500">Erro ao carregar Ofertas: {(error as Error).message}</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Tags className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Ofertas de Serviço</CardTitle>
        </div>
        <CardDescription>
          Gerencie o portfólio de serviços oferecidos pela sua empresa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {offerings && offerings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atributos Vinculados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offerings.map((offering: any) => (
                <TableRow key={offering.id}>
                  <TableCell className="font-medium">
                    <div>{offering.name}</div>
                    {offering.description && (
                      <div className="text-xs text-muted-foreground">{offering.description}</div>
                    )}
                  </TableCell>
                  <TableCell>{offering.category}</TableCell>
                  <TableCell>
                    <Badge variant={offering.status === 'Active' ? 'default' : 'outline'}>
                      {offering.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {offering.attributes.length} atributo(s)
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma oferta de serviço encontrada.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
