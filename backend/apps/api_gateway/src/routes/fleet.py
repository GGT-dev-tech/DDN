from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database.session import get_db_session as get_db
# Dummy context accessor for now to fix crash
def get_context_accessor():
    pass

from database.core.unit_of_work import SQLAlchemyUnitOfWork
from modules.fleet.infrastructure.repositories.sqlalchemy_fleet_repository import SQLAlchemyFleetRepository
from modules.fleet.application.dto import RegisterVehicleRequestDTO, VehicleResponseDTO, RegisterDriverRequestDTO, DriverResponseDTO
from modules.fleet.application.use_cases.register_vehicle import RegisterVehicleUseCase
from modules.fleet.application.use_cases.register_driver import RegisterDriverUseCase

router = APIRouter(prefix="/fleet", tags=["Fleet"])

@router.post("/vehicles", response_model=VehicleResponseDTO, status_code=status.HTTP_201_CREATED)
def register_vehicle(
    dto: RegisterVehicleRequestDTO,
    db: Session = Depends(get_db),
    context_accessor: dict = Depends(get_context_accessor)
):
    pass

@router.post("/drivers", response_model=DriverResponseDTO, status_code=status.HTTP_201_CREATED)
def register_driver(
    dto: RegisterDriverRequestDTO,
    db: Session = Depends(get_db),
    context_accessor: dict = Depends(get_context_accessor)
):
    pass
