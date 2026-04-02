import { useEffect, useMemo, useState } from 'react'
import api from '@/api/axios'

const MOCK_STUDENTS = [
  { id: 1, name: 'Andeh Trevor', matricule: 'CT23A017', program: 'B.Tech Software Engineering', department: 'Computer Engineering', email: 'trevorandeh@gmail.com', status: 'active' },
  { id: 2, name: 'Fomban Giscard', matricule: 'CT23A018', program: 'B.Tech Software Engineering', department: 'Computer Engineering', email: 'fomban.giscard@ub.edu', status: 'active' },
  { id: 3, name: 'Nkeng Marlène', matricule: 'CT23A019', program: 'B.Tech Networks & Telecom', department: 'Computer Engineering', email: 'nkeng.marlene@ub.edu', status: 'active' },
  { id: 4, name: 'Tchamba Romuald', matricule: 'CT23A020', program: 'B.Tech Civil Engineering', department: 'Civil Engineering', email: 'tchamba.romuald@ub.edu', status: 'active' },
  { id: 5, name: 'Mbarga Estelle', matricule: 'CT23A021', program: 'B.Tech Electrical Engineering', department: 'Electrical Engineering', email: 'mbarga.estelle@ub.edu', status: 'active' },
  { id: 6, name: 'Kouam Blaise', matricule: 'CT23A022', program: 'B.Tech Software Engineering', department: 'Computer Engineering', email: 'kouam.blaise@ub.edu', status: 'active' },
  { id: 7, name: 'Epie Samuel', matricule: 'CT23A023', program: 'B.Tech Mechanical Engineering', department: 'Mechanical Engineering', email: 'epie.samuel@ub.edu', status: 'active' },
  { id: 8, name: 'Mulema Harris', matricule: 'CT23A024', program: 'B.Tech Software Engineering', department: 'Computer Engineering', email: 'mulema.harris@ub.edu', status: 'active' },
]

function normalizeList(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.results)) return data.results
  return []
}

function matriculeKey(m) {
  return String(m || '').trim().toUpperCase()
}

function mapApiStudent(s) {
  const name = `${s.user_first_name || ''} ${s.user_last_name || ''}`.trim() || 'Student'
  return {
    id: s.id,
    name,
    matricule: s.matricule || '—',
    program: s.program || '—',
    department: s.department || '—',
    email: s.user_email || '—',
    status: 'active',
  }
}

