import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | active | expired | used
  const [search, setSearch] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons', { params: { status: filter === 'all' ? '' : filter } });
      setCoupons(data?.coupons || data || []);
    } catch {
      toast.error('Coupon Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, [filter]);

  // Toggle Active / Inactive
  const handleToggle = async (couponId, isActive) => {
    try {
      await api.put(`/coupons/${couponId}/toggle`, { isActive: !isActive });
      toast.success(isActive ? 'Coupon Deactivated' : 'Coupon Activated');
      fetchCoupons();
    } catch {
      toast.error('Toggle Failed');
    }
  };

  // Delete Coupon
  const handleDelete = async (couponId, code) => {
    if (!window.confirm(`Coupon ${code} Delete করবেন?`)) return;
    try {
      await api.delete(`/coupons/${couponId}`);
      toast.success('Coupon Deleted');
      fetchCoupons();
    } catch {
      toast.error('Delete Failed');
    }
  };

  const filtered = coupons.filter((c) =>
    (c.code || '').toLowerCase().includes(search.toLowerCase())
  );

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Coupon List ({filtered.length})</h1>
        <Link to="/coupons/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ New Coupon</Link>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Coupon Code..." className="w-full border rounded-lg p-3 mb-3" />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {['all', 'active', 'expired', 'used'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center text-gray-400 py-10">কোনো Coupon নাই</p>}

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((c) => {
          const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();
          const isActive = c.isActive && !isExpired;
          const usedPercent = c.maxUses ? Math.min(100, ((c.usedCount || 0) / c.maxUses) * 100) : 0;
          return (
            <div key={c._id} className={`bg-white rounded-xl shadow p-4 border-l-4 ${isActive ? 'border-green-500' : 'border-gray-300'}`}>
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-xl tracking-wider">{c.code}</p>
                  <p className="text-sm text-gray-500">{c.description || `${c.discountType === 'percent' ? `${c.discountValue}% OFF` : `৳${c.discountValue} OFF`}`}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs h-fit ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{isExpired ? 'Expired' : isActive ? 'Active' : 'Inactive'}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
                <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{c.discountType === 'percent' ? `${c.discountValue}%` : `৳${c.discountValue}`}</p><p className="text-xs">Discount</p></div>
                <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{c.usedCount || 0} / {c.maxUses || '∞'}</p><p className="text-xs">Used</p></div>
                <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{c.minOrder ? `৳${c.minOrder}` : '-'}</p><p className="text-xs">Min Order</p></div>
              </div>

              {/* Usage Progress */}
              {c.maxUses && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${usedPercent}%` }} /></div>
                  <p className="text-xs text-gray-400 mt-1">{usedPercent.toFixed(0)}% Used • Expiry: {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('bn-BD') : 'No Expiry'}</p>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <button onClick={() => copyCode(c.code)} className="flex-1 bg-gray-100 py-2 rounded-lg text-sm">Copy Code</button>
                <button onClick={() => handleToggle(c._id, c.isActive)} className={`flex-1 py-2 rounded-lg text-sm font-bold ${c.isActive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{c.isActive ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => handleDelete(c._id, c.code)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CouponList;