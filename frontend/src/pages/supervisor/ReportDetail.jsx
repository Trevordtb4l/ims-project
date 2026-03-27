import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Building2, Calendar, BookOpen, AlertCircle } from 'lucide-react'
import api from '@/api/axios'
import { useToast } from '@/components/Toast.jsx'

const SKILLS = [
  'Django & Python Development',
  'REST API Design & Integration',
  'React.js & Tailwind CSS',
  'PostgreSQL Database Management',
  'Git & Version Control',
  'Unit & Integration Testing',
  'Technical Documentation',
  'Agile & Team Collaboration',
]

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function InfoCard({ label, value, icon }) {
  return (
    <div style={{
      backgroundColor: '#0f0f0f', border: '1px solid #2a2a2a',
      borderRadius: '12px', padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ color: '#555' }}>{icon}</span>
        <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888' }}>{label}</span>
      </div>
      <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff' }}>{value || '—'}</p>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={{
      backgroundColor: '#0f0f0f', border: '1px solid #2a2a2a',
      borderRadius: '12px', padding: '20px', textAlign: 'center',
    }}>
      <p style={{ fontSize: '1.8rem', fontWeight: '900', color: color || '#CFFF00', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginTop: '6px' }}>{label}</p>
    </div>
  )
}

function SectionHeader({ title }) {
  return (
    <div style={{
      fontSize: '0.75rem', fontWeight: '800', letterSpacing: '2px',
      textTransform: 'uppercase', color: '#888888',
      borderBottom: '1px solid #2a2a2a', paddingBottom: '10px', marginBottom: '16px',
    }}>{title}</div>
  )
}

