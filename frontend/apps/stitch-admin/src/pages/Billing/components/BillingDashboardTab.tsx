import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export function BillingDashboardTab() {
  const revenue = 85400.00
  const expenses = 42100.00
  const profit = revenue - expenses
  const margin = (profit / revenue) * 100

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Visão Geral (DRE)</h2>
          <p className="text-sm text-text-secondary mt-1">Indicadores financeiros e margem de lucro.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-border">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
            <TrendingUp size={14} className="text-brand-500" /> Receitas
          </p>
          <p className="text-2xl font-bold text-text-primary">{formatCurrency(revenue)}</p>
        </div>
        
        <div className="glass-panel p-5 rounded-xl border border-border">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
            <TrendingDown size={14} className="text-destructive-500" /> Despesas
          </p>
          <p className="text-2xl font-bold text-text-primary">{formatCurrency(expenses)}</p>
        </div>
        
        <div className="glass-panel p-5 rounded-xl border border-border">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
            <DollarSign size={14} className="text-emerald-500" /> Resultado (EBITDA)
          </p>
          <p className="text-2xl font-bold text-emerald-500">{formatCurrency(profit)}</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-border flex flex-col justify-center">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Margem Bruta
          </p>
          <p className="text-2xl font-bold text-text-primary">{margin.toFixed(1)}%</p>
          <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${margin}%` }} />
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-border">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Evolução Mensal (Mock)</h3>
        <div className="h-48 flex items-end gap-2">
          {/* Simple mock chart */}
          {[40, 60, 50, 80, 70, 95].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end group">
              <div 
                className="bg-brand-500/80 hover:bg-brand-500 transition-colors rounded-t-md relative"
                style={{ height: `${val}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-[10px] px-2 py-1 rounded">
                  {formatCurrency(val * 1000)}
                </div>
              </div>
              <div className="text-[10px] text-text-secondary text-center mt-2">Mês {i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
