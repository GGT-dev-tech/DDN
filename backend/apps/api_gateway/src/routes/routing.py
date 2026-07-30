from fastapi import APIRouter, Depends, HTTPException, status
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from database.session import get_db_session as get_db
from modules.core.context import ContextAccessor
from modules.core.context import accessor as context_accessor_instance
from modules.identity.dependencies import require_tenant
from modules.routing.application.dto import (
    AddStopRequestDTO,
    AssignRouteResourcesRequestDTO,
    CreateRouteRequestDTO,
    RouteResponseDTO,
)
from modules.routing.application.use_cases.add_stop import AddStopUseCase
from modules.routing.application.use_cases.create_route import CreateRouteUseCase
from modules.routing.domain.exceptions import RoutingDomainException
from modules.routing.infrastructure.repositories.sqlalchemy_routing_repository import (
    SQLAlchemyRoutingRepository,
)

router = APIRouter(prefix="/routing", tags=["Routing"])

def get_routing_repository(db: AsyncSession = Depends(get_db)):
    return SQLAlchemyRoutingRepository(db)

def get_requirement_repository(db: AsyncSession = Depends(get_db)):
    from modules.routing.infrastructure.repositories.sqlalchemy_requirement_repository import (
        SQLAlchemyRequirementRepository,
    )
    return SQLAlchemyRequirementRepository(db)



def get_context_accessor():
    return context_accessor_instance

@router.post("/routes", response_model=RouteResponseDTO, status_code=status.HTTP_201_CREATED)
async def create_route(
    dto: CreateRouteRequestDTO,
    db: AsyncSession = Depends(get_db),
    repo: SQLAlchemyRoutingRepository = Depends(get_routing_repository),
    context_accessor: ContextAccessor = Depends(get_context_accessor)
):
    try:
        use_case = CreateRouteUseCase(db, repo, context_accessor)
        return await use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/routes/{route_id}/stops", response_model=RouteResponseDTO)
async def add_stop_to_route(
    route_id: str,
    dto: AddStopRequestDTO,
    db: AsyncSession = Depends(get_db),
    repo: SQLAlchemyRoutingRepository = Depends(get_routing_repository)
):
    # Ensure route_id in path matches dto
    if str(dto.route_id) != route_id:
        raise HTTPException(status_code=400, detail="Route ID mismatch")
        
    try:
        use_case = AddStopUseCase(db, repo)
        return await use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RoutingDomainException as e:
        raise HTTPException(status_code=422, detail=str(e))

@router.post("/routes/{route_id}/assign", response_model=RouteResponseDTO)
async def assign_route_resources(
    route_id: str,
    dto: AssignRouteResourcesRequestDTO,
    routing_repo: SQLAlchemyRoutingRepository = Depends(get_routing_repository),
    context_accessor: ContextAccessor = Depends(get_context_accessor),
    db: AsyncSession = Depends(get_db)
):
    # Ensure route_id in path matches dto
    if str(dto.route_id) != route_id:
        raise HTTPException(status_code=400, detail="Route ID mismatch")
        
    try:
        from modules.fleet.infrastructure.repositories.sqlalchemy_fleet_repository import (
            SQLAlchemyFleetRepository,
        )
        from modules.routing.application.use_cases.assign_route_resources import (
            AssignRouteResourcesUseCase,
        )
        
        fleet_repo = SQLAlchemyFleetRepository(db)
        use_case = AssignRouteResourcesUseCase(db, routing_repo, fleet_repo, context_accessor)
        return await use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RoutingDomainException as e:
        raise HTTPException(status_code=422, detail=str(e))

from modules.routing.application.use_cases.list_routes import ListRoutes

@router.get("/routes", response_model=list[RouteResponseDTO])
async def list_routes(
    tenant_id: uuid.UUID = Depends(require_tenant),
    routing_repo: SQLAlchemyRoutingRepository = Depends(get_routing_repository)
):
    use_case = ListRoutes(routing_repo)
    return await use_case.execute(tenant_id)

from modules.routing.application.use_cases.list_requirements import ListRequirementsUseCase, RequirementDTO

@router.get("/requirements", response_model=list[RequirementDTO])
async def list_requirements(
    tenant_id: uuid.UUID = Depends(require_tenant),
    req_repo = Depends(get_requirement_repository)
):
    use_case = ListRequirementsUseCase(req_repo)
    return await use_case.execute(tenant_id)
