import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  BookOpen,
  User,
  Bell,
  LogOut,
  Search,
  MessageSquare,
} from 'lucide-react'

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/applications', label: 'Applications', icon: FileText },
  { to: '/student/logbook', label: 'Logbook', icon: BookOpen },
  { to: '/student/profile', label: 'Profile', icon: User },
  { to: '/student/messages', label: 'Messages', icon: MessageSquare },
]

function getInitials(user) {
  if (!user) return '?'
  const first = user.first_name || user.firstName || ''
  const last = user.last_name || user.lastName || ''
  if (first || last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  return (user.username || user.email || '?').charAt(0).toUpperCase()
}

function getPageTitle(pathname) {
  const match = navItems.find((item) => pathname.startsWith(item.to))
  return match ? match.label : 'Dashboard'
}

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [search, setSearch] = useState('')

  const initials = getInitials(user)
  const fullName = user
    ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || user.username
    : 'Student'
  const program = user?.program || user?.department || 'Student'

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0f0f0f', color: '#ffffff' }}>
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full w-64 flex flex-col z-30"
        style={{ backgroundColor: '#1a1a1a', borderRight: '1px solid #2a2a2a' }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 24px 12px' }}>
          <div className="flex items-center gap-2">
            <GraduationCap size={28} style={{ color: '#CFFF00' }} />
            <span className="text-xl font-bold tracking-tight">IMS</span>
          </div>
          <p className="text-xs mt-1" style={{ color: '#888888' }}>
            Student Portal
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                borderRadius: 12,
                marginBottom: 2,
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s',
                backgroundColor: isActive ? '#CFFF00' : 'transparent',
                color: isActive ? '#000000' : '#888888',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.style.backgroundColor.includes('207')) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = '#ffffff'
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.style.backgroundColor.includes('207')) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#888888'
                }
              }}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{ padding: '0 16px 16px', marginTop: 'auto', borderTop: '1px solid #2a2a2a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: '#CFFF00', color: '#000000' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{fullName}</p>
              <p className="text-xs truncate" style={{ color: '#888888' }}>
                {program}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '8px 12px',
              backgroundColor: 'transparent', border: 'none',
              borderRadius: 10, color: '#888888',
              fontSize: '0.875rem', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#ffffff' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888888' }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: '256px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 32px',
          backgroundColor: '#0f0f0f',
          borderBottom: '1px solid #2a2a2a',
        }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            {getPageTitle(location.pathname)}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888888' }} />
              <input
                type="text"
                placeholder="Search internships..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: 36, paddingRight: 16, paddingTop: 9, paddingBottom: 9,
                  backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                  borderRadius: 10, color: '#ffffff', fontSize: '0.875rem',
                  outline: 'none', width: 280,
                }}
                onFocus={e => e.target.style.borderColor = '#CFFF00'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
            </div>
            <button style={{
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Bell size={17} style={{ color: '#888888' }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
