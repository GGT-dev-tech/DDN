# Eventos de Domínio (Domain Events)

Lista oficial dos eventos gerados pelo sistema, que circulam pelo Broker (Outbox) para desencadear reações assíncronas. Todos herdam de `DomainEvent`.

## 1. Commercial Context

- **LeadRegistered**: Ocorre quando um Lead entra (via Admin ou Site).
- **LeadQualified**: Quando sofre qualificação.
- **LeadConverted**: Quando o Lead vira Cliente.
- **CompanyCreated**: Quando um Cliente é registrado de fato.
- **ServiceLocationAdded**: Quando um endereço é cadastrado (relevante para Routing re-calcular clusters).
- **OpportunityOpened**: Nova negociação no funil.
- **OpportunityWon**: Gatilho chave para o financeiro e para operações começarem a planejar as agendas.
- **OpportunityLost**: Encerramento sem conversão.

## 2. Regras de Schema
Os eventos de domínio são imutáveis (dataclasses `frozen=True`).
- `event_id`: ULID
- `aggregate_id`: ULID
- `occurred_on`: Timestamp UTC
- `payload`: Dicionário tipado contendo apenas o delta de informações. NUNCA carregar a Entidade inteira dentro do evento.
