import { useEffect, useState } from 'react'
import { Modal } from '../../../shared/ui/components/Modal'
import { Button } from '../../../shared/ui/components/Button'
import { Input } from '../../../shared/ui/components/Input'
import { Select } from '../../../shared/ui/components/Select'
import type { DestinationResponse, CreateDestinationRequest, UpdateDestinationRequest } from '../../../shared/api/generated/model'
import { DestinationType } from '../../../shared/api/generated/model'
import {
  useCreateDestinationApiV1FacilitiesDestinationsPost,
  useUpdateDestinationApiV1FacilitiesDestinationsDestinationIdPut,
} from '../../../shared/api/generated/facilities/facilities'
import { toast } from 'sonner'

interface DestinationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  destination?: DestinationResponse | null
}

const DESTINATION_TYPES = [
  { label: 'Base da Empresa (Própria)', value: DestinationType.DDN_BASE },
  { label: 'Aterro Sanitário', value: DestinationType.LANDFILL },
  { label: 'Centro de Reciclagem', value: DestinationType.RECYCLING_CENTER },
  { label: 'Usina de Tratamento', value: DestinationType.TREATMENT_PLANT },
  { label: 'Outro', value: DestinationType.OTHER }
]

export function DestinationModal({ isOpen, onClose, onSuccess, destination }: DestinationModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<DestinationType>(DestinationType.LANDFILL)
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('SP')
  const [zipCode, setZipCode] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { mutateAsync: createDestination, isPending: isCreating } = useCreateDestinationApiV1FacilitiesDestinationsPost()
  const { mutateAsync: updateDestination, isPending: isUpdating } = useUpdateDestinationApiV1FacilitiesDestinationsDestinationIdPut()

  const isPending = isCreating || isUpdating

  useEffect(() => {
    if (destination && isOpen) {
      setName(destination.name)
      setType(destination.type)
      setContactName(destination.contact_name || '')
      setContactPhone(destination.contact_phone || '')
      setStreet(destination.address.street)
      setNumber(destination.address.number)
      setComplement(destination.address.complement || '')
      setNeighborhood(destination.address.neighborhood)
      setCity(destination.address.city)
      setState(destination.address.state)
      setZipCode(destination.address.zip_code)
      setErrors({})
    } else if (!destination && isOpen) {
      setName('')
      setType(DestinationType.LANDFILL)
      setContactName('')
      setContactPhone('')
      setStreet('')
      setNumber('')
      setComplement('')
      setNeighborhood('')
      setCity('')
      setState('SP')
      setZipCode('')
      setErrors({})
    }
  }, [destination, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name) newErrors.name = 'Nome é obrigatório'
    if (!street) newErrors.street = 'Rua é obrigatória'
    if (!number) newErrors.number = 'Número é obrigatório'
    if (!neighborhood) newErrors.neighborhood = 'Bairro é obrigatório'
    if (!city) newErrors.city = 'Cidade é obrigatória'
    if (!state || state.length !== 2) newErrors.state = 'UF deve ter 2 caracteres'
    if (!zipCode || zipCode.length < 8) newErrors.zipCode = 'CEP inválido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      name,
      type,
      contact_name: contactName || undefined,
      contact_phone: contactPhone || undefined,
      address: {
        street,
        number,
        complement: complement || undefined,
        neighborhood,
        city,
        state,
        zip_code: zipCode,
      }
    }

    try {
      if (destination) {
        await updateDestination({
          destinationId: destination.id,
          data: payload as UpdateDestinationRequest
        })
        toast.success('Destino atualizado com sucesso!')
      } else {
        await createDestination({
          data: payload as CreateDestinationRequest
        })
        toast.success('Destino cadastrado com sucesso!')
      }
      onSuccess()
    } catch (error) {
      toast.error('Erro ao salvar destino. Verifique os dados.')
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={destination ? 'Editar Destino' : 'Novo Destino'}
      className="sm:max-w-[600px]"
    >
      <form onSubmit={onSubmit}>
        <p className="text-sm text-muted-foreground mb-4">
          {destination ? 'Atualize as informações do local de destinação.' : 'Cadastre um novo local de destinação.'}
        </p>

        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label htmlFor="name" className="text-sm font-medium">Nome do Local</label>
              <Input
                id="name"
                placeholder="Ex: Aterro Sanitário Central"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
              {errors.name && <span className="text-sm text-destructive">{errors.name}</span>}
            </div>

            <div className="space-y-2 col-span-2">
              <label htmlFor="type" className="text-sm font-medium">Tipo de Instalação</label>
              <Select
                id="type"
                options={DESTINATION_TYPES}
                value={type}
                onChange={(e) => setType(e.target.value as DestinationType)}
              />
            </div>

            {/* Contato */}
            <div className="space-y-2">
              <label htmlFor="contact_name" className="text-sm font-medium">Contato (Opcional)</label>
              <Input 
                id="contact_name" 
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact_phone" className="text-sm font-medium">Telefone (Opcional)</label>
              <Input 
                id="contact_phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            {/* Endereço */}
            <div className="col-span-2 mt-4 mb-2">
              <h4 className="text-sm font-medium">Endereço</h4>
            </div>

            <div className="space-y-2">
              <label htmlFor="zip_code" className="text-sm font-medium">CEP</label>
              <Input 
                id="zip_code" 
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                error={errors.zipCode}
              />
              {errors.zipCode && <span className="text-sm text-destructive">{errors.zipCode}</span>}
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1"></div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label htmlFor="street" className="text-sm font-medium">Rua/Avenida</label>
              <Input 
                id="street" 
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                error={errors.street}
              />
              {errors.street && <span className="text-sm text-destructive">{errors.street}</span>}
            </div>
            <div className="space-y-2">
              <label htmlFor="number" className="text-sm font-medium">Número</label>
              <Input 
                id="number" 
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                error={errors.number}
              />
              {errors.number && <span className="text-sm text-destructive">{errors.number}</span>}
            </div>

            <div className="space-y-2">
              <label htmlFor="complement" className="text-sm font-medium">Complemento</label>
              <Input 
                id="complement" 
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="neighborhood" className="text-sm font-medium">Bairro</label>
              <Input 
                id="neighborhood" 
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                error={errors.neighborhood}
              />
              {errors.neighborhood && <span className="text-sm text-destructive">{errors.neighborhood}</span>}
            </div>

            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">Cidade</label>
              <Input 
                id="city" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                error={errors.city}
              />
              {errors.city && <span className="text-sm text-destructive">{errors.city}</span>}
            </div>
            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-medium">Estado (UF)</label>
              <Input 
                id="state" 
                maxLength={2} 
                value={state}
                onChange={(e) => setState(e.target.value)}
                error={errors.state}
              />
              {errors.state && <span className="text-sm text-destructive">{errors.state}</span>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
