import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import useToast from '../../hooks/useToast';
import api from '../../api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp =
  firebaseConfig.apiKey && !getApps().length
    ? initializeApp(firebaseConfig)
    : getApps()[0] || null;
const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

export default function ForgotPassword() {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const target = identifier.trim();
    const emailCheck = target.includes('@');

    if (!emailCheck && !/^01[3-9]\d{8}$/.test(target)) {
      error('Enter a valid 11-digit mobile number or Gmail address.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { identifier: target });

      if (emailCheck) {
        setIsEmailMode(true);
        setStep(2);
        success('Free password reset OTP sent to your Gmail!');
      } else if (data?.useFirebase) {
        if (!firebaseAuth) {
          error('Firebase config missing. Try using your registered Gmail instead.');
          setLoading(false);
          return;
        }
        if (!window.recaptchaVerifierReset) {
          window.recaptchaVerifierReset = new RecaptchaVerifier(
            firebaseAuth,
            'recaptcha-reset-container',
            { size: 'invisible' }
          );
        }
        const formattedPhone = data.formattedPhone || `+88${target}`;
        const confirmation = await signInWithPhoneNumber(
          firebaseAuth,
          formattedPhone,
          window.recaptchaVerifierReset
        );
        setConfirmationResult(confirmation);
        setIsEmailMode(false);
        setStep(2);
        success(`Free SMS OTP sent to ${formattedPhone} via Firebase!`);
      }
    } catch (err) {
      if (window.recaptchaVerifierReset) {
        window.recaptchaVerifierReset.clear();
        window.recaptchaVerifierReset = null;
      }
      error(err.response?.data?.message || err.message || 'Unable to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp.trim()) || newPassword.length < 6) {
      error('Enter a valid 6-digit OTP and a password of at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      let payload = { newPassword };

      if (isEmailMode) {
        payload.email = identifier.trim().toLowerCase();
        payload.code = otp.trim();
      } else {
        if (!confirmationResult) {
          error('OTP session expired. Please request again.');
          setLoading(false);
          return;
        }
        const userCred = await confirmationResult.confirm(otp.trim());
        const firebaseIdToken = await userCred.user.getIdToken();
        payload.phone = identifier.trim();
        payload.firebaseIdToken = firebaseIdToken;
      }

      await api.post('/auth/reset-password', payload);
      success('Password reset successful! Please login.');
      navigate('/login', { replace: true });
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto my-10 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
      <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
        {step === 1
          ? 'Enter your registered Mobile Number or Gmail for a free reset OTP'
          : `Enter the 6-digit OTP sent to your ${isEmailMode ? 'Gmail' : 'Mobile'} and set a new password`}
      </p>

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Registered Mobile or Gmail</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="01XXXXXXXXX or example@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
          >
            {loading ? 'Sending Free OTP...' : 'Send Free Reset OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">6-Digit Verification OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              maxLength={6}
              className="w-full px-3.5 py-2.5 text-center tracking-widest font-semibold rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
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

      <div id="recaptcha-reset-container"></div>

      <div className="text-center mt-6">
        <Link to="/login" className="text-sm text-blue-600 hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
