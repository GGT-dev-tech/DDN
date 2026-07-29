import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../shared/ui/components/Modal';
import { Input } from '../../../shared/ui/components/Input';
import { Button } from '../../../shared/ui/components/Button';
import { Select } from '../../../shared/ui/components/Select';
import { useRegisterVehicleApiV1FleetVehiclesPost, getListVehiclesApiV1FleetVehiclesGetQueryKey } from '../../../shared/api/generated/fleet/fleet';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddVehicleModal({ isOpen, onClose }: AddVehicleModalProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: registerVehicle, isPending } = useRegisterVehicleApiV1FleetVehiclesPost();
  
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState<string>('VAN');
  const [capacityVolume, setCapacityVolume] = useState('10');
  const [capacityWeight, setCapacityWeight] = useState('1000');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate || !capacityVolume || !capacityWeight) return;

    try {
      await registerVehicle({
        data: {
          license_plate: licensePlate,
          vehicle_type: vehicleType,
          capacity_volume: parseFloat(capacityVolume),
          capacity_weight: parseFloat(capacityWeight)
        }
      });
      // Invalidate the query so the table refreshes
      queryClient.invalidateQueries({ queryKey: getListVehiclesApiV1FleetVehiclesGetQueryKey() });
      
      // Clear form and close
      setLicensePlate('');
      setVehicleType('VAN');
      setCapacityVolume('10');
      setCapacityWeight('1000');
      onClose();
    } catch (error) {
      console.error('Failed to add vehicle:', error);
    }
  };

  const vehicleTypeOptions = [
    { label: 'Van', value: 'VAN' },
    { label: 'Truck', value: 'TRUCK' },
    { label: 'Motorcycle', value: 'MOTORCYCLE' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Vehicle">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="licensePlate" className="text-sm font-medium">License Plate</label>
          <Input 
            id="licensePlate"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            placeholder="ABC-1234"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="vehicleType" className="text-sm font-medium">Vehicle Type</label>
          <Select 
            id="vehicleType"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            options={vehicleTypeOptions}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="capacityVolume" className="text-sm font-medium">Volume Capacity (m³)</label>
            <Input 
              id="capacityVolume"
              type="number"
              step="0.1"
              value={capacityVolume}
              onChange={(e) => setCapacityVolume(e.target.value)}
              placeholder="10"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="capacityWeight" className="text-sm font-medium">Weight Capacity (kg)</label>
            <Input 
              id="capacityWeight"
              type="number"
              step="0.1"
              value={capacityWeight}
              onChange={(e) => setCapacityWeight(e.target.value)}
              placeholder="1000"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !licensePlate}>
            {isPending ? 'Adding...' : 'Add Vehicle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
