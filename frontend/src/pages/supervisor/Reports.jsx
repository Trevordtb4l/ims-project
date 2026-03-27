import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Download, Clock, Award, AlertTriangle, Star, ChevronRight, Calendar } from 'lucide-react'
import api from '@/api/axios'
import { useToast } from '@/components/Toast.jsx'
import ReportPrintView from '@/components/ReportPrintView.jsx'

const MOCK_REPORTS = [
  { id: 1, student_name: 'Andeh Trevor', type: 'Software Engineering Internship', submitted_at: '2026-02-28', grade: 'A', status: 'graded' },
  { id: 2, student_name: 'Fomban Giscard', type: 'Network Engineering Internship', submitted_at: '2026-02-20', grade: 'B+', status: 'graded' },
  { id: 3, student_name: 'Nkeng Marlène', type: 'Data Science Internship', submitted_at: '2026-02-25', grade: 'A-', status: 'graded' },
  { id: 4, student_name: 'Tchamba Romuald', type: 'Cybersecurity Internship', submitted_at: '2026-03-01', grade: null, status: 'pending' },
  { id: 5, student_name: 'Mbarga Estelle', type: 'Mobile Development Internship', submitted_at: '2026-03-05', grade: null, status: 'pending' },
  { id: 6, student_name: 'Kouam Blaise', type: 'Systems Administration Internship', submitted_at: null, grade: null, status: 'overdue' },
]

const MOCK_DUE_SOON = [
  { id: 4, student_name: 'Tchamba Romuald', type: 'Cybersecurity Internship', due_date: '2026-03-30', days_remaining: 3 },
  { id: 5, student_name: 'Mbarga Estelle', type: 'Mobile Development Internship', due_date: '2026-04-02', days_remaining: 6 },
  { id: 6, student_name: 'Kouam Blaise', type: 'Systems Administration Internship', due_date: '2026-03-27', days_remaining: 0 },
]

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ backgroundColor: '#2a2a2a', width: i === 4 ? 40 : '70%' }} />
        </td>
      ))}
    </tr>
  )
}

function SkeletonStatCard() {
  return (
    <div className="rounded-2xl border px-5 py-4 flex-1 animate-pulse" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
      <div className="h-4 w-20 rounded mb-3" style={{ backgroundColor: '#2a2a2a' }} />
      <div className="h-7 w-12 rounded" style={{ backgroundColor: '#2a2a2a' }} />
    </div>
  )
}

const STATUS_STYLES = {
  graded: { backgroundColor: '#14532d', color: '#22c55e' },
  pending: { backgroundColor: '#4a5a00', color: '#CFFF00' },
  overdue: { backgroundColor: '#450a0a', color: '#ef4444' },
}

