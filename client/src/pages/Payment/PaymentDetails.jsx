import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PaymentDetails = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/payments/${id}`);
      const pay = data?.payment || data;
      setPayment(pay);
      const jobId = pay.jobId?._id || pay.jobId || pay.job?._id;
      if (jobId) {
        const j = await api.get(`/jobs/${jobId}`);
        setJob(j.data?.job || j.data);
      }
    } catch {
      toast.error('Payment Details Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!payment) return <div className="p-4 text-center">Payment পাওয়া যায়নি</div>;

  const amount = payment.amount || 0;
  const method = (payment.method || 'bkash').toUpperCase();
  const sqft = job?.sqft || 0;
  const mistriPrice = job?.mistriPrice || 0;
  const materialCost = job?.materialCost || 0;
  const total = job?.totalPrice || mistriPrice + materialCost;
  const mistriCount = job?.mistriCount || Math.max(1, Math.ceil(sqft / 450));
  const perMistriShare = mistriCount ? (mistriPrice * 0.80) / mistriCount : 0;
  const isMistriOnly = job?.materialSource === 'customer' || payment.isMistriOnly;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link to="/payments" className="text-blue-600 text-sm">← Payment List</Link>

      {/* Receipt Header */}
      <div className="bg-white rounded-xl shadow p-5 mt-3 text-center">
        <p className="text-4xl">{payment.status === 'completed' ? '✅' : payment.status === 'refunded' ? '↩️' : '⏳'}</p>
        <h1 className="text-2xl font-bold mt-1">৳{amount.toLocaleString()}</h1>
        <p className="text-sm text-gray-500 capitalize">{payment.status} • {method}</p>
        <p className="text-xs text-gray-400">Invoice: {payment.invoiceNo || payment._id} • {new Date(payment.createdAt).toLocaleString('bn-BD')}</p>
      </div>

      {/* Transaction Info */}
      <div className="bg-white rounded-xl shadow p-4 mt-3 space-y-2 text-sm">
        <h3 className="font-bold">Transaction Info</h3>
        <div className="flex justify-between"><span>Trx ID</span><b>{payment.trxId}</b></div>
        <div className="flex justify-between"><span>Sender Number</span><b>{payment.senderNumber || 'N/A'}</b></div>
        <div className="flex justify-between"><span>Method</span><b>{method}</b></div>
        <div className="flex justify-between"><span>Job ID</span><b>{job?._id || payment.jobId?._id || payment.jobId}</b></div>
        <div className="flex justify-between"><span>Job Title</span><b>{job?.title || 'N/A'}</b></div>
        <div className="flex justify-between"><span>Customer</span><b>{job?.customerName || payment.customer?.name || 'N/A'}</b></div>
      </div>

      {/* Price Breakup + Mistri Only Invoice Show */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <h3 className="font-bold mb-2">🧾 Invoice Breakup</h3>
        {isMistriOnly && (
          <p className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold mb-2">✓ MISTRI ONLY INVOICE - Material Cost Zero - Customer Material দিয়েছে</p>
        )}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Sqft</span><b>{sqft} Sqft</b></div>
          <div className="flex justify-between"><span>Mistri Only Price</span><b>৳{mistriPrice.toLocaleString()}</b></div>
          <div className="flex justify-between"><span>Material Cost {isMistriOnly ? '(Zero)' : ''}</span><b>৳{materialCost.toLocaleString()}</b></div>
          <div className="flex justify-between border-t pt-1"><span>Total</span><b>৳{total.toLocaleString()}</b></div>
          <div className="flex justify-between"><span>Paid Amount</span><b className="text-green-600">৳{amount.toLocaleString()}</b></div>
        </div>
      </div>

      {/* Equal Split Receipt Show */}
      <div className="bg-yellow-50 rounded-xl p-4 mt-3">
        <h3 className="font-bold">Equal Split Receipt Show</h3>
        <div className="space-y-1 text-sm mt-2">
          <div className="flex justify-between"><span>Mistri Total Share (80%)</span><b>৳{(mistriPrice * 0.80).toFixed(0)}</b></div>
          <div className="flex justify-between"><span>Mistri Count</span><b>{mistriCount} জন</b></div>
          <div className="flex justify-between border-t pt-1"><span>Per Mistri Share (Equal)</span><b className="text-green-700">৳{perMistriShare.toFixed(0)} / জন</b></div>
          <div className="flex justify-between"><span>Platform Share</span><b>৳{(mistriPrice * 0.20).toFixed(0)}</b></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Receipt এ সবার Share Equal ভাবে দেখানো হবে</p>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={() => window.print()} className="flex-1 bg-gray-100 py-3 rounded-lg font-bold">Print Receipt</button>
        <Link to={`/jobs/${job?._id || payment.jobId}`} className="flex-1 text-center bg-blue-600 text-white py-3 rounded-lg font-bold">View Job</Link>
      </div>
    </div>
  );
};

export default PaymentDetails;