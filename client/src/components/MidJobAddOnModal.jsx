import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export default function MidJobAddOnModal({ isOpen, onClose, jobId, onSuccess }) {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [sqft, setSqft] = useState('');
  const [coatCount, setCoatCount] = useState(1);
  const [isMistriOnly, setIsMistriOnly] = useState(false);

  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingServices, setFetchingServices] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setOtpCode('');
    setErrorMsg('');

    const loadServices = async () => {
      setFetchingServices(true);
      try {
        const { data } = await axios.get(`${API_BASE}/services`);
        const list = Array.isArray(data?.services) ? data.services : Array.isArray(data) ? data : [];
        setServices(list);
        if (list.length > 0 && !selectedServiceId) {
          setSelectedServiceId(list[0]._id);
        }
      } catch {
        setErrorMsg('Failed to load active service categories.');
      } finally {
        setFetchingServices(false);
      }
    };

    loadServices();
  }, [isOpen]);
  const selectedService = useMemo(
    () => services.find((s) => s._id === selectedServiceId) || null,
    [services, selectedServiceId]
  );

  const preview = useMemo(() => {
    const numericSqft = Number(sqft) || 0;
    const coats = Math.max(1, Number(coatCount) || 1);
    if (!selectedService || numericSqft <= 0) {
      return { rate: 0, subTotal: 0, additionalSlots: 0, advance30Required: 0 };
    }

    const baseRate = isMistriOnly
      ? Number(selectedService.labourRatePerSqft || 0)
      : Number(selectedService.withMaterialRatePerSqft || 0);

    const coatMultiplier = coats > 1 ? 1 + (coats - 1) * Number(selectedService.perCoatRateMultiplier || 0.4) : 1;
    const subTotal = Math.round(numericSqft * baseRate * coatMultiplier);
    const slotCapacity = Math.max(1, Number(selectedService.slotSqftPerDay || 450));
    const additionalSlots = Number(((numericSqft * coatMultiplier) / slotCapacity).toFixed(2));
    const advance30Required = Math.ceil(subTotal * 0.3);

    return { rate: baseRate, subTotal, additionalSlots, advance30Required };
  }, [selectedService, sqft, coatCount, isMistriOnly]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedServiceId || Number(sqft) <= 0) {
      setErrorMsg('Select a service category and enter valid Sqft.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      await axios.post(
        `${API_BASE}/jobs/${jobId}/add-service/request-otp`,
        {
          serviceId: selectedServiceId,
          sqft: Number(sqft),
          coatCount: Number(coatCount),
          isMistriOnly,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setStep(2);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Could not send contract amendment OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAddOn = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode.trim().length !== 6) {
      setErrorMsg('Enter the 6-digit OTP sent to your registered phone.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const { data } = await axios.patch(
        `${API_BASE}/jobs/${jobId}/add-service`,
        {
          serviceId: selectedServiceId,
          sqft: Number(sqft),
          coatCount: Number(coatCount),
          isMistriOnly,
          otpCode: otpCode.trim(),
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (typeof onSuccess === 'function') {
        onSuccess(data);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Invalid OTP or add-on request failed.');
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Mid-Job Service Expansion
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Append extra painting category or coats with OTP contract amendment
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-bold px-2"
          >
            X
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Painting Category
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                disabled={fetchingServices}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                required
              >
                {services.map((srv) => (
                  <option key={srv._id} value={srv._id}>
                    {srv.nameEn} ({srv.slotSqftPerDay} Sqft/Day)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Additional Sqft
                </label>
                <input
                  type="number"
                  min="1"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                  placeholder="e.g. 350"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Coat Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={coatCount}
                  onChange={(e) => setCoatCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isMistriOnly}
                onChange={(e) => setIsMistriOnly(e.target.checked)}
                className="rounded border-slate-300"
              />
              Mistri-Only Mode (Customer supplies paint)
            </label>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Applied Rate:</span>
                <span className="font-semibold">{preview.rate} Tk / Sqft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Added Time Slots:</span>
                <span className="font-semibold">{preview.additionalSlots} Day(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Add-On Subtotal:</span>
                <span className="font-bold text-slate-900 dark:text-white">{preview.subTotal} Tk</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <span>Supplementary 30% Escrow:</span>
                <span>{preview.advance30Required} Tk</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || fetchingServices}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold"
            >
              {loading ? 'Sending OTP...' : 'Send Contract Amendment OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmAddOn} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Enter the 6-digit SMS OTP to legally append this add-on service ({preview.subTotal} Tk) to your active job contract.
            </p>

            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-center tracking-[0.5em] font-mono text-base"
              required
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold"
              >
                {loading ? 'Verifying...' : 'Confirm & Append Service'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
