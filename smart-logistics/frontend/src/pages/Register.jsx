import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TruckIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name:'', email:'', password:'', phone:'', role:'Customer' });
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome, ${user.name}!`);
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-brand-900 flex items-center justify-center px-4 py-10">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="bg-brand-600 p-1.5 rounded-lg"><TruckIcon size={20} className="text-white" /></div>
          <span className="font-bold text-xl">Logi<span className="text-brand-600">Track</span></span>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

        <form onSubmit={submit} className="space-y-4">
          {[['name','Full Name','John Doe'],['email','Email','you@example.com'],['phone','Phone (optional)','+91 9000000000']].map(([k,l,p]) => (
            <div key={k}>
              <label className="block text-sm font-medium mb-1">{l}</label>
              <input type={k==='email'?'email':'text'} value={form[k]} onChange={f(k)} placeholder={p} className="input" required={k!=='phone'} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={form.password} onChange={f('password')} placeholder="Min 6 characters" className="input" required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select value={form.role} onChange={f('role')} className="input">
              <option>Customer</option>
              <option>Driver</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account? <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
