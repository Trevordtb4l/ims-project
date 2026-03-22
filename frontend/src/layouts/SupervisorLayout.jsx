import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { GraduationCap, Bell, LogOut, ChevronDown } from 'lucide-react'

const navItems = [
  { to: '/supervisor/dashboard', label: 'Dashboard' },
  { to: '/supervisor/students', label: 'Students' },
  { to: '/supervisor/approvals', label: 'Approvals' },
  { to: '/supervisor/reports', label: 'Reports' },
]

function getInitials(user) {
  if (!user) return '?'
  const first = user.first_name || user.firstName || ''
  const last = user.last_name || user.lastName || ''
  if (first || last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  return (user.username || user.email || '?').charAt(0).toUpperCase()
}

export default function SupervisorLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const initials = getInitials(user)
  const fullName = user
    ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || user.username
    : 'Supervisor'

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0f0f0f', color: '#ffffff' }}>
      {/* Top navbar */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-6 h-16"
        style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}
      >
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <GraduationCap size={24} style={{ color: '#CFFF00' }} />
          <span className="text-lg font-bold tracking-tight">IMS</span>
          <span
            className="text-xs font-medium ml-2 px-2 py-0.5 rounded"
            style={{ color: '#888888' }}
          >
            Supervisor
          </span>
        </div>

        {/* Center: Nav pills */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-1.5 text-sm font-medium rounded-xl transition-colors ${
                  isActive ? '' : 'hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }
                  : { color: '#888888' }
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Bell + user + dropdown */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
            <Bell size={18} style={{ color: '#888888' }} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-white/5 transition-colors"
            >
              <span className="text-sm font-medium hidden sm:inline">{fullName}</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: '#CFFF00', color: '#000000' }}
              >
                {initials}
              </div>
              <ChevronDown size={14} style={{ color: '#888888' }} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-44 rounded-xl shadow-lg py-1 z-50"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
              >
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                  style={{ color: '#888888' }}
                >
                  <LogOut size={15} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
