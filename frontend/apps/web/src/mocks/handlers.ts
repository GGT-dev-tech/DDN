import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost:3000/api/v1/service-plans/contract/:contractId', ({ params }) => {
    return HttpResponse.json([
      {
        id: "sp-1234",
        contract_id: params.contractId,
        status: "ACTIVE",
        version: 2,
      },
      {
        id: "sp-5678",
        contract_id: params.contractId,
        status: "DRAFT",
        version: 1,
      },
      {
        id: "sp-9012",
        contract_id: params.contractId,
        status: "SUSPENDED",
        version: 4,
      }
    ]);
  }),
];
