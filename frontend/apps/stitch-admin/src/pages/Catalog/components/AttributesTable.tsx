import { useState } from "react";
import { useListAttributesApiV1CatalogAttributesGet } from "../../../shared/api/generated/catalog/catalog";
import { Badge } from "../../../shared/ui/components/Badge";
import { ListTree, Plus, RefreshCw } from "lucide-react";
import { Button } from "../../../shared/ui/components/Button";
import { Modal } from "../../../shared/ui/components/Modal";
import { EmptyState } from "../../../shared/ui/components/EmptyState";
import { AttributeForm } from "./AttributeForm";

export function AttributesTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: attributes, isLoading, error, refetch } = useListAttributesApiV1CatalogAttributesGet();

  return (
    <div className="glass-panel rounded-xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-primary font-semibold">
          <ListTree size={18} className="text-brand-500" />
          Atributos de Serviço
        </div>
        <div className="flex gap-2">
          {attributes && attributes.length > 0 && (
            <Button variant="ghost" onClick={() => refetch()} className="gap-2 h-8 text-xs">
              <RefreshCw size={14} /> Atualizar
            </Button>
          )}
          <Button variant="liquid" onClick={() => setIsModalOpen(true)} className="gap-2 h-8 text-xs">
            <Plus size={14} /> Novo Atributo
          </Button>
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-text-secondary">Carregando Atributos...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Erro ao carregar Atributos: {(error as Error).message}</div>
        ) : attributes && attributes.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Nome</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Tipo</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Obrigatório</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Valores Possíveis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attributes.map((attr: any) => (
                <tr key={attr.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-text-primary">
                    {attr.name}
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    <Badge variant="outline" className="variant-glass">{attr.attribute_type}</Badge>
                  </td>
                  <td className="p-4 text-sm">
                    {attr.is_required ? (
                      <Badge variant="default" className="bg-brand-500/20 text-brand-500 hover:bg-brand-500/30">Sim</Badge>
                    ) : (
                      <Badge variant="outline">Não</Badge>
                    )}
                  </td>
                  <td className="p-4 text-right text-sm text-text-secondary">
                    {attr.possible_values && attr.possible_values.length > 0 
                      ? attr.possible_values.join(', ')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8">
            <EmptyState
              title="Nenhum atributo encontrado"
              description="Crie atributos como 'Tipo de Resíduo' ou 'Frequência' para associar às suas Ofertas de Serviço."
              action={
                <Button onClick={() => setIsModalOpen(true)} className="gap-2 mt-4">
                  <Plus size={16} /> Novo Atributo
                </Button>
              }
            />
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Novo Atributo de Serviço"
      >
        <AttributeForm 
          onSuccess={() => { setIsModalOpen(false); refetch(); }} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
