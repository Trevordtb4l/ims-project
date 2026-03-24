import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import api from '@/api/axios'
import {
  Users,
  ClipboardList,
  Building,
  FileText,
  ChevronRight,
  Calendar,
  Plus,
  Search,
  MoreHorizontal,
  MoreVertical,
  TrendingUp,
} from 'lucide-react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'

const CHART_DATA = [
  { day: 'Mon', rate: 65 },
  { day: 'Tue', rate: 72 },
  { day: 'Wed', rate: 68 },
  { day: 'Thu', rate: 95 },
  { day: 'Fri', rate: 88 },
  { day: 'Sat', rate: 75 },
  { day: 'Sun', rate: 80 },
]

const UPCOMING_VISITS = [
  { month: 'OCT', day: '24', title: 'TechCorp HQ Visit', time: '10:00 AM', location: 'Downtown' },
  { month: 'OCT', day: '28', title: 'Design Studio Review', time: '02:30 PM', location: 'Virtual' },
]

const MOCK_TABLE = [
  {
    id: 1,
    name: 'Emily Chen',
    initials: 'EC',
    company: 'Google',
    duration: '12 Weeks',
    progress: 75,
    currentWeek: 9,
    totalWeeks: 12,
    status: 'On Track',
  },
  {
    id: 2,
    name: 'Michael Brown',
    initials: 'MB',
    company: 'Tesla',
    duration: '24 Weeks',
    progress: 42,
    currentWeek: 10,
    totalWeeks: 24,
    status: 'Review Needed',
  },
  {
    id: 3,
    name: 'Linda Kim',
    initials: 'LK',
    company: 'StartUp Inc',
    duration: '12 Weeks',
    progress: 8,
    currentWeek: 1,
    totalWeeks: 12,
    status: 'Delayed',
  },
]

function countFromResponse(data) {
  if (data == null) return 0
  if (typeof data.count === 'number') return data.count
  if (Array.isArray(data)) return data.length
  if (Array.isArray(data.results)) return data.results.length
  return 0
}

function listFromResponse(data) {
  if (Array.isArray(data)) return data
  if (data?.results) return data.results
  return []
}

function initialsFromName(name) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function mapInternshipToRow(item, idx) {
  const student = item.student_detail || item.student || {}
  const name =
    student.user_full_name ||
    [student.user?.first_name, student.user?.last_name].filter(Boolean).join(' ') ||
    item.student_name ||
    `Student ${idx + 1}`
  const company = item.company_name || item.company?.name || '—'
  const start = item.start_date ? new Date(item.start_date) : null
  const end = item.end_date ? new Date(item.end_date) : null
  let totalWeeks = 12
  let currentWeek = 1
  if (start && end) {
    const ms = end - start
    totalWeeks = Math.max(1, Math.round(ms / (7 * 24 * 3600 * 1000)))
    const now = Date.now()
    const elapsed = Math.max(0, now - start.getTime())
    currentWeek = Math.min(totalWeeks, Math.max(1, Math.ceil(elapsed / (7 * 24 * 3600 * 1000))))
  }
  const progress = totalWeeks ? Math.round((currentWeek / totalWeeks) * 100) : 50
  let status = 'On Track'
  if (progress < 25) status = 'Delayed'
  else if (progress < 60) status = 'Review Needed'
  return {
    id: item.id ?? student.id ?? idx,
    studentPk: student.id,
    name,
    initials: initialsFromName(name),
    company,
    duration: totalWeeks ? `${totalWeeks} Weeks` : '—',
    progress: Math.min(100, progress),
    currentWeek,
    totalWeeks,
    status,
  }
}

