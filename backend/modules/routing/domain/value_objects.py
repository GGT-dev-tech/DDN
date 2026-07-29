from dataclasses import dataclass
from datetime import time
from enum import Enum


class RequirementStatus(Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

class Frequency(Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"

class Weekday(Enum):
    MONDAY = 0
    TUESDAY = 1
    WEDNESDAY = 2
    THURSDAY = 3
    FRIDAY = 4
    SATURDAY = 5
    SUNDAY = 6

@dataclass(frozen=True)
class Recurrence:
    """Defines how often a CollectionRequirement should trigger a Stop."""
    frequency: Frequency
    interval: int  # e.g., 1 = every week, 2 = every 2 weeks
    weekdays: list[Weekday]
    start_time: time
    end_time: time
    timezone: str = "America/Sao_Paulo"

@dataclass(frozen=True)
class Location:
    latitude: float
    longitude: float
    address: str
    reference: str | None = None
