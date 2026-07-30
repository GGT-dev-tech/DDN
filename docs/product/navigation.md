# DDN OS: Navigation (Sitemap e Comandos)

## 1. Objetivo

Diferente do *Product Blueprint* (que lista **o que** existe), o documento de Navigation define **como** o usuário viaja entre as telas. O objetivo da DDN OS é eliminar os cliques inúteis. A navegação será fluída, focada em "Command Palettes" e fluxos lineares in-context.

---

## 2. A Bússola Universal: Ctrl + K (Pesquisa Global)

A verdadeira barra de navegação de um usuário avançado não é o menu lateral, é o teclado.
Pressionar `Ctrl + K` (ou `Cmd + K`) invoca a **Command Palette**.

### Exemplo de Navegação por Comando:
```text
[Ctrl + K]
 > "Pesquisar Cliente"
 > (Digita "Acme Corp")
 > Seleciona "Acme Corp"
 ↓
Abre o Drawer lateral com o "Company Details".
```

### Exemplo de Navegação por Ação Direta:
```text
[Ctrl + K]
 > "Nova Cotação"
 ↓
Abre imediatamente o Modal/Wizard para iniciar a cotação.
```

A Command Palette deve sempre prever entidades (Clientes, Contratos, Placas de Veículos, Nomes de Motoristas) e Ações Globais.

---

## 3. Navegação Contextual por Domínio

Em vez de ir do Menu para uma Tela, e de uma Tela para Outra através de reloads completos de página, a navegação operacional se dá via drill-down contextual.

### Exemplo: Do Workspace à Operação
```text
Workspace
 ↓ (Clica no alerta: "3 Contratos Aguardando Plano")
Tabela de Contratos Pendentes (Side Panel desliza sobre o Workspace)
 ↓ (Clica em um Contrato)
Contract Details (Abre a quebra detalhada do contrato)
 ↓ (Clica em "Gerar Plano")
Wizard de Geração de Plano de Serviço
```

### Exemplo: Da Operação à Coleta Final
```text
Routes (Visualizando lista de rotas do dia)
 ↓ (Clica em "Rota R-402")
Route Details (Drawer lateral exibindo mapa no topo e lista de paradas embaixo)
 ↓ (Clica na Parada "Cliente Beta")
Collection Details (Visualiza a foto do resíduo e peso inserido pelo motorista)
```

---

## 4. O Sidebar (Menu Lateral)

O menu lateral existe, mas deve ser **discreto e colapsável** (ícones). Ele reflete estritamente os Domínios de Negócio listados no Business Architecture:

1. **Workspace** (Home)
2. **Operação** (Acesso a Planos, Rotas e Agendas)
3. **Comercial** (Leads, Clientes, Cotações e Contratos)
4. **Compliance** (MTRs, CDFs e Licenças)
5. **Financeiro** (Faturamento)
6. **Analytics** (Painéis Macro)
7. **Cadastros** (A área técnica de catálogos e parâmetros)
8. **Administração** (Acessos restritos de configurações)

O Sidebar não contém submenus *infinitos* voando pela tela. Clicar em "Comercial" direciona o usuário a uma tela inicial do comercial, onde as abas (Tabs) ou navegação interna cuidam do resto, preservando a sanidade visual.

---

## Dependências
- Depende de: `docs/product/product_blueprint.md`.

## Impacto nas Próximas Fases
Este documento define diretamente:
- `docs/frontend/ux_architecture.md` (Pois demanda tecnicamente a existência do Side Panel e da Command Palette).
- A estrutura de roteamento do **Next.js** (onde pastas representarão as rotas âncora, e parâmetros de URL como `?drawer=company_123` controlarão o drill-down).
