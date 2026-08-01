# 20. Event Serialization Independente

Date: 2026-07-24
Status: Accepted

## Context
Eventos de domínio eram acoplados a uma formatação arbitrária `payload()`.

## Decision
Criar `EventSerializer` interface para que o framework defina a extração de dados JSON ou outros formatos, baseados no envelope de Message Metadata.
