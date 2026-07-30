from fastapi import APIRouter, Depends, status
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session as get_db


from modules.core.context import accessor as context_accessor_instance
from modules.identity.dependencies import require_tenant
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
async def register_vehicle(
    dto: RegisterVehicleRequestDTO,
    tenant_id: uuid.UUID = Depends(require_tenant),
    db: AsyncSession = Depends(get_db)
):
    repo = SQLAlchemyFleetRepository(db)
    use_case = RegisterVehicleUseCase(db, repo, get_context_accessor())
    return await use_case.execute(dto)

@router.post("/drivers", response_model=DriverResponseDTO, status_code=status.HTTP_201_CREATED)
async def register_driver(
    dto: RegisterDriverRequestDTO,
    tenant_id: uuid.UUID = Depends(require_tenant),
    db: AsyncSession = Depends(get_db)
):
    repo = SQLAlchemyFleetRepository(db)
    use_case = RegisterDriverUseCase(db, repo, get_context_accessor())
    return await use_case.execute(dto)

from modules.fleet.application.use_cases.list_vehicles import ListVehicles
from modules.fleet.application.use_cases.list_drivers import ListDrivers
from modules.fleet.infrastructure.repositories.sqlalchemy_fleet_repository import SQLAlchemyFleetRepository

@router.get("/vehicles", response_model=list[VehicleResponseDTO])
async def list_vehicles(
    tenant_id: uuid.UUID = Depends(require_tenant),
    db: AsyncSession = Depends(get_db)
):
    repo = SQLAlchemyFleetRepository(db)
    use_case = ListVehicles(repo)
    return await use_case.execute(tenant_id)

@router.get("/drivers", response_model=list[DriverResponseDTO])
async def list_drivers(
    tenant_id: uuid.UUID = Depends(require_tenant),
    db: AsyncSession = Depends(get_db)
):
    repo = SQLAlchemyFleetRepository(db)
    use_case = ListDrivers(repo)
    return await use_case.execute(tenant_id)
