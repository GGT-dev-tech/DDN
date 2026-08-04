import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { 
  useAttachAttributeApiV1CatalogOfferingsOfferingIdAttributesPost, 
  useListAttributesApiV1CatalogAttributesGet 
} from '../../../shared/api/generated/catalog/catalog'
import { Button } from '../../../shared/ui/components/Button'
import { Select } from '../../../shared/ui/components/Select'
import { Input } from '../../../shared/ui/components/Input'
import { toast } from 'sonner'
import { Layers } from 'lucide-react'

interface EditOfferingModalProps {
  offering: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditOfferingModal({ offering, onSuccess, onCancel }: EditOfferingModalProps) {
  const [selectedAttributeId, setSelectedAttributeId] = useState('')
  const [allowedValues, setAllowedValues] = useState('')
  
  const queryClient = useQueryClient()
  const { data: attributes, isLoading: isLoadingAttrs } = useListAttributesApiV1CatalogAttributesGet()
  const { mutate, isPending } = useAttachAttributeApiV1CatalogOfferingsOfferingIdAttributesPost()

  const handleAttach = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAttributeId) return

    const valuesArray = allowedValues.split(',').map(v => v.trim()).filter(Boolean)

    mutate(
      { 
        offeringId: offering.id,
        data: { 
          attribute_id: selectedAttributeId,
          allowed_values: valuesArray
        } 
      },
      {
        onSuccess: () => {
          toast.success('Atributo vinculado com sucesso!')
          queryClient.invalidateQueries({ queryKey: ['listOfferingsApiV1CatalogOfferingsGet'] })
          setSelectedAttributeId('')
          setAllowedValues('')
          onSuccess?.()
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || 'Ocorreu um erro ao vincular o atributo.')
        }
      }
    )
  }

  const unattachedAttributes = attributes?.filter(
    attr => !offering.attributes?.some((oa: any) => oa.attribute_id === attr.id)
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Layers size={16} className="text-brand-500" />
          Atributos Atuais ({offering.attributes?.length || 0})
        </h3>
        {offering.attributes?.length > 0 ? (
          <ul className="space-y-2">
            {offering.attributes.map((attr: any, i: number) => {
              const attrDetails = attributes?.find(a => a.id === attr.attribute_id)
              return (
                <li key={i} className="flex flex-col p-3 rounded-lg border border-border/50 bg-black/5 dark:bg-white/5">
                  <span className="font-medium text-sm">{attrDetails?.name || attr.attribute_id}</span>
                  <span className="text-xs text-text-secondary mt-1">Valores permitidos: {attr.allowed_values?.join(', ') || 'Qualquer'}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary">Nenhum atributo vinculado a esta oferta.</p>
        )}
      </div>

      <form onSubmit={handleAttach} className="space-y-4 border-t border-border/50 pt-6">
        <h3 className="text-sm font-semibold text-text-primary">Vincular Novo Atributo</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Selecione o Atributo</label>
          {isLoadingAttrs ? (
             <div className="text-sm">Carregando atributos...</div>
          ) : (
            <Select
              value={selectedAttributeId}
              onChange={e => setSelectedAttributeId(e.target.value)}
              disabled={isPending}
              options={[
                { label: 'Selecione...', value: '' },
                ...(unattachedAttributes || []).map(a => ({
                  label: a.name,
                  value: a.id
                }))
              ]}
            />
          )}
        </div>
        
        {selectedAttributeId && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Valores Permitidos (opcional)</label>
            <Input 
              placeholder="Separados por vírgula. Ex: Solido, Liquido" 
              value={allowedValues}
              onChange={e => setAllowedValues(e.target.value)}
              disabled={isPending}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="glass" onClick={onCancel}>Fechar</Button>
          <Button type="submit" disabled={isPending || !selectedAttributeId}>
            {isPending ? 'Vinculando...' : 'Vincular Atributo'}
          </Button>
        </div>
      </form>
    </div>
  )
}
