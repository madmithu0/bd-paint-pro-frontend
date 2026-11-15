import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RotateCcw } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka, formatDate } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

const CANCELLATION_REASONS = [
  'Schedule conflict or delayed start',
  'Change in project scope or Sqft measurement',
  'Mistri unavailable at site location',
  'Customer requested cancellation before work start',
  'Other valid operational reason',
];

export default function JobCancel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [job, setJob] = useState(null);
  const [history, setHistory] = useState([]);
  const [reason, setReason] = useState(CANCELLATION_REASONS);
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchJobAndHistory = async () => {
      try {
        const [jobRes, histRes] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get('/jobs?status=Cancelled'),
        ]);
        if (!active) return;
        setJob(jobRes.data?.job || null);
        setHistory(Array.isArray(histRes.data?.jobs) ? histRes.data.jobs : []);
      } catch (err) {
        if (active) error(err.response?.data?.message || 'Failed to load job details.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchJobAndHistory();
    return () => {
      active = false;
    };
  }, [id, error]);

  if (loading) {
    return <Loading />;
  }

  if (!job) {
    return (
      <Loading
        variant="empty"
        emptyTitle="Job Not Found"
        emptyDescription="Unable to load job cancellation details."
      />
    );
  }

  const paidAmount = Number(job.paidAmount ?? (job.paymentStatus === 'Paid' ? job.price : 0)) || 0;
  const refundPreview = job.status === 'Pending' ? paidAmount : Math.round(paidAmount * 0.9);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (job.status === 'Completed' || job.status === 'Cancelled') {
      error('This job can no longer be cancelled.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/jobs/${id}/cancel`, {
        reason: customNote.trim() ? `${reason} - ${customNote.trim()}` : reason,
        refundToWallet: true,
      });
      success('Job cancelled and wallet refund processed.');
      navigate('/jobs', { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Job cancellation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/jobs/${id}`}
          className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Cancel Job & Wallet Refund</h1>
          <p className="text-xs text-gray-500">
            Job ID: {job._id} • Current Status: <strong>{job.status}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Cancellation Request">
          <form onSubmit={handleCancelSubmit} className="space-y-4">
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>
                Escrow funds are refunded directly to your platform Wallet upon cancellation approval.
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Select Cancellation Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {CANCELLATION_REASONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Additional Details (Optional)</label>
              <textarea
                rows={3}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Provide specific context for audit log..."
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent"
              />
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Escrow Paid</span>
                <span className="font-semibold">{formatTaka(paidAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-slate-700">
                <span>Estimated Wallet Refund</span>
                <span className="text-emerald-600">{formatTaka(refundPreview)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || job.status === 'Completed' || job.status === 'Cancelled'}
              className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold transition"
            >
              {submitting ? 'Processing Cancellation...' : 'Confirm Job Cancellation'}
            </button>
          </form>
        </Card>

        <Card title="Cancellation History" action={<RotateCcw size={17} className="text-gray-400" />}>
          {history.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center">No prior cancelled jobs found.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {history.map((item) => (
                <div key={item._id} className="py-3 text-xs space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{item.sqft} Sqft Job</span>
                    <span className="text-red-600">{formatTaka(item.price)}</span>
                  </div>
                  <p className="text-gray-500">{item.cancelReason || 'Cancelled by user'}</p>
                  <p className="text-[11px] text-gray-400">{formatDate(item.updatedAt, true)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
