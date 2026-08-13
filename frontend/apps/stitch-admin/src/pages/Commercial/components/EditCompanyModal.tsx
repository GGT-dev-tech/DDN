import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../shared/ui/components/Modal';
import { Input } from '../../../shared/ui/components/Input';
import { Button } from '../../../shared/ui/components/Button';
import { useUpdateCompanyApiV1CommercialCompaniesCompanyIdPatch, getGetCompanyApiV1CommercialCompaniesCompanyIdGetQueryKey, getListCompaniesApiV1CommercialCompaniesGetQueryKey } from '../../../shared/api/generated/commercial/commercial';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: {
    id: string;
    trade_name: string;
    corporate_name: string;
    document_number: string;
  };
}

export function EditCompanyModal({ isOpen, onClose, company }: EditCompanyModalProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: updateCompany, isPending } = useUpdateCompanyApiV1CommercialCompaniesCompanyIdPatch();
  
  const [formData, setFormData] = useState({
    trade_name: '',
    corporate_name: '',
    document_number: '',
  });

  useEffect(() => {
    if (company && isOpen) {
      setFormData({
        trade_name: company.trade_name || '',
        corporate_name: company.corporate_name || '',
        document_number: company.document_number || '',
      });
    }
  }, [company, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCompany({
        companyId: company.id,
        data: {
          trade_name: formData.trade_name,
          corporate_name: formData.corporate_name,
          document_number: formData.document_number,
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetCompanyApiV1CommercialCompaniesCompanyIdGetQueryKey(company.id) });
      queryClient.invalidateQueries({ queryKey: getListCompaniesApiV1CommercialCompaniesGetQueryKey() });
      onClose();
    } catch (error) {
      console.error('Failed to update company:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Dados do Cliente">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="corporate_name" className="text-sm font-medium">Razão Social</label>
          <Input 
            id="corporate_name"
            value={formData.corporate_name}
            onChange={(e) => setFormData({ ...formData, corporate_name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="trade_name" className="text-sm font-medium">Nome Fantasia</label>
          <Input 
            id="trade_name"
            value={formData.trade_name}
            onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="document_number" className="text-sm font-medium">Documento (CNPJ/CPF)</label>
          <Input 
            id="document_number"
            value={formData.document_number}
            onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
            required
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
