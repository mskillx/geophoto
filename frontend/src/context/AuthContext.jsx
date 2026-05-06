import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/api/auth/me', { _skipRedirect: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password })
    setUser(res.data.user)
    return res.data
  }

  const register = async (username, email, password) => {
    const res = await api.post('/api/auth/register', { username, email, password })
    return res.data
  }

  const logout = async () => {
    await api.post('/api/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
