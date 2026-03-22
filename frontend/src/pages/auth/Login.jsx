import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext.jsx';

const ROLES = [
  { label: 'Student', value: 'student' },
  { label: 'Company', value: 'company' },
  { label: 'Staff', value: 'supervisor' },
];

const ROLE_REDIRECTS = {
  student: '/student/dashboard',
  company: '/company/dashboard',
  supervisor: '/supervisor/dashboard',
  coordinator: '/coordinator/dashboard',
  admin: '/admin/dashboard',
};

export default function Login() {
  const [activeRole, setActiveRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login/', {
        username: email,
        password,
        role: activeRole,
      });

      const { tokens, user } = res.data;
      login(tokens, user);

      const redirect = ROLE_REDIRECTS[user.role] || '/';
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="w-full max-w-md p-8 rounded-2xl border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <h1 className="text-2xl font-bold text-white text-center mb-8">Sign In</h1>

        <div className="rounded-xl p-1 mb-6" style={{ backgroundColor: '#2a2a2a' }}>
          <div className="flex">
            {ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setActiveRole(role.value)}
                className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: activeRole === role.value ? '#CFFF00' : 'transparent',
                  color: activeRole === role.value ? '#000000' : '#888888',
                }}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#888888' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-white outline-none border border-transparent focus:border-[#CFFF00] transition-colors"
              style={{ backgroundColor: '#2a2a2a' }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#888888' }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-white outline-none border border-transparent focus:border-[#CFFF00] transition-colors pr-12"
                style={{ backgroundColor: '#2a2a2a' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#888888' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#CFFF00' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
