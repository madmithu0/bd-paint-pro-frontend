import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import useKill from '../hooks/useKill';

const ROLES = [
  { id: 'Customer', label: 'Customer' },
  { id: 'Mistri', label: 'Mistri (Painter)' },
  { id: 'Agent', label: 'Agent' },
  { id: 'Merchant', label: 'Paint Merchant' },
];

const getPasswordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/~`]/.test(pwd)) score += 1;
  return score;
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { newMistriSignupEnabled, maxMistriPerUpazila } = useKill();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Customer',
    district: '',
    upazila: '',
    referralCode: searchParams.get('ref') || '',
    termsAccepted: false,
    merchantCommissionAgreed: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (formData.role === 'Mistri' && !newMistriSignupEnabled) {
      setErrorMsg('New Mistri registration is temporarily paused. Please try again later.');
    } else {
      setErrorMsg('');
    }
  }, [formData.role, newMistriSignupEnabled]);

  const strengthScore = getPasswordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = [
    'bg-gray-300',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-600',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.role === 'Mistri' && !newMistriSignupEnabled) {
      setErrorMsg('New Mistri registration is temporarily paused by administrator.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (strengthScore < 4) {
      setErrorMsg('Please use a stronger password (8+ chars, uppercase, lowercase, number & symbol).');
      return;
    }

    if (!formData.termsAccepted) {
      setErrorMsg('You must accept the Role-Specific Terms & Conditions.');
      return;
    }

    if (formData.role === 'Merchant' && !formData.merchantCommissionAgreed) {
      setErrorMsg('Merchants must agree to the platform commission terms before activation.');
      return;
    }

    if (formData.role === 'Mistri' && maxMistriPerUpazila > 0 && (!formData.district || !formData.upazila)) {
      setErrorMsg('District and Upazila are required for Mistri registration.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        password: formData.password,
        role: formData.role,
        district: formData.district.trim(),
        upazila: formData.upazila.trim(),
        referralCode: formData.referralCode.trim(),
        termsAccepted: formData.termsAccepted,
        merchantCommissionAgreed: formData.merchantCommissionAgreed,
      };

      const { data } = await api.post('/auth/signup', payload);
      if (data?.success) {
        if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isMistriBlocked = formData.role === 'Mistri' && !newMistriSignupEnabled;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-800 text-center">Create Account</h2>
        <p className="text-sm text-slate-500 text-center mt-1">Select your role to get started</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          {ROLES.map((r) => {
            const isPausedBadge = r.id === 'Mistri' && !newMistriSignupEnabled;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: r.id }))}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border transition relative ${
                  formData.role === r.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {r.label}
                {isPausedBadge && (
                  <span className="block text-[10px] font-normal text-amber-300">Paused</span>
                )}
              </button>
            );
          })}
        </div>
        {isMistriBlocked && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs font-medium">
            New Mistri registration is currently paused because our active Mistri roster is full.
            Existing Mistris can continue logging in normally.
          </div>
        )}

        {formData.role === 'Mistri' && newMistriSignupEnabled && maxMistriPerUpazila > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs">
            Upazila Quota Active: Maximum {maxMistriPerUpazila} Mistris allowed per Upazila.
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange}
              placeholder="Enter full name" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                placeholder="01XXXXXXXXX" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Optional)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@gmail.com" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District {formData.role === 'Mistri' && maxMistriPerUpazila > 0 ? '*' : ''}
              </label>
              <input type="text" name="district" value={formData.district} onChange={handleChange}
                required={formData.role === 'Mistri' && maxMistriPerUpazila > 0}
                placeholder="e.g. Jhalokati" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upazila {formData.role === 'Mistri' && maxMistriPerUpazila > 0 ? '*' : ''}
              </label>
              <input type="text" name="upazila" value={formData.upazila} onChange={handleChange}
                required={formData.role === 'Mistri' && maxMistriPerUpazila > 0}
                placeholder="e.g. Kathalia" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" required
                value={formData.password} onChange={handleChange} placeholder="Strong password"
                className="w-full px-3 py-2 border rounded-lg text-sm pr-14" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-xs text-indigo-600 font-semibold">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {formData.password && (
              <div className="mt-1.5">
                <div className="h-1.5 w-full bg-gray-200 rounded overflow-hidden">
                  <div className={`h-full transition-all ${strengthColors[strengthScore]}`}
                    style={{ width: `${(strengthScore / 5) * 100}%` }} />
                </div>
                <span className="text-[11px] text-slate-500">Strength: {strengthLabels[strengthScore]}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
            <input type="password" name="confirmPassword" required value={formData.confirmPassword}
              onChange={handleChange} placeholder="Re-enter password" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Agent Referral Code (Optional)</label>
            <input type="text" name="referralCode" value={formData.referralCode} onChange={handleChange}
              placeholder="Enter referral code" className="w-full px-3 py-2 border rounded-lg text-sm uppercase" />
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted}
                onChange={handleChange} className="mt-0.5" required />
              <span>
                I accept the <Link to="/legal" className="text-indigo-600 underline">Role-Specific Terms & Conditions</Link>
                {formData.role === 'Mistri' && ' (including anti-poaching & anti-theft legal liability clauses)'}.
              </span>
            </label>

            {formData.role === 'Merchant' && (
              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input type="checkbox" name="merchantCommissionAgreed"
                  checked={formData.merchantCommissionAgreed} onChange={handleChange} className="mt-0.5" required />
                <span>I agree to the platform Merchant Commission Agreement (3%–5% + dealer margin).</span>
              </label>
            )}
          </div>

          <button type="submit" disabled={loading || isMistriBlocked}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold text-sm transition">
            {loading ? 'Creating Account...' : isMistriBlocked ? 'Mistri Signup Paused' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-600 mt-5">
          Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
