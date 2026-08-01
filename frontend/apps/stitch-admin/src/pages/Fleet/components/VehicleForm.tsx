import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRegisterVehicleApiV1FleetVehiclesPost } from '../../../shared/api/generated/fleet/fleet'
import { Button } from '../../../shared/ui/components/Button'
import { Input } from '../../../shared/ui/components/Input'
import { toast } from 'sonner'

interface VehicleFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function VehicleForm({ onSuccess, onCancel }: VehicleFormProps) {
  const [licensePlate, setLicensePlate] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [capacityVolume, setCapacityVolume] = useState('')
  const [capacityWeight, setCapacityWeight] = useState('')
  
  const queryClient = useQueryClient()
  const { mutate, isPending } = useRegisterVehicleApiV1FleetVehiclesPost()

  // Simple mask for license plate (ex: ABC-1234 or ABC1D23)
  const handleLicensePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (value.length > 7) value = value.slice(0, 7)
    
    // Auto-insert hyphen if it looks like standard plate ABC-1234
    if (value.length > 3 && /^[A-Z]{3}[0-9]/.test(value)) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`
    }
    
    setLicensePlate(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!licensePlate || !vehicleType || !capacityVolume || !capacityWeight) {
      toast.error('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    mutate(
      { 
        data: { 
          license_plate: licensePlate.replace('-', ''), // send raw
          vehicle_type: vehicleType, 
          capacity_volume: parseFloat(capacityVolume),
          capacity_weight: parseFloat(capacityWeight)
        } 
      },
      {
        onSuccess: () => {
          toast.success('Veículo cadastrado com sucesso!')
          queryClient.invalidateQueries({ queryKey: ['listVehiclesApiV1FleetVehiclesGet'] })
          onSuccess?.()
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || 'Ocorreu um erro ao cadastrar o veículo.')
        }
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Placa *</label>
          <Input 
            placeholder="Ex: ABC-1234 ou ABC1D23" 
            value={licensePlate}
            onChange={handleLicensePlateChange}
            disabled={isPending}
            maxLength={8}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Veículo *</label>
          <select
            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={vehicleType}
            onChange={e => setVehicleType(e.target.value)}
            disabled={isPending}
            required
          >
            <option value="" disabled>Selecione um tipo...</option>
            <option value="COMPACTOR_TRUCK">Caminhão Compactador</option>
            <option value="ROLL_OFF_TRUCK">Roll-Off</option>
            <option value="VACUUM_TRUCK">Caminhão Vácuo</option>
            <option value="VAN">Furgão / Van</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Capacidade - Volume (m³) *</label>
          <Input 
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 15.5" 
            value={capacityVolume}
            onChange={e => setCapacityVolume(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Capacidade - Peso (t) *</label>
          <Input 
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 10.0" 
            value={capacityWeight}
            onChange={e => setCapacityWeight(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="glass" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar Veículo'}
        </Button>
      </div>
    </form>
  )
}
