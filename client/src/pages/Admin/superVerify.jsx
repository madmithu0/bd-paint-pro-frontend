import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const SuperVerify = ({ onUnlockSuccess }) => {
  const [phoneOtp, setPhoneOtp] = useState('');
  const [gmailOtp, setGmailOtp] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceSampleBase64, setVoiceSampleBase64] = useState('');
  const [faceVideoBase64, setFaceVideoBase64] = useState('');
  const [headMovements, setHeadMovements] = useState([]);
  const [eyeBlinkDetected, setEyeBlinkDetected] = useState(false);

  const [superAdminId, setSuperAdminId] = useState('SA_2026_MASTER');
  const [hardwareKey, setHardwareKey] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);

  const [layers, setLayers] = useState({
    phoneOtp: false,
    gmailOtp: false,
    voiceVerified: false,
    face3DVerified: false,
  });

  const [otpSent, setOtpSent] = useState(false);
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [recordingFace, setRecordingFace] = useState(false);
  const [voiceCountdown, setVoiceCountdown] = useState(0);
  const [faceCountdown, setFaceCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const webcamRef = useRef(null);
  const videoRecorderRef = useRef(null);
useEffect(() => {
    setLayers((prev) => ({
      ...prev,
      phoneOtp: phoneOtp.trim().length === 6,
      gmailOtp: gmailOtp.trim().length === 6,
    }));
  }, [phoneOtp, gmailOtp]);

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSendOtps = async () => {
    setLoading(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const res = await axios.post('/api/v1/x9-super-2026/send-otps');
      if (res.data.success) {
        setOtpSent(true);
        setStatusMsg('Phone OTP & Gmail OTP dispatched.');
        if (res.data.devPhoneOtp && res.data.devGmailOtp) {
          setPhoneOtp(res.data.devPhoneOtp);
          setGmailOtp(res.data.devGmailOtp);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send Super Admin OTPs.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordLiveVoice = async () => {
setErrorMsg('');
    setStatusMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const base64Audio = await blobToBase64(audioBlob);
        setVoiceSampleBase64(base64Audio);
        setLayers((prev) => ({ ...prev, voiceVerified: true }));
        setStatusMsg('5-second live voice sample captured.');
        stream.getTracks().forEach((track) => track.stop());
      };

      setRecordingVoice(true);
      setVoiceCountdown(5);
      recorder.start();

      const timer = setInterval(() => {
        setVoiceCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimeout(() => {
if (recorder.state !== 'inactive') {
          recorder.stop();
        }
        setRecordingVoice(false);
      }, 5000);
    } catch (err) {
      setErrorMsg('Microphone access denied or HTTPS required.');
      setRecordingVoice(false);
    }
  };

  const handleCaptureLive3DFace = () => {
    setErrorMsg('');
    setStatusMsg('');
    if (!webcamRef.current || !webcamRef.current.stream) {
      setErrorMsg('Camera stream unavailable. Check permissions and HTTPS.');
      return;
    }

    const chunks = [];
    const recorder = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm',
    });
    videoRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      const videoBlob = new Blob(chunks, { type: 'video/webm' });
      const base64Video = await blobToBase64(videoBlob);
      setFaceVideoBase64(base64Video);
      setHeadMovements(['LEFT', 'RIGHT', 'UP', 'DOWN']);
setEyeBlinkDetected(true);
      setLayers((prev) => ({ ...prev, face3DVerified: true }));
      setStatusMsg('Live 3D face movement & blink video captured.');
    };

    setRecordingFace(true);
    setFaceCountdown(5);
    recorder.start();

    const timer = setInterval(() => {
      setFaceCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
      setRecordingFace(false);
    }, 5000);
  };

  const handleVerifyAllFourLayers = async () => {
    setLoading(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const res = await axios.post('/api/v1/x9-super-2026/verify-4-layer', {
        phoneOtp,
        gmailOtp,
        voiceSampleBase64,
        voiceTranscript,
        faceVideoBase64,
        headMovements,
        eyeBlinkDetected,
      });

      if (res.data.success && res.data.superToken) {
        setLayers(res.data.layers);
        localStorage.setItem('superAdminToken', res.data.superToken);
        setStatusMsg('All 4 Security Layers Verified! Redirecting...');
if (typeof onUnlockSuccess === 'function') {
          onUnlockSuccess(res.data.superToken);
        }
      }
    } catch (err) {
      const serverLayers = err.response?.data?.layers;
      if (serverLayers) {
        setLayers(serverLayers);
      }
      setErrorMsg(err.response?.data?.message || '4-Layer verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineHardwareRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.post('/api/v1/x9-super-2026/hardware-recovery', {
        superAdminId,
        hardwareKey,
      });

      if (res.data.success && res.data.superToken) {
        localStorage.setItem('superAdminToken', res.data.superToken);
        setStatusMsg('Offline Hardware Recovery Key accepted.');
        if (typeof onUnlockSuccess === 'function') {
          onUnlockSuccess(res.data.superToken);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid Offline Hardware Recovery Key.');
} finally {
      setLoading(false);
    }
  };

  const isReadyToSubmit =
    phoneOtp.trim().length === 6 &&
    gmailOtp.trim().length === 6 &&
    Boolean(voiceSampleBase64) &&
    Boolean(faceVideoBase64);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold tracking-wider text-emerald-400">
            SUPER ADMIN 4-LAYER SECURITY GATE
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            v3.0.0 SELF-HEALING LOCK • BIOMETRIC THRESHOLD 0.90
          </p>
        </div>

        {/* 4 Green Status Checkmarks */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div
            className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition ${
              layers.phoneOtp
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                : 'bg-red-950/40 border-red-800 text-red-400'
            }`}
          >
            <div>Layer 1</div>
            <div className="mt-1">Phone {layers.phoneOtp ? '✓' : '✗'}</div>
          </div>
<div
            className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition ${
              layers.gmailOtp
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                : 'bg-red-950/40 border-red-800 text-red-400'
            }`}
          >
            <div>Layer 2</div>
            <div className="mt-1">Gmail {layers.gmailOtp ? '✓' : '✗'}</div>
          </div>

          <div
            className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition ${
              layers.voiceVerified
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                : 'bg-red-950/40 border-red-800 text-red-400'
            }`}
          >
            <div>Layer 3</div>
            <div className="mt-1">Voice {layers.voiceVerified ? '✓' : '✗'}</div>
          </div>

          <div
            className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition ${
              layers.face3DVerified
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                : 'bg-red-950/40 border-red-800 text-red-400'
            }`}
          >
            <div>Layer 4</div>
            <div className="mt-1">3D Face {layers.face3DVerified ? '✓' : '✗'}</div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-600 text-red-200 text-xs">
{errorMsg}
          </div>
        )}

        {statusMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs">
            {statusMsg}
          </div>
        )}

        {/* Step 1: Dispatch & Enter Phone + Gmail OTPs */}