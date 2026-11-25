import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export default function WarrantyVerifyPage() {
  const [searchParams] = useSearchParams();
  const [qrToken, setQrToken] = useState(searchParams.get('token') || '');
  const [warranty, setWarranty] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [claimReason, setClaimReason] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');

  const verifyCertificate = async (tokenValue) => {
    const cleanToken = (tokenValue || '').trim();
    if (!cleanToken) {
      setErrorMsg('Enter a valid Warranty ID or QR verification token.');
      return;
    }

    setVerifying(true);
    setErrorMsg('');
    setWarranty(null);
    setClaimSuccess('');

    try {
      const { data } = await axios.get(`${API_BASE}/warranty/verify/${encodeURIComponent(cleanToken)}`);
      setWarranty(data?.warranty || data);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          'Warranty certificate not found or verification token is invalid.'
      );
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    const initialToken = searchParams.get('token');
    if (initialToken) {
      verifyCertificate(initialToken);
    }
  }, [searchParams]);
  const handleVerifySubmit = (e) => {
    e.preventDefault();
    verifyCertificate(qrToken);
  };

  const handleTouchUpClaim = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setClaimSuccess('');

    if (!warranty?._id) return;
    if (!claimReason.trim()) {
      setErrorMsg('Briefly describe the wall area needing touch-up service.');
      return;
    }

    setClaiming(true);
    try {
      const token = localStorage.getItem('token') || '';
      const { data } = await axios.post(
        `${API_BASE}/warranty/${warranty._id}/claim-touchup`,
        { reason: claimReason.trim() },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      setClaimSuccess(
        data?.message || 'Free touch-up service claim submitted successfully.'
      );
      setClaimReason('');
      if (data?.warranty) {
        setWarranty(data.warranty);
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          'Could not submit touch-up claim. Ensure you are logged in as the job owner.'
      );
    } finally {
      setClaiming(false);
    }
  };

  const isExpired = warranty?.expiresAt
    ? new Date(warranty.expiresAt).getTime() < Date.now()
    : false;
  return (
    <div className="max-w-2xl mx-auto my-8 px-4">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="text-center space-y-1">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            1–3 Year Digital Service Warranty
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Warranty Certificate & QR Authenticity Check
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify certificate validity or submit a 1-click free touch-up service claim
          </p>
        </div>

        <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={qrToken}
            onChange={(e) => setQrToken(e.target.value)}
            placeholder="Enter Warranty Token or Certificate Code"
            className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono"
            required
          />
          <button
            type="submit"
            disabled={verifying}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold"
          >
            {verifying ? 'Checking...' : 'Verify Certificate'}
          </button>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600">
            {errorMsg}
          </div>
        )}

        {claimSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-600 font-medium">
            {claimSuccess}
          </div>
        )}

        {warranty && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <p className="text-xs text-slate-500">Certificate ID</p>
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                  {warranty.certificateCode || warranty._id}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isExpired
                    ? 'bg-red-500/10 text-red-600'
                    : 'bg-emerald-500/10 text-emerald-600'
                }`}
              >
                {isExpired ? 'Expired' : `Active (${warranty.durationYears || 1} Year)`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Customer Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {warranty.customerName || 'Verified Customer'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Covered Area</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {warranty.totalSqft || 0} Sqft
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Issued On</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {warranty.issuedAt ? new Date(warranty.issuedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Valid Until</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {warranty.expiresAt ? new Date(warranty.expiresAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {!isExpired && (
              <form
                onSubmit={handleTouchUpClaim}
                className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  1-Click Free Touch-Up Service Claim
                </label>
                <textarea
                  rows={2}
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  placeholder="Describe peel, damp spot, or touch-up area..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  required
                />
                <button
                  type="submit"
                  disabled={claiming}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold"
                >
                  {claiming ? 'Submitting Claim...' : 'Submit Free Touch-Up Claim'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
