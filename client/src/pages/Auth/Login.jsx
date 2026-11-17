import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';

const ALLOWED_ROLES = ['Customer', 'Mistri', 'Agent', 'Merchant'];

export default function Login() {
  const { isAuthenticated, loginSuccess } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (!cleanId || !password) {
      error('Please enter your phone/email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        identifier: cleanId,
        password,
      });

      if (!data?.token || !data?.user || !ALLOWED_ROLES.includes(data.user.role)) {
        error('Unauthorized account role or invalid credentials.');
        setLoading(false);
        return;
      }

      if (data.user.verifyStatus === false) {
        success('OTP verification required.');
        navigate('/verify-otp', { state: { phone: data.user.phone } });
        return;
      }

      const saved = loginSuccess(data.token, data.user);
      if (saved) {
        success('Login successful.');
        navigate('/dashboard', { replace: true });
      } else {
        error('Session initialization failed.');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
      <h1 className="text-2xl font-bold text-center mb-2">Account Login</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
        Customer, Mistri, Agent & Merchant Portal
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number or Email</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="01XXXXXXXXX or email@domain.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">Password</label>
            <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-600 dark:text-slate-400 mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  );
}
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import useToast from '../../hooks/useToast';

const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      return showToast('Please enter your phone/email and password', 'warning');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        identifier: identifier.trim(),
        password,
      });

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        showToast('Login successful! Welcome back.', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid login credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">
        
        {/* Top Brand Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-center text-white">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm mb-3 shadow-inner">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">BD Paint Pro</h1>
          <p className="text-xs text-indigo-100 mt-1">
            Customer, Mistri, Agent & Merchant Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Phone Number or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="01XXXXXXXXX or email@example.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/30 transition transform active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? 'Signing In...' : 'Sign In to Account'}
          </button>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="font-bold text-indigo-600 hover:text-indigo-500 transition"
              >
                Create Account
              </Link>
            </p>
          </div>
        </form>

        {/* Clean Version Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
          <span>Verified 450 Sqft/Day Standard</span>
          <span className="font-mono font-semibold text-slate-600">v3.0.0 LOCK</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
