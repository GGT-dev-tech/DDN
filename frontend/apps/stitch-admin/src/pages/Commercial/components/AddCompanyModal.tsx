import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../shared/ui/components/Modal';
import { Input } from '../../../shared/ui/components/Input';
import { Button } from '../../../shared/ui/components/Button';
import { useCreateCompanyApiV1CommercialCompaniesPost, getListCompaniesApiV1CommercialCompaniesGetQueryKey } from '../../../shared/api/generated/commercial/commercial';
import { toast } from 'sonner';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCompanyModal({ isOpen, onClose }: AddCompanyModalProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: createCompany, isPending } = useCreateCompanyApiV1CommercialCompaniesPost();
  
  const [tradeName, setTradeName] = useState('');
  const [corporateName, setCorporateName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName || !corporateName || !documentNumber) return;

    try {
      await createCompany({
        data: {
          trade_name: tradeName,
          corporate_name: corporateName,
          document_number: documentNumber,
        }
      });
      toast.success('Cliente cadastrado com sucesso!');
      
      queryClient.invalidateQueries({ queryKey: getListCompaniesApiV1CommercialCompaniesGetQueryKey() });
      
      setTradeName('');
      setCorporateName('');
      setDocumentNumber('');
      onClose();
    } catch (error: any) {
      console.error('Failed to create company:', error);
      toast.error(error?.response?.data?.detail || 'Erro ao cadastrar cliente.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Cliente">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="corporateName" className="text-sm font-medium">Razão Social</label>
          <Input 
            id="corporateName"
            value={corporateName}
            onChange={(e) => setCorporateName(e.target.value)}
            placeholder="Nome oficial da empresa"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="tradeName" className="text-sm font-medium">Nome Fantasia</label>
          <Input 
            id="tradeName"
            value={tradeName}
            onChange={(e) => setTradeName(e.target.value)}
            placeholder="Nome como é conhecida"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="documentNumber" className="text-sm font-medium">Documento (CNPJ/CPF)</label>
          <Input 
            id="documentNumber"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="Apenas números"
            required
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || !tradeName || !corporateName || !documentNumber}>
            {isPending ? 'Salvando...' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
