# Pesquisa (Search Behavior)

A pesquisa é a maneira mais rápida do usuário sênior navegar no ERP. O sistema divide a pesquisa em dois âmbitos: Global e Contextual.

## 1. Pesquisa Global (Omnibox)

Posicionada no meio da Topbar superior, visível de qualquer tela.
- Acionamento rápido via atalho `Cmd+K` ou `Ctrl+K` (Pallete Command).
- **Comportamento:** Ao focar/digitar, o componente abre uma lista suspensa (dropdown) separada por Contextos Transversais.
- O backend usa indexação flexível para varrer:
  - Nomes e CNPJs de `Company` (ex: ao digitar um CNPJ formata automático).
  - Títulos de `Opportunity` ou ID do Orçamento (ex: `ORC-1002`).
  - Placa de `Vehicle` (Frota).
- **Ação:** O clique em um resultado leva o usuário para a Detail Page (Full Page ou aciona o Drawer apropriado baseado na página atual).

## 2. Pesquisa Contextual (Tabela Local)

Posicionada diretamente acima de um componente de Lista/Grid específico.
- Foca apenas na coleção que o usuário está visualizando.
- Exemplo: Uma pesquisa no Kanban de Leads buscará APENAS Leads. Uma busca dentro da aba "Service Locations" da Company buscará apenas os locais *daquela* empresa.
- **Implementação Técnica:** A pesquisa contextual sofre `debounce` de 300ms. Não deve necessitar de clique num botão de lupa ou pressionar "Enter" (Live Filtering via React Query).
