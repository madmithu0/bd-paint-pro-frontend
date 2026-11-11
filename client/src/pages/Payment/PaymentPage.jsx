import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const METHODS = [
  { value: 'bkash', label: 'bKash', color: 'bg-pink-600', icon: '💗' },
  { value: 'nagad', label: 'Nagad', color: 'bg-orange-500', icon: '🧡' },
  { value: 'rocket', label: 'Rocket', color: 'bg-purple-600', icon: '🚀' },
  { value: 'bank', label: 'Bank Transfer', color: 'bg-blue-600', icon: '🏦' },
];

const PaymentPage = () => {
  const { id } = useParams(); // Job ID
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState('bkash');
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [invoice, setInvoice] = useState(null);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data?.job || data);
    } catch {
      toast.error('Job Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchJob(); }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!job) return <div className="p-4 text-center">Job পাওয়া যায়নি</div>;

  const sqft = job.sqft || 0;
  const mistriPrice = job.mistriPrice || 0;
  const materialCost = job.materialCost || 0;
  const total = job.totalPrice || mistriPrice + materialCost;
  const advancePaid = job.advancePaid || 0;
  const due = Math.max(0, total - advancePaid);
  const mistriCount = job.mistriCount || Math.max(1, Math.ceil(sqft / 450));
  const perMistriShare = mistriCount ? (mistriPrice * 0.80) / mistriCount : 0;

  const handlePay = async () => {
    if (!trxId.trim()) return toast.error('Trx ID দিন');
    if (!senderNumber.trim()) return toast.error('Sender Number দিন');
    setPaying(true);
    try {
      const { data } = await api.post(`/payments`, {
        jobId: id, method, trxId, senderNumber, amount: due,
      });
      setInvoice(data?.invoice || data?.payment || null);
      toast.success('Payment Submitted - Invoice Created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment Failed');
    } finally { setPaying(false); }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link to={`/jobs/${id}`} className="text-blue-600 text-sm">← Back to Job</Link>
      <h1 className="text-2xl font-bold mt-2">Payment</h1>

      {/* Invoice Create - Preview */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <h3 className="font-bold">🧾 Invoice Preview</h3>
        <p className="text-sm text-gray-500">{job.title || job.address} • {sqft} Sqft</p>
        <div className="space-y-1 text-sm mt-3">
          <div className="flex justify-between"><span>Mistri Price</span><b>৳{mistriPrice.toLocaleString()}</b></div>
          <div className="flex justify-between"><span>Material Cost</span><b>৳{materialCost.toLocaleString()}</b></div>
          <div className="flex justify-between"><span>Advance Paid</span><b>- ৳{advancePaid.toLocaleString()}</b></div>
          <div className="flex justify-between border-t pt-1"><span>Due Amount</span><b className="text-lg text-blue-700">৳{due.toLocaleString()}</b></div>
        </div>

        {/* Mistri Only Invoice Show */}
        {job.materialSource === 'customer' && (
          <p className="mt-2 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">✓ MISTRI ONLY INVOICE - Material Cost Zero</p>
        )}

        {/* Equal Split Receipt Show */}
        <div className="bg-yellow-50 rounded-lg p-3 mt-3 text-sm">
          <p className="font-bold">Equal Split Receipt Show</p>
          <p>Mistri 80%: ৳{(mistriPrice * 0.80).toFixed(0)} ÷ {mistriCount} জন = <b>৳{perMistriShare.toFixed(0)} / জন</b></p>
        </div>
      </div>

      {!invoice ? (
        <div className="bg-white rounded-xl shadow p-4 mt-3 space-y-4">
          <div>
            <label className="font-bold">Payment Method - Bkash Nagad Rocket Bank Pay</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {METHODS.map((m) => (
                <button key={m.value} type="button" onClick={() => setMethod(m.value)} className={`py-3 rounded-lg font-bold text-white ${m.color} ${method === m.value ? 'ring-2 ring-black ring-offset-2' : 'opacity-70'}`}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold">Send Money Number</label>
            <p className="text-sm bg-pink-50 p-2 rounded mt-1">Send to: <b>01XXX-XXXXXX</b> ({method}) - তারপর Trx ID দিন</p>
          </div>

          <input value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} placeholder="Sender Number - 01XXXXXXXXX" className="w-full border rounded-lg p-3" />
          <input value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="Trx ID - Ex: 9KX7..." className="w-full border rounded-lg p-3" />

          <button onClick={handlePay} disabled={paying} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold disabled:opacity-50">
            {paying ? 'Processing...' : `Pay ৳${due.toLocaleString()} - ${method.toUpperCase()}`}
          </button>
        </div>
      ) : (
        /* Receipt Show */
        <div className="bg-white rounded-xl shadow p-5 mt-3 text-center">
          <p className="text-4xl">✅</p>
          <h3 className="font-bold text-lg mt-2">Payment Successful!</h3>
          <p className="text-sm text-gray-500">Invoice No: {invoice.invoiceNo || invoice._id}</p>
          <p className="text-sm">Trx: {trxId} • Method: {method}</p>
          <p className="font-bold text-2xl mt-2">৳{due.toLocaleString()}</p>
          <div className="bg-gray-50 rounded-lg p-3 mt-3 text-left text-sm">
            <p>Per Mistri Share: ৳{perMistriShare.toFixed(0)} x {mistriCount} জন</p>
            <p>Mistri Only: {job.materialSource === 'customer' ? 'Yes' : 'No'}</p>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => window.print()} className="flex-1 bg-gray-100 py-2 rounded-lg">Print Receipt</button>
            <button onClick={() => navigate(`/payments/${invoice._id || invoice.invoiceNo}`)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">View Details</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;