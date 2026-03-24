import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Calendar, Mail, ChevronRight, Info } from 'lucide-react'
import api from '@/api/axios'

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: '#242424',
  border: '1px solid #2a2a2a',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
}

/** Backend `Internship.work_type` uses onsite / remote / hybrid */
const WORK_TYPE_TO_API = {
  'On-site': 'onsite',
  Remote: 'remote',
  Hybrid: 'hybrid',
}

const SectionCard = ({ icon, title, children }) => (
  <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #2a2a2a' }}>
      <div style={{ width: '32px', height: '32px', backgroundColor: '#4a5a00', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h2>
    </div>
    {children}
  </div>
)

export default function PostInternship() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [workType, setWorkType] = useState('On-site')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [applicationDeadline, setApplicationDeadline] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/companies/')
        const list = res.data?.results ?? res.data
        const row = Array.isArray(list) ? list[0] : list
        if (row) {
          setContactEmail(row.contact_email || row.email || '')
          setContactPhone(row.phone || '')
        }
      } catch (err) {
        console.log('Profile error:', err.response?.data)
      }
    }
    fetchProfile()
  }, [])

  const mapWorkType = (label) => WORK_TYPE_TO_API[label] || 'onsite'

  const handleSubmit = async () => {
    setError('')
    if (!title.trim()) {
      setError('Internship Title is required.')
      return
    }
    if (!location.trim()) {
      setError('Location is required.')
      return
    }
    if (!description.trim()) {
      setError('Job Description is required.')
      return
    }
    if (!startDate) {
      setError('Start Date is required.')
      return
    }
    if (!endDate) {
      setError('End Date is required.')
      return
    }
    if (!applicationDeadline) {
      setError('Application Deadline is required.')
      return
    }
    if (!contactEmail.trim()) {
      setError('Contact Email is required.')
      return
    }
    if (!contactPhone.trim()) {
      setError('Phone Number is required.')
      return
    }

    try {
      setLoading(true)
      const payload = {
        title: title.trim(),
        work_type: mapWorkType(workType),
        location: location.trim(),
        description: description.trim(),
        tags: skills,
        start_date: startDate,
        end_date: endDate,
        application_deadline: applicationDeadline,
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        status: 'open',
      }
      await api.post('/internships/', payload)
      setSuccess(true)
      setTimeout(() => navigate('/company/dashboard', { state: { refresh: true } }), 2000)
    } catch (err) {
      const errData = err.response?.data
      if (errData) {
        const messages = Object.entries(errData)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ')
        setError(messages)
      } else {
        setError('Failed to post internship. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setError('Please add a title before saving draft.')
      return
    }
    const today = new Date().toISOString().slice(0, 10)
    try {
      setLoading(true)
      await api.post('/internships/', {
        title: title.trim(),
        work_type: mapWorkType(workType),
        location: location.trim() || '—',
        description: description.trim() || '',
        start_date: startDate || today,
        end_date: endDate || today,
        application_deadline: applicationDeadline || today,
        contact_email: contactEmail.trim() || 'draft@example.com',
        contact_phone: contactPhone.trim() || '—',
        tags: skills,
        status: 'draft',
      })
      navigate('/company/internships')
    } catch (err) {
      setError('Failed to save draft.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {['Home', 'Internships', 'Post New'].map((item, i, arr) => (
          <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.813rem', color: i === arr.length - 1 ? '#ffffff' : '#888888', cursor: 'pointer' }}>{item}</span>
            {i < arr.length - 1 && <ChevronRight size={14} style={{ color: '#888888' }} />}
          </span>
        ))}
      </div>

      {/* Page title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>Post a New Internship</h1>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '999px' }}>
          <Info size={12} style={{ color: '#CFFF00' }} />
          <span style={{ fontSize: '0.75rem', color: '#888888' }}>Fields marked with * are required</span>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div style={{ padding: '16px 20px', backgroundColor: '#14532d', border: '1px solid #22c55e', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
          </div>
          <div>
            <p style={{ color: '#22c55e', fontWeight: '700', fontSize: '0.875rem' }}>Internship posted successfully!</p>
            <p style={{ color: '#86efac', fontSize: '0.75rem', marginTop: '2px' }}>Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#450a0a', border: '1px solid #ef4444', borderRadius: '10px', marginBottom: '20px' }}>
          <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      {/* Section 1 — Position Details */}
      <SectionCard icon={<Briefcase size={16} style={{ color: '#CFFF00' }} />} title="Position Details">
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Internship Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Developer Intern"
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = '#CFFF00'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#2a2a2a'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Work Type *</label>
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={(e) => {
                e.target.style.borderColor = '#CFFF00'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2a2a2a'
              }}
            >
              <option value="On-site">On-site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Location *</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Douala, Cameroon"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#CFFF00'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2a2a2a'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Job Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the internship role, responsibilities..."
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
            onFocus={(e) => {
              e.target.style.borderColor = '#CFFF00'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#2a2a2a'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Requirements & Skills</label>
          <div
            style={{ ...inputStyle, display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '48px', alignItems: 'center', cursor: 'text' }}
            onClick={() => document.getElementById('skillInput')?.focus()}
          >
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: '#4a5a00',
                  border: '1px solid #CFFF00',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  color: '#CFFF00',
                  fontWeight: '600',
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSkills(skills.filter((s) => s !== skill))
                  }}
                  style={{ background: 'none', border: 'none', color: '#CFFF00', cursor: 'pointer', lineHeight: 1, padding: 0 }}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="skillInput"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && skillInput.trim()) {
                  setSkills([...skills, skillInput.trim()])
                  setSkillInput('')
                  e.preventDefault()
                }
              }}
              placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : ''}
              style={{ background: 'none', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.875rem', minWidth: '160px', flex: 1 }}
            />
          </div>
        </div>
      </SectionCard>

      {/* Section 2 — Logistics */}
      <SectionCard icon={<Calendar size={16} style={{ color: '#CFFF00' }} />} title="Logistics">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Start Date *', value: startDate, setter: setStartDate },
            { label: 'End Date *', value: endDate, setter: setEndDate },
            { label: 'Application Deadline *', value: applicationDeadline, setter: setApplicationDeadline },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>{label}</label>
              <input
                type="date"
                value={value}
                onChange={(e) => setter(e.target.value)}
                style={{ ...inputStyle, colorScheme: 'dark', cursor: 'pointer' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#CFFF00'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2a2a2a'
                }}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 3 — Contact */}
      <SectionCard icon={<Mail size={16} style={{ color: '#CFFF00' }} />} title="Contact Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Contact Email *</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#CFFF00'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2a2a2a'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Phone Number *</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#CFFF00'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2a2a2a'
              }}
            />
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#888888', fontStyle: 'italic' }}>
          * Interns will use these details to contact you directly.{' '}
          <button
            type="button"
            onClick={() => navigate('/company/settings')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#CFFF00',
              cursor: 'pointer',
              textDecoration: 'underline',
              font: 'inherit',
              fontStyle: 'italic',
            }}
          >
            Update in Settings
          </button>
        </p>
      </SectionCard>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0', borderTop: '1px solid #2a2a2a', marginTop: '8px' }}>
        <button type="button" onClick={() => navigate('/company/dashboard')} style={{ background: 'none', border: 'none', color: '#888888', fontSize: '0.875rem', cursor: 'pointer' }}>
          Cancel
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={handleSaveDraft}
            style={{
              padding: '10px 24px',
              backgroundColor: 'transparent',
              border: '1px solid #2a2a2a',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#CFFF00'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2a'
            }}
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '10px 24px',
              backgroundColor: '#CFFF00',
              border: 'none',
              borderRadius: '10px',
              color: '#000000',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Posting...' : 'Post Internship ▶'}
          </button>
        </div>
      </div>
    </div>
  )
}
