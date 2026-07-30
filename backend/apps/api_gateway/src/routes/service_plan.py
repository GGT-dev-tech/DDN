"""
Service Plan API Routes.

Endpoints:
    GET    /service-plans/{plan_id}
    GET    /service-plans/contract/{contract_id}
    PATCH  /service-plans/{plan_id}                ← batch schedule update (DRAFT only)
    POST   /service-plans/{plan_id}/publish
    POST   /service-plans/{plan_id}/suspend
    POST   /service-plans/{plan_id}/reactivate
"""
import uuid
from typing import Any
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from modules.identity.dependencies import require_tenant

from database.session import get_db_session
from modules.core.application.integration_event_factory import IntegrationEventFactory
from modules.core.context.accessor import ContextAccessor
from modules.service_plan.application.services.service_plan_service import (
    ServicePlanService,
)
from modules.service_plan.domain.exceptions import (
    OptimisticLockError,
    ScheduleEditNotAllowedError,
    ServicePlanHasNoReadySchedulesError,
    ServicePlanNotFoundError,
)
from modules.service_plan.infrastructure.repositories.service_plan_repository import (
    SQLAlchemyServicePlanRepository,
)
from shared_kernel.outbox.repository import OutboxRepository

router = APIRouter(prefix="/service-plans", tags=["Service Plans"])


def get_service_plan_service(
    session: AsyncSession = Depends(get_db_session),
) -> ServicePlanService:
    repo = SQLAlchemyServicePlanRepository(session)
    outbox = OutboxRepository(session)
    event_factory = IntegrationEventFactory(context=ContextAccessor())
    return ServicePlanService(session, repo, outbox, event_factory)


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class CollectionPointRequest(BaseModel):
    address: str
    latitude: float | None = None
    longitude: float | None = None
    reference: str | None = None

class CreateServicePlanRequest(BaseModel):
    contract_id: uuid.UUID
    company_id: uuid.UUID
    effective_date: date
    expiration_date: date | None = None
    items: list[dict[str, Any]] = []


class RecurrenceRequest(BaseModel):
    frequency: str                  # RecurrenceFrequency value
    interval: int = 1
    weekdays: list[int] = []        # Weekday int values (0=Mon..6=Sun)
    start_time: str                 # "HH:MM"
    end_time: str                   # "HH:MM"
    timezone: str = "America/Sao_Paulo"


class ScheduleUpdateRequest(BaseModel):
    id: uuid.UUID
    collection_point: CollectionPointRequest | None = None
    recurrence: RecurrenceRequest | None = None
    notes: str | None = None


class UpdateSchedulesRequest(BaseModel):
    schedules: list[ScheduleUpdateRequest]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _schedule_to_payload(req: ScheduleUpdateRequest) -> dict:
    payload: dict = {"id": str(req.id)}
    if req.collection_point is not None:
        payload["collection_point"] = req.collection_point.model_dump()
    if req.recurrence is not None:
        payload["recurrence"] = req.recurrence.model_dump()
    if req.notes is not None:
        payload["notes"] = req.notes
    return payload


def _plan_response(plan: Any) -> dict:
    return {
        "id": str(plan.id),
        "version": plan.version,
        "status": plan.status.value,
        "tenant_id": str(plan.tenant_id),
        "company_id": str(plan.company_id),
        "contract_id": str(plan.contract_reference.contract_id),
        "effective_date": plan.effective_date.isoformat(),
        "expiration_date": (
            plan.expiration_date.isoformat() if plan.expiration_date else None
        ),
        "published_at": (
            plan.published_at.isoformat() if plan.published_at else None
        ),
        "schedules": [s.to_dict() for s in plan.schedules],
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get("/{plan_id}", response_model=dict)
async def get_plan(
    plan_id: uuid.UUID,
    service: ServicePlanService = Depends(get_service_plan_service),
) -> dict:
    try:
        plan = await service.get_plan_by_id(plan_id)
        return _plan_response(plan)
    except ServicePlanNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("", response_model=dict)
async def create_plan(
    req: CreateServicePlanRequest,
    tenant_id: uuid.UUID = Depends(require_tenant),
    service: ServicePlanService = Depends(get_service_plan_service),
) -> dict:
    plan_id = await service.create_from_contract(
        contract_id=req.contract_id,
        company_id=req.company_id,
        tenant_id=tenant_id,
        effective_date=req.effective_date,
        expiration_date=req.expiration_date,
        items=req.items
    )
    plan = await service.get_plan_by_id(plan_id)
    return _plan_response(plan)

@router.get("", response_model=list)
async def list_all_plans(
    tenant_id: uuid.UUID = Depends(require_tenant),
    service: ServicePlanService = Depends(get_service_plan_service),
) -> list:
    plans = await service.list_all(tenant_id)
    return [_plan_response(p) for p in plans]


@router.get("/contract/{contract_id}", response_model=list)
async def list_plans_by_contract(
    contract_id: uuid.UUID,
    tenant_id: uuid.UUID,
    service: ServicePlanService = Depends(get_service_plan_service),
) -> list:
    plans = await service.list_plans_by_contract(contract_id, tenant_id)
    return [_plan_response(p) for p in plans]


@router.patch("/{plan_id}", response_model=dict)
async def update_schedules(
    plan_id: uuid.UUID,
    body: UpdateSchedulesRequest,
    service: ServicePlanService = Depends(get_service_plan_service),
) -> dict:
    """
    Batch update of schedule details (CollectionPoint + Recurrence).
    Only allowed while the plan is in DRAFT status.
    All schedules are applied in a single transactional operation.
    """
    try:
        payload = [_schedule_to_payload(s) for s in body.schedules]
        await service.update_schedules(plan_id, payload)
        plan = await service.get_plan_by_id(plan_id)
        return _plan_response(plan)
    except ServicePlanNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ScheduleEditNotAllowedError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except OptimisticLockError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/{plan_id}/publish", response_model=dict)
async def publish_plan(
    plan_id: uuid.UUID,
    service: ServicePlanService = Depends(get_service_plan_service),
) -> dict:
    try:
        await service.publish(plan_id)
        plan = await service.get_plan_by_id(plan_id)
        return _plan_response(plan)
    except ServicePlanNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ServicePlanHasNoReadySchedulesError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except OptimisticLockError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/{plan_id}/suspend", response_model=dict)
async def suspend_plan(
    plan_id: uuid.UUID,
    service: ServicePlanService = Depends(get_service_plan_service),
) -> dict:
    try:
        await service.suspend(plan_id)
        plan = await service.get_plan_by_id(plan_id)
        return _plan_response(plan)
    except ServicePlanNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except OptimisticLockError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/{plan_id}/reactivate", response_model=dict)
async def reactivate_plan(
    plan_id: uuid.UUID,
    service: ServicePlanService = Depends(get_service_plan_service),
) -> dict:
    try:
        await service.reactivate(plan_id)
        plan = await service.get_plan_by_id(plan_id)
        return _plan_response(plan)
    except ServicePlanNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except OptimisticLockError as e:
        raise HTTPException(status_code=409, detail=str(e))
