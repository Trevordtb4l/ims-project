import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Check, ChevronDown, FileText, GraduationCap, IdCard, Info, Users } from 'lucide-react'
import api from '@/api/axios'
import { useToast } from '@/components/Toast.jsx'

const ROLES = [
  { value: 'student', label: 'Student', desc: 'Find internships and manage applications', Icon: GraduationCap },
  { value: 'supervisor', label: 'Supervisor', desc: 'Monitor progress and guide students', Icon: Users },
  { value: 'company', label: 'Company', desc: 'Post jobs and recruit top talent', Icon: Building2 },
]

const DEPARTMENTS = [
  'Software Engineering',
  'Computer Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileRef = useRef(null)

  const [role, setRole] = useState('student')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [universityId, setUniversityId] = useState('')
  const [department, setDepartment] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!firstName.trim()) e.firstName = 'First name is required.'
    if (!lastName.trim()) e.lastName = 'Last name is required.'
    if (!email.trim()) e.email = 'Email is required.'
    if (!password) e.password = 'Password is required.'
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.'
    if (role === 'student') {
      if (!universityId.trim()) e.universityId = 'University ID is required.'
      if (!department) e.department = 'Department is required.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setApiError('')

    const data = new FormData()
    data.append('first_name', firstName)
    data.append('last_name', lastName)
    data.append('email', email)
    data.append('password', password)
    data.append('password2', confirmPassword)
    data.append('role', role)
    if (role === 'student') {
      data.append('matricule', universityId)
      data.append('department', department)
    }
    if (cvFile) data.append('cv', cvFile)

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
      setLoading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file && /\.(pdf|docx?)$/i.test(file.name)) setCvFile(file)
  }

  const inputStyle = {
    width: '100%', backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a',
    borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: 14,
    outline: 'none', fontFamily: 'inherit',
  }

  const labelStyle = { display: 'block', color: '#fff', fontSize: 14, fontWeight: 500, marginBottom: 8 }

  const roleTitle = role === 'student' ? 'Student' : role === 'supervisor' ? 'Supervisor' : 'Company'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', color: '#fff' }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: '#0f0f0f', borderBottom: '1px solid #2a2a2a',
        padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#fff' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, backgroundColor: '#CFFF00',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', fontWeight: 700, fontSize: 14,
          }}>
            ✦
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>IMS Platform</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#888', fontSize: 14 }}>Already have an account?</span>
          <button
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: '#CFFF00', color: '#000', fontWeight: 600, fontSize: 14,
              padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            }}
          >
            Login
          </button>
        </div>
      </nav>

      {/* ── Page Header ── */}
      <div style={{ paddingTop: 96, paddingBottom: 8, paddingLeft: 32, paddingRight: 32, maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0 }}>Create your Account</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 6, maxWidth: 560, lineHeight: 1.5 }}>
          Join the IMS platform to manage internships effectively. Complete the steps below to set up your profile.
        </p>
      </div>

      {/* ── Progress Bar ── */}
      <div style={{
        maxWidth: 1100, margin: '16px auto 24px', padding: '0 32px',
      }}>
        <div style={{
          backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p style={{ color: '#CFFF00', fontSize: 12, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>STEP 2 OF 3</p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Profile Details</p>
            </div>
            <p style={{ color: '#888', fontSize: 14 }}>Next: Verification Documents</p>
          </div>
          <div style={{ width: '100%', height: 8, borderRadius: 999, backgroundColor: '#2a2a2a' }}>
            <div style={{ height: 8, borderRadius: 999, backgroundColor: '#CFFF00', width: '66%', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* ── Two Column Layout ── */}
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 32px 40px',
        display: 'flex', gap: 24, alignItems: 'flex-start',
      }}>
        {/* LEFT — Role Selector */}
        <div style={{ width: 300, flexShrink: 0 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Selected Role</h3>

          {ROLES.map(({ value, label, desc, Icon }) => {
            const active = role === value
            return (
              <div
                key={value}
                onClick={() => setRole(value)}
                style={{
                  marginBottom: 12, padding: 16, borderRadius: 16, cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: active ? '#4a5a00' : '#1a1a1a',
                  border: active ? '2px solid #CFFF00' : '1px solid #2a2a2a',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: active ? '#CFFF00' : '#2a2a2a',
                  }}>
                    <Icon size={20} style={{ color: active ? '#000' : '#888' }} />
                  </div>
                  {active && (
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', backgroundColor: '#CFFF00',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={14} style={{ color: '#000' }} />
                    </div>
                  )}
                </div>
                <p style={{ fontWeight: 700, color: '#fff', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 12, color: active ? '#CFFF00' : '#888' }}>{desc}</p>
              </div>
            )
          })}

          {/* Info box */}
          <div style={{
            marginTop: 16, padding: 16, borderRadius: 12,
            backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <Info size={16} style={{ color: '#CFFF00', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
              Students must use their university email address for verification purposes.
            </p>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div style={{
          flex: 1, backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
          borderRadius: 16, padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: 20 }}>{roleTitle} Information</h3>
            <span style={{
              backgroundColor: '#CFFF00', color: '#000', fontSize: 12, fontWeight: 700,
              padding: '4px 12px', borderRadius: 8,
            }}>
              Step 2
            </span>
          </div>

          {apiError && (
            <p style={{
              backgroundColor: '#450a0a', color: '#f87171', fontSize: 14, borderRadius: 8,
              padding: '8px 12px', marginBottom: 16,
            }}>
              {apiError}
            </p>
          )}

          {/* Row 1: First + Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input
                value={firstName} onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Jane" style={inputStyle}
              />
              {errors.firstName && <span style={{ color: '#f87171', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.firstName}</span>}
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                value={lastName} onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Doe" style={inputStyle}
              />
              {errors.lastName && <span style={{ color: '#f87171', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.lastName}</span>}
            </div>
          </div>

          {/* Row 2: University ID + Department (student only) */}
          {role === 'student' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>University ID</label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 12, padding: '0 16px',
                }}>
                  <IdCard size={16} style={{ color: '#888', flexShrink: 0 }} />
                  <input
                    value={universityId} onChange={(e) => setUniversityId(e.target.value)}
                    placeholder="Student ID Number"
                    style={{ ...inputStyle, border: 'none', padding: '12px 0', backgroundColor: 'transparent' }}
                  />
                </div>
                {errors.universityId && <span style={{ color: '#f87171', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.universityId}</span>}
              </div>
              <div>
                <label style={labelStyle}>Major / Department</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={department} onChange={(e) => setDepartment(e.target.value)}
                    style={{
                      ...inputStyle, appearance: 'none', paddingRight: 40,
                      color: department ? '#fff' : '#888',
                    }}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }} />
                </div>
                {errors.department && <span style={{ color: '#f87171', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.department}</span>}
              </div>
            </div>
          )}

          {/* University Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>University Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.doe@university.edu" style={inputStyle}
            />
            {errors.email && <span style={{ color: '#f87171', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.email}</span>}
          </div>

          {/* Password + Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" style={inputStyle}
              />
              {errors.password && <span style={{ color: '#f87171', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.password}</span>}
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" style={inputStyle}
              />
              {errors.confirmPassword && <span style={{ color: '#f87171', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* CV Upload — student only */}
          {role === 'student' && (
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Upload CV / Resume</label>
              <div
                onClick={() => fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  border: `2px dashed ${cvFile ? '#CFFF00' : '#2a2a2a'}`,
                  borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer',
                  backgroundColor: '#0f0f0f', transition: 'border-color 0.2s',
                }}
              >
                <FileText size={32} style={{ color: cvFile ? '#CFFF00' : '#888', margin: '0 auto 12px' }} />
                {cvFile ? (
                  <p style={{ color: '#CFFF00', fontSize: 14, fontWeight: 500 }}>Selected: {cvFile.name}</p>
                ) : (
                  <>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>Click to upload or drag and drop</p>
                    <p style={{ color: '#888', fontSize: 12, marginTop: 4 }}>PDF, DOCX up to 10MB</p>
                  </>
                )}
                <input
                  ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
                  onChange={(e) => { if (e.target.files?.[0]) setCvFile(e.target.files[0]) }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#888', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: '#CFFF00', color: '#000', fontWeight: 700, fontSize: 14,
                padding: '12px 24px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s', fontFamily: 'inherit',
              }}
            >
              {loading ? 'Creating...' : 'Create Account  →'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid #2a2a2a', maxWidth: 1100, margin: '0 auto',
        padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p style={{ color: '#888', fontSize: 12 }}>&copy; {new Date().getFullYear()} IMS Platform. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy Policy', 'Terms of Service', 'Help Center'].map((link) => (
            <span key={link} style={{ color: '#888', fontSize: 12, cursor: 'pointer' }}>{link}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}
