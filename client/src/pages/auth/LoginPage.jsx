import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, Sparkles, Key } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Navigate to role-specific dashboard
        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'ngo') navigate('/ngo/dashboard');
        else if (user.role === 'volunteer') navigate('/volunteer/dashboard');
        else navigate('/donor/dashboard');
      }
    } catch (err) {
      // toast shown in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo@1234');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-surface-900 tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs text-surface-500 mt-1">
          Sign in to manage your surplus donations and coordination
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-input pl-10 text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input pl-10 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2 shadow-md mt-2"
        >
          <span>{isSubmitting ? 'Signing in...' : 'Sign in to Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Demo Credentials Quick-Select */}
      <div className="pt-4 border-t border-surface-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-primary-600" /> Demo Accounts (Click to Autofill)
          </span>
          <span className="text-[10px] text-surface-400">Pass: Demo@1234</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillDemo('ravi@foodbridge.demo')}
            className="p-2 text-left rounded-xl border border-surface-200 hover:border-primary-500 hover:bg-primary-50/50 transition-all"
          >
            <p className="font-semibold text-surface-900 leading-tight">Ravi's Kitchen</p>
            <p className="text-[10px] text-surface-500">Org Donor</p>
          </button>

          <button
            type="button"
            onClick={() => fillDemo('meena@foodbridge.demo')}
            className="p-2 text-left rounded-xl border border-surface-200 hover:border-primary-500 hover:bg-primary-50/50 transition-all"
          >
            <p className="font-semibold text-surface-900 leading-tight">Meena's NGO</p>
            <p className="text-[10px] text-surface-500">Approved NGO</p>
          </button>

          <button
            type="button"
            onClick={() => fillDemo('divya@foodbridge.demo')}
            className="p-2 text-left rounded-xl border border-surface-200 hover:border-primary-500 hover:bg-primary-50/50 transition-all"
          >
            <p className="font-semibold text-surface-900 leading-tight">Divya</p>
            <p className="text-[10px] text-surface-500">Volunteer</p>
          </button>

          <button
            type="button"
            onClick={() => fillDemo('admin@foodbridge.demo')}
            className="p-2 text-left rounded-xl border border-surface-200 hover:border-primary-500 hover:bg-primary-50/50 transition-all"
          >
            <p className="font-semibold text-surface-900 leading-tight">System Admin</p>
            <p className="text-[10px] text-surface-500">Platform Admin</p>
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-surface-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
