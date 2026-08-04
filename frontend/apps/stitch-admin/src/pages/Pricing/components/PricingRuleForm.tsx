import { useState } from 'react'
import { Button } from '../../../shared/ui/components/Button'
import { Input } from '../../../shared/ui/components/Input'
import { toast } from 'sonner'
import { useCreatePricingRuleApiV1PricingRulesPost } from '../../../shared/api/generated/pricing/pricing'

interface PricingRuleFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function PricingRuleForm({ onSuccess, onCancel }: PricingRuleFormProps) {
  const [formData, setFormData] = useState<any>({
    name: '',
    scope: 'GLOBAL',
    rule_type: 'PERCENTAGE',
    value: 0,
    priority: 1,
  })
  
  const { mutateAsync: createRule, isPending } = useCreatePricingRuleApiV1PricingRulesPost()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createRule({
        data: formData
      })
      toast.success('Regra criada com sucesso!')
      onSuccess()
    } catch (error) {
      toast.error('Erro ao criar regra.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome da Regra</label>
        <Input 
          required 
          value={formData.name} 
          onChange={(e: any) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))} 
          placeholder="ex: Desconto de Volume"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Valor (%)</label>
        <Input 
          type="number"
          step="0.01"
          required 
          value={formData.value} 
          onChange={(e: any) => setFormData((prev: any) => ({ ...prev, value: parseFloat(e.target.value) }))} 
          placeholder="ex: -10 para desconto, 15 para acréscimo"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="liquid" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar Regra'}
        </Button>
      </div>
    </form>
  )
}
