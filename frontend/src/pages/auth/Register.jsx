import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Check, GraduationCap, Upload, User, X } from 'lucide-react'
import api from '@/api/axios'
import { useToast } from '@/components/Toast.jsx'

const ROLES = [
  { value: 'student', label: 'Student', desc: 'Undergraduate or postgraduate student', icon: GraduationCap },
  { value: 'supervisor', label: 'Supervisor', desc: 'Faculty member or academic staff', icon: User },
  { value: 'company', label: 'Company', desc: 'Industry partner or employer', icon: Building2 },
]

const DEPARTMENTS = [
  'Software Engineering',
  'Computer Science',
  'Electrical Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Information Technology',
  'Other',
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileRef = useRef(null)

  const [role, setRole] = useState('student')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    matricule: '',
    department: '',
    email: '',
    password: '',
    password2: '',
  })
  const [cv, setCv] = useState(null)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name is required.'
    if (!form.last_name.trim()) e.last_name = 'Last name is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    if (!form.password) e.password = 'Password is required.'
    if (form.password !== form.password2) e.password2 = 'Passwords do not match.'
    if (role === 'student') {
      if (!form.matricule.trim()) e.matricule = 'University ID is required.'
      if (!form.department) e.department = 'Department is required.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setApiError('')

    const data = new FormData()
    data.append('first_name', form.first_name)
    data.append('last_name', form.last_name)
    data.append('email', form.email)
    data.append('password', form.password)
    data.append('password2', form.password2)
    data.append('role', role)
    if (role === 'student') {
      data.append('matricule', form.matricule)
      data.append('department', form.department)
    }
    if (cv) data.append('cv', cv)

    try {
      await api.post('/auth/register/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast('Registration successful! Please log in.', 'success')
      navigate('/login')
    } catch (err) {
      const d = err?.response?.data
      if (d && typeof d === 'object') {
        const msgs = Object.entries(d)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
          .join(' | ')
        setApiError(msgs)
      } else {
        setApiError('Registration failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file && /\.(pdf|docx?)$/i.test(file.name)) setCv(file)
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f0f0f', color: '#fff' }}>
      {/* Navbar */}
      <nav className="border-b" style={{ borderColor: '#2a2a2a' }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <GraduationCap className="h-6 w-6" style={{ color: '#CFFF00' }} />
            IMS Platform
          </Link>
          <div className="flex items-center gap-3 text-sm" style={{ color: '#888888' }}>
            Already have an account?
            <Link
              to="/login"
              className="rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:border-[#CFFF00]"
              style={{ borderColor: '#2a2a2a', color: '#CFFF00' }}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Heading */}
        <h1 className="text-3xl font-bold">Create your Account</h1>
        <p className="mt-1 text-sm" style={{ color: '#888888' }}>
          Join the Internship Management System and start your journey.
        </p>

        {/* Progress */}
        <div className="mt-6 flex items-center gap-3">
          <span className="text-xs font-medium" style={{ color: '#888888' }}>Step 2 of 3</span>
          <div className="h-2 flex-1 rounded-full" style={{ background: '#2a2a2a' }}>
            <div className="h-full rounded-full transition-all" style={{ width: '66%', background: '#CFFF00' }} />
          </div>
        </div>

        {/* Two column layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[340px,1fr]">
          {/* LEFT — Role selector */}
          <div className="space-y-4">
            {ROLES.map((r) => {
              const active = role === r.value
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className="flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-200"
                  style={{
                    borderColor: active ? '#CFFF00' : '#2a2a2a',
                    background: active ? 'rgba(207,255,0,0.06)' : '#1a1a1a',
                  }}
                >
                  <div className="mt-0.5 rounded-xl p-2" style={{ background: active ? '#4a5a00' : '#2a2a2a' }}>
                    <r.icon className="h-5 w-5" style={{ color: active ? '#CFFF00' : '#888888' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{r.label}</p>
                    <p className="text-xs" style={{ color: '#888888' }}>{r.desc}</p>
                  </div>
                  {active && (
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full" style={{ background: '#CFFF00' }}>
                      <Check className="h-3 w-3" style={{ color: '#000' }} />
                    </span>
                  )}
                </button>
              )
            })}
            <div className="rounded-xl border p-3 text-xs leading-relaxed" style={{ borderColor: '#2a2a2a', color: '#888888' }}>
              <strong className="text-white">Note:</strong> Students must use their university email address for registration.
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="rounded-2xl border p-6" style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <h3 className="mb-5 text-lg font-bold">
              {role === 'student' ? 'Student' : role === 'supervisor' ? 'Supervisor' : 'Company'} Information
            </h3>

            {apiError && (
              <p className="mb-4 rounded-lg px-3 py-2 text-sm text-red-400" style={{ background: '#450a0a' }}>
                {apiError}
              </p>
            )}

            <div className="space-y-4">
              {/* Name row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First Name *" error={errors.first_name}>
                  <input value={form.first_name} onChange={set('first_name')} placeholder="John" className="inp" style={inp} />
                </Field>
                <Field label="Last Name *" error={errors.last_name}>
                  <input value={form.last_name} onChange={set('last_name')} placeholder="Doe" className="inp" style={inp} />
                </Field>
              </div>

              {/* Student-specific */}
              {role === 'student' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="University ID *" error={errors.matricule}>
                    <input value={form.matricule} onChange={set('matricule')} placeholder="CT23A017" className="inp" style={inp} />
                  </Field>
                  <Field label="Major / Department *" error={errors.department}>
                    <select value={form.department} onChange={set('department')} className="inp" style={inp}>
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                </div>
              )}

              {/* Email */}
              <Field label="University Email *" error={errors.email}>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@ubuea.cm" className="inp" style={inp} />
              </Field>

              {/* Password row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Password *" error={errors.password}>
                  <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" className="inp" style={inp} />
                </Field>
                <Field label="Confirm Password *" error={errors.password2}>
                  <input type="password" value={form.password2} onChange={set('password2')} placeholder="••••••••" className="inp" style={inp} />
                </Field>
              </div>

              {/* CV Upload — student only */}
              {role === 'student' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#888888' }}>
                    Upload CV (optional)
                  </label>
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-[#CFFF00]"
                    style={{ borderColor: '#2a2a2a', background: '#0f0f0f' }}
                    onClick={() => fileRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {cv ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{cv.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCv(null) }}
                          className="rounded-full p-0.5" style={{ background: '#450a0a' }}
                        >
                          <X className="h-3 w-3 text-red-400" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mb-2 h-6 w-6" style={{ color: '#888888' }} />
                        <p className="text-sm" style={{ color: '#888888' }}>
                          Drag & drop or <span style={{ color: '#CFFF00' }}>browse</span>
                        </p>
                        <p className="mt-1 text-xs" style={{ color: '#555' }}>PDF or DOCX, max 5MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) setCv(e.target.files[0]) }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Link to="/login" className="text-sm font-medium" style={{ color: '#888888' }}>
                  ← Back
                </Link>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="rounded-xl px-7 py-3 text-sm font-bold transition-all hover:brightness-90 disabled:opacity-50"
                  style={{ background: '#CFFF00', color: '#000' }}
                >
                  {submitting ? 'Creating...' : 'Create Account →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const inp = { background: '#2a2a2a', color: '#fff' }

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" style={{ color: '#888888' }}>{label}</label>
      <div>
        {(() => {
          const child = Array.isArray(children) ? children[0] : children
          if (!child?.props) return children
          const merged = {
            ...child.props,
            className: `w-full rounded-xl border border-transparent px-4 py-3 text-white outline-none transition-colors focus:border-[#CFFF00] placeholder-[#555] ${child.props.className || ''}`,
            style: { ...inp, ...child.props.style },
          }
          return { ...child, props: merged }
        })()}
      </div>
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </div>
  )
}
