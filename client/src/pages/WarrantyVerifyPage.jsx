import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from '../api/axiosConfig';

const WarrantyVerifyPage = () => {
  const { certificateCode: paramCode } = useParams();
  const [searchParams] = useSearchParams();
  const initialCode = paramCode || searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [warranty, setWarranty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [claimNote, setClaimNote] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claiming, setClaiming] = useState(false);

  const handleVerify = async (targetCode) => {
    const cleanCode = String(targetCode || code || '').trim();
    if (!cleanCode) {
      setError('Please enter a valid Warranty Certificate ID.');
      return;
    }

    setLoading(true);
    setError('');
    setWarranty(null);
    setClaimSuccess('');

    try {
      const res = await axios.get(`/warranties/verify/${encodeURIComponent(cleanCode)}`);
      setWarranty(res.data?.warranty || res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Warranty certificate not found or invalid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, [initialCode]);

  const handleTouchUpClaim = async (e) => {
    e.preventDefault();
    if (!warranty?._id && !warranty?.certificateCode) return;

    setClaiming(true);
    setError('');
    setClaimSuccess('');

    try {
      const targetId = warranty._id || warranty.certificateCode;
      const res = await axios.post(`/warranties/${targetId}/claim`, {
        issueDescription: claimNote || 'Touch-up service requested under active warranty.',
      });
      setClaimSuccess(res.data?.message || 'Free touch-up claim submitted successfully.');
      setClaimNote('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit touch-up claim.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8">
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full mb-2">
            DIGITAL SERVICE WARRANTY
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            Verify Digital Warranty Certificate
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your certificate ID or scan QR code to verify 1-3 year painting coverage.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(code);
          }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. WRN-2026-884920"
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Certificate'}
          </button>
        </form>
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {claimSuccess && (
          <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
            {claimSuccess}
          </div>
        )}

        {warranty && (
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Certificate Number</p>
                <p className="text-lg font-bold text-slate-900">
                  {warranty.certificateCode || warranty._id}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  warranty.status === 'Active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {warranty.status || 'Active'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Customer Name</p>
                <p className="font-semibold text-slate-800">
                  {warranty.customerName || warranty.customer?.name || 'Verified Client'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Coverage Period</p>
                <p className="font-semibold text-slate-800">
                  {warranty.durationYears || 1} Year(s) Coverage
                </p>
              </div>
              <div>
                <p className="text-slate-500">Paint Brand & Grade</p>
                <p className="font-semibold text-slate-800">
                  {warranty.paintBrand || 'Authorized Brand'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Valid Until</p>
                <p className="font-semibold text-slate-800">
                  {warranty.expiresAt
                    ? new Date(warranty.expiresAt).toLocaleDateString()
                    : 'Active Warranty'}
                </p>
              </div>
            </div>

            {warranty.status !== 'Expired' && (
              <form
                onSubmit={handleTouchUpClaim}
                className="pt-4 border-t border-emerald-200 space-y-3"
              >
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Request 1-Click Free Touch-Up Service
                </label>
                <textarea
                  rows="2"
                  value={claimNote}
                  onChange={(e) => setClaimNote(e.target.value)}
                  placeholder="Describe wall peeling, dampness, or touch-up area..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={claiming}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50"
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
};

export default WarrantyVerifyPage;
