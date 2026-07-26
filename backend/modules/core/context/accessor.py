from abc import ABC, abstractmethod

from .models import AuthContext, RequestContext, TenantContext


class ContextAccessor(ABC):
    @abstractmethod
    def request(self) -> RequestContext | None:
        pass

    @abstractmethod
    def auth(self) -> AuthContext | None:
        pass

    @abstractmethod
    def tenant(self) -> TenantContext | None:
        pass
