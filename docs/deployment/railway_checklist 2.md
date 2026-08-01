# Checklist de Deploy (Railway)

Sempre que a infraestrutura escalar ou houver um deploy massivo em produção, cruze esta lista para garantir resiliência operacional.

### 1. Variáveis Obrigatórias
- [ ] O `JWT_SECRET` é complexo e criptograficamente seguro?
- [ ] As variáveis de CORS (`CORS_ORIGINS`) estão configuradas e restritas aos domínios de produção?
- [ ] O Frontend aponta o `VITE_API_URL` para o link HTTPS final do Backend?

### 2. Bancos e Infra
- [ ] **Health Check**: Rota `/health` retorna `200 OK` na web de produção?
- [ ] **Migrations**: O deploy executou `alembic upgrade head` com sucesso? O log de "Release" na aba Deployments está verde?
- [ ] **Worker**: O container do Celery está registrando os workers e as filas (celery@worker) apareceram?
- [ ] **Redis**: A fila do Redis não está enfileirando (backlog) sem consumo? A latência está saudável?

### 3. Segurança e Políticas
- [ ] **Row Level Security (RLS)**: Os comandos executados não estão rodando como super-user bypassando a autorização do banco (Validar migration `03c857080c20`)?
- [ ] **Seeds**: Os tenants padrão/super-admins iniciais foram seedados sem expor credenciais hardcoded?
- [ ] **SSL**: O Railway gerou o certificado Let's Encrypt para todos os domínios customizados (Frontend e API)?

### 4. Contingência
- [ ] Existe plano de Rollback 1-click validado no Railway?
- [ ] Há backups automatizados (Automated Backups) ativados no PostgreSQL via painel do Railway (retenção de 7 dias)?
