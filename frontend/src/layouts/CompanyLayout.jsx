import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import api from '@/api/axios'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  LayoutGrid,
} from 'lucide-react'

const SIDEBAR_W = 240

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/company/dashboard' },
  { label: 'Internships', icon: Briefcase, path: '/company/internships' },
  { label: 'Applicants', icon: Users, path: '/company/applicants', badge: true },
  { label: 'Messages', icon: MessageSquare, path: '/company/messages' },
  { label: 'Settings', icon: Settings, path: '/company/settings' },
]

function extractCount(data) {
  if (data == null) return 0
  if (typeof data.count === 'number') return data.count
  if (Array.isArray(data)) return data.length
  if (Array.isArray(data.results)) return data.results.length
  return 0
}

export default function CompanyLayout() {
  const { user, logout } = useAuth()
  const [applicantCount, setApplicantCount] = useState(0)

  const [companyName, setCompanyName] = useState(
    user?.company_name || user?.companyName || 'Company'
  )

  useEffect(() => {
    async function loadCompany() {
      try {
        const { data } = await api.get('/companies/')
        const list = Array.isArray(data) ? data : data.results ?? []
        if (list.length > 0 && list[0].name) {
          const name = list[0].name
          setCompanyName(name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
        }
      } catch {}
    }
    loadCompany()
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data } = await api.get('/internship-applications/?company=me')
        if (!cancelled) setApplicantCount(extractCount(data))
      } catch {
        if (!cancelled) setApplicantCount(0)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0f0f', color: '#ffffff' }}>
      <aside
        style={{
          width: `${SIDEBAR_W}px`,
          minWidth: `${SIDEBAR_W}px`,
          backgroundColor: '#111111',
          borderRight: '1px solid #2a2a2a',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
        }}
      >
        {/* Company header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #2a2a2a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#CFFF00',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LayoutGrid size={20} style={{ color: '#000000' }} />
            </div>
            <div className="min-w-0">
              <p
                className="truncate"
                style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap' }}
              >
                {companyName}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#888888' }}>Enterprise Account</p>
            </div>
          </div>
        </div>

        {/* Nav — icon + label on every item */}
        <nav
          style={{
            flex: 1,
            minHeight: 0,
            padding: '12px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {NAV.map((item) => (
            <NavLink key={item.path} to={item.path} className="block" style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? '#CFFF00' : 'transparent',
                    color: isActive ? '#000000' : '#888888',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <item.icon size={18} style={{ flexShrink: 0 }} strokeWidth={2} />
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>{item.label}</span>
                  {item.badge && applicantCount > 0 && (
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: isActive ? '#000000' : '#CFFF00',
                        color: isActive ? '#CFFF00' : '#000000',
                      }}
                    >
                      {applicantCount > 99 ? '99+' : applicantCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom — Log Out */}
        <div style={{ marginTop: 'auto', padding: '20px 12px', borderTop: '1px solid #2a2a2a' }}>
          <button
            type="button"
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 16px',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#888888',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1a1a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      <main
        className="min-w-0"
        style={{
          marginLeft: `${SIDEBAR_W}px`,
          minHeight: '100vh',
          backgroundColor: '#0f0f0f',
        }}
      >
        <div style={{ padding: '32px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