function dedupeApiByMatricule(apiRows) {
  const seen = new Set()
  const out = []
  for (const r of apiRows) {
    const key = matriculeKey(r.matricule)
    const dedupeKey = key || `__id:${r.id}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    out.push(r)
  }
  return out
}

function mergeWithMock(apiRows, mockRows) {
  const apiDeduped = dedupeApiByMatricule(apiRows.map(mapApiStudent))
  const taken = new Set()
  for (const r of apiDeduped) {
    const key = matriculeKey(r.matricule)
    if (key) taken.add(key)
  }
  const merged = [...apiDeduped]
  for (const m of mockRows) {
    const key = matriculeKey(m.matricule)
    if (!key || taken.has(key)) continue
    taken.add(key)
    merged.push(m)
  }
  return merged
}

function initials(name) {
  if (!name || typeof name !== 'string') return 'S'
  const p = name.trim().split(/\s+/).filter(Boolean)
  if (p.length === 0) return 'S'
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase()
  return `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase()
}

function StatusPill({ status }) {
  const s = status || 'active'
  return (
    <span
      style={{
        backgroundColor: '#14532d',
        color: '#22c55e',
        borderRadius: 999,
        padding: '3px 10px',
        fontSize: '0.72rem',
        fontWeight: 700,
        display: 'inline-block',
        textTransform: 'capitalize',
      }}
    >
      {s}
    </span>
  )
}

export function AdminStudentsPage() {
  const [rows, setRows] = useState(() => [...MOCK_STUDENTS])
  const [search, setSearch] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.get('/students/')
        const list = normalizeList(res.data)
        if (!cancelled && list.length > 0) {
          setRows(mergeWithMock(list, MOCK_STUDENTS))
        }
      } catch {
        if (!cancelled) setRows([...MOCK_STUDENTS])
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
        r.name.toLowerCase().includes(q)
        || String(r.matricule).toLowerCase().includes(q),
    )
  }, [rows, search])

  return (
    <div style={{ backgroundColor: '#0f0f0f', minHeight: '100vh', padding: '32px' }}>
      <style>
        {`
          @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
          .slide-panel { animation: slideIn 0.25s ease }
          .admin-scroll::-webkit-scrollbar { width: 4px }
          .admin-scroll::-webkit-scrollbar-track { background: #1a1a1a }
          .admin-scroll::-webkit-scrollbar-thumb { background: #CFFF00; border-radius: 4px }
        `}
      </style>

      <div style={{ marginBottom: 28 }}>
        <div style={{ borderLeft: '4px solid #CFFF00', paddingLeft: 16 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>Students</h1>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#888888', margin: 0, marginTop: 6 }}>
          Registered students and academic programs
        </p>
      </div>

      <input
        type="search"
        placeholder="Search by name or matricule..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setSearchFocus(true)}
        onBlur={() => setSearchFocus(false)}
        style={{
          width: '100%',
          backgroundColor: '#1a1a1a',
          border: searchFocus ? '1px solid #CFFF00' : '1px solid #2a2a2a',
          borderRadius: 12,
          padding: '11px 16px',
          color: '#ffffff',
          fontSize: '0.875rem',
          outline: 'none',
          marginBottom: 24,
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />

      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 20, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f0f0f' }}>
              {['Name', 'Matricule', 'Program', 'Department', 'Status', 'Actions'].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '11px 20px',
                    textAlign: 'left',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: '#888888',
                    borderBottom: '1px solid #2a2a2a',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, idx) => (
              <tr
                key={student.id}
                style={{
                  borderBottom: idx < filtered.length - 1 ? '1px solid #2a2a2a' : '1px solid #2a2a2a',
                  transition: 'background 0.15s',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#111111' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <td style={{ padding: '14px 20px', fontSize: '0.875rem', color: '#ffffff' }}>{student.name}</td>
                <td style={{ padding: '14px 20px', fontSize: '0.875rem', color: '#CFFF00', fontWeight: 700 }}>{student.matricule}</td>
                <td style={{ padding: '14px 20px', fontSize: '0.875rem', color: '#ffffff' }}>{student.program}</td>
                <td style={{ padding: '14px 20px', fontSize: '0.875rem', color: '#ffffff' }}>{student.department}</td>
                <td style={{ padding: '14px 20px' }}>
                  <StatusPill status={student.status} />
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(student)
                      setOpen(true)
                    }}
                    style={{
                      border: '1px solid #CFFF00',
                      color: '#CFFF00',
                      backgroundColor: 'transparent',
                      borderRadius: 8,
                      padding: '5px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginRight: 8,
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#CFFF00'
                      e.currentTarget.style.color = '#000'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#CFFF00'
                    }}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((r) => r.id !== student.id))}
                    style={{
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      backgroundColor: 'transparent',
                      borderRadius: 8,
                      padding: '5px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#ef4444'
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

      {open && selected && (
        <>
          <div
            role="presentation"
            onClick={() => { setOpen(false); setSelected(null) }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              zIndex: 49,
            }}
          />
          <div
            className="slide-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 460,
              height: '100vh',
              backgroundColor: '#1a1a1a',
              borderLeft: '1px solid #2a2a2a',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '24px',
                borderBottom: '1px solid #2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: '#CFFF00',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {initials(selected.name)}
                </div>
                <div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>{selected.name}</p>
                  <span
                    style={{
                      backgroundColor: '#4a5a00',
                      color: '#CFFF00',
                      borderRadius: 999,
                      padding: '3px 12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      marginTop: 4,
                      display: 'inline-block',
                    }}
                  >
                    Student
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setOpen(false); setSelected(null) }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#888888',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#888888' }}
              >
                ×
              </button>
            </div>

            <div
              className="admin-scroll"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              {[
                { label: 'Full Name', value: selected.name, accent: false, pill: false },
                { label: 'Matricule', value: selected.matricule, accent: true, pill: false },
                { label: 'Program', value: selected.program, accent: false, pill: false },
                { label: 'Department', value: selected.department, accent: false, pill: false },
                { label: 'Email', value: selected.email, accent: false, pill: false },
                { label: 'Status', value: selected.status, accent: false, pill: true },
              ].map((field, i, arr) => (
                <div
                  key={field.label}
                  style={{
                    paddingBottom: 20,
                    borderBottom: i < arr.length - 1 ? '1px solid #2a2a2a' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      color: '#888888',
                      marginBottom: 4,
                    }}
                  >
                    {field.label}
                  </div>
                  {field.pill ? (
                    <StatusPill status={field.value} />
                  ) : (
                    <div
                      style={{
                        fontSize: '0.95rem',
                        color: field.accent ? '#CFFF00' : '#ffffff',
                        fontWeight: field.accent ? 700 : 500,
                      }}
                    >
                      {field.value ?? '—'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
