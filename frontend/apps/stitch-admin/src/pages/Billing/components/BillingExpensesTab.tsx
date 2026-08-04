import { Truck, MapPin, Receipt, Plus } from 'lucide-react'
import { Button } from '../../../../shared/ui/components/Button'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export function BillingExpensesTab() {
  const expenses = [
    { id: 1, type: 'Combustível', provider: 'Posto Alpha', amount: 1250.00, date: 'Hoje', icon: <Truck size={16} /> },
    { id: 2, type: 'Taxa de Destinação', provider: 'Aterro Central', amount: 3400.00, date: 'Ontem', icon: <MapPin size={16} /> },
    { id: 3, type: 'Manutenção', provider: 'Oficina São João', amount: 890.00, date: '12 Ago', icon: <Receipt size={16} /> },
  ]

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Contas a Pagar & Despesas</h2>
          <p className="text-sm text-text-secondary mt-1">Gestão de custos logísticos, destinação e operacionais.</p>
        </div>
        <Button variant="liquid" className="gap-2">
          <Plus size={16} /> 
          Nova Despesa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-destructive-500/20 bg-destructive-500/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Custo Total (Mês)</p>
            <p className="text-2xl font-bold text-destructive-500">{formatCurrency(totalExpense + 12000)}</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Custo com Destinação</p>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(3400)}</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Custos de Frota</p>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(2140)}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
            <Receipt size={16} className="text-text-secondary" />
            Lançamentos Recentes
          </div>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-border">
              <tr>
                <th className="p-3 font-medium text-text-secondary">Tipo</th>
                <th className="p-3 font-medium text-text-secondary">Fornecedor</th>
                <th className="p-3 font-medium text-text-secondary">Data</th>
                <th className="p-3 font-medium text-text-secondary text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-text-primary">
                      <div className="w-6 h-6 rounded-md bg-black/10 dark:bg-white/10 flex items-center justify-center text-text-secondary">
                        {expense.icon}
                      </div>
                      {expense.type}
                    </div>
                  </td>
                  <td className="p-3 text-text-primary">{expense.provider}</td>
                  <td className="p-3 text-text-secondary">{expense.date}</td>
                  <td className="p-3 text-right font-mono font-medium text-text-primary">{formatCurrency(expense.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
