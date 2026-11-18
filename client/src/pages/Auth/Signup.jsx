import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';

const SIGNUP_ROLES = [
  { value: 'Customer', label: 'Customer (Hire Mistri)' },
  { value: 'Mistri', label: 'Mistri (Service Worker)' },
  { value: 'Agent', label: 'Agent (Field Coordinator)' },
  { value: 'Merchant', label: 'Merchant (Material Supplier)' },
];

export default function Signup() {
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Customer',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, phone, email, role, password, confirmPassword, acceptTerms } = formData;

    if (!SIGNUP_ROLES.some((r) => r.value === role)) {
      error('Invalid role selected.');
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(phone.trim())) {
      error('Enter a valid 11-digit Bangladeshi mobile number.');
      return;
    }

    if (password.length < 6) {
      error('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    if (!acceptTerms) {
      error('You must accept the Terms and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/signup', {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() ? email.trim().toLowerCase() : undefined,
        role,
        password,
      });

      success('Account created! Verify your Mobile or Gmail for free.');
      navigate('/verify-otp', {
        state: {
          phone: phone.trim(),
          email: email.trim() ? email.trim().toLowerCase() : '',
          purpose: 'SIGNUP',
        },
      });
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
      <h1 className="text-2xl font-bold text-center mb-2">Create New Account</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
        Select your account role to register
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mobile Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="01XXXXXXXXX"
            maxLength={11}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gmail Address (For Free Backup OTP)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@gmail.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Account Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {SIGNUP_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <span>
            I agree to the{' '}
            <Link to="/legal" className="text-blue-600 hover:underline">
              Terms & Privacy Policy
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
