import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const SUPER_API = `${API_BASE}/x9-super-2026`;

export default function SuperAdminLogin({ onLoginSuccess, onVerifySuccess }) {
  const [step, setStep] = useState(1); // 1 = Password Verify, 2 = Phone + Gmail 2FA OTP
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [challengeToken, setChallengeToken] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [gmailOtp, setGmailOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);
  // Step 1: Verify Strong Password & Trigger Phone + Gmail 2FA OTPs
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!identifier.trim() || !password) {
      setErrorMsg('Super Admin ID/Email এবং পাসওয়ার্ড দিন।');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${SUPER_API}/login-password`, {
        identifier: identifier.trim(),
        password,
      });

      if (data?.challengeToken) {
        setChallengeToken(data.challengeToken);
        setStep(2);
        setResendTimer(60);
        setInfoMsg('আপনার অনুমোদিত Phone এবং Gmail-এ 2FA OTP পাঠানো হয়েছে।');
      } else if (data?.token) {
        const finalToken = data.token;
        if (onLoginSuccess) onLoginSuccess(finalToken);
        if (onVerifySuccess) onVerifySuccess(finalToken);
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          'পাসওয়ার্ড ভুল অথবা IP অনুমোদিত নয়।'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Phone OTP + Gmail OTP (v3.8.0 Biometrics Removed)
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (phoneOtp.trim().length !== 6 || gmailOtp.trim().length !== 6) {
      setErrorMsg('Phone এবং Gmail উভয় জায়গার ৬-ডিজিটের OTP সঠিকভাবে দিন।');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${SUPER_API}/verify-2fa`, {
        challengeToken,
        phoneOtp: phoneOtp.trim(),
        gmailOtp: gmailOtp.trim(),
      });

      const finalToken = data?.token || data?.superToken;
      if (finalToken) {
        if (onLoginSuccess) onLoginSuccess(finalToken);
        if (onVerifySuccess) onVerifySuccess(finalToken);
      } else {
        setErrorMsg('2FA সেশন টোকেন পাওয়া যায়নি। আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          'OTP ভুল হয়েছে অথবা মেয়াদ শেষ হয়ে গেছে।'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || !challengeToken) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await axios.post(`${SUPER_API}/resend-2fa`, { challengeToken });
      setResendTimer(60);
      setInfoMsg('নতুন Phone ও Gmail OTP পাঠানো হয়েছে।');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'OTP পুনরায় পাঠানো যায়নি।');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full mb-2">
            v3.8.0 Enterprise Security • Password + 2FA
          </span>
          <h1 className="text-xl font-bold text-white">Super Admin Control Gate</h1>
          <p className="text-xs text-slate-400 mt-1">
            {step === 1
              ? 'ধাপ ১: আপনার মাস্টার আইডি এবং পাসওয়ার্ড দিন'
              : 'ধাপ ২: Phone এবং Gmail-এ পাঠানো 2FA OTP যাচাই করুন'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            {infoMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Super Admin ID / Gmail
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@gmail.com বা SUPER_ADMIN_ID"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 pr-16"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition"
            >
              {loading ? 'যাচাই করা হচ্ছে...' : 'পাসওয়ার্ড যাচাই ও OTP পাঠান'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone 2FA OTP (৬ ডিজিট)
              </label>
              <input
                type="text"
                maxLength={6}
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-center tracking-[0.5em] font-mono text-base text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Gmail 2FA OTP (৬ ডিজিট)
              </label>
              <input
                type="text"
                maxLength={6}
                value={gmailOtp}
                onChange={(e) => setGmailOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-center tracking-[0.5em] font-mono text-base text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition"
            >
              {loading ? 'প্রবেশ অনুমোদন হচ্ছে...' : 'Super Admin প্যানেলে প্রবেশ করুন'}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setPhoneOtp('');
                  setGmailOtp('');
                }}
                className="text-slate-400 hover:text-white"
              >
                ← পেছনে যান
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || loading}
                className="text-emerald-400 hover:text-emerald-300 disabled:text-slate-500"
              >
                {resendTimer > 0 ? `পুনরায় পাঠান (${resendTimer}s)` : 'OTP পুনরায় পাঠান'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
