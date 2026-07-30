import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDraftOfferingApiV1CatalogOfferingsPost, useListUomsApiV1CatalogUomGet } from '../../../shared/api/generated/catalog/catalog'
import { Button } from '../../../shared/ui/components/Button'
import { Input } from '../../../shared/ui/components/Input'
import { Select } from '../../../shared/ui/components/Select'
import { toast } from 'sonner'

interface OfferingFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function OfferingForm({ onSuccess, onCancel }: OfferingFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [defaultUomId, setDefaultUomId] = useState('')
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0])
  
  const queryClient = useQueryClient()
  const { data: uoms, isLoading: isLoadingUoms } = useListUomsApiV1CatalogUomGet()
  const { mutate, isPending } = useDraftOfferingApiV1CatalogOfferingsPost()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !category || !defaultUomId || !effectiveDate) {
      toast.error('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    mutate(
      { 
        data: { 
          name, 
          description, 
          category, 
          default_uom_id: defaultUomId,
          effective_date: effectiveDate
        } 
      },
      {
        onSuccess: () => {
          toast.success('Oferta de serviço criada com sucesso!')
          queryClient.invalidateQueries({ queryKey: ['listOfferingsApiV1CatalogOfferingsGet'] })
          onSuccess?.()
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || 'Ocorreu um erro ao criar a oferta.')
        }
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome da Oferta *</label>
        <Input 
          placeholder="Ex: Coleta de Resíduos Classe 1..." 
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição</label>
        <Input 
          placeholder="Descrição detalhada do serviço..." 
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoria *</label>
          <Input 
            placeholder="Ex: Coleta, Tratamento..." 
            value={category}
            onChange={e => setCategory(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Data Efetiva *</label>
          <Input 
            type="date"
            value={effectiveDate}
            onChange={e => setEffectiveDate(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Unidade de Medida Padrão (UOM) *</label>
        {isLoadingUoms ? (
          <div className="text-sm text-muted-foreground">Carregando UOMs...</div>
        ) : uoms && uoms.length > 0 ? (
          <Select
            value={defaultUomId}
            onChange={e => setDefaultUomId(e.target.value)}
            disabled={isPending}
            options={[
              { label: 'Selecione uma Unidade de Medida', value: '' },
              ...uoms.map(uom => ({
                label: `${uom.name} (${uom.symbol})`,
                value: uom.id
              }))
            ]}
          />
        ) : (
          <div className="text-sm text-red-500">
            Nenhuma Unidade de Medida cadastrada. Cadastre uma UOM primeiro.
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="glass" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending || !defaultUomId}>
          {isPending ? 'Salvando...' : 'Salvar Oferta'}
        </Button>
      </div>
    </form>
  )
}
