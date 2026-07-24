from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from dataclasses import dataclass, field
from enum import Enum

class Severity(Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    BLOCKING = "BLOCKING"

@dataclass
class SpecificationResult:
    is_valid: bool
    reason: Optional[str] = None
    code: Optional[str] = None
    severity: Severity = Severity.BLOCKING
    metadata: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def success(cls) -> "SpecificationResult":
        return cls(is_valid=True)

    @classmethod
    def failure(
        cls, 
        reason: str, 
        code: str, 
        severity: Severity = Severity.BLOCKING, 
        metadata: Optional[Dict[str, Any]] = None
    ) -> "SpecificationResult":
        return cls(
            is_valid=False, 
            reason=reason, 
            code=code, 
            severity=severity, 
            metadata=metadata or {}
        )

class Specification(ABC):
    """
    Base class for Domain Specifications.
    Specifications encapsulate business rules that can be checked against an aggregate or entity.
    """
    @abstractmethod
    def is_satisfied_by(self, candidate: Any) -> SpecificationResult:
        pass
        
    def __and__(self, other: "Specification") -> "Specification":
        return AndSpecification(self, other)

    def __or__(self, other: "Specification") -> "Specification":
        return OrSpecification(self, other)

    def __invert__(self) -> "Specification":
        return NotSpecification(self)


class AndSpecification(Specification):
    def __init__(self, left: Specification, right: Specification):
        self.left = left
        self.right = right

    def is_satisfied_by(self, candidate: Any) -> SpecificationResult:
        left_result = self.left.is_satisfied_by(candidate)
        if not left_result.is_valid:
            return left_result
        return self.right.is_satisfied_by(candidate)


class OrSpecification(Specification):
    def __init__(self, left: Specification, right: Specification):
        self.left = left
        self.right = right

    def is_satisfied_by(self, candidate: Any) -> SpecificationResult:
        left_result = self.left.is_satisfied_by(candidate)
        if left_result.is_valid:
            return left_result
            
        right_result = self.right.is_satisfied_by(candidate)
        if right_result.is_valid:
            return right_result
            
        # Combine failures (simplification)
        return SpecificationResult.failure(
            reason=f"{left_result.reason} OR {right_result.reason}",
            code="OR_SPEC_FAILED",
            severity=max(left_result.severity, right_result.severity, key=lambda s: list(Severity).index(s))
        )


class NotSpecification(Specification):
    def __init__(self, spec: Specification):
        self.spec = spec

    def is_satisfied_by(self, candidate: Any) -> SpecificationResult:
        result = self.spec.is_satisfied_by(candidate)
        if result.is_valid:
            return SpecificationResult.failure(
                reason="Not specification failed: underlying spec was satisfied.",
                code="NOT_SPEC_FAILED"
            )
        return SpecificationResult.success()
