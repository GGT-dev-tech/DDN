import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from modules.facilities.domain.entities.destination import Destination
from modules.facilities.domain.repositories.destination_repository import DestinationRepository
from modules.facilities.domain.value_objects import Address, DestinationType
from modules.facilities.infrastructure.orm_models import DestinationModel


class SQLDestinationRepository(DestinationRepository):
    def __init__(self, session: Session):
        self.session = session

    def _to_domain(self, model: DestinationModel) -> Destination:
        address = Address(
            street=model.address_street,
            number=model.address_number,
            complement=model.address_complement,
            neighborhood=model.address_neighborhood,
            city=model.address_city,
            state=model.address_state,
            zip_code=model.address_zip_code,
            latitude=float(model.address_latitude) if model.address_latitude else None,
            longitude=float(model.address_longitude) if model.address_longitude else None,
        )
        return Destination(
            id=model.id,
            tenant_id=model.tenant_id,
            name=model.name,
            type=model.type,
            address=address,
            is_active=model.is_active,
            contact_name=model.contact_name,
            contact_phone=model.contact_phone,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_orm(self, destination: Destination) -> DestinationModel:
        return DestinationModel(
            id=destination.id,
            tenant_id=destination.tenant_id,
            name=destination.name,
            type=destination.type,
            address_street=destination.address.street,
            address_number=destination.address.number,
            address_complement=destination.address.complement,
            address_neighborhood=destination.address.neighborhood,
            address_city=destination.address.city,
            address_state=destination.address.state,
            address_zip_code=destination.address.zip_code,
            address_latitude=str(destination.address.latitude) if destination.address.latitude is not None else None,
            address_longitude=str(destination.address.longitude) if destination.address.longitude is not None else None,
            is_active=destination.is_active,
            contact_name=destination.contact_name,
            contact_phone=destination.contact_phone,
            created_at=destination.created_at,
            updated_at=destination.updated_at,
        )

    def save(self, destination: Destination) -> None:
        model = self.session.get(DestinationModel, destination.id)
        if not model:
            model = self._to_orm(destination)
            self.session.add(model)
        else:
            updated_model = self._to_orm(destination)
            for key, value in vars(updated_model).items():
                if not key.startswith('_'):
                    setattr(model, key, value)
        
        self.session.flush()

    def get_by_id(self, destination_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[Destination]:
        stmt = select(DestinationModel).where(
            DestinationModel.id == destination_id,
            DestinationModel.tenant_id == tenant_id
        )
        result = self.session.execute(stmt).scalar_one_or_none()
        if result:
            return self._to_domain(result)
        return None

    def list_by_tenant(self, tenant_id: uuid.UUID, active_only: bool = True) -> list[Destination]:
        stmt = select(DestinationModel).where(DestinationModel.tenant_id == tenant_id)
        if active_only:
            stmt = stmt.where(DestinationModel.is_active == True)
        
        stmt = stmt.order_by(DestinationModel.name)
        results = self.session.execute(stmt).scalars().all()
        return [self._to_domain(r) for r in results]
