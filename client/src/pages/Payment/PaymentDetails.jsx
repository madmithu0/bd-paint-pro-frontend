import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka, formatDate } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

export default function PaymentDetails() {
  const { id } = useParams();
  const { success, error } = useToast();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchPayment = async () => {
      try {
        const { data } = await api.get(`/payments/${id}`);
        if (active) setPayment(data?.payment || null);
      } catch (err) {
        if (active) error(err.response?.data?.message || 'Failed to load payment breakdown.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchPayment();
    return () => {
      active = false;
    };
  }, [id, error]);

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${payment.invoiceId || payment._id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${payment.trxId || payment._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      success('Payment receipt downloaded.');
    } catch (err) {
      error(err.response?.data?.message || 'Download failed.');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!payment) {
    return <Loading variant="empty" emptyTitle="Payment Record Not Found" />;
  }

  const amount = Number(payment.amount) || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/wallet"
            className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Payment Breakdown</h1>
            <p className="text-xs text-gray-500 font-mono">TrxID: {payment.trxId}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadInvoice}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
        >
          <Download size={15} />
          <span>Download Invoice</span>
        </button>
      </div>

      <Card>
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
          <div>
            <p className="text-xs text-gray-500">Total Paid Amount</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-0.5">{formatTaka(amount)}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 size={14} />
            <span>{payment.status}</span>
          </span>
        </div>

        <div className="py-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method</span>
            <span className="font-semibold">{payment.method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction ID</span>
            <span className="font-mono font-semibold">{payment.trxId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Timestamp</span>
            <span>{formatDate(payment.createdAt, true)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Mistri Share (80%)</span>
            <span className="font-semibold text-emerald-600">
              {formatTaka(payment.mistriShare ?? amount * 0.8)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Agent Share</span>
            <span className="font-semibold">{formatTaka(payment.agentShare ?? 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Platform Share</span>
            <span className="font-semibold">
              {formatTaka(payment.platformShare ?? amount * 0.2)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
