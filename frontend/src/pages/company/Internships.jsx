import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MapPin, Briefcase, Calendar, Users, Clock } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '@/components/Toast.jsx'

/** Design system */
const BG = '#0f0f0f'
const CARD = '#1a1a1a'
const BORDER = '#2a2a2a'
const ACCENT = '#CFFF00'
const MUTED = '#888888'
const OLIVE = '#4a5a00'

function formatWorkType(wt) {
  if (!wt) return '—'
  const s = String(wt).toLowerCase()
  if (s === 'onsite') return 'On-site'
  if (s === 'remote') return 'Remote'
  if (s === 'hybrid') return 'Hybrid'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function statusLabel(status) {
  const s = (status || 'draft').toLowerCase()
  if (s === 'ongoing') return 'Active'
  if (s === 'pending') return 'Pending'
  if (s === 'cancelled') return 'Closed'
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Draft'
}

/** Card badge — Stripe-style pills aligned with backend statuses */
function cardBadgeDisplay(status) {
  const s = (status || 'draft').toLowerCase()
  if (s === 'open') return { backgroundColor: '#14532d', color: '#22c55e', label: 'Open' }
  if (s === 'ongoing' || s === 'pending')
    return { backgroundColor: '#4a5a00', color: ACCENT, label: statusLabel(status) }
  if (s === 'draft') return { backgroundColor: '#1e3a5f', color: '#60a5fa', label: 'Draft' }
  if (s === 'cancelled' || s === 'completed')
    return { backgroundColor: '#2a2a2a', color: MUTED, label: statusLabel(status) }
  return { backgroundColor: '#2a2a2a', color: MUTED, label: statusLabel(status) }
}

function matchesStatusFilter(internship, filter) {
  if (filter === 'All') return true
  const s = (internship.status || 'draft').toLowerCase()
  if (filter === 'Open') return s === 'open'
  if (filter === 'Draft') return s === 'draft'
  if (filter === 'Active') return s === 'ongoing' || s === 'pending'
  if (filter === 'Closed') return s === 'cancelled' || s === 'completed'
  return true
}

export default function CompanyInternships() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [internships, setInternships] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const response = await api.get('/internships/?company=me')
        const data = response.data?.results || response.data || []
        setInternships(Array.isArray(data) ? data : [])
      } catch (err) {
        console.log('Error:', err.response?.data)
        setInternships([])
      } finally {
        setLoading(false)
      }
    }
    fetchInternships()
  }, [])

  const filteredInternships = internships.filter((i) => {
    const matchSearch = (i.title || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = matchesStatusFilter(i, statusFilter)
    return matchSearch && matchStatus
  })

  const statOpen = internships.filter((i) => (i.status || '').toLowerCase() === 'open').length
  const statActive = internships.filter((i) => ['ongoing', 'pending'].includes((i.status || '').toLowerCase())).length
  const statClosed = internships.filter((i) =>
    ['cancelled', 'completed'].includes((i.status || '').toLowerCase())
  ).length

  const handleClose = async (id) => {
    try {
      /** API uses `cancelled` (no `closed` choice on model) */
      await api.patch(`/internships/${id}/`, { status: 'cancelled' })
      setInternships((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'cancelled' } : i)))
      toast('Internship closed')
    } catch (err) {
      console.log('Close error:', err.response?.data)
      toast('Failed to close internship', 'error')
    }
  }

  return (
    <div style={{ backgroundColor: BG, color: '#ffffff' }}>
      {/* PAGE HEADER + STATS */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '24px',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px', marginTop: 0 }}>
              My Internships
            </h1>
            <p style={{ fontSize: '0.875rem', color: MUTED, margin: 0 }}>Manage your posted internship opportunities</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/company/post-internship')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: ACCENT,
              border: 'none',
              borderRadius: '12px',
              color: '#000000',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 0 20px rgba(207, 255, 0, 0.15)',
            }}
          >
            <Plus size={16} /> Post New Internship
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            { label: 'Total Posted', value: internships.length, color: '#ffffff', icon: '📋' },
            { label: 'Open', value: statOpen, color: '#22c55e', icon: '🟢' },
            { label: 'Active', value: statActive, color: ACCENT, icon: '⚡' },
            { label: 'Closed', value: statClosed, color: MUTED, icon: '🔒' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{stat.icon}</span>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: '800', color: stat.color, lineHeight: 1, margin: 0 }}>{stat.value}</p>
                <p style={{ fontSize: '0.75rem', color: MUTED, marginTop: '2px', marginBottom: 0 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEARCH + STATUS FILTERS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: '12px',
            flex: 1,
            minWidth: 0,
            maxWidth: '400px',
          }}
        >
          <Search size={16} style={{ color: MUTED, flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search internships by title..."
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '0.875rem',
              width: '100%',
              minWidth: 0,
            }}
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: 0, lineHeight: 1 }}
              aria-label="Clear search"
            >
              ×
            </button>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Open', 'Active', 'Closed', 'Draft'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '0.813rem',
                fontWeight: '600',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: statusFilter === status ? ACCENT : BORDER,
                backgroundColor: statusFilter === status ? 'rgba(207, 255, 0, 0.1)' : 'transparent',
                color: statusFilter === status ? ACCENT : MUTED,
                transition: 'all 0.2s',
              }}
            >
              {status}
            </button>
          ))}
        </div>

        <p style={{ fontSize: '0.813rem', color: MUTED, whiteSpace: 'nowrap', margin: 0 }}>
          {filteredInternships.length} result{filteredInternships.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: '20px',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: '280px',
                borderRadius: '16px',
                backgroundColor: '#252525',
                border: `1px solid ${BORDER}`,
              }}
            />
          ))}
        </div>
      )}

      {/* EMPTY — no data at all */}
      {!loading && internships.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <Briefcase size={32} style={{ color: OLIVE }} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px', marginTop: 0 }}>
            No internships yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: MUTED, marginBottom: '28px', maxWidth: '300px', lineHeight: '1.6' }}>
            Start building your team by posting your first internship opportunity
          </p>
          <button
            type="button"
            onClick={() => navigate('/company/post-internship')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              backgroundColor: ACCENT,
              border: 'none',
              borderRadius: '12px',
              color: '#000000',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(207, 255, 0, 0.2)',
            }}
          >
            <Plus size={16} /> Post Your First Internship
          </button>
        </div>
      )}

      {/* NO MATCH — filters / search */}
      {!loading && internships.length > 0 && filteredInternships.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 20px', border: `1px dashed ${BORDER}`, borderRadius: '16px' }}>
          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>No matching internships</p>
          <p style={{ fontSize: '0.875rem', color: MUTED, marginBottom: '16px' }}>Try adjusting your search or status filters.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setStatusFilter('All')
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              border: `1px solid ${BORDER}`,
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.813rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* INTERNSHIP CARDS GRID */}
      {!loading && filteredInternships.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: '20px',
          }}
        >
          {filteredInternships.map((internship) => {
            const st = (internship.status || 'draft').toLowerCase()
            const pill = cardBadgeDisplay(internship.status)
            const canClose = ['open', 'draft', 'pending'].includes(st)
            const applicants = internship.applicant_count ?? 0

            return (
              <div
                key={internship.id}
                style={{
                  backgroundColor: CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ACCENT
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(207, 255, 0, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: OLIVE,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Briefcase size={20} style={{ color: ACCENT }} />
                  </div>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      flexShrink: 0,
                      backgroundColor: pill.backgroundColor,
                      color: pill.color,
                    }}
                  >
                    {pill.label}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '6px', lineHeight: '1.4', marginTop: 0 }}>
                    {internship.title || 'Untitled'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <MapPin size={13} style={{ color: MUTED, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.813rem', color: MUTED }}>{internship.location || '—'}</span>
                    <span style={{ color: BORDER, margin: '0 4px' }}>·</span>
                    <span style={{ fontSize: '0.813rem', color: MUTED }}>{formatWorkType(internship.work_type)}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    backgroundColor: BG,
                    borderRadius: '10px',
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Calendar size={14} style={{ color: ACCENT, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', color: MUTED }}>
                    {internship.start_date
                      ? new Date(internship.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                    <span style={{ margin: '0 6px', color: '#444' }}>→</span>
                    {internship.end_date
                      ? new Date(internship.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} style={{ color: MUTED, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', color: MUTED }}>
                    Deadline:{' '}
                    {internship.application_deadline
                      ? new Date(internship.application_deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Not set'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    backgroundColor: BG,
                    borderRadius: '8px',
                  }}
                >
                  <Users size={14} style={{ color: MUTED, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.813rem', color: MUTED }}>
                    <span style={{ color: '#ffffff', fontWeight: '700' }}>{applicants}</span> applicants
                  </span>
                  {applicants > 0 ? (
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: ACCENT, fontWeight: '600' }}>View →</span>
                  ) : null}
                </div>

                <div style={{ borderTop: `1px solid ${BORDER}` }} />

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/company/applicants?internship=${internship.id}`)}
                    style={{
                      flex: 1,
                      minWidth: '100px',
                      padding: '9px',
                      backgroundColor: ACCENT,
                      border: 'none',
                      borderRadius: '9px',
                      color: '#000000',
                      fontSize: '0.813rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    Applicants
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/company/post-internship', { state: { editId: internship.id } })}
                    style={{
                      padding: '9px 14px',
                      backgroundColor: 'transparent',
                      border: `1px solid ${BORDER}`,
                      borderRadius: '9px',
                      color: '#ffffff',
                      fontSize: '0.813rem',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = ACCENT
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = BORDER
                    }}
                  >
                    Edit
                  </button>
                  {canClose ? (
                    <button
                      type="button"
                      disabled={actionLoading === internship.id}
                      onClick={() => {
                        setActionLoading(internship.id)
                        handleClose(internship.id).finally(() => setActionLoading(null))
                      }}
                      style={{
                        padding: '9px 14px',
                        backgroundColor: 'transparent',
                        border: '1px solid #450a0a',
                        borderRadius: '9px',
                        color: '#ef4444',
                        fontSize: '0.813rem',
                        cursor: actionLoading === internship.id ? 'wait' : 'pointer',
                        transition: 'background-color 0.2s',
                        opacity: actionLoading === internship.id ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (actionLoading !== internship.id) e.currentTarget.style.backgroundColor = '#450a0a'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      {actionLoading === internship.id ? 'Closing…' : 'Close'}
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
