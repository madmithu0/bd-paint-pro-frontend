import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import useToast from '../../hooks/useToast';
import useKill from '../../hooks/useKill';
import { formatTaka, formatSqft } from '../../format';

const JobCreate = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isKilled } = useKill();

  // Form States
  const [sqft, setSqft] = useState('');
  const [materialSource, setMaterialSource] = useState('platform'); // 'platform' | 'customer'
  const [wallPhoto, setWallPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [hasAgent, setHasAgent] = useState(false);
  const [agentCode, setAgentCode] = useState('');

  // AI & Wall Problem States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOffline, setAiOffline] = useState(false);
  const [wallProblems, setWallProblems] = useState({
    nona: false,
    damp: false,
    fatol: false,
  });
  const [damageLevel, setDamageLevel] = useState('low'); // 'low' | 'medium' | 'high'
  const [loading, setLoading] = useState(false);

  // Clean up object URL on unmount or photo change to prevent memory leaks
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // Derived Calculations (450 Sqft/day standard, Mistri-Only, Slot Division, Share Split)
  const calculations = useMemo(() => {
    const numericSqft = parseFloat(sqft) || 0;
    if (numericSqft <= 0) {
      return {
        totalDays: 0,
        mistriCount: 1,
        slots: [],
        materialCost: 0,
        labourCost: 0,
        repairCost: 0,
        totalPrice: 0,
        mistriShare: 0,
        agentShare: 0,
        platformShare: 0,
      };
    }

    // 1. Day Calculate = Sqft / 450 (e.g., 100 Sqft = 0.22 Day)
    const totalDays = Number((numericSqft / 450).toFixed(2));

    // 2. Mistri Needed & Auto Slot Division
    const mistriCount = Math.max(1, Math.ceil(numericSqft / 900));
    const totalSlotsCount = Math.max(1, Math.ceil(totalDays));
    const slots = Array.from({ length: totalSlotsCount }, (_, idx) => ({
      slotNumber: idx + 1,
      sqftTarget: Number(Math.min(450, numericSqft - idx * 450).toFixed(2)),
      status: 'Pending',
    }));

    // 3. Material & Labour Cost (Enforce zero material cost for Mistri-Only)
    const isMistriOnly = materialSource === 'customer';
    const labourRate = 12;
    const materialRate = isMistriOnly ? 0 : 13;

    const labourCost = Math.round(numericSqft * labourRate);
    const materialCost = Math.round(numericSqft * materialRate);

    // 4. Wall Repair Cost (Nona, Damp, Fatol)
    const multiplier = damageLevel === 'high' ? 1.5 : damageLevel === 'medium' ? 1.2 : 1;
    let repairCost = 0;
    if (wallProblems.nona) repairCost += numericSqft * 3 * multiplier;
    if (wallProblems.damp) repairCost += numericSqft * 4 * multiplier;
    if (wallProblems.fatol) repairCost += numericSqft * 2 * multiplier;
    repairCost = Math.round(repairCost);

    const totalPrice = labourCost + materialCost + repairCost;

    // 5. Auto Share Split (Mistri 80%, Agent 5% + Platform 15%, or No Agent Platform 20%)
    const mistriShare = Math.round(totalPrice * 0.8);
    const agentShare = hasAgent ? Math.round(totalPrice * 0.05) : 0;
    const platformShare = totalPrice - mistriShare - agentShare;

    return {
      totalDays,
      mistriCount,
      slots,
      materialCost,
      labourCost,
      repairCost,
      totalPrice,
      mistriShare,
      agentShare,
      platformShare,
    };
  }, [sqft, materialSource, wallProblems, damageLevel, hasAgent]);

  // Handle Photo Upload & AI Wall Detection
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file.', 'error');
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setWallPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('wallPhoto', file);

    setAiLoading(true);
    setAiOffline(false);

    try {
      const res = await api.post('/jobs/ai-analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Mandatory manual fallback if AI confidence score is below 0.80
      if (res.data?.success && Number(res.data.confidence) >= 0.8) {
        if (res.data.detectedSqft && !sqft) {
          setSqft(String(res.data.detectedSqft));
        }
        setWallProblems({
          nona: Boolean(res.data.problems?.nona),
          damp: Boolean(res.data.problems?.damp),
          fatol: Boolean(res.data.problems?.fatol),
        });
        if (['low', 'medium', 'high'].includes(res.data.damageLevel)) {
          setDamageLevel(res.data.damageLevel);
        }
        showToast('AI wall analysis completed.', 'success');
      } else {
        setAiOffline(true);
        showToast('Low AI confidence. Switched to manual input mode.', 'warning');
      }
    } catch (error) {
      setAiOffline(true);
      showToast('AI service unavailable. Manual calculation mode active.', 'info');
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Job Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (typeof isKilled === 'function' && isKilled('JOB_CREATE')) {
      showToast('Job creation is temporarily disabled.', 'error');
      return;
    }

    const numericSqft = parseFloat(sqft);
    if (!numericSqft || numericSqft <= 0) {
      showToast('Please enter a valid area in Sqft.', 'error');
      return;
    }

    if (hasAgent && !agentCode.trim()) {
      showToast('Please enter a valid Agent Code or Phone.', 'error');
      return;
    }

    setLoading(true);
    try {
      const isMistriOnly = materialSource === 'customer';
      const payload = new FormData();

      payload.append('sqft', numericSqft);
      payload.append('price', calculations.totalPrice);
      payload.append('materialSource', materialSource);
      payload.append('materialCost', calculations.materialCost);
      payload.append('labourCost', calculations.labourCost);
      payload.append('isMistriOnly', String(isMistriOnly));
      payload.append('totalDays', calculations.totalDays);
      payload.append('mistriCount', calculations.mistriCount);
      payload.append('perDay', 450);
      payload.append('slots', JSON.stringify(calculations.slots));
      payload.append('wallProblems', JSON.stringify(wallProblems));
      payload.append('damageLevel', damageLevel);
      payload.append('hasAgent', String(hasAgent));

      if (hasAgent) {
        payload.append('agentCode', agentCode.trim());
      }
      if (wallPhoto) {
        payload.append('wallPhoto', wallPhoto);
      }

      const res = await api.post('/jobs/create', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.job?._id) {
        showToast('Job created successfully.', 'success');
        navigate(`/jobs/${res.data.job._id}`);
      } else {
        throw new Error('Invalid server response');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create job.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const hasAnyWallProblem = wallProblems.nona || wallProblems.damp || wallProblems.fatol;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md">
      <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-4 mb-6 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Create New Job
        </h2>
        {materialSource === 'customer' && (
          <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
            Mistri-Only Mode
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Wall Photo Upload & AI Analysis */}
        <div className="p-4 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Wall Photo (AI Sqft & Problem Detection)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {aiLoading && (
            <p className="mt-2 text-sm text-blue-600 animate-pulse">
              Analyzing wall photo...
            </p>
          )}
          {aiOffline && (
            <p className="mt-2 text-xs text-amber-600">
              AI Fallback Active: Please enter Sqft and wall conditions manually.
            </p>
          )}
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Wall Preview"
              className="mt-3 h-40 w-auto rounded-lg object-cover border dark:border-gray-700"
            />
          )}
        </div>

        {/* Sqft Input & Material Source */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Area (Sqft) *
            </label>
            <input
              type="number"
              min="1"
              step="any"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              placeholder="e.g. 450"
