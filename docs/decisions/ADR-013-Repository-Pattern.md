# ADR-013: Repository Pattern

## Status
Accepted

## Context
Need to decouple domain models from infrastructure persistence concerns.

## Decision
Implement the Repository Pattern with explicit abstractions in the `application` layer, and concrete implementations in the `infrastructure` layer.

## Consequences
- Domain remains pure.
- Swapping persistence (e.g. for tests) becomes trivial.
