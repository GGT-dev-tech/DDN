import { useNavigate } from 'react-router-dom';
import { Package, Truck, Users, FileText, BriefcaseBusiness, CircleDollarSign, Route } from 'lucide-react';
import { useGetDashboardStatsApiV1DashboardStatsGet } from '../../shared/api/generated/dashboard/dashboard';
import { useListLeadsApiV1CommercialLeadsGet } from '../../shared/api/generated/commercial/commercial';
import { useListQuotationsApiV1QuotationsGet } from '../../shared/api/generated/quotations/quotations';
import { useListContractsApiV1ContractsGet } from '../../shared/api/generated/contracts/contracts';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  href?: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, href, subtitle }: StatCardProps) {
  const navigate = useNavigate();
  return (
    <div
      className={`glass-panel p-5 rounded-2xl flex items-start gap-4 ${href ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
      onClick={() => href && navigate(href)}
    >
      <div className={`rounded-xl p-2.5 ${color} shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-3xl font-bold tabular-nums">{value}</p>
        <p className="text-sm font-medium text-text-primary mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="glass-panel p-5 rounded-2xl animate-pulse h-28 bg-black/5 dark:bg-white/5" />;
}

export function DashboardPage() {
  const { data, isLoading } = useGetDashboardStatsApiV1DashboardStatsGet();
  const { data: leads } = useListLeadsApiV1CommercialLeadsGet();
  const { data: quotations } = useListQuotationsApiV1QuotationsGet();
  const { data: contracts } = useListContractsApiV1ContractsGet();

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const openLeads = leads?.filter((l: any) => l.status === 'NEW' || l.status === 'new').length ?? data?.open_leads ?? 0;
  const draftQuotations = quotations?.filter((q: any) => q.status === 'DRAFT').length ?? data?.pending_quotations ?? 0;
  const activeContracts = contracts?.filter((c: any) => c.status === 'ACTIVE').length ?? data?.active_contracts ?? 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary capitalize">{today}</h1>
        <p className="text-text-secondary mt-1">Visão geral das operações da DDN.</p>
      </div>

      {/* Commercial section */}
      <div>
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">CRM & Comercial</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <StatCard
                title="Leads em Aberto"
                value={openLeads}
                icon={<Users className="w-5 h-5 text-blue-400" />}
                color="bg-blue-500/10"
                href="/admin/customers"
                subtitle="Aguardando qualificação"
              />
              <StatCard
                title="Cotações em Rascunho"
                value={draftQuotations}
                icon={<FileText className="w-5 h-5 text-amber-400" />}
                color="bg-amber-500/10"
                href="/admin/quotations"
                subtitle="Aguardando aprovação"
              />
              <StatCard
                title="Contratos Ativos"
                value={activeContracts}
                icon={<BriefcaseBusiness className="w-5 h-5 text-green-400" />}
                color="bg-green-500/10"
                href="/admin/contracts"
                subtitle="Contratos em operação"
              />
            </>
          )}
        </div>
      </div>

      {/* Operations section */}
      <div>
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Operação & Frota</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <StatCard
                title="Rotas em Andamento"
                value={data?.active_routes ?? 0}
                icon={<Route className="w-5 h-5 text-brand-400" />}
                color="bg-brand-500/10"
                href="/admin/routes"
                subtitle="Rotas ativas agora"
              />
              <StatCard
                title="Coletas Pendentes"
                value={data?.pending_deliveries ?? 0}
                icon={<Package className="w-5 h-5 text-purple-400" />}
                color="bg-purple-500/10"
                href="/admin/service-orders"
                subtitle="Agendadas para hoje"
              />
              <StatCard
                title="Veículos Disponíveis"
                value={data?.available_vehicles ?? 0}
                icon={<Truck className="w-5 h-5 text-sky-400" />}
                color="bg-sky-500/10"
                href="/admin/fleet"
                subtitle="Prontos para operar"
              />
            </>
          )}
        </div>
      </div>

      {/* Financial section */}
      <div>
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Financeiro</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <SkeletonCard />
          ) : (
            <StatCard
              title="Faturas Geradas Hoje"
              value={data?.invoices_today ?? 0}
              icon={<CircleDollarSign className="w-5 h-5 text-emerald-400" />}
              color="bg-emerald-500/10"
              href="/admin/billing"
              subtitle="Fechamento do dia"
            />
          )}
        </div>
      </div>
    </div>
  );
}
