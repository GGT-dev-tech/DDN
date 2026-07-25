import { http, HttpResponse, delay } from 'msw'

export const handlers = [
  // Mocking Backend Auth Route
  http.post('*/api/v1/auth/login', async () => {
    await delay(800) // Simulate network latency
    return HttpResponse.json({
      access_token: 'mock-jwt-token-xyz',
      token_type: 'bearer',
      user: {
        id: '123',
        name: 'Stitch Admin',
        role: 'admin',
      },
    })
  }),

  // Mocking Routes Dashboard
  http.get('*/api/v1/routes', async () => {
    await delay(1200)
    return HttpResponse.json([
      {
        id: 'rte-001',
        status: 'in_progress',
        vehicle_id: 'veh-999',
        driver_name: 'Carlos Santos',
        stops_count: 45,
        progress: 12,
      },
      {
        id: 'rte-002',
        status: 'pending',
        vehicle_id: 'veh-888',
        driver_name: 'Ana Silva',
        stops_count: 30,
        progress: 0,
      }
    ])
  })
]
