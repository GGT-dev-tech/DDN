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

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('stitch_access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 Unauthorized globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if not already there
      localStorage.removeItem('stitch_access_token')
      localStorage.removeItem('stitch_refresh_token')
      
      // Avoid infinite redirects if already on login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

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
