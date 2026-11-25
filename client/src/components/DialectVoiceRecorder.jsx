import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export default function DialectVoiceRecorder({ onSlotDetected, district = '' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('voice');
  const [previewUrl, setPreviewUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const startVoiceRecording = async () => {
    setErrorMsg('');
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `dialect-note-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setMediaFile(file);
        setMediaType('voice');
        setPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            stopVoiceRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setErrorMsg('Microphone permission denied. Enable mic access or upload a wall video.');
    }
  };
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setResult(null);

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Video file size must not exceed 25 MB.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setMediaFile(file);
    setMediaType('video');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAnalyzeMedia = async () => {
    if (!mediaFile) {
      setErrorMsg('Record a voice note or select a video file first.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('media', mediaFile);
      formData.append('mediaType', mediaType);
      if (district) formData.append('district', district);

      const token = localStorage.getItem('token') || '';
      const { data } = await axios.post(`${API_BASE}/jobs/analyze-dialect-media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const parsed = {
        transcribedText: data?.transcribedText || '',
        detectedDialect: data?.detectedDialect || district || 'Standard Bangla',
        detectedSqft: Number(data?.detectedSqft || 0),
        suggestedService: data?.suggestedService || '',
        calculatedSlots: Number(data?.calculatedSlots || 0),
        confidence: Number(data?.confidence || 0),
        mediaUrl: data?.mediaUrl || '',
      };

      setResult(parsed);
      if (typeof onSlotDetected === 'function') {
        onSlotDetected(parsed);
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          'Media analysis failed. You can enter Sqft manually below.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const clearMedia = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setMediaFile(null);
    setPreviewUrl('');
    setResult(null);
    setErrorMsg('');
    setRecordingSeconds(0);
  };
  return (
    <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-slate-900 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            64-District Dialect Voice & Video Smart Estimator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record a regional voice note or upload a wall walkthrough video to auto-calculate Sqft and slots
          </p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-600 text-white font-medium">
          AI Slot Engine
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={startVoiceRecording}
            className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
          >
            Record Voice Note
          </button>
        ) : (
          <button
            type="button"
            onClick={stopVoiceRecording}
            className="px-3.5 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold animate-pulse"
          >
            Stop Recording ({recordingSeconds}s / 60s)
          </button>
        )}

        <label className="px-3.5 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer">
          Upload Wall Video
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </label>

        {mediaFile && (
          <button
            type="button"
            onClick={clearMedia}
            className="px-2.5 py-2 text-xs text-red-600 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {previewUrl && (
        <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
          {mediaType === 'voice' ? (
            <audio src={previewUrl} controls className="w-full h-9" />
          ) : (
            <video src={previewUrl} controls className="w-full max-h-44 rounded" />
          )}

          <button
            type="button"
            onClick={handleAnalyzeMedia}
            disabled={analyzing}
            className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold"
          >
            {analyzing ? 'Analyzing Dialect & Sqft...' : 'Calculate Sqft & Slots'}
          </button>
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg">
          {errorMsg}
        </p>
      )}

      {result && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
            Detected Dialect: {result.detectedDialect} (Confidence: {Math.round(result.confidence * 100)}%)
          </p>
          {result.transcribedText && (
            <p className="text-slate-700 dark:text-slate-300">
              "{result.transcribedText}"
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-1 font-semibold text-slate-900 dark:text-white">
            <span>Total Sqft: {result.detectedSqft}</span>
            <span>Estimated Slots: {result.calculatedSlots} Day(s)</span>
            {result.suggestedService && <span>Category: {result.suggestedService}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
