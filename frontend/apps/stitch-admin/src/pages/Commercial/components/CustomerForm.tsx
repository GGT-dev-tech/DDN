import { useState } from 'react'
import { useRegisterLeadApiV1CommercialLeadsPost } from '../../../../shared/api/generated/commercial/commercial'
import { Button } from '../../../../shared/ui/components/Button'
import { Input } from '../../../../shared/ui/components/Input'
import { toast } from 'sonner'

interface CustomerFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CustomerForm({ onSuccess, onCancel }: CustomerFormProps) {
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  
  const { mutate, isPending } = useRegisterLeadApiV1CommercialLeadsPost()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyName || !contactName) {
      toast.error('Por favor, preencha os campos obrigatórios (Empresa e Contato).')
      return
    }

    mutate(
      { 
        data: { 
          company_name: companyName,
          contact_name: contactName,
          email: email || undefined,
          phone: phone || undefined
        } 
      },
      {
        onSuccess: () => {
          toast.success('Cliente (Lead) cadastrado com sucesso!')
          onSuccess?.()
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || 'Ocorreu um erro ao cadastrar o cliente.')
        }
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome da Empresa *</label>
        <Input 
          placeholder="Ex: Indústria XYZ Ltda" 
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Nome do Contato Principal *</label>
        <Input 
          placeholder="Ex: Maria Souza" 
          value={contactName}
          onChange={e => setContactName(e.target.value)}
          disabled={isPending}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">E-mail</label>
          <Input 
            type="email"
            placeholder="contato@xyz.com" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Telefone</label>
          <Input 
            placeholder="(11) 99999-9999" 
            value={phone}
            onChange={e => setPhone(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar Cliente'}
        </Button>
      </div>
    </form>
  )
}