export default function ReportDetail() {
  const { reportId: id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [internship, setInternship] = useState(null)
  const [student, setStudent] = useState(null)
  const [logbooks, setLogbooks] = useState([])
  const [grade, setGrade] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [editingComments, setEditingComments] = useState({})
  const [editingStatuses, setEditingStatuses] = useState({})

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const reportsRes = await api.get('/reports/')
        const list = Array.isArray(reportsRes.data) ? reportsRes.data : reportsRes.data?.results || []
        console.log('Reports list:', list, 'Looking for id:', id, typeof id)
        const found = list.find(r => String(r.id) === String(id))
        if (!found) throw new Error('Report not found')
        setReport(found)
        setGrade(found.grade || '')

        const [intRes, stuRes, lbRes] = await Promise.all([
          api.get(`/internships/${found.internship}/`),
          api.get(`/students/${found.student}/`),
          api.get('/logbooks/', { params: { internship: found.internship } }),
        ])
        setInternship(intRes.data)
        setStudent(stuRes.data)
        const raw = Array.isArray(lbRes.data) ? lbRes.data : lbRes.data?.results || []
        setLogbooks([...raw].sort((a, b) => a.week_number - b.week_number))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSaveGrade = async () => {
    if (!grade.trim()) return
    setSaving(true)
    try {
      await api.patch(`/reports/${id}/`, { grade: grade.trim() })
      setReport(prev => ({ ...prev, grade: grade.trim() }))
      toast('Grade saved successfully')
    } catch {
      toast('Failed to save grade', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveLogbook = async (lb) => {
    try {
      const res = await api.patch(`/logbooks/${lb.id}/`, {
        review_status: editingStatuses[lb.id] || lb.review_status,
        supervisor_comment: editingComments[lb.id] || lb.supervisor_comment,
      })
      const updated = res.data
      setLogbooks(prev =>
        prev.map(l => (l.id === lb.id ? { ...l, ...updated } : l))
      )
      setEditingComments(prev => {
        const next = { ...prev }
        delete next[lb.id]
        return next
      })
      setEditingStatuses(prev => {
        const next = { ...prev }
        delete next[lb.id]
        return next
      })
      toast('Logbook entry saved')
    } catch {
      toast('Failed to save', 'error')
    }
  }

  if (loading) return (
    <div style={{ backgroundColor: '#0f0f0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #2a2a2a', borderTopColor: '#CFFF00', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#888', fontSize: '0.875rem' }}>Loading report...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ backgroundColor: '#0f0f0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
        <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Report not found</p>
        <p style={{ color: '#888', marginBottom: '24px' }}>{error}</p>
        <button onClick={() => navigate('/supervisor/reports')} style={{ padding: '10px 24px', backgroundColor: '#CFFF00', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
          Back to Reports
        </button>
      </div>
    </div>
  )

  const studentName = student ? `${student.user_first_name} ${student.user_last_name}`.trim() : '—'
  const approved = logbooks.filter(l => l.review_status === 'approved').length
  const pending = logbooks.filter(l => l.review_status === 'pending').length
  const compliance = logbooks.length ? Math.round((approved / logbooks.length) * 100) : 0

  return (
    <div style={{ backgroundColor: '#0f0f0f', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Back Button */}
        <button
          onClick={() => navigate('/supervisor/reports')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', backgroundColor: 'transparent',
            border: '1px solid #2a2a2a', borderRadius: '8px',
            color: '#888', fontSize: '0.875rem', cursor: 'pointer',
            marginBottom: '28px', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#CFFF00'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888' }}
        >
          <ArrowLeft size={15} /> Back to Reports
        </button>

        {/* Page Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
            Report Review
          </h1>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>
            REF: IMS-{new Date().getFullYear()}-{String(report.id).padStart(4, '0')} &nbsp;·&nbsp; {internship?.title || 'Internship Report'}
          </p>
        </div>

        {/* Student Info + Company */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
          <SectionHeader title="Student Information" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <InfoCard label="Full Name" value={studentName} icon={<User size={14} />} />
            <InfoCard label="Matricule" value={student?.matricule} icon={<User size={14} />} />
            <InfoCard label="Program" value={student?.program} icon={<BookOpen size={14} />} />
            <InfoCard label="Email" value="trevorandeh@gmail.com" icon={<User size={14} />} />
          </div>
          <SectionHeader title="Company & Internship Details" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <InfoCard label="Company" value={internship?.company_name} icon={<Building2 size={14} />} />
            <InfoCard label="Supervisor" value={internship?.supervisor_name} icon={<User size={14} />} />
            <InfoCard label="Start Date" value={fmtDate(internship?.start_date)} icon={<Calendar size={14} />} />
            <InfoCard label="End Date" value={fmtDate(internship?.end_date)} icon={<Calendar size={14} />} />
          </div>
        </div>

        {/* Attendance */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
          <SectionHeader title="Attendance Record" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
            <StatBox label="Weeks Logged" value={logbooks.length} color="#ffffff" />
            <StatBox label="Approved" value={approved} color="#22c55e" />
            <StatBox label="Pending" value={pending} color="#CFFF00" />
            <StatBox label="Compliance" value={`${compliance}%`} color="#22c55e" />
            <StatBox label="Days Present" value="35" color="#ffffff" />
            <StatBox label="Days Absent" value="5" color="#ef4444" />
            <StatBox label="Total Days" value="40" color="#ffffff" />
          </div>
        </div>

        {/* Skills */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
          <SectionHeader title="Skills Developed" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {SKILLS.map(s => (
              <span key={s} style={{
                padding: '6px 16px', borderRadius: '999px',
                border: '1px solid #3a3a3a', color: '#aaaaaa',
                fontSize: '0.8rem', fontWeight: '600',
                backgroundColor: 'rgba(255,255,255,0.04)',
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Logbook */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
          <SectionHeader title="Weekly Logbook Summary" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f0f0f', borderBottom: '1px solid #2a2a2a' }}>
                  {['Week', 'Activities Summary', 'Status', 'Supervisor Comment', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '0.7rem', fontWeight: '700',
                      letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logbooks.map((lb, i) => (
                  <tr key={lb.id} style={{ borderBottom: i < logbooks.length - 1 ? '1px solid #2a2a2a' : 'none' }}>
                    <td style={{ padding: '14px 16px', color: '#ffffff', fontWeight: '800', fontSize: '0.9rem' }}>
                      {lb.week_number}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#ccc', fontSize: '0.85rem', lineHeight: '1.6', maxWidth: '380px' }}>
                      {lb.activities}
                    </td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <select
                        value={editingStatuses[lb.id] !== undefined ? editingStatuses[lb.id] : (lb.review_status || 'pending')}
                        onChange={e => setEditingStatuses(prev => ({ ...prev, [lb.id]: e.target.value }))}
                        style={{
                          backgroundColor: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px',
                          color: '#fff', padding: '6px 10px', fontSize: '0.8rem', outline: 'none',
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="needs_revision">Needs Revision</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'top', minWidth: '200px' }}>
                      <textarea
                        value={editingComments[lb.id] !== undefined ? editingComments[lb.id] : (lb.supervisor_comment || '')}
                        onChange={e => setEditingComments(prev => ({ ...prev, [lb.id]: e.target.value }))}
                        style={{
                          backgroundColor: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#fff',
                          padding: '8px', fontSize: '0.85rem', width: '100%', minHeight: '60px', resize: 'vertical', outline: 'none',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#CFFF00' }}
                        onBlur={e => { e.target.style.borderColor = '#2a2a2a' }}
                      />
                    </td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <button
                        type="button"
                        onClick={() => handleSaveLogbook(lb)}
                        style={{
                          padding: '6px 14px', backgroundColor: '#CFFF00', border: 'none',
                          borderRadius: '6px', color: '#000', fontSize: '0.75rem',
                          fontWeight: '700', cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Final Grade */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px' }}>
          <SectionHeader title="Final Assessment" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '80px', height: '80px', backgroundColor: '#0f0f0f',
              border: '2px solid #CFFF00', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', fontWeight: '900', color: '#CFFF00',
            }}>
              {report.grade || '—'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '10px' }}>Update Grade</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  placeholder="e.g. A, B+, 85"
                  style={{
                    padding: '10px 16px', backgroundColor: '#0f0f0f',
                    border: '1px solid #2a2a2a', borderRadius: '8px',
                    color: '#fff', fontSize: '0.875rem', outline: 'none', width: '160px',
                  }}
                  onFocus={e => e.target.style.borderColor = '#CFFF00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />
                <button
                  onClick={handleSaveGrade}
                  disabled={saving}
                  style={{
                    padding: '10px 24px', backgroundColor: '#CFFF00',
                    border: 'none', borderRadius: '8px',
                    color: '#000', fontSize: '0.875rem', fontWeight: '700',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
