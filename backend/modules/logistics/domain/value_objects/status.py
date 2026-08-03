from enum import Enum


class ServiceOrderStatus(str, Enum):
    PENDING = "PENDING"
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"

class ServiceOrderWorkflowType(str, Enum):
    DIRECT_TO_LANDFILL = "DIRECT_TO_LANDFILL"
    WAREHOUSE_STORAGE = "WAREHOUSE_STORAGE"
