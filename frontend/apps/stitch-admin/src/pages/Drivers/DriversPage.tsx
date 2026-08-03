import { useState } from 'react';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { useListDriversApiV1FleetDriversGet } from '../../shared/api/generated/fleet/fleet';
import { Modal } from '../../shared/ui/components/Modal';
import { EmptyState } from '../../shared/ui/components/EmptyState';
import { DriverForm } from './components/DriverForm';
import { Plus, Users, CheckCircle, Clock, UserX, RefreshCw } from 'lucide-react';

function driverStatusBadge(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return { label: 'Disponível', variant: 'success' as const };
    case 'ASSIGNED':
      return { label: 'Em Rota', variant: 'default' as const };
    case 'OFF_DUTY':
      return { label: 'Fora de Serviço', variant: 'outline' as const };
    default:
      return { label: status, variant: 'default' as const };
  }
}

function driverStatusIcon(status: string) {
  switch (status) {
    case 'AVAILABLE': return <CheckCircle className="h-4 w-4 text-success-500" />;
    case 'ASSIGNED':  return <Clock       className="h-4 w-4 text-brand-500"  />;
    case 'OFF_DUTY':  return <UserX       className="h-4 w-4 text-text-secondary"  />;
    default:          return null;
  }
}

export function DriversPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: drivers = [], isLoading, isError, refetch } = useListDriversApiV1FleetDriversGet();

  const totalAvailable = drivers.filter((d: any) => d.status === 'AVAILABLE').length;
  const totalAssigned  = drivers.filter((d: any) => d.status === 'ASSIGNED').length;
  const totalOffDuty   = drivers.filter((d: any) => d.status === 'OFF_DUTY').length;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Gestão de Motoristas</h1>
              <p className="text-sm text-text-secondary mt-1">
                Gerencie os motoristas cadastrados na sua frota.
              </p>
            </div>
          </div>
          <Button variant="liquid" onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus size={18} />
            Novo Motorista
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Total</p>
              <p className="text-3xl font-bold text-text-primary">{drivers.length}</p>
            </div>
            <Users size={32} className="text-text-secondary opacity-50" />
          </div>
          <div className="glass-panel p-6 rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Disponíveis</p>
              <p className="text-3xl font-bold text-success-500">{totalAvailable}</p>
            </div>
            <CheckCircle size={32} className="text-success-500 opacity-50" />
          </div>
          <div className="glass-panel p-6 rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Em Rota</p>
              <p className="text-3xl font-bold text-brand-500">{totalAssigned}</p>
            </div>
            <Clock size={32} className="text-brand-500 opacity-50" />
          </div>
          <div className="glass-panel p-6 rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Folga / OFF</p>
              <p className="text-3xl font-bold text-text-secondary">{totalOffDuty}</p>
            </div>
            <UserX size={32} className="text-text-secondary opacity-50" />
          </div>
        </div>

        {/* Tabela */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <Users size={18} className="text-brand-500" />
              Lista de Motoristas
            </div>
            {drivers.length > 0 && (
              <Button variant="ghost" onClick={() => refetch()} className="gap-2 h-8 text-xs">
                <RefreshCw size={14} /> Atualizar
              </Button>
            )}
          </div>

          <div className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-text-secondary">Carregando motoristas...</div>
            ) : isError ? (
              <div className="p-8 text-center text-red-500">Erro ao carregar motoristas.</div>
            ) : drivers.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Nome</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">CNH</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {drivers.map((driver: any) => {
                    const st = driverStatusBadge(driver.status);
                    return (
                      <tr key={driver.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium text-text-primary">
                          <div className="flex items-center gap-2">
                            {driverStatusIcon(driver.status)}
                            {driver.name}
                          </div>
                        </td>
                        <td className="p-4 text-sm font-mono text-text-secondary">
                          {driver.license_number}
                        </td>
                        <td className="p-4">
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
                  title="Nenhum motorista encontrado"
                  description="Cadastre os motoristas da sua equipe informando o nome e o número da CNH."
                  action={
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 mt-4">
                      <Plus size={16} /> Novo Motorista
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