function SkeletonBlock() {
  return (
    <div className="min-h-screen pt-0" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse rounded-2xl h-24 mb-8" style={{ backgroundColor: '#2a2a2a' }} />
      <div className="grid grid-cols-4 gap-4 mb-8 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl h-36" style={{ backgroundColor: '#2a2a2a' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mb-8">
        <div className="animate-pulse rounded-2xl h-80" style={{ backgroundColor: '#2a2a2a' }} />
        <div className="space-y-4">
          <div className="animate-pulse rounded-2xl h-56" style={{ backgroundColor: '#2a2a2a' }} />
          <div className="animate-pulse rounded-2xl h-48" style={{ backgroundColor: '#2a2a2a' }} />
        </div>
      </div>
      <div className="animate-pulse rounded-2xl h-96" style={{ backgroundColor: '#2a2a2a' }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [assignedStudents, setAssignedStudents] = useState(0)
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [activeCompanies, setActiveCompanies] = useState(0)
  const [reportsDue, setReportsDue] = useState(0)
  const [pendingActions, setPendingActions] = useState([])
  const [internships, setInternships] = useState([])
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [s1, s2, s3, s4, s5] = await Promise.allSettled([
      api.get('/students/?supervisor=me'),
      api.get('/logbooks/?review_status=pending'),
      api.get('/companies/?active=true'),
      api.get('/reports/?due_soon=true'),
      api.get('/internships/?supervisor=me'),
    ])

    if (s1.status === 'fulfilled') setAssignedStudents(countFromResponse(s1.value.data))
    if (s2.status === 'fulfilled') setPendingApprovals(countFromResponse(s2.value.data))
    if (s3.status === 'fulfilled') setActiveCompanies(countFromResponse(s3.value.data))
    if (s4.status === 'fulfilled') setReportsDue(countFromResponse(s4.value.data))
    if (s5.status === 'fulfilled') setInternships(listFromResponse(s5.value.data))

    if (s2.status === 'fulfilled') {
      const logs = listFromResponse(s2.value.data)
      setPendingActions(logs.slice(0, 3))
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const firstName = user?.first_name || 'Supervisor'

  const tableRows = useMemo(() => {
    if (internships.length) return internships.map(mapInternshipToRow)
    return MOCK_TABLE
  }, [internships])

  const filteredStudents = useMemo(
    () =>
      tableRows.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [tableRows, search]
  )

  const pendingList = useMemo(() => {
    if (pendingActions.length) {
      return pendingActions.map((item, idx) => {
        const name = item.student_name || 'Student'
        const company = item.company_name || item.company || 'Company'
        const week = item.week_number ?? idx + 1
        const titles = [
          `Internship Proposal — ${name}`,
          `Monthly Logbook #${week} — ${name}`,
          `Company Evaluation — ${name}`,
        ]
        return {
          id: item.id,
          studentId: item.student_id ?? item.student,
          avatar: initialsFromName(name),
          title: titles[idx] || `Logbook Week ${week}`,
          subtitle: `${company} · Week ${week}`,
          actionLabel: ['Review', 'Sign', 'Grade'][idx] || 'Review',
        }
      })
    }
    return [
      {
        id: 'm1',
        studentId: 1,
        avatar: 'JD',
        title: 'Internship Proposal',
        subtitle: 'Jane Doe · TechCorp',
        actionLabel: 'Review',
      },
      {
        id: 'm2',
        studentId: 2,
        avatar: 'JS',
        title: 'Monthly Logbook #2',
        subtitle: 'John Smith · DataFlow',
        actionLabel: 'Sign',
      },
      {
        id: 'm3',
        studentId: 3,
        avatar: 'SL',
        title: 'Company Evaluation',
        subtitle: 'Sarah Lee · CloudBase',
        actionLabel: 'Grade',
      },
    ]
  }, [pendingActions])

  if (loading) return <SkeletonBlock />

  return (
    <div className="min-h-screen pt-0" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-white font-bold text-4xl mb-2">Dashboard Overview</h1>
          <p style={{ color: '#888888' }}>
            Welcome back, {firstName}. You have{' '}
            <span
              className="font-bold cursor-pointer"
              style={{ color: '#CFFF00', textDecoration: 'underline' }}
              onClick={() => navigate('/supervisor/approvals')}
              role="button"
            >
              {pendingApprovals} pending items
            </span>{' '}
            today.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/supervisor/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-0 cursor-pointer"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ffffff' }}
          >
            <Calendar size={16} /> Schedule
          </button>
          <button
            type="button"
            onClick={() => navigate('/supervisor/students')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-0 cursor-pointer"
            style={{ backgroundColor: '#CFFF00', color: '#000000' }}
          >
            <Plus size={16} /> New Student
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div
          className="relative rounded-2xl border p-6"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <span
            className="absolute right-4 top-4 rounded-full px-2 py-1 text-xs font-bold"
            style={{ backgroundColor: '#14532d', color: '#22c55e' }}
          >
            +2 new
          </span>
          <Users size={24} className="mb-3 block" style={{ color: '#888888' }} />
          <p className="mb-2 text-sm" style={{ color: '#888888' }}>
            Assigned Students
          </p>
          <p className="text-4xl font-bold text-white">{assignedStudents}</p>
        </div>

        <div className="relative rounded-2xl border p-6" style={{ backgroundColor: '#CFFF00', borderColor: '#CFFF00' }}>
          <span
            className="absolute right-4 top-4 rounded-full px-2 py-1 text-xs font-bold"
            style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
          >
            Urgent
          </span>
          <ClipboardList size={24} className="mb-3 block" style={{ color: '#000000' }} />
          <p className="mb-2 text-sm" style={{ color: '#000000' }}>
            Pending Approvals
          </p>
          <p className="text-4xl font-bold" style={{ color: '#000000' }}>
            {pendingApprovals}
          </p>
        </div>

        <div
          className="relative rounded-2xl border p-6"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <span
            className="absolute right-4 top-4 rounded-full px-2 py-1 text-xs"
            style={{ backgroundColor: '#2a2a2a', color: '#888888' }}
          >
            Stable
          </span>
          <Building size={24} className="mb-3 block" style={{ color: '#888888' }} />
          <p className="mb-2 text-sm" style={{ color: '#888888' }}>
            Active Companies
          </p>
          <p className="text-4xl font-bold text-white">{activeCompanies}</p>
        </div>

        <div
          className="relative rounded-2xl border p-6"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <span
            className="absolute right-4 top-4 rounded-full px-2 py-1 text-xs font-bold"
            style={{ backgroundColor: '#450a0a', color: '#ef4444' }}
          >
            Due soon
          </span>
          <FileText size={24} className="mb-3 block" style={{ color: '#888888' }} />
          <p className="mb-2 text-sm" style={{ color: '#888888' }}>
            Reports Due
          </p>
          <p className="text-4xl font-bold text-white">{reportsDue}</p>
        </div>
      </div>

      {/* Two columns: Pending | Chart + Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mb-8">
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-xl">Pending Actions</h2>
            <button
              type="button"
              onClick={() => navigate('/supervisor/approvals')}
              className="text-sm border-0 bg-transparent cursor-pointer hover:opacity-80"
              style={{ color: '#888888' }}
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {pendingList.map((action, i) => (
              <div
                key={action.id ?? i}
                className="flex items-center gap-4 p-4 rounded-xl flex-wrap sm:flex-nowrap"
                style={{ backgroundColor: '#0f0f0f' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: '#CFFF00', color: '#000' }}
                >
                  {action.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{action.title}</p>
                  <p className="text-xs truncate" style={{ color: '#888888' }}>
                    {action.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      action.studentId ? `/supervisor/students/${action.studentId}` : '/supervisor/students'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border shrink-0"
                  style={{ borderColor: '#2a2a2a', color: '#ffffff', backgroundColor: 'transparent' }}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      action.actionLabel === 'Grade'
                        ? '/supervisor/reports'
                        : `/supervisor/approvals/${action.id ?? i}`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 border-0 cursor-pointer"
                  style={{ backgroundColor: '#CFFF00', color: '#000000' }}
                >
                  {action.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-white font-bold">Submission Rate</h2>
              <MoreHorizontal size={16} style={{ color: '#888888' }} />
            </div>
            <p className="text-xs mb-4" style={{ color: '#888888' }}>
              Weekly trend analysis
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={CHART_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CFFF00" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#CFFF00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Area type="monotone" dataKey="rate" fill="url(#chartGradient)" stroke="none" />
                <Line type="monotone" dataKey="rate" stroke="#CFFF00" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#22c55e' }}>
              <TrendingUp size={14} /> 12% increase vs last week
            </p>
          </div>

          <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <h2 className="text-white font-bold mb-4">Upcoming Visits</h2>
            <div className="space-y-3">
              {UPCOMING_VISITS.map((visit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl"
                  style={{ backgroundColor: '#0f0f0f' }}
                >
                  <div className="text-center flex-shrink-0 min-w-[48px]">
                    <p className="text-xs font-bold uppercase" style={{ color: '#CFFF00' }}>
                      {visit.month}
                    </p>
                    <p className="text-2xl font-bold text-white">{visit.day}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{visit.title}</p>
                    <p className="text-xs truncate" style={{ color: '#888888' }}>
                      {visit.time} · {visit.location}
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: '#888888' }} className="shrink-0" />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/supervisor/dashboard')}
              className="w-full mt-4 py-2 rounded-xl text-sm font-medium border-0 cursor-pointer"
              style={{ backgroundColor: '#0f0f0f', color: '#888888', border: '1px solid #2a2a2a' }}
            >
              View Full Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Student progress table — full width */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-white font-bold text-xl">Assigned Students Progress</h2>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ backgroundColor: '#0f0f0f', border: '1px solid #2a2a2a' }}
          >
            <Search size={16} style={{ color: '#888888' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className="bg-transparent outline-none text-sm text-white border-0"
              style={{ width: 160 }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Student Name', 'Company', 'Duration', 'Progress', 'Status', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-3 text-xs font-medium uppercase pr-2"
                    style={{ color: '#888888' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="cursor-pointer transition-colors hover:bg-[#0f0f0f]"
                  style={{ borderBottom: '1px solid #2a2a2a' }}
                  onClick={() =>
                    navigate(`/supervisor/students/${student.studentPk ?? student.id}`)
                  }
                >
                  <td className="py-4 pr-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                        style={{ backgroundColor: '#CFFF00', color: '#000' }}
                      >
                        {student.initials}
                      </div>
                      <span className="text-white font-medium text-sm">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm pr-2" style={{ color: '#888888' }}>
                    {student.company}
                  </td>
                  <td className="py-4 text-sm pr-2" style={{ color: '#888888' }}>
                    {student.duration}
                  </td>
                  <td className="py-4 pr-2">
                    <div className="w-32 rounded-full h-2" style={{ backgroundColor: '#2a2a2a' }}>
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${student.progress}%`,
                          backgroundColor:
                            student.status === 'On Track'
                              ? '#22c55e'
                              : student.status === 'Review Needed'
                                ? '#CFFF00'
                                : '#ef4444',
                        }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#888888' }}>
                      Week {student.currentWeek} of {student.totalWeeks}
                    </p>
                  </td>
                  <td className="py-4 pr-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold inline-block"
                      style={{
                        backgroundColor:
                          student.status === 'On Track'
                            ? '#14532d'
                            : student.status === 'Review Needed'
                              ? '#4a5a00'
                              : '#450a0a',
                        color:
                          student.status === 'On Track'
                            ? '#22c55e'
                            : student.status === 'Review Needed'
                              ? '#CFFF00'
                              : '#ef4444',
                      }}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      type="button"
                      style={{ color: '#888888', background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: '#888888' }}>
            No students match your search.
          </p>
        )}
        <button
          type="button"
          className="w-full mt-6 py-3 rounded-xl text-sm font-medium border-0 cursor-pointer"
          style={{ backgroundColor: '#0f0f0f', color: '#888888', border: '1px solid #2a2a2a' }}
        >
          Load More Students
        </button>
      </div>
      </div>
    </div>
  )
}
