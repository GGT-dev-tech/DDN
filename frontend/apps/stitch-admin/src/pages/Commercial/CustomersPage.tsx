import { useNavigate } from 'react-router-dom'
import { Badge } from '../../shared/ui/components/Badge'
import { Button } from '../../shared/ui/components/Button'
import { EmptyState } from '../../shared/ui/components/EmptyState'
import { Building2, Plus, ArrowRight } from 'lucide-react'

import { useListCompaniesApiV1CommercialCompaniesGet } from '../../shared/api/generated/commercial/commercial'

export function CustomersPage() {
  const navigate = useNavigate()
  
  const { data: companies = [], isLoading } = useListCompaniesApiV1CommercialCompaniesGet()

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Carteira de Clientes</h1>
              <p className="text-sm text-text-secondary mt-1">
                Diretório de empresas e clientes ativos na operação.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="liquid" onClick={() => navigate('/admin/leads')} className="gap-2">
              <Plus size={18} /> Novo Cliente via Lead
            </Button>
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary font-semibold">
              <Building2 size={18} className="text-brand-500" />
              Diretório de Contas
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-text-secondary">Carregando clientes...</div>
            ) : companies.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Razão Social / Nome Fantasia</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Documento (CNPJ/CPF)</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {companies.map((company: any) => (
                    <tr key={company.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-text-primary">{company.corporate_name}</div>
                        <div className="text-sm text-text-secondary">{company.trade_name}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-mono text-text-secondary">{company.document_number}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={company.status === 'CUSTOMER' ? 'default' : 'outline'} className={company.status === 'CUSTOMER' ? 'bg-brand-500/20 text-brand-500' : 'variant-glass'}>
                          {company.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => navigate(`/admin/customers/${company.id}`)} className="text-xs h-8 gap-2">
                          Detalhes <ArrowRight size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="Sua carteira está vazia"
                  description="Você ainda não possui contas ativas. Converta um Lead em Cliente para começar a operar."
                  action={
                    <Button onClick={() => navigate('/admin/leads')} className="gap-2 mt-4">
                      <ArrowRight size={16} /> Ir para Leads
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
