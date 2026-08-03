import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Joyride, STATUS } from 'react-joyride'
import type { Step } from 'react-joyride'

interface TourContextType {
  startTour: () => void
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}

const TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: 'Aqui você tem uma visão geral da sua operação, indicadores principais de performance, coletas agendadas e resumo de vendas.',
    title: 'Visão Geral',
    placement: 'right',
  },
  {
    target: '[data-tour="clientes"]',
    content: 'Gerencie o CRM de toda a sua carteira, incluindo informações cadastrais, locais de coleta e faturamento de clientes e fornecedores.',
    title: 'Gestão de Clientes',
    placement: 'right',
  },
  {
    target: '[data-tour="cotações"]',
    content: 'Crie propostas comerciais personalizadas a partir do seu Catálogo e Tabela de Preços, com controle de status e aprovações.',
    title: 'Cotações Comerciais',
    placement: 'right',
  },
  {
    target: '[data-tour="contratos"]',
    content: 'Acompanhe os contratos vigentes gerados a partir de propostas comerciais. Gerencie reajustes e o ciclo de vida.',
    title: 'Ciclo de Contratos',
    placement: 'right',
  },
  {
    target: '[data-tour="planos-de-serviço"]',
    content: 'Configure as regras de agendamento (frequência, dias da semana, equipamentos) para automatizar a geração das Ordens de Serviço.',
    title: 'Planejamento de Coleta',
    placement: 'right',
  },
  {
    target: '[data-tour="ordens-de-serviço"]',
    content: 'Visualize todas as coletas e serviços pendentes ou concluídos. Todas as informações do que deve ser executado estão aqui.',
    title: 'Ordens de Serviço (O.S.)',
    placement: 'right',
  },
  {
    target: '[data-tour="planejador"]',
    content: 'Utilize o mapa interativo para otimizar suas rotas de coleta, distribuindo as Ordens de Serviço entre sua frota e motoristas disponíveis.',
    title: 'Planejador de Rotas',
    placement: 'right',
  },
  {
    target: '[data-tour="faturamento"]',
    content: 'Quando as coletas são finalizadas, as ordens passam para o fechamento financeiro, gerando relatórios consolidados por cliente.',
    title: 'Faturamento de Serviços',
    placement: 'right',
  }
]

export function TourProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(false)

  useEffect(() => {
    // Check if user has already seen the tour
    const hasSeenTour = localStorage.getItem('ddn_has_seen_tour')
    if (!hasSeenTour) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        setRun(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleJoyrideCallback = (data: any) => {
    const { status } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      setRun(false)
      localStorage.setItem('ddn_has_seen_tour', 'true')
    }
  }

  const startTour = () => {
    setRun(true)
  }

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
      <Joyride
        steps={TOUR_STEPS}
        run={run}
        continuous={true}
        onEvent={handleJoyrideCallback}
        locale={{
          back: 'Anterior',
          close: 'Fechar',
          last: 'Concluir',
          next: 'Próximo',
          skip: 'Pular Tour'
        }}
      />
    </TourContext.Provider>
  )
}
