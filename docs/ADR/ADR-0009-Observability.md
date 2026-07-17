# ADR 0009: Padrões de Observabilidade (Logs, Métricas e Traces)

## Contexto
Para garantir saúde sistêmica, auditoria e facilidade no debug de incidentes em produção, precisamos definir desde o dia zero a estratégia de observabilidade da plataforma.

## Decisão
Implementaremos um tripé estrito de observabilidade baseada em padrões abertos:
1. **Correlation, Request e Trace IDs**: Toda requisição gerará ou propagará um `Trace ID` único, repassado aos jobs assíncronos (Celery) e injetado em cada linha de log gerada por essa esteira de processamento.
2. **Logs Estruturados**: O output do logging será rigorosamente no formato JSON. Proibido logs textuais "flat". Contexto do log deve sempre incluir: `tenant_id`, `trace_id`, `user_id` e métricas de latência, se aplicável.
3. **Health Checks / Readiness / Liveness**: O API Gateway e cada serviço exporão `/health/live` (status rápido de uptime) e `/health/ready` (verificando conexões com Postgres, Redis, etc.) para uso do orquestrador (Railway/Kubernetes).

## Consequências
- Adoção provável do OpenTelemetry (OTel) para unificar a telemetria independente de qual vendor (Datadog, New Relic ou Elastic) formos utilizar.
- Redução massiva do tempo de resolução de bugs, visto que será possível rastrear toda a jornada de um evento pelo sistema.
