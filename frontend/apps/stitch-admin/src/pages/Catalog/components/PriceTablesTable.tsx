import { useState } from "react";
import { 
  useListPriceTablesApiV1PricingTablesGet,
  useTogglePriceTableStatusApiV1PricingTablesTableIdToggleStatusPost
} from "../../../shared/api/generated/pricing/pricing";
import { Badge } from "../../../shared/ui/components/Badge";
import { Table, Plus, RefreshCw, Calculator, Pencil, Power, PowerOff } from "lucide-react";
import { Button } from "../../../shared/ui/components/Button";
import { Modal } from "../../../shared/ui/components/Modal";
import { EmptyState } from "../../../shared/ui/components/EmptyState";
import { PriceTableForm } from "./PriceTableForm";
import { useNavigate } from "react-router-dom";

export function PriceTablesTable() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any | null>(null);
  
  const navigate = useNavigate();
  const { data: tables, isLoading, error, refetch } = useListPriceTablesApiV1PricingTablesGet();
  const { mutateAsync: toggleStatus, isPending: isToggling } = useTogglePriceTableStatusApiV1PricingTablesTableIdToggleStatusPost();

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatus({ tableId: id });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-panel rounded-xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-primary font-semibold">
          <Table size={18} className="text-brand-500" />
          Tabelas de Preços
        </div>
        <div className="flex gap-2">
          {tables && tables.length > 0 && (
            <Button variant="ghost" onClick={() => refetch()} className="gap-2 h-8 text-xs">
              <RefreshCw size={14} /> Atualizar
            </Button>
          )}
          <Button variant="liquid" onClick={() => setIsCreateModalOpen(true)} className="gap-2 h-8 text-xs">
            <Plus size={14} /> Nova Tabela
          </Button>
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-text-secondary">Carregando Tabelas de Preços...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Erro ao carregar Tabelas: {(error as Error).message}</div>
        ) : tables && tables.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Nome da Tabela</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Vigência</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tables.map((table) => (
                <tr key={table.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-text-primary">{table.name}</div>
                    <div className="text-xs text-text-secondary mt-1 max-w-sm truncate">
                      {table.items?.length || 0} itens cadastrados
                    </div>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {table.effective_date} {table.end_date ? `até ${table.end_date}` : '(sem fim)'}
                  </td>
                  <td className="p-4">
                    <Badge variant={table.is_active ? 'success' : 'outline'} className="variant-glass">
                      {table.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" className="h-8 text-xs px-2" onClick={() => handleToggleStatus(table.id)} disabled={isToggling} title={table.is_active ? "Inativar" : "Ativar"}>
                        {table.is_active ? <PowerOff size={14} className="text-red-500" /> : <Power size={14} className="text-green-500" />}
                      </Button>
                      <Button variant="ghost" className="h-8 text-xs px-2" onClick={() => setEditingTable(table)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" className="h-8 text-xs" onClick={() => navigate(`/admin/catalog/price-tables/${table.id}`)}>
                        <Calculator size={14} className="mr-1.5" />
                        Preços
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8">
            <EmptyState
              title="Nenhuma tabela de preço encontrada"
              description="Cadastre tabelas de preços para definir os valores que serão utilizados nas suas propostas comerciais."
              action={
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 mt-4">
                  <Plus size={16} /> Nova Tabela
                </Button>
              }
            />
          </div>
        )}
      </div>

      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova Tabela de Preços"
      >
        <PriceTableForm 
          onSuccess={() => { setIsCreateModalOpen(false); refetch(); }} 
          onCancel={() => setIsCreateModalOpen(false)} 
        />
      </Modal>

      <Modal 
        isOpen={!!editingTable} 
        onClose={() => setEditingTable(null)}
        title="Editar Tabela de Preços"
      >
        {editingTable && (
          <PriceTableForm 
            initialData={editingTable}
            onSuccess={() => { setEditingTable(null); refetch(); }} 
            onCancel={() => setEditingTable(null)} 
          />
        )}
      </Modal>
    </div>
  );
}
