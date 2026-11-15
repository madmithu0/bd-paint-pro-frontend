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
