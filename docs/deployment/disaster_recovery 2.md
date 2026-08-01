# Disaster Recovery (DR)

Se as instâncias do Railway colapsarem, ou se uma corrupção em larga escala afetar a integridade dos dados e da nuvem, este documento estabelece as bases de recuperação e Point-In-Time-Recovery (PITR).

## Nível 1: Worker Falhou Massivamente (Fila Cheia)
Se o Worker do Celery crashar e o Redis/RabbitMQ encher de mensagens paradas, e a tabela de Outbox saturar:
- **Ação:** Nenhuma transação primária do banco é perdida. A arquitetura DDD + Unit Of Work + Outbox segura os eventos de domínio localmente no Postgres (Estado "PENDING").
- **Recuperação:** Suba o Worker. Ele retomará o processamento assíncrono exatamente de onde parou. Eventos expirados ("EXPIRED") poderão ser reprocessados manualmente pela interface de Admin.

## Nível 2: Drop Acidental ou Corrupção de Dados
Se um DROP TABLE / DELETE malicioso atingir o PostgreSQL ou se houver corrupção física do plugin do Railway:
- **Ação:** O Railway (nos Planos Pagos) faz retenção automática via EBS Snapshots (Continuous Archiving).
- **Recuperação:** 
  1. Vá ao Database Service no Railway.
  2. Clique na engrenagem (Settings) -> Backup & Restore.
  3. Restaure para o exato minuto anterior ao incidente (PITR - Point In Time Recovery).

## Nível 3: Lock Exclusivo no Banco (Deadlocks)
Se a fila trancar por query não indexada, e ocorrer Connection Pool Exhausted:
- **Ação:** Use o comando de observação nativo.
  ```sql
  SELECT pid, pg_blocking_pids(pid) as blocked_by, query as blocked_query
  FROM pg_stat_activity
  WHERE cardinality(pg_blocking_pids(pid)) > 0;
  ```
- **Recuperação:** Identifique os PIDs ofensores e rode `SELECT pg_terminate_backend(pid);`. A transação do UoW fará rollback (segurança atômica). Escale os limites (RAM/Pool Size) no painel de recursos.
