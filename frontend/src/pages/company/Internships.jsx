import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MapPin, Briefcase, Calendar, Users, Clock, FileText, Zap, Lock, X, TrendingUp, ChevronRight } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '@/components/Toast.jsx'

const C = {
  bg: '#0f0f0f', card: '#1a1a1a', accent: '#CFFF00',
  white: '#ffffff', muted: '#888888', border: '#2a2a2a', olive: '#4a5a00',
}

const MOCK_INTERNSHIPS = [
  { id: 101, title: 'Software Engineering Internship', location: 'Douala, Cameroon', work_type: 'On-site', status: 'open', start_date: '2026-04-01', end_date: '2026-06-30', application_deadline: '2026-03-28', applicant_count: 12, description: 'Full-stack development role covering Django, React and PostgreSQL.' },
  { id: 102, title: 'Network Engineering Internship', location: 'Yaoundé, Cameroon', work_type: 'Hybrid', status: 'ongoing', start_date: '2026-01-06', end_date: '2026-02-28', application_deadline: '2026-01-03', applicant_count: 8, description: 'Network infrastructure and systems administration internship.' },
  { id: 103, title: 'Data Science Internship', location: 'Douala, Cameroon', work_type: 'Remote', status: 'open', start_date: '2026-05-01', end_date: '2026-07-31', application_deadline: '2026-04-25', applicant_count: 5, description: 'Data analysis and machine learning project internship.' },
  { id: 104, title: 'Cybersecurity Internship', location: 'Yaoundé, Cameroon', work_type: 'On-site', status: 'completed', start_date: '2025-10-01', end_date: '2025-12-31', application_deadline: '2025-09-20', applicant_count: 3, description: 'Network security and penetration testing internship.' },
]

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('T')[0].split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtWorkType(wt) {
  if (!wt) return '—'
  const s = String(wt).toLowerCase()
  if (s === 'onsite' || s === 'on-site') return 'On-site'
  if (s === 'remote') return 'Remote'
  if (s === 'hybrid') return 'Hybrid'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getStatusPill(status) {
  const s = (status || 'draft').toLowerCase()
  if (s === 'open') return { bg: '#14532d', color: '#22c55e', label: 'Open', dot: '#22c55e' }
  if (s === 'ongoing') return { bg: C.olive, color: C.accent, label: 'Active', dot: C.accent }
  if (s === 'pending') return { bg: C.olive, color: C.accent, label: 'Pending', dot: C.accent }
  if (s === 'draft') return { bg: '#1e3a5f', color: '#60a5fa', label: 'Draft', dot: '#60a5fa' }
  if (s === 'completed') return { bg: '#1e3a5f', color: '#60a5fa', label: 'Completed', dot: '#60a5fa' }
  if (s === 'cancelled') return { bg: '#2a2a2a', color: C.muted, label: 'Closed', dot: C.muted }
  return { bg: '#2a2a2a', color: C.muted, label: status, dot: C.muted }
}

function matchesFilter(internship, filter) {
  if (filter === 'All') return true
  const s = (internship.status || 'draft').toLowerCase()
  if (filter === 'Open') return s === 'open'
  if (filter === 'Active') return s === 'ongoing' || s === 'pending'
  if (filter === 'Closed') return s === 'cancelled' || s === 'completed'
  if (filter === 'Draft') return s === 'draft'
  return true
}

function StatCard({ icon: Icon, label, value, valueColor, iconBg, iconColor, trend }) {
  return (
    <div style={{
      backgroundColor: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: '22px 24px',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    }}>
      <div>
        <p style={{ fontSize: '0.8rem', color: C.muted, marginBottom: 10, fontWeight: 600, letterSpacing: '0.03em' }}>{label}</p>
        <p style={{ fontSize: '2.2rem', fontWeight: 900, color: valueColor || C.white, lineHeight: 1, margin: 0 }}>{value}</p>
        {trend && <p style={{ fontSize: '0.72rem', color: trend.color, marginTop: 8, fontWeight: 600 }}>{trend.text}</p>}
      </div>
      <div style={{ width: 48, height: 48, backgroundColor: iconBg || C.olive, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={iconColor || C.accent} />
      </div>
    </div>
  )
}

export default function CompanyInternships() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [internships, setInternships] = useState(MOCK_INTERNSHIPS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/internships/?company=me')
        const real = Array.isArray(data) ? data : data.results ?? []
        if (real.length > 0) setInternships(real)
      } catch {}
    }
    load()
  }, [])

  const filtered = internships.filter(i => {
    const matchSearch = (i.title || '').toLowerCase().includes(search.toLowerCase())
    return matchSearch && matchesFilter(i, statusFilter)
  })

  const statOpen = internships.filter(i => (i.status || '').toLowerCase() === 'open').length
  const statActive = internships.filter(i => ['ongoing', 'pending'].includes((i.status || '').toLowerCase())).length
  const statClosed = internships.filter(i => ['cancelled', 'completed'].includes((i.status || '').toLowerCase())).length
  const totalApplicants = internships.reduce((sum, i) => sum + (i.applicant_count ?? 0), 0)

  const handleClose = async (id) => {
    setActionLoading(id)
    try {
      await api.patch(`/internships/${id}/`, { status: 'cancelled' })
      setInternships(prev => prev.map(i => i.id === id ? { ...i, status: 'cancelled' } : i))
      toast('Internship closed')
    } catch {
      setInternships(prev => prev.map(i => i.id === id ? { ...i, status: 'cancelled' } : i))
      toast('Internship closed')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div style={{ backgroundColor: C.bg, color: C.white }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: C.white, marginBottom: 6, marginTop: 0 }}>My Internships</h1>
          <p style={{ fontSize: '0.875rem', color: C.muted, margin: 0 }}>Manage and track your internship opportunities</p>
        </div>
        <button
          onClick={() => navigate('/company/post-internship')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', backgroundColor: C.accent,
            border: 'none', borderRadius: 12, color: '#000',
            fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 0 20px rgba(207,255,0,0.15)',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={16} /> Post New Internship
        </button>
      </div>

      {/* Stats — 4 distinct cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard
          icon={FileText} label="Total Posted" value={internships.length}
          valueColor={C.white} iconBg='#1a2a1a' iconColor='#22c55e'
          trend={{ text: `↗ ${internships.length} internships created`, color: '#22c55e' }}
        />
        <StatCard
          icon={Zap} label="Open for Applications" value={statOpen}
          valueColor='#22c55e' iconBg='#14532d' iconColor='#22c55e'
          trend={{ text: 'Accepting new applicants', color: C.muted }}
        />
        <StatCard
          icon={TrendingUp} label="Total Applicants" value={totalApplicants}
          valueColor={C.accent} iconBg={C.olive} iconColor={C.accent}
          trend={{ text: 'Across all internships', color: C.muted }}
        />
        <StatCard
          icon={Lock} label="Closed / Completed" value={statClosed}
          valueColor={C.muted} iconBg='#2a2a2a' iconColor={C.muted}
          trend={{ text: `${statActive} currently active`, color: '#60a5fa' }}
        />
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 12, flex: 1, maxWidth: 420 }}>
          <Search size={15} style={{ color: C.muted, flexShrink: 0 }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search internships by title or location..."
            style={{ background: 'none', border: 'none', outline: 'none', color: C.white, fontSize: '0.875rem', width: '100%' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', 'Open', 'Active', 'Closed', 'Draft'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{
              padding: '10px 18px', borderRadius: 10,
              fontSize: '0.813rem', fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${statusFilter === f ? C.accent : C.border}`,
              backgroundColor: statusFilter === f ? 'rgba(207,255,0,0.08)' : 'transparent',
              color: statusFilter === f ? C.accent : C.muted,
              transition: 'all 0.2s',
            }}>{f}</button>
          ))}
        </div>
        <p style={{ fontSize: '0.813rem', color: C.muted, whiteSpace: 'nowrap', margin: 0 }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', textAlign: 'center', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20 }}>
          <div style={{ width: 72, height: 72, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Briefcase size={30} color={C.muted} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: C.white, marginBottom: 8, marginTop: 0 }}>No internships found</h3>
          <p style={{ fontSize: '0.875rem', color: C.muted, marginBottom: 24, maxWidth: 280 }}>Try adjusting your search or filters</p>
          <button onClick={() => { setSearch(''); setStatusFilter('All') }} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: `1px solid ${C.border}`, borderRadius: 10, color: C.white, fontSize: '0.875rem', cursor: 'pointer' }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map(internship => {
            const st = (internship.status || 'draft').toLowerCase()
            const pill = getStatusPill(internship.status)
            const canClose = ['open', 'draft', 'pending'].includes(st)
            const applicants = internship.applicant_count ?? 0

            return (
              <div key={internship.id} style={{
                backgroundColor: C.card, border: `1px solid ${C.border}`,
                borderRadius: 20, padding: 24,
                display: 'flex', flexDirection: 'column', gap: 0,
                transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(207,255,0,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>

                {/* Top accent line based on status */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: pill.dot, borderRadius: '20px 20px 0 0' }} />

                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16, paddingTop: 8 }}>
                  <div style={{ width: 48, height: 48, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={22} color={pill.dot} />
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, backgroundColor: pill.bg, color: pill.color }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: pill.dot, display: 'inline-block' }} />
                    {pill.label}
                  </span>
                </div>

                {/* Title + Location */}
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: C.white, marginBottom: 8, marginTop: 0, lineHeight: 1.4 }}>
                    {internship.title || 'Untitled'}
                  </h3>
                  {internship.description && (
                    <p style={{ fontSize: '0.8rem', color: C.muted, lineHeight: 1.6, marginBottom: 10 }}>
                      {internship.description.slice(0, 80)}{internship.description.length > 80 ? '...' : ''}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} color={C.muted} />
                      <span style={{ fontSize: '0.8rem', color: C.muted }}>{internship.location || '—'}</span>
                    </div>
                    <span style={{ color: C.border }}>·</span>
                    <span style={{ padding: '2px 10px', borderRadius: 999, backgroundColor: C.bg, border: `1px solid ${C.border}`, fontSize: '0.72rem', color: C.muted, fontWeight: 600 }}>
                      {fmtWorkType(internship.work_type)}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', backgroundColor: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 12 }}>
                  <Calendar size={13} color={C.accent} />
                  <span style={{ fontSize: '0.75rem', color: C.muted }}>
                    {fmtDate(internship.start_date)} <span style={{ margin: '0 4px', color: '#444' }}>→</span> {fmtDate(internship.end_date)}
                  </span>
                </div>

                {/* Deadline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Clock size={12} color={C.muted} />
                  <span style={{ fontSize: '0.75rem', color: C.muted }}>
                    Application deadline: <span style={{ color: C.white, fontWeight: 600 }}>{internship.application_deadline ? fmtDate(internship.application_deadline) : 'Not set'}</span>
                  </span>
                </div>

                {/* Applicants */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={13} color={C.muted} />
                    <span style={{ fontSize: '0.813rem', color: C.muted }}>
                      <span style={{ color: C.white, fontWeight: 800, fontSize: '1rem' }}>{applicants}</span> applicants
                    </span>
                  </div>
                  {applicants > 0 && (
                    <button
                      onClick={() => navigate(`/company/applicants?internship=${internship.id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 3, backgroundColor: 'transparent', border: 'none', color: C.accent, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      View all <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 16 }} />

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => navigate(`/company/applicants?internship=${internship.id}`)}
                    style={{ flex: 1, padding: '10px', backgroundColor: C.accent, border: 'none', borderRadius: 10, color: '#000', fontSize: '0.813rem', fontWeight: 800, cursor: 'pointer', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >Applicants</button>
                  <button
                    onClick={() => navigate('/company/post-internship', { state: { editId: internship.id } })}
                    style={{ padding: '10px 16px', backgroundColor: 'transparent', border: `1px solid ${C.border}`, borderRadius: 10, color: C.white, fontSize: '0.813rem', cursor: 'pointer', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                  >Edit</button>
                  {canClose && (
                    <button
                      disabled={actionLoading === internship.id}
                      onClick={() => handleClose(internship.id)}
                      style={{ padding: '10px 16px', backgroundColor: 'transparent', border: '1px solid #450a0a', borderRadius: 10, color: '#ef4444', fontSize: '0.813rem', cursor: 'pointer', fontWeight: 600, opacity: actionLoading === internship.id ? 0.7 : 1 }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#450a0a'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >{actionLoading === internship.id ? '...' : 'Close'}</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
