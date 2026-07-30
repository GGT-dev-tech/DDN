import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRegisterUomApiV1CatalogUomPost } from '../../../shared/api/generated/catalog/catalog'
import { Button } from '../../../shared/ui/components/Button'
import { Input } from '../../../shared/ui/components/Input'
import { Select } from '../../../shared/ui/components/Select'

interface UOMFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function UOMForm({ onSuccess, onCancel }: UOMFormProps) {
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [baseType, setBaseType] = useState('VOLUME')
  
  const queryClient = useQueryClient()
  const { mutate, isPending } = useRegisterUomApiV1CatalogUomPost()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !symbol || !baseType) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    mutate(
      { data: { name, symbol, base_type: baseType as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['listUomsApiV1CatalogUomGet'] })
          onSuccess?.()
        },
        onError: (err: any) => {
          alert(err.response?.data?.detail || 'Ocorreu um erro ao criar a unidade de medida.')
        }
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome da Unidade *</label>
        <Input 
          placeholder="Ex: Metro Cúbico, Tonelada..." 
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={isPending}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Símbolo *</label>
        <Input 
          placeholder="Ex: m³, t, un..." 
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo Base *</label>
        <Select
          value={baseType}
          onChange={e => setBaseType(e.target.value)}
          disabled={isPending}
          options={[
            { label: 'Volume', value: 'VOLUME' },
            { label: 'Peso', value: 'WEIGHT' },
            { label: 'Unidade/Item', value: 'ITEM' },
            { label: 'Tempo', value: 'TIME' },
            { label: 'Distância', value: 'DISTANCE' },
          ]}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar Unidade'}
        </Button>
      </div>
    </form>
  )
}
