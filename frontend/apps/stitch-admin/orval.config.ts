import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      // In a real environment, this would point to the FastAPI openapi.json URL or a local file
      // target: '../../../../backend/openapi.json', 
      target: './openapi-mock.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/shared/api/generated',
      schemas: './src/entities/models',
      client: 'react-query',
      prettier: true,
      override: {
        mutator: {
          path: './src/shared/api/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
