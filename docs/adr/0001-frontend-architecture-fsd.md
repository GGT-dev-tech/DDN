# ADR 0001: Adoção do Feature-Sliced Design (FSD) no Frontend

**Data:** 2026-07-30
**Status:** Aceito

## 1. Contexto e Problema
Projetos React convencionais tendem a agrupar arquivos por tipo tecnológico (ex: `/components`, `/hooks`, `/pages`). Em plataformas Enterprise como a DDN OS, que lida com múltiplos domínios hiper-complexos (Comercial, Operação, Faturamento), esse padrão gera a síndrome do "Spaghetti Code". Um desenvolvedor que precisa alterar uma regra comercial acaba tocando em componentes globais, causando efeitos colaterais em outras áreas.

## 2. Decisão
Adotaremos a arquitetura **Feature-Sliced Design (FSD)** para organizar o frontend. O código será fatiado por valor de negócio (`features` e `entities`) em vez de tipo.

## 3. Consequências

### Positivas:
- **Linguagem Ubíqua Mantida:** As pastas do front refletirão exatamente o backend e o Domain Map (existirão pacotes isolados para `Quotation`, `Route`, `Invoice`).
- **Isolamento Constrito:** Uma funcionalidade do módulo Comercial não poderá importar arbitrariamente lógica do módulo de Compliance.
- **Onboarding Acelerado:** Novos desenvolvedores encontram a regra de negócio centralizada no mesmo diretório em vez de espalhada por `/hooks` e `/components`.

### Negativas (Trade-offs):
- A curva de aprendizado inicial é maior. Desenvolvedores acostumados a jogar tudo em uma pasta `/src/components` precisarão de treinamento sobre o que pertence à camada `shared`, `entities` ou `features`.
- Leve verbosidade inicial na criação da estrutura de pastas.
