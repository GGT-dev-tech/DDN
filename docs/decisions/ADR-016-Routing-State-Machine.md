# ADR-016: Routing State Machine

## Status
Accepted

## Context
Routes traverse complex lifecycles (DRAFT -> ASSIGNED -> IN_PROGRESS -> COMPLETED).

## Decision
Use a finite state machine inside the Route aggregate to protect invariants and emit domain events upon transition.

## Consequences
- Predictable state transitions.
- Invariants are strongly enforced at compile time.
