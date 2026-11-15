import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka, formatDate } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

const STATUS_META = {
  Success: {
    icon: CheckCircle2,
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    locationText: 'Locked in Live Escrow Vault (Awaiting Job End OTP)',
  },
  Pending: {
    icon: Clock,
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    locationText: 'Gateway Verification Queue (BullMQ Auto-Check Active)',
  },
  Failed: {
    icon: XCircle,
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    locationText: 'Rejected (Amount Mismatch or Invalid TrxID)',
  },
  Refunded: {
    icon: RotateCcw,
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    locationText: 'Returned to Customer Wallet / Gateway Source',
  },
};

export default function PaymentStatus() {
  const { id } = useParams();
  const { error } = useToast();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const { data } = await api.get(`/payments/${id}`);
      setPayment(data?.payment || null);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to retrieve payment status.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(false), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (!payment) {
    return (
      <Loading
        variant="empty"
        emptyTitle="Transaction Not Found"
        emptyDescription="No payment or escrow record matches this reference."
      />
    );
  }

  const statusKey = STATUS_META[payment.status] ? payment.status : 'Pending';
  const meta = STATUS_META[statusKey];
  const StatusIcon = meta.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/jobs"
            className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Live Payment & Escrow Tracker</h1>
            <p className="text-xs text-gray-500 font-mono">Ref: {payment.trxId || payment._id}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchStatus(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <Card>
        <div className="flex flex-col items-center text-center py-4 border-b border-gray-100 dark:border-slate-800">
          <StatusIcon size={44} className="text-blue-600 mb-2" />
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${meta.badge}`}>
            {statusKey}
          </span>
          <p className="text-3xl font-extrabold mt-3">{formatTaka(payment.amount)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Paid via <strong>{payment.method}</strong> • {formatDate(payment.createdAt, true)}
          </p>
        </div>

        <div className="py-4 space-y-3 text-sm">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Exact Fund Location</p>
              <p className="text-sm font-semibold mt-0.5">{meta.locationText}</p>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <span className="text-gray-500">Transaction ID</span>
            <span className="font-mono font-semibold">{payment.trxId || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Escrow Disbursement Status</span>
            <span className="font-semibold">
              {payment.escrowReleased ? 'Released to Wallets' : 'Held in Escrow'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <Link
            to={`/payment/details/${payment._id}`}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View Full Receipt & Share Split →
          </Link>
        </div>
      </Card>
    </div>
  );
}
