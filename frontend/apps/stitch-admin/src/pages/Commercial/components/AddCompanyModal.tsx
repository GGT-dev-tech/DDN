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
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
  
  // Contact fields
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const handleCnpjBlur = async () => {
    const cleanCnpj = documentNumber.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;

    setIsFetchingCnpj(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!res.ok) throw new Error('CNPJ não encontrado');
      const data = await res.json();
      
      setCorporateName(data.razao_social || '');
      setTradeName(data.nome_fantasia || data.razao_social || '');
      setContactPhone(data.ddd_telefone_1 || '');
      setContactEmail(data.email || '');
      
      toast.success('Dados da empresa carregados!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao buscar CNPJ');
    } finally {
      setIsFetchingCnpj(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName || !corporateName || !documentNumber || !contactName || !contactEmail) return;

    try {
      await createCompany({
        data: {
          trade_name: tradeName,
          corporate_name: corporateName,
          document_number: documentNumber,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          contact_role: 'Contato Principal'
        }
      });
      toast.success('Cliente cadastrado com sucesso!');
      
      queryClient.invalidateQueries({ queryKey: getListCompaniesApiV1CommercialCompaniesGetQueryKey() });
      
      setTradeName('');
      setCorporateName('');
      setDocumentNumber('');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      onClose();
    } catch (error: any) {
      console.error('Failed to create company:', error);
      toast.error(error?.response?.data?.detail || 'Erro ao cadastrar cliente.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Cliente">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
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
              placeholder="Como é conhecida"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="documentNumber" className="text-sm font-medium">CNPJ / CPF</label>
            <div className="relative">
              <Input 
                id="documentNumber"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                onBlur={handleCnpjBlur}
                placeholder="Apenas números"
                disabled={isPending || isFetchingCnpj}
                required
              />
              {isFetchingCnpj && (
                <div className="absolute right-3 top-2.5">
                  <span className="text-brand-500 animate-spin flex items-center h-full">⌛</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className="border-border my-2" />
        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Contato Principal</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <label htmlFor="contactName" className="text-sm font-medium">Nome do Contato</label>
            <Input 
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ex: João da Silva"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="contactEmail" className="text-sm font-medium">Email</label>
            <Input 
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="joao@empresa.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contactPhone" className="text-sm font-medium">Telefone / WhatsApp</label>
            <Input 
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || !tradeName || !corporateName || !documentNumber || !contactName || !contactEmail}>
            {isPending ? 'Salvando...' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
