# 18. Shared Kernel Separado da Infraestrutura Core

Date: 2026-07-24
Status: Accepted

## Context
A pasta `modules/core` acumulava tanto infraestrutura (banco, log) quanto domínio compartilhado (events, ids).

## Decision
Criamos a pasta `/shared_kernel` exclusiva para contratos de domínio e Value Objects. `modules/core` cuidará de infraestrutura pura.
