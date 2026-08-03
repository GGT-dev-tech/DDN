"""
IntegrationEventFactory
-----------------------
Fábrica centralizada de EventMetadata para Integration Events.

Responsabilidade: resolver trace_id, tenant_id e request context a partir
do ContextVarsAccessor (propagado automaticamente por request via contextvars),
eliminando a necessidade de os handlers criarem metadados arbitrariamente.

Uso:
    factory = IntegrationEventFactory(context_accessor)
    metadata = factory.build_metadata(causation_id=str(domain_event_id))
    event = MyIntegrationEvent(metadata=metadata, ...)
"""
from datetime import UTC, datetime
from uuid import UUID

from modules.core.context.accessor import ContextAccessor
from modules.core.domain.id_generator import IdGenerator
from shared_kernel.events.integration import EventMetadata


class IntegrationEventFactory:
    """
    Fábrica de EventMetadata para Integration Events.

    Resolve correlação e contexto de request a partir do ContextVarsAccessor,
    garantindo rastreabilidade consistente sem que os handlers precisem
    instanciar metadados manualmente.
    """

    def __init__(self, context: ContextAccessor) -> None:
        self._context = context

    def build_metadata(
        self,
        *,
        tenant_id: UUID | None = None,
        causation_id: str | None = None,
        aggregate_version: int = 1,
        event_schema_version: int = 1,
    ) -> EventMetadata:
        """
        Constrói um EventMetadata resolvendo automaticamente:
        - correlation_id: trace_id do request atual (via contextvars)
        - tenant_id: do TenantContext atual, sobrescrito pelo argumento se fornecido
        - causation_id: ID do Domain Event que causou este Integration Event

        Args:
            tenant_id: sobrescreve o tenant_id do contexto, se necessário.
            causation_id: ID do Domain Event que causou este Integration Event
                          (garante a cadeia de causalidade para rastreabilidade).
            aggregate_version: versão do Aggregate que emitiu o evento.
            event_schema_version: versão do schema do evento (para versionamento de contrato).
        """
        req_ctx = self._context.request()
        tenant_ctx = self._context.tenant()

        resolved_tenant_id = tenant_id or (
            tenant_ctx.tenant_id if tenant_ctx else None
        )

        # correlation_id mapeia 1:1 com o trace_id do request,
        # garantindo que toda a cadeia de eventos de uma request compartilha o mesmo ID.
        correlation_id = req_ctx.trace_id if req_ctx else str(IdGenerator.generate())

        return EventMetadata(
            event_id=IdGenerator.generate(),
            tenant_id=resolved_tenant_id,
            correlation_id=correlation_id,
            causation_id=causation_id,
            occurred_at=datetime.now(UTC),
            event_schema_version=event_schema_version,
            aggregate_version=aggregate_version,
        )
