import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

export default function AdvancePayment() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [job, setJob] = useState(null);
  const [percentage, setPercentage] = useState(30);
  const [gateway, setGateway] = useState('bKash');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}`);
        if (active) setJob(data?.job || null);
      } catch (err) {
        if (active) error(err.response?.data?.message || 'Failed to load job details.');
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

  const totalAmount = Number(job.price) || 0;
  const alreadyPaid = Number(job.paidAmount) || 0;
  const isAdvancePaid = alreadyPaid > 0 && alreadyPaid < totalAmount;

  const payableAmount = isAdvancePaid
    ? Math.max(totalAmount - alreadyPaid, 0)
    : Math.round((totalAmount * percentage) / 100);

  const remainingBalance = isAdvancePaid ? 0 : Math.max(totalAmount - payableAmount, 0);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!trxId.trim()) {
      error('Transaction ID (TrxID) is required.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/payments/create', {
        jobId: job._id,
        amount: payableAmount,
        method: gateway,
        trxId: trxId.trim(),
        paymentStage: isAdvancePaid ? 'remaining' : `advance_${percentage}`,
      });

      success(
        isAdvancePaid
          ? 'Remaining balance paid and locked in Escrow.'
          : `${percentage}% Advance payment verified.`
      );
      navigate(`/payment/status/${data?.payment?._id || job._id}`, { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Payment verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/payment/${jobId}`}
          className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {isAdvancePaid ? 'Pay Remaining Job Balance' : 'Advance Payment Option'}
          </h1>
          <p className="text-xs text-gray-500">
            Flexible 30% or 50% advance escrow lock for {job.sqft} Sqft job
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Payment Schedule">
          <form onSubmit={handlePayment} className="space-y-4">
            {!isAdvancePaid && (
              <div>
                <label className="block text-sm font-medium mb-2">Select Advance Percentage</label>
                <div className="grid grid-cols-2 gap-3">
                  {[30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPercentage(pct)}
                      className={`py-3 rounded-xl border text-center font-bold text-sm transition ${
                        percentage === pct
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                          : 'border-gray-200 dark:border-slate-800'
                      }`}
                    >
                      {pct}% Advance
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Transaction ID (TrxID)</label>
              <input
                type="text"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                placeholder="e.g., 8K9L2M4N5P"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent font-mono uppercase"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || payableAmount <= 0}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <CreditCard size={16} />
              <span>
                {submitting
                  ? 'Verifying...'
                  : isAdvancePaid
                  ? `Pay Remaining ${formatTaka(payableAmount)}`
                  : `Pay ${percentage}% Advance (${formatTaka(payableAmount)})`}
              </span>
            </button>
          </form>
        </Card>

        <Card title="Installment Summary" action={<ShieldCheck size={18} className="text-emerald-600" />}>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Job Price</span>
              <span className="font-semibold">{formatTaka(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Already Paid</span>
              <span className="font-semibold text-emerald-600">{formatTaka(alreadyPaid)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100 dark:border-slate-800">
              <span>{isAdvancePaid ? 'Remaining Due Now' : `Advance Due (${percentage}%)`}</span>
              <span className="text-blue-600">{formatTaka(payableAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 pt-1">
              <span>Balance After This Payment</span>
              <span className="font-semibold">{formatTaka(remainingBalance)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
