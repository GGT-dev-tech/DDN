# Máquinas de Estado (State Machines)

Este documento centraliza todos os status de Aggregates chave do sistema. O módulo de Workflow (quando construído) fará o enforce dessas transições.

## 1. Commercial Context

### 1.1 LeadStatus
Define a jornada do prospect.
- **NEW:** Lead recém criado, ainda não contatado.
- **CONTACTED:** Primeira interação realizada (Activity registrada).
- **QUALIFIED:** Lead validado como potencial cliente (BANT aprovado).
- **LOST:** Lead desqualificado.
- **CONVERTED:** Transformado em Company + Opportunity.

**Transições Válidas:**
`NEW` -> `CONTACTED` | `QUALIFIED` | `LOST`
`CONTACTED` -> `QUALIFIED` | `LOST`
`QUALIFIED` -> `CONVERTED` | `LOST`

### 1.2 OpportunityStage
Funil de vendas.
- **DISCOVERY:** Levantamento de escopo técnico.
- **PROPOSAL:** Construindo ou enviando Orçamento (Quotation).
- **NEGOTIATION:** Em negociação ativa de valores.
- **CLOSED_WON:** Contrato assinado.
- **CLOSED_LOST:** Negociação perdida.

### 1.3 CompanyStatus
- **PROSPECT:** Ainda não possui contrato assinado (veio do Lead).
- **CUSTOMER:** Possui contratos ativos vigentes.
- **INACTIVE:** Todos os contratos encerraram e não houve renovação.
- **BLOCKED:** Restrição de crédito/compliance. Não pode receber serviços.

## 2. Operations Context (Futuro)

### 2.1 ServiceOrderStatus
- **SCHEDULED:** Despachado, aguardando execução.
- **IN_PROGRESS:** Motorista no local de coleta.
- **COMPLETED:** Coleta concluída com sucesso (peso e assinatura).
- **FAILED:** Tentativa frustrada (ex: cliente fechado).
- **CANCELED:** Cancelado pelo backoffice.
