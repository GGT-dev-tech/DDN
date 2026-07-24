from enum import Enum
from dataclasses import dataclass
from typing import Dict, List, Optional

class PermissionCode(str, Enum):
    # Route Management
    ROUTE_READ = "route:read"
    ROUTE_WRITE = "route:write"
    ROUTE_DELETE = "route:delete"
    
    # Waste Collection
    WASTE_READ = "waste:read"
    WASTE_WRITE = "waste:write"
    
    # User Management
    USER_READ = "user:read"
    USER_WRITE = "user:write"
    
    # Tenant Admin
    TENANT_MANAGE = "tenant:manage"

@dataclass(frozen=True)
class PermissionDefinition:
    code: PermissionCode
    name: str
    description: str
    module: str

class PermissionRegistry:
    _permissions: Dict[PermissionCode, PermissionDefinition] = {}

    @classmethod
    def register(cls, definition: PermissionDefinition) -> None:
        if definition.code in cls._permissions:
            raise ValueError(f"Permission {definition.code} already registered")
        cls._permissions[definition.code] = definition

    @classmethod
    def get_all(cls) -> List[PermissionDefinition]:
        return list(cls._permissions.values())
        
    @classmethod
    def get(cls, code: PermissionCode) -> Optional[PermissionDefinition]:
        return cls._permissions.get(code)

# Register default permissions
PermissionRegistry.register(PermissionDefinition(
    code=PermissionCode.ROUTE_READ,
    name="Read Routes",
    description="View existing collection routes",
    module="logistics"
))
PermissionRegistry.register(PermissionDefinition(
    code=PermissionCode.ROUTE_WRITE,
    name="Write Routes",
    description="Create or modify collection routes",
    module="logistics"
))
PermissionRegistry.register(PermissionDefinition(
    code=PermissionCode.ROUTE_DELETE,
    name="Delete Routes",
    description="Delete collection routes",
    module="logistics"
))
PermissionRegistry.register(PermissionDefinition(
    code=PermissionCode.WASTE_READ,
    name="Read Waste Records",
    description="View waste collection records",
    module="operations"
))
PermissionRegistry.register(PermissionDefinition(
    code=PermissionCode.WASTE_WRITE,
    name="Write Waste Records",
    description="Create or modify waste collection records",
    module="operations"
))
PermissionRegistry.register(PermissionDefinition(
    code=PermissionCode.USER_READ,
    name="Read Users",
    description="View users within the tenant",
    module="identity"
))
PermissionRegistry.register(PermissionDefinition(
    code=PermissionCode.USER_WRITE,
    name="Write Users",
    description="Create or modify users within the tenant",
    module="identity"
))
PermissionRegistry.register(PermissionDefinition(
    code=PermissionCode.TENANT_MANAGE,
    name="Manage Tenant",
    description="Manage tenant settings and billing",
    module="tenant"
))
