import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('ims_user')
      const storedToken = localStorage.getItem('ims_access')
      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        setRole(parsed.role || null)
        setAccessToken(storedToken)
      }
    } catch {
      localStorage.removeItem('ims_user')
      localStorage.removeItem('ims_access')
      localStorage.removeItem('ims_refresh')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback((tokens, userData) => {
    localStorage.setItem('ims_access', tokens.access)
    localStorage.setItem('ims_refresh', tokens.refresh)
    localStorage.setItem('ims_user', JSON.stringify(userData))
    setAccessToken(tokens.access)
    setUser(userData)
    setRole(userData.role || null)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ims_access')
    localStorage.removeItem('ims_refresh')
    localStorage.removeItem('ims_user')
    setAccessToken(null)
    setUser(null)
    setRole(null)
    window.location.href = '/login'
  }, [])

  const value = useMemo(
    () => ({ user, role, accessToken, loading, login, logout }),
    [user, role, accessToken, loading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export default AuthContext
