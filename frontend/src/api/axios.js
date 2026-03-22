import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1/',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ims_access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ims_access')
      localStorage.removeItem('ims_refresh')
      localStorage.removeItem('ims_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
