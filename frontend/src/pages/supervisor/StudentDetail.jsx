import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Star, BookOpen, Award, Building, Calendar, Mail, Phone } from 'lucide-react'
import api from '@/api/axios'

const MOCK_DATA = {
  2: {
    student: { id:2, first_name:'Epie', last_name:'Samuel', matricule:'CT23A022', email:'epie.samuel@ub.edu', phone:'+237670000002', program:'B.Tech Computer Science', department:'Computer Engineering', company:'MTN Cameroon', role:'Software Developer Intern', start_date:'2026-01-06', end_date:'2026-02-28', status:'ongoing', progress:75, currentWeek:6, totalWeeks:8, internship_id:null },
    logbooks: [
      { id:null, week_number:6, activities:'Developed mobile payment integration module for MTN MoMo API. Tested on staging environment.', submitted_at:'2026-02-10T10:00:00Z', review_status:'approved', supervisor_comment:'Good work on the payment module.' },
      { id:null, week_number:5, activities:'Built customer dashboard UI with React. Implemented data visualization charts for usage statistics.', submitted_at:'2026-02-03T10:00:00Z', review_status:'approved', supervisor_comment:'Clean UI work.' },
      { id:null, week_number:4, activities:'Worked on backend API for subscriber management system. Fixed critical bugs in the billing module.', submitted_at:'2026-01-27T10:00:00Z', review_status:'pending', supervisor_comment:null },
      { id:null, week_number:3, activities:'Attended sprint planning and daily standups. Started work on the network monitoring dashboard.', submitted_at:'2026-01-20T10:00:00Z', review_status:'approved', supervisor_comment:'Good progress.' },
      { id:null, week_number:2, activities:'Set up development environment and reviewed existing codebase. Completed onboarding tasks.', submitted_at:'2026-01-13T10:00:00Z', review_status:'approved', supervisor_comment:'Good.' },
      { id:null, week_number:1, activities:'First week orientation, met the team, reviewed project requirements and tech stack.', submitted_at:'2026-01-06T10:00:00Z', review_status:'approved', supervisor_comment:'Welcome to the team!' },
    ]
  },
  3: {
    student: { id:3, first_name:'Mulema', last_name:'Harris', matricule:'CT22A015', email:'mulema.harris@ub.edu', phone:'+237670000003', program:'B.Tech Information Systems', department:'Computer Engineering', company:'Afriland First Bank', role:'IT Systems Intern', start_date:'2026-01-13', end_date:'2026-03-07', status:'ongoing', progress:50, currentWeek:4, totalWeeks:8, internship_id:null },
    logbooks: [
      { id:null, week_number:4, activities:'Worked on core banking system integration. Documented API endpoints for internal use.', submitted_at:'2026-02-03T10:00:00Z', review_status:'needs_revision', supervisor_comment:'Please provide more detail on the integration approach.' },
      { id:null, week_number:3, activities:'Assisted in database migration from legacy system. Wrote SQL scripts for data transformation.', submitted_at:'2026-01-27T10:00:00Z', review_status:'approved', supervisor_comment:'Good SQL work.' },
      { id:null, week_number:2, activities:'Reviewed banking software architecture. Attended meetings with the IT infrastructure team.', submitted_at:'2026-01-20T10:00:00Z', review_status:'approved', supervisor_comment:'Good.' },
      { id:null, week_number:1, activities:'Completed security clearance and onboarding. Set up workstation and reviewed compliance guidelines.', submitted_at:'2026-01-13T10:00:00Z', review_status:'approved', supervisor_comment:'Good start.' },
    ]
  },
  4: {
    student: { id:4, first_name:'Frankline', last_name:'Neba', matricule:'CT22A009', email:'frankline.neba@ub.edu', phone:'+237670000004', program:'B.Tech Computer Engineering', department:'Computer Engineering', company:'Camtel', role:'Network Engineering Intern', start_date:'2026-01-20', end_date:'2026-03-14', status:'ongoing', progress:25, currentWeek:2, totalWeeks:8, internship_id:null },
    logbooks: [
      { id:null, week_number:2, activities:'Assisted in network configuration and monitoring. Attended training on Cisco router setup.', submitted_at:'2026-01-27T10:00:00Z', review_status:'pending', supervisor_comment:null },
      { id:null, week_number:1, activities:'First week at Camtel. Completed onboarding, received equipment and access credentials.', submitted_at:'2026-01-20T10:00:00Z', review_status:'approved', supervisor_comment:'Good start, focus on improving report detail.' },
    ]
  },
  5: {
    student: { id:5, first_name:'Austine', last_name:'Mbah', matricule:'CT23A031', email:'austine.mbah@ub.edu', phone:'+237670000005', program:'B.Tech Software Engineering', department:'Computer Engineering', company:'Express Union', role:'FinTech Developer Intern', start_date:'2026-01-06', end_date:'2026-02-28', status:'ongoing', progress:88, currentWeek:7, totalWeeks:8, internship_id:null },
    logbooks: [
      { id:null, week_number:7, activities:'Completed integration of mobile money transfer module. Conducted user acceptance testing with QA team.', submitted_at:'2026-02-17T10:00:00Z', review_status:'pending', supervisor_comment:null },
      { id:null, week_number:6, activities:'Built transaction history dashboard with filtering and export features. Optimized SQL queries.', submitted_at:'2026-02-10T10:00:00Z', review_status:'approved', supervisor_comment:'Excellent work.' },
      { id:null, week_number:5, activities:'Implemented fraud detection algorithm for flagging suspicious transactions.', submitted_at:'2026-02-03T10:00:00Z', review_status:'approved', supervisor_comment:'Very impressive work.' },
      { id:null, week_number:4, activities:'Developed REST API for account management. Wrote Postman test collections.', submitted_at:'2026-01-27T10:00:00Z', review_status:'approved', supervisor_comment:'Good.' },
      { id:null, week_number:3, activities:'Started work on the core transaction processing engine. Reviewed existing codebase.', submitted_at:'2026-01-20T10:00:00Z', review_status:'approved', supervisor_comment:'Good progress.' },
      { id:null, week_number:2, activities:'Set up development environment and completed onboarding training on FinTech regulations.', submitted_at:'2026-01-13T10:00:00Z', review_status:'approved', supervisor_comment:'Good.' },
      { id:null, week_number:1, activities:'First week orientation at Express Union. Met the development team and reviewed project scope.', submitted_at:'2026-01-06T10:00:00Z', review_status:'approved', supervisor_comment:'Welcome!' },
    ]
  },
  6: {
    student: { id:6, first_name:'Brice', last_name:'Cheumani', matricule:'CT23A044', email:'brice.cheumani@ub.edu', phone:'+237670000006', program:'B.Tech Network Engineering', department:'Computer Engineering', company:'Nexttel Cameroon', role:'Network Intern', start_date:'2026-01-13', end_date:'2026-03-07', status:'ongoing', progress:62, currentWeek:5, totalWeeks:8, internship_id:null },
    logbooks: [
      { id:null, week_number:5, activities:'Configured VPN tunnels and firewall rules for the Douala data center. Documented network topology.', submitted_at:'2026-02-10T10:00:00Z', review_status:'pending', supervisor_comment:null },
      { id:null, week_number:4, activities:'Monitored network traffic and identified bottlenecks. Proposed optimization strategies.', submitted_at:'2026-02-03T10:00:00Z', review_status:'approved', supervisor_comment:'Good analysis.' },
      { id:null, week_number:3, activities:'Assisted in 4G LTE tower maintenance. Learned about signal optimization techniques.', submitted_at:'2026-01-27T10:00:00Z', review_status:'approved', supervisor_comment:'Good field experience.' },
      { id:null, week_number:2, activities:'Completed network security training. Reviewed Nexttel infrastructure documentation.', submitted_at:'2026-01-20T10:00:00Z', review_status:'approved', supervisor_comment:'Good.' },
      { id:null, week_number:1, activities:'Onboarded at Nexttel Cameroon. Set up workstation and met the network engineering team.', submitted_at:'2026-01-13T10:00:00Z', review_status:'approved', supervisor_comment:'Welcome!' },
    ]
  },
}

