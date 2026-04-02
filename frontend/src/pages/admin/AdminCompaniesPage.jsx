import { useEffect, useMemo, useState } from 'react'
import api from '@/api/axios'

const C = {
  bg: '#0f0f0f',
  card: '#1a1a1a',
  accent: '#CFFF00',
  muted: '#888888',
  border: '#2a2a2a',
  red: '#ef4444',
}

const MOCK_COMPANIES = [
  { id: 'm1', name: 'Orange Cameroon', location: 'Douala', sector: 'Telecoms' },
  { id: 'm2', name: 'MTN Cameroon', location: 'Yaoundé', sector: 'Telecoms' },
  { id: 'm3', name: 'Camtel', location: 'Yaoundé', sector: 'Telecoms' },
  { id: 'm4', name: 'ANTIC', location: 'Yaoundé', sector: 'Government/IT' },
  { id: 'm5', name: 'Digitaria Cameroon', location: 'Douala', sector: 'Digital Agency' },
]

function normalizeList(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.results)) return data.results
  return []
}

function mapApiCompany(c) {
  const addr = (c.address || '').trim()
  const location = addr.split('\n')[0] || addr || '—'
  return {
    id: c.id,
    name: c.name || '—',
    location,
    sector: '—',
    email: c.email || c.contact_email,
    verified: c.verified,
  }
}

function mergeById(apiRows, mockRows) {
  const ids = new Set(apiRows.map((r) => r.id))
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

export function AdminCompaniesPage() {
  const [rows, setRows] = useState(MOCK_COMPANIES)
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.get('/companies/')
        const list = normalizeList(res.data).map(mapApiCompany)
        if (!cancelled) setRows((prev) => (list.length ? mergeById(list, MOCK_COMPANIES) : prev))
      } catch {
        if (!cancelled) setRows(MOCK_COMPANIES)
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: C.white, margin: '0 0 6px' }}>Companies</h1>
        <p style={{ fontSize: '0.875rem', color: C.muted, margin: 0 }}>Partner organizations offering internships</p>
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
              {['Name', 'Location', 'Sector', ''].map((h) => (
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
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: C.white }}>{r.name}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted }}>{r.location}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted }}>{r.sector}</td>
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

      <SlideOver open={!!viewing} onClose={() => setViewing(null)} title="Company details">
        {viewing && (
          <>
            <DetailRow label="Name" value={viewing.name} />
            <DetailRow label="Location" value={viewing.location} />
            <DetailRow label="Sector" value={viewing.sector} />
            {viewing.email != null && <DetailRow label="Email" value={viewing.email} />}
            {viewing.verified != null && <DetailRow label="Verified" value={viewing.verified ? 'Yes' : 'No'} />}
            <DetailRow label="Record ID" value={String(viewing.id)} />
          </>
        )}
      </SlideOver>
    </div>
  )
}
