import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import {
  Users,
  ClipboardList,
  Building,
  FileText,
  Calendar,
  Plus,
  Search,
  MoreVertical,
  ChevronRight,
} from 'lucide-react'
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import api from '@/api/axios'

const chartData = [
  { day: 'Mon', rate: 65 },
  { day: 'Tue', rate: 72 },
  { day: 'Wed', rate: 68 },
  { day: 'Thu', rate: 95 },
  { day: 'Fri', rate: 88 },
  { day: 'Sat', rate: 75 },
  { day: 'Sun', rate: 80 },
]

const upcomingVisits = [
  { month: 'OCT', day: '24', title: 'TechCorp HQ Visit', time: '10:00 AM', location: 'Downtown' },
  { month: 'OCT', day: '28', title: 'Design Studio Review', time: '02:30 PM', location: 'Virtual' },
]

const mockPendingActions = [
  { id: 1, avatar: 'JD', title: 'Internship Proposal', subtitle: 'Jane Doe · ABC Corp', actionLabel: 'Review', studentId: 1 },
  { id: 2, avatar: 'JS', title: 'Monthly Logbook #2', subtitle: 'John Smith · TechSolutions Inc.', actionLabel: 'Sign', studentId: 2 },
  { id: 3, avatar: 'SL', title: 'Company Evaluation', subtitle: 'Sarah Lee · Creative Studios', actionLabel: 'Grade', studentId: 3 },
]

const mockStudents = [
  { id: 1, initials: 'EC', name: 'Emily Chen', company: 'Google', duration: '12 Weeks', progress: 75, currentWeek: 9, totalWeeks: 12, status: 'On Track' },
  { id: 2, initials: 'MB', name: 'Michael Brown', company: 'Tesla', duration: '24 Weeks', progress: 42, currentWeek: 10, totalWeeks: 24, status: 'Review Needed' },
  { id: 3, initials: 'LK', name: 'Linda Kim', company: 'StartUp Inc', duration: '12 Weeks', progress: 8, currentWeek: 1, totalWeeks: 12, status: 'Delayed' },
]

