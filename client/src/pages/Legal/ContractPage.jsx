import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileSignature,
  CheckCircle2,
  ShieldCheck,
  Send,
} from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka, formatDate } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

export default function ContractPage() {
  const { jobId } = useParams();
  const { success, error } = useToast();

  const [contract, setContract] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [signing, setSigning] = useState(false);

  const fetchContract = async () => {
    try {
      const { data } = await api.get(`/jobs/${jobId}/contract`);
      setContract(data?.contract || null);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load digital contract.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleRequestSignOtp = async () => {
    setSendingOtp(true);
    try {
      await api.post(`/jobs/${jobId}/contract/send-otp`);
      setOtpSent(true);
      success('Digital signature OTP sent to your registered phone.');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send signature OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSignContract = async (e) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(otpCode.trim())) {
      error('Enter a valid numeric OTP.');
      return;
    }

    setSigning(true);
    try {
      await api.post(`/jobs/${jobId}/contract/sign`, { otp: otpCode.trim() });
      success('Contract digitally signed and locked.');
      setOtpCode('');
      fetchContract();
    } catch (err) {
      error(err.response?.data?.message || 'Contract signature verification failed.');
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}/contract/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract_${jobId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      success('Contract PDF downloaded.');
    } catch (err) {
      error(err.response?.data?.message || 'PDF download failed.');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!contract) {
    return (
      <Loading
        variant="empty"
        emptyTitle="Contract Not Generated"
        emptyDescription="Digital contract details are unavailable for this job."
      />
    );
  }

  const isSigned = Boolean(contract.isSigned || contract.signedAt);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/jobs/${jobId}`}
            className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Customer–Mistri Digital Contract</h1>
            <p className="text-xs text-gray-500 font-mono">Contract Ref: {contract._id || jobId}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold self-start"
        >
          <Download size={15} />
          <span>Download Contract PDF</span>
        </button>
      </div>

      <Card
        title="Legally Binding Service Agreement (v3.0.0 LOCK)"
        action={
          isSigned ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              <CheckCircle2 size={14} />
              <span>Digitally Signed</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              Awaiting OTP Signature
            </span>
          )
        }
      >
        <div className="space-y-4 text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs">
            <div>
              <span className="text-gray-500 block">Total Area</span>
              <span className="font-bold text-sm">{contract.sqft} Sqft</span>
            </div>
            <div>
              <span className="text-gray-500 block">Agreed Timeline</span>
              <span className="font-bold text-sm">{contract.totalDays} Days (450 Sqft/Day)</span>
            </div>
            <div>
              <span className="text-gray-500 block">Contract Value</span>
              <span className="font-bold text-sm text-blue-600">{formatTaka(contract.price)}</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">1. Scope & Execution</h3>
            <p className="text-xs">
              The assigned Mistri team agrees to complete {contract.sqft} Sqft of wall preparation and coating
              ({contract.isMistriOnly ? 'Mistri-Only Labour Mode' : 'Full Material Package'}) within{' '}
              {contract.totalDays} standard working days.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">2. Escrow & Refund Policy</h3>
            <p className="text-xs">
              Funds are held in platform escrow until Customer verification of Job End OTP. Pre-start cancellations
              receive a 100% wallet refund; mid-job cancellations are settled proportionally based on verified Sqft completed.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">3. Workplace Safety & Liability</h3>
            <p className="text-xs">
              All assigned Mistris are NID-verified and must log daily GPS attendance. Both parties agree to adhere
              to Bangladesh labor safety guidelines and resolve disputes through platform escrow arbitration.
            </p>
          </div>
        </div>
      </Card>

      <Card title="OTP Digital Signature" action={<FileSignature size={18} className="text-blue-600" />}>
        {isSigned ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
            <ShieldCheck size={22} className="shrink-0" />
            <div>
              <p className="font-bold text-sm">Contract Verified & Digitally Signed</p>
              <p className="mt-0.5">
                Signed on {formatDate(contract.signedAt, true)} • Tamper-proof hash locked.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-md">
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Verify your identity via SMS OTP to legally sign this digital contract.
            </p>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleRequestSignOtp}
                disabled={sendingOtp}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
              >
                <Send size={14} />
                <span>{sendingOtp ? 'Sending OTP...' : 'Send Signature OTP'}</span>
              </button>
            ) : (
              <form onSubmit={handleSignContract} className="flex gap-2">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter OTP"
                  maxLength={6}
                  className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent font-mono tracking-widest"
                  required
                />
                <button
                  type="submit"
                  disabled={signing}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {signing ? 'Signing...' : 'Sign Contract'}
                </button>
              </form>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
