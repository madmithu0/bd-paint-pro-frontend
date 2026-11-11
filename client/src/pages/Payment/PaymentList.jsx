import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | completed | failed | refunded
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null); // Receipt Modal

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payments', { params: { status: filter === 'all' ? '' : filter } });
      setPayments(data?.payments || data || []);
    } catch {
      toast.error('Payment List Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, [filter]);

  // Payment Status Change - Admin / Manager
  const handleStatusChange = async (payId, status) => {
    try {
      await api.put(`/payments/${payId}/status`, { status });
      toast.success(`Payment ${status}`);
      fetchPayments();
    } catch {
      toast.error('Status Change Failed');
    }
  };

  const filtered = payments.filter((p) =>
    (p.trxId || p.invoiceNo || p.jobId?.title || p.job?.title || '').toLowerCase().includes(search.toLowerCase())
  );

  // Summary
  const totalPaid = filtered.filter((p) => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = filtered.filter((p) => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);
  const totalRefund = filtered.filter((p) => p.status === 'refunded').reduce((s, p) => s + (p.amount || 0), 0);

  const statusColor = (s) => {
    if (s === 'completed') return 'bg-green-100 text-green-700';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (s === 'failed') return 'bg-red-100 text-red-700';
    if (s === 'refunded') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-3">Payment List ({filtered.length})</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-green-50 rounded-xl p-3"><p className="font-bold text-green-700">৳{totalPaid.toLocaleString()}</p><p className="text-xs">Total Paid</p></div>
        <div className="bg-yellow-50 rounded-xl p-3"><p className="font-bold text-yellow-700">৳{totalPending.toLocaleString()}</p><p className="text-xs">Pending</p></div>
        <div className="bg-blue-50 rounded-xl p-3"><p className="font-bold text-blue-700">৳{totalRefund.toLocaleString()}</p><p className="text-xs">Refunded</p></div>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search - Trx ID / Invoice No..." className="w-full border rounded-lg p-3 mb-3" />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {['all', 'pending', 'completed', 'failed', 'refunded'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm capitalize whitespace-nowrap ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center text-gray-400 py-10">কোনো Payment নাই</p>}

      <div className="space-y-3">
        {filtered.map((p) => (
          <div key={p._id} className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">Invoice: {p.invoiceNo || p._id.slice(-8)}</p>
                <p className="text-sm text-gray-500">Job: {p.job?.title || p.jobId?.title || p.jobId || 'N/A'} • {p.method?.toUpperCase()} • Trx: {p.trxId}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs h-fit capitalize ${statusColor(p.status)}`}>{p.status}</span>
            </div>

            <div className="flex justify-between mt-2 text-sm">
              <span>Amount: <b className="text-lg">৳{(p.amount || 0).toLocaleString()}</b></span>
              <span className="text-gray-400">{new Date(p.createdAt).toLocaleDateString('bn-BD')}</span>
            </div>
            <p className="text-xs text-gray-500">Sender: {p.senderNumber || 'N/A'} • Mistri Only: {p.isMistriOnly ? 'Yes' : 'No'}</p>

            <div className="flex gap-2 mt-3">
              <button onClick={() => setSelected(p)} className="flex-1 bg-gray-100 py-2 rounded-lg text-sm">Receipt</button>
              <Link to={`/payments/${p._id}`} className="flex-1 text-center bg-blue-100 text-blue-700 py-2 rounded-lg text-sm">Details</Link>
              <select value={p.status} onChange={(e) => handleStatusChange(p._id, e.target.value)} className="flex-1 border rounded-lg text-sm p-2 bg-white">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Receipt Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm text-center">
            <h3 className="font-bold text-lg">🧾 Receipt</h3>
            <p className="text-sm text-gray-500">Invoice: {selected.invoiceNo || selected._id}</p>
            <div className="text-left text-sm space-y-1 mt-4 bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between"><span>Amount</span><b>৳{(selected.amount || 0).toLocaleString()}</b></div>
              <div className="flex justify-between"><span>Method</span><b>{selected.method}</b></div>
              <div className="flex justify-between"><span>Trx ID</span><b>{selected.trxId}</b></div>
              <div className="flex justify-between"><span>Status</span><b className="capitalize">{selected.status}</b></div>
              <div className="flex justify-between"><span>Date</span><b>{new Date(selected.createdAt).toLocaleDateString('bn-BD')}</b></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setSelected(null)} className="flex-1 bg-gray-100 py-2 rounded-lg">Close</button>
              <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentList;