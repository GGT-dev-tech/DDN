from fastapi import Depends, HTTPException, status, Header, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import Annotated
import jwt
from uuid import UUID
from datetime import datetime

from modules.core.config.settings import settings
from database.session import get_db_session
from modules.identity.services.auth_service import AuthService
from modules.core.context import (
    AuthContext, TenantContext, AuthenticationMethod,
    set_auth_context, set_tenant_context
)
from modules.tenant.domain.entities.tenant_user import TenantUser

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
auth_service = AuthService(secret_key=settings.security.jwt_secret)

async def get_current_user_id(request: Request, token: Annotated[str, Depends(oauth2_scheme)]) -> UUID:
    try:
        payload = auth_service.decode_token(token)
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user_id = UUID(user_id_str)
        
        # Set AuthContext
        auth_ctx = AuthContext(
            user_id=user_id,
            session_id=None, # To be populated if payload contains session_id
            authentication_method=AuthenticationMethod.JWT,
            authenticated_at=datetime.now(datetime.UTC)
        )
        set_auth_context(auth_ctx)
        
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def require_tenant(
    user_id: Annotated[UUID, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    x_tenant_id: Annotated[str | None, Header()] = None,
) -> UUID:
    """
    Middleware/Dependency to resolve the current tenant.
    If X-Tenant-ID is provided, verifies if user belongs to it.
    If not provided, defaults to the first tenant the user belongs to.
    Sets the TenantContext contextvar.
    """
    tenant_uuid = None
    if x_tenant_id:
        tenant_uuid = UUID(x_tenant_id)
        # Verify access
        stmt = select(TenantUser).where(
            TenantUser.user_id == user_id,
            TenantUser.tenant_id == tenant_uuid
        )
        result = await db.execute(stmt)
        tenant_user = result.scalar_one_or_none()
        if not tenant_user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to tenant denied")
    else:
        # Fallback: get first tenant
        stmt = select(TenantUser).where(TenantUser.user_id == user_id).limit(1)
        result = await db.execute(stmt)
        tenant_user = result.scalar_one_or_none()
        if not tenant_user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not belong to any tenant")
        tenant_uuid = tenant_user.tenant_id

    # Create and set TenantContext
    ctx = TenantContext(
        tenant_id=tenant_uuid,
        membership_id=tenant_user.id,
        role_ids=set() # To be populated if RBAC loads roles
    )
    set_tenant_context(ctx)
    
    return tenant_uuid
