import React, { Fragment, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Calendar, Mail, ChevronRight, Info } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '@/components/Toast.jsx'

/** Design system */
const BG = '#0f0f0f'
const BORDER = '#2a2a2a'
const ACCENT = '#CFFF00'
const MUTED = '#888888'

const SectionCard = ({ icon, title, children }) => (
  <div
    style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '20px',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #2a2a2a',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: '#4a5a00',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <h2
        style={{
          fontSize: '1rem',
          fontWeight: '700',
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </h2>
    </div>
    {children}
  </div>
)

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

export default function PostInternship() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [workType, setWorkType] = useState('onsite')
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

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    setError('')
    setSuccess(false)
  }, [])

  useEffect(() => {
    api
      .get('/companies/')
      .then((res) => {
        const list = res.data?.results || res.data
        const company = Array.isArray(list) ? list[0] : list
        if (company) {
          setContactEmail(company.contact_email || company.email || '')
          setContactPhone(company.contact_phone || company.phone || company.contact || '')
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async () => {
    setError('')
    setSuccess(false)

    if (!title.trim()) {
      setError('Internship Title is required.')
      return
    }
    if (!workType) {
      setError('Work Type is required.')
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
        work_type: workType,
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
      toast('Internship posted successfully')
      setSuccess(true)
      setTimeout(() => {
        navigate('/company/dashboard', { state: { refresh: true } })
      }, 2000)
    } catch (err) {
      const errData = err.response?.data
      if (errData && typeof errData === 'object') {
        const messages = Object.entries(errData)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ')
        setError(messages)
        toast(messages, 'error')
      } else {
        const fallback = 'Failed to post internship. Please try again.'
        setError(fallback)
        toast(fallback, 'error')
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
    setError('')
    setSuccess(false)
    try {
      setLoading(true)
      /** Backend requires start/end dates — use form values or same-day fallbacks for draft */
      const start = startDate || today
      const end = endDate || start
      await api.post('/internships/', {
        title: title.trim(),
        work_type: workType,
        location: location.trim(),
        description: description.trim(),
        tags: skills,
        start_date: start,
        end_date: end,
        application_deadline: applicationDeadline || null,
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        status: 'draft',
      })
      toast('Draft saved')
      navigate('/company/internships')
    } catch (err) {
      const errData = err.response?.data
      if (errData && typeof errData === 'object') {
        const messages = Object.entries(errData)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ')
        setError(messages || 'Failed to save draft.')
        toast(messages || 'Failed to save draft.', 'error')
      } else {
        setError('Failed to save draft.')
        toast('Failed to save draft.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const labelBlock = {
    display: 'block',
    fontSize: '0.813rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px',
  }

  return (
    <div style={{ backgroundColor: BG, color: '#ffffff' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'Home', onClick: () => navigate('/company/dashboard') },
          { label: 'Internships', onClick: () => navigate('/company/internships') },
          { label: 'Post New', onClick: null },
        ].map((item, i, arr) => (
          <Fragment key={item.label}>
            {item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                style={{
                  fontSize: '0.813rem',
                  color: MUTED,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                {item.label}
              </button>
            ) : (
              <span style={{ fontSize: '0.813rem', color: '#ffffff', fontWeight: '600' }}>{item.label}</span>
            )}
            {i < arr.length - 1 && <ChevronRight size={14} style={{ color: MUTED }} />}
          </Fragment>
        ))}
      </div>

      {/* Page title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>
          Post a New Internship
        </h1>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '999px',
          }}
        >
          <Info size={12} style={{ color: ACCENT }} />
          <span style={{ fontSize: '0.75rem', color: MUTED }}>Fields marked with * are required</span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#450a0a',
            border: '1px solid #ef4444',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        >
          <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>{error}</p>
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#14532d',
            border: '1px solid #22c55e',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
          </div>
          <div>
            <p style={{ color: '#22c55e', fontWeight: '700', fontSize: '0.875rem', margin: 0 }}>
              Internship posted successfully!
            </p>
            <p style={{ color: '#86efac', fontSize: '0.75rem', marginTop: '2px', marginBottom: 0 }}>
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1 — Position Details */}
      <SectionCard icon={<Briefcase size={16} style={{ color: ACCENT }} />} title="Position Details">
        {/* Internship Title */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelBlock}>Internship Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Developer Intern"
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = ACCENT
            }}
            onBlur={(e) => {
              e.target.style.borderColor = BORDER
            }}
          />
        </div>

        {/* Work Type + Location */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <label style={labelBlock}>Work Type *</label>
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={(e) => {
                e.target.style.borderColor = ACCENT
              }}
              onBlur={(e) => {
                e.target.style.borderColor = BORDER
              }}
            >
              <option value="onsite">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label style={labelBlock}>Location *</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Douala, Cameroon"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = ACCENT
              }}
              onBlur={(e) => {
                e.target.style.borderColor = BORDER
              }}
            />
          </div>
        </div>

        {/* Job Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelBlock}>Job Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the internship role, responsibilities..."
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
            onFocus={(e) => {
              e.target.style.borderColor = ACCENT
            }}
            onBlur={(e) => {
              e.target.style.borderColor = BORDER
            }}
          />
        </div>

        {/* Skills tags */}
        <div>
          <label style={labelBlock}>Requirements & Skills</label>
          <div
            style={{
              ...inputStyle,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              minHeight: '48px',
              alignItems: 'center',
              cursor: 'text',
            }}
            onClick={() => document.getElementById('post-internship-skill-input')?.focus()}
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
                    setSkills((prev) => prev.filter((s) => s !== skill))
                  }}
                  style={{ background: 'none', border: 'none', color: '#CFFF00', cursor: 'pointer', lineHeight: 1, padding: 0 }}
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="post-internship-skill-input"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && skillInput.trim()) {
                  e.preventDefault()
                  const val = skillInput.trim()
                  if (!skills.includes(val)) setSkills((prev) => [...prev, val])
                  setSkillInput('')
                }
              }}
              placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : ''}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '0.875rem',
                minWidth: '160px',
                flex: 1,
              }}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECTION 2 — Logistics */}
      <SectionCard icon={<Calendar size={16} style={{ color: '#CFFF00' }} />} title="Logistics">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {[
            {
              label: 'Start Date *',
              value: startDate,
              setter: setStartDate,
              min: today,
              max: undefined,
            },
            {
              label: 'End Date *',
              value: endDate,
              setter: setEndDate,
              min: startDate || today,
              max: undefined,
            },
            {
              label: 'Application Deadline *',
              value: applicationDeadline,
              setter: setApplicationDeadline,
              min: undefined,
              max: startDate || undefined,
            },
          ].map(({ label, value, setter, min, max }) => (
            <div key={label}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.813rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '8px',
                }}
              >
                {label}
              </label>
              <input
                type="date"
                value={value}
                min={min}
                max={max}
                onChange={(e) => setter(e.target.value)}
                style={{ ...inputStyle, colorScheme: 'dark', cursor: 'pointer' }}
                className="[&::-webkit-calendar-picker-indicator]:invert"
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

      {/* SECTION 3 — Contact Information */}
      <SectionCard icon={<Mail size={16} style={{ color: '#CFFF00' }} />} title="Contact Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.813rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '8px',
              }}
            >
              Contact Email *
            </label>
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
            <label
              style={{
                display: 'block',
                fontSize: '0.813rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '8px',
              }}
            >
              Phone Number *
            </label>
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
        <p style={{ fontSize: '0.75rem', color: '#888888', fontStyle: 'italic', margin: 0 }}>
          * Interns will use these details to contact you directly.{' '}
          <span
            onClick={() => navigate('/company/settings')}
            style={{ color: '#CFFF00', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Update in Settings
          </span>
        </p>
      </SectionCard>

      {/* Form footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 0',
          borderTop: '1px solid #2a2a2a',
          marginTop: '8px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/company/dashboard')}
          style={{ background: 'none', border: 'none', color: '#888888', fontSize: '0.875rem', cursor: 'pointer' }}
        >
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
