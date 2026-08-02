import uuid
from datetime import date
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.logistics.domain.entities.service_order import ServiceOrder, ServiceOrderItem
from modules.logistics.domain.repositories.service_order_repository import ServiceOrderRepository
from modules.logistics.infrastructure.orm_models import ORMServiceOrder, ORMServiceOrderItem


class SqlServiceOrderRepository(ServiceOrderRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_entity(self, orm: ORMServiceOrder) -> ServiceOrder:
        items = [
            ServiceOrderItem(
                id=item.id,
                service_offering_id=item.service_offering_id,
                quantity=item.quantity,
                service_name=item.service_name,
            )
            for item in orm.items
        ]
        
        return ServiceOrder(
            id=orm.id,
            tenant_id=orm.tenant_id,
            service_plan_id=orm.service_plan_id,
            company_id=orm.company_id,
            scheduled_date=orm.scheduled_date,
            status=orm.status,
            items=items,
            workflow_type=orm.workflow_type,
            vehicle_id=orm.vehicle_id,
            driver_id=orm.driver_id,
            route_id=orm.route_id,
            destination_id=orm.destination_id,
            completed_at=orm.completed_at,
            created_at=orm.created_at,
            updated_at=orm.updated_at,
        )

    def _to_orm(self, entity: ServiceOrder) -> ORMServiceOrder:
        orm_items = [
            ORMServiceOrderItem(
                id=item.id,
                service_order_id=entity.id,
                service_offering_id=item.service_offering_id,
                quantity=item.quantity,
                service_name=item.service_name,
            )
            for item in entity.items
        ]
        
        return ORMServiceOrder(
            id=entity.id,
            tenant_id=entity.tenant_id,
            service_plan_id=entity.service_plan_id,
            company_id=entity.company_id,
            scheduled_date=entity.scheduled_date,
            status=entity.status,
            workflow_type=entity.workflow_type,
            vehicle_id=entity.vehicle_id,
            driver_id=entity.driver_id,
            route_id=entity.route_id,
            destination_id=entity.destination_id,
            completed_at=entity.completed_at,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            items=orm_items,
        )

    async def save(self, order: ServiceOrder) -> None:
        orm_model = self._to_orm(order)
        await self.session.merge(orm_model)

    async def get_by_id(self, id: uuid.UUID) -> ServiceOrder | None:
        stmt = (
            select(ORMServiceOrder)
            .where(ORMServiceOrder.id == id)
            .options(selectinload(ORMServiceOrder.items))
        )
        result = await self.session.execute(stmt)
        orm = result.scalar_one_or_none()
        
        if not orm:
            return None
            
        return self._to_entity(orm)

    async def get_by_tenant_and_date(
        self, tenant_id: uuid.UUID, scheduled_date: date
    ) -> Sequence[ServiceOrder]:
        stmt = (
            select(ORMServiceOrder)
            .where(
                ORMServiceOrder.tenant_id == tenant_id,
                ORMServiceOrder.scheduled_date == scheduled_date
            )
            .options(selectinload(ORMServiceOrder.items))
        )
        result = await self.session.execute(stmt)
        orms = result.scalars().all()
        
        return [self._to_entity(orm) for orm in orms]
