from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.session import get_db_session as get_db
from database.core.unit_of_work import SQLAlchemyUnitOfWork
from modules.core.context import accessor as context_accessor_instance, ContextAccessor
from modules.routing.application.dto import CreateRouteRequestDTO, AddStopRequestDTO, RouteResponseDTO, AssignRouteResourcesRequestDTO
from modules.routing.application.use_cases.create_route import CreateRouteUseCase
from modules.routing.application.use_cases.add_stop import AddStopUseCase
from modules.routing.infrastructure.repositories.sqlalchemy_routing_repository import SQLAlchemyRoutingRepository
from modules.routing.domain.exceptions import RoutingDomainException

router = APIRouter(prefix="/routing", tags=["Routing"])

def get_routing_repository(db: Session = Depends(get_db)):
    return SQLAlchemyRoutingRepository(db)

def get_uow(db: Session = Depends(get_db)):
    return SQLAlchemyUnitOfWork(db)

def get_context_accessor():
    return context_accessor_instance

@router.post("/routes", response_model=RouteResponseDTO, status_code=status.HTTP_201_CREATED)
def create_route(
    dto: CreateRouteRequestDTO,
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
    repo: SQLAlchemyRoutingRepository = Depends(get_routing_repository),
    context_accessor: ContextAccessor = Depends(get_context_accessor)
):
    try:
        use_case = CreateRouteUseCase(uow, repo, context_accessor)
        return use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/routes/{route_id}/stops", response_model=RouteResponseDTO)
def add_stop_to_route(
    route_id: str,
    dto: AddStopRequestDTO,
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
    repo: SQLAlchemyRoutingRepository = Depends(get_routing_repository)
):
    # Ensure route_id in path matches dto
    if str(dto.route_id) != route_id:
        raise HTTPException(status_code=400, detail="Route ID mismatch")
        
    try:
        use_case = AddStopUseCase(uow, repo)
        return use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RoutingDomainException as e:
        raise HTTPException(status_code=422, detail=str(e))

@router.post("/routes/{route_id}/assign", response_model=RouteResponseDTO)
def assign_route_resources(
    route_id: str,
    dto: AssignRouteResourcesRequestDTO,
    uow: SQLAlchemyUnitOfWork = Depends(get_uow),
    routing_repo: SQLAlchemyRoutingRepository = Depends(get_routing_repository),
    context_accessor: ContextAccessor = Depends(get_context_accessor),
    db: Session = Depends(get_db)
):
    # Ensure route_id in path matches dto
    if str(dto.route_id) != route_id:
        raise HTTPException(status_code=400, detail="Route ID mismatch")
        
    try:
        from modules.fleet.infrastructure.repositories.sqlalchemy_fleet_repository import SQLAlchemyFleetRepository
        from modules.routing.application.use_cases.assign_route_resources import AssignRouteResourcesUseCase
        
        fleet_repo = SQLAlchemyFleetRepository(db)
        use_case = AssignRouteResourcesUseCase(uow, routing_repo, fleet_repo, context_accessor)
        return use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RoutingDomainException as e:
        raise HTTPException(status_code=422, detail=str(e))
