import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { register as apiRegister, login as apiLogin } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ggsc_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const [token, setToken] = useState(() => localStorage.getItem('ggsc_token'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) localStorage.setItem('ggsc_token', token)
    else localStorage.removeItem('ggsc_token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('ggsc_user', JSON.stringify(user))
    else localStorage.removeItem('ggsc_user')
  }, [user])

  const register = useCallback(async (email, password, displayName) => {
    setLoading(true)
    try {
      const data = await apiRegister(email, password, displayName)
      setToken(data.token)
      setUser({ userId: data.userId, email: data.email, displayName: data.displayName })
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      setToken(data.token)
      setUser({ userId: data.userId, email: data.email, displayName: data.displayName })
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
