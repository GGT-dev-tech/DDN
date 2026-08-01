# Environment Variables Matrix

Esta matriz é o check de segurança definitivo para deploy. Variáveis com "✓" indicam obrigatoriedade para o serviço iniciar e operar corretamente.

| Variável | Backend | Frontend | Worker | Origem (Railway) | Obrigatória |
| --- | --- | --- | --- | --- | --- |
| **`DATABASE_URL`** | ✓ | | ✓ | PostgreSQL Plugin | SIM |
| **`REDIS_URL`** | ✓ | | ✓ | Redis Plugin | SIM |
| **`JWT_SECRET`** | ✓ | | | Manual | SIM |
| **`VITE_API_URL`** | | ✓ | | Domínio Público do Backend | SIM |
| **`VITE_API_MODE`** | | ✓ | | Manual (Padrão: `real`) | NÃO |
| **`CORS_ORIGINS`** | ✓ | | | Manual (ex: Domínio do Frontend) | SIM |
| **`BROKER_URL`** | | | ✓ | Referência ao REDIS_URL | SIM |
| **`APP_ENV`** | ✓ | | ✓ | Manual (`production`) | NÃO |
| **`SENTRY_DSN`** | ✓ | ✓ | ✓ | Manual | NÃO |
| **`OTEL_EXPORTER_OTLP_ENDPOINT`** | ✓ | | ✓ | Manual | NÃO |
| **`VITE_MAP_PROVIDER`** | | ✓ | | Manual (`google` ou `mapbox`) | NÃO |
| **`VITE_GOOGLE_MAPS_KEY`** | | ✓ | | Manual | NÃO |

> [!WARNING]
> Nunca versione (`git add`) arquivos `.env` contendo as credenciais listadas acima.
> Use apenas `.env.example`.
