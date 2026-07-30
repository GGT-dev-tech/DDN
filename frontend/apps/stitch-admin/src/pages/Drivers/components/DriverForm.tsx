import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRegisterDriverApiV1FleetDriversPost } from '../../../shared/api/generated/fleet/fleet'
import { Button } from '../../../shared/ui/components/Button'
import { Input } from '../../../shared/ui/components/Input'
import { toast } from 'sonner'

interface DriverFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function DriverForm({ onSuccess, onCancel }: DriverFormProps) {
  const [name, setName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  
  const queryClient = useQueryClient()
  const { mutate, isPending } = useRegisterDriverApiV1FleetDriversPost()

  // Simple mask for CNH (just numbers)
  const handleLicenseNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    setLicenseNumber(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !licenseNumber) {
      toast.error('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    if (licenseNumber.length < 11) {
      toast.error('A CNH deve ter 11 dígitos.')
      return
    }

    mutate(
      { 
        data: { 
          name, 
          license_number: licenseNumber
        } 
      },
      {
        onSuccess: () => {
          toast.success('Motorista cadastrado com sucesso!')
          queryClient.invalidateQueries({ queryKey: ['listDriversApiV1FleetDriversGet'] })
          onSuccess?.()
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || 'Ocorreu um erro ao cadastrar o motorista.')
        }
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome Completo *</label>
        <Input 
          placeholder="Ex: João da Silva" 
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Número da CNH *</label>
        <Input 
          placeholder="Apenas números (11 dígitos)" 
          value={licenseNumber}
          onChange={handleLicenseNumberChange}
          disabled={isPending}
          maxLength={11}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar Motorista'}
        </Button>
      </div>
    </form>
  )
}
