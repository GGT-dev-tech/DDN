from dataclasses import dataclass


@dataclass(frozen=True)
class ValueObject:
    """Base class for all value objects in the domain.
    Value objects are immutable and equality is based on their attributes."""
    
    def __post_init__(self) -> None:
        """Hook to run validation logic after initialization."""
        self.validate()
        
    def validate(self) -> None:
        """Override this method to enforce domain invariants."""
