import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ShieldAlert } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatDate } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

const DISPUTE_CATEGORIES = [
  'Incomplete wall preparation or poor finish quality',
  'Work stopped mid-job without valid notice',
  'Material quantity or brand mismatch',
  'Payment escrow release disagreement',
  'Property damage or safety compliance issue',
];

export default function DisputePage() {
  const { jobId } = useParams();
  const { success, error } = useToast();

  const [disputes, setDisputes] = useState([]);
  const [category, setCategory] = useState(DISPUTE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchDisputes = async () => {
    try {
      const { data } = await api.get('/disputes', { params: { jobId } });
      setDisputes(Array.isArray(data?.disputes) ? data.disputes : []);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load dispute records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleFileDispute = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      error('Please provide detailed evidence and explanation.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/disputes', {
        jobId,
        reason: `${category}: ${description.trim()}`,
      });
      success('Dispute filed. Escrow funds are frozen pending resolution.');
      setDescription('');
      fetchDisputes();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to file dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/jobs/${jobId}`}
          className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Dispute Center & Escrow Protection</h1>
          <p className="text-xs text-gray-500">
            Raise an official dispute to freeze escrow disbursement until resolution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="File a New Dispute" action={<AlertTriangle size={18} className="text-amber-500" />}>
          <form onSubmit={handleFileDispute} className="space-y-4">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>
                Filing a dispute places an immediate hold on escrow payouts until reviewed.
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dispute Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {DISPUTE_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Detailed Explanation</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened, dates, and exact Sqft or material discrepancy..."
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition"
            >
              {submitting ? 'Submitting Dispute...' : 'Submit Official Dispute'}
            </button>
          </form>
        </Card>

        <Card title="Dispute Resolution Status">
          {disputes.length === 0 ? (
            <p className="text-xs text-gray-500 py-10 text-center">
              No disputes filed for this job.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {disputes.map((disp) => (
                <div key={disp._id} className="py-3.5 space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-400">
                      #{disp._id.slice(-6).toUpperCase()}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        disp.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {disp.status || 'Open'}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{disp.reason}</p>
                  {disp.resolution && (
                    <p className="text-xs text-emerald-600 font-medium">
                      Resolution: {disp.resolution}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400">{formatDate(disp.createdAt, true)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
