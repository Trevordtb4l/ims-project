import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, X, CheckCircle, XCircle, Users } from 'lucide-react'
import api from '@/api/axios'

const mockStudents = [
  { id: 1, initials: 'TA', name: 'Trevor Andeh', matricule: 'CT23A017', program: 'B.Tech Software Engineering', company: 'TechNova Cameroon', startDate: '2026-02-22', progress: 33, currentWeek: 4, totalWeeks: 12, status: 'On Track' },
  { id: 2, initials: 'MH', name: 'Mulema Haaris', matricule: 'CT23A022', program: 'B.Tech Computer Science', company: 'DataFlow Inc', startDate: '2026-01-15', progress: 58, currentWeek: 7, totalWeeks: 12, status: 'Review Needed' },
  { id: 3, initials: 'FN', name: 'Frankline Neba', matricule: 'CT22A015', program: 'B.Tech Information Systems', company: 'CreativeHub', startDate: '2026-03-01', progress: 12, currentWeek: 2, totalWeeks: 16, status: 'Delayed' },
  { id: 4, initials: 'AM', name: 'Austine Mbah', matricule: 'CT23A031', program: 'B.Tech Software Engineering', company: 'CloudBase Ltd', startDate: '2026-02-01', progress: 75, currentWeek: 9, totalWeeks: 12, status: 'On Track' },
  { id: 5, initials: 'ES', name: 'Epie Samuel', matricule: 'CT22A009', program: 'B.Tech Computer Engineering', company: 'MobileSoft', startDate: '2026-01-20', progress: 45, currentWeek: 6, totalWeeks: 12, status: 'On Track' },
]

function normalizeStudent(row) {
  const name = row.name || row.student_name || row.user_first_name || 'Unknown'
  const initials =
    row.initials ||
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  return {
    ...row,
    id: row.id,
    name,
    initials,
    matricule: row.matricule,
    program: row.program,
    company: row.company || row.company_name,
    startDate: row.startDate || row.start_date,
    progress: row.progress ?? 0,
    currentWeek: row.currentWeek ?? row.current_week,
    totalWeeks: row.totalWeeks ?? row.total_weeks,
    status: row.status || 'On Track',
  }
}

