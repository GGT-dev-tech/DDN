import { axiosInstance } from './axios'

export interface DispatchRequest {
  service_order_ids: string[]
  execution_date: string
  vehicle_id?: string
  driver_id?: string
}

export interface DispatchResponse {
  route_id: string
  message: string
}

export const logisticsApi = {
  dispatchOrders: async (data: DispatchRequest): Promise<DispatchResponse> => {
    const response = await axiosInstance.post('/api/v1/logistics/dispatch', data)
    return response.data
  }
}
