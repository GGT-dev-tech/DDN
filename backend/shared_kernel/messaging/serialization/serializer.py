import json
from abc import ABC, abstractmethod
from typing import Any, Dict, Type
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from enum import Enum
import dataclasses

from shared_kernel.events.base import DomainEvent, EventMetadata

class Serializer(ABC):
    @abstractmethod
    def serialize(self, event: DomainEvent) -> Dict[str, Any]:
        """Convert a DomainEvent to a dictionary envelope containing metadata and payload."""
        pass

    @abstractmethod
    def deserialize(self, data: Dict[str, Any], event_class: Type[DomainEvent]) -> DomainEvent:
        """Reconstruct a DomainEvent from a dictionary envelope."""
        pass

class CustomJSONEncoder(json.JSONEncoder):
    """Handles UUID, datetime, Decimal, Enum serialization."""
    def default(self, obj: Any) -> Any:
        if isinstance(obj, UUID):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return str(obj)
        if isinstance(obj, Enum):
            return obj.value
        # If it has a value property (simple value object)
        if hasattr(obj, "value"):
            return obj.value
        return super().default(obj)

class JsonEventSerializer(Serializer):
    """
    Serializes a DomainEvent into a JSON-compatible dictionary.
    Extracts the 'metadata' field and groups the rest into 'payload'.
    """
    def serialize(self, event: DomainEvent) -> Dict[str, Any]:
        if not dataclasses.is_dataclass(event):
            raise ValueError("Event must be a dataclass")
            
        # Convert all to dict, using the custom encoder to ensure JSON compatibility
        raw_dict = dataclasses.asdict(event)
        
        # We bounce it through JSON to ensure all UUIDs/datetimes/etc are strings
        safe_dict = json.loads(json.dumps(raw_dict, cls=CustomJSONEncoder))
        
        metadata = safe_dict.pop("metadata")
        
        return {
            "metadata": metadata,
            "payload": safe_dict
        }

    def deserialize(self, data: Dict[str, Any], event_class: Type[DomainEvent]) -> DomainEvent:
        # Note: True deserialization of nested dataclasses and value objects requires
        # a structural parser like dacite, pydantic, or cattrs.
        # For simplicity in this baseline, we instantiate directly.
        # In a real app, Pydantic TypeAdapter is recommended here.
        
        metadata_dict = data.get("metadata", {})
        payload_dict = data.get("payload", {})
        
        metadata = EventMetadata(
            event_id=UUID(metadata_dict["event_id"]),
            tenant_id=UUID(metadata_dict["tenant_id"]) if metadata_dict.get("tenant_id") else None,
            correlation_id=metadata_dict["correlation_id"],
            causation_id=metadata_dict.get("causation_id"),
            occurred_at=datetime.fromisoformat(metadata_dict["occurred_at"]),
            event_schema_version=metadata_dict["event_schema_version"],
            aggregate_version=metadata_dict["aggregate_version"]
        )
        
        return event_class(metadata=metadata, **payload_dict)