export default function Students() {
  const navigate = useNavigate()
  const [students, setStudents] = useState(mockStudents)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [logbooks, setLogbooks] = useState([])
  const [slideOpen, setSlideOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [rejectingId, setRejectingId] = useState(null)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students/?supervisor=me')
        const data = res.data?.results || res.data || []
        if (Array.isArray(data) && data.length > 0) setStudents(data.map(normalizeStudent))
      } catch (err) {
        console.log('Using mock data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student)
    setSlideOpen(true)
    try {
      const res = await api.get(`/logbooks/?student=${student.id}`)
      const data = res.data?.results || res.data || []
      setLogbooks(Array.isArray(data) ? data : [])
    } catch (err) {
      setLogbooks([])
    }
  }

  const handleApprove = async (logbookId) => {
    try {
      await api.patch(`/logbooks/${logbookId}/`, { review_status: 'approved', supervisor_comment: 'Approved' })
      setLogbooks((prev) => prev.map((l) => (l.id === logbookId ? { ...l, review_status: 'approved' } : l)))
    } catch (err) {
      console.log('Approve error:', err.response?.data)
    }
  }

  const handleReject = async (logbookId) => {
    try {
      /** Backend uses `needs_revision`, not `rejected` */
      await api.patch(`/logbooks/${logbookId}/`, {
        review_status: 'needs_revision',
        supervisor_comment: comment || 'Needs revision',
      })
      setLogbooks((prev) => prev.map((l) => (l.id === logbookId ? { ...l, review_status: 'needs_revision' } : l)))
      setRejectingId(null)
      setComment('')
    } catch (err) {
      console.log('Reject error:', err.response?.data)
    }
  }

  const filteredStudents = students.filter((s) => {
    const name = s.name || s.student_name || ''
    const matchSearch = name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const getStatusStyle = (status) => {
    switch (status) {
      case 'On Track':
        return { bg: '#14532d', color: '#22c55e' }
      case 'Review Needed':
        return { bg: '#4a5a00', color: '#CFFF00' }
      case 'Delayed':
        return { bg: '#450a0a', color: '#ef4444' }
      default:
        return { bg: '#2a2a2a', color: '#888888' }
    }
  }

  const getProgressColor = (status) => {
    switch (status) {
      case 'On Track':
        return '#22c55e'
      case 'Review Needed':
        return '#CFFF00'
      case 'Delayed':
        return '#ef4444'
      default:
        return '#888888'
    }
  }

  const logbookStatusLabel = (st) => {
    if (st === 'needs_revision') return 'Needs revision'
    if (st === 'pending') return 'Pending'
    return st || 'Pending'
  }

  const isLogbookResolved = (st) => st === 'approved' || st === 'needs_revision'

  return (
    <div style={{ position: 'relative' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>Students</h1>
          <p style={{ fontSize: '0.875rem', color: '#888888' }}>Manage and monitor your assigned students</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '999px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#CFFF00', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.813rem', color: '#ffffff', fontWeight: '600' }}>{students.length} Assigned</span>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', flex: 1, maxWidth: '380px' }}>
          <Search size={15} style={{ color: '#888888', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.875rem', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'On Track', 'Review Needed', 'Delayed'].map((status) => (
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
                borderColor: statusFilter === status ? '#CFFF00' : '#2a2a2a',
                backgroundColor: statusFilter === status ? 'rgba(207,255,0,0.08)' : 'transparent',
                color: statusFilter === status ? '#CFFF00' : '#888888',
                transition: 'all 0.2s',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#888888' }}>Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#0f0f0f',
                border: '1px solid #2a2a2a',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={28} style={{ color: '#888888' }} />
            </div>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff' }}>No students found</p>
            <p style={{ fontSize: '0.875rem', color: '#888888' }}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Student', 'Matricule', 'Company', 'Start Date', 'Progress', 'Status', ''].map((h, hi) => (
                  <th
                    key={h || `col-${hi}`}
                    style={{
                      padding: '14px 20px',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#888888',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, i) => {
                const name = student.name || student.student_name || 'Unknown'
                const initials =
                  student.initials ||
                  name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                const statusStyle = getStatusStyle(student.status)
                const progressColor = getProgressColor(student.status)

                return (
                  <tr
                    key={student.id ?? i}
                    style={{
                      borderBottom: i < filteredStudents.length - 1 ? '1px solid #2a2a2a' : 'none',
                      transition: 'background-color 0.15s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f0f0f'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    onClick={() => handleSelectStudent(student)}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
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
                          {initials}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>{name}</p>
                          <p style={{ fontSize: '0.75rem', color: '#888888' }}>{student.program || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#888888' }}>{student.matricule || 'N/A'}</td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#888888' }}>{student.company || student.company_name || 'N/A'}</td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#888888', whiteSpace: 'nowrap' }}>
                      {student.startDate ? new Date(student.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ width: '100px', height: '6px', backgroundColor: '#2a2a2a', borderRadius: '999px', marginBottom: '4px' }}>
                        <div
                          style={{
                            height: '6px',
                            borderRadius: '999px',
                            backgroundColor: progressColor,
                            width: `${student.progress || 0}%`,
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#888888' }}>
                        Wk {student.currentWeek || 0}/{student.totalWeeks || 0}
                      </p>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <ChevronRight size={16} style={{ color: '#888888' }} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-over Panel */}
      {slideOpen && selectedStudent && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }}
            onClick={() => setSlideOpen(false)}
            aria-hidden="true"
          />

          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '480px',
              maxWidth: '100vw',
              backgroundColor: '#111111',
              borderLeft: '1px solid #2a2a2a',
              zIndex: 50,
              overflowY: 'auto',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>Student Profile</h2>
              <button
                type="button"
                onClick={() => setSlideOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} style={{ color: '#888888' }} />
              </button>
            </div>

            <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#CFFF00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '1rem',
                    color: '#000',
                    flexShrink: 0,
                  }}
                >
                  {selectedStudent.initials ||
                    selectedStudent.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>{selectedStudent.name || selectedStudent.student_name}</p>
                  <p style={{ fontSize: '0.813rem', color: '#888888' }}>
                    {selectedStudent.matricule} · {selectedStudent.program}
                  </p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Company', value: selectedStudent.company || 'N/A' },
                  { label: 'Status', value: selectedStudent.status || 'N/A' },
                  {
                    label: 'Start Date',
                    value: selectedStudent.startDate
                      ? new Date(selectedStudent.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'N/A',
                  },
                  { label: 'Progress', value: `${selectedStudent.progress || 0}%` },
                ].map((item) => (
                  <div key={item.label} style={{ backgroundColor: '#0f0f0f', borderRadius: '10px', padding: '12px' }}>
                    <p style={{ fontSize: '0.7rem', color: '#888888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigate(`/supervisor/students/${selectedStudent.id}`)
                setSlideOpen(false)
              }}
              style={{
                width: '100%',
                padding: '11px',
                backgroundColor: '#CFFF00',
                border: 'none',
                borderRadius: '10px',
                color: '#000000',
                fontSize: '0.875rem',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '20px',
              }}
            >
              View Full Profile →
            </button>

            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Logbook Submissions
              </h3>
              {logbooks.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px' }}>
                  <p style={{ color: '#888888', fontSize: '0.875rem' }}>No logbooks submitted yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {logbooks.map((logbook) => (
                    <div key={logbook.id} style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>Week {logbook.week_number}</p>
                          <p style={{ fontSize: '0.75rem', color: '#888888' }}>
                            {logbook.submitted_at ? new Date(logbook.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            backgroundColor:
                              logbook.review_status === 'approved' ? '#14532d' : logbook.review_status === 'needs_revision' ? '#450a0a' : '#4a5a00',
                            color: logbook.review_status === 'approved' ? '#22c55e' : logbook.review_status === 'needs_revision' ? '#ef4444' : '#CFFF00',
                          }}
                        >
                          {logbookStatusLabel(logbook.review_status)}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '0.813rem',
                          color: '#888888',
                          marginBottom: '12px',
                          lineHeight: '1.5',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {logbook.activities || 'No activities recorded'}
                      </p>

                      {!isLogbookResolved(logbook.review_status) && (
                        <>
                          {rejectingId === logbook.id ? (
                            <div>
                              <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add rejection comment..."
                                rows={2}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  backgroundColor: '#0f0f0f',
                                  border: '1px solid #2a2a2a',
                                  borderRadius: '8px',
                                  color: '#ffffff',
                                  fontSize: '0.813rem',
                                  outline: 'none',
                                  resize: 'none',
                                  marginBottom: '8px',
                                  boxSizing: 'border-box',
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
                                    padding: '8px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '8px',
                                    color: '#888888',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Cancel
                                </button>
                                <button type="button" onClick={() => handleReject(logbook.id)} style={{ flex: 1, padding: '8px', backgroundColor: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                                  Confirm Reject
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button type="button" onClick={() => handleApprove(logbook.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', backgroundColor: '#14532d', border: '1px solid #22c55e', borderRadius: '8px', color: '#22c55e', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button type="button" onClick={() => setRejectingId(logbook.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', backgroundColor: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {logbook.supervisor_comment && (
                        <div style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#0f0f0f', borderRadius: '8px', borderLeft: '3px solid #CFFF00' }}>
                          <p style={{ fontSize: '0.75rem', color: '#888888' }}>
                            Comment: <span style={{ color: '#ffffff' }}>{logbook.supervisor_comment}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
