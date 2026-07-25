import { Package, Truck, AlertCircle } from 'lucide-react'
import { MetricCard } from '../../shared/ui/components/MetricCard'
import { useGetDashboardStatsApiV1DashboardStatsGet } from '../../shared/api/generated/dashboard/dashboard'

export function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardStatsApiV1DashboardStatsGet()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">Welcome to DDN Management platform.</p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl animate-pulse h-32 bg-black/5 dark:bg-white/5" />
          <div className="glass-panel p-6 rounded-2xl animate-pulse h-32 bg-black/5 dark:bg-white/5" />
          <div className="glass-panel p-6 rounded-2xl animate-pulse h-32 bg-black/5 dark:bg-white/5" />
        </div>
      ) : isError ? (
        <div className="p-4 text-red-500 bg-red-500/10 rounded-md">
          Failed to load dashboard statistics.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Active Routes"
            value={data?.active_routes ?? 0}
            icon={<Truck className="w-5 h-5" />}
          />
          <MetricCard
            title="Pending Deliveries"
            value={data?.pending_deliveries ?? 0}
            icon={<Package className="w-5 h-5" />}
          />
          <MetricCard
            title="Available Vehicles"
            value={data?.available_vehicles ?? 0}
            icon={<AlertCircle className="w-5 h-5" />}
          />
        </div>
      )}
    </div>
  )
}
