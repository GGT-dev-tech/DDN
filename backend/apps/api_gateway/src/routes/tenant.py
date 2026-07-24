from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated
from uuid import UUID

from modules.tenant.domain.dto import TenantContextResponse, TenantResponse
from modules.tenant.domain.entities.tenant import Tenant
from modules.tenant.domain.entities.tenant_user import TenantUser
from database.session import get_db_session
from modules.identity.dependencies import require_tenant, get_current_user_id

router = APIRouter(prefix="/tenant", tags=["tenant"])

@router.get("/current", response_model=TenantContextResponse)
async def get_current_tenant(
    user_id: Annotated[UUID, Depends(get_current_user_id)],
    tenant_id: Annotated[UUID, Depends(require_tenant)],
    db: Annotated[AsyncSession, Depends(get_db_session)]
):
    # Fetch the tenant and the role
    stmt = select(Tenant).where(Tenant.id == tenant_id)
    tenant = (await db.execute(stmt)).scalar_one_or_none()
    
    stmt_role = select(TenantUser).where(TenantUser.tenant_id == tenant_id, TenantUser.user_id == user_id)
    tenant_user = (await db.execute(stmt_role)).scalar_one_or_none()
    
    if not tenant or not tenant_user:
        raise HTTPException(status_code=404, detail="Tenant context not found")
        
    return TenantContextResponse(
        tenant=TenantResponse.model_validate(tenant),
        role=tenant_user.role
    )
