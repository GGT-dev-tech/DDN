# Deployment Flow (Railway)

Este documento mapeia o fluxo completo (Pipeline) de um deploy da aplicação DDN Management, desde o push de código até o release em Produção. A infraestrutura do Railway foi projetada para ter Zero Downtime Deployments nativos.

## 1. Gatilho (Trigger)

O fluxo começa com um evento no repositório GitHub.
- **Push para a branch `main`**: Dispara automaticamente um deploy no ambiente de **Produção**.
- **Push para a branch `dev` / `staging`**: Dispara automaticamente um deploy nos ambientes de staging vinculados.

## 2. Fase de Build (Build Phase)

O Railway intercepta o evento e isola os três serviços lógicos (`backend`, `worker`, `frontend`).

- **Backend & Worker**:
  - O Railway identifica o `Dockerfile` ou usa *Nixpacks* baseado no diretório raiz do serviço.
  - Executa a resolução de dependências (`uv sync`).
  - Cachea as layers (requirements) para builds subsequentes rápidas.
- **Frontend**:
  - Executa `npm install` e `npm run build`.
  - Gera os assets estáticos de produção.

## 3. Fase de Pre-Deploy (Migrations)

Antes de redirecionar o tráfego para os novos containers, precisamos garantir que o banco de dados tem a estrutura correta.

- **Comando de Release (Release Command)**: 
  - O Railway permite configurar um `Release Command` nas configurações do Backend.
  - Configuração: `uv run alembic upgrade head`
  - **Ação**: O Railway vai subir um container temporário, aplicar a migração no banco de dados e aguardar a conclusão.
  - Se a migração falhar (crash), o deploy é **cancelado imediatamente**, e a versão antiga continua rodando intacta.

## 4. Fase de Deploy (Rollout)

- Os containers da nova versão sobem em paralelo aos da versão antiga.
- O Railway executa verificações contra o **Health Check** (rota `/health` no Backend).
- **Tráfego**: O roteador (Edge Network) do Railway corta magicamente as requisições que iriam para o container velho e aponta para o novo container.
- O Celery (Worker) antigo aguarda finalizar a task que está rodando (Warm Shutdown) e então desliga. O novo Worker assume a fila do Redis.

## 5. Falha e Rollback Automático

- Se a aplicação travar ao iniciar ou o `/health` retornar `500`, o Railway marca o deploy como **Failed**.
- O container antigo sequer é desligado. O usuário final não sente nenhum impacto.
- Para reverter manualmente uma versão, consulte `rollback.md`.