const mockStudent = {
  id: 1,
  first_name: 'Trevor',
  last_name: 'Andeh',
  matricule: 'CT23A017',
  email: 'trevor@ims.test',
  phone: '+237600000005',
  program: 'B.Tech Software Engineering',
  department: 'Software Engineering',
  company: 'TechNova Cameroon',
  role: 'Software Engineering Intern',
  start_date: '2026-02-22',
  end_date: '2026-05-17',
  status: 'ongoing',
  progress: 33,
  currentWeek: 4,
  totalWeeks: 12,
}

const mockLogbooks = [
  {
    id: null,
    week_number: 3,
    activities:
      'Worked on the backend authentication module using Django REST Framework. Implemented JWT token refresh logic and wrote unit tests for all auth endpoints.',
    submitted_at: '2026-03-16T10:30:00Z',
    review_status: 'pending',
    supervisor_comment: null,
  },
  {
    id: null,
    week_number: 2,
    activities:
      'Implemented authentication endpoints and wrote initial API tests. Also set up the PostgreSQL database and ran initial migrations.',
    submitted_at: '2026-03-09T14:15:00Z',
    review_status: 'approved',
    supervisor_comment: 'Good progress. Keep it up.',
  },
  {
    id: null,
    week_number: 1,
    activities:
      'Onboarded to the engineering team, set up development environment, reviewed codebase and attended initial sprint planning meeting.',
    submitted_at: '2026-03-02T09:00:00Z',
    review_status: 'approved',
    supervisor_comment: 'Great start!',
  },
]

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  backgroundColor: '#242424',
  border: '1px solid #2a2a2a',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
}

