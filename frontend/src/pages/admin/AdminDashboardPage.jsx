import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, GraduationCap, Building2, Briefcase, FileText, BookOpen, UserCheck, TrendingUp, CheckCircle, UserPlus } from 'lucide-react'
import api from '@/api/axios'

const C = {
  bg: '#0f0f0f', card: '#1a1a1a', accent: '#CFFF00',
  white: '#ffffff', muted: '#888888', border: '#2a2a2a', olive: '#4a5a00',
}

const MOCK_STATS = {
  users: 13, students: 2, companies: 4,
  internships: 5, logbooks: 11, reports: 1, supervisors: 2,
}

const MOCK_RECENT_USERS = [
  { id: 1, name: 'Andeh Trevor', email: 'trevorandeh@gmail.com', role: 'student', status: 'active', joined: '2026-01-03' },
  { id: 2, name: 'Fomban Giscard', email: 'fomban@ub.edu', role: 'student', status: 'active', joined: '2026-01-05' },
  { id: 3, name: 'John Supervisor', email: 'supervisor@ims.test', role: 'supervisor', status: 'active', joined: '2025-09-01' },
  { id: 4, name: 'Orange Cameroon', email: 'company@ims.test', role: 'company', status: 'active', joined: '2025-08-15' },
  { id: 5, name: 'IMS Coordinator', email: 'coordinator@ims.test', role: 'coordinator', status: 'active', joined: '2025-08-01' },
]

const MOCK_INTERNSHIPS = [
  { id: 5, title: 'Software Engineering Internship', company: 'Orange Cameroon', student: 'Andeh Trevor', status: 'ongoing', start: '2026-01-06', end: '2026-02-28' },
  { id: 1, title: 'Frontend Developer Intern', company: 'DataFlow Inc', student: 'Unassigned', status: 'open', start: '2026-04-01', end: '2026-06-30' },
  { id: 2, title: 'Backend Developer Intern', company: 'TechCorp', student: 'Unassigned', status: 'ongoing', start: '2026-01-15', end: '2026-03-15' },
  { id: 3, title: 'Data Analyst Intern', company: 'DataFlow Inc', student: 'Unassigned', status: 'open', start: '2026-04-30', end: '2026-07-31' },
  { id: 4, title: 'UI/UX Design Intern', company: 'TechCorp', student: 'Unassigned', status: 'open', start: '2026-03-31', end: '2026-06-30' },
]

const MOCK_ACTIVITY = [
  { id: 1, action: 'New student registered', detail: 'Andeh Trevor joined as Software Engineering student', time: '2 hours ago', type: 'user' },
  { id: 2, action: 'Internship confirmed', detail: 'Orange Cameroon confirmed Software Engineering Internship', time: '5 hours ago', type: 'success' },
  { id: 3, action: 'Report submitted', detail: 'Andeh Trevor submitted mid-term report — Grade: A', time: '1 day ago', type: 'report' },
  { id: 4, action: 'Logbook approved', detail: 'Dr. Kolle approved Week 8 logbook for Andeh Trevor', time: '2 days ago', type: 'success' },
  { id: 5, action: 'New company registered', detail: 'Nexttel Cameroon joined the platform', time: '3 days ago', type: 'company' },
]

function StatCard({ icon: Icon, label, value, color, iconBg, iconColor, sub, trend, trendColor = '#22c55e' }) {
  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', minHeight: 140, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '0.75rem', color: C.muted, marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</p>
        <p style={{ fontSize: '2.2rem', fontWeight: 900, color: color || C.white, lineHeight: 1, margin: 0 }}>{value}</p>
        {sub && <p style={{ fontSize: '0.72rem', color: C.muted, marginTop: 6 }}>{sub}</p>}
        {trend && (
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: trendColor, marginTop: 8, marginBottom: 0 }}>{trend}</p>
        )}
      </div>
      <div style={{ width: 48, height: 48, backgroundColor: iconBg || C.olive, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={iconColor || C.accent} />
      </div>
    </div>
  )
}

