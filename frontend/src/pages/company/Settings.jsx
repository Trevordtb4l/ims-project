import { useState, useEffect, useCallback } from 'react'
import { Building, Mail, Phone, MapPin } from 'lucide-react'
import api from '../../api/axios'

const BG = '#0f0f0f'
const BORDER = '#2a2a2a'
const ACCENT = '#CFFF00'
const INPUT_BG = '#242424'
const MUTED = '#888888'
const CARD = '#1a1a1a'

function Field({ label, icon: Icon, value, onChange, type = 'text', placeholder }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '8px',
          letterSpacing: '-0.01em',
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: INPUT_BG,
          border: `1px solid ${focused ? ACCENT : BORDER}`,
          borderRadius: '10px',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: focused ? '0 0 0 1px rgba(207, 255, 0, 0.12)' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!focused) e.currentTarget.style.borderColor = '#3a3a3a'
        }}
        onMouseLeave={(e) => {
          if (!focused) e.currentTarget.style.borderColor = BORDER
        }}
      >
        <Icon size={16} style={{ color: focused ? ACCENT : MUTED, flexShrink: 0, transition: 'color 0.2s' }} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontSize: '0.875rem',
            width: '100%',
          }}
        />
      </div>
    </div>
  )
}

export default function CompanySettings() {
  const [companyId, setCompanyId] = useState(null)
  const [companyName, setCompanyName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fetchProfile = useCallback(async () => {
    setError('')
    setSuccess(false)
    try {
      const res = await api.get('/companies/')
      const list = res.data?.results || res.data
      const row = Array.isArray(list) ? list[0] : list
      if (row?.id) {
        setCompanyId(row.id)
        setCompanyName(row.name || '')
        setContactEmail(row.contact_email || '')
        setPhone(row.phone || row.contact || '')
        setAddress(row.address || '')
      } else {
        setCompanyId(null)
      }
    } catch (err) {
      console.log('Profile error:', err.response?.data)
      setError('Could not load company profile.')
    } finally {
      setInitialLoad(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSave = async () => {
    if (!companyId) {
      setError('Company profile not found.')
      return
    }
    setError('')
    setSuccess(false)
    try {
      setLoading(true)
      await api.patch(`/companies/${companyId}/`, {
        name: companyName,
        contact_email: contactEmail,
        phone,
        address,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errData = err.response?.data
      if (errData && typeof errData === 'object') {
        const first = Object.entries(errData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ')
        setError(first || errData.detail || 'Failed to save settings.')
      } else {
        setError(errData?.detail || 'Failed to save settings.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (initialLoad) {
    return (
      <div style={{ backgroundColor: BG }}>
        <div className="mb-6 h-10 w-72 max-w-full animate-pulse rounded-lg" style={{ backgroundColor: '#2a2a2a' }} />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-lg" style={{ backgroundColor: '#252525' }} />
        <div
          className="mt-8 grid animate-pulse gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
          style={{ alignItems: 'start' }}
        >
          <div className="min-h-[400px] rounded-2xl" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }} />
          <div className="min-h-[280px] rounded-2xl" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: BG, color: '#ffffff', minHeight: '60vh' }}>
      {/* Sticky page header — stays visible while scrolling */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backgroundColor: BG,
          paddingTop: '4px',
          paddingBottom: '24px',
          marginBottom: '24px',
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px', marginTop: 0 }}>
          Company Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: MUTED, margin: 0 }}>Manage your company profile and contact details</p>
      </div>

      {/* Two column layout — form left, info panel right */}
      <div
        className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
        style={{ alignItems: 'start' }}
      >
        {/* LEFT — Main settings card */}
        <div
          style={{
            backgroundColor: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '28px',
              paddingBottom: '20px',
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#4a5a00',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building size={20} style={{ color: ACCENT }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '2px', marginTop: 0 }}>
                Profile information
              </h2>
              <p style={{ fontSize: '0.75rem', color: MUTED, margin: 0 }}>Changes reflect across all your internship listings</p>
            </div>
          </div>

          <Field
            label="Company name"
            icon={Building}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your company name"
          />
          <Field
            label="Contact email"
            icon={Mail}
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="company@example.com"
          />
          <Field
            label="Phone number"
            icon={Phone}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+237 6XX XXX XXX"
          />
          <Field
            label="Company address"
            icon={MapPin}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Molyko, Buea"
          />

          {error && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#450a0a',
                border: '1px solid #ef4444',
                borderRadius: '10px',
                marginTop: '4px',
              }}
            >
              <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>{error}</p>
            </div>
          )}

          {success && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#14532d',
                border: '1px solid #22c55e',
                borderRadius: '10px',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#22c55e',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#000', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
              </div>
              <p style={{ color: '#22c55e', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>Settings saved successfully!</p>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '20px',
              borderTop: `1px solid ${BORDER}`,
              marginTop: '8px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={fetchProfile}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                border: `1px solid ${BORDER}`,
                borderRadius: '10px',
                color: MUTED,
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = ACCENT
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER
                e.currentTarget.style.color = MUTED
              }}
            >
              Reset changes
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              style={{
                padding: '10px 28px',
                backgroundColor: ACCENT,
                border: 'none',
                borderRadius: '10px',
                color: '#000000',
                fontSize: '0.875rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {loading ? 'Saving...' : '✓ Save changes'}
            </button>
          </div>
        </div>

        {/* RIGHT — Info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', minWidth: 0 }}>
          <div
            style={{
              backgroundColor: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: ACCENT,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '1.5rem',
                fontWeight: '800',
                color: '#000',
              }}
            >
              {companyName?.[0]?.toUpperCase() || 'C'}
            </div>
            <p style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '4px', marginTop: 0 }}>
              {companyName || 'Company name'}
            </p>
            <p style={{ fontSize: '0.813rem', color: MUTED, marginBottom: '16px', marginTop: 0 }}>
              {contactEmail || 'email@company.com'}
            </p>
            <div
              style={{
                padding: '8px 16px',
                backgroundColor: BG,
                border: `1px solid ${BORDER}`,
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }} />
              <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: '600' }}>Active account</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <p style={{ fontSize: '0.813rem', fontWeight: '700', color: '#ffffff', marginBottom: '12px', marginTop: 0 }}>
              Profile tips
            </p>
            {[
              'Keep your contact email up to date so interns can reach you',
              'Your phone number appears on all internship listings',
              'A complete profile gets more applications',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: i < 2 ? '10px' : 0 }}>
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: ACCENT,
                    borderRadius: '50%',
                    marginTop: '6px',
                    flexShrink: 0,
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: MUTED, lineHeight: '1.5', margin: 0 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
