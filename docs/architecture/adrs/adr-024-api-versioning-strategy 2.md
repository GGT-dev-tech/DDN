# ADR 024: API Versioning Strategy

## Context
As the SaaS grows and serves multiple mobile and web clients, we need a definitive way to introduce breaking changes without disrupting existing tenants.

## Decision
- Endpoints will be strictly prefixed by version (e.g. `/api/v1/...`).
- A new version `/api/v2` is only introduced when **breaking changes** are required.
- Additive changes (new fields, new endpoints) will remain on the current version.
- Clients must explicitly target the API version.

## Consequences
- Requires strict adherence to OpenAPI schema generation to flag breaking changes.
- Deprecation periods must be enforced before retiring old versions.
