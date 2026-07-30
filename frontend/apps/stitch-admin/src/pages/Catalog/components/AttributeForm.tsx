import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDefineAttributeApiV1CatalogAttributesPost } from '../../../shared/api/generated/catalog/catalog'
import { Button } from '../../../shared/ui/components/Button'
import { Input } from '../../../shared/ui/components/Input'
import { Select } from '../../../shared/ui/components/Select'
import { X, Plus } from 'lucide-react'

interface AttributeFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function AttributeForm({ onSuccess, onCancel }: AttributeFormProps) {
  const [name, setName] = useState('')
  const [attributeType, setAttributeType] = useState('WASTE_TYPE')
  const [isRequired, setIsRequired] = useState(false)
  const [possibleValues, setPossibleValues] = useState<string[]>([])
  const [newValue, setNewValue] = useState('')
  
  const queryClient = useQueryClient()
  const { mutate, isPending } = useDefineAttributeApiV1CatalogAttributesPost()

  const handleAddValue = () => {
    if (newValue.trim() && !possibleValues.includes(newValue.trim())) {
      setPossibleValues([...possibleValues, newValue.trim()])
      setNewValue('')
    }
  }

  const handleRemoveValue = (val: string) => {
    setPossibleValues(possibleValues.filter(v => v !== val))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !attributeType) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    mutate(
      { data: { name, attribute_type: attributeType as any, is_required: isRequired, possible_values: possibleValues } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['listAttributesApiV1CatalogAttributesGet'] })
          onSuccess?.()
        },
        onError: (err: any) => {
          alert(err.response?.data?.detail || 'Ocorreu um erro ao criar o atributo.')
        }
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome do Atributo *</label>
        <Input 
          placeholder="Ex: Tipo de Resíduo, Frequência..." 
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo *</label>
        <Select
          value={attributeType}
          onChange={e => setAttributeType(e.target.value)}
          disabled={isPending}
          options={[
            { label: 'Tipo de Resíduo', value: 'WASTE_TYPE' },
            { label: 'Tipo de Contêiner', value: 'CONTAINER_TYPE' },
            { label: 'Frequência', value: 'FREQUENCY' },
            { label: 'Capacidade', value: 'CAPACITY' },
            { label: 'Numérico', value: 'NUMERIC' },
          ]}
        />
      </div>

      <div className="space-y-2 flex items-center gap-2 mt-4">
        <input 
          type="checkbox" 
          id="isRequired" 
          checked={isRequired}
          onChange={e => setIsRequired(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        <label htmlFor="isRequired" className="text-sm font-medium cursor-pointer">
          Atributo Obrigatório
        </label>
      </div>

      <div className="space-y-2 pt-2">
        <label className="text-sm font-medium">Valores Possíveis</label>
        <div className="flex gap-2">
          <Input 
            placeholder="Adicionar valor..." 
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddValue();
              }
            }}
            disabled={isPending}
          />
          <Button type="button" variant="glass" onClick={handleAddValue} disabled={isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {possibleValues.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {possibleValues.map((val) => (
              <span key={val} className="inline-flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md text-sm">
                {val}
                <button 
                  type="button" 
                  onClick={() => handleRemoveValue(val)}
                  className="text-text-tertiary hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="glass" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar Atributo'}
        </Button>
      </div>
    </form>
  )
}
