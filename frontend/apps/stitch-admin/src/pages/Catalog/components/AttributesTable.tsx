import { useState } from "react";
import { useListAttributesApiV1CatalogAttributesGet } from "../../../shared/api/generated/catalog/catalog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/ui/components/Table";
import { Badge } from "../../../shared/ui/components/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/components/Card";
import { ListTree, Plus } from "lucide-react";
import { Button } from "../../../shared/ui/components/Button";
import { Modal } from "../../../shared/ui/components/Modal";
import { EmptyState } from "../../../shared/ui/components/EmptyState";
import { AttributeForm } from "./AttributeForm";

export function AttributesTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: attributes, isLoading, error } = useListAttributesApiV1CatalogAttributesGet();

  if (isLoading) return <div>Carregando Atributos...</div>;
  if (error) return <div className="text-red-500">Erro ao carregar Atributos: {(error as Error).message}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ListTree className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Atributos de Serviço</CardTitle>
          </div>
          <CardDescription>
            Gerencie os atributos e características que compõem os serviços.
          </CardDescription>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Atributo
        </Button>
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
          <EmptyState
            title="Nenhum atributo encontrado"
            description="Crie atributos como 'Tipo de Resíduo' ou 'Frequência' para associar às suas Ofertas de Serviço."
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Novo Atributo
              </Button>
            }
          />
        )}
      </CardContent>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Novo Atributo de Serviço"
      >
        <AttributeForm 
          onSuccess={() => setIsModalOpen(false)} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </Card>
  );
}
