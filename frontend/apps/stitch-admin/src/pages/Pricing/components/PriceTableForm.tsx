import { useState } from 'react'
import { useCreatePriceTableApiV1PricingTablesPost } from '../../../../shared/api/generated/pricing/pricing'
import { Button } from '../../../../shared/ui/components/Button'
import { Input } from '../../../../shared/ui/components/Input'
import { toast } from 'sonner'

interface PriceTableFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function PriceTableForm({ onSuccess, onCancel }: PriceTableFormProps) {
  const [name, setName] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const { mutate, isPending } = useCreatePriceTableApiV1PricingTablesPost()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !effectiveDate) {
      toast.error('Por favor, preencha o Nome e a Data de Início.')
      return
    }

    mutate(
      { 
        data: { 
          name,
          effective_date: effectiveDate,
          end_date: endDate || undefined,
          is_active: true
        } 
      },
      {
        onSuccess: () => {
          toast.success('Tabela de Preços criada com sucesso!')
          onSuccess?.()
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || 'Ocorreu um erro ao criar a tabela.')
        }
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome da Tabela *</label>
        <Input 
          placeholder="Ex: Tabela Padrão 2026" 
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Se você não especificar um Cliente, a tabela será considerada Global.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Data de Início *</label>
          <Input 
            type="date"
            value={effectiveDate}
            onChange={e => setEffectiveDate(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Data de Término</label>
          <Input 
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
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
          {isPending ? 'Salvando...' : 'Salvar Tabela'}
        </Button>
      </div>
    </form>
  )
}
