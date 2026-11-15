import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka, calculateDaysFromSqft } from '../../format';
import Card from '../../components/Card';

const BASE_RATE_WITH_MATERIAL = 18;
const BASE_RATE_MISTRI_ONLY = 10;
const WALL_PROBLEM_SURCHARGE = {
  None: 0,
  Nona: 4,
  Damp: 5,
  Fatol: 6,
};

export default function JobCreate() {
  const { success, error, warning } = useToast();
  const navigate = useNavigate();

  const [sqft, setSqft] = useState(450);
  const [isMistriOnly, setIsMistriOnly] = useState(false);
  const [materialSource, setMaterialSource] = useState('Platform');
  const [wallProblem, setWallProblem] = useState('None');
  const [hasAgent, setHasAgent] = useState(false);
  const [agentPhone, setAgentPhone] = useState('');
  const [address, setAddress] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const calculation = useMemo(() => {
    const cleanSqft = Math.max(Number(sqft) || 0, 0);
    const totalDays = calculateDaysFromSqft(cleanSqft);
    const mistriCount = Math.max(Math.ceil(cleanSqft / 450), 1);

    const baseRate = isMistriOnly ? BASE_RATE_MISTRI_ONLY : BASE_RATE_WITH_MATERIAL;
    const problemRate = WALL_PROBLEM_SURCHARGE[wallProblem] || 0;

    const labourCost = cleanSqft * BASE_RATE_MISTRI_ONLY;
    const materialCost = isMistriOnly ? 0 : cleanSqft * (baseRate - BASE_RATE_MISTRI_ONLY + problemRate);
    const totalPrice = labourCost + materialCost;

    const slots = [];
    let remaining = cleanSqft;
    let slotIndex = 1;
    while (remaining > 0) {
      const slotSqft = Math.min(remaining, 450);
      slots.push({ slot: slotIndex++, sqft: slotSqft });
      remaining -= slotSqft;
    }

    return {
      cleanSqft,
      totalDays,
      mistriCount,
      labourCost,
      materialCost,
      totalPrice,
      slots,
    };
  }, [sqft, isMistriOnly, wallProblem]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);

    const formData = new FormData();
    formData.append('wallPhoto', file);

    setAiAnalyzing(true);
    try {
      const { data } = await api.post('/jobs/ai-measure', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data?.fallbackManual) {
        warning('AI wall scanner offline. Switched to manual input mode.');
        setAiResult(null);
      } else if (data?.analysis) {
        setAiResult(data.analysis);
        if (data.analysis.detectedSqft > 0) {
          setSqft(data.analysis.detectedSqft);
        }
        if (data.analysis.wallProblem && WALL_PROBLEM_SURCHARGE[data.analysis.wallProblem] !== undefined) {
          setWallProblem(data.analysis.wallProblem);
        }
        success('AI wall measurement & damage inspection completed.');
      }
    } catch {
      warning('AI inspection unavailable. Please verify Sqft and wall condition manually.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (calculation.cleanSqft < 50) {
      error('Minimum job area is 50 Sqft.');
      return;
    }
    if (!address.trim()) {
      error('Work site address is required.');
      return;
    }
    if (hasAgent && !/^01[3-9]\d{8}$/.test(agentPhone.trim())) {
      error('Enter a valid 11-digit Agent mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('sqft', calculation.cleanSqft);
      payload.append('isMistriOnly', isMistriOnly);
      payload.append('materialSource', isMistriOnly ? 'Customer' : materialSource);
      payload.append('wallProblem', wallProblem);
      payload.append('hasAgent', hasAgent);
      if (hasAgent) payload.append('agentPhone', agentPhone.trim());
      payload.append('address', address.trim());
      if (photoFile) payload.append('wallPhoto', photoFile);

      const { data } = await api.post('/jobs', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success('Job booked successfully.');
      navigate(`/jobs/${data?.job?._id || ''}`, { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create job.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Book Painting & Wall Repair Job</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          450 Sqft/Day Standard • Automated Slot Division & AI Wall Inspection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Job Specifications">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-4 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-950/20">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Camera size={22} className="text-blue-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">AI Wall Photo Measurement & Damage Scan</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Upload wall photo to auto-detect Sqft, Nona, Damp, or Fatol
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">
                    {aiAnalyzing ? 'Scanning...' : 'Upload Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    disabled={aiAnalyzing}
                    className="hidden"
                  />
                </label>

                {aiResult && (
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-900 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <CheckCircle2 size={15} />
                      Detected: {aiResult.detectedSqft} Sqft • Problem: {aiResult.wallProblem}
                    </span>
                    {aiResult.confidence < 0.8 && (
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <AlertTriangle size={14} /> Manual review recommended
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Total Wall Area (Sqft)</label>
                  <input
                    type="number"
                    min={50}
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Wall Problem Condition</label>
                  <select
                    value={wallProblem}
                    onChange={(e) => setWallProblem(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="None">Normal Wall (No Damage)</option>
                    <option value="Nona">Nona (Salinity Chemical Treatment)</option>
                    <option value="Damp">Damp (Waterproof Sealer)</option>
                    <option value="Fatol">Fatol (Crack Putty & Mesh)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Mistri-Only Mode (Customer Owns Paint)</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Enforces zero material cost and charges labour only
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isMistriOnly}
                  onChange={(e) => setIsMistriOnly(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-600"
                />
              </div>

              {!isMistriOnly && (
                <div>
                  <label className="block text-sm font-medium mb-1">Material Source</label>
                  <select
                    value={materialSource}
                    onChange={(e) => setMaterialSource(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="Platform">Platform Verified Merchant Supply</option>
                    <option value="Mistri">Mistri Arranged Material</option>
                  </select>
