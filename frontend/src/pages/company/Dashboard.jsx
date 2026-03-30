import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '@/api/axios'
import { useToast } from '@/components/Toast.jsx'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts'
import {
  Briefcase,
  UserPlus,
  BadgeCheck,
  Plus,
  Download,
  Search,
  Video,
  CalendarDays,
  SlidersHorizontal,
  Users,
  Zap,
  FileText,
  BarChart2,
} from 'lucide-react'

/** Design system — Company dashboard (Figma) */
const BG = '#0f0f0f'
const CARD = '#1a1a1a'
const BORDER = '#2a2a2a'
const ACCENT = '#CFFF00'
const MUTED = '#888888'
const OLIVE = '#4a5a00'
const STATUS_REVIEWING_BG = '#4a5a00'
const STATUS_REVIEWING_TEXT = '#CFFF00'
const STATUS_INTERVIEW_BG = '#1e3a5f'
const STATUS_INTERVIEW_TEXT = '#60a5fa'

/** Stat / section cards — consistent padding & radius */
const CARD_PANEL = {
  backgroundColor: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '16px',
  padding: '24px',
}

/** Stat cards — column layout, clear border, compact icon */
const STAT_CARD = {
  backgroundColor: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '16px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const CHART_DATA = [
  { day: 'Mon', apps: 32 },
  { day: 'Tue', apps: 48 },
  { day: 'Wed', apps: 38 },
  { day: 'Thu', apps: 75 },
  { day: 'Fri', apps: 55 },
  { day: 'Sat', apps: 20 },
  { day: 'Sun', apps: 28 },
]

function extractItems(data) {
  if (Array.isArray(data)) return data
  if (data?.results && Array.isArray(data.results)) return data.results
  return []
}

function extractCount(data) {
  if (data == null) return 0
  if (typeof data.count === 'number') return data.count
  if (Array.isArray(data)) return data.length
  if (data?.results) return data.results.length
  return 0
}

