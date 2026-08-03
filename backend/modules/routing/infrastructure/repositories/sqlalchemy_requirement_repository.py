import uuid
from decimal import Decimal

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from modules.routing.domain.entities.collection_requirement import (
    CollectionRequirement,
)
from modules.routing.domain.exceptions import RoutingDomainException
from modules.routing.domain.value_objects import (
    Frequency,
    Location,
    Recurrence,
    RequirementStatus,
    Weekday,
)
from modules.routing.infrastructure.orm_models import CollectionRequirementModel


class OptimisticLockError(RoutingDomainException):
    pass


class SQLAlchemyRequirementRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_domain(self, model: CollectionRequirementModel) -> CollectionRequirement:
        req = CollectionRequirement(
            id=model.id,
            tenant_id=model.tenant_id,
            origin_reference=model.origin_reference,
            origin_item_id=model.origin_item_id,
            service_name=model.service_name,
            location=Location(
                latitude=model.latitude,
                longitude=model.longitude,
                address=model.address,
                reference=model.location_reference,
            ),
            quantity=Decimal(str(model.quantity)),
            unit_of_measure=model.unit_of_measure,
            recurrence=self._parse_recurrence(model.recurrence),
            status=model.status,
            version=model.version,
        )
        return req

    def _to_model(self, req: CollectionRequirement) -> CollectionRequirementModel:
        return CollectionRequirementModel(
            id=req.id,
            tenant_id=req.tenant_id,
            origin_reference=req.origin_reference,
            origin_item_id=req.origin_item_id,
            service_name=req.service_name,
            latitude=req.location.latitude,
            longitude=req.location.longitude,
            address=req.location.address,
            location_reference=req.location.reference,
            quantity=float(req.quantity),
            unit_of_measure=req.unit_of_measure,
            recurrence=self._serialize_recurrence(req.recurrence),
            status=req.status,
            version=req.version,
        )

    def _parse_recurrence(self, data: dict) -> Recurrence:
        from datetime import time
        start_time_str = data["start_time"]
        end_time_str = data["end_time"]
        st = time(int(start_time_str.split(":")[0]), int(start_time_str.split(":")[1]))
        et = time(int(end_time_str.split(":")[0]), int(end_time_str.split(":")[1]))

        return Recurrence(
            frequency=Frequency(data["frequency"]),
            interval=data["interval"],
            weekdays=[Weekday(w) for w in data["weekdays"]],
            start_time=st,
            end_time=et,
            timezone=data.get("timezone", "America/Sao_Paulo"),
        )

    def _serialize_recurrence(self, rec: Recurrence) -> dict:
        return {
            "frequency": rec.frequency.value,
            "interval": rec.interval,
            "weekdays": [w.value for w in rec.weekdays],
            "start_time": rec.start_time.strftime("%H:%M"),
            "end_time": rec.end_time.strftime("%H:%M"),
            "timezone": rec.timezone,
        }

    async def get_by_origin(self, tenant_id: uuid.UUID, origin_reference: str, origin_item_id: str) -> CollectionRequirement | None:
        stmt = select(CollectionRequirementModel).where(
            CollectionRequirementModel.tenant_id == tenant_id,
            CollectionRequirementModel.origin_reference == origin_reference,
            CollectionRequirementModel.origin_item_id == origin_item_id,
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return self._to_domain(model)

    async def save(self, req: CollectionRequirement) -> None:
        """
        Upsert strategy with optimistic locking.
        We don't use Postgres INSERT ON CONFLICT because we want optimistic locking
        on the version to be enforced in python layer to raise OptimisticLockError.
        """
        existing = await self.session.get(CollectionRequirementModel, req.id)
        if existing is None:
            model = self._to_model(req)
            self.session.add(model)
            req._original_version = req.version
            return

        stmt = (
            update(CollectionRequirementModel)
            .where(
                CollectionRequirementModel.id == req.id,
                CollectionRequirementModel.version == req._original_version,
            )
            .values(
                service_name=req.service_name,
                latitude=req.location.latitude,
                longitude=req.location.longitude,
                address=req.location.address,
                location_reference=req.location.reference,
                quantity=float(req.quantity),
                unit_of_measure=req.unit_of_measure,
                recurrence=self._serialize_recurrence(req.recurrence),
                status=req.status,
                version=req.version,
            )
            .execution_options(synchronize_session=False)
        )
        exec_result = await self.session.execute(stmt)

        if exec_result.rowcount == 0:
            raise OptimisticLockError(
                f"CollectionRequirement {req.id} was modified concurrently. "
                f"Refresh and retry."
            )
        
        req._original_version = req.version

    async def list_active_requirements(self, tenant_id: uuid.UUID) -> list[CollectionRequirement]:
        stmt = select(CollectionRequirementModel).where(
            CollectionRequirementModel.tenant_id == tenant_id,
            CollectionRequirementModel.status == RequirementStatus.ACTIVE
        )
        result = await self.session.execute(stmt)
        return [self._to_domain(r) for r in result.scalars().all()]
