import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';

// Initialize Firebase Client SDK using Vite Environment Variables (100% Free Spark Plan)
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

export default function VerifyOTP() {
  const { isAuthenticated, loginSuccess } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || '';
  const initialPhone = location.state?.phone || '';

  const [method, setMethod] = useState(initialEmail && !initialPhone ? 'GMAIL' : 'PHONE');
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const recaptchaContainerRef = useRef(null);

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

  // Send Free OTP via Firebase (Phone) or Nodemailer SMTP (Gmail)
  const handleSendFreeOtp = async () => {
    if (timer > 0) return;

    if (method === 'PHONE') {
      const cleanPhone = phone.trim();
      if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
        error('Enter a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX).');
        return;
      }
      if (!firebaseAuth) {
        error('Firebase configuration is missing. Switch to Gmail OTP or check .env.');
        return;
      }

      setSendingOtp(true);
      try {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
            size: 'invisible',
          });
        }
        const formattedPhone = `+88${cleanPhone}`;
        const confirmation = await signInWithPhoneNumber(
          firebaseAuth,
          formattedPhone,
          window.recaptchaVerifier
        );
        setConfirmationResult(confirmation);
        setTimer(60);
        success(`Free SMS OTP sent to ${formattedPhone} via Firebase!`);
      } catch (err) {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
        error(err.message || 'Failed to send free Firebase SMS OTP.');
      } finally {
        setSendingOtp(false);
      }
    } else {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        error('Enter a valid Gmail address.');
        return;
      }

      setSendingOtp(true);
      try {
        await api.post('/auth/send-otp', {
          email: cleanEmail,
          purpose: location.state?.purpose || 'LOGIN',
        });
        setTimer(60);
        success('Free 6-digit OTP sent to your Gmail!');
      } catch (err) {
        error(err.response?.data?.message || 'Failed to send free Gmail OTP.');
      } finally {
        setSendingOtp(false);
      }
    }
  };
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp.trim())) {
      error('Enter a valid 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      let payload = {};

      if (method === 'PHONE') {
        if (!confirmationResult) {
          error('Please click "Send Free OTP" first.');
          setLoading(false);
          return;
        }
        // Verify code on Firebase and get cryptographic ID Token (Zero server SMS cost)
        const userCredential = await confirmationResult.confirm(otp.trim());
        const firebaseIdToken = await userCredential.user.getIdToken();

        payload = {
          phone: phone.trim(),
          firebaseIdToken,
          purpose: location.state?.purpose || 'LOGIN',
        };
      } else {
        payload = {
          email: email.trim().toLowerCase(),
          code: otp.trim(),
          purpose: location.state?.purpose || 'LOGIN',
        };
      }

      const { data } = await api.post('/auth/verify-otp', payload);

      const authToken = data?.accessToken || data?.token;
      if (authToken && data?.user) {
        loginSuccess(authToken, data.user);
        success('Account verified successfully at zero cost!');
        navigate('/dashboard', { replace: true });
      } else {
        success('Verification successful! Please login.');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
      <h1 className="text-2xl font-bold text-center mb-2">Free Account Verification</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-5">
        Verify your Mobile Number or Gmail at zero cost
      </p>

      {/* Method Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg mb-5">
        <button
          type="button"
          onClick={() => {
            setMethod('PHONE');
            setOtp('');
          }}
          className={`py-2 text-sm font-semibold rounded-md transition ${
            method === 'PHONE'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-slate-300'
          }`}
        >
          Mobile OTP (Free)
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod('GMAIL');
            setOtp('');
          }}
          className={`py-2 text-sm font-semibold rounded-md transition ${
            method === 'GMAIL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-slate-300'
          }`}
        >
          Gmail OTP (Free)
        </button>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        {method === 'PHONE' ? (
          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <button
                type="button"
                onClick={handleSendFreeOtp}
                disabled={sendingOtp || timer > 0}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg whitespace-nowrap"
              >
                {sendingOtp ? 'Sending...' : timer > 0 ? `${timer}s` : 'Send OTP'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">Gmail Address</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <button
                type="button"
                onClick={handleSendFreeOtp}
                disabled={sendingOtp || timer > 0}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg whitespace-nowrap"
              >
                {sendingOtp ? 'Sending...' : timer > 0 ? `${timer}s` : 'Send OTP'}
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">6-Digit OTP Code</label>
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

      {/* Invisible Google Firebase Recaptcha Mount Point */}
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
    </div>
  );
}
