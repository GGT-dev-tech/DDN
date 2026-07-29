import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('http://localhost:3000/auth/login', async ({ request }) => {
    // We can parse the body here to simulate failure, but we'll always return success for MSW
    return HttpResponse.json({
      access_token: "mock-jwt-access-token",
      refresh_token: "mock-jwt-refresh-token",
      token_type: "bearer"
    });
  }),
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
