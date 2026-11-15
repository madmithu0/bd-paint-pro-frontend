import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useToast from '../../hooks/useToast';
import api from '../../api';

export default function ForgotPassword() {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) {
      error('Enter a valid 11-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { phone: phone.trim() });
      success('Password reset OTP sent to your mobile.');
      setStep(2);
    } catch (err) {
      error(err.response?.data?.message || 'Unable to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim() || newPassword.length < 6) {
      error('Enter valid OTP and a password of at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        phone: phone.trim(),
        otp: otp.trim(),
        newPassword,
      });
      success('Password reset successful. Please login.');
      navigate('/login', { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
      <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
        {step === 1
          ? 'Enter your registered phone number to receive an OTP'
          : 'Enter the OTP sent to your phone and set a new password'}
      </p>

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Registered Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              maxLength={11}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
          >
            {loading ? 'Sending OTP...' : 'Send Reset OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Verification OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              maxLength={6}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
          >
            {loading ? 'Updating Password...' : 'Confirm Password Reset'}
          </button>
        </form>
      )}

      <div className="text-center mt-6">
        <Link to="/login" className="text-sm text-blue-600 hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
