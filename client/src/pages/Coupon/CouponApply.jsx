import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CouponApply = () => {
  const { id } = useParams(); // Job ID
  const [job, setJob] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobRes, couponRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get('/coupons/active'),
      ]);
      setJob(jobRes.data?.job || jobRes.data);
      setCoupons(couponRes.data?.coupons || couponRes.data || []);
    } catch {
      toast.error('Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!job) return <div className="p-4 text-center">Job পাওয়া যায়নি</div>;

  const total = job.totalPrice || 0;
  const discount = applied ? applied.discountAmount : 0;
  const finalAmount = Math.max(0, total - discount);

  // Coupon Verify + Apply
  const handleApply = async (couponCode) => {
    const finalCode = (couponCode || code).trim().toUpperCase();
    if (!finalCode) return toast.error('Coupon Code দিন');
    setVerifying(true);
    try {
      const { data } = await api.post('/coupons/verify', { code: finalCode, jobId: id, amount: total });
      setApplied({ ...data?.coupon, discountAmount: data?.discountAmount || data?.discount });
      setCode(finalCode);
      toast.success(`Coupon Applied! Discount: ৳${data?.discountAmount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid / Expired Coupon');
      setApplied(null);
    } finally { setVerifying(false); }
  };

  // Remove Coupon
  const handleRemove = async () => {
    try {
      await api.post(`/jobs/${id}/coupon/remove`);
      setApplied(null);
      setCode('');
      toast.success('Coupon Removed');
    } catch {
      setApplied(null);
      setCode('');
    }
  };

  // Save Applied Coupon to Job
  const handleSave = async () => {
    try {
      await api.post(`/jobs/${id}/coupon/apply`, { code, discountAmount: discount, finalAmount });
      toast.success(`Coupon Saved - Final: ৳${finalAmount.toLocaleString()}`);
    } catch {
      toast.error('Save Failed');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Link to={`/jobs/${id}`} className="text-blue-600 text-sm">← Back to Job</Link>
      <h1 className="text-2xl font-bold mt-2">Coupon Apply</h1>

      {/* Price Summary */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <p className="font-bold">{job.title || job.address} • {job.sqft} Sqft</p>
        <div className="space-y-1 text-sm mt-2">
          <div className="flex justify-between"><span>Total Price</span><b>৳{total.toLocaleString()}</b></div>
          <div className="flex justify-between"><span>Discount</span><b className="text-green-600">- ৳{discount.toLocaleString()}</b></div>
          <div className="flex justify-between border-t pt-1"><span>Final Amount</span><b className="text-lg text-blue-700">৳{finalAmount.toLocaleString()}</b></div>
        </div>
      </div>

      {/* Apply Input */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <label className="font-bold">Coupon Code</label>
        <div className="flex gap-2 mt-1">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="RONG50" className="flex-1 border rounded-lg p-3 uppercase" />
          <button onClick={() => handleApply()} disabled={verifying} className="bg-blue-600 text-white px-5 rounded-lg font-bold disabled:opacity-50">{verifying ? '...' : 'Apply'}</button>
        </div>

        {applied && (
          <div className="bg-green-50 rounded-lg p-3 mt-3 flex justify-between items-center">
            <div>
              <p className="font-bold text-green-700">✓ {applied.code} Applied</p>
              <p className="text-sm">Discount: ৳{discount} • Final: ৳{finalAmount.toLocaleString()}</p>
            </div>
            <button onClick={handleRemove} className="text-red-600 text-sm font-bold">Remove</button>
          </div>
        )}
      </div>

      {/* Available Coupons */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <h3 className="font-bold mb-2">Available Coupons ({coupons.length})</h3>
        {coupons.length === 0 && <p className="text-gray-400 text-sm text-center py-4">কোনো Available Coupon নাই</p>}
        <div className="space-y-2">
          {coupons.map((c) => (
            <div key={c._id} className="border-2 border-dashed border-blue-300 rounded-lg p-3 flex justify-between items-center">
              <div>
                <p className="font-bold tracking-wider">{c.code}</p>
                <p className="text-xs text-gray-500">{c.description || `${c.discountType === 'percent' ? `${c.discountValue}% OFF` : `৳${c.discountValue} OFF`} • Min ৳${c.minOrder || 0}`}</p>
              </div>
              <button onClick={() => handleApply(c.code)} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold">Apply</button>
            </div>
          ))}
        </div>
      </div>

      {applied && (
        <button onClick={handleSave} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold mt-4">
          Save & Continue - Final ৳{finalAmount.toLocaleString()}
        </button>
      )}
    </div>
  );
};

export default CouponApply;