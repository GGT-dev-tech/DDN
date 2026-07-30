import type { HTMLAttributes } from 'react'
import { LayoutDashboard, Route, Truck, Users, Settings, FileText, Library, Building2, CircleDollarSign, CalendarDays, ListChecks, Map } from 'lucide-react'
import { cn } from '../../shared/ui/components/Button'

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {}

const GROUPED_NAVIGATION = [
  {
    category: 'Geral',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    ]
  },
  {
    category: 'CRM',
    items: [
      { name: 'Leads', icon: Users, href: '/admin/leads' },
      { name: 'Clientes', icon: Building2, href: '/admin/customers' },
    ]
  },
  {
    category: 'Comercial',
    items: [
      { name: 'Catálogo', icon: Library, href: '/admin/catalog' },
      { name: 'Tabelas de Preço', icon: CircleDollarSign, href: '/admin/pricing' },
      { name: 'Cotações', icon: FileText, href: '/admin/quotations' },
    ]
  },
  {
    category: 'Operação',
    items: [
      { name: 'Planos de Serviço', icon: CalendarDays, href: '/admin/service-plans' },
      { name: 'Requisitos', icon: ListChecks, href: '/admin/requirements' },
      { name: 'Planejador', icon: Map, href: '/admin/planner' },
      { name: 'Rotas', icon: Route, href: '/admin/routes' },
      { name: 'Frota', icon: Truck, href: '/admin/fleet' },
      { name: 'Motoristas', icon: Users, href: '/admin/drivers' },
    ]
  },
  {
    category: 'Administração',
    items: [
      { name: 'Configurações', icon: Settings, href: '/admin/settings' },
    ]
  }
]

export function Sidebar({ className, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        'w-64 h-screen border-r border-border glass-panel flex flex-col',
        className
      )}
      {...props}
    >
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          DDN
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {GROUPED_NAVIGATION.map((group) => (
          <div key={group.category} className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              {group.category}
            </h3>
            {group.items.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                <item.icon size={20} />
                {item.name}
              </a>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500 font-bold">
            G
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">Gustavo</span>
            <span className="text-xs text-text-secondary">Admin</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
