import { useState } from 'react';
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
      return { label: 'Ativo', variant: 'success' as const };
    case 'MAINTENANCE':
      return { label: 'Manutenção', variant: 'warning' as const };
    case 'INACTIVE':
      return { label: 'Inativo', variant: 'destructive' as const };
    default:
      return { label: status, variant: 'default' as const };
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

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <Truck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Gestão de Frota</h1>
              <p className="text-sm text-text-secondary mt-1">
                Gerencie os veículos e equipamentos da sua frota.
              </p>
            </div>
          </div>
          <Button variant="liquid" onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus size={18} />
            Novo Veículo
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Total</p>
              <p className="text-3xl font-bold text-text-primary">{vehicles.length}</p>
            </div>
            <Truck size={32} className="text-text-secondary opacity-50" />
          </div>
          <div className="glass-panel p-6 rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Ativos</p>
              <p className="text-3xl font-bold text-success-500">{totalActive}</p>
            </div>
            <CheckCircle size={32} className="text-success-500 opacity-50" />
          </div>
          <div className="glass-panel p-6 rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Manutenção</p>
              <p className="text-3xl font-bold text-warning-500">{totalMaintenance}</p>
            </div>
            <Wrench size={32} className="text-warning-500 opacity-50" />
          </div>
          <div className="glass-panel p-6 rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Inativos</p>
              <p className="text-3xl font-bold text-error-500">{totalInactive}</p>
            </div>
            <XCircle size={32} className="text-error-500 opacity-50" />
          </div>
        </div>

        {/* Tabela */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <Truck size={18} className="text-brand-500" />
              Veículos Cadastrados
            </div>
            {vehicles.length > 0 && (
              <Button variant="ghost" onClick={() => refetch()} className="gap-2 h-8 text-xs">
                <TrendingUp size={14} /> Atualizar
              </Button>
            )}
          </div>

          <div className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-text-secondary">Carregando frota...</div>
            ) : isError ? (
              <div className="p-8 text-center text-red-500">Erro ao carregar frota.</div>
            ) : vehicles.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Placa</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Tipo</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Cap. Volume (m³)</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Cap. Peso (t)</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vehicles.map((vehicle: any) => {
                    const st = vehicleStatusBadge(vehicle.status);
                    return (
                      <tr key={vehicle.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono font-semibold tracking-wider text-text-primary">
                          {vehicle.license_plate}
                        </td>
                        <td className="p-4 text-sm text-text-secondary">
                          {vehicleTypeLabel(vehicle.vehicle_type)}
                        </td>
                        <td className="p-4 text-sm text-text-primary text-right tabular-nums">
                          {vehicle.capacity_volume?.toFixed(1)}
                        </td>
                        <td className="p-4 text-sm text-text-primary text-right tabular-nums">
                          {vehicle.capacity_weight?.toFixed(1)}
                        </td>
                        <td className="p-4 text-right">
                          <Badge variant={st.variant} className="variant-glass">{st.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="Nenhum veículo encontrado"
                  description="Cadastre os caminhões da sua frota informando placa, tipo e capacidade de carga."
                  action={
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 mt-4">
                      <Plus size={16} /> Novo Veículo
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>

      </div>

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
