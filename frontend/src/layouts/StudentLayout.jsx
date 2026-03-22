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
} from 'lucide-react'

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/applications', label: 'Applications', icon: FileText },
  { to: '/student/logbook', label: 'Logbook', icon: BookOpen },
  { to: '/student/profile', label: 'Profile', icon: User },
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
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={28} style={{ color: '#CFFF00' }} />
            <span className="text-xl font-bold tracking-tight">IMS</span>
          </div>
          <p className="text-xs mt-1" style={{ color: '#888888' }}>
            Student Portal
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  isActive ? 'text-black' : 'hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: '#CFFF00', color: '#000000' }
                  : { color: '#ffffff' }
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-4 pb-4 mt-auto" style={{ borderTop: '1px solid #2a2a2a' }}>
          <div className="flex items-center gap-3 py-4">
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
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-xl transition-colors hover:bg-white/5"
            style={{ color: '#888888' }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-8 py-4"
          style={{ backgroundColor: '#0f0f0f', borderBottom: '1px solid #2a2a2a' }}
        >
          <h1 className="text-xl font-semibold">{getPageTitle(location.pathname)}</h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#888888' }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-xl outline-none w-60 placeholder:text-[#888888]"
                style={{ backgroundColor: '#2a2a2a', color: '#ffffff', border: 'none' }}
              />
            </div>
            <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Bell size={18} style={{ color: '#888888' }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
