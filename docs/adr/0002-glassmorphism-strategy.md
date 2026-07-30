# ADR 0002: Estratégia de Uso do Glassmorphism

**Data:** 2026-07-30
**Status:** Aceito

## 1. Contexto e Problema
A identidade visual da DDN exige uma interface premium de alto nível que transmita tecnologia e transparência, fazendo uso de elementos translúcidos (Glassmorphism). Contudo, o uso desenfreado desse efeito em tabelas, formulários ou fundos de leitura longa destrói o contraste, viola regras de acessibilidade (WCAG 2.2 AA) e fadiga os operadores que utilizam o sistema 8 horas por dia.

## 2. Decisão
Adotamos o conceito de **"Glassmorphism Estrutural e não Decorativo"**.
O efeito será estritamente restrito às **Camadas Flutuantes (Z-Index Elevado)**:
- Headers e Sidebars fixas.
- Drawers / Side Panels deslizando sobre a tela.
- Command Palette (Ctrl+K).
- Dropdowns e Menus de Contexto.

**NUNCA** usaremos Glassmorphism na camada raiz de dados. Tabelas de rotas, formulários de edição e detalhamentos de faturas terão fundos opacos e sólidos (com alto contraste em relação à tipografia).

## 3. Consequências

### Positivas:
- O contraste de cor e a acessibilidade da leitura de dados sensíveis (preços, CNPJs) estão 100% resguardados.
- O efeito *Glass* recupera seu sentido semântico: ele informa ao cérebro do usuário que aquele painel está "flutuando sobre a página principal", e não que ele foi enviado para uma página diferente (ancorando o usuário espacialmente).
- Menor uso intensivo da GPU para renderizar blurs profundos em toda a interface.

### Negativas:
- Exigirá extrema disciplina do time de design e frontend para não ceder à tentação estética de aplicar desfoques em cartões (cards) ou backgrounds genéricos de tabelas, o que desrespeitaria este ADR.
