import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { useListDriversApiV1FleetDriversGet } from '../../shared/api/generated/fleet/fleet';
import { Modal } from '../../shared/ui/components/Modal';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import { DriverForm } from './components/DriverForm';
import { Plus, Users } from 'lucide-react';

export function DriversPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: drivers, isLoading, isError } = useListDriversApiV1FleetDriversGet();

  if (isLoading) return <div className="p-4">Loading drivers...</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading drivers.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Motoristas</h1>
          <p className="text-muted-foreground mt-1">Gerencie os motoristas cadastrados na sua frota.</p>
        </div>
      </div>


      
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
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Motorista
          </Button>
        </CardHeader>
        <CardContent>
          {drivers && drivers.length > 0 ? (
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
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell>{driver.license_number}</TableCell>
                    <TableCell>
                      <Badge variant={driver.status === 'AVAILABLE' ? 'default' : 'outline'}>
                        {driver.status === 'AVAILABLE' ? 'Disponível' : driver.status}
                      </Badge>
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
          onSuccess={() => setIsAddModalOpen(false)} 
          onCancel={() => setIsAddModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
