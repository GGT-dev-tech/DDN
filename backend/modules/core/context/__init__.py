from .accessor import ContextAccessor
from .context_vars_accessor import (
    ContextVarsAccessor,
    reset_auth_context,
    reset_request_context,
    reset_tenant_context,
    set_auth_context,
    set_request_context,
    set_tenant_context,
)
from .models import AuthContext, AuthenticationMethod, RequestContext, TenantContext

# Global accessor instance
accessor: ContextAccessor = ContextVarsAccessor()
