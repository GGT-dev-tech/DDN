import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../shared/ui/components/Modal';
import { Input } from '../../../shared/ui/components/Input';
import { Button } from '../../../shared/ui/components/Button';
import { useCreateQuotationApiV1QuotationsPost, getListQuotationsApiV1QuotationsGetQueryKey } from '../../../shared/api/generated/quotations/quotations';

interface AddQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddQuotationModal({ isOpen, onClose }: AddQuotationModalProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: createQuotation, isPending } = useCreateQuotationApiV1QuotationsPost();
  
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
      console.error('Failed to create quotation:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Quotation">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="companyId" className="text-sm font-medium">Company ID (UUID)</label>
          <Input 
            id="companyId"
            type="text"
            placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="validityDays" className="text-sm font-medium">Validity (Days)</label>
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
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !companyId || !validityDays}>
            {isPending ? 'Creating...' : 'Create Quotation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
