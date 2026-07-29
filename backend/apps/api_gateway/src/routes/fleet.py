from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.session import get_db_session as get_db


from database.core.unit_of_work import SQLAlchemyUnitOfWork
from modules.core.context import accessor as context_accessor_instance
from modules.fleet.application.dto import (
    DriverResponseDTO,
    RegisterDriverRequestDTO,
    RegisterVehicleRequestDTO,
    VehicleResponseDTO,
)

# Real context accessor
def get_context_accessor():
    return context_accessor_instance

router = APIRouter(prefix="/fleet", tags=["Fleet"])

from modules.fleet.application.use_cases.register_vehicle import RegisterVehicleUseCase
from modules.fleet.application.use_cases.register_driver import RegisterDriverUseCase

@router.post("/vehicles", response_model=VehicleResponseDTO, status_code=status.HTTP_201_CREATED)
def register_vehicle(
    dto: RegisterVehicleRequestDTO,
    db: Session = Depends(get_db)
):
    repo = SQLAlchemyFleetRepository(db)
    uow = SQLAlchemyUnitOfWork(db)
    use_case = RegisterVehicleUseCase(uow, repo, get_context_accessor())
    return use_case.execute(dto)

@router.post("/drivers", response_model=DriverResponseDTO, status_code=status.HTTP_201_CREATED)
def register_driver(
    dto: RegisterDriverRequestDTO,
    db: Session = Depends(get_db)
):
    repo = SQLAlchemyFleetRepository(db)
    uow = SQLAlchemyUnitOfWork(db)
    use_case = RegisterDriverUseCase(uow, repo, get_context_accessor())
    return use_case.execute(dto)

from modules.fleet.application.use_cases.list_vehicles import ListVehicles
from modules.fleet.application.use_cases.list_drivers import ListDrivers
from modules.fleet.infrastructure.repositories.sqlalchemy_fleet_repository import SQLAlchemyFleetRepository

@router.get("/vehicles", response_model=list[VehicleResponseDTO])
def list_vehicles(db: Session = Depends(get_db)):
    repo = SQLAlchemyFleetRepository(db)
    use_case = ListVehicles(repo)
    return use_case.execute()

@router.get("/drivers", response_model=list[DriverResponseDTO])
def list_drivers(db: Session = Depends(get_db)):
    repo = SQLAlchemyFleetRepository(db)
    use_case = ListDrivers(repo)
    return use_case.execute()
