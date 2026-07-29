import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
if (apiBaseUrl && !apiBaseUrl.startsWith('http')) {
  apiBaseUrl = `https://${apiBaseUrl}`
}

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
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
