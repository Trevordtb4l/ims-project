import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { GraduationCap, Bell, LogOut } from 'lucide-react'

const NAV = ['Dashboard', 'Students', 'Approvals', 'Reports']

function getInitials(user) {
  if (!user) return '?'
  const first = user.first_name || user.firstName || ''
  const last = user.last_name || user.lastName || ''
  if (first || last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  return (user.username || user.email || '?').charAt(0).toUpperCase()
}

export default function SupervisorLayout() {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const initials = getInitials(user)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0f0f0f', color: '#ffffff' }}>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: '#111111', borderBottom: '1px solid #2a2a2a' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#CFFF00' }}
          >
            <GraduationCap size={18} style={{ color: '#000' }} />
          </div>
          <span className="text-white font-bold text-lg">
            IMS <span style={{ color: '#CFFF00' }}>Supervisor</span>
          </span>
        </div>

        <div
          className="hidden md:flex items-center gap-1 px-2 py-1 rounded-xl"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
        >
          {NAV.map((item) => (
            <NavLink
              key={item}
              to={`/supervisor/${item.toLowerCase()}`}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'text-white' : 'text-[#888888] hover:text-white'
                }`
              }
              style={({ isActive }) => (isActive ? { backgroundColor: '#2a2a2a' } : {})}
            >
              {item}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          <button type="button" className="p-1 rounded-lg hover:opacity-80" aria-label="Notifications">
            <Bell size={20} style={{ color: '#888888' }} />
          </button>
          <span className="text-white text-sm font-medium hidden sm:inline max-w-[140px] truncate">
            {user?.first_name} {user?.last_name}
          </span>
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer border-0"
            style={{ backgroundColor: '#CFFF00', color: '#000' }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {initials}
          </button>
          {showDropdown && (
            <div
              className="absolute right-0 top-14 rounded-xl p-2 z-50 min-w-[160px]"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false)
                  logout()
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm w-full text-left border-0 cursor-pointer"
                style={{ color: '#888888', background: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a2a2a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto px-8 pb-10 pt-20" style={{ backgroundColor: '#0f0f0f' }}>
        <Outlet />
      </main>
    </div>
  )
}
