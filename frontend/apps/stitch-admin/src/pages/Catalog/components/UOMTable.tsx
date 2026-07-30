import { useState } from "react";
import { useListUomsApiV1CatalogUomGet } from "../../../shared/api/generated/catalog/catalog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/ui/components/Table";
import { Badge } from "../../../shared/ui/components/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/components/Card";
import { Package, Plus } from "lucide-react";
import { Button } from "../../../shared/ui/components/Button";
import { Modal } from "../../../shared/ui/components/Modal";
import { EmptyState } from "../../../shared/ui/components/EmptyState";
import { UOMForm } from "./UOMForm";

export function UOMTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: uoms, isLoading, error } = useListUomsApiV1CatalogUomGet();

  if (isLoading) return <div>Carregando UOMs...</div>;
  if (error) return <div className="text-red-500">Erro ao carregar UOMs: {(error as Error).message}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Unidades de Medida</CardTitle>
          </div>
          <CardDescription>
            Gerencie as unidades de medida base (UOMs) disponíveis no catálogo.
          </CardDescription>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova UOM
        </Button>
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
          <EmptyState
            title="Nenhuma unidade de medida encontrada"
            description="Cadastre sua primeira unidade de medida (ex: Metro, Litro, Tonelada) para começar a configurar os seus serviços."
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nova UOM
              </Button>
            }
          />
        )}
      </CardContent>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Nova Unidade de Medida"
      >
        <UOMForm 
          onSuccess={() => setIsModalOpen(false)} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </Card>
  );
}
