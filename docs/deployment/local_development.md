# Ambiente Local (Local Development)

Este projeto utiliza **Docker Compose** para orquestrar os serviços locais e emular a arquitetura Railway, permitindo um loop de feedback instantâneo.

## 1. Pré-Requisitos
- Docker Engine & Docker Compose
- `uv` (Package manager Python ultrarrápido)
- Node.js v20+

## 2. Configurando o Ambiente
Copie todos os `.env.example` para `.env` locais:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp worker/.env.example worker/.env
```

## 3. Subindo a Infraestrutura (DB & Redis)
Antes de rodar a API, certifique-se de que os bancos existem. O `docker-compose.dev.yml` provê imagens enxutas.
```bash
docker compose -f docker-compose.dev.yml up -d
```
Verifique se as portas 5432 (Postgres) e 6379 (Redis) estão ativas e se os dados estão persistindo nos volumes locais.

## 4. Subindo o Backend & Worker Local
Para desenvolvimento rápido, você pode rodar fora do Docker usando o `uv`:
```bash
# Terminal 1 - Migrations e API
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn apps.api_gateway.src.main:app --reload

# Terminal 2 - Worker
cd worker
uv sync
uv run celery -A worker.app worker -l INFO
```

## 5. Subindo o Frontend
O frontend suporta Fast Refresh via Vite.
```bash
cd frontend
npm install
npm run dev
```
Acesse `http://localhost:5173`. O Mock Service Worker (MSW) assumirá o controle se a variável ambiente correspondente estiver habilitada, permitindo desenvolver mesmo com a API offline.