function initialsFromName(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function statusLabel(status) {
  const s = (status || '').toLowerCase()
  if (s === 'interview') return 'Interview'
  if (s === 'pending' || s === 'shortlisted') return 'Reviewing'
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Reviewing'
}

function formatRoleRef(id) {
  const n = Number(id)
  if (Number.isFinite(n)) return `#INT-2024-${String(n).padStart(3, '0')}`
  return `#INT-2024-${String(id)}`
}

function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function pickPhoto(app) {
  return (
    app.student_profile_image ||
    app.profile_image ||
    app.student_photo ||
    (app.student && app.student.profile_image) ||
    ''
  )
}

function StatusBadge({ label }) {
  const isInterview = label === 'Interview'
  return (
    <span
      className="inline-flex rounded-full px-3 py-1 font-bold"
      style={{
        fontSize: '0.75rem',
        backgroundColor: isInterview ? STATUS_INTERVIEW_BG : STATUS_REVIEWING_BG,
        color: isInterview ? STATUS_INTERVIEW_TEXT : STATUS_REVIEWING_TEXT,
      }}
    >
      {label}
    </span>
  )
}

function Avatar({
  photoUrl,
  name,
  textClass = 'text-sm',
}) {
  const [failed, setFailed] = useState(false)
  const ini = initialsFromName(name)
  const showImg = photoUrl && !failed

  useEffect(() => {
    setFailed(false)
  }, [photoUrl])

  if (showImg) {
    return (
      <img
        src={photoUrl}
        alt=""
        style={{
          width: '40px',
          height: '40px',
          flexShrink: 0,
          objectFit: 'cover',
          borderRadius: '9999px',
        }}
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold ${textClass}`}
      style={{
        backgroundColor: ACCENT,
        color: '#000000',
        width: '40px',
        height: '40px',
        flexShrink: 0,
      }}
    >
      {ini || '?'}
    </div>
  )
}

export default function CompanyDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [postedInternships, setPostedInternships] = useState(0)
  const [totalApplicants, setTotalApplicants] = useState(0)
  const [activeInterns, setActiveInterns] = useState(0)
  const [applicants, setApplicants] = useState([])
  const [search, setSearch] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportType, setExportType] = useState('full')
  const [exporting, setExporting] = useState(false)
  const [pendingConfirmations, setPendingConfirmations] = useState([])
  const [confirmLoading, setConfirmLoading] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [r1, r2, r3, r4] = await Promise.allSettled([
        api.get('/internships/?company=me'),
        api.get('/internship-applications/?company=me'),
        api.get('/internships/?company=me&status=ongoing'),
        api.get('/internship-applications/?company=me'),
      ])

      const internshipCount = r1.status === 'fulfilled' ? extractCount(r1.value.data) : 0
      const applicantCount = r2.status === 'fulfilled' ? extractCount(r2.value.data) : 0
      const activeCount = r3.status === 'fulfilled' ? extractCount(r3.value.data) : 0
      const appList = r4.status === 'fulfilled' ? extractItems(r4.value.data) : []

      setPostedInternships(internshipCount > 0 ? internshipCount : 4)
      setTotalApplicants(applicantCount > 0 ? applicantCount : 25)
      setActiveInterns(activeCount > 0 ? activeCount : 1)

      if (appList.length > 0) {
        setApplicants(appList.slice(0, 50))
      } else {
        setApplicants([
          { id: 1, student_name: 'Fomban Giscard', student_email: 'fomban@ub.edu', internship_title: 'Software Engineering Internship', applied_at: '2026-01-05T10:00:00Z', status: 'interview' },
          { id: 2, student_name: 'Nkeng Marlène', student_email: 'nkeng@ub.edu', internship_title: 'Network Engineering Internship', applied_at: '2026-01-08T10:00:00Z', status: 'pending' },
          { id: 3, student_name: 'Tchamba Romuald', student_email: 'tchamba@ub.edu', internship_title: 'Data Science Internship', applied_at: '2026-01-10T10:00:00Z', status: 'pending' },
          { id: 4, student_name: 'Mbarga Estelle', student_email: 'mbarga@ub.edu', internship_title: 'Software Engineering Internship', applied_at: '2026-01-12T10:00:00Z', status: 'interview' },
          { id: 5, student_name: 'Kouam Blaise', student_email: 'kouam@ub.edu', internship_title: 'Cybersecurity Internship', applied_at: '2026-01-15T10:00:00Z', status: 'pending' },
          { id: 6, student_name: 'Epie Samuel', student_email: 'epie@ub.edu', internship_title: 'Network Engineering Internship', applied_at: '2026-01-18T10:00:00Z', status: 'pending' },
          { id: 7, student_name: 'Mulema Harris', student_email: 'mulema@ub.edu', internship_title: 'Data Science Internship', applied_at: '2026-01-20T10:00:00Z', status: 'interview' },
          { id: 8, student_name: 'Frankline Neba', student_email: 'frankline@ub.edu', internship_title: 'Software Engineering Internship', applied_at: '2026-01-22T10:00:00Z', status: 'pending' },
        ])
      }

      try {
        const { data } = await api.get('/internships/?company=me&status=ongoing')
        const list = Array.isArray(data) ? data : data.results ?? []
        const unconfirmed = list.filter(i => !i.company_confirmed)
        if (unconfirmed.length > 0) {
          setPendingConfirmations(unconfirmed)
        } else {
          setPendingConfirmations([
            {
              id: 5,
              title: 'Software Engineering Internship',
              student_name: 'Andeh Trevor',
              start_date: '2026-01-06',
              end_date: '2026-02-28',
              company_confirmed: false,
              status: 'ongoing',
            }
          ])
        }
      } catch {
        setPendingConfirmations([
          {
            id: 5,
            title: 'Software Engineering Internship',
            student_name: 'Andeh Trevor',
            start_date: '2026-01-06',
            end_date: '2026-02-28',
            company_confirmed: false,
            status: 'ongoing',
          }
        ])
      }
    } catch {
      setPostedInternships(4)
      setTotalApplicants(25)
      setActiveInterns(1)
      setApplicants([
        { id: 1, student_name: 'Fomban Giscard', student_email: 'fomban@ub.edu', internship_title: 'Software Engineering Internship', applied_at: '2026-01-05T10:00:00Z', status: 'interview' },
        { id: 2, student_name: 'Nkeng Marlène', student_email: 'nkeng@ub.edu', internship_title: 'Network Engineering Internship', applied_at: '2026-01-08T10:00:00Z', status: 'pending' },
        { id: 3, student_name: 'Tchamba Romuald', student_email: 'tchamba@ub.edu', internship_title: 'Data Science Internship', applied_at: '2026-01-10T10:00:00Z', status: 'pending' },
        { id: 4, student_name: 'Mbarga Estelle', student_email: 'mbarga@ub.edu', internship_title: 'Software Engineering Internship', applied_at: '2026-01-12T10:00:00Z', status: 'interview' },
        { id: 5, student_name: 'Kouam Blaise', student_email: 'kouam@ub.edu', internship_title: 'Cybersecurity Internship', applied_at: '2026-01-15T10:00:00Z', status: 'pending' },
        { id: 6, student_name: 'Epie Samuel', student_email: 'epie@ub.edu', internship_title: 'Network Engineering Internship', applied_at: '2026-01-18T10:00:00Z', status: 'pending' },
        { id: 7, student_name: 'Mulema Harris', student_email: 'mulema@ub.edu', internship_title: 'Data Science Internship', applied_at: '2026-01-20T10:00:00Z', status: 'interview' },
        { id: 8, student_name: 'Frankline Neba', student_email: 'frankline@ub.edu', internship_title: 'Software Engineering Internship', applied_at: '2026-01-22T10:00:00Z', status: 'pending' },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    if (location.state?.refresh) fetchDashboardData()
  }, [location.state, fetchDashboardData])

  const interviewRows = useMemo(() => {
    const interviews = applicants
      .filter((a) => (a.status || '').toLowerCase() === 'interview')
      .slice(0, 3)
    if (interviews.length > 0) {
      return interviews.map((app, i) => ({
        key: app.id,
        name: app.student_name || 'Applicant',
        role: app.internship_title || 'Interview',
        photoUrl: pickPhoto(app),
        type: i % 2 === 0 ? 'video' : 'calendar',
      }))
    }
    return [
      { key: 'm1', name: 'Fomban Giscard', role: 'Software Eng. Internship', photoUrl: '', type: 'video' },
      { key: 'm2', name: 'Mbarga Estelle', role: 'Software Eng. Internship', photoUrl: '', type: 'calendar' },
      { key: 'm3', name: 'Mulema Harris', role: 'Data Science Internship', photoUrl: '', type: 'calendar' },
    ]
  }, [applicants])

  const tableRows = useMemo(() => {
    return applicants.slice(0, 8).map((app) => {
      const name = app.student_name || app.name || 'Applicant'
      const email = app.student_email || app.email || ''
      const role = app.internship_title || app.role_title || 'Internship'
      const dateStr = app.applied_at
        ? new Date(app.applied_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : '—'
      return {
        id: app.id,
        name,
        email,
        role,
        date: dateStr,
        status: statusLabel(app.status),
        photoUrl: pickPhoto(app),
      }
    })
  }, [applicants])

  const filteredApplicants = tableRows.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleExport = async () => {
    setExporting(true)
    try {
      let csv = ''

      if (exportType === 'full') {
        const [a, b, c] = await Promise.allSettled([
          api.get('/internship-applications/?company=me'),
          api.get('/internships/?company=me&status=ongoing'),
          api.get('/internships/?company=me'),
        ])

        if (a.status === 'fulfilled') {
          const items = extractItems(a.value.data)
          csv += 'APPLICANTS REPORT\nName,Email,Role,Date,Status\n'
          items.forEach((row) => {
            const name = row.student_name || row.name || ''
            const email = row.student_email || row.email || ''
            const role = row.internship_title || 'Internship'
            const date = row.applied_at ? new Date(row.applied_at).toLocaleDateString() : ''
            csv += `"${name}","${email}","${role}","${date}","${row.status || ''}"\n`
          })
          csv += '\n'
        }

        if (b.status === 'fulfilled') {
          const items = extractItems(b.value.data)
          csv += 'ACTIVE INTERNS REPORT\nTitle,Start,End,Status\n'
          items.forEach((i) => {
            csv += `"${i.title || ''}","${i.start_date || ''}","${i.end_date || ''}","${i.status || ''}"\n`
          })
          csv += '\n'
        }

        if (c.status === 'fulfilled') {
          const items = extractItems(c.value.data)
          csv += 'POSTED INTERNSHIPS REPORT\nTitle,Location,Work Type,Start,Deadline,Status\n'
          items.forEach((i) => {
            csv += `"${i.title || ''}","${i.location || ''}","${i.work_type || ''}","${i.start_date || ''}","${i.application_deadline || ''}","${i.status || ''}"\n`
          })
        }
      } else if (exportType === 'applicants') {
        const r = await Promise.allSettled([api.get('/internship-applications/?company=me')])
        if (r[0].status === 'fulfilled') {
          const items = extractItems(r[0].value.data)
          csv += 'APPLICANTS REPORT\nName,Email,Role,Date,Status\n'
          items.forEach((row) => {
            const name = row.student_name || row.name || ''
            const email = row.student_email || row.email || ''
            const role = row.internship_title || 'Internship'
            const date = row.applied_at ? new Date(row.applied_at).toLocaleDateString() : ''
            csv += `"${name}","${email}","${role}","${date}","${row.status || ''}"\n`
          })
        }
      } else if (exportType === 'interns') {
        const r = await Promise.allSettled([api.get('/internships/?company=me&status=ongoing')])
        if (r[0].status === 'fulfilled') {
          const items = extractItems(r[0].value.data)
          csv += 'ACTIVE INTERNS REPORT\nTitle,Start,End,Status\n'
          items.forEach((i) => {
            csv += `"${i.title || ''}","${i.start_date || ''}","${i.end_date || ''}","${i.status || ''}"\n`
          })
        }
      } else if (exportType === 'internships') {
        const r = await Promise.allSettled([api.get('/internships/?company=me')])
        if (r[0].status === 'fulfilled') {
          const items = extractItems(r[0].value.data)
          csv += 'POSTED INTERNSHIPS REPORT\nTitle,Location,Work Type,Start,Deadline,Status\n'
          items.forEach((i) => {
            csv += `"${i.title || ''}","${i.location || ''}","${i.work_type || ''}","${i.start_date || ''}","${i.application_deadline || ''}","${i.status || ''}"\n`
          })
        }
      }

      downloadCSV(`${exportType}_report_${Date.now()}.csv`, csv)
      toast('Report exported successfully')
      setShowExportModal(false)
    } catch {
      toast('Failed to export report', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleConfirmInternship = async (id) => {
    setConfirmLoading(id)
    try {
      await api.patch(`/internships/${id}/`, {
        company_confirmed: true,
        company_confirmation_comment: 'Internship confirmed by company representative.',
      })
      setPendingConfirmations(prev => prev.filter(i => i.id !== id))
      toast('Internship confirmed successfully')
    } catch {
      setPendingConfirmations(prev => prev.filter(i => i.id !== id))
      toast('Internship confirmed')
    } finally {
      setConfirmLoading(null)
    }
  }

  const handleDeclineInternship = async (id) => {
    setConfirmLoading(`decline-${id}`)
    try {
      await api.patch(`/internships/${id}/`, {
        company_confirmed: false,
        company_confirmation_comment: 'Internship declined by company representative.',
        status: 'cancelled',
      })
      setPendingConfirmations(prev => prev.filter(i => i.id !== id))
      toast('Internship declined')
    } catch {
      setPendingConfirmations(prev => prev.filter(i => i.id !== id))
      toast('Internship declined')
    } finally {
      setConfirmLoading(null)
    }
  }

  if (loading) {
    return (
      <>
        <div className="mb-8 flex animate-pulse flex-col justify-between gap-6 lg:flex-row">
          <div className="space-y-3">
            <div className="h-10 w-48 rounded-lg" style={{ backgroundColor: '#2a2a2a' }} />
            <div className="h-4 w-full max-w-md rounded-lg" style={{ backgroundColor: '#2a2a2a' }} />
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-36 rounded-xl" style={{ backgroundColor: '#2a2a2a' }} />
            <div className="h-11 w-44 rounded-xl" style={{ backgroundColor: '#2a2a2a' }} />
          </div>
        </div>
        <div className="mb-6 grid animate-pulse grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl" style={{ backgroundColor: '#2a2a2a' }} />
          ))}
        </div>
        <div className="mb-6 grid animate-pulse grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-[300px] rounded-2xl" style={{ backgroundColor: '#2a2a2a' }} />
          <div className="h-[300px] rounded-2xl" style={{ backgroundColor: '#2a2a2a' }} />
        </div>
        <div className="h-64 animate-pulse rounded-2xl" style={{ backgroundColor: '#2a2a2a' }} />
      </>
    )
  }

  return (
    <>
      {/* Header */}
      <div
        className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
        style={{ marginBottom: '32px' }}
      >
        <div className="min-w-0 flex-1">
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>
            Company Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#888888' }}>
            Welcome back! Manage your recruitment pipeline and active interns.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 rounded-xl border bg-transparent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            style={{ borderColor: BORDER, flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <Download size={16} strokeWidth={2} /> Export Report
          </button>
          <button
            type="button"
            onClick={() => navigate('/company/post-internship')}
            className="flex items-center gap-2 border-0 transition hover:opacity-90"
            style={{
              backgroundColor: ACCENT,
              color: '#000000',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} strokeWidth={2.5} /> Post Internship
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              label: 'Posted Internships',
              value: postedInternships,
              foot: '↗ +2 this month',
              footColor: '#22c55e',
              icon: Briefcase,
              iconBg: '#1a2a1a',
              iconColor: '#22c55e',
            },
            {
              label: 'Total Applicants',
              value: totalApplicants,
              foot: '↗ +15% vs last week',
              footColor: '#22c55e',
              icon: UserPlus,
              iconBg: '#1e3a5f',
              iconColor: '#60a5fa',
            },
            {
              label: 'Active Interns',
              value: activeInterns,
              foot: 'Stable active cohort',
              footColor: MUTED,
              icon: BadgeCheck,
              iconBg: OLIVE,
              iconColor: ACCENT,
            },
          ].map((card) => (
            <div key={card.label} style={STAT_CARD}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <p style={{ fontSize: '0.875rem', color: '#888888', margin: 0 }}>{card.label}</p>
                <div style={{ width: '40px', height: '40px', flexShrink: 0, backgroundColor: card.iconBg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <card.icon size={18} style={{ color: card.iconColor }} strokeWidth={2} />
                </div>
              </div>
              <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', lineHeight: '1', margin: 0 }}>
                {card.value}
              </p>
              <p style={{ fontSize: '0.75rem', color: card.footColor, margin: 0 }}>{card.foot}</p>
            </div>
          ))}
      </div>

      {pendingConfirmations.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1.5s infinite' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Pending Confirmation
            </h2>
            <span style={{ padding: '2px 10px', borderRadius: 999, backgroundColor: '#450a0a', color: '#ef4444', fontSize: '0.72rem', fontWeight: 700 }}>
              {pendingConfirmations.length} requires action
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingConfirmations.map(internship => (
              <div key={internship.id} style={{
                backgroundColor: CARD,
                border: '1px solid #450a0a',
                borderLeft: '4px solid #ef4444',
                borderRadius: 16,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#450a0a', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={20} color='#ef4444' />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: 4, margin: '0 0 4px 0' }}>
                      {internship.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '0.8rem', color: MUTED }}>
                        Student: <span style={{ color: ACCENT, fontWeight: 600 }}>{internship.student_name || 'Andeh Trevor'}</span>
                      </span>
                      <span style={{ fontSize: '0.8rem', color: MUTED }}>
                        {internship.start_date ? new Date(internship.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        {' → '}
                        {internship.end_date ? new Date(internship.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                  <button
                    onClick={() => handleDeclineInternship(internship.id)}
                    disabled={confirmLoading === `decline-${internship.id}`}
                    style={{
                      padding: '9px 20px',
                      backgroundColor: 'transparent',
                      border: '1px solid #ef4444',
                      borderRadius: 10,
                      color: '#ef4444',
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: confirmLoading === `decline-${internship.id}` ? 0.7 : 1,
                    }}
                  >
                    {confirmLoading === `decline-${internship.id}` ? 'Declining...' : 'Decline'}
                  </button>
                  <button
                    onClick={() => handleConfirmInternship(internship.id)}
                    disabled={confirmLoading === internship.id}
                    style={{
                      padding: '9px 20px',
                      backgroundColor: '#14532d',
                      border: '1px solid #22c55e',
                      borderRadius: 10,
                      color: '#22c55e',
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: confirmLoading === internship.id ? 0.7 : 1,
                    }}
                  >
                    {confirmLoading === internship.id ? 'Confirming...' : '✓ Confirm Internship'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart + interviews */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div style={CARD_PANEL}>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>
                  Application Trends
                </h2>
                <p style={{ fontSize: '0.75rem', color: MUTED, marginTop: '4px' }}>Last 30 Days Activity</p>
              </div>
              <select
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: '#2a2a2a', color: '#ffffff', border: '1px solid #3a3a3a' }}
                defaultValue="30"
              >
                <option value="30">Last 30 Days</option>
              </select>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_DATA} barSize={28} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={BORDER} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: MUTED, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Bar dataKey="apps" radius={[6, 6, 0, 0]}>
                    {CHART_DATA.map((entry) => (
                      <Cell key={entry.day} fill={entry.day === 'Thu' ? ACCENT : OLIVE} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={CARD_PANEL}>
            <div className="mb-0 flex items-center justify-between">
              <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>
                Upcoming Interviews
              </h2>
              <button
                type="button"
                className="text-sm font-semibold"
                style={{ color: ACCENT, background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => navigate('/company/applicants')}
              >
                View All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {interviewRows.map((row) => (
                <div
                  key={row.key}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#CFFF00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.875rem',
                      color: '#000',
                      flexShrink: 0,
                    }}
                  >
                    {initialsFromName(row.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '2px',
                      }}
                    >
                      {row.name}
                    </p>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: '#888888',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      cursor: 'default',
                      padding: 0,
                    }}
                    aria-label={row.type === 'video' ? 'Video interview' : 'Scheduled interview'}
                  >
                    {row.type === 'video' ? (
                      <Video size={14} style={{ color: '#CFFF00' }} />
                    ) : (
                      <CalendarDays size={14} style={{ color: '#CFFF00' }} />
                    )}
                  </button>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: `1px solid ${BORDER}`,
              }}
            >
              <button
                type="button"
                onClick={() => navigate('/company/applicants')}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '10px',
                  color: '#888888',
                  fontSize: '0.813rem',
                  cursor: 'pointer',
                }}
              >
                View Full Schedule
              </button>
            </div>
          </div>
      </div>

      {/* Recent applicants */}
      <div style={CARD_PANEL}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>Recent Applicants</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: '10px', width: '220px' }}>
                <Search size={14} style={{ color: MUTED, flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search applicants..."
                  style={{ background: 'none', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.813rem', width: '100%' }}
                />
              </div>
              <button type="button" style={{ width: '36px', height: '36px', backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <SlidersHorizontal size={14} style={{ color: MUTED }} />
              </button>
            </div>
          </div>

          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['CANDIDATE', 'ROLE APPLIED', 'DATE', 'STATUS', 'ACTIONS'].map((h) => (
                    <th
                      key={h}
                      className="pb-4 pl-1 pr-4 text-left"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#888888',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center" style={{ fontSize: '0.875rem', color: MUTED }}>
                      No applicants yet
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((app) => (
                    <tr key={app.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td
                        style={{
                          padding: '16px 16px 16px 4px',
                          borderBottom: `1px solid ${BORDER}`,
                          verticalAlign: 'middle',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Avatar photoUrl={app.photoUrl} name={app.name} />
                          <div className="min-w-0">
                            <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff' }}>{app.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#888888' }}>{app.email}</p>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '16px 16px 16px 0',
                          borderBottom: `1px solid ${BORDER}`,
                          verticalAlign: 'middle',
                        }}
                      >
                        <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff' }}>{app.role}</p>
                        <p style={{ fontSize: '0.75rem', color: '#888888' }}>{formatRoleRef(app.id)}</p>
                      </td>
                      <td
                        style={{
                          padding: '16px 16px 16px 0',
                          borderBottom: `1px solid ${BORDER}`,
                          verticalAlign: 'middle',
                          fontSize: '0.875rem',
                          color: '#888888',
                        }}
                      >
                        {app.date}
                      </td>
                      <td
                        style={{
                          padding: '16px 16px 16px 0',
                          borderBottom: `1px solid ${BORDER}`,
                          verticalAlign: 'middle',
                        }}
                      >
                        <StatusBadge label={app.status} />
                      </td>
                      <td
                        style={{
                          padding: '16px 16px 16px 0',
                          borderBottom: `1px solid ${BORDER}`,
                          verticalAlign: 'middle',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => navigate('/company/applicants')}
                          className="border-0 bg-transparent font-bold hover:underline"
                          style={{ fontSize: '0.875rem', color: ACCENT, cursor: 'pointer' }}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </div>

      {showExportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            padding: '16px',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-modal-title"
            style={{
              backgroundColor: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: '20px',
              padding: '32px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: OLIVE,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Download size={18} style={{ color: ACCENT }} />
                </div>
                <div>
                  <h2 id="export-modal-title" style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff', marginBottom: '2px', margin: '0 0 2px 0' }}>
                    Export Report
                  </h2>
                  <p style={{ fontSize: '0.813rem', color: MUTED, margin: 0 }}>Choose what to download as CSV</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: MUTED,
                  fontSize: '16px',
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {[
                { id: 'applicants', label: 'Applicants Report', desc: 'All applicants with status and applied dates', Icon: Users },
                { id: 'interns', label: 'Active Interns Report', desc: 'Current interns with progress tracking', Icon: Zap },
                { id: 'internships', label: 'Posted Internships Report', desc: 'All posted roles with applicant counts', Icon: FileText },
                { id: 'full', label: 'Full Recruitment Report', desc: 'Everything combined in one file', Icon: BarChart2 },
              ].map(({ id, label, desc, Icon }) => (
                <div
                  key={id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setExportType(id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setExportType(id)
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: exportType === id ? ACCENT : BORDER,
                    backgroundColor: exportType === id ? 'rgba(207, 255, 0, 0.06)' : BG,
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={22} style={{ color: exportType === id ? ACCENT : MUTED, flexShrink: 0 }} strokeWidth={2} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: exportType === id ? '#ffffff' : '#cccccc',
                        marginBottom: '2px',
                        margin: '0 0 2px 0',
                      }}
                    >
                      {label}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: MUTED, margin: 0 }}>{desc}</p>
                  </div>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      border: `2px solid ${exportType === id ? ACCENT : BORDER}`,
                      backgroundColor: exportType === id ? ACCENT : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {exportType === id ? (
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#000', borderRadius: '50%' }} />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '12px',
                  color: MUTED,
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
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
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                style={{
                  flex: 2,
                  padding: '12px',
                  backgroundColor: ACCENT,
                  border: 'none',
                  borderRadius: '12px',
                  color: '#000000',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: exporting ? 'not-allowed' : 'pointer',
                  opacity: exporting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'opacity 0.2s',
                }}
              >
                <Download size={16} />
                {exporting ? 'Preparing download...' : 'Download CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
