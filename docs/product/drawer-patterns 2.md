# Padrões de Drawer (Side Panels)

O uso de Drawers (Side Panels / Modais laterais) é um padrão arquitetural chave neste sistema para evitar mudanças de contexto severas (pulo de abas) durante tarefas de fluxo contínuo.

## 1. Quando usar Drawers vs. Páginas Completas

### Usar Drawer quando:
- **Criação Rápida (Quick Create):** Formulários curtos como "Novo Lead", "Novo Contato", "Adicionar Local de Serviço".
- **Visualização de Contexto Parcial:** Visualizar detalhes de um "Lead" sem sair da Lista de Leads. Ver detalhes de uma "Service Order" enquanto olha o Mapa de Roteirização.
- **Edição Direta:** Alterar status de uma Oportunidade ou adicionar uma atividade rápida na Timeline.

### Usar Página Completa quando:
- **Hub de Dados (Company Hub):** Perfis ricos com dezenas de tabelas aninhadas, como o Perfil do Cliente.
- **Wizards Complexos:** Criação de um Orçamento (Quotation Builder), que requer múltiplos passos e seleções longas de itens de catálogo.
- **Dashboards e Mapas:** Onde o consumo de espaço horizontal na tela é essencial.

## 2. Anatomia de um Drawer

Um Drawer deve conter:
- **Header Fixado:** Título da ação ou nome da entidade, botão de `X` (fechar) e botões de Ação Primária (ex: "Salvar") fixos.
- **Scroll Area Central:** Onde reside o formulário ou a informação detalhada.
- **Timeline Sidebar Interna (Opcional):** Se o Drawer visualizar um Lead, o lado direito do próprio Drawer pode exibir abas enxutas de histórico.

## 3. Gestão de Estado (URL)

Drawers de Entidades (ex: Visualizar Lead ID 123) devem refletir na URL via `query parameters` (ex: `?lead_id=123`) para que links possam ser compartilhados no Slack/E-mail e abram o List View com o Drawer correto já aberto. Formulários de criação vazios não precisam alterar a URL.
