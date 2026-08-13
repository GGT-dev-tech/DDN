import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MoreVertical } from 'lucide-react'

// MOCK DATA: Until we implement GET /api/v1/dashboard/chart/destination-evolution
const mockData = [
  { name: 'JAN', reciclavel: 120, organico: 80, rejeito: 30 },
  { name: 'FEV', reciclavel: 135, organico: 75, rejeito: 35 },
  { name: 'MAR', reciclavel: 150, organico: 105, rejeito: 25 },
  { name: 'ABR', reciclavel: 180, organico: 90, rejeito: 45 },
  { name: 'MAI', reciclavel: 165, organico: 120, rejeito: 30 },
  { name: 'JUN', reciclavel: 210, organico: 60, rejeito: 15 },
]

export function DashboardChart() {
  return (
    <div className="bg-surface-white dark:bg-black/5 rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-border/50 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-text-primary">Evolução Mensal da Destinação</h3>
        <button className="text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mockData}
            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/30" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-text-secondary font-mono"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => `${value}t`}
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-text-secondary font-mono"
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend 
              iconType="square" 
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
            />
            <Bar dataKey="reciclavel" name="RECICLÁVEL" stackId="a" fill="#1C8200" radius={[0, 0, 0, 0]} />
            <Bar dataKey="organico" name="ORGÂNICO" stackId="a" fill="#006059" radius={[0, 0, 0, 0]} />
            <Bar dataKey="rejeito" name="REJEITO" stackId="a" fill="#bbc8d0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
