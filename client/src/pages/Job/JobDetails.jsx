import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  KeyRound,
  CreditCard,
  FileSignature,
  XCircle,
  AlertTriangle,
  Star,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka, formatDate } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

export default function JobDetails() {
  const { id } = useParams();
  const { role } = useAuth();
  const { error } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
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
  }, [id, error]);

  if (loading) {
    return <Loading />;
  }

  if (!job) {
    return (
      <Loading
        variant="empty"
        emptyTitle="Job Not Found"
        emptyDescription="The requested job record does not exist."
      />
    );
  }

  const totalAmount = Number(job.price) || 0;
  const dayShow = (Number(job.sqft || 0) / 450).toFixed(2);
  const mistriShare = totalAmount * 0.8;
  const agentShare = job.hasAgent ? totalAmount * 0.05 : 0;
  const platformShare = job.hasAgent ? totalAmount * 0.15 : totalAmount * 0.2;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/jobs"
            className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{job.sqft} Sqft Job</h1>
              {job.isMistriOnly && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  Mistri-Only
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Booked: {formatDate(job.createdAt, true)} • Status: <strong>{job.status}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/contract/${job._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <FileSignature size={15} />
            <span>Digital Contract</span>
          </Link>

          <Link
            to={`/jobs/${job._id}/otp`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold"
          >
            <KeyRound size={15} />
            <span>Start/End OTP</span>
          </Link>

          {role === 'Customer' && job.paymentStatus !== 'Paid' && job.status !== 'Cancelled' && (
            <Link
              to={`/payment/${job._id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <CreditCard size={15} />
              <span>Pay Escrow</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-500 uppercase font-semibold">Day Show (Sqft / 450)</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{dayShow} Days</p>
          <p className="text-xs text-gray-500 mt-0.5">Standard 450 Sqft/day</p>
        </Card>

        <Card>
          <p className="text-xs text-gray-500 uppercase font-semibold">Wall Condition</p>
          <p className="text-xl font-bold mt-1">{job.wallProblem || 'Normal'}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Damage Level: {job.wallDamageLevel || 'Standard'}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-gray-500 uppercase font-semibold">Material Source</p>
          <p className="text-xl font-bold mt-1">
            {job.isMistriOnly ? 'Customer Supplied' : job.materialSource || 'Platform'}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Price & Share Breakup">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Labour Cost</span>
              <span className="font-semibold">{formatTaka(job.labourCost ?? totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Material Cost</span>
              <span className="font-semibold">{formatTaka(job.materialCost ?? 0)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-slate-800">
              <span>Total Contract Value</span>
              <span className="text-blue-600">{formatTaka(totalAmount)}</span>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2 text-xs">
              <p className="font-semibold uppercase text-gray-400">Automated Escrow Share Split</p>
              <div className="flex justify-between">
                <span>Mistri Equal Share (80%)</span>
                <span className="font-bold text-emerald-600">{formatTaka(mistriShare)}</span>
              </div>
              {job.hasAgent ? (
                <>
                  <div className="flex justify-between">
                    <span>Agent Share (5%)</span>
                    <span className="font-semibold">{formatTaka(agentShare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (15%)</span>
                    <span className="font-semibold">{formatTaka(platformShare)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>Platform Fee (20% - No Agent)</span>
                  <span className="font-semibold">{formatTaka(platformShare)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card title="Wall Photo Gallery & Actions">
          {Array.isArray(job.photos) && job.photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {job.photos.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Wall inspection ${idx + 1}`}
                  className="w-full h-36 object-cover rounded-lg border border-gray-200 dark:border-slate-800"
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-6 text-center bg-gray-50 dark:bg-slate-800/50 rounded-lg mb-4">
              No wall photos uploaded for this job.
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {job.status === 'Completed' && role === 'Customer' && (
              <Link
                to={`/review/${job._id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
              >
                <Star size={14} />
                <span>Submit Review</span>
              </Link>
            )}

            {job.status !== 'Completed' && job.status !== 'Cancelled' && (
              <Link
                to={`/jobs/${job._id}/cancel`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold"
              >
                <XCircle size={14} />
                <span>Cancel Job</span>
              </Link>
            )}

            <Link
              to={`/dispute/${job._id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-semibold"
            >
              <AlertTriangle size={14} />
              <span>Report Dispute</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
