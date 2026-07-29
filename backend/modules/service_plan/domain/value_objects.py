"""
Service Plan Domain — Value Objects and Enumerations.

Nenhum desses tipos conhece Request Context, sessão de banco ou dependências externas.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import time
from enum import Enum
from uuid import UUID

# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------


class ServicePlanStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    TERMINATED = "TERMINATED"


class ScheduleStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    REMOVED = "REMOVED"


class RecurrenceFrequency(str, Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    BIWEEKLY = "BIWEEKLY"
    MONTHLY = "MONTHLY"


class Weekday(int, Enum):
    MON = 0
    TUE = 1
    WED = 2
    THU = 3
    FRI = 4
    SAT = 5
    SUN = 6


# ---------------------------------------------------------------------------
# Value Objects
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class ContractReference:
    """
    Referência imutável ao contrato de origem.
    Não é um FK operacional — é apenas um dado histórico/auditável.
    O Service Plan nunca consulta o BC de Contracts em tempo de execução.
    """
    contract_id: UUID


@dataclass(frozen=True)
class CollectionPoint:
    """
    Localização física onde a coleta ocorre.
    Nasce vazio (address='') no DRAFT e é preenchido pelo operador antes de publish().
    """
    address: str
    latitude: float | None = None
    longitude: float | None = None
    reference: str | None = None  # ex: "Portão lateral", "Galpão 2"

    def is_empty(self) -> bool:
        return not self.address.strip()


@dataclass(frozen=True)
class Recurrence:
    """
    Regra de recorrência para execução de um serviço de coleta.
    Inclui timezone obrigatório para evitar ambiguidade em operações multi-filial.
    """
    frequency: RecurrenceFrequency
    interval: int                         # "a cada N períodos" (default=1)
    weekdays: list[Weekday] = field(default_factory=list)
    start_time: time = time(8, 0)
    end_time: time = time(12, 0)
    timezone: str = "America/Sao_Paulo"   # IANA timezone string

    def __post_init__(self) -> None:
        from modules.service_plan.domain.exceptions import InvalidRecurrenceWindowError
        if self.start_time >= self.end_time:
            raise InvalidRecurrenceWindowError(
                f"start_time ({self.start_time}) must be before end_time ({self.end_time})"
            )
        if self.interval < 1:
            raise ValueError("interval must be >= 1")
