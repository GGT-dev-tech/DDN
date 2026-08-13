import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api_gateway.src.main import limiter
from database.session import get_db_session
from modules.identity.dependencies import auth_service, get_current_user_id
from modules.identity.domain.dto import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from modules.identity.domain.entities.refresh_token import RefreshToken
from modules.identity.domain.entities.user import User, UserStatus
from modules.tenant.domain.entities.tenant import Tenant, TenantPlan, TenantStatus
from modules.tenant.domain.entities.tenant_user import TenantRole, TenantUser

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
@limiter.limit("5/minute")
async def register(
    request: Request,
    body: UserRegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)]
):
    from modules.core.infrastructure.uow import SQLAlchemyUnitOfWork
    from modules.identity.application.use_cases import RegisterUserUseCase

    uow = SQLAlchemyUnitOfWork(db)
    use_case = RegisterUserUseCase(uow)
    return await use_case.execute(body)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(
    request: Request,
    body: UserLoginRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)]
):
    from modules.core.infrastructure.uow import SQLAlchemyUnitOfWork
    from modules.identity.application.use_cases import LoginUseCase

    uow = SQLAlchemyUnitOfWork(db)
    use_case = LoginUseCase(uow)
    return await use_case.execute(body)


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/logout", status_code=204)
async def logout(
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    Revokes all active refresh tokens for the current user.
    The access token will expire naturally (15 min TTL).
    For immediate invalidation, implement a token denylist in Redis.
    """
    from sqlalchemy import update

    await db.execute(
        update(RefreshToken)
        .where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at.is_(None),
        )
        .values(revoked_at=datetime.now(UTC))
    )
    await db.commit()