function computeProgress(start, end) {
  if (!start || !end) return 0
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  const now = Date.now()
  if (now >= e) return 100
  if (now <= s) return 0
  return Math.round(((now - s) / (e - s)) * 100)
}

function totalWeeksBetween(start, end) {
  if (!start || !end) return 12
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  return Math.max(1, Math.ceil((e - s) / (7 * 24 * 60 * 60 * 1000)))
}

function currentWeekFromStart(start, end) {
  if (!start) return 0
  const s = new Date(start).getTime()
  const now = Date.now()
  const total = end ? new Date(end).getTime() : s + 12 * 7 * 24 * 60 * 60 * 1000
  if (now >= total) return totalWeeksBetween(start, end ? new Date(end).toISOString().slice(0, 10) : null)
  const w = Math.floor((now - s) / (7 * 24 * 60 * 60 * 1000)) + 1
  return Math.max(1, w)
}

function buildDisplayStudent(studentApi, internshipApi, mock) {
  const s = studentApi || {}
  const i = internshipApi || null
  const start = i?.start_date || s.start_date
  const end = i?.end_date || s.end_date
  const tw = totalWeeksBetween(start, end)
  const cw = currentWeekFromStart(start, end)
  const prog = i ? computeProgress(i.start_date, i.end_date) : s.progress ?? mock.progress

  return {
    ...mock,
    ...s,
    first_name: s.first_name ?? s.user_first_name ?? mock.first_name,
    last_name: s.last_name ?? s.user_last_name ?? mock.last_name,
    email: s.email ?? s.user_email ?? mock.email,
    phone: s.phone ?? s.user_phone ?? mock.phone,
    matricule: s.matricule ?? mock.matricule,
    program: s.program ?? mock.program,
    department: s.department ?? mock.department,
    company: s.company ?? s.company_name ?? i?.company_name ?? mock.company,
    role: s.role ?? i?.title ?? mock.role,
    start_date: start ?? mock.start_date,
    end_date: end ?? mock.end_date,
    status: s.status ?? i?.status ?? mock.status,
    progress: prog,
    currentWeek: i ? cw : s.currentWeek ?? mock.currentWeek,
    totalWeeks: i ? tw : s.totalWeeks ?? mock.totalWeeks,
    internship_id: i?.id ?? s.internship_id ?? null,
  }
}

function logbookStatusBadge(logbook) {
  const st = logbook.review_status
  if (st === 'approved') {
    return { bg: '#14532d', color: '#22c55e', label: '✓ Approved' }
  }
  if (st === 'needs_revision') {
    return { bg: '#450a0a', color: '#ef4444', label: '✗ Needs revision' }
  }
  return { bg: '#4a5a00', color: '#CFFF00', label: '⏳ Pending' }
}

function isLogbookPending(logbook) {
  return logbook.review_status === 'pending' || !logbook.review_status
}

function logbookRowKey(logbook) {
  return logbook.id != null && logbook.id !== undefined
    ? String(logbook.id)
    : `week-${logbook.week_number}`
}

function sameLogbookRow(a, b) {
  if (b.id != null && b.id !== undefined) return a.id === b.id
  return (a.id == null || a.id === undefined) && a.week_number === b.week_number
}

function parseEvalComments(raw) {
  if (!raw || typeof raw !== 'string') return { performance: 'Good', body: '' }
  const m = raw.match(/^Performance:\s*([^\n]+)\n\n([\s\S]*)$/i)
  if (m) return { performance: m[1].trim(), body: m[2].trim() }
  return { performance: 'Good', body: raw.trim() }
}

