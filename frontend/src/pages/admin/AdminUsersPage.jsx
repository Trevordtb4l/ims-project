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

const MOCK_USERS = [
  { id: 'm1', name: 'Andeh Trevor', email: 'andeh.trevor@ub.edu', role: 'student', status: 'active', joined: '2026-01-10' },
  { id: 'm2', name: 'Fomban Giscard', email: 'fomban.giscard@ub.edu', role: 'student', status: 'active', joined: '2026-01-11' },
  { id: 'm3', name: 'Nkeng Marlène', email: 'nkeng.marlene@ub.edu', role: 'student', status: 'active', joined: '2026-01-12' },
  { id: 'm4', name: 'Tchamba Romuald', email: 'tchamba.romuald@ub.edu', role: 'student', status: 'active', joined: '2026-01-13' },
  { id: 'm5', name: 'Mbarga Estelle', email: 'mbarga.estelle@ub.edu', role: 'student', status: 'active', joined: '2026-01-14' },
  { id: 'm6', name: 'John Supervisor', email: 'john.supervisor@ims.test', role: 'supervisor', status: 'active', joined: '2025-09-01' },
  { id: 'm7', name: 'Mary Kolle', email: 'mary.kolle@ims.test', role: 'supervisor', status: 'active', joined: '2025-09-02' },
  { id: 'm8', name: 'Orange Cameroon', email: 'contact@orange.cm', role: 'company', status: 'active', joined: '2025-08-01' },
  { id: 'm9', name: 'MTN Cameroon', email: 'info@mtn.cm', role: 'company', status: 'active', joined: '2025-08-05' },
  { id: 'm10', name: 'IMS Coordinator', email: 'coordinator@ims.test', role: 'coordinator', status: 'active', joined: '2025-07-01' },
  { id: 'm11', name: 'Admin User', email: 'admin@ims.test', role: 'admin', status: 'active', joined: '2025-06-01' },
]

function normalizeList(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.results)) return data.results
  return []
}

function mapApiUser(u) {
  const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || u.email || 'User'
  return {
    id: u.id,
    name,
    email: u.email || '—',
    role: u.role || 'student',
    status: 'active',
    joined: u.date_joined?.split?.('T')?.[0] || '2026-01-01',
  }
}

function mergeById(apiRows, mockRows) {
  const ids = new Set(apiRows.map((r) => r.id))
  return [...apiRows, ...mockRows.filter((m) => !ids.has(m.id))]
}

function RoleBadge({ role }) {
  const map = {
    student: { bg: C.olive, color: C.accent, label: 'Student' },
    supervisor: { bg: '#1e3a5f', color: '#60a5fa', label: 'Supervisor' },
    company: { bg: '#14532d', color: '#22c55e', label: 'Company' },
    coordinator: { bg: '#450a0a', color: '#ef4444', label: 'Coordinator' },
    admin: { bg: '#2a2a2a', color: C.muted, label: 'Admin' },
  }
  const s = map[role] || map.student
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
      <p style={{ margin: 0, fontSize: 14, color: C.white, wordBreak: 'break-word' }}>{value}</p>
    </div>
  )
}

export function AdminUsersPage() {
  const [rows, setRows] = useState(MOCK_USERS)
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.get('/auth/users/')
        const list = normalizeList(res.data).map(mapApiUser)
        if (!cancelled) setRows((prev) => (list.length ? mergeById(list, MOCK_USERS) : prev))
      } catch {
        if (!cancelled) setRows(MOCK_USERS)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(q))
  }, [rows, search])

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: C.white, margin: '0 0 6px' }}>Users</h1>
        <p style={{ fontSize: '0.875rem', color: C.muted, margin: 0 }}>All registered accounts across the IMS platform</p>
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
          placeholder="Search by name..."
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
              {['Name', 'Email', 'Role', 'Status', ''].map((h) => (
                <th
                  key={h || 'actions'}
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
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: C.white }}>{r.name}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted }}>{r.email}</td>
                <td style={{ padding: '14px 16px' }}>
                  <RoleBadge role={r.role} />
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#22c55e', fontWeight: 600 }}>{r.status}</td>
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

      <SlideOver open={!!viewing} onClose={() => setViewing(null)} title="User details">
        {viewing && (
          <>
            <DetailRow label="Name" value={viewing.name} />
            <DetailRow label="Email" value={viewing.email} />
            <DetailRow label="Role" value={viewing.role} />
            <DetailRow label="Status" value={viewing.status} />
            <DetailRow label="Joined" value={viewing.joined} />
            <DetailRow label="Record ID" value={String(viewing.id)} />
          </>
        )}
      </SlideOver>
    </div>
  )
}
