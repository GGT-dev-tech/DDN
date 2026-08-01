import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { useListVehiclesApiV1FleetVehiclesGet } from '../../shared/api/generated/fleet/fleet';
import { Modal } from '../../shared/ui/components/Modal';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import { VehicleForm } from './components/VehicleForm';
import { Plus, Truck, CheckCircle, Wrench, XCircle, TrendingUp } from 'lucide-react';

function vehicleStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="success">Ativo</Badge>;
    case 'MAINTENANCE':
      return <Badge variant="warning">Manutenção</Badge>;
    case 'INACTIVE':
      return <Badge variant="destructive">Inativo</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function vehicleTypeLabel(type: string) {
  const map: Record<string, string> = {
    COMPACTOR_TRUCK: 'Compactador',
    ROLL_OFF_TRUCK: 'Roll-Off',
    VACUUM_TRUCK: 'Caminhão Vácuo',
    VAN: 'Furgão',
  };
  return map[type] || type;
}

export function FleetPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: vehicles = [], isLoading, isError, refetch } = useListVehiclesApiV1FleetVehiclesGet();

  const totalActive      = vehicles.filter((v: any) => v.status === 'ACTIVE').length;
  const totalMaintenance = vehicles.filter((v: any) => v.status === 'MAINTENANCE').length;
  const totalInactive    = vehicles.filter((v: any) => v.status === 'INACTIVE').length;

  if (isLoading) return (
    <div className="flex items-center justify-center p-16 text-zinc-400">
      Carregando frota...
    </div>
  );

  if (isError) return (
    <div className="p-4 text-red-500 bg-red-500/10 rounded-lg">
      Erro ao carregar veículos. Verifique a conexão com a API.
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Frota</h1>
          <p className="text-muted-foreground mt-1">Gerencie os veículos e equipamentos da sua frota.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Veículo
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{vehicles.length}</p>
              </div>
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-3xl font-bold text-green-500">{totalActive}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Manutenção</p>
                <p className="text-3xl font-bold text-yellow-500">{totalMaintenance}</p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-3xl font-bold text-red-500">{totalInactive}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles table */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Veículos Cadastrados</CardTitle>
            </div>
            <CardDescription>
              Lista de todos os veículos cadastrados no sistema.
            </CardDescription>
          </div>
          {vehicles.length > 0 && (
            <Button variant="ghost" onClick={() => refetch()}>
              <TrendingUp className="mr-2 h-4 w-4" /> Atualizar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {vehicles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Cap. Volume (m³)</TableHead>
                  <TableHead className="text-right">Cap. Peso (t)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle: any) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-mono font-semibold tracking-wider">
                      {vehicle.license_plate}
                    </TableCell>
                    <TableCell>{vehicleTypeLabel(vehicle.vehicle_type)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {vehicle.capacity_volume?.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {vehicle.capacity_weight?.toFixed(1)}
                    </TableCell>
                    <TableCell>
                      {vehicleStatusBadge(vehicle.status)}
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
          onSuccess={() => { setIsAddModalOpen(false); refetch(); }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
