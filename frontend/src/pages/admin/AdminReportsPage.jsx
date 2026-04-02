import { useEffect, useMemo, useState } from 'react'
import api from '@/api/axios'

const C = {
  bg: '#0f0f0f',
  card: '#1a1a1a',
  accent: '#CFFF00',
  white: '#ffffff',
  muted: '#888888',
  border: '#2a2a2a',
  red: '#ef4444',
}

const MOCK_REPORTS = [
  { id: 'm1', student: 'Andeh Trevor', internship: 'Software Engineering Internship', grade: 'Grade A', status: 'Submitted', period: 'Jan 2026' },
  { id: 'm2', student: 'Fomban Giscard', internship: 'Frontend Developer Intern', grade: 'Grade B+', status: 'Submitted', period: 'Feb 2026' },
  { id: 'm3', student: 'Nkeng Marlène', internship: 'Backend Developer Intern', grade: 'Grade A-', status: 'Pending', period: 'Mar 2026' },
  { id: 'm4', student: 'Tchamba Romuald', internship: 'Data Analyst Intern', grade: 'Grade B', status: 'Pending', period: 'Mar 2026' },
]

function normalizeList(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.results)) return data.results
  return []
}

function mapApiReport(r) {
  const submitted = Boolean(r.reviewed_by)
  return {
    id: r.id,
    student: r.student_name || '—',
    internship: `Internship #${r.internship ?? '—'}`,
    grade: r.grade || '—',
    status: submitted ? 'Submitted' : 'Pending',
    period: '—',
    supervisor: r.supervisor_name,
  }
}

function mergeById(apiRows, mockRows) {
  const ids = new Set(apiRows.map((row) => row.id))
  return [...apiRows, ...mockRows.filter((m) => !ids.has(m.id))]
}

function SlideOver({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <>
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 100,
          border: 'none',
          cursor: 'pointer',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 'min(420px, 100vw)',
          backgroundColor: C.card,
          borderLeft: `1px solid ${C.border}`,
          zIndex: 101,
          overflowY: 'auto',
          padding: 24,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: C.white }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: `1px solid ${C.border}`,
              color: C.muted,
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted }}>{label}</p>
      <p style={{ margin: 0, fontSize: 14, color: C.white, wordBreak: 'break-word' }}>{value ?? '—'}</p>
    </div>
  )
}

export function AdminReportsPage() {
  const [rows, setRows] = useState(MOCK_REPORTS)
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.get('/reports/')
        const list = normalizeList(res.data).map(mapApiReport)
        if (!cancelled) setRows((prev) => (list.length ? mergeById(list, MOCK_REPORTS) : prev))
      } catch {
        if (!cancelled) setRows(MOCK_REPORTS)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.student.toLowerCase().includes(q))
  }, [rows, search])

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: C.white, margin: '0 0 6px' }}>Reports</h1>
        <p style={{ fontSize: '0.875rem', color: C.muted, margin: 0 }}>Internship reports and supervisor grades</p>
      </div>

      <div
        style={{
          marginBottom: 16,
          backgroundColor: '#2a2a2a',
          border: '1px solid #3a3a3a',
          borderRadius: 12,
          padding: '12px 16px',
        }}
      >
        <input
          type="search"
          placeholder="Search by student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: C.white,
            fontSize: 14,
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: C.bg }}>
              {['Student', 'Internship', 'Grade', 'Status', 'Period', ''].map((h) => (
                <th
                  key={h || 'a'}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: C.muted,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr
                key={r.id}
                style={{
                  borderBottom: idx < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: C.white }}>{r.student}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted }}>{r.internship}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: C.accent, fontWeight: 600 }}>{r.grade}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: r.status === 'Submitted' ? '#22c55e' : C.muted }}>{r.status}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted }}>{r.period}</td>
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    onClick={() => setViewing(r)}
                    style={{
                      marginRight: 8,
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: `1px solid ${C.accent}`,
                      backgroundColor: 'transparent',
                      color: C.accent,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((x) => x.id !== r.id))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: `1px solid ${C.red}`,
                      backgroundColor: 'transparent',
                      color: C.red,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlideOver open={!!viewing} onClose={() => setViewing(null)} title="Report details">
        {viewing && (
          <>
            <DetailRow label="Student" value={viewing.student} />
            <DetailRow label="Internship" value={viewing.internship} />
            <DetailRow label="Grade" value={viewing.grade} />
            <DetailRow label="Status" value={viewing.status} />
            <DetailRow label="Period" value={viewing.period} />
            {viewing.supervisor != null && <DetailRow label="Supervisor" value={viewing.supervisor} />}
            <DetailRow label="Record ID" value={String(viewing.id)} />
          </>
        )}
      </SlideOver>
    </div>
  )
}
