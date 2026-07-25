import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: {
      // Usa a API Real rodando localmente (VITE_API_MODE=real)
      // O CI pode sobrescrever passando --input openapi.json localmente se necessário
      target: 'http://localhost:8000/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/shared/api/generated/endpoints.ts',
      schemas: 'src/shared/api/generated/model',
      client: 'react-query',
      prettier: true,
      override: {
        mutator: {
          path: 'src/shared/api/axios.ts',
          name: 'customAxiosInstance',
        },
      },
    },
  },
})
