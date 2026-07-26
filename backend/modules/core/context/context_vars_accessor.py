import contextvars

from .accessor import ContextAccessor
from .models import AuthContext, RequestContext, TenantContext

_request_context_var: contextvars.ContextVar[RequestContext | None] = contextvars.ContextVar("request_context", default=None)
_auth_context_var: contextvars.ContextVar[AuthContext | None] = contextvars.ContextVar("auth_context", default=None)
_tenant_context_var: contextvars.ContextVar[TenantContext | None] = contextvars.ContextVar("tenant_context", default=None)

class ContextVarsAccessor(ContextAccessor):
    def request(self) -> RequestContext | None:
        return _request_context_var.get()

    def auth(self) -> AuthContext | None:
        return _auth_context_var.get()

    def tenant(self) -> TenantContext | None:
        return _tenant_context_var.get()

def set_request_context(context: RequestContext) -> contextvars.Token:
    return _request_context_var.set(context)

def reset_request_context(token: contextvars.Token) -> None:
    _request_context_var.reset(token)

def set_auth_context(context: AuthContext) -> contextvars.Token:
    return _auth_context_var.set(context)

def reset_auth_context(token: contextvars.Token) -> None:
    _auth_context_var.reset(token)

def set_tenant_context(context: TenantContext) -> contextvars.Token:
    return _tenant_context_var.set(context)

def reset_tenant_context(token: contextvars.Token) -> None:
    _tenant_context_var.reset(token)
