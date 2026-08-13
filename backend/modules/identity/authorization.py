"""
RBAC Authorization Guards.

Provides FastAPI dependencies to enforce role-based access control
using the TenantRole already present in the TenantUser model.

Usage:
    @router.post("/contracts/{id}/activate")
    async def activate_contract(
        _: None = Depends(require_role(TenantRole.ADMIN)),
        ...
    ):

Roles hierarchy (highest to lowest):
    OWNER > ADMIN > OPERATOR > VIEWER
"""
from typing import Annotated

from fastapi import Depends, HTTPException, status

from modules.identity.dependencies import require_tenant
from modules.tenant.domain.entities.tenant_user import TenantRole
from modules.core.context import accessor

# Role hierarchy: higher index = more permissions
_ROLE_HIERARCHY = [
    TenantRole.VIEWER,
    TenantRole.OPERATOR,
    TenantRole.ADMIN,
    TenantRole.OWNER,
]


def _role_rank(role: TenantRole) -> int:
    """Returns the numeric rank of a role (higher = more privileged)."""
    try:
        return _ROLE_HIERARCHY.index(role)
    except ValueError:
        return -1


def require_role(minimum_role: TenantRole):
    """
    Returns a FastAPI dependency that enforces a minimum TenantRole.

    The tenant context is resolved first (via require_tenant), which sets
    TenantContext in contextvars. We then verify the user's role meets the minimum.

    Note: This uses TenantRole from TenantUser as a fast, pragmatic RBAC layer.
    For fine-grained permission codes (roles/permissions tables), extend this
    to load role_ids from TenantContext and check against a permission store.
    """
    async def _guard(tenant_id=Depends(require_tenant)):
        # The require_tenant dependency has already validated the user's membership
        # and set TenantContext. We need the actual role from the DB.
        # Since require_tenant already fetched TenantUser, we re-use it via context.
        # For now we use the role stored on TenantUser (fetched in require_tenant).
        # TODO: Store role in TenantContext to avoid a second DB hit.
        # This approach is safe because require_tenant already validated membership.
        from sqlalchemy import select
        from modules.core.context import accessor as ctx
        from modules.tenant.domain.entities.tenant_user import TenantUser

        auth_ctx = ctx.auth()
        tenant_ctx = ctx.tenant()

        if not auth_ctx or not tenant_ctx:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication context not available",
            )

        # Re-fetch TenantUser to get the role.
        # A future optimization: cache role in TenantContext during require_tenant.
        from database.session import async_session_maker
        async with async_session_maker() as session:
            stmt = select(TenantUser).where(
                TenantUser.user_id == auth_ctx.user_id,
                TenantUser.tenant_id == tenant_ctx.tenant_id,
            )
            result = await session.execute(stmt)
            tenant_user = result.scalar_one_or_none()

        if not tenant_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not belong to this tenant",
            )

        user_rank = _role_rank(tenant_user.role)
        required_rank = _role_rank(minimum_role)

        if user_rank < required_rank:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {minimum_role.value} role or higher. "
                       f"Current role: {tenant_user.role.value}",
            )

    return Depends(_guard)
