from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from apps.api_gateway.src.dependencies import get_db, get_context_accessor
from modules.core.context import ContextAccessor
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
    context_accessor: ContextAccessor = Depends(get_context_accessor)
):
    uow = SQLAlchemyUnitOfWork(db)
    repository = SQLAlchemyFleetRepository(db)
    use_case = RegisterVehicleUseCase(uow, repository, context_accessor)
    return use_case.execute(dto)

@router.post("/drivers", response_model=DriverResponseDTO, status_code=status.HTTP_201_CREATED)
def register_driver(
    dto: RegisterDriverRequestDTO,
    db: Session = Depends(get_db),
    context_accessor: ContextAccessor = Depends(get_context_accessor)
):
    uow = SQLAlchemyUnitOfWork(db)
    repository = SQLAlchemyFleetRepository(db)
    use_case = RegisterDriverUseCase(uow, repository, context_accessor)
    return use_case.execute(dto)
