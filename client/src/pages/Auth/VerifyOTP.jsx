import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';

export default function VerifyOTP() {
  const { isAuthenticated, loginSuccess } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [phone, setPhone] = useState(location.state?.phone || '');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!/^01[3-9]\d{8}$/.test(phone.trim()) || !/^\d{6}$/.test(otp.trim())) {
      error('Enter a valid 11-digit phone number and 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', {
        phone: phone.trim(),
        otp: otp.trim(),
      });

      if (data?.token && data?.user) {
        loginSuccess(data.token, data.user);
        success('Account verified successfully.');
        navigate('/dashboard', { replace: true });
      } else {
        success('OTP verified. Please login.');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      error(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !/^01[3-9]\d{8}$/.test(phone.trim())) {
      error('Enter a valid phone number first.');
      return;
    }

    setResending(true);
    try {
      await api.post('/auth/resend-otp', { phone: phone.trim() });
      success('New OTP sent to your mobile.');
      setTimer(60);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
      <h1 className="text-2xl font-bold text-center mb-2">Verify Mobile OTP</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
        Enter the 6-digit verification code sent via SMS
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mobile Number</label>
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

        <div>
          <label className="block text-sm font-medium mb-1">6-Digit OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="••••••"
            maxLength={6}
            className="w-full px-3.5 py-2.5 text-center tracking-widest text-lg font-semibold rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
        >
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        {timer > 0 ? (
          <span className="text-gray-500 dark:text-slate-400">Resend OTP in {timer}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-blue-600 font-semibold hover:underline disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        )}
      </div>
    </div>
  );
}
