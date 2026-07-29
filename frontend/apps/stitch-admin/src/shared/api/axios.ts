import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
if (apiBaseUrl && !apiBaseUrl.startsWith('http')) {
  apiBaseUrl = `https://${apiBaseUrl}`
}

// Railway sometimes sets VITE_API_URL to include /api/v1.
// Since our OpenAPI paths now include /api/v1 natively, we must strip it from the base URL.
if (apiBaseUrl.endsWith('/api/v1')) {
  apiBaseUrl = apiBaseUrl.replace('/api/v1', '')
}
if (apiBaseUrl.endsWith('/api/v1/')) {
  apiBaseUrl = apiBaseUrl.replace('/api/v1/', '')
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
