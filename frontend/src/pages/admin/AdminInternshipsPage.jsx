import { useEffect, useMemo, useState } from 'react'
import api from '@/api/axios'

const C = {
  bg: '#0f0f0f',
  card: '#1a1a1a',
  accent: '#CFFF00',
  white: '#ffffff',
  muted: '#888888',
  border: '#2a2a2a',
  olive: '#4a5a00',
  red: '#ef4444',
}

const MOCK_INTERNSHIPS = [
  { id: 'm1', title: 'Software Engineering Internship', company: 'Orange Cameroon', student: 'Andeh Trevor', status: 'ongoing', period: 'Jan 6 to Feb 28 2026' },
  { id: 'm2', title: 'Frontend Developer Intern', company: 'MTN Cameroon', student: 'Fomban Giscard', status: 'ongoing', period: 'Feb 1 to Apr 30 2026' },
  { id: 'm3', title: 'Backend Developer Intern', company: 'Camtel', student: 'Nkeng Marlène', status: 'open', period: 'Mar 1 to May 31 2026' },
  { id: 'm4', title: 'Data Analyst Intern', company: 'ANTIC', student: 'Unassigned', status: 'open', period: 'Apr 1 to Jun 30 2026' },
  { id: 'm5', title: 'UI/UX Design Intern', company: 'Digitaria Cameroon', student: 'Unassigned', status: 'open', period: 'Apr 15 to Jul 15 2026' },
]

function normalizeList(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.results)) return data.results
  return []
}

function fmtPeriod(start, end) {
  if (!start && !end) return '—'
  try {
    const a = start ? new Date(start) : null
    const b = end ? new Date(end) : null
    const opts = { month: 'short', day: 'numeric', year: 'numeric' }
    if (a && b) return `${a.toLocaleDateString('en-US', opts)} – ${b.toLocaleDateString('en-US', opts)}`
    return String(start || end)
  } catch {
    return `${start || ''} to ${end || ''}`
  }
}

function mapApiInternship(i) {
  return {
    id: i.id,
    title: i.title || 'Internship',
    company: i.company_name || '—',
    student: i.student_name || 'Unassigned',
    status: i.status || 'open',
    period: fmtPeriod(i.start_date, i.end_date),
    start_date: i.start_date,
    end_date: i.end_date,
    description: i.description,
  }
}

function mergeById(apiRows, mockRows) {
  const ids = new Set(apiRows.map((r) => r.id))
  return [...apiRows, ...mockRows.filter((m) => !ids.has(m.id))]
}

function StatusBadge({ status }) {
  const map = {
    ongoing: { bg: C.olive, color: C.accent, label: 'Ongoing' },
    open: { bg: '#14532d', color: '#22c55e', label: 'Open' },
    pending: { bg: '#1e3a5f', color: '#60a5fa', label: 'Pending' },
    completed: { bg: '#2a2a2a', color: C.muted, label: 'Completed' },
    draft: { bg: '#2a2a2a', color: C.muted, label: 'Draft' },
    cancelled: { bg: '#450a0a', color: '#ef4444', label: 'Cancelled' },
  }
  const s = map[status] || map.open
  return (
    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
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
          width: 'min(440px, 100vw)',
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

export function AdminInternshipsPage() {
  const [rows, setRows] = useState(MOCK_INTERNSHIPS)
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.get('/internships/')
        const list = normalizeList(res.data).map(mapApiInternship)
        if (!cancelled) setRows((prev) => (list.length ? mergeById(list, MOCK_INTERNSHIPS) : prev))
      } catch {
        if (!cancelled) setRows(MOCK_INTERNSHIPS)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q)
        || r.company.toLowerCase().includes(q)
        || String(r.student).toLowerCase().includes(q),
    )
  }, [rows, search])

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: C.white, margin: '0 0 6px' }}>Internships</h1>
        <p style={{ fontSize: '0.875rem', color: C.muted, margin: 0 }}>Placements, companies, and assignment status</p>
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
          placeholder="Search by title, company, or student..."
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
              {['Title', 'Company', 'Student', 'Status', 'Period', ''].map((h) => (
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
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: C.white }}>{r.title}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted }}>{r.company}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: r.student === 'Unassigned' ? C.muted : C.accent, fontWeight: r.student === 'Unassigned' ? 400 : 600 }}>
                  {r.student}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <StatusBadge status={r.status} />
                </td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: C.muted }}>{r.period}</td>
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

      <SlideOver open={!!viewing} onClose={() => setViewing(null)} title="Internship details">
        {viewing && (
          <>
            <DetailRow label="Title" value={viewing.title} />
            <DetailRow label="Company" value={viewing.company} />
            <DetailRow label="Student" value={viewing.student} />
            <DetailRow label="Status" value={viewing.status} />
            <DetailRow label="Period" value={viewing.period} />
            {viewing.start_date != null && <DetailRow label="Start date" value={String(viewing.start_date)} />}
            {viewing.end_date != null && <DetailRow label="End date" value={String(viewing.end_date)} />}
            {viewing.description != null && viewing.description !== '' && <DetailRow label="Description" value={viewing.description} />}
            <DetailRow label="Record ID" value={String(viewing.id)} />
          </>
        )}
      </SlideOver>
    </div>
  )
}
