import { useState } from "react";
import { 
  useCreatePriceTableApiV1PricingTablesPost,
  useUpdatePriceTableApiV1PricingTablesTableIdPut
} from "../../../shared/api/generated/pricing/pricing";
import { Button } from "../../../shared/ui/components/Button";
import { Save, AlertCircle } from "lucide-react";

interface PriceTableFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function PriceTableForm({ onSuccess, onCancel, initialData }: PriceTableFormProps) {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name || "");
  const [effectiveDate, setEffectiveDate] = useState(initialData?.effective_date || "");
  const [endDate, setEndDate] = useState(initialData?.end_date || "");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  const { mutateAsync: createTable, isPending: isCreating, error: createError } = useCreatePriceTableApiV1PricingTablesPost();
  const { mutateAsync: updateTable, isPending: isUpdating, error: updateError } = useUpdatePriceTableApiV1PricingTablesTableIdPut();

  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !effectiveDate) return;

    try {
      const data = {
        name,
        effective_date: effectiveDate,
        end_date: endDate || undefined,
        is_active: isActive,
      };

      if (isEditing) {
        await updateTable({
          tableId: initialData.id,
          data
        });
      } else {
        await createTable({
          data
        });
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {(error as any)?.response?.data?.detail || "Erro ao salvar tabela de preços."}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Nome da Tabela *</label>
        <input
          type="text"
          className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Tabela Padrão 2026"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Data de Início *</label>
          <input
            type="date"
            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Data Fim (Opcional)</label>
          <input
            type="date"
            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 text-brand-500 border-border rounded focus:ring-brand-500 bg-black/5 dark:bg-white/5"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-text-primary">
          Ativar imediatamente
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="liquid" type="submit" disabled={isPending || !name || !effectiveDate} className="gap-2">
          {isPending ? "Salvando..." : (
            <>
              <Save size={16} /> {isEditing ? "Salvar Alterações" : "Salvar Tabela"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
