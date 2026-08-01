import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../shared/ui/components/Modal';
import { Input } from '../../../shared/ui/components/Input';
import { Button } from '../../../shared/ui/components/Button';
import { Select } from '../../../shared/ui/components/Select';
import { useCreateRouteApiV1RoutingRoutesPost, getListRoutesApiV1RoutingRoutesGetQueryKey } from '../../../shared/api/generated/routing/routing';
import { useListVehiclesApiV1FleetVehiclesGet, useListDriversApiV1FleetDriversGet } from '../../../shared/api/generated/fleet/fleet';
import { toast } from 'sonner';

interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRouteModal({ isOpen, onClose }: AddRouteModalProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: createRoute, isPending } = useCreateRouteApiV1RoutingRoutesPost();
  const { data: vehicles = [] } = useListVehiclesApiV1FleetVehiclesGet();
  const { data: drivers  = [] } = useListDriversApiV1FleetDriversGet();

  // execution_date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [executionDate, setExecutionDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');

  const availableVehicles = (vehicles as any[]).filter(v => v.status === 'ACTIVE');
  const availableDrivers  = (drivers  as any[]).filter(d => d.status === 'AVAILABLE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executionDate) return;

    try {
      await createRoute({
        data: {
          execution_date: executionDate,
          ...(vehicleId ? { vehicle_id: vehicleId } : {}),
          ...(driverId  ? { driver_id: driverId   } : {}),
        } as any
      });
      queryClient.invalidateQueries({ queryKey: getListRoutesApiV1RoutingRoutesGetQueryKey() });
      toast.success('Rota criada com sucesso!');
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Erro ao criar rota.');
      console.error('Failed to create route:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Rota">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="executionDate" className="text-sm font-medium">Data de Execução *</label>
          <Input
            id="executionDate"
            type="date"
            value={executionDate}
            onChange={(e) => setExecutionDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="vehicleId" className="text-sm font-medium">Veículo (opcional)</label>
          <Select
            id="vehicleId"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            options={[
              { label: 'Selecione um veículo...', value: '' },
              ...availableVehicles.map((v: any) => ({
                label: `${v.license_plate} — ${v.vehicle_type}`,
                value: v.id
              }))
            ]}
          />
          {availableVehicles.length === 0 && (
            <p className="text-xs text-yellow-500">Nenhum veículo ativo disponível.</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="driverId" className="text-sm font-medium">Motorista (opcional)</label>
          <Select
            id="driverId"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            options={[
              { label: 'Selecione um motorista...', value: '' },
              ...availableDrivers.map((d: any) => ({
                label: d.name,
                value: d.id
              }))
            ]}
          />
          {availableDrivers.length === 0 && (
            <p className="text-xs text-yellow-500">Nenhum motorista disponível.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || !executionDate}>
            {isPending ? 'Criando...' : 'Criar Rota'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
