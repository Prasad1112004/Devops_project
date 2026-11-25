import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TruckIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const demos = [
    { label: 'Admin',    email: 'admin@logitrack.com' },
    { label: 'Driver',   email: 'ravi@logitrack.com' },
    { label: 'Customer', email: 'john@customer.com' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-brand-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="bg-brand-600 p-1.5 rounded-lg"><TruckIcon size={20} className="text-white" /></div>
          <span className="font-bold text-xl">Logi<span className="text-brand-600">Track</span></span>
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">Sign In</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Welcome back! Enter your credentials.</p>

        {/* Demo shortcuts */}
        <div className="flex gap-2 mb-5 flex-wrap justify-center">
          {demos.map(d => (
            <button key={d.label}
              className="text-xs px-3 py-1 border border-brand-200 rounded-full text-brand-700 hover:bg-brand-50 transition"
              onClick={() => setForm({ email: d.email, password: 'Password123!' })}>
              {d.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com" className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••" className="input" required />
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full justify-center py-2.5">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          No account? <Link to="/register" className="text-brand-600 hover:underline font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}
