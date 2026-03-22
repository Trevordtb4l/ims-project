import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import api from '@/api/axios'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  Bell,
  LogOut,
} from 'lucide-react'

const navItems = [
  { to: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/company/internships', label: 'Internships', icon: Briefcase },
  { to: '/company/applicants', label: 'Applicants', icon: Users },
  { to: '/company/messages', label: 'Messages', icon: MessageSquare },
  { to: '/company/settings', label: 'Settings', icon: Settings },
]

function getInitials(user) {
  if (!user) return '?'
  if (user.company_name || user.companyName) {
    const name = user.company_name || user.companyName
    return name.charAt(0).toUpperCase()
  }
  const first = user.first_name || user.firstName || ''
  const last = user.last_name || user.lastName || ''
  if (first || last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  return (user.username || user.email || '?').charAt(0).toUpperCase()
}

export default function CompanyLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [slots, setSlots] = useState({ total: 0, filled: 0 })

  const companyName = user?.company_name || user?.companyName || user?.username || 'Company'
  const initials = getInitials(user)

  useEffect(() => {
    async function fetchSlots() {
      try {
        const { data } = await api.get('internships/')
        const internships = Array.isArray(data) ? data : data.results || []
        const total = internships.reduce((sum, i) => sum + (i.total_slots || i.slots || 0), 0)
        const filled = internships.reduce((sum, i) => sum + (i.filled_slots || i.filled || 0), 0)
        setSlots({ total, filled })
      } catch {
        /* silently fail */
      }
    }
    fetchSlots()
  }, [])

  const remaining = Math.max(0, slots.total - slots.filled)
  const progressPct = slots.total > 0 ? (remaining / slots.total) * 100 : 0

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0f0f0f', color: '#ffffff' }}>
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full w-64 flex flex-col z-30"
        style={{ backgroundColor: '#1a1a1a', borderRight: '1px solid #2a2a2a' }}
      >
        {/* Brand */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: '#CFFF00', color: '#000000' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{companyName}</p>
              <p className="text-xs" style={{ color: '#888888' }}>
                Enterprise Account
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  isActive ? '' : 'hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }
                  : { color: '#888888' }
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="px-4 pb-2" style={{ borderTop: '1px solid #2a2a2a' }}>
          <p
            className="text-[10px] font-semibold tracking-widest mt-4 mb-3"
            style={{ color: '#888888' }}
          >
            QUICK STATS
          </p>
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span style={{ color: '#888888' }}>Remaining Slots</span>
              <span className="font-medium" style={{ color: '#CFFF00' }}>
                {remaining}/{slots.total}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#2a2a2a' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ backgroundColor: '#CFFF00', width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Log Out */}
        <div className="px-4 pb-4">
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
          className="sticky top-0 z-20 flex items-center justify-end px-8 py-4"
          style={{ backgroundColor: '#0f0f0f', borderBottom: '1px solid #2a2a2a' }}
        >
          <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
            <Bell size={18} style={{ color: '#888888' }} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
