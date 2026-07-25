import axios from 'axios'

export const customAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
})

// Optional interceptors
customAxiosInstance.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token')
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`
  // }
  return config
})

export default customAxiosInstance
