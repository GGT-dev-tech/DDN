import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/auth/login', async ({ request }) => {
    // We can parse the body here to simulate failure, but we'll always return success for MSW
    return HttpResponse.json({
      access_token: "mock-jwt-access-token",
      refresh_token: "mock-jwt-refresh-token",
      token_type: "bearer"
    });
  }),
  http.get('/auth/me', () => {
    return HttpResponse.json({
      id: "usr-admin-1",
      email: "admin@goauct.com",
      status: "ACTIVE",
      created_at: "2024-01-01T00:00:00Z"
    });
  }),
  http.post('/api/v1/contracts', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      id: `ctr-${Math.random().toString(36).substr(2, 9)}`,
      quotation_id: data.quotation_id,
      customer_id: data.company_id,
      status: "DRAFT",
      created_at: new Date().toISOString(),
      valid_until: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
    });
  }),
  http.get('/api/v1/contracts', () => {
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
  http.get('/api/v1/service-plans/contract/:contractId', ({ params }) => {
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
  http.post('/api/v1/service-plans/:planId/publish', ({ params }) => {
    return HttpResponse.json({
      id: params.planId,
      status: "ACTIVE",
      version: 1
    });
  }),
  http.post('/api/v1/service-plans/:planId/suspend', ({ params }) => {
    return HttpResponse.json({
      id: params.planId,
      status: "SUSPENDED",
      version: 1
    });
  }),
  http.get('/api/v1/routes', () => {
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
  http.get('/api/v1/routes/:routeId', ({ params }) => {
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
  // NEW: Mock for creating a route
  http.post('/api/v1/routes', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      id: `rt-${Math.random().toString(36).substr(2, 9)}`,
      execution_date: data.execution_date,
      status: "PLANNED",
      estimated_volume: data.estimated_volume || 0,
      estimated_weight: data.estimated_weight || 0,
      planned_distance: data.planned_distance || 0,
      planned_duration: data.planned_duration || 0,
    });
  }),
  // NEW: Mock for assigning resources to a route
  http.post('/api/v1/routes/:routeId/assign', async ({ request, params }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      id: params.routeId,
      vehicle_id: data.vehicle_id,
      driver_id: data.driver_id,
    });
  }),
  // NEW: Mock for adding a stop to a route
  http.post('/api/v1/routes/:routeId/stops', async ({ request, params }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      id: `stp-${Math.random().toString(36).substr(2, 9)}`,
      route_id: params.routeId,
      ...data,
      status: "PENDING"
    });
  }),
];
