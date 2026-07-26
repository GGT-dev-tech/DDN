# Filtros (Filters)

O uso de filtros em ERPs garante produtividade. Todos os List Views no sistema adotam este padrão:

## 1. Quick Filters (Filtros Rápidos)

Filtros frequentemente usados ficam sempre visíveis no cabeçalho das tabelas, acima das colunas.
- Rendemizados como botões tipo `Pill` ou `Toggle Group`.
- Exemplo na tela de Oportunidades: Botões [Abertas] [Fechadas] [Minhas Oportunidades]. Um clique faz a filtragem (Push state para URL).

## 2. Global Toggles

Botões do tipo `Switch` (Toggle) para visões absolutas na barra de ações secundária.
- Exemplo: Chavear visualização de *Tabela* para *Kanban*.
- Exemplo: Ocultar itens Inativos (`Show Inactive = False` padrão).

## 3. Advanced Filters (Filtros Avançados)

Filtros combinados ou campos complexos ficam escondidos dentro de um `Drawer` lateral acionado pelo botão "Filtros".
- Formulário permitindo cruzamento (AND/OR). Ex: "Tamanho de Empresa: Grande" AND "Setor: Saúde" AND "Período: Últimos 30 dias".
- Quando o usuário aplica um Filtro Avançado, o Drawer fecha, e a UI exibe um `Pill` de filtro ativo na tabela, com um "X" para removê-lo rapidamente.

## 4. Persistência de Filtro

Para não frustrar o usuário, o estado do filtro deve refletir na URL via `searchParams` do React Router (ex: `?status=open&date=last30`).
- Ao dar F5, o filtro permanece.
- Se possível, o último estado de filtro do usuário na tabela é salvo no `localStorage` por sessão, para que ao navegar e voltar, a tabela não resete completamente.
