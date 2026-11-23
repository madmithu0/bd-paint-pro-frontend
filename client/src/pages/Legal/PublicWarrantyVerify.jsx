import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../api';

const PublicWarrantyVerify = () => {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const initialToken = paramToken || searchParams.get('token') || '';

  const [tokenInput, setTokenInput] = useState(initialToken);
  const [warranty, setWarranty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const verifyWarrantyToken = async (targetToken) => {
    const cleanToken = String(targetToken || '').trim();
    if (!cleanToken) {
      setErrorMsg('Please enter a valid Warranty QR Token.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setWarranty(null);

    try {
      const response = await api.get(
        `/warranties/verify/${encodeURIComponent(cleanToken)}`
      );
      if (response.data && response.data.success) {
        setWarranty(response.data.warranty);
      } else {
        setErrorMsg('Warranty certificate not found or invalid token.');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          'Unable to verify warranty certificate. Check the QR token.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialToken) {
      verifyWarrantyToken(initialToken);
    }
  }, [initialToken]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    verifyWarrantyToken(tokenInput);
  };

  const isExpired =
    warranty && warranty.expiresAt
      ? new Date(warranty.expiresAt) < new Date()
      : false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-emerald-700 bg-emerald-100 rounded-full uppercase">
            Official QR Verification
          </span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Digital Service Warranty Check
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Verify authenticity of 1 to 3 year painting service warranty
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Enter Warranty Token or QR Code ID"
            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Verify'}
          </button>
        </form>

        {errorMsg && (
          <div className="p-4 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}
        {warranty && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-900 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <div>
                <p className="text-xs text-gray-500">Certificate ID</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {warranty.certificateCode || warranty.qrToken}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  isExpired
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isExpired ? 'EXPIRED' : 'ACTIVE & VERIFIED'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Customer Name</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {warranty.customerName || 'Verified Client'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Coverage Duration</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {warranty.durationYears || 1} Year(s)
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Issued Date</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {warranty.issuedAt
                    ? new Date(warranty.issuedAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Valid Until</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {warranty.expiresAt
                    ? new Date(warranty.expiresAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            {warranty.materialBatchRef && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                Verified Material Batch: {warranty.materialBatchRef}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs font-medium text-indigo-600 hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicWarrantyVerify;
