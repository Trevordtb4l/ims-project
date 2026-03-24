import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { GraduationCap, Bell, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext.jsx'

export default function SupervisorLayout() {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f' }}>
      {/* Top Navbar */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: '#111111',
          borderBottom: '1px solid #2a2a2a',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#CFFF00',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GraduationCap size={20} style={{ color: '#000000' }} />
          </div>
          <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '1rem' }}>
            IMS <span style={{ color: '#CFFF00' }}>Supervisor</span>
          </span>
        </div>

        {/* Center Nav */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '14px',
          }}
        >
          {[
            { label: 'Dashboard', path: '/supervisor/dashboard' },
            { label: 'Students', path: '/supervisor/students' },
            { label: 'Approvals', path: '/supervisor/approvals' },
            { label: 'Reports', path: '/supervisor/reports' },
          ].map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              style={({ isActive }) => ({
                padding: '8px 18px',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#ffffff' : '#888888',
                backgroundColor: isActive ? '#2a2a2a' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={20} style={{ color: '#888888' }} />
            <div
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
              }}
            />
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', position: 'relative' }}
            onClick={() => setShowDropdown(!showDropdown)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setShowDropdown(!showDropdown)
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', lineHeight: 1 }}>
                {user?.first_name} {user?.last_name}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#888888', marginTop: '2px' }}>Faculty of Engineering</p>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#CFFF00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.813rem',
                color: '#000',
              }}
            >
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </div>
            <ChevronDown size={14} style={{ color: '#888888' }} />
            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  padding: '8px',
                  minWidth: '160px',
                  zIndex: 100,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#888888',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    textAlign: 'left',
                  }}
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
        </div>
      </nav>

      {/* Main content */}
      <main style={{ paddingTop: '64px', minHeight: '100vh', backgroundColor: '#0f0f0f' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
