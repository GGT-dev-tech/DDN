# ADR 025: Feature Flags Strategy

## Context
We need the ability to decouple deployment from release, enable canary rollouts, and toggle specific business capabilities per tenant (e.g. premium features).

## Decision
- Implement a Feature Flag layer in the backend, evaluated at the request level (Middleware or Dependency Injection).
- Feature flags will be accessible to the frontend via a specific endpoint (e.g. `/api/v1/features`).
- Temporary flags (for canary releases) must be removed once 100% rolled out.

## Consequences
- Requires a strategy to store and distribute flags (e.g., Redis or a dedicated table).
- Frontend UI components must gracefully handle disabled states.
