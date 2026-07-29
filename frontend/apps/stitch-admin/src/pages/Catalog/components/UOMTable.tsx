import { useListUomsApiV1CatalogUomGet } from "../../../shared/api/generated/catalog/catalog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/ui/components/Table";
import { Badge } from "../../../shared/ui/components/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/components/Card";
import { Package } from "lucide-react";

export function UOMTable() {
  const { data: uoms, isLoading, error } = useListUomsApiV1CatalogUomGet();

  if (isLoading) return <div>Carregando UOMs...</div>;
  if (error) return <div className="text-red-500">Erro ao carregar UOMs: {(error as Error).message}</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Unidades de Medida</CardTitle>
        </div>
        <CardDescription>
          Gerencie as unidades de medida base (UOMs) disponíveis no catálogo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uoms && uoms.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Símbolo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo Base</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uoms.map((uom: any) => (
                <TableRow key={uom.id}>
                  <TableCell className="font-medium">{uom.symbol}</TableCell>
                  <TableCell>{uom.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{uom.base_type}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma unidade de medida encontrada.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
