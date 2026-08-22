import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  useGetPriceTableApiV1PricingTablesTableIdGet,
  useAddPriceTableItemApiV1PricingTablesTableIdItemsPost 
} from "../../shared/api/generated/pricing/pricing";
import { useListOfferingsApiV1CatalogOfferingsGet, useListUomsApiV1CatalogUomGet } from "../../shared/api/generated/catalog/catalog";
import { ArrowLeft, Calculator, Plus, Save, AlertCircle, Pencil } from "lucide-react";
import { Button } from "../../shared/ui/components/Button";
import { Badge } from "../../shared/ui/components/Badge";
import { Modal } from "../../shared/ui/components/Modal";
import { PriceTableForm } from "./components/PriceTableForm";

export function PriceTableDetailsPage() {
  const { tableId } = useParams();
  
  const { data: table, isLoading: isLoadingTables, refetch } = useGetPriceTableApiV1PricingTablesTableIdGet(tableId as string, { query: { enabled: !!tableId } });
  
  const { data: offerings } = useListOfferingsApiV1CatalogOfferingsGet();
  const { data: uoms } = useListUomsApiV1CatalogUomGet();
  
  const { mutateAsync: addItem, isPending } = useAddPriceTableItemApiV1PricingTablesTableIdItemsPost();
  
  const [selectedOffering, setSelectedOffering] = useState("");
  const [selectedUom, setSelectedUom] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!tableId || !selectedOffering || !selectedUom || !amount) return;

    try {
      await addItem({
        tableId,
        data: {
          service_offering_id: selectedOffering,
          unit_of_measure_id: selectedUom,
          amount: parseFloat(amount),
          currency: "BRL"
        }
      });
      // Force reload or mutate query cache to show new item
      refetch();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Erro ao adicionar preço");
    }
  };

  if (isLoadingTables) {
    return <div className="p-12 text-center text-text-secondary">Carregando detalhes...</div>;
  }

  if (!table) {
    return <div className="p-12 text-center text-red-500">Tabela não encontrada.</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4">
          <Link to="/admin/catalog" className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary hover:text-text-primary p-2 h-auto">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">{table.name}</h1>
              <Badge variant={table.is_active ? 'success' : 'outline'} className="variant-glass">
                {table.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
              <Button variant="ghost" className="h-8 w-8 p-0 ml-2" onClick={() => setIsEditModalOpen(true)}>
                <Pencil size={16} />
              </Button>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Vigência: {table.effective_date} {table.end_date ? `até ${table.end_date}` : '(sem fim)'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 font-semibold flex items-center gap-2">
                <Calculator size={18} className="text-brand-500" />
                Itens Precificados
              </div>
              <div className="p-0">
                {table.items && table.items.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-black/5 dark:bg-white/5 text-xs text-text-secondary uppercase">
                        <th className="p-4">Serviço</th>
                        <th className="p-4">Unidade</th>
                        <th className="p-4 text-right">Preço</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {table.items.map((item) => {
                        const offeringName = offerings?.find(o => o.id === item.service_offering_id)?.name || item.service_offering_id;
                        const uomName = uoms?.find(u => u.id === item.unit_of_measure_id)?.symbol || item.unit_of_measure_id;
                        return (
                          <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                            <td className="p-4 font-medium text-text-primary">{offeringName}</td>
                            <td className="p-4 text-sm text-text-secondary">{uomName}</td>
                            <td className="p-4 text-right font-medium text-text-primary">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: (item.unit_price?.currency as string) || 'BRL' }).format(Number(item.unit_price?.amount) || 0)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-text-secondary text-sm">
                    Nenhum item precificado nesta tabela. Use o formulário ao lado para adicionar.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Plus size={18} className="text-brand-500" />
                Adicionar Preço
              </h3>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Oferta de Serviço *</label>
                  <select
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={selectedOffering}
                    onChange={(e) => setSelectedOffering(e.target.value)}
                    required
                  >
                    <option value="">Selecione uma oferta...</option>
                    {offerings?.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Unidade de Medida *</label>
                  <select
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={selectedUom}
                    onChange={(e) => setSelectedUom(e.target.value)}
                    required
                  >
                    <option value="">Selecione uma unidade...</option>
                    {uoms?.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Valor Unitário *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg pl-9 pr-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="liquid" className="w-full gap-2" disabled={isPending || !selectedOffering || !selectedUom || !amount}>
                  {isPending ? "Adicionando..." : (
                    <>
                      <Save size={16} /> Adicionar
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Tabela de Preços"
      >
        <PriceTableForm 
          initialData={table}
          onSuccess={() => { setIsEditModalOpen(false); refetch(); }} 
          onCancel={() => setIsEditModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
