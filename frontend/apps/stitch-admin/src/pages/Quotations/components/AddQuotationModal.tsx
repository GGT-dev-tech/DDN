import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../shared/ui/components/Modal';
import { Input } from '../../../shared/ui/components/Input';
import { Button } from '../../../shared/ui/components/Button';
import { useCreateQuotationApiV1QuotationsPost, getListQuotationsApiV1QuotationsGetQueryKey } from '../../../shared/api/generated/quotations/quotations';
import { useListCompaniesApiV1CommercialCompaniesGet } from '../../../shared/api/generated/commercial/commercial';

interface AddQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddQuotationModal({ isOpen, onClose }: AddQuotationModalProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: createQuotation, isPending } = useCreateQuotationApiV1QuotationsPost();
  const { data: companies = [], isLoading: isLoadingCompanies } = useListCompaniesApiV1CommercialCompaniesGet();
  
  const [companyId, setCompanyId] = useState('');
  const [validityDays, setValidityDays] = useState('30');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !validityDays) return;

    try {
      await createQuotation({
        data: {
          company_id: companyId,
          validity_days: parseInt(validityDays, 10),
        }
      });
      // Invalidate the query so the table refreshes
      queryClient.invalidateQueries({ queryKey: getListQuotationsApiV1QuotationsGetQueryKey() });
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Falha ao criar cotação:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Cotação">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="companyId" className="text-sm font-medium">Cliente</label>
          <select
            id="companyId"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              {isLoadingCompanies ? 'Carregando clientes...' : 'Selecione um cliente'}
            </option>
            {companies.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.corporate_name} ({c.document_number})
              </option>
            ))}
          </select>
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
