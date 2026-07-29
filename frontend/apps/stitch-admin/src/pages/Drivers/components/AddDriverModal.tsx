import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../shared/ui/components/Modal';
import { Input } from '../../../shared/ui/components/Input';
import { Button } from '../../../shared/ui/components/Button';
import { useRegisterDriverFleetDriversPost, getListDriversFleetDriversGetQueryKey } from '../../../shared/api/generated/fleet/fleet';

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDriverModal({ isOpen, onClose }: AddDriverModalProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: registerDriver, isPending } = useRegisterDriverFleetDriversPost();
  
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !licenseNumber) return;

    try {
      await registerDriver({
        data: {
          name,
          license_number: licenseNumber
        }
      });
      // Invalidate the query so the table refreshes
      queryClient.invalidateQueries({ queryKey: getListDriversFleetDriversGetQueryKey() });
      
      // Clear form and close
      setName('');
      setLicenseNumber('');
      onClose();
    } catch (error) {
      console.error('Failed to add driver:', error);
      // In a real app we'd show a toast here
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Driver">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Full Name</label>
          <Input 
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="license" className="text-sm font-medium">License Number</label>
          <Input 
            id="license"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="DL-12345678"
            required
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !name || !licenseNumber}>
            {isPending ? 'Adding...' : 'Add Driver'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
