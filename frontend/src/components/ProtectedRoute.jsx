import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'

export default function ProtectedRoute({ allowedRoles }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0f0f0f' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#CFFF00] border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
