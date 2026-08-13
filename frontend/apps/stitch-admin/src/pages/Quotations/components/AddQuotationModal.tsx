import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../shared/ui/components/Modal';
import { Input } from '../../../shared/ui/components/Input';
import { Button } from '../../../shared/ui/components/Button';
import { Select } from '../../../shared/ui/components/Select';
import { useCreateQuotationApiV1QuotationsPost, getListQuotationsApiV1QuotationsGetQueryKey } from '../../../shared/api/generated/quotations/quotations';
import { useListCompaniesApiV1CommercialCompaniesGet } from '../../../shared/api/generated/commercial/commercial';

interface AddQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddQuotationModal({ isOpen, onClose }: AddQuotationModalProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: companies = [], isLoading: isCompaniesLoading } = useListCompaniesApiV1CommercialCompaniesGet(undefined, { query: { enabled: isOpen } });
  const { mutateAsync: createQuotation, isPending } = useCreateQuotationApiV1QuotationsPost();
  
  const [companyId, setCompanyId] = useState('');
  const [validityDays, setValidityDays] = useState('30');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !validityDays) return;

    try {
      const result = await createQuotation({
        data: {
          company_id: companyId,
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
          <Button type="submit" disabled={isPending || !companyId || !validityDays}>
            {isPending ? 'Criando...' : 'Criar Cotação'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
