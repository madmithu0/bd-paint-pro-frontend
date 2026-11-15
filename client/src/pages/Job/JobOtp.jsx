import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Play, CheckCircle2, Clock } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatDate } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

export default function JobOtp() {
  const { id } = useParams();
  const { role } = useAuth();
  const { success, error } = useToast();

  const [job, setJob] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchJob = async () => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data?.job || null);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load job OTP status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleGenerateOtp = async (type) => {
    setProcessing(true);
    try {
      const { data } = await api.post(`/jobs/${id}/otp/generate`, { type });
      setGeneratedOtp(data?.otp || '');
      success(`${type === 'start' ? 'Job Start' : 'Job End'} OTP generated.`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to generate OTP.');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyOtp = async (e, type) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(inputOtp.trim())) {
      error('Enter a valid numeric OTP.');
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/jobs/${id}/otp/verify`, {
        type,
        otp: inputOtp.trim(),
      });
      success(`${type === 'start' ? 'Job started' : 'Job completed & escrow released'}!`);
      setInputOtp('');
      fetchJob();
    } catch (err) {
      error(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!job) {
    return <Loading variant="empty" emptyTitle="Job Not Found" />;
  }

  const isStarted = Boolean(job.startedAt);
  const isEnded = Boolean(job.completedAt);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/jobs/${id}`}
          className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Job Start & End OTP Verification</h1>
          <p className="text-xs text-gray-500">
            Cryptographic timestamp logging for job start and escrow completion release
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
            <Clock size={14} />
            <span>Job Start Timestamp</span>
          </div>
          <p className="text-base font-bold mt-1.5">
            {job.startedAt ? formatDate(job.startedAt, true) : 'Not Started Yet'}
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
            <CheckCircle2 size={14} />
            <span>Job End Timestamp</span>
          </div>
          <p className="text-base font-bold mt-1.5">
            {job.completedAt ? formatDate(job.completedAt, true) : 'Not Completed Yet'}
          </p>
        </Card>
      </div>

      {role === 'Customer' ? (
        <Card title="Customer OTP Generator" action={<KeyRound size={18} className="text-blue-600" />}>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
            Generate a verification code and share it with the assigned Mistri at the work site.
          </p>

          <div className="flex flex-wrap gap-3">
            {!isStarted && (
              <button
                type="button"
                disabled={processing}
                onClick={() => handleGenerateOtp('start')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                <Play size={16} />
                <span>Generate Job Start OTP</span>
              </button>
            )}

            {isStarted && !isEnded && (
              <button
                type="button"
                disabled={processing}
                onClick={() => handleGenerateOtp('end')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>Generate Job End OTP</span>
              </button>
            )}
          </div>

          {generatedOtp && (
            <div className="mt-5 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-center">
              <span className="text-xs text-gray-500 block">Active Verification OTP</span>
              <span className="text-3xl font-mono font-extrabold tracking-widest text-blue-600 mt-1 block">
                {generatedOtp}
              </span>
            </div>
          )}
        </Card>
      ) : (
        <Card title="Mistri / Agent OTP Verification">
          {isEnded ? (
            <p className="text-sm font-semibold text-emerald-600 py-4 text-center">
              Job Start and End OTPs have been verified. Escrow payout released.
            </p>
          ) : (
            <form
              onSubmit={(e) => handleVerifyOtp(e, !isStarted ? 'start' : 'end')}
              className="space-y-4 max-w-sm"
            >
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {!isStarted
                  ? 'Enter the Job Start OTP provided by the Customer to begin work.'
                  : 'Enter the Job End OTP provided by the Customer to complete the job.'}
              </p>

              <input
                type="text"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter OTP"
                maxLength={6}
                className="w-full px-4 py-2.5 text-center text-lg font-mono tracking-widest rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent"
                required
              />

              <button
                type="submit"
                disabled={processing}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                {processing
                  ? 'Verifying...'
                  : !isStarted
                  ? 'Verify Start OTP'
                  : 'Verify End OTP & Complete Job'}
              </button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
