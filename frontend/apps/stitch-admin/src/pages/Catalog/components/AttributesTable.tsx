import { useListAttributesApiV1CatalogAttributesGet } from "../../../shared/api/generated/catalog/catalog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/ui/components/Table";
import { Badge } from "../../../shared/ui/components/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/components/Card";
import { ListTree } from "lucide-react";

export function AttributesTable() {
  const { data: attributes, isLoading, error } = useListAttributesApiV1CatalogAttributesGet();

  if (isLoading) return <div>Carregando Atributos...</div>;
  if (error) return <div className="text-red-500">Erro ao carregar Atributos: {(error as Error).message}</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListTree className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Atributos de Serviço</CardTitle>
        </div>
        <CardDescription>
          Gerencie os atributos e características que compõem os serviços.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {attributes && attributes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Obrigatório</TableHead>
                <TableHead>Valores Possíveis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes.map((attr: any) => (
                <TableRow key={attr.id}>
                  <TableCell className="font-medium">{attr.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{attr.attribute_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {attr.is_required ? (
                      <Badge variant="default">Sim</Badge>
                    ) : (
                      <Badge variant="outline">Não</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {attr.possible_values && attr.possible_values.length > 0 
                      ? attr.possible_values.join(', ')
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum atributo encontrado.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
