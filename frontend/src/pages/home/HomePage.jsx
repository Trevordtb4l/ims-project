import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="text-center p-10 rounded-2xl border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <h1 className="text-4xl font-bold mb-4 text-white">Internship Management System</h1>
        <p className="mb-6" style={{ color: '#888888' }}>Manage your internship journey</p>
        <Link
          to="/login"
          className="inline-block px-8 py-3 rounded-xl font-semibold text-black transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#CFFF00' }}
        >
          Login
        </Link>
      </div>
    </div>
  );
}
