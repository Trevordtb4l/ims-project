import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import {
  LayoutDashboard, Users, Briefcase, FileText,
  Settings, LogOut, Shield, Bell, GraduationCap,
  Building2, UserCheck,
} from 'lucide-react'

const C = {
  bg: '#0f0f0f', card: '#1a1a1a', accent: '#CFFF00',
  white: '#ffffff', muted: '#888888', border: '#2a2a2a', olive: '#4a5a00',
}

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Students', icon: GraduationCap, path: '/admin/students' },
  { label: 'Companies', icon: Building2, path: '/admin/companies' },
  { label: 'Internships', icon: Briefcase, path: '/admin/internships' },
  { label: 'Reports', icon: FileText, path: '/admin/reports' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'A'
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Admin'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, backgroundColor: C.card,
        borderRight: `1px solid ${C.border}`,
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', zIndex: 40,
      }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, backgroundColor: C.accent, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={20} color="#000" />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: C.white, margin: 0 }}>IMS Admin</p>
              <p style={{ fontSize: '0.72rem', color: C.muted, margin: 0 }}>System Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {NAV.map(({ label, icon: Icon, path }) => (
            <NavLink key={path} to={path} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 16px 10px 13px', borderRadius: 10, marginBottom: 4,
                    borderLeft: isActive ? '3px solid #CFFF00' : '3px solid transparent',
                    backgroundColor: isActive ? C.accent : 'transparent',
                    color: isActive ? '#000' : C.muted,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#1f1f1f'
                      e.currentTarget.style.color = '#ffffff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#888888'
                    }
                  }}
                >
                  <Icon size={20} />
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: '#000', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: C.white, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName}</p>
              <p style={{ fontSize: '0.72rem', color: C.muted, margin: 0 }}>Administrator</p>
            </div>
          </div>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '9px 16px',
            backgroundColor: 'transparent', border: 'none',
            borderRadius: 10, color: C.muted,
            fontSize: '0.875rem', cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2a2a2a'; e.currentTarget.style.color = C.white }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.muted }}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh', backgroundColor: C.bg }}>
        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 32px',
          backgroundColor: C.bg,
          borderBottom: '1px solid #2a2a2a',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <p style={{ fontSize: '0.75rem', color: C.muted, margin: 0 }}>
            Internship Management System — <span style={{ color: C.accent }}>Admin Panel</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: '5px 14px', backgroundColor: '#14532d', border: '1px solid #22c55e', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, color: '#22c55e' }}>
              ● System Online
            </div>
            <div style={{ position: 'relative' }}>
              <button style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.card, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Bell size={16} color={C.muted} />
              </button>
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#CFFF00',
                  border: '2px solid #0f0f0f',
                }}
              />
            </div>
          </div>
        </header>
        <div style={{ padding: '32px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
