from uuid import UUID

from sqlalchemy import event, inspect
from sqlalchemy.orm import Session

from modules.audit.domain.entities.audit_log import AuditLog
from modules.core.context import accessor


def row_to_dict(obj):
    """Convert an SQLAlchemy object to a dict of its mapped columns."""
    insp = inspect(obj)
    if not insp:
        return {}
    
    res = {}
    for attr in insp.mapper.column_attrs:
        val = getattr(obj, attr.key)
        if isinstance(val, UUID):
            res[attr.key] = str(val)
        else:
            # We rely on JSON serialization later for other types, or we can stringify them
            res[attr.key] = str(val) if val is not None else None
    return res

def handle_audit(mapper, connection, target, action):
    # Don't audit the audit log itself
    if isinstance(target, AuditLog):
        return

    # Check if the model opted into auditing (optional feature, if we want to audit everything we can remove this)
    # For now, let's say we only audit models that have __audit__ = True
    if not getattr(target, "__audit__", False):
        return

    tenant_ctx = accessor.tenant()
    auth_ctx = accessor.auth()
    
    tenant_id = tenant_ctx.tenant_id if tenant_ctx else None
    actor_id = auth_ctx.user_id if auth_ctx else None
    session_id = auth_ctx.session_id if auth_ctx else None

    # Determine event type based on action and table
    table_name = target.__tablename__
    event_type = f"{table_name.upper()}_{action.upper()}"

    payload = {
        "model": table_name,
        "action": action,
        "data": row_to_dict(target)
    }

    # Insert into audit_logs
    # Note: we are using the connection directly to avoid infinite loops and nested session issues
    connection.execute(
        AuditLog.__table__.insert().values(
            tenant_id=tenant_id,
            actor_id=actor_id,
            session_id=session_id,
            event_type=event_type,
            payload=payload
        )
    )

def setup_audit_listeners(engine):
    """Register audit listeners for all models."""
    from database.core.base import Base

    @event.listens_for(Session, "after_flush")
    def receive_after_flush(session, flush_context):
        # We can also do this in after_flush to batch them, but connection level events are simpler for raw inserts.
        pass

    # For simplicity, we use mapper events
    @event.listens_for(Base, "after_insert", propagate=True)
    def receive_after_insert(mapper, connection, target):
        handle_audit(mapper, connection, target, "insert")

    @event.listens_for(Base, "after_update", propagate=True)
    def receive_after_update(mapper, connection, target):
        handle_audit(mapper, connection, target, "update")

    @event.listens_for(Base, "after_delete", propagate=True)
    def receive_after_delete(mapper, connection, target):
        handle_audit(mapper, connection, target, "delete")
