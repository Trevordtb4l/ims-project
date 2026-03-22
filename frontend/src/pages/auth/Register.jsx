import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="text-center p-10 rounded-2xl border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <h1 className="text-3xl font-bold text-white mb-4">Registration</h1>
        <p className="mb-6" style={{ color: '#888888' }}>Registration page coming soon.</p>
        <Link to="/login" className="font-medium hover:underline" style={{ color: '#CFFF00' }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}
