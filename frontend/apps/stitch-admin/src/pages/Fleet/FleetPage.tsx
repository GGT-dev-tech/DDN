import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { useListVehiclesFleetVehiclesGet } from '../../shared/api/generated/fleet/fleet';
import { AddVehicleModal } from './components/AddVehicleModal';

export function FleetPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: vehicles, isLoading, isError } = useListVehiclesFleetVehiclesGet();

  if (isLoading) return <div className="p-4">Loading vehicles...</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading vehicles.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Fleet</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Vehicle</Button>
      </div>
      
      <AddVehicleModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
          <CardDescription>
            Manage your fleet of vehicles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Plate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Vol Capacity</TableHead>
                <TableHead className="text-right">Wt Capacity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                    No vehicles found.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles?.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                    <TableCell>{vehicle.vehicle_type}</TableCell>
                    <TableCell className="text-right">{vehicle.capacity_volume} m³</TableCell>
                    <TableCell className="text-right">{vehicle.capacity_weight} kg</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.status === 'AVAILABLE' ? 'default' : 'outline'}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