export default function StudentDetail() {
  const navigate = useNavigate()
  const { studentId } = useParams()
  const [student, setStudent] = useState(null)
  const [internship, setInternship] = useState(null)
  const [logbooks, setLogbooks] = useState([])
  const [evaluation, setEvaluation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rejectingId, setRejectingId] = useState(null)
  const [comment, setComment] = useState('')
  const [score, setScore] = useState('')
  const [performance, setPerformance] = useState('Good')
  const [evalComment, setEvalComment] = useState('')
  const [evalLoading, setEvalLoading] = useState(false)
  const [evalSuccess, setEvalSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r1, r2, r3, r4] = await Promise.allSettled([
          api.get(`/students/${studentId}/`),
          api.get(`/internships/?student=${studentId}`),
          api.get(`/logbooks/?student=${studentId}`),
          api.get(`/evaluations/?student=${studentId}`),
        ])

        let stu = null
        let intship = null
        if (r1.status === 'fulfilled') {
          stu = r1.value.data
        } else {
          // API failed — use MOCK_DATA for this student
          const mockEntry = MOCK_DATA[Number(studentId)]
          if (mockEntry) {
            setStudent(mockEntry.student)
            setLogbooks(mockEntry.logbooks)
            setLoading(false)
            return
          }
        }

        if (r2.status === 'fulfilled') {
          const raw = r2.value.data?.results || r2.value.data || []
          const arr = Array.isArray(raw) ? raw : []
          intship = arr.find((x) => x.status === 'ongoing') || arr[0] || null
          setInternship(intship)
        }

        if (r3.status === 'fulfilled') {
          const data = r3.value.data?.results || r3.value.data || []
          if (Array.isArray(data) && data.length > 0) setLogbooks(data)
        }

        if (r4.status === 'fulfilled') {
          const raw = r4.value.data?.results || r4.value.data || []
          const arr = Array.isArray(raw) ? raw : []
          if (arr.length > 0) {
            const ev = arr[0]
            setEvaluation(ev)
            setScore(ev.score != null ? String(ev.score) : '')
            const parsed = parseEvalComments(ev.comments)
            setPerformance(parsed.performance)
            setEvalComment(parsed.body)
          }
        }

        if (stu || intship) {
          setStudent(buildDisplayStudent(stu, intship, mockStudent))
        }
      } catch (err) {
        console.log('Using mock data', err)
        const mockEntry = MOCK_DATA[Number(studentId)]
        if (mockEntry) {
          setStudent(mockEntry.student)
          setLogbooks(mockEntry.logbooks)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [studentId])

  const display = useMemo(() => buildDisplayStudent(student, internship, mockStudent), [student, internship])

  const handleApprove = async (logbook) => {
    const applyLocal = () => {
      setLogbooks((prev) =>
        prev.map((l) =>
          sameLogbookRow(l, logbook) ? { ...l, review_status: 'approved', supervisor_comment: 'Approved' } : l,
        ),
      )
    }
    if (logbook.id == null || logbook.id === undefined) {
      applyLocal()
      return
    }
    try {
      await api.patch(`/logbooks/${logbook.id}/`, { review_status: 'approved', supervisor_comment: 'Approved' })
      applyLocal()
    } catch (err) {
      console.log('Approve error:', err.response?.data)
    }
  }

  const handleReject = async (logbook) => {
    const applyLocal = () => {
      setLogbooks((prev) =>
        prev.map((l) =>
          sameLogbookRow(l, logbook)
            ? { ...l, review_status: 'needs_revision', supervisor_comment: comment }
            : l,
        ),
      )
      setRejectingId(null)
      setComment('')
    }
    if (logbook.id == null || logbook.id === undefined) {
      applyLocal()
      return
    }
    try {
      await api.patch(`/logbooks/${logbook.id}/`, {
        review_status: 'needs_revision',
        supervisor_comment: comment,
      })
      applyLocal()
    } catch (err) {
      console.log('Reject error:', err.response?.data)
    }
  }

  const handleSubmitEval = async () => {
    console.log('internship state:', internship)
    console.log('display internship_id:', display?.internship_id)
    console.log('student state:', student)
    if (!score) {
      alert('Please enter a score')
      return
    }
    const n = parseInt(score, 10)
    if (Number.isNaN(n) || n < 0 || n > 100) {
      alert('Please enter a valid score between 0 and 100')
      return
    }
    setEvalLoading(true)
    try {
      const internshipId = internship?.id ?? display?.internship_id ?? null
      if (!internshipId) {
        alert('No internship found for this student. Cannot submit evaluation.')
        setEvalLoading(false)
        return
      }
      const payload = {
        internship: internshipId,
        score: n,
        comments: performance ? `Performance: ${performance}\n\n${evalComment}` : evalComment,
      }
      if (evaluation?.id) {
        const { data } = await api.patch(`/evaluations/${evaluation.id}/`, payload)
        setEvaluation(data)
      } else {
        const { data } = await api.post('/evaluations/', payload)
        setEvaluation(data)
      }
      setEvalSuccess(true)
      setTimeout(() => setEvalSuccess(false), 3000)
    } catch (err) {
      console.log('Eval error:', err.response?.data)
      const errData = err.response?.data
      if (errData) {
        alert(JSON.stringify(errData))
      }
    } finally {
      setEvalLoading(false)
    }
  }

  const name = display ? `${display.first_name} ${display.last_name}`.trim() : 'Student'
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const scoreNum = score === '' ? NaN : Number(score)

  if (loading) {
    const loadingFallback = MOCK_DATA[Number(studentId)]?.student ?? mockStudent
    return (
      <div
        style={{ padding: '48px', textAlign: 'center', color: '#888888' }}
        title={
          `${loadingFallback?.first_name ?? ''} ${loadingFallback?.last_name ?? ''}`.trim() ||
          undefined
        }
      >
        Loading student...
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/supervisor/students')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#888888',
          fontSize: '0.875rem',
          cursor: 'pointer',
          marginBottom: '28px',
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ffffff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#888888'
        }}
      >
        <ArrowLeft size={18} /> Back to Students
      </button>

      {/* Two column layout */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* LEFT — Main content */}
        <div style={{ flex: '1 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Student Profile Card */}
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '28px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid #2a2a2a',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#CFFF00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.5rem',
                  color: '#000',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>{name}</h1>
                <p style={{ fontSize: '0.875rem', color: '#888888', marginBottom: '8px' }}>
                  {display?.matricule} · {display?.program}
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    backgroundColor: '#14532d',
                    borderRadius: '999px',
                  }}
                >
                  <div style={{ width: '6px', height: '6px', backgroundColor: '#22c55e', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: '600', textTransform: 'capitalize' }}>
                    {display?.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {[
                { icon: <Mail size={14} />, label: 'Email', value: display?.email },
                { icon: <Phone size={14} />, label: 'Phone', value: display?.phone },
                { icon: <Building size={14} />, label: 'Company', value: display?.company },
                { icon: <Award size={14} />, label: 'Role', value: display?.role },
                {
                  icon: <Calendar size={14} />,
                  label: 'Start Date',
                  value: display?.start_date
                    ? new Date(display.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A',
                },
                {
                  icon: <Calendar size={14} />,
                  label: 'End Date',
                  value: display?.end_date
                    ? new Date(display.end_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    backgroundColor: '#0f0f0f',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <div style={{ color: '#CFFF00', marginTop: '2px', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <p
                      style={{
                        fontSize: '0.7rem',
                        color: '#888888',
                        marginBottom: '3px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {item.label}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: '500' }}>{item.value || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logbook Submissions */}
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <BookOpen size={18} style={{ color: '#CFFF00' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>Logbook Submissions</h2>
              <span
                style={{
                  padding: '2px 10px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  color: '#888888',
                  fontWeight: '600',
                }}
              >
                {logbooks.length}
              </span>
            </div>

            {logbooks.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#0f0f0f', borderRadius: '12px' }}>
                <p style={{ color: '#888888', fontSize: '0.875rem' }}>No logbook submissions yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {logbooks.map((logbook) => {
                  const badge = logbookStatusBadge(logbook)
                  return (
                    <div
                      key={logbookRowKey(logbook)}
                      style={{
                        backgroundColor: '#0f0f0f',
                        border: '1px solid #2a2a2a',
                        borderRadius: '12px',
                        padding: '18px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>
                            Week {logbook.week_number}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#888888' }}>
                            {logbook.submitted_at
                              ? new Date(logbook.submitted_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'N/A'}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: '4px 14px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            backgroundColor: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: '#cccccc',
                          lineHeight: '1.6',
                          marginBottom: logbook.supervisor_comment ? '12px' : '0',
                        }}
                      >
                        {logbook.activities}
                      </p>

                      {logbook.supervisor_comment && (
                        <div
                          style={{
                            padding: '10px 14px',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '8px',
                            borderLeft: '3px solid #CFFF00',
                            marginBottom: '12px',
                          }}
                        >
                          <p style={{ fontSize: '0.75rem', color: '#888888', marginBottom: '3px' }}>Your comment</p>
                          <p style={{ fontSize: '0.813rem', color: '#ffffff' }}>{logbook.supervisor_comment}</p>
                        </div>
                      )}

                      {isLogbookPending(logbook) && (
                        <>
                          {rejectingId === logbookRowKey(logbook) ? (
                            <div style={{ marginTop: '12px' }}>
                              <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add rejection comment..."
                                rows={2}
                                style={{ ...inputStyle, resize: 'none', marginBottom: '10px' }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#ef4444'
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#2a2a2a'
                                }}
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingId(null)
                                    setComment('')
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '9px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '9px',
                                    color: '#888888',
                                    fontSize: '0.813rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(logbook)}
                                  style={{
                                    flex: 1,
                                    padding: '9px',
                                    backgroundColor: '#450a0a',
                                    border: '1px solid #ef4444',
                                    borderRadius: '9px',
                                    color: '#ef4444',
                                    fontSize: '0.813rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Confirm Reject
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                              <button
                                type="button"
                                onClick={() => handleApprove(logbook)}
                                style={{
                                  flex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  padding: '9px',
                                  backgroundColor: '#14532d',
                                  border: '1px solid #22c55e',
                                  borderRadius: '9px',
                                  color: '#22c55e',
                                  fontSize: '0.813rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                }}
                              >
                                <CheckCircle size={15} /> Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingId(logbookRowKey(logbook))}
                                style={{
                                  flex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  padding: '9px',
                                  backgroundColor: '#450a0a',
                                  border: '1px solid #ef4444',
                                  borderRadius: '9px',
                                  color: '#ef4444',
                                  fontSize: '0.813rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                }}
                              >
                                <XCircle size={15} /> Reject
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Progress + Evaluation */}
        <div style={{ flex: '0 1 340px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Progress Card */}
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '20px' }}>Internship Progress</h3>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 12px' }}>
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100px', height: '100px' }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2a2a" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#CFFF00"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (display?.progress || 0) / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#CFFF00' }}>{display?.progress || 0}%</span>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#888888' }}>
                Week {display?.currentWeek || 0} of {display?.totalWeeks || 12}
              </p>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#2a2a2a', borderRadius: '999px' }}>
              <div
                style={{
                  height: '6px',
                  borderRadius: '999px',
                  backgroundColor: '#CFFF00',
                  width: `${display?.progress || 0}%`,
                  transition: 'width 0.5s',
                }}
              />
            </div>
          </div>

          {/* Evaluation Form */}
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
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
                <Star size={16} style={{ color: '#CFFF00' }} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>Student Evaluation</h3>
            </div>

            {evalSuccess && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#14532d',
                  border: '1px solid #22c55e',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle size={16} style={{ color: '#22c55e' }} />
                <p style={{ fontSize: '0.875rem', color: '#22c55e', fontWeight: '600' }}>Evaluation submitted!</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
                  Overall Score (0–100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 85"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#CFFF00'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#2a2a2a'
                  }}
                />
                {score !== '' && !Number.isNaN(scoreNum) && (
                  <p style={{ fontSize: '0.75rem', color: '#CFFF00', marginTop: '4px' }}>
                    Grade: {scoreNum >= 90 ? 'A' : scoreNum >= 80 ? 'B' : scoreNum >= 70 ? 'C' : scoreNum >= 60 ? 'D' : 'F'}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Performance</label>
                <select
                  value={performance}
                  onChange={(e) => setPerformance(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#CFFF00'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#2a2a2a'
                  }}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Comments</label>
                <textarea
                  value={evalComment}
                  onChange={(e) => setEvalComment(e.target.value)}
                  placeholder="Enter your evaluation comments..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#CFFF00'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#2a2a2a'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitEval}
                disabled={evalLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#CFFF00',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#000000',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: evalLoading ? 'not-allowed' : 'pointer',
                  opacity: evalLoading ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {evalLoading ? 'Submitting...' : evaluation ? 'Update Evaluation' : 'Submit Evaluation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
