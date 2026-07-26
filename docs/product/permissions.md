# Permissões e Perfis de Acesso (RBAC & UI)

A estrutura de segurança do sistema adota Controle de Acesso Baseado em Funções (Role-Based Access Control - RBAC). As permissões não apenas bloqueiam endpoints da API, mas modelam profundamente a UI.

## 1. Mapeamento de UI por Role

O sistema não deve frustrar o usuário exibindo botões que ele não tem permissão para usar.

### Padrão de "Graceful Degradation"
- Se um usuário (ex: Operador Base) não tem permissão de `UPDATE` sobre Oportunidades:
  - O Drawer de Oportunidades abrirá normalmente em modo de **Apenas Leitura (Read-Only)**.
  - Inputs serão renderizados como texto ou campos `disabled`.
  - O botão "Salvar" ficará invisível.
- Se não possui permissão de `DELETE`, o ícone de lixeira e as ações massivas de exclusão da tabela não serão renderizados.

## 2. Visão Geográfica / Particionamento

Certos papéis possuem restrições lógicas de dados na UI, indo além das telas que podem acessar.
- **Gerente Comercial - Região Sul:** A Lista de Clientes e a busca global omitirão clientes das demais regiões (Filtro mandatório anexado via JWT Token -> ORM Tenant/Row-Level Security).
- **Vendedor Júnior:** Enxergará apenas seus Leads no funil.

## 3. Gestão de Roles (Admin Settings)

Na tela de `Settings -> Users & Roles`, administradores (Master Tenant Admin) poderão visualizar uma Matriz rica de Permissões:
- Colunas: Módulos (Commercial, Catalog, Pricing, Operations).
- Linhas: Funções Criadas (Admin, Vendedor, Despachante).
- Células: Checkboxes permitindo ações (Create, Read, Update, Delete, Export).
- Apenas usuários com `Master Admin` enxergam a engrenagem de configurações na Sidebar Global.
