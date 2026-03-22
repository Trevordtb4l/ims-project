import { useAuth } from '@/context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="text-center p-10 rounded-2xl border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome, {user?.first_name || 'Student'}
        </h1>
        <p style={{ color: '#888888' }}>Student Dashboard</p>
      </div>
    </div>
  );
}
