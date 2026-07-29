module.exports = {
  ddn_management: {
    input: '../../../backend/openapi.json',
    output: {
      mode: 'tags-split',
      target: 'src/generated/api.ts',
      schemas: 'src/generated/model',
      client: 'fetch',
      mock: true,
      override: {
        mutator: {
          path: './src/custom-client.ts',
          name: 'customClient',
        },
      },
    },
  },
};
