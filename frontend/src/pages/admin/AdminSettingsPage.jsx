import { useToast } from '@/components/Toast.jsx'

const C = {
  bg: '#0f0f0f',
  card: '#1a1a1a',
  white: '#ffffff',
  muted: '#888888',
  border: '#2a2a2a',
  red: '#ef4444',
}

export function AdminSettingsPage() {
  const { toast } = useToast()

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: C.white, margin: '0 0 6px' }}>Settings</h1>
        <p style={{ fontSize: '0.875rem', color: C.muted, margin: 0 }}>System information and administrator preferences</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: C.white }}>System Info</h2>
          <p style={{ margin: '0 0 8px', fontSize: 14, color: C.white, fontWeight: 600 }}>University of Buea IMS v1.0</p>
          <p style={{ margin: '0 0 8px', fontSize: 14, color: C.muted }}>College of Technology</p>
          <p style={{ margin: 0, fontSize: 14, color: C.muted }}>Academic Year 2025/2026</p>
        </div>

        <div
          style={{
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: C.white }}>Admin Account</h2>
          <p style={{ margin: '0 0 6px', fontSize: 14, color: C.white }}>
            <span style={{ color: C.muted }}>Name: </span>
            Admin User
          </p>
          <p style={{ margin: '0 0 6px', fontSize: 14, color: C.white }}>
            <span style={{ color: C.muted }}>Email: </span>
            admin@ims.test
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: C.white }}>
            <span style={{ color: C.muted }}>Role: </span>
            Administrator
          </p>
          <button
            type="button"
            disabled
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              backgroundColor: '#2a2a2a',
              color: C.muted,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'not-allowed',
              fontFamily: 'inherit',
            }}
          >
            Change Password
          </button>
        </div>

        <div
          style={{
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 800, color: C.red }}>Danger Zone</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
            Irreversible actions that affect all system data. Use with extreme caution.
          </p>
          <button
            type="button"
            onClick={() => toast('This action is disabled in demo mode', 'error')}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: `1px solid ${C.red}`,
              backgroundColor: 'transparent',
              color: C.red,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Reset System Data
          </button>
        </div>
      </div>
    </div>
  )
}
