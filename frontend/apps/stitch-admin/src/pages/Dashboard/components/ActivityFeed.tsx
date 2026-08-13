import { CheckCircle2, Route, Clock } from 'lucide-react'

// MOCK DATA: Until we implement GET /api/v1/logistics/live-status
const mockActivities = [
  {
    id: 1,
    type: 'COMPLETED',
    title: 'Coleta Concluída: Indústria Apex',
    subtitle: 'Zona Sul • 4.2 Ton • Reciclável',
    time: 'Há 10m'
  },
  {
    id: 2,
    type: 'IN_ROUTE',
    title: 'Em Rota: Hospital Central',
    subtitle: 'Centro • Resíduo Hospitalar',
    time: 'Agora'
  },
  {
    id: 3,
    type: 'PENDING',
    title: 'Aguardando: Shopping Metro',
    subtitle: 'Zona Leste • Previsão: 14:30',
    time: 'Próximo'
  }
]

export function ActivityFeed() {
  return (
    <div className="bg-surface-white dark:bg-black/5 rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-border/50 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-text-primary">Status em Tempo Real</h3>
      </div>
      
      {/* Map Placeholder */}
      <div className="w-full h-40 bg-black/5 dark:bg-white/5 rounded-lg mb-6 relative overflow-hidden flex items-center justify-center border border-border/50">
        <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-23.5505,-46.6333&zoom=11&size=600x300&style=feature:all|element:labels|visibility:off&style=feature:road|element:geometry|color:0xcccccc')] bg-cover bg-center opacity-30 dark:invert" />
        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm border border-border/50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">12 Caminhões</span>
        </div>
      </div>

      <div className="space-y-5 flex-1">
        {mockActivities.map(activity => (
          <div key={activity.id} className="flex items-start gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              activity.type === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
              activity.type === 'IN_ROUTE' ? 'bg-blue-500/10 text-blue-500' :
              'bg-gray-500/10 text-gray-500'
            }`}>
              {activity.type === 'COMPLETED' && <CheckCircle2 size={16} />}
              {activity.type === 'IN_ROUTE' && <Route size={16} />}
              {activity.type === 'PENDING' && <Clock size={16} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary truncate">{activity.title}</p>
              <p className="text-xs text-text-secondary truncate mt-0.5">{activity.subtitle}</p>
            </div>
            <span className="text-xs text-text-secondary whitespace-nowrap pt-0.5">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
