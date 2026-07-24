from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated
from datetime import timedelta, datetime, timezone
import secrets

from modules.identity.domain.dto import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from modules.identity.domain.entities.user import User, UserStatus
from modules.identity.domain.entities.refresh_token import RefreshToken
from modules.tenant.domain.entities.tenant import Tenant, TenantStatus, TenantPlan
from modules.tenant.domain.entities.tenant_user import TenantUser, TenantRole
from database.session import get_db_session
from modules.identity.dependencies import auth_service, get_current_user_id

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(request: UserRegisterRequest, db: Annotated[AsyncSession, Depends(get_db_session)]):
    # Check if user exists
    stmt = select(User).where(User.email == request.email)
    existing = await db.execute(stmt)
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    hashed_pwd = auth_service.get_password_hash(request.password)
    user = User(
        email=request.email,
        password_hash=hashed_pwd,
        status=UserStatus.ACTIVE
    )
    db.add(user)
    
    # Create tenant
    tenant = Tenant(
        name=request.tenant_name,
        status=TenantStatus.ACTIVE,
        plan=TenantPlan.FREE
    )
    db.add(tenant)
    
    # We must flush to get the IDs before we can link them
    await db.flush()

    # Link user to tenant as OWNER
    tenant_user = TenantUser(
        user_id=user.id,
        tenant_id=tenant.id,
        role=TenantRole.OWNER
    )
    db.add(tenant_user)
    
    # Generate tokens
    access_token = auth_service.create_access_token(data={"sub": str(user.id)}, expires_delta=timedelta(minutes=15))
    refresh_token_str = secrets.token_urlsafe(64)
    
    refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=auth_service.get_password_hash(refresh_token_str), # We can hash the RT for security
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    db.add(refresh_token)
    
    await db.commit()
    
    # In a real app we'd just return the hash mapping, but for API consumption we return the raw token
    return TokenResponse(access_token=access_token, refresh_token=refresh_token_str)


@router.post("/login", response_model=TokenResponse)
async def login(request: UserLoginRequest, db: Annotated[AsyncSession, Depends(get_db_session)]):
    stmt = select(User).where(User.email == request.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user or not auth_service.verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=403, detail="Account is not active")
        
    user.last_login_at = datetime.now(timezone.utc)
    
    access_token = auth_service.create_access_token(data={"sub": str(user.id)}, expires_delta=timedelta(minutes=15))
    refresh_token_str = secrets.token_urlsafe(64)
    
    refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=auth_service.get_password_hash(refresh_token_str),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    db.add(refresh_token)
    await db.commit()
    
    return TokenResponse(access_token=access_token, refresh_token=refresh_token_str)

@router.get("/me", response_model=UserResponse)
async def get_me(user_id: Annotated[str, Depends(get_current_user_id)], db: Annotated[AsyncSession, Depends(get_db_session)]):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
