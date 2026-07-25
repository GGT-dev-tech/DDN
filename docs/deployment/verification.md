# Deployment Verification Checkpoint (v0.5.3)

Após o primeiro deploy real no Railway foram encontrados e resolvidos problemas relacionados à configuração de portas:

## Backend
- **Causa**: Variável `API_PORT` configurada manualmente como "$PORT" no Railway.
- **Impacto**: O Pydantic Settings falhava ao converter a string para inteiro (`input_value='$PORT'`), impedindo o boot.
- **Correção**: Remoção da variável manual e utilização da injeção nativa pelo script `start.sh`.

## Frontend
- **Causa**: Build Vite não estava servindo as rotas corretamente.
- **Impacto**: Aplicação não carregava.
- **Correção**: Configuração de domínio/porta injetados na imagem Docker utilizando Node `serve` (`-l $PORT`).

## Resultado
- **Frontend** acessível publicamente.
- **Backend** respondendo corretamente em `/health/live` e `/openapi.json`.
- Healthcheck de todos os containers aprovado.
- Infraestrutura estabilizada, pronta para a Sprint 6.
