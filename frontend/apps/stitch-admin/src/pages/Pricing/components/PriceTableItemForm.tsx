import { useState } from 'react';
import { useListOfferingsApiV1CatalogOfferingsGet, useListUomsApiV1CatalogUomGet } from '../../../shared/api/generated/catalog/catalog';
import { useAddPriceTableItemApiV1PricingTablesTableIdItemsPost } from '../../../shared/api/generated/pricing/pricing';
import { Button } from '../../../shared/ui/components/Button';
import { Input } from '../../../shared/ui/components/Input';
import { toast } from 'sonner';

interface PriceTableItemFormProps {
  tableId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PriceTableItemForm({ tableId, onSuccess, onCancel }: PriceTableItemFormProps) {
  const [serviceOfferingId, setServiceOfferingId] = useState('');
  const [unitOfMeasureId, setUnitOfMeasureId] = useState('');
  const [amount, setAmount] = useState('');

  const { data: offerings, isLoading: loadingOfferings } = useListOfferingsApiV1CatalogOfferingsGet();
  const { data: uoms, isLoading: loadingUoms } = useListUomsApiV1CatalogUomGet();
  const { mutate, isPending } = useAddPriceTableItemApiV1PricingTablesTableIdItemsPost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceOfferingId || !unitOfMeasureId || !amount) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('O valor unitário deve ser um número positivo.');
      return;
    }

    mutate(
      {
        tableId,
        data: {
          service_offering_id: serviceOfferingId,
          unit_of_measure_id: unitOfMeasureId,
          amount: parsedAmount as any,
          currency: 'BRL',
        },
      },
      {
        onSuccess: () => {
          toast.success('Item adicionado à tabela de preços!');
          onSuccess?.();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.detail || 'Erro ao adicionar item.');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Serviço (Oferta) *</label>
        <select
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={serviceOfferingId}
          onChange={(e) => setServiceOfferingId(e.target.value)}
          disabled={isPending || loadingOfferings}
        >
          <option value="">Selecione um serviço...</option>
          {offerings?.map((offering: any) => (
            <option key={offering.id} value={offering.id}>
              {offering.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Unidade de Medida *</label>
        <select
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={unitOfMeasureId}
          onChange={(e) => setUnitOfMeasureId(e.target.value)}
          disabled={isPending || loadingUoms}
        >
          <option value="">Selecione uma unidade...</option>
          {uoms?.map((uom: any) => (
            <option key={uom.id} value={uom.id}>
              {uom.name} ({uom.symbol})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Valor Unitário (R$) *</label>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Ex: 150.00"
          value={amount}
          onChange={(e: any) => setAmount(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="glass" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending || loadingOfferings || loadingUoms}>
          {isPending ? 'Salvando...' : 'Adicionar Item'}
        </Button>
      </div>
    </form>
  );
}
