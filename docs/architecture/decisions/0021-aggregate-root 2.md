# 21. Aggregate Root Contrato Unificado

Date: 2026-07-24
Status: Accepted

## Context
UnitOfWork coletava eventos ad-hoc e IDs não eram uniformes.

## Decision
Adotamos uma superclasse `AggregateRoot` da qual todos os aggregates de módulo devem herdar, gerenciando estritamente `collect_events()` e versão otimista.
