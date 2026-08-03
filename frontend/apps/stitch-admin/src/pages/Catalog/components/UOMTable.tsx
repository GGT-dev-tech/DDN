import { useState } from "react";
import { useListUomsApiV1CatalogUomGet } from "../../../shared/api/generated/catalog/catalog";
import { Badge } from "../../../shared/ui/components/Badge";
import { Package, Plus, RefreshCw } from "lucide-react";
import { Button } from "../../../shared/ui/components/Button";
import { Modal } from "../../../shared/ui/components/Modal";
import { EmptyState } from "../../../shared/ui/components/EmptyState";
import { UOMForm } from "./UOMForm";

export function UOMTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: uoms, isLoading, error, refetch } = useListUomsApiV1CatalogUomGet();

  return (
    <div className="glass-panel rounded-xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-primary font-semibold">
          <Package size={18} className="text-brand-500" />
          Unidades de Medida
        </div>
        <div className="flex gap-2">
          {uoms && uoms.length > 0 && (
            <Button variant="ghost" onClick={() => refetch()} className="gap-2 h-8 text-xs">
              <RefreshCw size={14} /> Atualizar
            </Button>
          )}
          <Button variant="liquid" onClick={() => setIsModalOpen(true)} className="gap-2 h-8 text-xs">
            <Plus size={14} /> Nova UOM
          </Button>
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-text-secondary">Carregando UOMs...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Erro ao carregar UOMs: {(error as Error).message}</div>
        ) : uoms && uoms.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Símbolo</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Nome</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Tipo Base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {uoms.map((uom: any) => (
                <tr key={uom.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-semibold tracking-wider text-text-primary">
                    {uom.symbol}
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {uom.name}
                  </td>
                  <td className="p-4 text-right">
                    <Badge variant="outline" className="variant-glass">{uom.base_type}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8">
            <EmptyState
              title="Nenhuma unidade de medida encontrada"
              description="Cadastre sua primeira unidade de medida (ex: Metro, Litro, Tonelada) para começar a configurar os seus serviços."
              action={
                <Button onClick={() => setIsModalOpen(true)} className="gap-2 mt-4">
                  <Plus size={16} /> Nova UOM
                </Button>
              }
            />
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Nova Unidade de Medida"
      >
        <UOMForm 
          onSuccess={() => { setIsModalOpen(false); refetch(); }} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
