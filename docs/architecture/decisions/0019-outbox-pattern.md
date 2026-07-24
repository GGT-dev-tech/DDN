# 19. Outbox Pattern State Machine e Lock

Date: 2026-07-24
Status: Accepted

## Context
Eventos podem falhar ou precisar de escalabilidade de múltiplos workers consumindo da tabela outbox.

## Decision
Utilizar `SELECT FOR UPDATE SKIP LOCKED` e máquina de estados (PENDING, PROCESSING, PROCESSED, FAILED, RETRYING, DEAD_LETTER, EXPIRED).
