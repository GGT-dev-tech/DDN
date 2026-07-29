import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../shared/ui/components/Modal';
import { Input } from '../../../shared/ui/components/Input';
import { Button } from '../../../shared/ui/components/Button';
import { useCreateRouteRoutingRoutesPost, getListRoutesRoutingRoutesGetQueryKey } from '../../../shared/api/generated/routing/routing';

interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRouteModal({ isOpen, onClose }: AddRouteModalProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: createRoute, isPending } = useCreateRouteRoutingRoutesPost();
  
  // execution_date is required, formatted as YYYY-MM-DD
  const [executionDate, setExecutionDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executionDate) return;

    try {
      await createRoute({
        data: {
          execution_date: executionDate,
        }
      });
      // Invalidate the query so the table refreshes
      queryClient.invalidateQueries({ queryKey: getListRoutesRoutingRoutesGetQueryKey() });
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Failed to create route:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Route">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="executionDate" className="text-sm font-medium">Execution Date</label>
          <Input 
            id="executionDate"
            type="date"
            value={executionDate}
            onChange={(e) => setExecutionDate(e.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !executionDate}>
            {isPending ? 'Creating...' : 'Create Route'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
