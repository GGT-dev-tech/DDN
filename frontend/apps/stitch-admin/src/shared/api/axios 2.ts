import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
})

// Optional interceptors
axiosInstance.interceptors.request.use((config) => {
  return config
})

// Orval Mutator Function
export const customAxiosInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const response = await axiosInstance({
    ...config,
    ...options,
  })
  return response.data
}

export default axiosInstance
