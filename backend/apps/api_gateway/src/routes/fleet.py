from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.session import get_db_session as get_db


# Dummy context accessor for now to fix crash
def get_context_accessor():
    pass

from modules.fleet.application.dto import (
    DriverResponseDTO,
    RegisterDriverRequestDTO,
    RegisterVehicleRequestDTO,
    VehicleResponseDTO,
)

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
