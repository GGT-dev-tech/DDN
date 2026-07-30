import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { useListVehiclesApiV1FleetVehiclesGet } from '../../shared/api/generated/fleet/fleet';
import { Modal } from '../../shared/ui/components/Modal';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import { VehicleForm } from './components/VehicleForm';
import { Plus, Truck } from 'lucide-react';

export function FleetPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: vehicles, isLoading, isError } = useListVehiclesApiV1FleetVehiclesGet();

  if (isLoading) return <div className="p-4">Loading vehicles...</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading vehicles.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Frota</h1>
          <p className="text-muted-foreground mt-1">Gerencie os caminhões e equipamentos da sua frota.</p>
        </div>
      </div>
      
      
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Veículos</CardTitle>
            </div>
            <CardDescription>
              Lista de todos os veículos cadastrados no sistema.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Veículo
          </Button>
        </CardHeader>
        <CardContent>
          {vehicles && vehicles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Capacidade (Vol)</TableHead>
                  <TableHead className="text-right">Capacidade (Peso)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle: any) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                    <TableCell>{vehicle.vehicle_type}</TableCell>
                    <TableCell className="text-right">{vehicle.capacity_volume} m³</TableCell>
                    <TableCell className="text-right">{vehicle.capacity_weight} t</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.status === 'AVAILABLE' ? 'default' : 'outline'}>
                        {vehicle.status === 'AVAILABLE' ? 'Disponível' : vehicle.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhum veículo encontrado"
              description="Cadastre os caminhões da sua frota informando placa, tipo e capacidade de carga."
              action={
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Novo Veículo
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
      
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Novo Veículo"
      >
        <VehicleForm 
          onSuccess={() => setIsAddModalOpen(false)} 
          onCancel={() => setIsAddModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
