import type { ReactNode } from 'react'
import { Card } from './Card'

export interface MetricCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
}

export function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        {icon && <div className="text-brand-accent/80">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-text-primary">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.positive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {trend.positive ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
    </Card>
  )
}
