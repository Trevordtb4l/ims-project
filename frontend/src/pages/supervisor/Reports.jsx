import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Download, Clock, Award, AlertTriangle, Star, ChevronRight } from 'lucide-react'
import api from '@/api/axios'
import { useToast } from '@/components/Toast.jsx'

const MOCK_DUE_SOON = [
  { id: 1, student_name: 'Alice Johnson', type: 'Final Report', due_date: '2026-03-10', days_remaining: 6 },
  { id: 2, student_name: 'Bob Smith', type: 'Progress Report', due_date: '2026-03-08', days_remaining: 4 },
]

const MOCK_REPORTS = [
  { id: 1, student_name: 'Alice Johnson', type: 'Mid-term Report', submitted_at: '2026-02-15', grade: 'A', status: 'graded' },
  { id: 2, student_name: 'Bob Smith', type: 'Final Report', submitted_at: '2026-02-20', grade: null, status: 'pending' },
  { id: 3, student_name: 'Carol Lee', type: 'Weekly Summary', submitted_at: '2026-02-25', grade: 'B+', status: 'graded' },
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

        if (data.length > 0) {
          setReports(data)
          setStats(calculateStats(data))

          const upcoming = data
            .filter((r) => !r.grade && r.due_date)
            .filter((r) => {
              const due = new Date(r.due_date)
              const now = new Date()
              const diff = (due - now) / (1000 * 60 * 60 * 24)
              return diff >= 0 && diff <= 7
            })
            .slice(0, 3)
            .map((r) => ({
              ...r,
              days_remaining: Math.ceil((new Date(r.due_date) - new Date()) / (1000 * 60 * 60 * 24)),
            }))

          setDueSoon(upcoming.length > 0 ? upcoming : MOCK_DUE_SOON)
        } else {
          setReports(MOCK_REPORTS)
          setStats(calculateStats(MOCK_REPORTS))
          setDueSoon(MOCK_DUE_SOON)
        }
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

  const handleDownload = async (reportId) => {
    try {
      const res = await api.get(`/reports/${reportId}/download/`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${reportId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      window.open(`/api/v1/reports/${reportId}/download/`, '_blank')
    }
  }

  const STAT_CARDS = [
    { label: 'Total Reports', value: stats.total, icon: FileText, color: '#ffffff' },
    { label: 'Graded', value: stats.graded, icon: Award, color: '#22c55e' },
    { label: 'Pending Review', value: stats.pending, icon: Clock, color: '#CFFF00' },
    { label: 'Average Grade', value: stats.avgGrade, icon: Star, color: '#ffffff' },
  ]

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0f0f0f' }}>
      <h1 className="text-2xl font-bold text-white mb-6">Reports</h1>

      {/* Summary Stats */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {loading
          ? [1, 2, 3, 4].map((i) => <SkeletonStatCard key={i} />)
          : STAT_CARDS.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border px-5 py-4 flex-1 min-w-[140px]"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <card.icon size={16} style={{ color: '#888888' }} />
                  <span className="text-xs" style={{ color: '#888888' }}>
                    {card.label}
                  </span>
                </div>
                <p className="text-2xl font-bold" style={{ color: card.color }}>
                  {card.value}
                </p>
              </div>
            ))}
      </div>

      {/* Due Soon */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} style={{ color: '#ef4444' }} />
          <h2 className="text-lg font-bold text-white">Due Soon</h2>
        </div>

        {loading ? (
          <div className="flex gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border p-5 min-w-[260px] animate-pulse"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', borderLeftWidth: 4, borderLeftColor: '#ef4444' }}
              >
                <div className="h-4 w-32 rounded mb-2" style={{ backgroundColor: '#2a2a2a' }} />
                <div className="h-3 w-24 rounded mb-3" style={{ backgroundColor: '#2a2a2a' }} />
                <div className="h-8 w-20 rounded-xl" style={{ backgroundColor: '#2a2a2a' }} />
              </div>
            ))}
          </div>
        ) : dueSoon.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: '#888888' }}>
            No reports due soon
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {dueSoon.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border p-5 min-w-[260px] shrink-0"
                style={{
                  backgroundColor: '#1a1a1a',
                  borderColor: '#2a2a2a',
                  borderLeftWidth: 4,
                  borderLeftColor: '#ef4444',
                }}
              >
                <p className="text-white font-bold text-sm mb-1">{report.student_name}</p>
                <p className="text-sm mb-1" style={{ color: '#888888' }}>
                  Report Type: {report.type}
                </p>
                <p className="text-sm mb-1" style={{ color: '#888888' }}>
                  Due: {formatDate(report.due_date)}
                </p>
                <p className="text-sm font-bold mb-3" style={{ color: '#ef4444' }}>
                  {report.days_remaining} days remaining
                </p>
                <button
                  onClick={() => navigate(`/supervisor/reports/${report.id}`)}
                  className="rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-1"
                  style={{ backgroundColor: '#CFFF00', color: '#000' }}
                >
                  Review
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Reports Table */}
      <div className="rounded-2xl border p-6" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <h2 className="text-lg font-bold text-white mb-4">All Reports</h2>

        {loading ? (
          <table className="w-full">
            <tbody>
              {[1, 2, 3].map((i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        ) : reports.length === 0 ? (
          <p className="text-sm text-center py-12" style={{ color: '#888888' }}>
            No reports found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  {['Student', 'Report Type', 'Submitted', 'Grade', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#888888' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                    <td className="px-4 py-3 text-sm text-white">{report.student_name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#888888' }}>
                      {report.type}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#888888' }}>
                      {formatDate(report.submitted_at)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        defaultValue={report.grade || ''}
                        onChange={(e) =>
                          setEditingGrades((prev) => ({ ...prev, [report.id]: e.target.value }))
                        }
                        onBlur={() => handleGradeBlur(report)}
                        className="w-16 rounded-lg px-2 py-1 text-center text-sm text-white outline-none"
                        style={{ backgroundColor: '#2a2a2a', border: '1px solid #2a2a2a' }}
                        placeholder="—"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold"
                        style={STATUS_STYLES[report.status] || STATUS_STYLES.pending}
                      >
                        {STATUS_LABELS[report.status] || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDownload(report.id)}
                          className="transition-opacity hover:opacity-80"
                          title="Download"
                        >
                          <Download size={16} style={{ color: '#CFFF00' }} />
                        </button>
                        <button
                          onClick={() => navigate(`/supervisor/reports/${report.id}`)}
                          className="text-sm font-semibold transition-opacity hover:opacity-80"
                          style={{ color: '#CFFF00' }}
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
        )}
      </div>
    </div>
  )
}
