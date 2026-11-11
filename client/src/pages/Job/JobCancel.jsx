import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CANCEL_REASONS = [
  { value: 'customer_changed_mind', label: 'Customer মন বদলেছে' },
  { value: 'mistri_not_available', label: 'Mistri পাওয়া যায়নি' },
  { value: 'wrong_address', label: 'ভুল Address / Sqft' },
  { value: 'price_issue', label: 'Price সমস্যা' },
  { value: 'weather', label: 'আবহাওয়া খারাপ' },
  { value: 'duplicate_job', label: 'Duplicate Job' },
  { value: 'other', label: 'অন্য কারণ' },
];

const JobCancel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [cancelHistory, setCancelHistory] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data?.job || data);
      const h = await api.get(`/jobs/${id}/cancel-history`);
      setCancelHistory(h.data?.history || h.data || []);
    } catch {
      toast.error('Job Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!job) return <div className="p-4 text-center">Job পাওয়া যায়নি</div>;

  const total = job.totalPrice || 0;
  const advancePaid = job.advancePaid || job.paidAmount || 0;

  // Refund Amount Show - Logic
  // Job Start হয়নি -> 100% Refund
  // Job Start হয়েছে -> Advance থেকে 20% কাটা, বাকি Refund
  // Completed Job Cancel হবে না
  const isStarted = ['ongoing', 'assigned'].includes(job.status);
  const deduction = isStarted ? advancePaid * 0.20 : 0;
  const refundAmount = Math.max(0, advancePaid - deduction);
  const canCancel = !['completed', 'cancelled'].includes(job.status);

  const handleCancel = async () => {
    if (!reason) return toast.error('Cancel Reason Select করুন');
    if (reason === 'other' && !customReason.trim()) return toast.error('কারণ লিখুন');
    if (!window.confirm(`Job Cancel করবেন? Refund: ৳${refundAmount} Wallet এ যাবে`)) return;

    setSubmitting(true);
    try {
      await api.post(`/jobs/${id}/cancel`, {
        reason,
        customReason,
        refundAmount,
      });
      toast.success(`Job Cancelled - ৳${refundAmount} Wallet এ Refund হয়েছে`);
      navigate(`/jobs/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel Failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link to={`/jobs/${id}`} className="text-blue-600 text-sm">← Back to Job</Link>
      <h1 className="text-2xl font-bold mt-2">Job Cancel</h1>

      {/* Job Info */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <p className="font-bold">{job.title || job.address}</p>
        <p className="text-sm text-gray-500">{job.address} • {job.sqft} Sqft • Status: <b className="capitalize">{job.status}</b></p>
        <p className="text-sm mt-1">Total: <b>৳{total.toLocaleString()}</b> • Advance Paid: <b>৳{advancePaid.toLocaleString()}</b></p>
      </div>

      {!canCancel ? (
        <div className="bg-red-50 rounded-xl p-4 mt-3 text-center text-red-600 font-bold">
          এই Job আর Cancel করা যাবে না - Status: {job.status}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-4 mt-3 space-y-4">
          {/* Cancel Reason Select */}
          <div>
            <label className="font-bold">Cancel Reason Select *</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border rounded-lg p-3 mt-1">
              <option value="">-- Reason Select করুন --</option>
              {CANCEL_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {reason === 'other' && (
              <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="কারণ লিখুন..." rows={2} className="w-full border rounded-lg p-3 mt-2" />
            )}
          </div>

          {/* Refund Amount Show */}
          <div className="bg-green-50 rounded-xl p-4 space-y-1 text-sm">
            <h3 className="font-bold">💰 Refund Amount Show</h3>
            <div className="flex justify-between"><span>Advance Paid</span><b>৳{advancePaid.toLocaleString()}</b></div>
            <div className="flex justify-between"><span>Deduction {isStarted ? '(20% - Job Start হয়েছিল)' : '(0% - Job Start হয়নি)'}</span><b>- ৳{deduction.toFixed(0)}</b></div>
            <div className="flex justify-between border-t pt-1"><span>Refund Amount</span><b className="text-green-700 text-lg">৳{refundAmount.toFixed(0)}</b></div>
            <p className="text-xs text-gray-500">Refund To Wallet - Wallet Balance এ যোগ হবে</p>
          </div>

          <button onClick={handleCancel} disabled={submitting} className="w-full bg-red-600 text-white py-3 rounded-lg font-bold disabled:opacity-50">
            {submitting ? 'Cancelling...' : `Cancel Job - Refund ৳${refundAmount.toFixed(0)} to Wallet`}
          </button>
        </div>
      )}

      {/* Cancel History Show */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <h3 className="font-bold mb-2">Cancel History ({cancelHistory.length})</h3>
        {cancelHistory.length === 0 && <p className="text-gray-400 text-sm text-center py-4">কোনো Cancel History নাই</p>}
        <div className="space-y-2">
          {cancelHistory.map((h, i) => (
            <div key={h._id || i} className="border rounded-lg p-3 text-sm">
              <div className="flex justify-between"><b>{h.reason || h.reasonLabel}</b><span className="text-gray-400">{new Date(h.createdAt).toLocaleDateString('bn-BD')}</span></div>
              <p className="text-gray-500">{h.customReason || ''}</p>
              <p>Refund: <b className="text-green-600">৳{h.refundAmount || 0}</b> • To Wallet • By: {h.cancelledBy?.name || h.cancelledBy || 'System'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobCancel;