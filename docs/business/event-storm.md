# Event Storming (Cadeia de Valor)

Este documento mapeia o fluxo cronológico dos eventos de negócio no sistema. Ele serve como base arquitetural para a implementação do padrão CQRS e arquitetura orientada a eventos, garantindo que o ciclo de vida do cliente e das operações seja respeitado de acordo com os Bounded Contexts.

## Jornada Principal (Macrofuxo B2B)

A jornada do cliente traduz-se no seguinte fluxo central, transversal aos módulos:

```text
Public Portal (Marketing) 
  ↓
Lead Solicitado [LeadRequested]
  ↓
Commercial
  ↓
Lead Criado no Sistema [LeadRegistered]
  ↓
Match de Empresa (Verificação de Duplicidade)
  ↓
Empresa (Company) Criada / Reutilizada [CompanyCreated]
  ↓
Oportunidade (Opportunity) Aberta [OpportunityOpened]
  ↓
Transversal (Activities & Workflow)
  ↓
Timeline de Negociação [ActivityRegistered, WorkflowStateChanged]
  ↓
Quotations & Pricing
  ↓
Orçamento Elaborado (Snapshot de Pricing) [QuotationRequested]
  ↓
Orçamento Aprovado [QuotationApproved]
  ↓
Contracts
  ↓
Contrato (Contract) Fechado [ContractSigned]
  ↓
Plano de Serviço (ServicePlan) Vinculado [ServicePlanActivated]
  ↓
Scheduling
  ↓
Agendamento Criado [AppointmentScheduled]
  ↓
Routing
  ↓
Rota Planejada [RoutePlanned]
  ↓
Rota Iniciada [RouteStarted]
  ↓
Operations
  ↓
Coleta Executada em um Local (ServiceLocation) [CollectionExecuted]
  ↓
MTR/CDF Emitido [DocumentIssued]
  ↓
Billing
  ↓
Cobrança Emitida [InvoiceGenerated]
  ↓
Pagamento Confirmado [PaymentConfirmed]
```

## Efeitos Colaterais (Side Effects por Módulo)

1. **Public Portal**: Captura de formulários ou Landing Pages gera um evento genérico (`LeadRequested`), dissociado do CRM, para garantir que o Portal seja puramente focados em captação.
2. **Commercial Context**: Um `Lead` entra no topo de funil (`LeadRegistered`). Ao evoluir (`LeadQualified`), o módulo busca o *Match* para evitar duplicação. Se não existir, dispara-se `CompanyCreated`. A negociação inteira orbita ao redor da `Opportunity` (`OpportunityOpened`). Toda anotação vai para o contexto transversal de Timeline (Activities).
3. **Quotations & Pricing**: Durante a emissão de um Orçamento (`QuotationRequested`), o módulo consome o `Catalog` (serviços) e submete as regras pelo `Pricing` (precificação). É gerado um *Snapshot* de preço para garantir que alterações futuras não afetem propostas antigas.
4. **Contract & Operations**: O `Contract` nasce (`ContractSigned`) da Oportunidade ganha, habilitando o `ServicePlan` nos `ServiceLocations` cadastrados. A partir daí, a equipe operacional (Routing/Scheduling) passa a visualizar a demanda rotineira.
5. **Workflow State Manager**: Qualquer evolução significativa (ex: Lead avançou, Contrato assinado) é supervisionada por um orquestrador de `Workflow` global que valida transições.
