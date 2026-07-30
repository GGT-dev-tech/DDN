module.exports = {
  ddn_management: {
    input: './openapi.json',
    output: {
      mode: 'tags-split',
      target: 'src/generated/api.ts',
      schemas: 'src/generated/model',
      client: 'react-query',
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
