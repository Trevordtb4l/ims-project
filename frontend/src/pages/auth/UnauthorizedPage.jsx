import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="text-center p-10 rounded-2xl border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <h1 className="text-3xl font-bold text-red-400 mb-4">Unauthorized</h1>
        <p className="text-white mb-2">Access Denied</p>
        <p className="mb-6" style={{ color: '#888888' }}>You do not have permission to view this page.</p>
        <Link to="/login" className="font-medium hover:underline" style={{ color: '#CFFF00' }}>
          Go to Login
        </Link>
      </div>
    </div>
  );
}
