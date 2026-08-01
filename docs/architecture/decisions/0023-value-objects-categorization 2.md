# 23. Value Objects Classification

Date: 2026-07-24
Status: Accepted

## Context
Value objects como Money ou LicensePlate cresceriam desordenados.

## Decision
Value objects em `shared_kernel` foram organizados por domínio estrito (`finance/`, `geo/`, `ids/`, `common/`, etc) garantindo extensibilidade.
