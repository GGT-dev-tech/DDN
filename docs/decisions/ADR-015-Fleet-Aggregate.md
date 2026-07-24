# ADR-015: Fleet Aggregate

## Status
Accepted

## Context
Routing depends on vehicles and drivers, but Fleet Management is an independent lifecycle.

## Decision
Establish Fleet as an independent Aggregate. Routing refers to Fleet entities strictly by ID (Aggregate Ownership Rule).

## Consequences
- Decoupled modules.
- Fleet operations do not immediately lock routing resources.
