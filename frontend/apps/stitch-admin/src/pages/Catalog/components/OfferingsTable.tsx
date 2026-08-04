import { useState } from "react";
import { useListOfferingsApiV1CatalogOfferingsGet } from "../../../shared/api/generated/catalog/catalog";
import { Badge } from "../../../shared/ui/components/Badge";
import { Tags, Plus, RefreshCw, Layers } from "lucide-react";
import { Button } from "../../../shared/ui/components/Button";
import { Modal } from "../../../shared/ui/components/Modal";
import { EmptyState } from "../../../shared/ui/components/EmptyState";
import { OfferingForm } from "./OfferingForm";
import { EditOfferingModal } from "./EditOfferingModal";

export function OfferingsTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<any | null>(null);
  const { data: offerings, isLoading, error, refetch } = useListOfferingsApiV1CatalogOfferingsGet();

  return (
    <div className="glass-panel rounded-xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-primary font-semibold">
          <Tags size={18} className="text-brand-500" />
          Ofertas de Serviço
        </div>
        <div className="flex gap-2">
          {offerings && offerings.length > 0 && (
            <Button variant="ghost" onClick={() => refetch()} className="gap-2 h-8 text-xs">
              <RefreshCw size={14} /> Atualizar
            </Button>
          )}
          <Button variant="liquid" onClick={() => setIsModalOpen(true)} className="gap-2 h-8 text-xs">
            <Plus size={14} /> Nova Oferta
          </Button>
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-text-secondary">Carregando Ofertas de Serviço...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Erro ao carregar Ofertas: {(error as Error).message}</div>
        ) : offerings && offerings.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Nome</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Categoria</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Atributos Vinculados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {offerings.map((offering: any) => (
                <tr key={offering.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setEditingOffering(offering)}>
                  <td className="p-4">
                    <div className="font-medium text-text-primary">{offering.name}</div>
                    {offering.description && (
                      <div className="text-xs text-text-secondary mt-1 max-w-sm truncate">{offering.description}</div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {offering.category}
                  </td>
                  <td className="p-4">
                    <Badge variant={offering.status === 'Active' ? 'success' : 'outline'} className="variant-glass">
                      {offering.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-sm text-text-secondary">
                      <Layers size={14} />
                      {offering.attributes.length} atributo(s)
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8">
            <EmptyState
              title="Nenhuma oferta de serviço encontrada"
              description="Cadastre sua primeira oferta de serviço para começar a montar propostas comerciais para os seus clientes."
              action={
                <Button onClick={() => setIsModalOpen(true)} className="gap-2 mt-4">
                  <Plus size={16} /> Nova Oferta
                </Button>
              }
            />
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Nova Oferta de Serviço"
      >
        <OfferingForm 
          onSuccess={() => { setIsModalOpen(false); refetch(); }} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

      <Modal 
        isOpen={!!editingOffering} 
        onClose={() => setEditingOffering(null)}
        title={`Personalizar: ${editingOffering?.name}`}
      >
        {editingOffering && (
          <EditOfferingModal 
            offering={editingOffering}
            onSuccess={() => { refetch(); }} 
            onCancel={() => setEditingOffering(null)} 
          />
        )}
      </Modal>
    </div>
  );
}
