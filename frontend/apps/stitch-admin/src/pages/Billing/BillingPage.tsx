import { Calculator } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/components/Tabs'
import { BillingInvoicesTab } from './components/BillingInvoicesTab'
import { BillingExpensesTab } from './components/BillingExpensesTab'
import { BillingDashboardTab } from './components/BillingDashboardTab'

export function BillingPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500 shrink-0">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Financeiro</h1>
            <p className="text-sm text-text-secondary mt-1">
              Administração de Receitas, Despesas e Emissão de Notas.
            </p>
          </div>
        </div>

        <Tabs defaultValue="faturamento">
          <TabsList className="mb-8 w-full max-w-md justify-start bg-transparent p-0 gap-2">
            <TabsTrigger 
              value="faturamento" 
              className="data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:data-[state=active]:bg-brand-500 dark:data-[state=active]:text-white bg-black/5 dark:bg-white/5"
            >
              Faturamento (NF)
            </TabsTrigger>
            <TabsTrigger 
              value="despesas"
              className="data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:data-[state=active]:bg-brand-500 dark:data-[state=active]:text-white bg-black/5 dark:bg-white/5"
            >
              Despesas & Custos
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:data-[state=active]:bg-brand-500 dark:data-[state=active]:text-white bg-black/5 dark:bg-white/5"
            >
              Dashboard (DRE)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faturamento">
            <BillingInvoicesTab />
          </TabsContent>

          <TabsContent value="despesas">
            <BillingExpensesTab />
          </TabsContent>

          <TabsContent value="dashboard">
            <BillingDashboardTab />
          </TabsContent>
        </Tabs>
        
      </div>
    </div>
  )
}
