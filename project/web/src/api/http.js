import axios from 'axios'

export const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const http = axios.create({
  baseURL: apiBase,
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || '网络请求失败'
    error.friendlyMessage = message
    return Promise.reject(error)
  }
)

export default http
