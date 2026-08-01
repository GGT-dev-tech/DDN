import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../shared/ui/components/Modal';
import { Input } from '../../../shared/ui/components/Input';
import { Button } from '../../../shared/ui/components/Button';
import { Select } from '../../../shared/ui/components/Select';
import { useAddQuotationItemApiV1QuotationsQuotationIdItemsPost, getGetQuotationApiV1QuotationsQuotationIdGetQueryKey } from '../../../shared/api/generated/quotations/quotations';
import { useListCatalogEntitiesApiV1CatalogGet } from '../../../shared/api/generated/catalog/catalog';

interface AddQuotationItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationId: string;
}

export function AddQuotationItemModal({ isOpen, onClose, quotationId }: AddQuotationItemModalProps) {
  const queryClient = useQueryClient();
  const { data: catalog, isLoading: isCatalogLoading } = useListCatalogEntitiesApiV1CatalogGet({ query: { enabled: isOpen } });
  const { mutateAsync: addItem, isPending } = useAddQuotationItemApiV1QuotationsQuotationIdItemsPost();
  
  const [serviceOfferingId, setServiceOfferingId] = useState('');
  const [uomId, setUomId] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceOfferingId || !uomId || !quantity) return;

    try {
      await addItem({
        quotationId,
        data: {
          service_offering_id: serviceOfferingId,
          unit_of_measure_id: uomId,
          quantity: parseFloat(quantity),
        }
      });
      // Invalidate the query so the details page refreshes
      queryClient.invalidateQueries({ queryKey: getGetQuotationApiV1QuotationsQuotationIdGetQueryKey(quotationId) });
      
      onClose();
    } catch (error) {
      console.error('Failed to add item to quotation:', error);
    }
  };

  const services = catalog?.services || [];
  const uoms = catalog?.uoms || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Serviço">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="serviceOfferingId" className="text-sm font-medium">Serviço</label>
          <Select 
            id="serviceOfferingId"
            value={serviceOfferingId}
            onChange={(e) => setServiceOfferingId(e.target.value)}
            disabled={isCatalogLoading}
            options={[
              { label: 'Selecione um serviço...', value: '' },
              ...services.map((svc: any) => ({
                label: svc.name,
                value: svc.id
              }))
            ]}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="uomId" className="text-sm font-medium">Unidade de Medida</label>
          <Select 
            id="uomId"
            value={uomId}
            onChange={(e) => setUomId(e.target.value)}
            disabled={isCatalogLoading}
            options={[
              { label: 'Selecione a UOM...', value: '' },
              ...uoms.map((uom: any) => ({
                label: `${uom.name} (${uom.symbol})`,
                value: uom.id
              }))
            ]}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="quantity" className="text-sm font-medium">Quantidade</label>
          <Input 
            id="quantity"
            type="number"
            min="0.1"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || !serviceOfferingId || !uomId || !quantity}>
            {isPending ? 'Adicionando...' : 'Adicionar Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
