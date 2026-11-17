import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import useToast from '../../hooks/useToast';

const SuperVerify = ({ onVerifySuccess }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // 4-Layer Verification Status States (All 4 must be true to unlock)
  const [layers, setLayers] = useState({
    phoneOtp: false,
    gmailOtp: false,
    liveVoice: false,
    liveFace3D: false,
  });

  // OTP Input & Loading States
  const [phoneCode, setPhoneCode] = useState('');
  const [gmailCode, setGmailCode] = useState('');
  const [loading, setLoading] = useState({
    phoneSend: false,
    phoneVerify: false,
    gmailSend: false,
    gmailVerify: false,
    voice: false,
    face: false,
    finalUnlock: false,
  });

  // Offline Hardware Recovery Key Fallback State
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');

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

  // Cleanup active camera/mic streams on component unmount
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

  // ================= LAYER 1: PHONE OTP =================
  const handleSendPhoneOtp = async () => {
    setLoading((prev) => ({ ...prev, phoneSend: true }));
    try {
      const res = await api.post('/x9-super-2026/send-phone-otp');
      if (res.data?.success) {
        showToast('Phone OTP dispatched via SMS gateway', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send Phone OTP', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, phoneSend: false }));
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!phoneCode || phoneCode.length < 4) {
      return showToast('Enter valid Phone OTP', 'warning');
    }
    setLoading((prev) => ({ ...prev, phoneVerify: true }));
    try {
      const res = await api.post('/x9-super-2026/verify-phone-otp', { otp: phoneCode });
      if (res.data?.verified) {
        setLayers((prev) => ({ ...prev, phoneOtp: true }));
        showToast('Layer 1: Phone OTP Verified', 'success');
      }
    } catch (err) {
      setLayers((prev) => ({ ...prev, phoneOtp: false }));
      showToast(err.response?.data?.message || 'Invalid Phone OTP', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, phoneVerify: false }));
    }
  };

  // ================= LAYER 2: GMAIL OTP =================
  const handleSendGmailOtp = async () => {
    setLoading((prev) => ({ ...prev, gmailSend: true }));
    try {
      const res = await api.post('/x9-super-2026/send-gmail-otp');
      if (res.data?.success) {
        showToast('Gmail OTP dispatched to Super Admin email', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send Gmail OTP', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, gmailSend: false }));
    }
  };

  const handleVerifyGmailOtp = async (e) => {
    e.preventDefault();
    if (!gmailCode || gmailCode.length < 4) {
      return showToast('Enter valid Gmail OTP', 'warning');
    }
    setLoading((prev) => ({ ...prev, gmailVerify: true }));
    try {
      const res = await api.post('/x9-super-2026/verify-gmail-otp', { otp: gmailCode });
      if (res.data?.verified) {
        setLayers((prev) => ({ ...prev, gmailOtp: true }));
        showToast('Layer 2: Gmail OTP Verified', 'success');
      }
    } catch (err) {
      setLayers((prev) => ({ ...prev, gmailOtp: false }));
      showToast(err.response?.data?.message || 'Invalid Gmail OTP', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, gmailVerify: false }));
    }
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
        await uploadVoiceBiometric(audioBlob);
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

  const uploadVoiceBiometric = async (audioBlob) => {
    setLoading((prev) => ({ ...prev, voice: true }));
    try {
      const formData = new FormData();
      formData.append('voiceSample', audioBlob, 'live_voice.webm');

      const res = await api.post('/x9-super-2026/verify-voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.verified && res.data?.score >= 0.9) {
        setLayers((prev) => ({ ...prev, liveVoice: true }));
        showToast(`Layer 3: Live Voice Verified (Score: ${res.data.score})`, 'success');
      } else {
        throw new Error('Voice liveness or threshold (0.90) failed');
      }
    } catch (err) {
      setLayers((prev) => ({ ...prev, liveVoice: false }));
      showToast(err.response?.data?.message || err.message || 'Voice verification failed', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, voice: false }));
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
        await uploadFace3DBiometric(videoBlob);
      };

      setIsRecordingFace(true);
      recorder.start();

      // Guided 3D head movement prompts (Left, Right, Up, Down, Blink)
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

  const uploadFace3DBiometric = async (videoBlob) => {
    setLoading((prev) => ({ ...prev, face: true }));
    try {
      const formData = new FormData();
      formData.append('faceVideo', videoBlob, 'live_face_3d.webm');

      const res = await api.post('/x9-super-2026/verify-face-3d', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.verified && res.data?.livenessScore >= 0.9) {
        setLayers((prev) => ({ ...prev, liveFace3D: true }));
        showToast(`Layer 4: Live 3D Face Verified (Score: ${res.data.livenessScore})`, 'success');
      } else {
        throw new Error('3D Face liveness or threshold (0.90) failed');
      }
    } catch (err) {
      setLayers((prev) => ({ ...prev, liveFace3D: false }));
      showToast(err.response?.data?.message || err.message || '3D Face verification failed', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, face: false }));
    }
  };

  // ================= FINAL 4-LAYER UNLOCK & HARDWARE FALLBACK =================
  const handleFinalUnlock = async () => {
    if (!allLayersGreen) return;
    setLoading((prev) => ({ ...prev, finalUnlock: true }));
    try {
      const res = await api.post('/x9-super-2026/complete-4layer-session');
      if (res.data?.token) {
        localStorage.setItem('super_admin_4layer_token', res.data.token);
        showToast('All 4 Layers Green. Control Room Unlocked.', 'success');
        if (onVerifySuccess) onVerifySuccess(res.data.token);
        navigate('/x9-super-2026/dashboard');
      }
    } catch (err) {
  // Reusable Status Badge / Green Checkmark Component
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
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                STEALTH ROUTE: /x9-super-2026
              </span>
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded">
                v3.0.0 SELF-HEALING LOCK
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
          
          {/* LAYER 1: PHONE OTP */}
          <div className={`p-5 rounded-xl border transition-all ${layers.phoneOtp ? 'bg-emerald-950/15 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">Layer 1: Phone OTP</h2>
              {renderStatusBadge(layers.phoneOtp)}
            </div>
            <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  disabled={layers.phoneOtp}
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit SMS OTP"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSendPhoneOtp}
                  disabled={loading.phoneSend || layers.phoneOtp}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold rounded-lg whitespace-nowrap transition"
                >
                  {loading.phoneSend ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading.phoneVerify || layers.phoneOtp || !phoneCode}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-bold uppercase tracking-wider rounded-lg transition"
              >
                {layers.phoneOtp ? 'Phone OTP Confirmed' : loading.phoneVerify ? 'Verifying...' : 'Verify Phone OTP'}
              </button>
            </form>
          </div>

          {/* LAYER 2: GMAIL OTP */}
          <div className={`p-5 rounded-xl border transition-all ${layers.gmailOtp ? 'bg-emerald-950/15 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">Layer 2: Gmail OTP</h2>
              {renderStatusBadge(layers.gmailOtp)}
            </div>
            <form onSubmit={handleVerifyGmailOtp} className="space-y-3">
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
                  onClick={handleSendGmailOtp}
                  disabled={loading.gmailSend || layers.gmailOtp}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold rounded-lg whitespace-nowrap transition"
                >
                  {loading.gmailSend ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading.gmailVerify || layers.gmailOtp || !gmailCode}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-bold uppercase tracking-wider rounded-lg transition"
              >
                {layers.gmailOtp ? 'Gmail OTP Confirmed' : loading.gmailVerify ? 'Verifying...' : 'Verify Gmail OTP'}
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