const STATUS_LABELS = {
  graded: 'Graded',
  pending: 'Pending',
  overdue: 'Overdue',
}

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [dueSoon, setDueSoon] = useState([])
  const [stats, setStats] = useState({ total: 0, graded: 0, pending: 0, avgGrade: '—' })
  const [editingGrades, setEditingGrades] = useState({})
  const [showPrintView, setShowPrintView] = useState(false)
  const [printReportId, setPrintReportId] = useState(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const calculateStats = (data) => {
    const total = data.length
    const gradedItems = data.filter((r) => r.grade)
    const graded = gradedItems.length
    const pending = data.filter((r) => !r.grade).length

    let avgGrade = '—'
    if (gradedItems.length > 0) {
      const numericGrades = gradedItems
        .map((r) => parseFloat(r.grade))
        .filter((g) => !isNaN(g))
      if (numericGrades.length > 0) {
        avgGrade = (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(1)
      } else {
        avgGrade = gradedItems[0].grade
      }
    }

    return { total, graded, pending, avgGrade }
  }

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const res = await api.get('/reports/')
        const data = Array.isArray(res.data) ? res.data : res.data.results || []

        const realReports = data.map(r => ({
          ...r,
          status: r.grade ? 'graded' : 'pending',
          type: r.type || 'Internship Report',
        }))

        const mockWithoutReal = MOCK_REPORTS.filter(m => !realReports.find(r => r.id === m.id))
        const merged = [...realReports, ...mockWithoutReal]

        setReports(merged)
        setStats(calculateStats(merged))
        setDueSoon(MOCK_DUE_SOON)
      } catch {
        setReports(MOCK_REPORTS)
        setStats(calculateStats(MOCK_REPORTS))
        setDueSoon(MOCK_DUE_SOON)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const handleGradeBlur = async (report) => {
    const newGrade = editingGrades[report.id]
    if (newGrade === undefined || newGrade === report.grade) return

    try {
      await api.patch(`/reports/${report.id}/`, { grade: newGrade })
      toast('Grade updated successfully')
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id ? { ...r, grade: newGrade, status: newGrade ? 'graded' : 'pending' } : r
        )
      )
      setStats((prev) => calculateStats(reports.map((r) => (r.id === report.id ? { ...r, grade: newGrade } : r))))
    } catch {
      toast('Failed to update grade', 'error')
    }
  }

  const handleReview = (reportId) => {
    navigate(`/supervisor/reports/${reportId}`)
  }

  const handleDownload = (report) => {
    setPrintReportId(report.id)
    setShowPrintView(true)
  }

  const closePrintView = useCallback(() => {
    setShowPrintView(false)
    setPrintReportId(null)
  }, [])

  return (
    <>
    <div className="no-print" style={{ backgroundColor: '#0f0f0f' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>Reports</h1>
        <p style={{ fontSize: '0.875rem', color: '#888888' }}>Review and grade student internship reports</p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} style={{ minWidth: 0 }}>
                <SkeletonStatCard />
              </div>
            ))
          : [
              { icon: <FileText size={18} />, label: 'Total Reports', value: stats.total, color: '#ffffff' },
              { icon: <Award size={18} />, label: 'Graded', value: stats.graded, color: '#22c55e' },
              { icon: <Clock size={18} />, label: 'Pending Review', value: stats.pending, color: '#CFFF00' },
              { icon: <Star size={18} />, label: 'Average Grade', value: stats.avgGrade, color: '#CFFF00' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #2a2a2a',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#CFFF00',
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#888888', marginBottom: '4px' }}>{stat.label}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '800', color: stat.color, lineHeight: 1 }}>{stat.value}</p>
                </div>
              </div>
            ))}
      </div>

      {/* Due Soon */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertTriangle size={18} style={{ color: '#ef4444' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>Due Soon</h2>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #450a0a',
                  borderRadius: '14px',
                  padding: '20px',
                  borderLeft: '4px solid #ef4444',
                }}
              >
                <div className="h-4 w-32 rounded mb-2" style={{ backgroundColor: '#2a2a2a' }} />
                <div className="h-3 w-24 rounded mb-3" style={{ backgroundColor: '#2a2a2a' }} />
                <div className="h-8 w-20 rounded-xl" style={{ backgroundColor: '#2a2a2a' }} />
              </div>
            ))}
          </div>
        ) : dueSoon.length === 0 ? (
          <p style={{ fontSize: '0.875rem', textAlign: 'center', padding: '32px 0', color: '#888888' }}>
            No reports due soon
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {dueSoon.map((report) => (
              <div
                key={report.id}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #450a0a',
                  borderRadius: '14px',
                  padding: '20px',
                  borderLeft: '4px solid #ef4444',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
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
                    {report.student_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff', marginBottom: '1px' }}>
                      {report.student_name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#888888' }}>{report.type}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Calendar size={13} style={{ color: '#888888' }} />
                  <span style={{ fontSize: '0.75rem', color: '#888888' }}>Due: {formatDate(report.due_date)}</span>
                </div>
                <p style={{ fontSize: '0.813rem', fontWeight: '700', color: '#ef4444', marginBottom: '14px' }}>
                  {report.days_remaining} days remaining
                </p>
                <button
                  type="button"
                  onClick={() => handleReview(report.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#CFFF00',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000000',
                    fontSize: '0.813rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Review <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Reports Table */}
      {loading ? (
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #2a2a2a' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>All Reports</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[1, 2, 3].map((i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : reports.length === 0 ? (
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #2a2a2a' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>All Reports</h2>
          </div>
          <p style={{ fontSize: '0.875rem', textAlign: 'center', padding: '48px 24px', color: '#888888' }}>No reports found</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #2a2a2a' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>All Reports</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  {['Student', 'Report Type', 'Submitted', 'Grade', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 20px',
                        textAlign: 'left',
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
                {reports.map((report, i) => (
                  <tr
                    key={report.id}
                    style={{
                      borderBottom: i < reports.length - 1 ? '1px solid #2a2a2a' : 'none',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f0f0f'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: '#CFFF00',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.7rem',
                            color: '#000',
                            flexShrink: 0,
                          }}
                        >
                          {report.student_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>{report.student_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#888888' }}>{report.type}</td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#888888', whiteSpace: 'nowrap' }}>
                      {formatDate(report.submitted_at)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <input
                        type="text"
                        defaultValue={report.grade || ''}
                        onChange={(e) => setEditingGrades((prev) => ({ ...prev, [report.id]: e.target.value }))}
                        placeholder="—"
                        style={{
                          width: '64px',
                          padding: '6px 10px',
                          backgroundColor: '#0f0f0f',
                          border: '1px solid #2a2a2a',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          outline: 'none',
                          textAlign: 'center',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#CFFF00'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#2a2a2a'
                          handleGradeBlur(report)
                        }}
                      />
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          ...(STATUS_STYLES[report.status] || STATUS_STYLES.pending),
                        }}
                      >
                        {STATUS_LABELS[report.status] || 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleDownload(report)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            border: '1px solid #2a2a2a',
                            borderRadius: '8px',
                            color: '#888888',
                            fontSize: '0.75rem',
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
                          <Download size={13} /> Download
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview(report.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            backgroundColor: '#CFFF00',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#000000',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    {showPrintView && printReportId != null && (
      <ReportPrintView reportId={printReportId} onClose={closePrintView} />
    )}
    </>
  )
}
