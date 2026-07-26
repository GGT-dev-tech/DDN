"""
Tests for IntegrationEventFactory.

Cenários cobertos:
1. Com RequestContext presente → correlation_id deve ser o trace_id do request.
2. Com TenantContext presente → tenant_id deve ser resolvido do contexto.
3. Sem RequestContext (ex: worker assíncrono) → fallback para uuid4(), formato UUID válido.
4. causation_id e aggregate_version são propagados sem alteração.

Fluxo de rastreabilidade validado:
    HTTP Request (trace_id)
         ↓
    ContextVarsAccessor
         ↓
    IntegrationEventFactory.build_metadata()
         ↓
    EventMetadata.correlation_id == trace_id  ← assertion central
"""
import uuid
from datetime import UTC, datetime
from unittest.mock import MagicMock

import pytest

from modules.core.application.integration_event_factory import IntegrationEventFactory
from modules.core.context.accessor import ContextAccessor
from modules.core.context.models import RequestContext, TenantContext


def _make_request_context(trace_id: str) -> RequestContext:
    return RequestContext(
        request_id=uuid.uuid4(),
        trace_id=trace_id,
        ip="127.0.0.1",
        user_agent="test-agent",
        path="/test",
        method="POST",
        started_at=datetime.now(UTC),
    )


def _make_tenant_context(tenant_id: uuid.UUID) -> TenantContext:
    return TenantContext(tenant_id=tenant_id)


class TestIntegrationEventFactory:
    """
    Unit tests for IntegrationEventFactory.build_metadata().
    Uses a mock ContextAccessor to control what context is available.
    """

    def _make_factory(
        self,
        request_ctx: RequestContext | None = None,
        tenant_ctx: TenantContext | None = None,
    ) -> IntegrationEventFactory:
        accessor = MagicMock(spec=ContextAccessor)
        accessor.request.return_value = request_ctx
        accessor.tenant.return_value = tenant_ctx
        return IntegrationEventFactory(context=accessor)

    def test_correlation_id_maps_to_request_trace_id(self):
        """
        Core traceability invariant:
        When a RequestContext exists, correlation_id MUST equal the request trace_id.
        This guarantees that all Integration Events from the same HTTP request
        share the same correlation identifier.
        """
        trace_id = "test-trace-abc-123"
        factory = self._make_factory(request_ctx=_make_request_context(trace_id))

        metadata = factory.build_metadata()

        assert metadata.correlation_id == trace_id, (
            f"Expected correlation_id '{trace_id}', got '{metadata.correlation_id}'. "
            "The factory must propagate trace_id to preserve request traceability."
        )

    def test_tenant_id_resolved_from_tenant_context(self):
        """
        When no explicit tenant_id is passed, it must be resolved from TenantContext.
        """
        expected_tenant_id = uuid.uuid4()
        factory = self._make_factory(
            request_ctx=_make_request_context("trace-xyz"),
            tenant_ctx=_make_tenant_context(expected_tenant_id),
        )

        metadata = factory.build_metadata()

        assert metadata.tenant_id == expected_tenant_id

    def test_explicit_tenant_id_overrides_context(self):
        """
        An explicitly passed tenant_id must take precedence over TenantContext.
        This covers cases like event handlers processing events from other tenants.
        """
        context_tenant = uuid.uuid4()
        explicit_tenant = uuid.uuid4()

        factory = self._make_factory(
            request_ctx=_make_request_context("trace-override"),
            tenant_ctx=_make_tenant_context(context_tenant),
        )

        metadata = factory.build_metadata(tenant_id=explicit_tenant)

        assert metadata.tenant_id == explicit_tenant
        assert metadata.tenant_id != context_tenant

    def test_fallback_when_no_request_context(self):
        """
        When no RequestContext exists (background workers, CLI tasks),
        correlation_id must still be a valid non-empty UUID string.
        This ensures the Outbox can always persist events.
        """
        factory = self._make_factory(request_ctx=None, tenant_ctx=None)

        metadata = factory.build_metadata()

        # Must not raise, must be a valid UUID
        assert metadata.correlation_id, "correlation_id must not be empty"
        parsed = uuid.UUID(metadata.correlation_id)  # raises ValueError if invalid
        assert str(parsed)  # sanity

    def test_causation_id_is_propagated(self):
        """
        causation_id links an IntegrationEvent back to the Domain Event that caused it.
        It must be stored exactly as passed.
        """
        domain_event_id = str(uuid.uuid4())
        factory = self._make_factory(request_ctx=_make_request_context("trace-x"))

        metadata = factory.build_metadata(causation_id=domain_event_id)

        assert metadata.causation_id == domain_event_id

    def test_aggregate_version_is_propagated(self):
        """aggregate_version must reflect exactly what the caller passes."""
        factory = self._make_factory(request_ctx=_make_request_context("trace-x"))

        metadata = factory.build_metadata(aggregate_version=7)

        assert metadata.aggregate_version == 7

    def test_metadata_is_immutable(self):
        """EventMetadata is frozen=True — mutation must raise FrozenInstanceError."""
        factory = self._make_factory(request_ctx=_make_request_context("trace-x"))
        metadata = factory.build_metadata()

        with pytest.raises(Exception):  # dataclasses.FrozenInstanceError
            metadata.correlation_id = "tampered"  # type: ignore[misc]

    def test_event_id_is_unique_per_call(self):
        """Each call to build_metadata must produce a different event_id."""
        factory = self._make_factory(request_ctx=_make_request_context("same-trace"))

        m1 = factory.build_metadata()
        m2 = factory.build_metadata()

        assert m1.event_id != m2.event_id
