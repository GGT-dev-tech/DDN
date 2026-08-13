import uuid

from modules.core.infrastructure.uow import SQLAlchemyUnitOfWork as UnitOfWork
from modules.facilities.application.dto.destination_dto import (
    CreateDestinationRequest,
    DestinationResponse,
    UpdateDestinationRequest,
    AddressDTO
)
from modules.facilities.domain.entities.destination import Destination
from modules.facilities.domain.repositories.destination_repository import DestinationRepository
from modules.facilities.domain.value_objects import Address


class DestinationUseCases:
    def __init__(self, uow: UnitOfWork, destination_repository: DestinationRepository):
        self.uow = uow
        self.destination_repository = destination_repository

    def _to_response(self, destination: Destination) -> DestinationResponse:
        return DestinationResponse(
            id=destination.id,
            tenant_id=destination.tenant_id,
            name=destination.name,
            type=destination.type,
            address=AddressDTO(
                street=destination.address.street,
                number=destination.address.number,
                complement=destination.address.complement,
                neighborhood=destination.address.neighborhood,
                city=destination.address.city,
                state=destination.address.state,
                zip_code=destination.address.zip_code,
                latitude=destination.address.latitude,
                longitude=destination.address.longitude,
            ),
            is_active=destination.is_active,
            contact_name=destination.contact_name,
            contact_phone=destination.contact_phone
        )

    def create(self, tenant_id: uuid.UUID, request: CreateDestinationRequest) -> DestinationResponse:
        address = Address(
            street=request.address.street,
            number=request.address.number,
            complement=request.address.complement,
            neighborhood=request.address.neighborhood,
            city=request.address.city,
            state=request.address.state,
            zip_code=request.address.zip_code,
            latitude=request.address.latitude,
            longitude=request.address.longitude
        )
        
        destination = Destination(
            tenant_id=tenant_id,
            name=request.name,
            type=request.type,
            address=address,
            contact_name=request.contact_name,
            contact_phone=request.contact_phone
        )

        with self.uow:
            self.destination_repository.save(destination)
            self.uow.commit()

        return self._to_response(destination)

    def update(self, destination_id: uuid.UUID, tenant_id: uuid.UUID, request: UpdateDestinationRequest) -> DestinationResponse:
        with self.uow:
            destination = self.destination_repository.get_by_id(destination_id, tenant_id)
            if not destination:
                raise ValueError(f"Destination {destination_id} not found.")

            address = Address(
                street=request.address.street,
                number=request.address.number,
                complement=request.address.complement,
                neighborhood=request.address.neighborhood,
                city=request.address.city,
                state=request.address.state,
                zip_code=request.address.zip_code,
                latitude=request.address.latitude,
                longitude=request.address.longitude
            )
            
            destination.update(
                name=request.name,
                type=request.type,
                address=address,
                contact_name=request.contact_name,
                contact_phone=request.contact_phone
            )
            
            self.destination_repository.save(destination)
            self.uow.commit()
            
            return self._to_response(destination)

    def get(self, destination_id: uuid.UUID, tenant_id: uuid.UUID) -> DestinationResponse:
        with self.uow:
            destination = self.destination_repository.get_by_id(destination_id, tenant_id)
            if not destination:
                raise ValueError(f"Destination {destination_id} not found.")
            return self._to_response(destination)

    def list_all(self, tenant_id: uuid.UUID, active_only: bool = True) -> list[DestinationResponse]:
        with self.uow:
            destinations = self.destination_repository.list_by_tenant(tenant_id, active_only)
            return [self._to_response(d) for d in destinations]
    
    def toggle_active(self, destination_id: uuid.UUID, tenant_id: uuid.UUID, activate: bool) -> DestinationResponse:
        with self.uow:
            destination = self.destination_repository.get_by_id(destination_id, tenant_id)
            if not destination:
                raise ValueError(f"Destination {destination_id} not found.")
                
            if activate:
                destination.activate()
            else:
                destination.deactivate()
                
            self.destination_repository.save(destination)
            self.uow.commit()
            return self._to_response(destination)
