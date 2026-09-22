import axios from 'axios'

const apiClient = axios.create({ baseURL: '/api' })


apiClient.interceptors.request.use(config => {
  const stored = localStorage.getItem('tauli_user')
  if (stored) {
    const { token } = JSON.parse(stored)
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient