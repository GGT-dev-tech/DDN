from .models import RequestContext, AuthContext, TenantContext, AuthenticationMethod
from .accessor import ContextAccessor
from .context_vars_accessor import (
    ContextVarsAccessor,
    set_request_context, reset_request_context,
    set_auth_context, reset_auth_context,
    set_tenant_context, reset_tenant_context
)

# Global accessor instance
accessor: ContextAccessor = ContextVarsAccessor()
