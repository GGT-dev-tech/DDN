import { useState } from 'react'
import {
  useListDestinationsApiV1FacilitiesDestinationsGet,
  useToggleDestinationApiV1FacilitiesDestinationsDestinationIdTogglePost,
} from '../../../shared/api/generated/facilities/facilities'
import type { DestinationResponse } from '../../../shared/api/generated/model'
import { DestinationType } from '../../../shared/api/generated/model'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/components/Table'
import { Badge } from '../../../shared/ui/components/Badge'
import { Button } from '../../../shared/ui/components/Button'
import { EmptyState } from '../../../shared/ui/components/EmptyState'
import { MapPin, Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { DestinationModal } from './DestinationModal'

export function DestinationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<DestinationResponse | null>(null)

  const { data: destinations, isLoading, refetch } = useListDestinationsApiV1FacilitiesDestinationsGet({ active_only: false })
  
  const { mutateAsync: toggleDestination } = useToggleDestinationApiV1FacilitiesDestinationsDestinationIdTogglePost()

  const handleToggle = async (destination: DestinationResponse) => {
    try {
      await toggleDestination({
        destinationId: destination.id,
        params: { activate: !destination.is_active }
      })
      toast.success(`Destino ${destination.is_active ? 'inativado' : 'ativado'} com sucesso!`)
      refetch()
    } catch (e) {
      toast.error('Erro ao alterar status do destino.')
    }
  }

  const handleEdit = (destination: DestinationResponse) => {
    setSelectedDestination(destination)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedDestination(null)
    setIsModalOpen(true)
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    refetch()
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Locais de Destinação</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os locais de destinação final para o transporte de resíduos (ex: Aterros, Usinas, Base da Empresa).
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Destino
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center p-8">Carregando...</div>
        ) : !destinations || destinations.length === 0 ? (
          <EmptyState
            icon={<MapPin className="h-10 w-10 text-muted-foreground" />}
            title="Nenhum destino encontrado"
            description="Você ainda não cadastrou nenhum local de destinação."
            action={
              <Button onClick={handleCreate}>Cadastrar Destino</Button>
            }
          />
        ) : (
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {destinations.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell className="font-medium">{destination.name}</TableCell>
                    <TableCell>
                      <Badge variant="default">{destination.type === DestinationType.DDN_BASE ? 'Base Própria' : 'Aterro/Parceiro'}</Badge>
                    </TableCell>
                    <TableCell>
                      {destination.address.city} / {destination.address.state}
                    </TableCell>
                    <TableCell>
                      {destination.is_active ? (
                        <Badge variant="success" className="bg-emerald-500/15 text-emerald-500">Ativo</Badge>
                      ) : (
                        <Badge variant="default" className="bg-slate-500/15 text-slate-500">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleToggle(destination)}
                          title={destination.is_active ? 'Inativar' : 'Ativar'}
                        >
                          {destination.is_active ? (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleEdit(destination)}
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DestinationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          destination={selectedDestination}
        />
      </div>
    </div>
  )
}