function RoleBadge({ role }) {
  const map = {
    student: { bg: C.olive, color: C.accent, label: 'Student' },
    supervisor: { bg: '#1e3a5f', color: '#60a5fa', label: 'Supervisor' },
    company: { bg: '#14532d', color: '#22c55e', label: 'Company' },
    coordinator: { bg: '#450a0a', color: '#ef4444', label: 'Coordinator' },
    admin: { bg: '#2a2a2a', color: C.muted, label: 'Admin' },
  }
  const s = map[role] || map.admin
  return (
    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function StatusBadge({ status }) {
  const map = {
    ongoing: { bg: C.olive, color: C.accent, label: 'Active' },
    open: { bg: '#14532d', color: '#22c55e', label: 'Open' },
    completed: { bg: '#1e3a5f', color: '#60a5fa', label: 'Completed' },
    cancelled: { bg: '#2a2a2a', color: C.muted, label: 'Closed' },
    active: { bg: '#14532d', color: '#22c55e', label: 'Active' },
  }
  const s = map[status] || map.open
  return (
    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function ActivityIcon({ type }) {
  const map = {
    user: { bg: C.olive, color: C.accent, icon: Users },
    success: { bg: '#14532d', color: '#22c55e', icon: CheckCircle },
    report: { bg: '#1e3a5f', color: '#60a5fa', icon: FileText },
    company: { bg: '#2a1a5e', color: '#a78bfa', icon: Building2 },
  }
  const s = map[type] || map.user
  const Icon = s.icon
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={16} color={s.color} />
    </div>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('T')[0].split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(MOCK_STATS)
  const [users, setUsers] = useState(MOCK_RECENT_USERS)
  const [internships, setInternships] = useState(MOCK_INTERNSHIPS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [uRes, sRes, cRes, iRes, lRes, rRes] = await Promise.allSettled([
          api.get('/auth/users/'),
          api.get('/students/'),
          api.get('/companies/'),
          api.get('/internships/'),
          api.get('/logbooks/'),
          api.get('/reports/'),
        ])
        const count = (r) => {
          if (r.status !== 'fulfilled') return null
          const d = r.value.data
          if (typeof d.count === 'number') return d.count
          if (Array.isArray(d)) return d.length
          if (Array.isArray(d.results)) return d.results.length
          return null
        }
        setStats({
          users: count(uRes) ?? MOCK_STATS.users,
          students: count(sRes) ?? MOCK_STATS.students,
          companies: count(cRes) ?? MOCK_STATS.companies,
          internships: count(iRes) ?? MOCK_STATS.internships,
          logbooks: count(lRes) ?? MOCK_STATS.logbooks,
          reports: count(rRes) ?? MOCK_STATS.reports,
          supervisors: MOCK_STATS.supervisors,
        })
        if (iRes.status === 'fulfilled') {
          const list = Array.isArray(iRes.value.data) ? iRes.value.data : iRes.value.data.results ?? []
          if (list.length > 0) {
            setInternships(list.map(i => ({
              id: i.id,
              title: i.title || 'Internship',
              company: i.company_name || '—',
              student: i.student_name || 'Unassigned',
              status: i.status,
              start: i.start_date,
              end: i.end_date,
            })))
          }
        }
      } catch {}
    }
    load()
  }, [])

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh' }}>
      <style>
        {`
          .admin-scroll::-webkit-scrollbar { width: 4px }
          .admin-scroll::-webkit-scrollbar-track { background: #1a1a1a }
          .admin-scroll::-webkit-scrollbar-thumb { background: #CFFF00; border-radius: 4px }
          @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        `}
      </style>

      {/* Page Header */}
      <div style={{ marginBottom: 32, borderLeft: '4px solid #CFFF00', paddingLeft: 16 }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: C.white, marginBottom: 6, marginTop: 0 }}>Admin Dashboard</h1>
        <p style={{ fontSize: '0.875rem', color: C.muted, margin: 0 }}>System overview — University of Buea Internship Management System</p>
      </div>

      {/* Quick actions */}
      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: '18px 20px', marginBottom: 28 }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginBottom: 10, marginTop: 0 }}>
          Quick Actions
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: 12,
              padding: '11px 20px',
              color: '#888888',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#60a5fa'
              e.currentTarget.style.color = '#60a5fa'
              e.currentTarget.style.backgroundColor = '#1e3a5f22'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2a'
              e.currentTarget.style.color = '#888888'
              e.currentTarget.style.backgroundColor = '#1a1a1a'
            }}
          >
            <UserPlus size={18} color="#60a5fa" />
            Add User
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/reports')}
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: 12,
              padding: '11px 20px',
              color: '#888888',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f97316'
              e.currentTarget.style.color = '#f97316'
              e.currentTarget.style.backgroundColor = '#43140722'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2a'
              e.currentTarget.style.color = '#888888'
              e.currentTarget.style.backgroundColor = '#1a1a1a'
            }}
          >
            <FileText size={18} color="#f97316" />
            View Reports
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/internships')}
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: 12,
              padding: '11px 20px',
              color: '#888888',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#CFFF00'
              e.currentTarget.style.color = '#CFFF00'
              e.currentTarget.style.backgroundColor = '#4a5a0022'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2a'
              e.currentTarget.style.color = '#888888'
              e.currentTarget.style.backgroundColor = '#1a1a1a'
            }}
          >
            <Briefcase size={18} color="#CFFF00" />
            Manage Internships
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Users} label="Total Users" value={stats.users} color={C.white} iconBg='#1e3a5f' iconColor='#60a5fa' sub="All registered accounts" trend="↑ 2 this week" />
        <StatCard icon={GraduationCap} label="Students" value={stats.students} color={C.accent} iconBg={C.olive} iconColor={C.accent} sub="Active interns" trend="↑ 1 this month" />
        <StatCard icon={Building2} label="Companies" value={stats.companies} color='#22c55e' iconBg='#14532d' iconColor='#22c55e' sub="Registered companies" trend="Stable" trendColor="#888888" />
        <StatCard icon={Briefcase} label="Internships" value={stats.internships} color='#60a5fa' iconBg='#1e3a5f' iconColor='#60a5fa' sub="Total created" trend="↑ 1 this week" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard icon={UserCheck} label="Supervisors" value={stats.supervisors} color='#a78bfa' iconBg='#2a1a5e' iconColor='#a78bfa' sub="Faculty supervisors" trend="Stable" trendColor="#888888" />
        <StatCard icon={BookOpen} label="Logbook Entries" value={stats.logbooks} color={C.white} iconBg={C.olive} iconColor={C.accent} sub="Total submitted" trend="↑ 3 this week" />
        <StatCard icon={FileText} label="Reports" value={stats.reports} color='#f97316' iconBg='#431407' iconColor='#f97316' sub="Submitted reports" trend="↑ 1 this month" />
      </div>

      {/* Main content — 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 }}>

        {/* Internships Table */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Briefcase size={18} color={C.accent} />
              <p style={{ fontWeight: 800, color: C.white, fontSize: '1rem', margin: 0 }}>All Internships</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: C.muted }}>{internships.length} total</span>
          </div>
          <div className="admin-scroll" style={{ maxHeight: 380, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f0f0f' }}>
                  {['Title', 'Company', 'Student', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {internships.map((i, idx) => (
                  <tr
                    key={i.id}
                    style={{
                      borderBottom: idx < internships.length - 1 ? `1px solid ${C.border}` : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#111111' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: C.white, fontWeight: 600 }}>{i.title}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: C.muted }}>{i.company}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: i.student === 'Unassigned' ? C.muted : C.accent, fontWeight: i.student !== 'Unassigned' ? 600 : 400 }}>{i.student}</td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, height: 420, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <TrendingUp size={18} color={C.accent} />
            <p style={{ fontWeight: 800, color: C.white, fontSize: '1rem', margin: 0 }}>Recent Activity</p>
          </div>
          <div className="admin-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {MOCK_ACTIVITY.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: i < MOCK_ACTIVITY.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <ActivityIcon type={a.type} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: C.white, margin: '0 0 3px' }}>{a.action}</p>
                  <p style={{ fontSize: '0.78rem', color: C.muted, margin: '0 0 4px', lineHeight: 1.5 }}>{a.detail}</p>
                  <p style={{ fontSize: '0.72rem', color: '#555', margin: 0 }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={18} color={C.accent} />
            <p style={{ fontWeight: 800, color: C.white, fontSize: '1rem', margin: 0 }}>Recent Users</p>
          </div>
          <span style={{ fontSize: '0.75rem', color: C.muted }}>{stats.users} total registered</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f0f0f' }}>
              {['User', 'Email', 'Role', 'Status', 'Joined'].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : 'none' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0f0f0f'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', color: '#000', flexShrink: 0 }}>
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: C.white }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: C.muted }}>{u.email}</td>
                <td style={{ padding: '14px 20px' }}><RoleBadge role={u.role} /></td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                    Active
                  </span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: C.muted }}>{fmtDate(u.joined)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
