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
