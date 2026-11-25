import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export default function MerchantOrderCheckout() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [trxId, setTrxId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('material_checkout_draft');
      if (raw) {
        setDraft(JSON.parse(raw));
      }
    } catch {
      setDraft(null);
    }

    const fetchActiveJobs = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        if (!token) return;
        const { data } = await axios.get(`${API_BASE}/jobs/my-jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = Array.isArray(data?.jobs) ? data.jobs : Array.isArray(data) ? data : [];
        setActiveJobs(list.filter((j) => j.status !== 'Completed' && j.status !== 'Cancelled'));
      } catch {
        setActiveJobs([]);
      }
    };

    fetchActiveJobs();
  }, []);
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!draft || !Array.isArray(draft.items) || draft.items.length === 0) {
      setErrorMsg('No items found in checkout draft.');
      return;
    }

    if (!selectedJobId && !deliveryAddress.trim()) {
      setErrorMsg('Select an active job site or enter a custom delivery address.');
      return;
    }

    if (!contactPhone.trim()) {
      setErrorMsg('Enter a valid receiver phone number.');
      return;
    }

    if (!trxId.trim()) {
      setErrorMsg('Enter your bKash/Nagad Transaction ID (TrxID).');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const payload = {
        items: draft.items.map((item) => ({
          materialId: item._id,
          quantity: Number(item.quantity) || 1,
        })),
        merchantId: draft.merchantId || undefined,
        jobId: selectedJobId || undefined,
        deliveryAddress: deliveryAddress.trim(),
        contactPhone: contactPhone.trim(),
        paymentMethod,
        trxId: trxId.trim(),
        paidAmount: Number(draft.subtotal) || 0,
      };

      const { data } = await axios.post(`${API_BASE}/merchant-store/orders`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      try {
        sessionStorage.removeItem('material_checkout_draft');
      } catch {}

      setOrderResult(data?.order || data);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          'Order verification failed. Check TrxID and exact amount.'
      );
    } finally {
      setSubmitting(false);
    }
  };
  if (orderResult) {
    return (
      <div className="max-w-lg mx-auto my-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 shadow-lg space-y-4">
        <div className="text-center space-y-1">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Order Confirmed & Dispatched to Merchant
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Order #{orderResult.orderCode || orderResult._id?.slice(-6).toUpperCase()}
          </h2>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Dispatch Status:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {orderResult.status || 'Confirmed - Preparing Dispatch'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Method:</span>
            <span className="font-semibold">{orderResult.paymentMethod || paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Transaction ID:</span>
            <span className="font-mono font-semibold">{orderResult.trxId || trxId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Paid:</span>
            <span className="font-bold text-emerald-600">{orderResult.totalAmount || draft?.subtotal} Tk</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/materials')}
          className="w-full py-2.5 rounded-lg bg-slate-900 dark:bg-emerald-600 text-white text-xs font-semibold"
        >
          Back to Material Store
        </button>
      </div>
    );
  }

  if (!draft || !draft.items || draft.items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Your material checkout cart is empty.
        </p>
        <button
          type="button"
          onClick={() => navigate('/materials')}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
        >
          Browse Material Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          Direct Material E-Commerce Checkout
        </h1>
        <p className="text-xs text-slate-500">
          Verified local merchant routing with digital OTP memo protection
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200">Order Items ({draft.items.length})</p>
          {draft.items.map((item) => (
            <div key={item._id} className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{item.name} x {item.quantity}</span>
              <span>{(Number(item.unitPrice) || 0) * (Number(item.quantity) || 1)} Tk</span>
            </div>
          ))}
          {draft.bulkSavings > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium pt-1">
              <span>Bulk Discount Applied:</span>
              <span>-{draft.bulkSavings} Tk</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2">
            <span>Exact Payable Amount:</span>
            <span>{draft.subtotal} Tk</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Link to Active Job Site (Optional)
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
            >
              <option value="">Custom Delivery Address</option>
              {activeJobs.map((job) => (
                <option key={job._id} value={job._id}>
                  Job #{job._id.slice(-6).toUpperCase()} ({job.totalSqft} Sqft)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Receiver Phone Number
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Delivery Address
          </label>
          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="House, Road, Upazila, District"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
            required={!selectedJobId}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Gateway
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
            >
              <option value="bKash">bKash Merchant Pay</option>
              <option value="Nagad">Nagad Merchant Pay</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Transaction ID (TrxID)
            </label>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value.toUpperCase())}
              placeholder="e.g. 9K7A2B1C4D"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold"
        >
          {submitting ? 'Verifying Payment & Routing Order...' : `Confirm & Pay ${draft.subtotal} Tk`}
        </button>
      </form>
    </div>
  );
}
