import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Don't redirect for auth endpoints or if already on auth pages
    const isAuthEndpoint = err.config?.url?.includes('/auth/')
    const isAuthPage = ['/login', '/register'].includes(window.location.pathname)

    if (err.response?.status === 401 && !isAuthEndpoint && !err.config?._skipRedirect && !isAuthPage) {
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
