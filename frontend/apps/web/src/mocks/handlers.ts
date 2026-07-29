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
  http.get('http://localhost:3000/auth/me', () => {
    return HttpResponse.json({
      id: "usr-admin-1",
      email: "admin@goauct.com",
      status: "ACTIVE",
      created_at: "2024-01-01T00:00:00Z"
    });
  }),
  http.get('http://localhost:3000/api/v1/contracts', () => {
    return HttpResponse.json([
      {
        id: "ctr-abc1",
        quotation_id: "quo-xyz9",
        customer_id: "cust-101",
        status: "ACTIVE",
        created_at: "2024-02-10T10:00:00Z",
        valid_until: "2025-02-10T10:00:00Z"
      },
      {
        id: "ctr-abc2",
        quotation_id: "quo-xyz8",
        customer_id: "cust-102",
        status: "DRAFT",
        created_at: "2024-03-15T14:30:00Z",
        valid_until: "2025-03-15T14:30:00Z"
      }
    ]);
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
  http.post('http://localhost:3000/api/v1/service-plans/:planId/publish', ({ params }) => {
    return HttpResponse.json({
      id: params.planId,
      status: "ACTIVE",
      version: 1
    });
  }),
  http.post('http://localhost:3000/api/v1/service-plans/:planId/suspend', ({ params }) => {
    return HttpResponse.json({
      id: params.planId,
      status: "SUSPENDED",
      version: 1
    });
  }),
  http.get('http://localhost:3000/api/v1/routes', () => {
    return HttpResponse.json([
      {
        id: "rt-1234",
        execution_date: new Date().toISOString(),
        status: "PLANNED",
        estimated_volume: 120,
        estimated_weight: 850,
        planned_distance: 45,
        planned_duration: 120,
        vehicle_id: "veh-99",
        driver_id: "drv-01",
        stops: [
          {
            id: "stp-1",
            latitude: -23.55052,
            longitude: -46.633308,
            address: "Av. Paulista, 1000",
            order: 1,
            status: "PENDING"
          },
          {
            id: "stp-2",
            latitude: -23.56111,
            longitude: -46.65611,
            address: "Rua Augusta, 500",
            order: 2,
            status: "PENDING"
          }
        ]
      }
    ]);
  }),
  http.get('http://localhost:3000/api/v1/routes/:routeId', ({ params }) => {
    return HttpResponse.json({
      id: params.routeId,
      execution_date: new Date().toISOString(),
      status: "IN_PROGRESS",
      estimated_volume: 120,
      estimated_weight: 850,
      planned_distance: 45,
      planned_duration: 120,
      vehicle_id: "veh-99",
      driver_id: "drv-01",
      stops: [
        {
          id: "stp-1",
          latitude: -23.55052,
          longitude: -46.633308,
          address: "Av. Paulista, 1000",
          order: 1,
          status: "COLLECTED"
        },
        {
          id: "stp-2",
          latitude: -23.56111,
          longitude: -46.65611,
          address: "Rua Augusta, 500",
          order: 2,
          status: "ARRIVED"
        },
        {
          id: "stp-3",
          latitude: -23.57111,
          longitude: -46.67611,
          address: "Av. Faria Lima, 2000",
          order: 3,
          status: "PENDING"
        }
      ]
    });
  }),
];
