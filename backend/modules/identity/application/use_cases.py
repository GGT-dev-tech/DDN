import secrets
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from modules.identity.dependencies import auth_service
from modules.identity.domain.dto import TokenResponse, UserLoginRequest, UserRegisterRequest
from modules.identity.domain.entities.refresh_token import RefreshToken
from modules.identity.domain.entities.user import User, UserStatus
from modules.tenant.domain.entities.tenant import Tenant, TenantPlan, TenantStatus
from modules.tenant.domain.entities.tenant_user import TenantRole, TenantUser
from modules.core.infrastructure.uow import UnitOfWork


class RegisterUserUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    async def execute(self, request: UserRegisterRequest) -> TokenResponse:
        async with self.uow as uow:
            session = self.uow.session
            
            # Check if user exists
            stmt = select(User).where(User.email == request.email)
            existing = await session.execute(stmt)
            if existing.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Email already registered")

            # Create user
            hashed_pwd = auth_service.get_password_hash(request.password)
            user = User(
                email=request.email,
                password_hash=hashed_pwd,
                status=UserStatus.ACTIVE
            )
            session.add(user)
            
            # Create tenant
            tenant = Tenant(
                name=request.tenant_name,
                status=TenantStatus.ACTIVE,
                plan=TenantPlan.FREE
            )
            session.add(tenant)
            
            # We must flush to get the IDs before we can link them
            await session.flush()

            # Link user to tenant as OWNER
            tenant_user = TenantUser(
                user_id=user.id,
                tenant_id=tenant.id,
                role=TenantRole.OWNER
            )
            session.add(tenant_user)
            
            # Generate tokens
            access_token = auth_service.create_access_token(
                data={"sub": str(user.id)}, expires_delta=timedelta(minutes=15)
            )
            refresh_token_str = secrets.token_urlsafe(32)
            
            refresh_token = RefreshToken(
                user_id=user.id,
                token_hash=auth_service.get_password_hash(refresh_token_str),
                expires_at=datetime.now(UTC) + timedelta(days=30)
            )
            session.add(refresh_token)
            
            try:
                await uow.commit()
            except IntegrityError:
                await uow.rollback()
                raise HTTPException(status_code=400, detail="Email already registered")
                
            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token_str,
                tenant_id=str(tenant.id)
            )


class LoginUseCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    async def execute(self, request: UserLoginRequest) -> TokenResponse:
        async with self.uow as uow:
            session = self.uow.session
            
            stmt = select(User).where(User.email == request.email)
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()

            if not user or not auth_service.verify_password(request.password, user.password_hash):
                raise HTTPException(status_code=401, detail="Invalid credentials")

            if user.status != UserStatus.ACTIVE:
                raise HTTPException(status_code=403, detail="Account is not active")

            user.last_login_at = datetime.now(UTC)

            access_token = auth_service.create_access_token(
                data={"sub": str(user.id)}, expires_delta=timedelta(minutes=15)
            )
            refresh_token_str = secrets.token_urlsafe(32)

            # Revoke all existing active refresh tokens before issuing a new one (HR-04)
            await session.execute(
                update(RefreshToken)
                .where(
                    RefreshToken.user_id == user.id,
                    RefreshToken.revoked_at.is_(None),
                    RefreshToken.expires_at > datetime.now(UTC),
                )
                .values(revoked_at=datetime.now(UTC))
            )

            refresh_token = RefreshToken(
                user_id=user.id,
                token_hash=auth_service.get_password_hash(refresh_token_str),
                expires_at=datetime.now(UTC) + timedelta(days=30)
            )
            session.add(refresh_token)
            await uow.commit()

            # Return tenant_id so the frontend can set the X-Tenant-ID header
            stmt_tenant = select(TenantUser).where(
                TenantUser.user_id == user.id
            ).limit(1)
            tenant_user = (await session.execute(stmt_tenant)).scalar_one_or_none()
            active_tenant_id = str(tenant_user.tenant_id) if tenant_user else None

            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token_str,
                tenant_id=active_tenant_id
            )