export default function SupervisorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [assignedStudents, setAssignedStudents] = useState(0)
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [activeCompanies, setActiveCompanies] = useState(0)
  const [reportsDue, setReportsDue] = useState(0)
  const [students, setStudents] = useState(mockStudents)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s1, s2, s3, s4, s5] = await Promise.allSettled([
          api.get('/students/?supervisor=me'),
          api.get('/logbooks/?review_status=pending'),
          api.get('/companies/?active=true'),
          api.get('/reports/?due_soon=true'),
          api.get('/internships/?supervisor=me'),
        ])
        if (s1.status === 'fulfilled')
          setAssignedStudents(
            s1.value.data?.count ??
              s1.value.data?.results?.length ??
              (Array.isArray(s1.value.data) ? s1.value.data.length : 0)
          )
        if (s2.status === 'fulfilled')
          setPendingApprovals(
            s2.value.data?.count ??
              s2.value.data?.results?.length ??
              (Array.isArray(s2.value.data) ? s2.value.data.length : 0)
          )
        if (s3.status === 'fulfilled')
          setActiveCompanies(
            s3.value.data?.count ??
              s3.value.data?.results?.length ??
              (Array.isArray(s3.value.data) ? s3.value.data.length : 0)
          )
        if (s4.status === 'fulfilled')
          setReportsDue(
            s4.value.data?.count ??
              s4.value.data?.results?.length ??
              (Array.isArray(s4.value.data) ? s4.value.data.length : 0)
          )
        if (s5.status === 'fulfilled') {
          const data = s5.value.data?.results || s5.value.data || []
          if (Array.isArray(data) && data.length > 0) {
            setStudents(
              data.map((inv, idx) => {
                const name = inv.student_name || inv.title || 'Student'
                const initials =
                  name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'ST'
                return {
                  id: inv.id ?? idx,
                  name,
                  initials,
                  company: inv.company_name || '—',
                  duration: '12 Weeks',
                  progress: 50,
                  currentWeek: 6,
                  totalWeeks: 12,
                  status: 'On Track',
                }
              })
            )
          }
        }
      } catch (err) {
        console.log('Dashboard error:', err)
      }
    }
    fetchData()
  }, [])

  const filteredStudents = students.filter(
    (s) =>
      (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.student_name && s.student_name.toLowerCase().includes(search.toLowerCase()))
  )

  const statCards = [
    {
      label: 'Assigned Students',
      value: assignedStudents,
      badge: '+2 new',
      badgeBg: '#14532d',
      badgeColor: '#22c55e',
      icon: <Users size={22} style={{ color: '#888888' }} />,
      yellow: false,
    },
    {
      label: 'Pending Approvals',
      value: pendingApprovals,
      badge: 'Urgent',
      badgeBg: '#ef4444',
      badgeColor: '#ffffff',
      icon: <ClipboardList size={22} style={{ color: '#000000' }} />,
      yellow: true,
    },
    {
      label: 'Active Companies',
      value: activeCompanies,
      badge: 'Stable',
      badgeBg: '#2a2a2a',
      badgeColor: '#888888',
      icon: <Building size={22} style={{ color: '#888888' }} />,
      yellow: false,
    },
    {
      label: 'Reports Due',
      value: reportsDue,
      badge: 'Due soon',
      badgeBg: '#450a0a',
      badgeColor: '#ef4444',
      icon: <FileText size={22} style={{ color: '#888888' }} />,
      yellow: false,
    },
  ]

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '8px', lineHeight: 1 }}>
            Dashboard Overview
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#888888' }}>
            Welcome back, {user?.first_name}. You have{' '}
            <span
              style={{ color: '#CFFF00', fontWeight: '700', borderBottom: '1px solid #CFFF00', cursor: 'pointer' }}
              onClick={() => navigate('/supervisor/approvals')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate('/supervisor/approvals')
                }
              }}
              role="link"
              tabIndex={0}
            >
              {pendingApprovals} pending items
            </span>{' '}
            today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#CFFF00'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2a'
            }}
          >
            <Calendar size={16} /> Schedule
          </button>
          <button
            type="button"
            onClick={() => navigate('/supervisor/students')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#CFFF00',
              border: 'none',
              borderRadius: '12px',
              color: '#000000',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(207,255,0,0.15)',
            }}
          >
            <Plus size={16} /> New Student
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {statCards.map((card) => {
          const isPendingApprovals = card.label === 'Pending Approvals'
          return (
          <div
            key={card.label}
            style={{
              backgroundColor: isPendingApprovals ? '#CFFF00' : '#1a1a1a',
              border: isPendingApprovals ? 'none' : '1px solid #2a2a2a',
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = isPendingApprovals ? '0 8px 24px rgba(207,255,0,0.2)' : '0 8px 24px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: '700',
                backgroundColor: card.badgeBg,
                color: card.badgeColor,
              }}
            >
              {card.badge}
            </span>
            <div style={{ marginBottom: '16px' }}>{card.icon}</div>
            <p style={{ fontSize: '0.813rem', color: isPendingApprovals ? '#000000' : '#888888', marginBottom: '6px', fontWeight: '500' }}>{card.label}</p>
            <p style={{ fontSize: '2.5rem', fontWeight: '800', color: isPendingApprovals ? '#000000' : '#ffffff', lineHeight: 1 }}>{card.value}</p>
          </div>
          )
        })}
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', marginBottom: '28px' }}>
        {/* Left — Pending Actions */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>Pending Actions</h2>
            <button
              type="button"
              onClick={() => navigate('/supervisor/approvals')}
              style={{ fontSize: '0.813rem', color: '#888888', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#888888'
              }}
            >
              View All
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mockPendingActions.map((action) => (
              <div
                key={action.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  backgroundColor: '#0f0f0f',
                  borderRadius: '12px',
                  border: '1px solid #2a2a2a',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  {action.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>{action.title}</p>
                  <p style={{ fontSize: '0.75rem', color: '#888888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/supervisor/students/${action.studentId}`)}
                  style={{
                    padding: '7px 14px',
                    backgroundColor: 'transparent',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#CFFF00'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2a2a2a'
                  }}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/supervisor/approvals')}
                  style={{
                    padding: '7px 14px',
                    backgroundColor: '#CFFF00',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000000',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {action.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Submission Rate Chart */}
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>Submission Rate</h3>
              <MoreVertical size={16} style={{ color: '#888888', cursor: 'pointer' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#888888', marginBottom: '16px' }}>Weekly trend analysis</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="supervisorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CFFF00" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#CFFF00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#ffffff', fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="rate" stroke="#CFFF00" strokeWidth={2} fill="url(#supervisorGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ↗ <strong>12% increase</strong> vs last week
            </p>
          </div>

          {/* Upcoming Visits */}
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>Upcoming Visits</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingVisits.map((visit, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 14px',
                    backgroundColor: '#0f0f0f',
                    borderRadius: '12px',
                    border: '1px solid #2a2a2a',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#CFFF00'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2a2a2a'
                  }}
                >
                  <div style={{ textAlign: 'center', flexShrink: 0, minWidth: '36px' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: '700', color: '#CFFF00', textTransform: 'uppercase', lineHeight: 1 }}>{visit.month}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', lineHeight: 1, marginTop: '2px' }}>{visit.day}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>{visit.title}</p>
                    <p style={{ fontSize: '0.75rem', color: '#888888' }}>
                      {visit.time} · {visit.location}
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: '#888888', flexShrink: 0 }} />
                </div>
              ))}
            </div>
            <button
              type="button"
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '10px',
                backgroundColor: '#0f0f0f',
                border: '1px solid #2a2a2a',
                borderRadius: '10px',
                color: '#888888',
                fontSize: '0.813rem',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#CFFF00'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2a2a2a'
                e.currentTarget.style.color = '#888888'
              }}
            >
              View Full Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Student Progress Table */}
      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>Assigned Students Progress</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', backgroundColor: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '10px' }}>
            <Search size={14} style={{ color: '#888888' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              style={{ background: 'none', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.813rem', width: '160px' }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
              {['Student Name', 'Company', 'Duration', 'Progress', 'Status', 'Action'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#888888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, i) => {
              const name = student.name || student.student_name || 'Unknown'
              const initials = name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
              const statusColor = student.status === 'On Track' ? '#22c55e' : student.status === 'Review Needed' ? '#CFFF00' : '#ef4444'
              const statusBg = student.status === 'On Track' ? '#14532d' : student.status === 'Review Needed' ? '#4a5a00' : '#450a0a'
              const progressColor = student.status === 'On Track' ? '#22c55e' : student.status === 'Review Needed' ? '#CFFF00' : '#ef4444'

              return (
                <tr
                  key={student.id ?? i}
                  style={{
                    borderBottom: i < filteredStudents.length - 1 ? '1px solid #2a2a2a' : 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0f0f0f'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  onClick={() => navigate(`/supervisor/students/${student.id}`)}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#CFFF00',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.75rem',
                          color: '#000',
                          flexShrink: 0,
                        }}
                      >
                        {student.initials || initials}
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>{name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.875rem', color: '#888888' }}>{student.company || student.company_name || 'N/A'}</td>
                  <td style={{ padding: '16px', fontSize: '0.875rem', color: '#888888' }}>{student.duration || 'N/A'}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ width: '120px', height: '6px', backgroundColor: '#2a2a2a', borderRadius: '999px', marginBottom: '4px' }}>
                      <div style={{ height: '6px', borderRadius: '999px', backgroundColor: progressColor, width: `${student.progress || 0}%` }} />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#888888' }}>
                      Week {student.currentWeek || 0} of {student.totalWeeks || 0}
                    </p>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: statusBg, color: statusColor }}>
                      {student.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888' }}
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <button
          type="button"
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#0f0f0f',
            border: '1px solid #2a2a2a',
            borderRadius: '10px',
            color: '#888888',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#CFFF00'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#2a2a2a'
            e.currentTarget.style.color = '#888888'
          }}
        >
          Load More Students
        </button>
      </div>
    </div>
  )
}
