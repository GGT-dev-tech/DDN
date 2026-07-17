# ADR 0010: Contratos de Barramento de Eventos (Event Bus)

## Contexto
Com a adoção do Celery/Redis e Eventos de Domínio, os módulos assíncronos vão trocar mensagens. A falta de governança estrutural em filas pode levar a falhas catastróficas, envenenamento de fila e dessincronização de dados.

## Decisão
O `EventBus` (`modules/core/events`) será padronizado seguindo as seguintes regras:
1. **Esquema Rígido de Payload**: Todo evento possuirá nome (`RouteCalculated`), versão (v1), payload fortemente tipado via schema (Pydantic), e metadados (`timestamp`, `trace_id`).
2. **Idempotência**: Todos os handlers que consomem eventos DEVEM ser idempotentes. Processar o mesmo evento duas vezes (o que pode ocorrer em falhas de ACK) nunca deve corromper o estado do banco.
3. **Mecanismo de Retries e DLQ**: Processamentos falhos serão escalonados utilizando Exponential Backoff. Após a cota máxima de retries, as mensagens devem obrigatoriamente parar em uma Dead-Letter Queue (DLQ) com alertas disparados.

## Consequências
- A integração entre `Pricing`, `Logistics` e `Notification` será extremamente previsível e resiliente, suportando altos picos sem perda silenciosa de eventos.
