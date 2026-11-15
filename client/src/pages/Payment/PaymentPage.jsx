import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, ArrowLeft } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

const GATEWAYS = [
  { id: 'bKash', name: 'bKash Live Escrow', badge: 'Instant' },
  { id: 'Nagad', name: 'Nagad Live Escrow', badge: 'Instant' },
  { id: 'Rocket', name: 'Rocket Mobile Banking', badge: 'Verified' },
  { id: 'Bank', name: 'Bank Transfer / Card', badge: 'SSL' },
];

export default function PaymentPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [job, setJob] = useState(null);
  const [gateway, setGateway] = useState('bKash');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}`);
        if (active) setJob(data?.job || null);
      } catch (err) {
        if (active) error(err.response?.data?.message || 'Unable to load payment details.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchJob();
    return () => {
      active = false;
    };
  }, [jobId, error]);

  if (loading) {
    return <Loading />;
  }

  if (!job) {
    return <Loading variant="empty" emptyTitle="Job Not Found" />;
  }

  const exactAmount = Number(job.price) || 0;
  const mistriShare = exactAmount * 0.8;
  const agentShare = job.hasAgent ? exactAmount * 0.05 : 0;
  const platformShare = job.hasAgent ? exactAmount * 0.15 : exactAmount * 0.2;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!trxId.trim()) {
      error('Transaction ID (TrxID) is required for live verification.');
      return;
    }

    setPaying(true);
    try {
      const { data } = await api.post('/payments/create', {
        jobId: job._id,
        amount: exactAmount,
        method: gateway,
        trxId: trxId.trim(),
      });

      success('Payment verified and locked in Escrow.');
      navigate(`/payment/status/${data?.payment?._id || job._id}`, { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Payment verification failed. Check exact amount & TrxID.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/jobs/${jobId}`}
            className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Escrow Checkout</h1>
            <p className="text-xs text-gray-500">
              Exact amount lock enforced • Funds held safely until Job End OTP
            </p>
          </div>
        </div>

        <Link
          to={`/payment/advance/${jobId}`}
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          Pay 30% / 50% Advance Instead →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Select Payment Gateway">
            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GATEWAYS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGateway(item.id)}
                    className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                      gateway === item.id
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30'
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-semibold text-sm">{item.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 font-bold">
                      {item.badge}
                    </span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Exact Payable Amount (Taka)
                </label>
                <input
                  type="text"
                  value={formatTaka(exactAmount)}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 font-bold text-blue-600 cursor-not-allowed"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Even a 1 Taka mismatch is automatically rejected by Escrow Verification.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {gateway} Transaction ID (TrxID)
                </label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder="e.g., 9H7K2LMN8P"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={paying}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 transition"
              >
                <CreditCard size={18} />
                <span>{paying ? 'Verifying Transaction...' : `Verify & Pay ${formatTaka(exactAmount)}`}</span>
              </button>
            </form>
          </Card>
        </div>

        <Card title="Invoice & Equal Split Receipt" action={<ShieldCheck size={18} className="text-emerald-600" />}>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Job Type</span>
              <span className="font-semibold">{job.isMistriOnly ? 'Mistri-Only' : 'Full Material'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Area</span>
              <span className="font-semibold">{job.sqft} Sqft</span>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2 text-xs">
              <p className="font-semibold text-gray-400 uppercase">Escrow Split Breakdown</p>
              <div className="flex justify-between">
                <span>Mistri Equal Pool (80%)</span>
                <span className="font-bold text-emerald-600">{formatTaka(mistriShare)}</span>
              </div>
              {job.hasAgent ? (
                <>
                  <div className="flex justify-between">
                    <span>Agent Share (5%)</span>
                    <span>{formatTaka(agentShare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (15%)</span>
                    <span>{formatTaka(platformShare)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>Platform Fee (20%)</span>
                  <span>{formatTaka(platformShare)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-blue-600">{formatTaka(exactAmount)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
