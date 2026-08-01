import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { useListDriversApiV1FleetDriversGet } from '../../shared/api/generated/fleet/fleet';
import { Modal } from '../../shared/ui/components/Modal';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import { DriverForm } from './components/DriverForm';
import { Plus, Users, CheckCircle, Clock, UserX } from 'lucide-react';

function driverStatusBadge(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return <Badge variant="success">Disponível</Badge>;
    case 'ASSIGNED':
      return <Badge variant="default">Em Rota</Badge>;
    case 'OFF_DUTY':
      return <Badge variant="outline">Fora de Serviço</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function driverStatusIcon(status: string) {
  switch (status) {
    case 'AVAILABLE': return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
    case 'ASSIGNED':  return <Clock       className="h-3.5 w-3.5 text-blue-500"  />;
    case 'OFF_DUTY':  return <UserX       className="h-3.5 w-3.5 text-zinc-400"  />;
    default:          return null;
  }
}

export function DriversPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: drivers = [], isLoading, isError, refetch } = useListDriversApiV1FleetDriversGet();

  const totalAvailable = drivers.filter((d: any) => d.status === 'AVAILABLE').length;
  const totalAssigned  = drivers.filter((d: any) => d.status === 'ASSIGNED').length;
  const totalOffDuty   = drivers.filter((d: any) => d.status === 'OFF_DUTY').length;

  if (isLoading) return (
    <div className="flex items-center justify-center p-16 text-zinc-400">
      Carregando motoristas...
    </div>
  );

  if (isError) return (
    <div className="p-4 text-red-500 bg-red-500/10 rounded-lg">
      Erro ao carregar motoristas. Verifique a conexão com a API.
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Motoristas</h1>
          <p className="text-muted-foreground mt-1">Gerencie os motoristas cadastrados na sua frota.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Motorista
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{drivers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
                <p className="text-3xl font-bold text-green-500">{totalAvailable}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Rota</p>
                <p className="text-3xl font-bold text-blue-500">{totalAssigned}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fora de Serviço</p>
                <p className="text-3xl font-bold text-zinc-400">{totalOffDuty}</p>
              </div>
              <UserX className="h-8 w-8 text-zinc-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drivers table */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Lista de Motoristas</CardTitle>
            </div>
            <CardDescription>
              Visualize e gerencie todos os motoristas registrados.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {drivers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Número da CNH</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver: any) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {driverStatusIcon(driver.status)}
                        {driver.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {driver.license_number}
                    </TableCell>
                    <TableCell>
                      {driverStatusBadge(driver.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Nenhum motorista encontrado"
              description="Cadastre os motoristas da sua equipe informando o nome e o número da CNH."
              action={
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Novo Motorista
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Novo Motorista"
      >
        <DriverForm
          onSuccess={() => { setIsAddModalOpen(false); refetch(); }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
