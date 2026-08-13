from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_name: str # We create a tenant alongside registration

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    tenant_id: str | None = None  # Active tenant for this session

class UserResponse(BaseModel):
    id: UUID
    email: str
    status: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
