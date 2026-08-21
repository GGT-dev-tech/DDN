import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../shared/ui/components/Modal';
import { Input } from '../../../shared/ui/components/Input';
import { Button } from '../../../shared/ui/components/Button';
import { Select } from '../../../shared/ui/components/Select';
import { useCreateQuotationApiV1QuotationsPost, getListQuotationsApiV1QuotationsGetQueryKey } from '../../../shared/api/generated/quotations/quotations';
import { useListCompaniesApiV1CommercialCompaniesGet } from '../../../shared/api/generated/commercial/commercial';
import { useListPriceTablesApiV1PricingTablesGet } from '../../../shared/api/generated/pricing/pricing';
import { useListDestinationsApiV1FacilitiesDestinationsGet } from '../../../shared/api/generated/facilities/facilities';
import { useListMtrsApiV1ComplianceMtrsGet } from '../../../shared/api/generated/compliance/compliance';

interface AddQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyId?: string;
}

export function AddQuotationModal({ isOpen, onClose, defaultCompanyId }: AddQuotationModalProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: companies = [], isLoading: isCompaniesLoading } = useListCompaniesApiV1CommercialCompaniesGet(undefined, { query: { enabled: isOpen } });
  const { data: priceTables = [], isLoading: isPriceTablesLoading } = useListPriceTablesApiV1PricingTablesGet({ query: { enabled: isOpen } });
  const { mutateAsync: createQuotation, isPending } = useCreateQuotationApiV1QuotationsPost();
  
  const [companyId, setCompanyId] = useState(defaultCompanyId || '');
  const [priceTableId, setPriceTableId] = useState('');
  const [validityDays, setValidityDays] = useState('30');
  const [destinationId, setDestinationId] = useState('');
  const [mtrId, setMtrId] = useState('');
  const [freightDistance, setFreightDistance] = useState('');
  const [freightCost, setFreightCost] = useState('');

  const { data: destinations = [], isLoading: isDestinationsLoading } = useListDestinationsApiV1FacilitiesDestinationsGet(undefined, { query: { enabled: isOpen } });
  const { data: mtrs = [], isLoading: isMtrsLoading } = useListMtrsApiV1ComplianceMtrsGet(undefined, { query: { enabled: isOpen && !!companyId } });

  // Sync defaultCompanyId when modal opens
  useEffect(() => {
    if (isOpen && defaultCompanyId) {
      setCompanyId(defaultCompanyId);
    }
  }, [isOpen, defaultCompanyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !validityDays || !priceTableId) return;

    try {
      const result = await createQuotation({
        data: {
          company_id: companyId,
          price_table_id: priceTableId,
          validity_days: parseInt(validityDays, 10),
          destination_id: destinationId || null,
          mtr_id: mtrId || null,
          freight_distance: freightDistance ? parseFloat(freightDistance) : null,
          freight_cost: freightCost ? parseFloat(freightCost) : null,
        }
      });
      // Invalidate the query so the table refreshes
      queryClient.invalidateQueries({ queryKey: getListQuotationsApiV1QuotationsGetQueryKey() });
      
      // Close modal
      onClose();
      
      // Redirect to the new quotation details using string index or standard type check
      // As CreateQuotationApiV1QuotationsPost200 is an unknown type, we need to assert it or safely access quotation_id
      const responseData = result as any;
      if (responseData && responseData.quotation_id) {
         navigate(`/admin/quotations/${responseData.quotation_id}`);
      }
    } catch (error) {
      console.error('Failed to create quotation:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Criar Nova Cotação">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="companyId" className="text-sm font-medium">Cliente</label>
          <Select 
            id="companyId"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            disabled={isCompaniesLoading}
            options={[
              { label: 'Selecione um cliente...', value: '' },
              ...companies.map((company: any) => ({
                label: company.trade_name,
                value: company.id
              }))
            ]}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="priceTableId" className="text-sm font-medium">Tabela de Preços</label>
          <Select 
            id="priceTableId"
            value={priceTableId}
            onChange={(e) => setPriceTableId(e.target.value)}
            disabled={isPriceTablesLoading}
            options={[
              { label: 'Selecione uma tabela...', value: '' },
              ...priceTables.map((table: any) => ({
                label: table.name,
                value: table.id
              }))
            ]}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="validityDays" className="text-sm font-medium">Validade (Dias)</label>
          <Input 
            id="validityDays"
            type="number"
            min="1"
            value={validityDays}
            onChange={(e) => setValidityDays(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="destinationId" className="text-sm font-medium">Destino</label>
          <Select 
            id="destinationId"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            disabled={isDestinationsLoading}
            options={[
              { label: 'Selecione um destino (opcional)', value: '' },
              ...destinations.map((dest: any) => ({
                label: dest.name,
                value: dest.id
              }))
            ]}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="mtrId" className="text-sm font-medium">MTR (Vinculado ao Cliente)</label>
          <Select 
            id="mtrId"
            value={mtrId}
            onChange={(e) => setMtrId(e.target.value)}
            disabled={isMtrsLoading || !companyId}
            options={[
              { label: 'Selecione um MTR (opcional)', value: '' },
              ...mtrs.map((mtr: any) => ({
                label: mtr.id.substring(0, 8),
                value: mtr.id
              }))
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="freightDistance" className="text-sm font-medium">Distância Frete (km)</label>
            <Input 
              id="freightDistance"
              type="number"
              step="0.01"
              value={freightDistance}
              onChange={(e) => setFreightDistance(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="freightCost" className="text-sm font-medium">Custo Frete (R$)</label>
            <Input 
              id="freightCost"
              type="number"
              step="0.01"
              value={freightCost}
              onChange={(e) => setFreightCost(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || !companyId || !validityDays || !priceTableId}>
            {isPending ? 'Criando...' : 'Criar Cotação'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
