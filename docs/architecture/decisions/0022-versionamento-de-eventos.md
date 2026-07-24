# 22. Versionamento Independente de Eventos e Agregados

Date: 2026-07-24
Status: Accepted

## Context
Havia ambiguidade entre a versão do Evento (schema version) e a versão da Mutação (aggregate version).

## Decision
As classes de `EventMetadata` trarão `event_schema_version` isolado de `aggregate_version`.
