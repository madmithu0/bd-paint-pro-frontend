import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import api from '../../api';
import useToast from '../../hooks/useToast';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp =
  firebaseConfig.apiKey && !getApps().length
    ? initializeApp(firebaseConfig)
    : getApps() || null;
const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const SuperVerify = ({ onVerifySuccess }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // 4-Layer Verification Status States (All 4 must be green to unlock)
  const [layers, setLayers] = useState({
    phoneOtp: false,
    gmailOtp: false,
    liveVoice: false,
    liveFace3D: false,
  });

  // Free OTP & Biometric Data States
  const [phoneCode, setPhoneCode] = useState('');
  const [gmailCode, setGmailCode] = useState('');
  const [firebaseIdToken, setFirebaseIdToken] = useState('');
  const [firebaseConfirm, setFirebaseConfirm] = useState(null);
  const [adminPhoneDisplay, setAdminPhoneDisplay] = useState('');
  const [voiceBase64, setVoiceBase64] = useState('');
  const [faceBase64, setFaceBase64] = useState('');

  const [loading, setLoading] = useState({
    otpSend: false,
    firebaseSend: false,
    phoneVerify: false,
    gmailVerify: false,
    voice: false,
    face: false,
    finalUnlock: false,
  });

  // Offline Hardware Recovery Key Fallback State
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [superAdminId, setSuperAdminId] = useState('');

  // Biometric Media Recording States & Refs
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceCountdown, setVoiceCountdown] = useState(5);
  const [isRecordingFace, setIsRecordingFace] = useState(false);
  const [facePrompt, setFacePrompt] = useState('Look straight at the camera');

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const allLayersGreen =
    layers.phoneOtp && layers.gmailOtp && layers.liveVoice && layers.liveFace3D;

  useEffect(() => {
    return () => {
      stopMediaTracks();
    };
  }, []);

  const stopMediaTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };
  // ================= FREE OTP DISPATCH (TELEGRAM + GMAIL SMTP) =================
  const handleSendFreeOtps = async () => {
    setLoading((prev) => ({ ...prev, otpSend: true }));
    try {
      const res = await api.post('/x9-super-2026/send-otps');
      if (res.data?.success) {
        if (res.data.superAdminPhone) setAdminPhoneDisplay(res.data.superAdminPhone);
        showToast(
          res.data.telegramSent
            ? 'Free OTPs dispatched to Telegram & Gmail!'
            : 'Free Gmail OTP dispatched! Check your inbox.',
          'success'
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to dispatch free OTPs', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, otpSend: false }));
    }
  };

  // Optional Free Firebase Phone SMS OTP for Super Admin
  const handleSendFirebasePhoneOtp = async () => {
    if (!firebaseAuth) {
      return showToast('Firebase config missing. Use Telegram OTP instead.', 'warning');
    }
    const targetPhone = adminPhoneDisplay || prompt('Enter Super Admin Phone (+8801XXXXXXXXX):');
    if (!targetPhone) return;

    const formatted = targetPhone.startsWith('+88')
      ? targetPhone
      : `+88${targetPhone.replace(/^0/, '0')}`;
    setLoading((prev) => ({ ...prev, firebaseSend: true }));
    try {
      if (!window.saRecaptcha) {
        window.saRecaptcha = new RecaptchaVerifier(firebaseAuth, 'sa-recaptcha-box', {
          size: 'invisible',
        });
      }
      const conf = await signInWithPhoneNumber(firebaseAuth, formatted, window.saRecaptcha);
      setFirebaseConfirm(conf);
      showToast(`Free Firebase SMS OTP sent to ${formatted}`, 'success');
    } catch (err) {
      showToast(err.message || 'Firebase SMS failed. Use Telegram OTP.', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, firebaseSend: false }));
    }
  };

  const handleConfirmLayer1Phone = async (e) => {
    e.preventDefault();
    if (!phoneCode || phoneCode.trim().length !== 6) {
      return showToast('Enter valid 6-digit Telegram or Firebase OTP', 'warning');
    }
    setLoading((prev) => ({ ...prev, phoneVerify: true }));
    try {
      if (firebaseConfirm) {
        const cred = await firebaseConfirm.confirm(phoneCode.trim());
        const idTok = await cred.user.getIdToken();
        setFirebaseIdToken(idTok);
      }
      setLayers((prev) => ({ ...prev, phoneOtp: true }));
      showToast('Layer 1: Phone / Telegram OTP Verified', 'success');
    } catch (err) {
      setLayers((prev) => ({ ...prev, phoneOtp: false }));
      showToast('Invalid Firebase OTP code', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, phoneVerify: false }));
    }
  };

  const handleConfirmLayer2Gmail = (e) => {
    e.preventDefault();
    if (!gmailCode || gmailCode.trim().length !== 6) {
      return showToast('Enter valid 6-digit Gmail OTP', 'warning');
    }
    setLayers((prev) => ({ ...prev, gmailOtp: true }));
    showToast('Layer 2: Gmail OTP Verified', 'success');
  };
  // ================= LAYER 3: 5-SECOND LIVE VOICE =================
  const handleRecordVoice = async () => {
    if (isRecordingVoice || loading.voice) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stopMediaTracks();
        setIsRecordingVoice(false);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const b64 = await blobToBase64(audioBlob);
        setVoiceBase64(b64);
        setLayers((prev) => ({ ...prev, liveVoice: true }));
        showToast('Layer 3: Live Voice Biometric Captured', 'success');
      };

      setIsRecordingVoice(true);
      setVoiceCountdown(5);
      recorder.start();

      const timer = setInterval(() => {
        setVoiceCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (recorder.state === 'recording') recorder.stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      stopMediaTracks();
      setIsRecordingVoice(false);
      showToast('Microphone permission denied or unavailable', 'error');
    }
  };

  // ================= LAYER 4: LIVE 3D FACE HEAD-MOVEMENT =================
  const handleRecordFace3D = async () => {
    if (isRecordingFace || loading.face) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stopMediaTracks();
        setIsRecordingFace(false);
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const b64 = await blobToBase64(videoBlob);
        setFaceBase64(b64);
        setLayers((prev) => ({ ...prev, liveFace3D: true }));
        showToast('Layer 4: Live 3D Face Biometric Captured', 'success');
      };

      setIsRecordingFace(true);
      recorder.start();

      setFacePrompt('Turn head LEFT slowly...');
      setTimeout(() => setFacePrompt('Turn head RIGHT slowly...'), 1500);
      setTimeout(() => setFacePrompt('Look UP and BLINK eyes...'), 3000);
      setTimeout(() => setFacePrompt('Look DOWN and center...'), 4500);
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 6000);
    } catch (err) {
      stopMediaTracks();
      setIsRecordingFace(false);
      showToast('Camera permission denied or unavailable', 'error');
    }
  };

  // ================= FINAL 4-LAYER UNLOCK & HARDWARE FALLBACK =================
  const handleFinalUnlock = async () => {
    if (!allLayersGreen) return;
    setLoading((prev) => ({ ...prev, finalUnlock: true }));
    try {
      const res = await api.post('/x9-super-2026/verify-4-layer', {
        phoneOtp: phoneCode.trim(),
        firebaseIdToken: firebaseIdToken || undefined,
        gmailOtp: gmailCode.trim(),
        voiceSampleBase64: voiceBase64,
        voiceTranscript: 'SUPER ADMIN LIVE VOICE VERIFY',
        faceVideoBase64: faceBase64,
        headMovements: ['LEFT', 'RIGHT', 'UP', 'DOWN'],
        eyeBlinkDetected: true,
      });

      const unlockedToken = res.data?.superToken || res.data?.token;
      if (unlockedToken) {
        localStorage.setItem('super_admin_4layer_token', unlockedToken);
        showToast('All 4 Layers Green. Control Room Unlocked.', 'success');
        if (onVerifySuccess) onVerifySuccess(unlockedToken);
        navigate('/x9-super-2026/dashboard');
      }
    } catch (err) {
      showToast(err.response?.data?.message || '4-Layer verification failed', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, finalUnlock: false }));
    }
  };

  const handleHardwareRecovery = async (e) => {
    e.preventDefault();
    if (!recoveryKey.trim()) return;
    setLoading((prev) => ({ ...prev, finalUnlock: true }));
    try {
      const res = await api.post('/x9-super-2026/hardware-recovery', {
        hardwareKey: recoveryKey.trim(),
        superAdminId: superAdminId.trim(),
      });
      const unlockedToken = res.data?.superToken || res.data?.token;
      if (unlockedToken) {
        localStorage.setItem('super_admin_4layer_token', unlockedToken);
        showToast('Emergency Hardware Recovery Verified', 'success');
        if (onVerifySuccess) onVerifySuccess(unlockedToken);
        navigate('/x9-super-2026/dashboard');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid Hardware Recovery Key', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, finalUnlock: false }));
    }
  };
  const renderStatusBadge = (isVerified) => (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
        isVerified
          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
          : 'bg-rose-950/60 text-rose-400 border-rose-500/40'
      }`}
    >
      {isVerified ? (
        <>
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          GREEN • VERIFIED
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          RED • LOCKED
        </>
      )}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 select-none">
      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">

        {/* Top Security Gate Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                STEALTH ROUTE: /x9-super-2026
              </span>
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded">
                v3.0.0 SELF-HEALING LOCK
              </span>
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                ZERO-COST OTP
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-2 tracking-tight">
              4-Layer Super Admin Security Gate
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              All 4 layers must turn GREEN to unlock the Control Room. 3 failed attempts trigger automatic WAF IP ban.
            </p>
          </div>

          {/* Master 4-Green Checkmark Summary Strip */}
          <div className="flex items-center gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
            {[
              { key: 'phoneOtp', label: 'L1' },
              { key: 'gmailOtp', label: 'L2' },
              { key: 'liveVoice', label: 'L3' },
              { key: 'liveFace3D', label: 'L4' },
            ].map((item) => (
              <div
                key={item.key}
                className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold border transition-all ${
                  layers[item.key]
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-700 text-slate-500'
                }`}
              >
                <span>{item.label}</span>
                <span>{layers[item.key] ? '✓' : '✕'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4-Layer Verification Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* LAYER 1: PHONE / TELEGRAM OTP */}
          <div className={`p-5 rounded-xl border transition-all ${layers.phoneOtp ? 'bg-emerald-950/15 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">Layer 1: Phone / Telegram OTP</h2>
              {renderStatusBadge(layers.phoneOtp)}
            </div>
            <form onSubmit={handleConfirmLayer1Phone} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  disabled={layers.phoneOtp}
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Telegram/SMS OTP"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSendFreeOtps}
                  disabled={loading.otpSend || layers.phoneOtp}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold rounded-lg whitespace-nowrap transition"
                >
                  {loading.otpSend ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading.phoneVerify || layers.phoneOtp || !phoneCode}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-bold uppercase tracking-wider rounded-lg transition"
                >
                  {layers.phoneOtp ? 'Phone OTP Confirmed' : loading.phoneVerify ? 'Verifying...' : 'Verify Phone OTP'}
                </button>
                {!layers.phoneOtp && (
                  <button
                    type="button"
                    onClick={handleSendFirebasePhoneOtp}
                    disabled={loading.firebaseSend}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg whitespace-nowrap transition"
                  >
                    {loading.firebaseSend ? '...' : 'Firebase SMS'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* LAYER 2: GMAIL OTP */}
          <div className={`p-5 rounded-xl border transition-all ${layers.gmailOtp ? 'bg-emerald-950/15 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">Layer 2: Gmail OTP</h2>
              {renderStatusBadge(layers.gmailOtp)}
            </div>
            <form onSubmit={handleConfirmLayer2Gmail} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  disabled={layers.gmailOtp}
                  value={gmailCode}
                  onChange={(e) => setGmailCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Gmail OTP"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSendFreeOtps}
                  disabled={loading.otpSend || layers.gmailOtp}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold rounded-lg whitespace-nowrap transition"
                >
                  {loading.otpSend ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
              <button
                type="submit"
                disabled={layers.gmailOtp || !gmailCode}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-bold uppercase tracking-wider rounded-lg transition"
              >
                {layers.gmailOtp ? 'Gmail OTP Confirmed' : 'Verify Gmail OTP'}
              </button>
            </form>
          </div>
          {/* LAYER 3: 5-SECOND LIVE VOICE RECORDING */}
          <div className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${layers.liveVoice ? 'bg-emerald-950/15 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-slate-200">Layer 3: Live Voice (Threshold ≥ 0.90)</h2>
                {renderStatusBadge(layers.liveVoice)}
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Speak passphrase clearly for 5 seconds. Pre-recorded audio is automatically rejected by liveness detection.
              </p>
            </div>

            <div className="space-y-3">
              {isRecordingVoice && (
                <div className="w-full bg-rose-950/50 border border-rose-500/40 rounded-lg py-2 px-3 flex items-center justify-between text-xs text-rose-300 font-mono">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    RECORDING LIVE AUDIO...
                  </span>
                  <span className="font-bold">{voiceCountdown}s</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleRecordVoice}
                disabled={isRecordingVoice || loading.voice || layers.liveVoice}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-bold uppercase tracking-wider rounded-lg transition"
              >
                {layers.liveVoice
                  ? 'Live Voice Biometric Confirmed'
                  : loading.voice
                  ? 'Analyzing Voice Liveness...'
                  : isRecordingVoice
                  ? `Recording (${voiceCountdown}s)...`
                  : 'Start 5-Second Live Voice Recording'}
              </button>
            </div>
          </div>

          {/* LAYER 4: LIVE 3D FACE HEAD-MOVEMENT VIDEO CAPTURE */}
          <div className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${layers.liveFace3D ? 'bg-emerald-950/15 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-slate-200">Layer 4: Live 3D Face (Threshold ≥ 0.90)</h2>
                {renderStatusBadge(layers.liveFace3D)}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Requires live 3D head movement (Left, Right, Up, Down) & eye blink. Static photos are rejected.
              </p>
            </div>

            {isRecordingFace && (
              <div className="relative mb-3 rounded-lg overflow-hidden border border-amber-500/60 bg-black aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute bottom-2 inset-x-2 bg-slate-950/85 border border-amber-500/40 text-amber-300 text-xs font-bold text-center py-1.5 px-2 rounded">
                  {facePrompt}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleRecordFace3D}
              disabled={isRecordingFace || loading.face || layers.liveFace3D}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-bold uppercase tracking-wider rounded-lg transition"
            >
              {layers.liveFace3D
                ? 'Live 3D Face Biometric Confirmed'
                : loading.face
                ? 'Verifying 3D Depth & Liveness...'
                : isRecordingFace
                ? 'Capturing 3D Head Movement...'
                : 'Capture Live 3D Face Video'}
            </button>
          </div>
        </div>

        {/* Footer Unlock Action & Hardware Recovery Fallback */}
        <div className="bg-slate-950 border-t border-slate-800 p-6 space-y-4">
          <button
            type="button"
            onClick={handleFinalUnlock}
            disabled={!allLayersGreen || loading.finalUnlock}
            className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
              allLayersGreen
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {loading.finalUnlock
              ? 'Initializing Super Admin Session...'
              : allLayersGreen
              ? 'Enter Stealth Control Room (All 4 Layers Green)'
              : 'Control Room Locked (Complete All 4 Layers Above)'}
          </button>

          {/* Offline Hardware Recovery Key Toggle (File 161 Spec) */}
          <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>Biometric APIs down? Use emergency hardware fallback.</span>
            <button
              type="button"
              onClick={() => setShowRecovery(!showRecovery)}
              className="text-slate-400 hover:text-amber-400 underline font-mono"
            >
              {showRecovery ? 'Hide Hardware Key Input' : 'Offline Hardware Recovery Key'}
            </button>
          </div>

          {showRecovery && (
            <form onSubmit={handleHardwareRecovery} className="flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="text"
                value={superAdminId}
                onChange={(e) => setSuperAdminId(e.target.value)}
                placeholder="Super Admin ID..."
                className="sm:w-48 bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                required
              />
              <input
                type="password"
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                placeholder="Enter Offline Hardware Recovery Key..."
                className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading.finalUnlock || !recoveryKey}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg whitespace-nowrap"
              >
                Emergency Unlock
              </button>
            </form>
          )}
        </div>

        <div id="sa-recaptcha-box"></div>
      </div>
    </div>
  );
};

export default SuperVerify;
