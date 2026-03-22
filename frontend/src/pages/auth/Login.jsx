import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Mail } from 'lucide-react'
import api from '@/api/axios'
import { useAuth } from '@/context/AuthContext.jsx'

const TABS = [
  { label: 'Student', value: 'student' },
  { label: 'Company', value: 'company' },
  { label: 'Staff', value: 'supervisor' },
]

const REDIRECTS = {
  student: '/student/dashboard',
  company: '/company/dashboard',
  supervisor: '/supervisor/dashboard',
  coordinator: '/coordinator/dashboard',
  admin: '/admin/dashboard',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [activeRole, setActiveRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      console.log('[Login] Payload:', { username: email, password, role: activeRole })
      const res = await api.post('/auth/login/', { username: email, password, role: activeRole })
      const { tokens, user } = res.data
      login(tokens, user)
      const dest = REDIRECTS[user.role] || '/'
      console.log('[Login] Redirect →', dest)
      navigate(dest)
    } catch (err) {
      const data = err?.response?.data
      const msg = data?.detail || data?.message || (typeof data === 'string' ? data : 'Login failed. Please check your credentials.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: '#0f0f0f' }}>
      <div className="w-full max-w-md rounded-3xl border p-8" style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: '#4a5a00' }}>
            <GraduationCap className="h-7 w-7" style={{ color: '#CFFF00' }} />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-white">Welcome Back</h1>
        <p className="mt-1 text-center text-sm" style={{ color: '#888888' }}>
          Sign in to the Internship Management System
        </p>

        {/* Role Tabs */}
        <div className="mt-6 rounded-xl p-1" style={{ background: '#2a2a2a' }}>
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveRole(tab.value)}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors"
                style={{
                  background: activeRole === tab.value ? '#CFFF00' : 'transparent',
                  color: activeRole === tab.value ? '#000' : '#888888',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#888888' }}>
              Institutional Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-transparent px-4 py-3 pr-11 text-white placeholder-[#555] outline-none transition-colors focus:border-[#CFFF00]"
                style={{ background: '#2a2a2a' }}
              />
              <Mail className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#888888' }} />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: '#888888' }}>Password</label>
              <button type="button" className="text-xs font-medium" style={{ color: '#CFFF00' }}>
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-transparent px-4 py-3 pr-11 text-white placeholder-[#555] outline-none transition-colors focus:border-[#CFFF00]"
                style={{ background: '#2a2a2a' }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: '#888888' }}
              >
                {showPw ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <p className="rounded-lg px-3 py-2 text-center text-sm text-red-400" style={{ background: '#450a0a' }}>{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-bold transition-all hover:brightness-90 disabled:opacity-50"
            style={{ background: '#CFFF00', color: '#000' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: '#888888' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium" style={{ color: '#CFFF00' }}>Contact Admin</Link>
        </p>
      </div>
    </div>
  )
}
