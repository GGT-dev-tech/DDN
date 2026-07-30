import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../../../shared/ui/components/Modal'
import { Input } from '../../../../shared/ui/components/Input'
import { Button } from '../../../../shared/ui/components/Button'
import { useCreatePlanApiV1ServicePlansPost, getListAllPlansApiV1ServicePlansGetQueryKey } from '../../../../shared/api/generated/service-plans/service-plans'
import { useListCompaniesApiV1CommercialCompaniesGet } from '../../../../shared/api/generated/commercial/commercial'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

interface AddServicePlanModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddServicePlanModal({ isOpen, onClose }: AddServicePlanModalProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: createPlan, isPending } = useCreatePlanApiV1ServicePlansPost()
  const { data: companies = [], isLoading: isLoadingCompanies } = useListCompaniesApiV1CommercialCompaniesGet()

  const [companyId, setCompanyId] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId || !effectiveDate) return

    try {
      // Create a dummy contract_id since it's a manual plan
      const dummyContractId = uuidv4()
      
      await createPlan({
        data: {
          contract_id: dummyContractId,
          company_id: companyId,
          effective_date: effectiveDate,
          items: []
        }
      })
      
      queryClient.invalidateQueries({ queryKey: getListAllPlansApiV1ServicePlansGetQueryKey() })
      toast.success('Plano de serviço criado com sucesso!')
      onClose()
      
      // Reset form
      setCompanyId('')
      setEffectiveDate('')
    } catch (error) {
      console.error('Falha ao criar plano de serviço:', error)
      toast.error('Ocorreu um erro ao criar o plano.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Plano de Serviço Manual">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-zinc-400">
          Planos manuais gerarão um contrato fictício para vincular as regras de coleta ao cliente selecionado.
        </p>

        <div className="space-y-2">
          <label htmlFor="companyId" className="text-sm font-medium">Cliente</label>
          <select
            id="companyId"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              {isLoadingCompanies ? 'Carregando clientes...' : 'Selecione um cliente'}
            </option>
            {companies.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.corporate_name} ({c.document_number})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="effectiveDate" className="text-sm font-medium">Data de Início (Efetivação)</label>
          <Input 
            id="effectiveDate"
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || !companyId || !effectiveDate}>
            {isPending ? 'Criando...' : 'Criar Plano'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
