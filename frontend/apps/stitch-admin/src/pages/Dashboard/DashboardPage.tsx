import { Scale, RefreshCcw, Truck, CircleDollarSign } from 'lucide-react'
import { useGetDashboardStatsApiV1DashboardStatsGet } from '../../shared/api/generated/dashboard/dashboard'
import { DashboardChart } from './components/DashboardChart'
import { ActivityFeed } from './components/ActivityFeed'

export function DashboardPage() {
  const { data } = useGetDashboardStatsApiV1DashboardStatsGet()
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  // MOCK Values for the new KPIs until backend is updated
  const totalMensal = (data as any)?.total_monthly_tons ?? 1245.8
  const recyclingRate = (data as any)?.recycling_rate ?? 68.2
  const coletasHoje = (data as any)?.collections_today?.total ?? 42
  const faturamentoAtivo = (data as any)?.active_billing ?? 284000

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-1">Painel de Controle</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Visão Geral da Operação</h1>
          <p className="text-sm text-text-secondary mt-1 capitalize">{today}</p>
        </div>
        
        {/* Quick Filters */}
        <div className="flex items-center gap-2 bg-surface-white dark:bg-black/5 p-1 rounded-lg border border-border/50">
          <button className="px-4 py-1.5 text-sm font-semibold text-brand-500 bg-brand-500/10 rounded-md">Hoje</button>
          <button className="px-4 py-1.5 text-sm font-medium text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors">7 Dias</button>
          <button className="px-4 py-1.5 text-sm font-medium text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors">30 Dias</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-surface-white dark:bg-black/5 rounded-xl p-5 border border-border/50 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-500/5 rounded-full blur-xl group-hover:bg-brand-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Mensal (Ton)</p>
            <Scale className="text-brand-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">{totalMensal}</p>
          <p className="text-xs text-green-500 font-medium mt-1">+12.5% vs mês ant.</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-white dark:bg-black/5 rounded-xl p-5 border border-border/50 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Taxa de Reciclagem</p>
            <RefreshCcw className="text-teal-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">{recyclingRate}%</p>
          <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full mt-2 mb-1 overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${recyclingRate}%` }} />
          </div>
          <p className="text-xs text-text-secondary mt-1">Meta: 75%</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-white dark:bg-black/5 rounded-xl p-5 border border-border/50 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Coletas Hoje</p>
            <Truck className="text-purple-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">{coletasHoje}</p>
          <p className="text-xs text-text-secondary mt-1">
            <span className="font-medium">18</span> concluídas • <span className="font-medium text-blue-500">24</span> em rota
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-white dark:bg-black/5 rounded-xl p-5 border border-border/50 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Faturamento Ativo</p>
            <CircleDollarSign className="text-emerald-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(faturamentoAtivo)}
          </p>
          <p className="text-xs text-text-secondary mt-1">Ciclo atual (01 - 30 Nov)</p>
        </div>
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <DashboardChart />
        </div>
        <div className="lg:col-span-4">
          <ActivityFeed />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-surface-white dark:bg-black/5 rounded-xl border border-border/50 overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
        <div className="p-5 border-b border-border/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-text-primary">Solicitações Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border/50 text-xs uppercase text-text-secondary font-semibold">
              <tr>
                <th className="px-5 py-3">ID Solicitação</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Resíduo</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-3 font-mono text-xs">REQ-2024-0891</td>
                <td className="px-5 py-3 font-medium text-text-primary">TechCorp Industries</td>
                <td className="px-5 py-3 text-text-secondary">Eletrônico</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500">Pendente</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="text-brand-500 hover:text-brand-600 font-medium text-sm">Roteirizar</button>
                </td>
              </tr>
              <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-3 font-mono text-xs">REQ-2024-0890</td>
                <td className="px-5 py-3 font-medium text-text-primary">Rede SuperMercados XYZ</td>
                <td className="px-5 py-3 text-text-secondary">Orgânico</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-500">Em Rota</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="text-text-secondary hover:text-text-primary font-medium text-sm">Ver Mapa</button>
                </td>
              </tr>
              <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-3 font-mono text-xs">REQ-2024-0889</td>
                <td className="px-5 py-3 font-medium text-text-primary">Construtora Base</td>
                <td className="px-5 py-3 text-text-secondary">Entulho</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500">Concluído</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="text-text-secondary hover:text-text-primary font-medium text-sm">Recibo</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
