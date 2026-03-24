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

const roleMap = {
  Student: 'student',
  Company: 'company',
  Staff: 'supervisor',
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

  const selectedRole = TABS.find((t) => t.value === activeRole)?.label ?? activeRole

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    const roleToSend = roleMap[selectedRole] || String(activeRole).toLowerCase()

    console.log('=== LOGIN ATTEMPT ===')
    console.log('Email:', email)
    console.log('Role tab selected:', selectedRole)
    console.log('Role being sent:', roleToSend)

    try {
      /** JWT expects `username`; backend resolves email-in-username to real username */
      const response = await api.post('/auth/login/', {
        username: email.trim(),
        password,
        role: roleToSend,
      })

      console.log('=== LOGIN SUCCESS ===')
      console.log('Response data:', response.data)

      const token = response.data.access || response.data.token
      const refresh = response.data.refresh
      const user = response.data.user || response.data
      const userRole = user?.role || roleToSend

      console.log('Token:', token)
      console.log('User role:', userRole)

      if (!token || !user) {
        setError('Invalid login response from server.')
        return
      }

      login({ access: token, refresh: refresh ?? '' }, user)

      if (userRole === 'student') navigate('/student/dashboard')
      else if (userRole === 'supervisor') navigate('/supervisor/dashboard')
      else if (userRole === 'company') navigate('/company/dashboard')
      else if (userRole === 'coordinator') navigate('/coordinator/dashboard')
      else if (userRole === 'admin') navigate('/admin/dashboard')
      else navigate('/student/dashboard')
    } catch (err) {
      console.log('=== LOGIN ERROR ===')
      console.log('Status:', err.response?.status)
      console.log('Error data:', err.response?.data)

      const errData = err.response?.data
      if (errData?.detail) {
        setError(typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail))
      } else if (errData?.non_field_errors) {
        setError(errData.non_field_errors[0])
      } else if (errData) {
        setError(JSON.stringify(errData))
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '16px',
      backgroundColor: '#0f0f0f',
      background: 'radial-gradient(ellipse at top left, #1a2a00 0%, #0f0f0f 60%)',
    }}>
      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420, borderRadius: 24, padding: 32,
        backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
      }}>
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            backgroundColor: '#4a5a00', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={32} style={{ color: '#CFFF00' }} />
          </div>
        </div>

        {/* Heading */}
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, textAlign: 'center', margin: 0 }}>
          Welcome Back
        </h1>
        <p style={{ color: '#888', fontSize: 14, textAlign: 'center', margin: '8px 0 32px' }}>
          Sign in to the Internship Management System
        </p>

        {/* Role Tabs */}
        <div style={{ backgroundColor: '#2a2a2a', borderRadius: 12, padding: 4, display: 'flex', marginBottom: 24 }}>
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveRole(tab.value)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeRole === tab.value ? '#CFFF00' : 'transparent',
                color: activeRole === tab.value ? '#000' : '#888',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit()
          }}
        >
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#fff', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
              Institutional Email
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a',
              borderRadius: 12, padding: '12px 16px',
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="student@university.edu"
                style={{
                  flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none',
                  color: '#fff', fontSize: 14, fontFamily: 'inherit',
                }}
              />
              <Mail size={16} style={{ color: '#888', flexShrink: 0 }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>Password</label>
              <span style={{ color: '#CFFF00', fontSize: 13, cursor: 'pointer' }}>Forgot password?</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a',
              borderRadius: 12, padding: '12px 16px',
            }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{
                  flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none',
                  color: '#fff', fontSize: 14, fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                {showPw
                  ? <EyeOff size={16} style={{ color: '#888' }} />
                  : <Eye size={16} style={{ color: '#888' }} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{
              color: '#f87171', fontSize: 14, textAlign: 'center',
              backgroundColor: '#450a0a', borderRadius: 8, padding: '8px 12px',
              marginBottom: 16,
            }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={loading}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
              backgroundColor: '#CFFF00', color: '#000', fontWeight: 700,
              fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.opacity = '1' }}
          >
            {loading ? 'Signing in...' : 'Sign In  →'}
          </button>
        </form>

        {/* Footer text */}
        <p style={{ color: '#888', fontSize: 14, textAlign: 'center', marginTop: 24 }}>
          Don&apos;t have an account?{' '}
          <span style={{ color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Contact Admin</span>
        </p>
      </div>

      {/* Copyright */}
      <p style={{ color: '#555', fontSize: 12, marginTop: 32 }}>
        &copy; {new Date().getFullYear()} University Internship Management System. All rights reserved.
      </p>
    </div>
  )
}
