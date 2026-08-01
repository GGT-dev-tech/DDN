# Rollback Manual (Railway)

Embora o Railway possua falha protetora (não sobe a aplicação se a nova versão crashar no Health Check), erros lógicos de negócio podem escapar para Produção e requererem Rollback de Versão.

## 1. Rollback Rápido de Aplicação (Código)
Se o problema for apenas lógica no Backend, Worker ou Frontend, e **não envolver** esquema do banco de dados:

1. Acesse o projeto no Railway Dashboard.
2. Navegue até a aba **Deployments** do serviço específico.
3. Encontre o card verde da versão anterior que estava estável.
4. Clique no ícone de "Options" (3 pontinhos) e selecione **Rollback**.
5. O Railway subirá imediatamente a imagem container dessa versão e fará o roteamento de borda. Isso resolve a crise em ~30 segundos.

## 2. Rollback Severo (Migrations)
Se a versão que subiu incluiu uma **Migration do banco de dados** que mudou a estrutura destrutivamente (ex: drop columns) e causou downtime:

1. O botão "Rollback" no Railway não desfaz a estrutura do Postgres automaticamente, pois os dados são persistentes.
2. Primeiro, execute um downgrade via CLI ou no console do container:
   ```bash
   uv run alembic downgrade -1
   ```
3. Apenas após a mensagem de sucesso da restauração do schema, acione o Rollback da aplicação no painel.

## 3. Rollback Local (Fix-Forward)
Em equipes estruturadas, o "Rollback" clássico é desencorajado. A preferência é pelo **Fix-Forward**:
1. Crie uma branch quente (`hotfix/vXYZ`).
2. Inverta os commits problemáticos via `git revert`.
3. Force o push na `main`. A esteira (Pipeline CI/CD) resolverá a crise com rastreabilidade total.
