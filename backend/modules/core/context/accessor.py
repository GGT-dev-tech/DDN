from abc import ABC, abstractmethod
from typing import Optional
from .models import RequestContext, AuthContext, TenantContext

class ContextAccessor(ABC):
    @abstractmethod
    def request(self) -> Optional[RequestContext]:
        pass

    @abstractmethod
    def auth(self) -> Optional[AuthContext]:
        pass

    @abstractmethod
    def tenant(self) -> Optional[TenantContext]:
        pass
